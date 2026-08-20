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
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function run() {
  console.log('Iniciando captura de partidas de CS2 (PandaScore)...');

  try {
    // ORDEM CRÍTICA: 'past' PRIMEIRO, depois 'running', depois 'upcoming'.
    //
    // A deduplicação guarda a PRIMEIRA ocorrência de cada match_id.
    // Quando uma partida acaba, ela aparece nos dois endpoints ao mesmo tempo:
    //   - /past   → status = 'finished' ✅ (correto)
    //   - /running → status = 'running'  ❌ (cache da API, atrasado)
    //
    // Ao colocar /past primeiro, garantimos que a versão 'finished' vence a
    // versão 'running' desatualizada da cache da PandaScore.
    const endpoints = [
      'https://api.pandascore.co/cs2/matches/past?sort=-begin_at&per_page=100',
      'https://api.pandascore.co/cs2/matches/past?sort=-begin_at&per_page=100&page=2',
      'https://api.pandascore.co/cs2/matches/running?per_page=100',
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
      }
    }

    // Remove duplicados — guarda a PRIMEIRA ocorrência.
    // Como /past vem primeiro, partidas finalizadas têm prioridade sobre
    // entradas desatualizadas do /running.
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

    // Janelas de tempo
    const deleteCutoff = new Date();
    deleteCutoff.setHours(deleteCutoff.getHours() - 72); // mantém 72h de histórico

    const insertCutoff = new Date();
    insertCutoff.setHours(insertCutoff.getHours() - 48); // não reinsere jogos muito antigos

    // LIMPEZA DE FANTASMAS: apaga partidas "presas" como 'running' há mais de 4h.
    // Isso acontece quando a API da PandaScore tem delay para mover uma partida
    // de /running para /past, e a partida fica travada no banco com status errado.
    const staleRunningCutoff = new Date();
    staleRunningCutoff.setHours(staleRunningCutoff.getHours() - 4);
    const { error: staleErr } = await supabase
      .from('pro_matches')
      .delete()
      .eq('status', 'running')
      .lt('match_time', staleRunningCutoff.toISOString());
    if (staleErr) {
      console.warn('⚠️ Erro ao limpar partidas fantasma:', staleErr.message);
    } else {
      console.log('  ✓ Partidas "running" antigas removidas do banco (serão reinseridas com status correto)');
    }

    const inserts = [];

    for (const match of matches) {
      // begin_at pode ser null em partidas 'upcoming' — usa scheduled_at como fallback
      const matchTime = match.begin_at || match.scheduled_at;
      if (!matchTime) continue;

      // Pula jogos mais velhos que 48h
      if (new Date(matchTime) < insertCutoff) continue;

      // Precisa ter os dois times definidos
      if (!match.opponents || match.opponents.length < 2) continue;
      if (!match.opponents[0]?.opponent || !match.opponents[1]?.opponent) continue;

      const team1 = match.opponents[0].opponent;
      const team2 = match.opponents[1].opponent;

      // URL de stream (prefere PT-BR)
      let streamUrl = null;
      if (match.official_twitch_url) {
        streamUrl = match.official_twitch_url;
      } else if (match.streams_list && match.streams_list.length > 0) {
        const ptStream = match.streams_list.find(s => s.language === 'pt');
        streamUrl = ptStream ? ptStream.raw_url : match.streams_list[0].raw_url;
      }

      // Placar:
      //  - Partidas finalizadas: match.results tem o placar oficial
      //  - Partidas ao vivo:     match.games tem os maps individuais (conta wins)
      let team1Score = 0;
      let team2Score = 0;

      if (match.results && match.results.length > 0) {
        // Partida finalizada — resultados oficiais
        const r1 = match.results.find(r => r.team_id === team1.id);
        const r2 = match.results.find(r => r.team_id === team2.id);
        if (r1) team1Score = r1.score;
        if (r2) team2Score = r2.score;
      } else if (match.games && match.games.length > 0) {
        // Partida ao vivo — conta maps ganhos até agora
        for (const game of match.games) {
          if (game.status === 'finished' && game.winner) {
            if (game.winner.id === team1.id) team1Score++;
            else if (game.winner.id === team2.id) team2Score++;
          }
        }
      }

      // Status final: se todos os games terminaram, a partida está finalizada
      // mesmo que o endpoint /running ainda não tenha atualizado
      let finalStatus = match.status;
      if (finalStatus === 'running' && match.games && match.games.length > 0) {
        const allDone = match.games.every(g => g.status === 'finished' || g.status === 'canceled');
        if (allDone) {
          finalStatus = 'finished';
          console.log(`  ⚡ Partida ${match.id} marcada como 'finished' (todos os maps concluídos)`);
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
        status: finalStatus,
        stream_url: streamUrl
      });
    }

    if (inserts.length > 0) {
      // Apaga partidas com mais de 72h
      const { error: deleteError } = await supabase
        .from('pro_matches')
        .delete()
        .lt('match_time', deleteCutoff.toISOString());
      if (deleteError) console.warn('⚠️ Erro no delete de histórico antigo:', deleteError.message);

      // Upsert: atualiza registro existente se match_id já existe
      const { error } = await supabase
        .from('pro_matches')
        .upsert(inserts, { onConflict: 'match_id', ignoreDuplicates: false });

      if (error) throw new Error(`Erro ao salvar no Supabase: ${error.message}`);
      console.log(`[OK] ${inserts.length} partidas salvas/atualizadas.`);
    } else {
      console.log('[OK] Nenhuma partida estruturada encontrada no momento.');
    }

    process.exit(0);
  } catch (e) {
    console.error('[FALHA] Erro na rotina de partidas:', e.message);
    process.exit(1);
  }
}

run();
