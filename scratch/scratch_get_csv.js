const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://pdyqoajbdyjiktnkxqqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_0c5ydPhGf8lGIXTjrGiidQ_Jrp1WW_O';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function exportCSV() {
  try {
    const { data: evaluations } = await supabase.from('evaluations').select('*');
    const { data: players } = await supabase.from('players').select('*');
    const { data: profiles } = await supabase.from('profiles').select('*');

    function getEvaluatorName(authId) {
      if (!authId) return 'Desconhecido';
      const prof = profiles && profiles.find(p => p.id === authId);
      if (prof && prof.full_name) return prof.full_name;
      const play = players.find(p => p.owner_id === authId);
      if (play && play.name) return play.name;
      return 'Desconhecido';
    }

    function getPlayerNameByUUID(playerUUID) {
      if (!playerUUID) return 'Desconhecido';
      const play = players.find(p => p.id === playerUUID);
      if (play) return play.name + (play.apelido ? ` "${play.apelido}"` : '');
      return 'Desconhecido';
    }

    const headers = [
      'Avaliador', 'Jogador Avaliado',
      'AIM', 'Reflexo', 'Game Sense', 'Clutch', 'Teamplay', 'Comms', 'Controle do Tilt', 'Impacto',
      'CT', 'TR',
      'Rifles', 'Precisão', 'SMGs', 'Pistolas', 'Utilitárias',
      'Mirage', 'Inferno', 'Dust II', 'Nuke', 'Ancient', 'Cache', 'Overpass', 'Anubis',
      'Data'
    ];

    const rows = [headers];

    evaluations.forEach(e => {
      const row = [
        getEvaluatorName(e.evaluator_id),
        getPlayerNameByUUID(e.player_id),
        e.aim || 0,
        e.reflexo || 0,
        e.sense || 0,
        e.clutch || 0,
        e.teamplay || 0,
        e.comms || 0,
        e.tilt || 0,
        e.impacto || 0,
        e.ct || 0,
        e.tr || 0,
        e.rifles || 0,
        e.precisao || 0,
        e.smgs || 0,
        e.pistolas || 0,
        e.utilitarias || 0,
        e.mirage || 0,
        e.inferno || 0,
        e.dust2 || 0,
        e.nuke || 0,
        e.ancient || 0,
        e.cache || 0,
        e.overpass || 0,
        e.anubis || 0,
        e.created_at ? new Date(e.created_at).toLocaleString('pt-BR') : ''
      ];
      rows.push(row);
    });

    const csvContent = rows.map(r => r.map(val => {
      if (typeof val === 'string') {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(';')).join('\n');

    console.log('---START_CSV---');
    console.log(csvContent);
    console.log('---END_CSV---');
  } catch (err) {
    console.error(err);
  }
}

exportCSV();
