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
    const res = await fetch('https://api.pandascore.co/csgo/matches/upcoming?sort=begin_at&per_page=20', {
      headers: {
        'Authorization': `Bearer ${PANDASCORE_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Erro na PandaScore API: ${res.statusText}`);
    }

    const matches = await res.json();
    const inserts = [];

    for (const match of matches) {
      // Pula se não tiver os dois times definidos
      if (!match.opponents || match.opponents.length < 2) continue;

      const team1 = match.opponents[0].opponent;
      const team2 = match.opponents[1].opponent;

      // URL de Stream
      let streamUrl = null;
      if (match.official_twitch_url) streamUrl = match.official_twitch_url;
      else if (match.streams_list && match.streams_list.length > 0) {
        const ptStream = match.streams_list.find(s => s.language === 'pt');
        streamUrl = ptStream ? ptStream.raw_url : match.streams_list[0].raw_url;
      }

      inserts.push({
        match_id: match.id,
        name: match.name,
        tournament_name: match.league.name + (match.serie.name ? ` ${match.serie.name}` : ''),
        team1_name: team1.name,
        team1_logo: team1.image_url,
        team2_name: team2.name,
        team2_logo: team2.image_url,
        match_time: match.begin_at,
        status: match.status,
        stream_url: streamUrl
      });
    }

    if (inserts.length > 0) {
      // Deleta jogos antigos (passados há mais de 2 dias) para não inchar o banco desnecessariamente
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      await supabase.from('pro_matches').delete().lt('match_time', twoDaysAgo.toISOString());

      const { error } = await supabase
        .from('pro_matches')
        .upsert(inserts, { onConflict: 'match_id', ignoreDuplicates: false }); // ignoreDuplicates false para atualizar status

      if (error) {
        throw new Error(`Erro ao salvar no Supabase: ${error.message}`);
      }
      console.log(`[OK] Finalizado. ${inserts.length} partidas salvas/atualizadas.`);
    } else {
      console.log(`[OK] Nenhuma partida estruturada encontrada no momento.`);
    }
  } catch (e) {
    console.error(`[FALHA] Erro na rotina de partidas:`, e.message);
    process.exit(1);
  }
}

run();
