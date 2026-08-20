/**
 * SCRIPT DE DIAGNÓSTICO LOCAL — Feed de Partidas CS2
 * 
 * Roda localmente para testar:
 * 1. Se o PANDASCORE_TOKEN é válido
 * 2. Quantas partidas a API retorna
 * 3. Se os dados de placar estão corretos
 * 
 * USO:
 *   $env:PANDASCORE_TOKEN="seu_token_aqui"
 *   node scripts/debug_matches.js
 */

const PANDASCORE_TOKEN = process.env.PANDASCORE_TOKEN;

if (!PANDASCORE_TOKEN) {
  console.error('❌ PANDASCORE_TOKEN não definido!');
  console.error('   Execute: $env:PANDASCORE_TOKEN="seu_token_aqui"');
  process.exit(1);
}

async function fetchEndpoint(url) {
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${PANDASCORE_TOKEN}`,
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

async function run() {
  console.log('🔍 DIAGNÓSTICO DO FEED DE PARTIDAS CS2');
  console.log('='.repeat(50));

  // 1. Testar token
  console.log('\n📡 Testando token PandaScore...');
  try {
    const data = await fetchEndpoint('https://api.pandascore.co/cs2/matches?per_page=1');
    console.log('✅ Token válido! API respondendo corretamente.');
  } catch (e) {
    console.error('❌ ERRO: Token inválido ou problema de conexão:', e.message);
    process.exit(1);
  }

  // 2. Buscar partidas de cada endpoint
  const endpoints = [
    { name: 'FINALIZADAS (past pg1)',  url: 'https://api.pandascore.co/cs2/matches/past?sort=-begin_at&per_page=10' },
    { name: 'AO VIVO (running)',        url: 'https://api.pandascore.co/cs2/matches/running?per_page=10' },
    { name: 'AGENDADAS (upcoming)',     url: 'https://api.pandascore.co/cs2/matches/upcoming?sort=begin_at&per_page=10' },
  ];

  for (const ep of endpoints) {
    console.log(`\n📋 ${ep.name}`);
    console.log('-'.repeat(40));
    try {
      const matches = await fetchEndpoint(ep.url);
      if (!matches.length) {
        console.log('   (nenhuma partida neste momento)');
        continue;
      }
      for (const m of matches.slice(0, 5)) {
        const t1 = m.opponents?.[0]?.opponent?.name || 'TBD';
        const t2 = m.opponents?.[1]?.opponent?.name || 'TBD';
        const t1id = m.opponents?.[0]?.opponent?.id;
        const t2id = m.opponents?.[1]?.opponent?.id;
        
        // Placar via results
        let score = '—';
        if (m.results && m.results.length > 0) {
          const r1 = m.results.find(r => r.team_id === t1id);
          const r2 = m.results.find(r => r.team_id === t2id);
          score = `${r1?.score ?? 0}–${r2?.score ?? 0} (via results)`;
        } else if (m.games && m.games.length > 0) {
          let s1 = 0, s2 = 0;
          m.games.forEach(g => {
            if (g.status === 'finished' && g.winner) {
              if (g.winner.id === t1id) s1++;
              else if (g.winner.id === t2id) s2++;
            }
          });
          score = `${s1}–${s2} (via games [${m.games.length} maps, ${m.games.filter(g=>g.status==='finished').length} finalizados])`;
        }

        const time = new Date(m.begin_at || m.scheduled_at || '?').toLocaleString('pt-BR');
        console.log(`   [${m.status.toUpperCase()}] ${t1} vs ${t2}`);
        console.log(`   Placar: ${score}`);
        console.log(`   Horário: ${time}`);
        console.log(`   Torneio: ${m.league?.name || '?'}`);
        console.log(`   match_id: ${m.id}`);
        console.log('');
      }
    } catch (e) {
      console.error(`   ❌ Erro: ${e.message}`);
    }
  }

  console.log('='.repeat(50));
  console.log('✅ Diagnóstico concluído. Se os dados acima parecem corretos,');
  console.log('   configure o PANDASCORE_TOKEN no GitHub Secrets e rode o workflow.');
}

run().catch(e => {
  console.error('Erro fatal:', e);
  process.exit(1);
});
