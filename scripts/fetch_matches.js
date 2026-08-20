const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const PANDASCORE_TOKEN = process.env.PANDASCORE_TOKEN;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Faltam variáveis de ambiente do Supabase!');
  process.exit(1);
}

if (!PANDASCORE_TOKEN) {
  console.warn('⚠️ PANDASCORE_TOKEN não configurado. Pulando coleta de partidas.');
  process.exit(0); // Saída 0 para não quebrar o workflow do github
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function run() {
  console.log('Iniciando captura de partidas de CS2 (PandaScore)...');

  try {
    // BUG #1 CORRIGIDO: Endpoint /csgo/ substituído por /cs2/ (PandaScore migrou)
    // Prioriza 'running' e 'past' antes de 'upcoming' para desduplicação correta:
    // se um jogo aparece duplicado, a versão mais atualizada (ao vivo/finalizada) tem prioridade.
    const endpoints = [
      'https://api.pandascore.co/cs2/matches/running?per_page=100',
      'https://api.pandascore.co/cs2/matches/past?sort=-begin_at&per_page=100',
      'https://api.pandascore.co/cs2/matches/past?sort=-begin_at&per_page=100&page=2',
      'https://api.pandascore.co/cs2/matches/upcoming?sort=begin_at&per_page=100'
    ];
    
    let matches = [];
    for (const ep of endpoints) {
      const res = await fetch(ep, {
        headers: {
          'Authorization': `Bearer ${PANDASCORE_TOKEN}`,
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        matches = matches.concat(data);
        console.log(`  ✓ ${ep.split('/cs2/matches/')[1].split('?')[0]}: ${data.length} partidas`);
      } else {
        const errText = await res.text();
        console.warn(`⚠️ Aviso: Falha ao buscar ${ep}: ${res.status} ${res.statusText} - ${errText}`);
        continue;
      }
    }
    
    // Remove duplicados — prioriza a primeira ocorrência (running > past > upcoming)
    const uniqueMatches = [];
    const seen = new Set();
    for (const m of matches) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        uniqueMatches.push(m);
      }
    }
    matches = uniqueMatches;
    console.log(`  → Total único: ${matches.length} partidas`);

    // BUG #2 CORRIGIDO: Janelas separadas para delete e insert
    // Delete: mantém 72h de histórico para não perder jogos recentes
    const deleteCutoff = new Date();
    deleteCutoff.setHours(deleteCutoff.getHours() - 72);

    // Insert: pula jogos muito antigos (mais de 48h) para não recriar histórico limpo
    const insertCutoff = new Date();
    insertCutoff.setHours(insertCutoff.getHours() - 48);

    const inserts = [];

    for (const match of matches) {
      // BUG #4 + #5 CORRIGIDO: begin_at pode ser null em upcoming — usa scheduled_at como fallback
      const matchTime = match.begin_at || match.scheduled_at;
      if (!matchTime) {
        console.log(`  ⚠️ Partida ${match.id} sem horário definido — pulando`);
        continue;
      }

      // Pula jogos mais velhos que 48h para evitar reinserção de jogos já limpos
      if (new Date(matchTime) < insertCutoff) continue;

      // Pula se não tiver os dois times definidos
      if (!match.opponents || match.opponents.length < 2) continue;
      if (!match.opponents[0]?.opponent || !match.opponents[1]?.opponent) continue;

      const team1 = match.opponents[0].opponent;
      const team2 = match.opponents[1].opponent;

      // URL de Stream
      let streamUrl = null;
      if (match.official_twitch_url) streamUrl = match.official_twitch_url;
      else if (match.streams_list && match.streams_list.length > 0) {
        const ptStream = match.streams_list.find(s => s.language === 'pt');
        streamUrl = ptStream ? ptStream.raw_url : match.streams_list[0].raw_url;
      }

      // BUG #3 CORRIGIDO: Placar para partidas finalizadas vem de match.results;
      // partidas AO VIVO (running) têm o placar em match.games (contagem de maps ganhos).
      let team1Score = 0;
      let team2Score = 0;

      if (match.results && match.results.length > 0) {
        // Partida finalizada — results tem o placar oficial
        const r1 = match.results.find(r => r.team_id === team1.id);
        const r2 = match.results.find(r => r.team_id === team2.id);
        if (r1) team1Score = r1.score;
        if (r2) team2Score = r2.score;
      } else if (match.games && match.games.length > 0) {
        // Partida ao vivo — conta quantos maps (games) cada time ganhou até agora
        for (const game of match.games) {
          if (game.status === 'finished' && game.winner) {
            if (game.winner.id === team1.id) team1Score++;
            else if (game.winner.id === team2.id) team2Score++;
          }
        }
      }

      inserts.push({
        match_id: match.id,
        name: match.name,
        tournament_name: match.league?.name
          ? (match.league.name + (match.serie?.name ? ` ${match.serie.name}` : ''))
          : (match.tournament?.name || 'Torneio'),
        team1_name: team1.name,
        team1_logo: team1.image_url,
        team2_name: team2.name,
        team2_logo: team2.image_url,
        team1_score: team1Score,
        team2_score: team2Score,
        match_time: matchTime,
        status: match.status,
        stream_url: streamUrl
      });
    }

    if (inserts.length > 0) {
      // Deleta jogos com mais de 72h (janela expandida para evitar banco vazio)
      const { error: deleteError } = await supabase
        .from('pro_matches')
        .delete()
        .lt('match_time', deleteCutoff.toISOString());
      if (deleteError) console.warn('⚠️ Erro no delete:', deleteError.message);

      const { error } = await supabase
        .from('pro_matches')
        .upsert(inserts, { onConflict: 'match_id', ignoreDuplicates: false }); // ignoreDuplicates: false para atualizar status e placar

      if (error) {
        throw new Error(`Erro ao salvar no Supabase: ${error.message}`);
      }
      console.log(`[OK] Finalizado. ${inserts.length} partidas salvas/atualizadas.`);
    } else {
      console.log(`[OK] Nenhuma partida estruturada encontrada no momento.`);
    }
    
    // Força o encerramento do script (evita que o GitHub Actions fique travado)
    process.exit(0);
  } catch (e) {
    console.error(`[FALHA] Erro na rotina de partidas:`, e.message);
    process.exit(1);
  }
}

run();
