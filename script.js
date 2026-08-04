// =========================================
// CONSTANTS & SUPABASE
// =========================================
const SUPABASE_URL = 'https://pdyqoajbdyjiktnkxqqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_0c5ydPhGf8lGIXTjrGiidQ_Jrp1WW_O';
let supabase; // inicializado no DOMContentLoaded


const DEFAULT_PLAYERS = [
  { id: 'vitin', name: 'VITIN', apelido: 'Cafajeste Chucro', role: 'IGL', team: 'CS2', photo: null },
  { id: 'joao', name: 'JOÃO', apelido: 'GRNTT', role: 'AWPer', team: 'CS2', photo: null },
  { id: 'vini', name: 'VINI', apelido: 'MONGOLOY', role: 'Entry', team: 'CS2', photo: null },
  { id: 'gabriel', name: 'GABRIEL', apelido: 'CHAVES', role: 'Rifler', team: 'CS2', photo: null },
  { id: 'luiseira', name: 'LUISEIRA', apelido: 'Capitão Caverna', role: 'Support', team: 'CS2', photo: null },
  { id: 'lucas', name: 'LUCAS', apelido: 'BUIU', role: 'Lurker', team: 'CS2', photo: null },
];

const ATTRS = [
  { key: 'aim', icon: '🎯', short: 'AIM', full: 'AIM', desc: 'Capacidade de ganhar trocação' },
  { key: 'reflexo', icon: '⚡', short: 'REFLEXO', full: 'REFLEXO', desc: 'Velocidade de reação' },
  { key: 'sense', icon: '🧠', short: 'GAME SENSE', full: 'GAME SENSE', desc: 'Leitura de jogo' },
  { key: 'clutch', icon: '💣', short: 'CLUTCH', full: 'CLUTCH', desc: 'Capacidade de vencer rounds diff' },
  { key: 'teamplay', icon: '🤝', short: 'TEAMPLAY', full: 'TEAMPLAY', desc: 'Ajuda o time' },
  { key: 'comms', icon: '🎙️', short: 'COMMS', full: 'COMMS', desc: 'Qualidade das calls' },
  { key: 'tilt', icon: '😤', short: 'TILT', full: 'CONTROLE DO TILT', desc: 'Capacidade de manter a calma' },
  { key: 'impacto', icon: '⭐', short: 'IMPACTO', full: 'IMPACTO NO TIME', desc: 'Influência direta' },
];
const WEIGHTS = { aim: 0.22, sense: 0.18, reflexo: 0.15, clutch: 0.15, teamplay: 0.10, comms: 0.08, tilt: 0.06, impacto: 0.06 };
const CARD_ATTRS_LEFT = ['aim', 'reflexo', 'sense'];
const CARD_ATTRS_RIGHT = ['teamplay', 'clutch', 'comms'];
const MM_QUESTIONS = [
  { id: 'melhorMira', emoji: '🎯', q: 'Quem possui a melhor mira?' },
  { id: 'melhorSense', emoji: '🧠', q: 'Quem possui o melhor Game Sense?' },
  { id: 'reiClutch', emoji: '💣', q: 'Quem é o Rei do Clutch?' },
  { id: 'melhoresCalls', emoji: '🎙️', q: 'Quem faz as melhores calls?' },
  { id: 'melhorIGL', emoji: '👑', q: 'Quem é o melhor IGL?' },
  { id: 'melhorAWP', emoji: '🔭', q: 'Quem é o melhor AWPer?' },
  { id: 'melhorEntry', emoji: '🚪', q: 'Quem é o melhor Entry?' },
  { id: 'melhorSupport', emoji: '🛡️', q: 'Quem é o melhor Support?' },
  { id: 'maisCarrega', emoji: '💪', q: 'Quem mais carrega a equipe?' },
  { id: 'maisEvoluiu', emoji: '📈', q: 'Quem mais evoluiu?' },
  { id: 'maisTilta', emoji: '😡', q: 'Quem mais tilta? 😂' },
  { id: 'mvp', emoji: '🏆', q: 'Quem é o MVP da line?' },
  { id: 'maisCompleto', emoji: '🔫', q: 'Quem é o atirador mais completo?' },
  { id: 'reiEco', emoji: '💰', q: 'Quem é o rei do round eco?' },
  { id: 'naoSabeAndar', emoji: '🐴', q: 'Quem não sabe andar no shiu?' },
  { id: 'ninja', emoji: '🥷', q: 'Quem mais infiltra nas linhas inimigas?' },
  { id: 'acougeiro', emoji: '🔪', q: 'Quem é o Açougueiro do time?' },
  { id: 'legendaDefuse', emoji: '💾', q: 'Quem é a lenda defuse kit?' },
  { id: 'craqueDoPlant', emoji: '💥', q: 'Quem é o craque do plant?' },
];

let globalState = { players: [], evaluations: [], mataMataVotes: [], clips: [], comments: [] };
let currentUser = null; // Supabase user
let loggedInPlayerId = null; // Ex: 'vitin'

// Mapa auth.users.id -> player_key ('vitin', 'joao', ...), montado a partir da
// tabela `profiles`. É a ÚNICA fonte confiável para saber "de qual jogador é essa
// conta", já que auth.users.id e players.id são espaços de UUID diferentes.
let profilesMap = {};

// =========================================
// UTILS & MATH
// =========================================
function esc(s) { return s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') : ''; }
function calcOverall(attrs) { let t = 0; for (const [k, w] of Object.entries(WEIGHTS)) t += (attrs[k] || 0) * w; return Math.round(t); }
function getTier(ov) { return ov >= 90 ? 'fenomeno' : ov >= 80 ? 'excelente' : ov >= 70 ? 'muitobom' : ov >= 60 ? 'bom' : 'treino'; }
function getTierLabel(t) { return { fenomeno: 'Fenômeno', excelente: 'Excelente', muitobom: 'Muito Bom', bom: 'Bom', treino: 'Treino' }[t]; }
function avgAttrs(evals) {
  if (!evals.length) return null;
  const sum = {}; ATTRS.forEach(a => sum[a.key] = 0);
  evals.forEach(e => ATTRS.forEach(a => sum[a.key] += (e[a.key] || 0)));
  const avg = {}; ATTRS.forEach(a => avg[a.key] = Math.round(sum[a.key] / evals.length));
  return avg;
}
function initials(name) { return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??'; }

// Só permite http/https — evita XSS via esquemas como javascript: em links postados por usuários
function isSafeUrl(url) {
  try {
    const u = new URL(url, window.location.href);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
}

const AUTH_ERROR_MAP = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'User already registered': 'Este e-mail já está cadastrado.',
  'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
  'Unable to validate email address: invalid format': 'E-mail inválido.',
};
function translateAuthError(msg) { return AUTH_ERROR_MAP[msg] || msg; }
function toast(msg, type = 'inf') {
  const el = document.createElement('div'); el.className = `toast ${type}`;
  const ic = { ok: '✓', err: '✗', inf: '●' }; const cl = { ok: '#43A047', err: '#E53935', inf: 'var(--accent)' };
  el.innerHTML = `<span style="color:${cl[type]};font-weight:700">${ic[type]}</span> ${msg}`;
  document.getElementById('toast-box').appendChild(el);
  setTimeout(() => { el.style.animation = 'slideRout 0.3s forwards'; setTimeout(() => el.remove(), 300); }, 3500);
}

// =========================================
// LOGIN SCREEN UX
// =========================================

// Gera partículas animadas no fundo
function initParticles() {
  const container = document.getElementById('login-particles');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      bottom:${Math.random() * 20}%;
      --dur:${5 + Math.random() * 8}s;
      --delay:${Math.random() * 6}s;
      opacity:0;
    `;
    container.appendChild(p);
  }
}


// Toggle visibilidade da senha
function togglePw(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else { inp.type = 'password'; btn.textContent = '👁'; }
}

// Força da senha
function checkPwStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
function updatePwStrength(pw) {
  const fill = document.getElementById('pw-strength-fill');
  const label = document.getElementById('pw-strength-label');
  if (!fill || !label) return;
  if (!pw) { fill.style.width = '0%'; label.textContent = ''; return; }
  const s = checkPwStrength(pw);
  const map = [
    { pct: '20%', bg: '#E53935', txt: 'Muito fraca' },
    { pct: '40%', bg: '#FF7043', txt: 'Fraca' },
    { pct: '60%', bg: '#FFB800', txt: 'Razoável' },
    { pct: '80%', bg: '#66BB6A', txt: 'Boa' },
    { pct: '100%', bg: '#43A047', txt: 'Forte 💪' },
  ];
  const m = map[Math.min(s - 1, 4)] || map[0];
  fill.style.width = m.pct; fill.style.background = m.bg; label.textContent = m.txt; label.style.color = m.bg;
}

// =========================================
// MULTI-STEP REGISTER
// =========================================
let regData = { fullName: '', playerKey: '' };
let regCurrentStep = 1;

async function renderPlayerSelectGrid() {
  const grid = document.getElementById('player-select-grid');
  if (!grid) return;

  let takenKeys = [];
  try {
    const { data } = await supabase.from('profiles').select('player_key');
    takenKeys = (data || []).map(r => r.player_key);
  } catch (err) { console.error('Erro ao checar personagens ocupados', err); }

  grid.innerHTML = DEFAULT_PLAYERS.map(p => {
    const taken = takenKeys.includes(p.id);
    return `
    <div class="player-card-sel ${regData.playerKey === p.id ? 'selected' : ''} ${taken ? 'taken' : ''}"
         onclick="${taken ? '' : `selectPlayer('${p.id}')`}" id="pcard-${p.id}" title="${taken ? 'Já escolhido por outra pessoa' : ''}">
      <div class="player-card-check">✓</div>
      <div class="player-card-av">${p.photo ? `<img src="${esc(p.photo)}">` : initials(p.name)}</div>
      <div class="player-card-name">${esc(p.name)}</div>
      <div class="player-card-nick">${esc(p.apelido)}</div>
      ${taken ? `<div class="player-card-taken-lbl">Ocupado</div>` : ''}
    </div>`;
  }).join('');
}

function selectPlayer(id) {
  regData.playerKey = id;
  document.querySelectorAll('.player-card-sel').forEach(el => el.classList.remove('selected'));
  const card = document.getElementById('pcard-' + id);
  if (card) card.classList.add('selected');
}

function updateRegSteps(step) {
  regCurrentStep = step;
  [1, 2, 3].forEach(n => {
    const s = document.getElementById('rstep-' + n);
    const line = document.querySelectorAll('.reg-step-line')[n - 1];
    if (!s) return;
    s.classList.remove('active', 'done');
    if (n < step) s.classList.add('done');
    else if (n === step) s.classList.add('active');
    if (line) { line.classList.toggle('done', n < step); }
  });
}

function regGoStep(step) {
  document.querySelectorAll('.reg-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('reg-panel-' + step);
  if (panel) { panel.classList.add('active'); }
  updateRegSteps(step);

  // Se foi para step 3, atualiza preview do jogador selecionado
  if (step === 3) updatePlayerPreview();
}

function regNextStep(fromStep) {
  if (fromStep === 1) {
    const name = document.getElementById('reg-fullname').value.trim();
    if (!name) { shakeInput('reg-fullname'); return toast('Digite seu nome!', 'err'); }
    regData.fullName = name;
    regGoStep(2);
  } else if (fromStep === 2) {
    if (!regData.playerKey) { return toast('Selecione seu personagem!', 'err'); }
    regGoStep(3);
  }
}

function updatePlayerPreview() {
  const p = DEFAULT_PLAYERS.find(x => x.id === regData.playerKey);
  if (!p) return;
  const av = document.getElementById('preview-av');
  const nm = document.getElementById('preview-name');
  const nk = document.getElementById('preview-nick');
  if (av) av.textContent = initials(p.name);
  if (nm) nm.textContent = regData.fullName || p.name;
  if (nk) nk.textContent = `"${p.apelido}" • ${p.role}`;
}

function shakeInput(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.animation = 'none';
  requestAnimationFrame(() => {
    el.style.animation = 'shake 0.4s cubic-bezier(.36,.07,.19,.97)';
  });
}

// Inicializa listener da senha
function initPwListener() {
  const pw = document.getElementById('reg-password');
  if (pw) pw.addEventListener('input', () => updatePwStrength(pw.value));
}

// =========================================
// AUTH (SUPABASE)
// =========================================
function switchAuthTab(tab) {
  // Tab highlighting
  document.getElementById('tab-entrar').classList.toggle('active', tab === 'entrar');
  document.getElementById('tab-criar').classList.toggle('active', tab === 'criar');

  // Mostrar/esconder forms diretamente via style (evita problemas de CSS specificity)
  const fEntrar = document.getElementById('form-entrar');
  const fCriar = document.getElementById('form-criar');

  fEntrar.style.display = (tab === 'entrar') ? 'flex' : 'none';
  fEntrar.style.flexDirection = 'column';

  fCriar.style.display = (tab === 'criar') ? 'flex' : 'none';
  fCriar.style.flexDirection = 'column';

  if (tab === 'criar') {
    renderPlayerSelectGrid();
    regGoStep(1);
  }
}


async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value;
  const btn = document.getElementById('btn-login');

  if (!email) { shakeInput('login-email'); return toast('Digite seu e-mail!', 'err'); }
  if (!pass) { shakeInput('login-password'); return toast('Digite sua senha!', 'err'); }

  btn.disabled = true;
  btn.innerHTML = '<span class="btn-text">Entrando</span><span class="btn-arrow">⏳</span>';

  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });

  btn.disabled = false;
  btn.innerHTML = '<span class="btn-text">Entrar</span><span class="btn-arrow">→</span>';

  if (error) { toast('Erro: ' + translateAuthError(error.message), 'err'); return; }
  toast('Login efetuado! Bem-vindo de volta 🎮', 'ok');
}

async function handleForgotPassword() {
  const email = document.getElementById('login-email').value.trim();
  if (!email) { shakeInput('login-email'); return toast('Digite seu e-mail para recuperar a senha.', 'err'); }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname
  });
  if (error) { toast('Erro: ' + translateAuthError(error.message), 'err'); return; }
  toast('Enviamos um link de recuperação para o seu e-mail! 📧', 'ok');
}

async function handleRegister() {
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-password').value;
  const btn = document.getElementById('btn-register');

  if (!email) { shakeInput('reg-email'); return toast('Digite seu e-mail!', 'err'); }
  if (!pass || pass.length < 6) { shakeInput('reg-password'); return toast('Senha deve ter ao menos 6 caracteres!', 'err'); }
  if (!regData.playerKey) { regGoStep(2); return toast('Selecione seu personagem!', 'err'); }
  if (!regData.fullName) { regGoStep(1); return toast('Digite seu nome!', 'err'); }

  btn.disabled = true;
  btn.innerHTML = '<span class="btn-text">Criando conta</span><span class="btn-arrow">⏳</span>';

  // Checa se o personagem já foi escolhido por outra conta antes de criar o usuário
  const { data: taken } = await supabase.from('profiles').select('player_key').eq('player_key', regData.playerKey).maybeSingle();
  if (taken) {
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-text">Criar Conta</span><span class="btn-arrow">🚀</span>';
    regGoStep(2);
    return toast('Esse personagem já foi escolhido por outra pessoa. Selecione outro!', 'err');
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email, password: pass,
    options: { data: { player_key: regData.playerKey, full_name: regData.fullName } }
  });

  if (signUpError) {
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-text">Criar Conta</span><span class="btn-arrow">🚀</span>';
    toast('Erro ao criar conta: ' + translateAuthError(signUpError.message), 'err');
    return;
  }

  // Faz login imediatamente após criar a conta (sem precisar confirmar e-mail)
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password: pass });

  btn.disabled = false;
  btn.innerHTML = '<span class="btn-text">Criar Conta</span><span class="btn-arrow">🚀</span>';

  if (loginError) {
    // Conta criada mas email precisa ser confirmado
    toast('Conta criada! Verifique seu e-mail para confirmar e depois faça login. 📧', 'ok');
    switchAuthTab('entrar');
    return;
  }

  // Vincula a conta ao personagem escolhido na tabela profiles.
  // O UNIQUE em profiles.player_key protege contra corrida (duas pessoas
  // escolhendo o mesmo personagem ao mesmo tempo).
  const { error: profileError } = await supabase.from('profiles').insert({
    id: loginData.user.id, player_key: regData.playerKey, full_name: regData.fullName
  });
  if (profileError) {
    toast('Este personagem acabou de ser escolhido por outra pessoa. Fale com um admin.', 'err');
    await supabase.auth.signOut();
    return;
  }

  toast('Conta criada! Bem-vindo à line 🏆', 'ok');
}


async function logout() {
  await supabase.auth.signOut();
  currentUser = null; loggedInPlayerId = null;
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('main-header').style.display = 'none';
  document.getElementById('main-content').style.display = 'none';
}

// Inicialização e Listener de Auth
async function init() {
  const { data: { session } } = await supabase.auth.getSession();
  await handleAuthChange(session);

  supabase.auth.onAuthStateChange(async (_event, session) => {
    await handleAuthChange(session);
  });
}

async function handleAuthChange(session) {
  if (session) {
    currentUser = session.user;
    loggedInPlayerId = currentUser.user_metadata?.player_key;

    // Oculta login com fade
    const ls = document.getElementById('login-screen');
    ls.style.opacity = '0';
    ls.style.transition = 'opacity 0.5s';
    setTimeout(() => { ls.style.display = 'none'; }, 500);

    document.getElementById('main-header').style.display = 'flex';
    document.getElementById('main-content').style.display = 'block';

    toast('Sincronizando dados...', 'inf');
    await fetchAllData();
    updateHeader();
    nav('colecao');
  } else {
    currentUser = null; loggedInPlayerId = null;
    const ls = document.getElementById('login-screen');
    ls.style.display = 'flex';
    ls.style.opacity = '1';
    document.getElementById('main-header').style.display = 'none';
    document.getElementById('main-content').style.display = 'none';
  }
}

// =========================================
// DATA FETCHING (SUPABASE)
// =========================================
async function fetchAllData() {
  // Inicializar com jogadores padrão caso o banco esteja vazio
  globalState.players = [...DEFAULT_PLAYERS];

  // Garante que todos os jogadores padrão existem na tabela `players` (idempotente)
  await seedPlayers();

  try {
    const [playersRes, evalsRes, mmRes, clipsRes, commRes, profilesRes] = await Promise.all([
      supabase.from('players').select('*'),
      supabase.from('evaluations').select('*'),
      supabase.from('mata_mata_votes').select('*'),
      supabase.from('clips').select('*'),
      supabase.from('comments').select('*'),
      supabase.from('profiles').select('*')
    ]);

    // Monta o mapa auth_id -> player_key ANTES de processar as outras tabelas,
    // pois evaluations/mata_mata_votes/clips/comments dependem dele.
    profilesMap = {};
    if (profilesRes.data) {
      profilesRes.data.forEach(pr => { profilesMap[pr.id] = pr.player_key; });
    }

    if (playersRes.data && playersRes.data.length > 0) {
      // Merge players db with defaults
      globalState.players = playersRes.data.map(dbP => {
        const def = DEFAULT_PLAYERS.find(dp => dp.id === dbP.player_key) || {};
        return {
          id: dbP.player_key, // Mantemos o ID como player_key para compatibilidade
          db_id: dbP.id, // UUID real
          name: dbP.name || def.name,
          apelido: dbP.apelido || def.apelido,
          role: dbP.role || def.role,
          team: dbP.team || def.team,
          photo: dbP.photo
        };
      });
    }

    if (evalsRes.data) {
      globalState.evaluations = evalsRes.data.map(e => ({
        ...e,
        // evaluator_id é auth.users.id -> passa por profiles; player_id é players.id
        evaluatorId: getPlayerKeyByAuthId(e.evaluator_id),
        playerId: getPlayerKeyByPlayersId(e.player_id),
      }));
    }

    if (mmRes.data) {
      globalState.mataMataVotes = mmRes.data.map(m => ({
        ...m, evaluatorId: getPlayerKeyByAuthId(m.evaluator_id)
      }));
    }

    if (clipsRes.data) {
      globalState.clips = clipsRes.data.map(c => ({
        // clips.player_id é auth.users.id (quem postou), não players.id
        ...c, playerId: getPlayerKeyByAuthId(c.player_id), mediaType: c.media_type, mediaUrl: c.media_url
      }));
    }

    if (commRes.data) {
      globalState.comments = commRes.data.map(cm => ({
        ...cm, playerId: getPlayerKeyByAuthId(cm.player_id), clipId: cm.clip_id
      }));
    }
  } catch (err) {
    console.error("Erro ao puxar dados", err);
    toast("Aviso: usando placeholders, configure o Supabase.", "err");
  }
}

// player_id em `evaluations` e `player_id` em `players` referenciam a tabela
// `players` (players.id / "db_id"). Use esta função para traduzir esse tipo de UUID.
function getPlayerKeyByPlayersId(uuid) {
  const p = globalState.players.find(x => x.db_id === uuid);
  return p ? p.id : null;
}

// evaluator_id em `evaluations`/`mata_mata_votes` e player_id em `clips`/`comments`
// na verdade guardam o UUID de auth.users (quem está logado), não players.id.
// Para traduzir esse UUID em player_key, é preciso passar por `profiles`.
function getPlayerKeyByAuthId(uuid) {
  return profilesMap[uuid] || null;
}

// Retorna o objeto jogador completo a partir de um auth.users.id (usado em clips/comments)
function getPlayerByAuthId(uuid) {
  const key = profilesMap[uuid];
  return key ? globalState.players.find(p => p.id === key) : null;
}

function getPlayerUUIDByKey(key) {
  const p = globalState.players.find(x => x.id === key);
  return p ? p.db_id : null;
}

// Garante que todo jogador de DEFAULT_PLAYERS exista na tabela `players` desde o
// início, com um db_id válido — antes disso, avaliações sobre jogadores que ainda
// não tinham foto enviada eram descartadas silenciosamente em submitEvaluation().
async function seedPlayers() {
  try {
    const rows = DEFAULT_PLAYERS.map(p => ({
      player_key: p.id, name: p.name, apelido: p.apelido, role: p.role, team: p.team
    }));
    await supabase.from('players').upsert(rows, { onConflict: 'player_key' });
  } catch (err) {
    console.error('Erro ao popular players', err);
  }
}

function updateHeader() {
  const p = globalState.players.find(x => x.id === loggedInPlayerId);
  if (!p) return;
  document.getElementById('header-avatar').innerHTML = p.photo ? `<img src="${esc(p.photo)}">` : initials(p.name);
  document.getElementById('header-name').textContent = p.name;
}

// =========================================
// NAVIGATION & MODALS
// =========================================
function nav(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('section-' + id).classList.add('active');
  const nb = document.getElementById('nav-' + id);
  if (nb) nb.classList.add('active');

  if (id === 'colecao') renderCollection();
  if (id === 'clips') renderClips();
  if (id === 'avaliar') startEvalWizard();
  if (id === 'matamata') renderMMResults();
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.overlay').forEach(el => el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); }));

// =========================================
// CARD BUILDER & COLLECTION
// =========================================
function buildCard(player, attrs, overall, tier, size = 'big') {
  const tc = 'card-' + tier;
  const photoBg = player.photo ? `style="background-image:url('${esc(player.photo)}')"` : '';
  const placeholder = player.photo ? '' : `<div class="card-photo-placeholder"><div class="card-photo-initials">${initials(player.name)}</div><svg class="card-photo-crosshair" width="160" height="160" viewBox="0 0 160 160" fill="none"><circle cx="80" cy="80" r="60" stroke="white" stroke-width="1.5"/><circle cx="80" cy="80" r="8" stroke="white" stroke-width="1.5"/><line x1="80" y1="20" x2="80" y2="55" stroke="white" stroke-width="1.5"/><line x1="80" y1="105" x2="80" y2="140" stroke="white" stroke-width="1.5"/><line x1="20" y1="80" x2="55" y2="80" stroke="white" stroke-width="1.5"/><line x1="105" y1="80" x2="140" y2="80" stroke="white" stroke-width="1.5"/></svg></div>`;
  const left = CARD_ATTRS_LEFT.map(k => { const a = ATTRS.find(x => x.key === k); return `<div class="card-stat"><span class="card-stat-icon">${a.icon}</span><span class="card-statval">${attrs ? attrs[k] ?? '—' : '—'}</span><span class="card-statlbl">${a.short}</span></div>`; }).join('');
  const right = CARD_ATTRS_RIGHT.map(k => { const a = ATTRS.find(x => x.key === k); return `<div class="card-stat"><span class="card-stat-icon">${a.icon}</span><span class="card-statval">${attrs ? attrs[k] ?? '—' : '—'}</span><span class="card-statlbl">${a.short}</span></div>`; }).join('');

  return `<div class="fifa-card ${tc}"><div class="card-bg"></div>
    <div class="card-photo" ${photoBg}>${placeholder}</div>
    <div class="card-deco top"></div><div class="card-deco bot"></div>
    <div class="card-top-left"><div class="card-ovr">${overall !== null ? overall : '??'}</div><div class="card-pos">${esc(player.role)}</div><div class="card-team-sm">${esc(player.team)}</div></div>
    <div class="card-edition" style="color:inherit"><span class="card-crown">👑</span><span>LINE</span><span class="card-edition-sub">OFICIAL</span></div>
    <div class="card-frame"></div>
    <div class="card-name-area"><div class="card-nick">${esc(player.name)}</div><div class="card-apelido">"${esc(player.apelido)}"</div></div>
    <div class="card-stats-panel"><div class="card-stats-grid"><div class="card-stats-col">${left}</div><div class="card-divider-v"></div><div class="card-stats-col right">${right}</div></div><div class="card-ovr-badge">OVERALL ${overall !== null ? overall : '??'}</div></div>
  </div>`;
}

function renderCollection() {
  const sorted = globalState.players.map(p => {
    const avg = avgAttrs(globalState.evaluations.filter(e => e.playerId === p.id));
    return { p, avg, ov: avg ? calcOverall(avg) : -1 };
  }).sort((a, b) => b.ov - a.ov);

  document.getElementById('collection-container').innerHTML = `<div class="col-grid">` + sorted.map(({ p, avg, ov }) => {
    const tier = avg ? getTier(ov) : 'treino';
    let card = buildCard(p, avg, avg ? ov : null, tier, 'small');
    if (!avg) card = card.replace('</div>', '<div class="card-locked-layer"><svg width="22" height="22" viewBox="0 0 24 24" stroke="white" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span>Aguardando avaliações</span></div></div>');
    return `<div class="col-item" onclick="openDetailModal('${p.id}')">${card}</div>`;
  }).join('') + `</div>`;
}

function openDetailModal(playerId) {
  const player = globalState.players.find(p => p.id === playerId);
  if (!player) return;
  const evals = globalState.evaluations.filter(e => e.playerId === playerId);
  const avg = avgAttrs(evals);
  const overall = avg ? calcOverall(avg) : null;
  const tier = avg ? getTier(overall) : null;

  let tableRows = evals.map(ev => `<tr><td>${esc(globalState.players.find(p => p.id === ev.evaluatorId)?.name || ev.evaluatorId)}</td>${ATTRS.map(a => `<td class="vm">${ev[a.key] ?? '—'}</td>`).join('')}<td class="vm" style="font-size:15px">${calcOverall(ev)}</td></tr>`).join('');
  let avgRow = avg ? `<tr style="background:rgba(255,184,0,0.08)"><td style="font-weight:700;color:var(--accent)">MÉDIA</td>${ATTRS.map(a => `<td class="vm" style="color:var(--accent)">${avg[a.key]}</td>`).join('')}<td class="vm" style="color:var(--accent);font-size:15px">${overall}</td></tr>` : '';

  document.getElementById('detail-content').innerHTML = `
    <div class="detail-top">
      <div class="detail-meta">
        <div class="detail-name">${esc(player.name)}</div>
        <div style="color:var(--accent);margin:4px 0 12px;font-family:'Rajdhani',sans-serif;font-weight:600">"${esc(player.apelido)}"</div>
        ${avg ? `<div><span style="font-family:'JetBrains Mono',monospace;font-size:50px;font-weight:700;color:var(--accent);line-height:1">${overall}</span><span style="font-family:'Rajdhani',sans-serif;font-weight:700;color:var(--text-sec);margin-left:8px">${getTierLabel(tier)}</span></div>` : ''}
        <div style="margin-top:14px;display:flex;gap:10px">
          <!-- O botão de trocar foto usa o cropper 3:4 -->
          <input type="file" id="file-photo-${playerId}" accept="image/*" class="hidden-file" onchange="initCrop(event, '${playerId}', 3/4)" />
          <label for="file-photo-${playerId}" class="btn btn-dark btn-sm" style="margin:0;cursor:pointer">📸 Trocar foto</label>
        </div>
      </div>
    </div>
    ${evals.length ? `<div style="overflow-x:auto"><table class="stats-tbl"><thead><tr><th>Avaliador</th>${ATTRS.map(a => `<th>${a.short}</th>`).join('')}<th>OVR</th></tr></thead><tbody>${tableRows}${avgRow}</tbody></table></div>` : '<div class="empty">Nenhuma avaliação.</div>'}
  `;
  openModal('detail-modal');
}

// =========================================
// CROPPER LOGIC
// =========================================
let cropTargetId = null; let cropRatio = 1; let cropImg = new Image();
let cScale = 1, cPanX = 0, cPanY = 0; let isDragging = false, startX = 0, startY = 0; let canvas, ctx;

function initCrop(event, targetId, ratio) {
  const file = event.target.files[0]; if (!file) return;
  cropTargetId = targetId; cropRatio = ratio;
  const reader = new FileReader();
  reader.onload = e => { cropImg.onload = () => { cScale = 1; cPanX = 0; cPanY = 0; openModal('cropper-modal'); setTimeout(setupCanvas, 100); }; cropImg.src = e.target.result; };
  reader.readAsDataURL(file); event.target.value = '';
}
function setupCanvas() {
  const wrap = document.getElementById('cropper-canvas-wrap'); canvas = document.getElementById('cropper-canvas'); ctx = canvas.getContext('2d');
  const W = wrap.clientWidth; const H = wrap.clientHeight; canvas.width = W; canvas.height = H;
  const guide = document.getElementById('cropper-guide');
  let gw = W * 0.7; let gh = gw / cropRatio; if (gh > H * 0.8) { gh = H * 0.8; gw = gh * cropRatio; }
  guide.style.width = gw + 'px'; guide.style.height = gh + 'px';
  cScale = gw / cropImg.width; cPanX = W / 2; cPanY = H / 2;
  drawCropper();
  wrap.onmousedown = e => { isDragging = true; startX = e.clientX - cPanX; startY = e.clientY - cPanY; };
  window.onmouseup = () => isDragging = false;
  window.onmousemove = e => { if (isDragging) { cPanX = e.clientX - startX; cPanY = e.clientY - startY; drawCropper(); } };
  wrap.onwheel = e => { e.preventDefault(); cScale *= Math.exp(e.deltaY * -0.002); drawCropper(); };
}
function drawCropper() {
  if (!ctx) return; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.save();
  ctx.translate(cPanX, cPanY); ctx.scale(cScale, cScale); ctx.drawImage(cropImg, -cropImg.width / 2, -cropImg.height / 2); ctx.restore();
}
async function confirmCrop() {
  const guide = document.getElementById('cropper-guide');
  const gw = parseFloat(guide.style.width); const gh = parseFloat(guide.style.height);
  const off = document.createElement('canvas'); off.width = 400; off.height = 400 / cropRatio;
  const octx = off.getContext('2d');
  const scaleRatio = off.width / gw;
  octx.scale(scaleRatio, scaleRatio);
  octx.translate(- (canvas.width / 2 - gw / 2), - (canvas.height / 2 - gh / 2));
  octx.translate(cPanX, cPanY); octx.scale(cScale, cScale); octx.drawImage(cropImg, -cropImg.width / 2, -cropImg.height / 2);
  const b64 = off.toDataURL('image/jpeg', 0.85);
  closeModal('cropper-modal');

  if (cropTargetId === 'NEW_CLIP') {
    document.getElementById('clip-image-preview').style.display = 'block';
    document.getElementById('clip-image-preview').querySelector('img').src = b64;
    document.getElementById('clip-image-input').dataset.b64 = b64;
  } else {
    // Player photo
    const p = globalState.players.find(x => x.id === cropTargetId);
    if (p) {
      toast('Salvando foto no banco...', 'inf');
      p.photo = b64;
      if (p.db_id) {
        await supabase.from('players').update({ photo: b64 }).eq('id', p.db_id);
      } else {
        await supabase.from('players').insert({ player_key: p.id, name: p.name, apelido: p.apelido, role: p.role, team: p.team, photo: b64 });
        await fetchAllData(); // reload
      }
      toast('Foto salva!', 'ok');
      renderCollection(); openDetailModal(p.id);
    }
  }
}

// =========================================
// WIZARD
// =========================================
let evalState = { step: 1, players: [], ratings: {}, mataMata: {} };

function startEvalWizard() {
  if (!loggedInPlayerId) { toast('Aguarde carregar dados...', 'err'); return; }
  evalState = { step: 1, players: globalState.players.filter(p => p.id !== loggedInPlayerId), ratings: {}, mataMata: {} };
  evalState.players.forEach(p => { evalState.ratings[p.id] = {}; ATTRS.forEach(a => evalState.ratings[p.id][a.key] = 50); });
  renderEvalStep();
}

function renderEvalStep() {
  const ev = document.getElementById('eval-view');
  const totalSteps = evalState.players.length + 1;
  if (evalState.step > evalState.players.length) { renderMataMataStep(totalSteps); return; }
  const player = evalState.players[evalState.step - 1];
  const ratings = evalState.ratings[player.id];
  const stepN = evalState.step;
  const dots = Array.from({ length: totalSteps }, (_, i) => `<div class="step-dot ${i < stepN - 1 ? 'done' : i === stepN - 1 ? 'current' : ''}"></div>`).join('');
  const attrRows = ATTRS.map(a => `<div class="attr-row"><span class="attr-icon">${a.icon}</span><span class="attr-lbl">${a.full}</span><div class="attr-slider"><input type="range" id="sl-${a.key}" min="0" max="99" value="${ratings[a.key]}" oninput="onSlider('${player.id}','${a.key}')" /></div><div class="attr-val" id="av-${a.key}">${ratings[a.key]}</div></div>`).join('');
  ev.innerHTML = `<div class="step-progress">${dots}<span class="step-label">PASSO ${stepN} DE ${totalSteps}</span></div><div class="wizard-header"><div class="wizard-avatar">${player.photo ? `<img src="${esc(player.photo)}">` : initials(player.name)}</div><div class="wizard-info"><div class="wizard-name">${esc(player.name)}</div><div class="wizard-sub">"${esc(player.apelido)}"</div></div><div class="live-ovr-wrap"><div class="live-ovr-lbl">Overall</div><div class="live-ovr-num" id="live-ovr">${calcOverall(ratings)}</div></div></div><div class="panel"><div class="panel-label">Avalie: ${esc(player.name)}</div>${attrRows}<div style="margin-top:20px;display:flex;gap:12px">${stepN > 1 ? `<button class="btn btn-ghost" onclick="evalState.step--;renderEvalStep()">← Voltar</button>` : ''}<button class="btn btn-gold" onclick="evalState.step++;renderEvalStep()">${stepN < totalSteps ? 'Próximo →' : 'Mata-Mata →'}</button></div></div>`;
  ATTRS.forEach(a => updateSliderBg(a.key, ratings[a.key]));
}
function onSlider(pId, k) {
  const v = parseInt(document.getElementById('sl-' + k).value);
  evalState.ratings[pId][k] = v; document.getElementById('av-' + k).textContent = v; updateSliderBg(k, v);
  document.getElementById('live-ovr').textContent = calcOverall(evalState.ratings[pId]);
}
function updateSliderBg(k, v) { const pct = (v / 99) * 100; document.getElementById('sl-' + k).style.background = `linear-gradient(90deg, var(--accent) ${pct}%, var(--bg-elevated) ${pct}%)`; }

function renderMataMataStep(totalSteps) {
  const ev = document.getElementById('eval-view');
  const dots = Array.from({ length: totalSteps }, (_, i) => `<div class="step-dot ${i < totalSteps - 1 ? 'done' : 'current'}"></div>`).join('');
  const qHtml = MM_QUESTIONS.map(q => `<div class="mm-question"><div class="mm-q-label"><span class="mm-q-emoji">${q.emoji}</span> ${esc(q.q)}</div><div class="mm-options">${globalState.players.map(p => `<div class="mm-option"><input type="radio" name="mm-${q.id}" id="mm-${q.id}-${p.id}" ${evalState.mataMata[q.id] === p.id ? 'checked' : ''} onchange="evalState.mataMata['${q.id}']='${p.id}'" /><label for="mm-${q.id}-${p.id}">${esc(p.name)}</label></div>`).join('')}</div></div>`).join('');
  ev.innerHTML = `<div class="step-progress">${dots}<span class="step-label">MATA-MATA</span></div><div class="panel"><div class="mm-section-title">⚔️ Perguntas Diretas</div>${qHtml}<div style="margin-top:24px;display:flex;gap:12px"><button class="btn btn-gold" onclick="submitEvaluation()" id="btn-submit-eval">🏆 Enviar Avaliação</button><button class="btn btn-ghost" onclick="evalState.step--;renderEvalStep()">← Voltar</button></div></div>`;
}

async function submitEvaluation() {
  if (MM_QUESTIONS.some(q => !evalState.mataMata[q.id])) { toast('Responda todas as perguntas do Mata-Mata.', 'err'); return; }
  const btn = document.getElementById('btn-submit-eval'); btn.disabled = true; btn.textContent = 'Enviando...';

  try {
    const evalInserts = evalState.players.map(p => ({
      evaluator_id: currentUser.id, // auth.users.id
      player_id: getPlayerUUIDByKey(p.id),
      ...evalState.ratings[p.id]
    })).filter(x => x.player_id); // garante q p achou o uuid

    if (evalInserts.length > 0) {
      // Supabase nao tem UPSERT massivo facil se a constraint (evaluator_id, player_id) for acionada
      // Vamos tentar dar upsert/delete manual ou apenas insert
      await supabase.from('evaluations').delete().eq('evaluator_id', currentUser.id); // deleta antigos pra garantir
      await supabase.from('evaluations').insert(evalInserts);
    }

    await supabase.from('mata_mata_votes').delete().eq('evaluator_id', currentUser.id);
    await supabase.from('mata_mata_votes').insert({ evaluator_id: currentUser.id, votes: evalState.mataMata });

    await fetchAllData();
    toast('Avaliação salva! 🏆', 'ok');
    nav('colecao');
  } catch (e) {
    console.error(e);
    toast('Erro ao salvar no banco', 'err');
    btn.disabled = false; btn.textContent = '🏆 Enviar Avaliação';
  }
}

// =========================================
// MATA-MATA RESULTS
// =========================================
function renderMMResults() {
  const el = document.getElementById('mm-results-container');
  if (!globalState.mataMataVotes.length) { el.innerHTML = `<div class="empty">Nenhum voto ainda.</div>`; return; }
  el.innerHTML = MM_QUESTIONS.map(q => {
    const counts = {}; globalState.players.forEach(p => counts[p.id] = 0);
    globalState.mataMataVotes.forEach(v => { if (v.votes[q.id]) counts[v.votes[q.id]]++; });
    const sorted = globalState.players.map(p => ({ p, c: counts[p.id] })).sort((a, b) => b.c - a.c);
    const max = sorted[0].c || 1;
    const bars = sorted.map(({ p, c }) => `<div class="mm-bar-row"><div class="mm-bar-name">${esc(p.name)}</div><div class="mm-bar-track"><div class="mm-bar-fill" style="width:${c ? c / max * 100 : 0}%"></div></div><div class="mm-bar-count">${c}</div></div>`).join('');
    return `<div class="mm-result-card"><div class="mm-q-label">${q.emoji} ${esc(q.q)}</div>${bars}</div>`;
  }).join('');
}

// =========================================
// CLIPS
// =========================================
function renderClips() {
  const cCont = document.getElementById('clips-container');
  if (!globalState.clips || !globalState.clips.length) { cCont.innerHTML = `<div class="empty">Nenhum clip postado ainda. Seja o primeiro!</div>`; return; }

  const sorted = [...globalState.clips].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  cCont.innerHTML = sorted.map(c => {
    const author = getPlayerByAuthId(c.player_id) || { name: 'Desconhecido' };
    const dt = new Date(c.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

    let mediaHtml = '';
    if (c.media_type === 'image') {
      mediaHtml = `<div class="img-wrap"><img src="${esc(c.media_url)}"></div>`;
    } else if (c.media_url && isSafeUrl(c.media_url)) {
      let embedSrc = '';
      try {
        if (c.media_url.includes('youtube.com/watch')) {
          const v = new URL(c.media_url).searchParams.get('v');
          if (v && /^[a-zA-Z0-9_-]{6,20}$/.test(v)) embedSrc = `https://www.youtube.com/embed/${v}`;
        } else if (c.media_url.includes('youtu.be/')) {
          const v = c.media_url.split('youtu.be/')[1]?.split('?')[0];
          if (v && /^[a-zA-Z0-9_-]{6,20}$/.test(v)) embedSrc = `https://www.youtube.com/embed/${v}`;
        } else if (c.media_url.includes('twitch.tv')) {
          const clipId = c.media_url.split('/').pop().split('?')[0];
          if (clipId && /^[a-zA-Z0-9_-]{5,60}$/.test(clipId)) embedSrc = `https://clips.twitch.tv/embed?clip=${clipId}&parent=${window.location.hostname}`;
        }
      } catch { /* URL malformada, cai no link externo abaixo */ }
      if (embedSrc) mediaHtml = `<div class="vid-wrap"><iframe src="${esc(embedSrc)}" allowfullscreen></iframe></div>`;
      else mediaHtml = `<div style="padding:16px;text-align:center"><a href="${esc(c.media_url)}" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">🔗 Acessar Link Externo</a></div>`;
    } else if (c.media_url) {
      mediaHtml = `<div style="padding:16px;text-align:center;color:var(--text-sec)">⚠️ Link inválido</div>`;
    }

    const rFire = c.reactions?.fire || []; const rNasty = c.reactions?.nasty || []; const rLol = c.reactions?.lol || [];
    const myId = currentUser?.id;

    // Filter comments for this clip
    const cComments = globalState.comments.filter(cm => cm.clip_id === c.id);
    const commentsHtml = cComments.map(cm => {
      const p = getPlayerByAuthId(cm.player_id);
      return `<div class="comment-item"><span class="comment-author">${esc(p ? p.name : 'Alguém')}:</span><span class="comment-text">${esc(cm.text)}</span></div>`;
    }).join('');

    return `
    <div class="clip-card">
      <div class="clip-header">
        <div class="clip-author"><div class="clip-av">${author.photo ? `<img src="${esc(author.photo)}">` : initials(author.name)}</div><div><div class="clip-name">${esc(author.name)}</div><div class="clip-time">${dt}</div></div></div>
        ${c.player_id === myId ? `<div class="clip-del" onclick="deleteClip('${c.id}')">Excluir</div>` : ''}
      </div>
      <div class="clip-media">${mediaHtml}</div>
      <div class="clip-body">
        <div class="clip-title">${esc(c.title)}</div>
        ${c.description ? `<div class="clip-desc">${esc(c.description)}</div>` : ''}
        <div class="clip-reactions">
          <button class="react-btn ${rFire.includes(myId) ? 'active' : ''}" onclick="toggleReact('${c.id}','fire')">🔥 ${rFire.length}</button>
          <button class="react-btn ${rNasty.includes(myId) ? 'active' : ''}" onclick="toggleReact('${c.id}','nasty')">💀 NASTY ${rNasty.length}</button>
          <button class="react-btn ${rLol.includes(myId) ? 'active' : ''}" onclick="toggleReact('${c.id}','lol')">😂 LOL ${rLol.length}</button>
        </div>
        <div class="clip-comments">
          ${commentsHtml ? `<div class="comment-list">${commentsHtml}</div>` : ''}
          <div class="comment-input-row">
            <input type="text" id="cin-${c.id}" placeholder="Escreva um comentário..." onkeypress="if(event.key==='Enter')addComment('${c.id}')">
            <button onclick="addComment('${c.id}')">ENVIAR</button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function handleClipImageSelect(e) { initCrop(e, 'NEW_CLIP', 16 / 9); }

async function submitClip() {
  const title = document.getElementById('clip-title').value.trim();
  const desc = document.getElementById('clip-desc').value.trim();
  const url = document.getElementById('clip-url').value.trim();
  const imgInput = document.getElementById('clip-image-input');

  if (!title) return toast('O post precisa de um título.', 'err');
  let mediaType = null; let mediaUrl = null;
  if (imgInput.dataset.b64) { mediaType = 'image'; mediaUrl = imgInput.dataset.b64; }
  else if (url) { mediaType = 'url'; mediaUrl = url; }
  else return toast('Adicione uma URL ou Imagem.', 'err');

  await supabase.from('clips').insert({
    player_id: currentUser.id,
    title, description: desc, media_type: mediaType, media_url: mediaUrl
  });

  closeModal('modal-new-clip');
  document.getElementById('clip-title').value = ''; document.getElementById('clip-desc').value = ''; document.getElementById('clip-url').value = '';
  imgInput.dataset.b64 = ''; document.getElementById('clip-image-preview').style.display = 'none';

  toast('Post criado!', 'ok');
  await fetchAllData(); renderClips();
}

async function toggleReact(clipId, type) {
  const c = globalState.clips.find(x => x.id === clipId);
  if (!c) return;
  const reactions = c.reactions || { fire: [], nasty: [], lol: [] };
  const arr = reactions[type] || [];
  const idx = arr.indexOf(currentUser.id);
  if (idx > -1) arr.splice(idx, 1); else arr.push(currentUser.id);
  reactions[type] = arr;

  await supabase.from('clips').update({ reactions }).eq('id', clipId);
  await fetchAllData(); renderClips();
}

async function addComment(clipId) {
  const inp = document.getElementById('cin-' + clipId);
  const txt = inp.value.trim(); if (!txt) return;
  await supabase.from('comments').insert({ clip_id: clipId, player_id: currentUser.id, text: txt });
  await fetchAllData(); renderClips();
}

async function deleteClip(clipId) {
  if (!confirm('Deletar post?')) return;
  await supabase.from('clips').delete().eq('id', clipId);
  await fetchAllData(); renderClips();
}

// Inicializar aplicativo SOMENTE após o DOM + CDN estarem prontos
document.addEventListener('DOMContentLoaded', () => {
  // Garante que o CDN do Supabase já carregou
  if (!window.supabase) {
    console.error('Supabase CDN não carregou!');
    return;
  }
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  initParticles();
  initPwListener();
  init();
});