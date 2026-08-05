// =========================================
// CONSTANTS & SUPABASE
// =========================================
const SUPABASE_URL = 'https://pdyqoajbdyjiktnkxqqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_0c5ydPhGf8lGIXTjrGiidQ_Jrp1WW_O';
let sbClient; // inicializado no DOMContentLoaded


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
const ROLE_WEIGHTS = {
  IGL: { sense: 0.24, impacto: 0.20, comms: 0.15, teamplay: 0.15, aim: 0.14, clutch: 0.08, reflexo: 0.02, tilt: 0.02 },
  AWPer: { aim: 0.28, reflexo: 0.18, clutch: 0.18, impacto: 0.16, sense: 0.12, teamplay: 0.04, comms: 0.02, tilt: 0.02 },
  Entry: { aim: 0.30, reflexo: 0.20, impacto: 0.18, clutch: 0.12, sense: 0.10, teamplay: 0.05, comms: 0.03, tilt: 0.02 },
  Lurker: { sense: 0.26, aim: 0.22, clutch: 0.18, impacto: 0.16, reflexo: 0.08, teamplay: 0.05, comms: 0.03, tilt: 0.02 },
  Support: { teamplay: 0.24, comms: 0.22, sense: 0.20, impacto: 0.14, aim: 0.10, clutch: 0.05, reflexo: 0.03, tilt: 0.02 },
  Rifler: { aim: 0.25, reflexo: 0.15, impacto: 0.15, sense: 0.15, clutch: 0.12, teamplay: 0.10, comms: 0.05, tilt: 0.03 }
};
const CARD_ATTRS_LEFT = ['aim', 'reflexo', 'sense'];
const CARD_ATTRS_RIGHT = ['teamplay', 'clutch', 'comms'];
const MM_QUESTIONS = [
  { id: 'mvp', emoji: '🏆', q: 'Quem é o MVP da line?', bonus: 2.0 },
  { id: 'carrega', emoji: '🚛', q: 'Quem carrega o time?', bonus: 2.0 },
  { id: 'melhorMira', emoji: '🎯', q: 'Quem possui a melhor mira?', bonus: 2.0 },
  { id: 'melhorSense', emoji: '🧠', q: 'Quem possui o melhor Game Sense?', bonus: 2.0 },
  { id: 'reiClutch', emoji: '💣', q: 'Quem é o Rei do Clutch?', bonus: 1.5 },
  { id: 'melhorComms', emoji: '🎙️', q: 'Quem tem a melhor comunicação?', bonus: 1.5 },
  { id: 'melhorIGL', emoji: '👑', q: 'Quem é o melhor IGL?', bonus: 1.5 },
  { id: 'consistente', emoji: '📈', q: 'Quem é o jogador mais consistente?', bonus: 1.5 },
  { id: 'melhorAWP', emoji: '🔭', q: 'Quem é o melhor AWPer?', bonus: 1.0 },
  { id: 'melhorEntry', emoji: '⚔️', q: 'Quem é o melhor Entry?', bonus: 1.0 },
  { id: 'melhorLurker', emoji: '🥷', q: 'Quem é o melhor Lurker?', bonus: 1.0 },
  { id: 'melhorSupport', emoji: '🛡️', q: 'Quem é o melhor Support?', bonus: 1.0 },
  { id: 'engracado', emoji: '😂', q: 'Quem é o mais engraçado?', bonus: 0.5 },
  { id: 'frio', emoji: '😎', q: 'Quem é o mais frio?', bonus: 0.5 },
  { id: 'mentalidade', emoji: '🔥', q: 'Quem tem a melhor mentalidade?', bonus: 0.5 },
  { id: 'parceiro', emoji: '🤝', q: 'Quem é o melhor parceiro?', bonus: 0.5 },
  { id: 'trolla', emoji: '🤡', q: 'Quem trolla a partida?', bonus: -2.0 },
  { id: 'ragequit', emoji: '🔌', q: 'Quem dá rage quit?', bonus: -2.0 },
  { id: 'naoComunica', emoji: '🔇', q: 'Quem não comunica?', bonus: -2.0 },
  { id: 'semUtilitaria', emoji: '🚫', q: 'Quem não sabe usar utilitária?', bonus: -1.5 },
  { id: 'morrePrimeiro', emoji: '💀', q: 'Quem morre primeiro sem trocar?', bonus: -1.5 },
  { id: 'naoJogaEquipe', emoji: '🐺', q: 'Quem nunca joga em equipe?', bonus: -1.5 },
  { id: 'fazBarulho', emoji: '🐘', q: 'Quem faz muito barulho (passos)?', bonus: -1.0 },
  { id: 'compraErrado', emoji: '🛒', q: 'Quem compra errado?', bonus: -1.0 },
  { id: 'tiltaFacil', emoji: '😡', q: 'Quem tilta fácil?', bonus: -1.0 },
  { id: 'perdeClutchAnsiedade', emoji: '😰', q: 'Quem perde clutch por ansiedade?', bonus: -1.0 },
  { id: 'atrasaEntrar', emoji: '🐌', q: 'Quem atrasa para entrar?', bonus: -0.5 },
  { id: 'reclamaMuito', emoji: '🗣️', q: 'Quem reclama muito?', bonus: -0.5 },
  { id: 'rushaDemais', emoji: '🏃', q: 'Quem rusha demais?', bonus: -0.5 }
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
function calcBaseOverall(attrs, role) {
  if (!role) role = 'Rifler';
  const weights = ROLE_WEIGHTS[role] || ROLE_WEIGHTS['Rifler'];
  let t = 0;
  for (const [k, w] of Object.entries(weights)) t += (attrs[k] || 0) * w;
  return Math.round(t);
}

function getPlayerPlaystyles(playerId) {
  const votesCount = {};
  globalState.mataMataVotes.forEach(vote => {
    if (!votesCount[vote.category_id]) votesCount[vote.category_id] = {};
    if (!votesCount[vote.category_id][vote.player_id]) votesCount[vote.category_id][vote.player_id] = 0;
    votesCount[vote.category_id][vote.player_id]++;
  });
  const wonStyles = [];
  let totalBonus = 0;
  MM_QUESTIONS.forEach(q => {
    if (votesCount[q.id]) {
      const counts = votesCount[q.id];
      let maxVotes = 0;
      let winners = [];
      for (const pId in counts) {
        if (counts[pId] > maxVotes) { maxVotes = counts[pId]; winners = [pId]; }
        else if (counts[pId] === maxVotes) { winners.push(pId); }
      }
      if (winners.includes(playerId)) { wonStyles.push(q); totalBonus += q.bonus; }
    }
  });
  if (totalBonus > 5) totalBonus = 5;
  if (totalBonus < -5) totalBonus = -5;
  return { styles: wonStyles, bonus: totalBonus };
}

function calcFinalOverall(attrs, player) {
  const base = calcBaseOverall(attrs, player.role);
  const { bonus } = getPlayerPlaystyles(player.id);
  return Math.round(base + bonus);
}
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
    const { data } = await sbClient.from('profiles').select('player_key');
    takenKeys = (data || []).map(r => r.player_key);
  } catch (err) { console.error('Erro ao checar personagens ocupados', err); }

  grid.innerHTML = DEFAULT_PLAYERS.map(p => {
    const taken = takenKeys.includes(p.id);
    return `
    <div class="player-card-sel ${regData.playerKey === p.id ? 'selected' : ''} ${taken ? 'taken' : ''}"
         onclick="selectPlayer('${p.id}', ${taken})" id="pcard-${p.id}" title="${taken ? 'Já escolhido por outra pessoa' : ''}">
      <div class="player-card-check">✓</div>
      <div class="player-card-av">${p.photo ? `<img src="${esc(p.photo)}">` : initials(p.name)}</div>
      <div class="player-card-name">${esc(p.name)}</div>
      <div class="player-card-nick">${esc(p.apelido)}</div>
      ${taken ? `<div class="player-card-taken-lbl">Ocupado</div>` : ''}
    </div>`;
  }).join('');
}

function selectPlayer(id, isTaken) {
  if (isTaken) {
    return toast('Este personagem já foi escolhido por outra pessoa.', 'err');
  }
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

  const { data, error } = await sbClient.auth.signInWithPassword({ email, password: pass });

  btn.disabled = false;
  btn.innerHTML = '<span class="btn-text">Entrar</span><span class="btn-arrow">→</span>';

  if (error) { toast('Erro: ' + translateAuthError(error.message), 'err'); return; }
  toast('Login efetuado! Bem-vindo de volta 🎮', 'ok');
}

async function handleForgotPassword() {
  const email = document.getElementById('login-email').value.trim();
  if (!email) { shakeInput('login-email'); return toast('Digite seu e-mail para recuperar a senha.', 'err'); }
  const { error } = await sbClient.auth.resetPasswordForEmail(email, {
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
  const { data: taken } = await sbClient.from('profiles').select('player_key').eq('player_key', regData.playerKey).maybeSingle();
  if (taken) {
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-text">Criar Conta</span><span class="btn-arrow">🚀</span>';
    regGoStep(2);
    return toast('Esse personagem já foi escolhido por outra pessoa. Selecione outro!', 'err');
  }

  const { data: signUpData, error: signUpError } = await sbClient.auth.signUp({
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
  const { data: loginData, error: loginError } = await sbClient.auth.signInWithPassword({ email, password: pass });

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
  const { error: profileError } = await sbClient.from('profiles').insert({
    id: loginData.user.id, player_key: regData.playerKey, full_name: regData.fullName
  });
  if (profileError) {
    toast('Este personagem acabou de ser escolhido por outra pessoa. Fale com um admin.', 'err');
    await sbClient.auth.signOut();
    return;
  }

  toast('Conta criada! Bem-vindo à line 🏆', 'ok');
}


async function logout() {
  await sbClient.auth.signOut();
  currentUser = null; loggedInPlayerId = null;
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('main-header').style.display = 'none';
  document.getElementById('main-content').style.display = 'none';
}

// Inicialização e Listener de Auth
async function init() {
  const { data: { session } } = await sbClient.auth.getSession();
  await handleAuthChange(session);

  sbClient.auth.onAuthStateChange(async (_event, session) => {
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
      sbClient.from('players').select('*'),
      sbClient.from('evaluations').select('*'),
      sbClient.from('mata_mata_votes').select('*'),
      sbClient.from('clips').select('*'),
      sbClient.from('comments').select('*'),
      sbClient.from('profiles').select('*')
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
    await sbClient.from('players').upsert(rows, { onConflict: 'player_key' });
  } catch (err) {
    console.error('Erro ao popular players', err);
  }
}

function updateHeader() {
  const p = globalState.players.find(x => x.id === loggedInPlayerId);
  if (!p) return;
  document.getElementById('header-avatar').innerHTML = p.photo ? `<img src="${esc(p.photo)}">` : initials(p.name);
  document.getElementById('header-name').textContent = p.name;
  // Mostra botão Admin apenas para lucas
  const adminBtn = document.getElementById('nav-admin');
  if (adminBtn) adminBtn.style.display = loggedInPlayerId === 'lucas' ? 'inline-flex' : 'none';
  // Mostra/esconde botão admin no nav mobile
  const mbnAdmin = document.getElementById('mbn-admin');
  if (mbnAdmin) mbnAdmin.style.display = loggedInPlayerId === 'lucas' ? 'flex' : 'none';
  // Exibe o menu mobile após login
  const mobileNav = document.getElementById('mobile-bottom-nav');
  if (mobileNav) mobileNav.style.display = 'flex';
}

// =========================================
// NAVIGATION & MODALS
// =========================================
function nav(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.mbn-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('section-' + id).classList.add('active');
  const nb = document.getElementById('nav-' + id);
  if (nb) nb.classList.add('active');
  const mbn = document.getElementById('mbn-' + id);
  if (mbn) mbn.classList.add('active');

  if (id === 'colecao') renderCollection();
  if (id === 'clips') renderClips();
  if (id === 'avaliar') startEvalWizard();
  if (id === 'matamata') renderMMResults();
  if (id === 'admin') renderAdminPanel();
  
  // Scroll ao topo ao trocar de seção no mobile
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.overlay').forEach(el => el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); }));

// =========================================
// CARD BUILDER & COLLECTION
// =========================================
function buildCard(player, attrs, overall, tier, size = 'big', playstyles = []) {
  let tc = 'card-' + tier;
  const photoBg = player.photo ? `style="background-image:url('${esc(player.photo)}')"` : '';
  const placeholder = player.photo ? '' : `<div class="card-photo-placeholder"><div class="card-photo-initials">${initials(player.name)}</div><svg class="card-photo-crosshair" width="160" height="160" viewBox="0 0 160 160" fill="none"><circle cx="80" cy="80" r="60" stroke="white" stroke-width="1.5"/><circle cx="80" cy="80" r="8" stroke="white" stroke-width="1.5"/><line x1="80" y1="20" x2="80" y2="55" stroke="white" stroke-width="1.5"/><line x1="80" y1="105" x2="80" y2="140" stroke="white" stroke-width="1.5"/><line x1="20" y1="80" x2="55" y2="80" stroke="white" stroke-width="1.5"/><line x1="105" y1="80" x2="140" y2="80" stroke="white" stroke-width="1.5"/></svg></div>`;
  const left = CARD_ATTRS_LEFT.map(k => { const a = ATTRS.find(x => x.key === k); return `<div class="card-stat"><span class="card-stat-icon">${a.icon}</span><span class="card-statval">${attrs ? attrs[k] ?? '—' : '—'}</span><span class="card-statlbl">${a.short}</span></div>`; }).join('');
  const right = CARD_ATTRS_RIGHT.map(k => { const a = ATTRS.find(x => x.key === k); return `<div class="card-stat"><span class="card-stat-icon">${a.icon}</span><span class="card-statval">${attrs ? attrs[k] ?? '—' : '—'}</span><span class="card-statlbl">${a.short}</span></div>`; }).join('');

  let colorStyle = '';
  if (player.card_color) {
    tc += ' card-custom';
    const hex = player.card_color;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const rgb = `${r}, ${g}, ${b}`;
    colorStyle = `style="
      --card-main: ${hex};
      --card-glow: rgba(${rgb}, 0.5);
      --card-glow-strong: rgba(${rgb}, 0.8);
      --card-bg-dark: rgba(${rgb}, 0.05);
      --card-bg-mid: rgba(${rgb}, 0.2);
      --card-deco: rgba(${rgb}, 0.85);
      --card-frame: rgba(${rgb}, 0.25);
      --card-panel: rgba(10,10,10, 0.95);
    "`;
  }

  let psHtml = '';
  if (playstyles && playstyles.length > 0) {
    psHtml = `<div class="card-playstyles">` + playstyles.map(ps => {
      const isNeg = ps.bonus < 0;
      return `<div class="ps-badge ${isNeg ? 'neg' : 'pos'}" title="${esc(ps.q)}">${ps.emoji}</div>`;
    }).join('') + `</div>`;
  }

  return `<div class="fifa-card ${tc}" ${colorStyle}><div class="card-bg"></div>
    <div class="card-photo" ${photoBg}>${placeholder}</div>
    <div class="card-deco top"></div><div class="card-deco bot"></div>
    <div class="card-top-left"><div class="card-ovr">${overall !== null ? overall : '??'}</div><div class="card-pos">${esc(player.role)}</div><div class="card-team-sm">${esc(player.team)}</div></div>
    <div class="card-edition" style="color:inherit"><span class="card-crown">👑</span><span>LINE</span><span class="card-edition-sub">OFICIAL</span></div>
    <div class="card-frame"></div>
    ${psHtml}
    <div class="card-name-area"><div class="card-nick">${esc(player.name)}</div><div class="card-apelido">"${esc(player.apelido)}"</div></div>
    <div class="card-stats-panel"><div class="card-stats-grid"><div class="card-stats-col">${left}</div><div class="card-divider-v"></div><div class="card-stats-col right">${right}</div></div><div class="card-ovr-badge">OVERALL ${overall !== null ? overall : '??'}</div></div>
  </div>`;
}

function renderCollection() {
  const sorted = globalState.players.map(p => {
    const avg = avgAttrs(globalState.evaluations.filter(e => e.playerId === p.id));
    return { p, avg, ov: avg ? calcFinalOverall(avg, p) : -1 };
  }).sort((a, b) => b.ov - a.ov);

  document.getElementById('collection-container').innerHTML = `<div class="col-grid">` + sorted.map(({ p, avg, ov }) => {
    const tier = avg ? getTier(ov) : 'treino';
    const pstyles = getPlayerPlaystyles(p.id).styles;
    let card = buildCard(p, avg, avg ? ov : null, tier, 'small', pstyles);
    if (!avg) card = card.replace('</div>', '<div class="card-locked-layer"><svg width="22" height="22" viewBox="0 0 24 24" stroke="white" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span>Aguardando avaliações</span></div></div>');
    return `<div class="col-item" onclick="openDetailModal('${p.id}')">${card}</div>`;
  }).join('') + `</div>`;
}

function openDetailModal(playerId) {
  const player = globalState.players.find(p => p.id === playerId);
  if (!player) return;
  const evals = globalState.evaluations.filter(e => e.playerId === playerId);
  const avg = avgAttrs(evals);
  const overall = avg ? calcFinalOverall(avg, player) : null;
  const tier = avg ? getTier(overall) : null;

  let tableRows = evals.map(ev => `<tr><td>${esc(globalState.players.find(p => p.id === ev.evaluatorId)?.name || ev.evaluatorId)}</td>${ATTRS.map(a => `<td class="vm">${ev[a.key] ?? '—'}</td>`).join('')}<td class="vm" style="font-size:15px">${calcBaseOverall(ev, player.role)}</td></tr>`).join('');
  let avgRow = avg ? `<tr style="background:rgba(255,184,0,0.08)"><td style="font-weight:700;color:var(--accent)">MÉDIA</td>${ATTRS.map(a => `<td class="vm" style="color:var(--accent)">${avg[a.key]}</td>`).join('')}<td class="vm" style="color:var(--accent);font-size:15px">${overall}</td></tr>` : '';

  let colorPicker = '';
  if (playerId === loggedInPlayerId) {
    const colors = [
      { name: 'Amarelo', hex: '#F2C411' },
      { name: 'Roxo', hex: '#A01C95' },
      { name: 'Verde', hex: '#019E5A' },
      { name: 'Azul', hex: '#5696F6' },
      { name: 'Laranja', hex: '#ED7D10' },
      { name: 'Padrão', hex: '' }
    ];
    colorPicker = `
    <div style="margin-top:20px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.05)">
      <div style="font-size:12px; color:var(--text-sec); margin-bottom:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Sua Cor (CS2)</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        ${colors.map(c => `
          <button type="button" 
                  class="color-btn" 
                  style="background:${c.hex || 'var(--bg-elevated)'}; width:36px; height:36px; border-radius:50%; border:2px solid ${(player.card_color || '') === c.hex ? 'white' : 'transparent'}; cursor:pointer; transition:transform 0.2s;"
                  onclick="setCardColor('${playerId}', '${c.hex}')" title="${c.name}">
            ${!c.hex ? '✖' : ''}
          </button>
        `).join('')}
      </div>
      <div style="font-size:11px; color:var(--text-muted); margin-top:8px;">Escolha a cor da sua cartinha, igual no CS.</div>
    </div>`;
  }

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
        ${colorPicker}
      </div>
    </div>
    ${evals.length ? `<div style="overflow-x:auto"><table class="stats-tbl"><thead><tr><th>Avaliador</th>${ATTRS.map(a => `<th>${a.short}</th>`).join('')}<th>OVR</th></tr></thead><tbody>${tableRows}${avgRow}</tbody></table></div>` : '<div class="empty">Nenhuma avaliação.</div>'}
  `;
  openModal('detail-modal');
}

async function setCardColor(playerId, hexColor) {
  const p = globalState.players.find(x => x.id === playerId);
  if (!p) return;
  
  // Update state
  p.card_color = hexColor || null;
  
  // Optimistic UI updates
  renderCollection();
  openDetailModal(playerId);
  updateHeader();
  
  // Try saving to DB
  try {
    const updateObj = hexColor ? { card_color: hexColor } : { card_color: null };
    const { error } = await sbClient.from('players').update(updateObj).eq('id', p.db_id);
    if (error) {
      console.error(error);
      toast('Cor não salva. Você precisa adicionar a coluna "card_color" no Supabase.', 'err');
    } else {
      toast('Cor atualizada!', 'ok');
    }
  } catch (err) {
    console.error(err);
  }
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
        await sbClient.from('players').update({ photo: b64 }).eq('id', p.db_id);
      } else {
        await sbClient.from('players').insert({ player_key: p.id, name: p.name, apelido: p.apelido, role: p.role, team: p.team, photo: b64 });
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
  const attrRows = ATTRS.map(a => `
    <div class="attr-row">
      <div class="attr-top">
        <span class="attr-icon">${a.icon}</span>
        <span class="attr-lbl">${a.full}</span>
        <div class="attr-val" id="av-${a.key}">${ratings[a.key]}</div>
      </div>
      <div class="attr-slider">
        <input type="range" id="sl-${a.key}" min="0" max="99" value="${ratings[a.key]}" oninput="onSlider('${player.id}','${a.key}')" />
      </div>
      <div class="attr-btns">
        <button class="attr-adj attr-adj-sub" type="button" onclick="adjustSlider('${player.id}','${a.key}',-5)">−5</button>
        <button class="attr-adj attr-adj-sub" type="button" onclick="adjustSlider('${player.id}','${a.key}',-1)">−1</button>
        <div class="attr-btns-spacer"></div>
        <button class="attr-adj attr-adj-add" type="button" onclick="adjustSlider('${player.id}','${a.key}',+1)">+1</button>
        <button class="attr-adj attr-adj-add" type="button" onclick="adjustSlider('${player.id}','${a.key}',+5)">+5</button>
      </div>
    </div>
  `).join('');
  ev.innerHTML = `<div class="step-progress">${dots}<span class="step-label">PASSO ${stepN} DE ${totalSteps}</span></div><div class="wizard-header"><div class="wizard-avatar">${player.photo ? `<img src="${esc(player.photo)}">` : initials(player.name)}</div><div class="wizard-info"><div class="wizard-name">${esc(player.name)}</div><div class="wizard-sub">"${esc(player.apelido)}"</div></div><div class="live-ovr-wrap"><div class="live-ovr-lbl">Base OVR</div><div class="live-ovr-num" id="live-ovr">${calcBaseOverall(ratings, player.role)}</div></div></div><div class="panel"><div class="panel-label">Avalie: ${esc(player.name)}</div>${attrRows}<div style="margin-top:20px;display:flex;gap:12px">${stepN > 1 ? `<button class="btn btn-ghost" onclick="evalState.step--;renderEvalStep()">← Voltar</button>` : ''}<button class="btn btn-gold" onclick="evalState.step++;renderEvalStep()">${stepN < totalSteps ? 'Próximo →' : 'Mata-Mata →'}</button></div></div>`;
  ATTRS.forEach(a => updateSliderBg(a.key, ratings[a.key]));
}
function onSlider(pId, k) {
  const v = parseInt(document.getElementById('sl-' + k).value);
  evalState.ratings[pId][k] = v; document.getElementById('av-' + k).textContent = v; updateSliderBg(k, v);
  const player = globalState.players.find(p => p.id === pId);
  document.getElementById('live-ovr').textContent = calcBaseOverall(evalState.ratings[pId], player?.role);
}
function adjustSlider(pId, k, delta) {
  const slider = document.getElementById('sl-' + k);
  const newVal = Math.max(0, Math.min(99, parseInt(slider.value) + delta));
  slider.value = newVal;
  evalState.ratings[pId][k] = newVal;
  document.getElementById('av-' + k).textContent = newVal;
  updateSliderBg(k, newVal);
  const player = globalState.players.find(p => p.id === pId);
  document.getElementById('live-ovr').textContent = calcBaseOverall(evalState.ratings[pId], player?.role);
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
      await sbClient.from('evaluations').delete().eq('evaluator_id', currentUser.id); // deleta antigos pra garantir
      await sbClient.from('evaluations').insert(evalInserts);
    }

    await sbClient.from('mata_mata_votes').delete().eq('evaluator_id', currentUser.id);
    await sbClient.from('mata_mata_votes').insert({ evaluator_id: currentUser.id, votes: evalState.mataMata });

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

  await sbClient.from('clips').insert({
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

  await sbClient.from('clips').update({ reactions }).eq('id', clipId);
  await fetchAllData(); renderClips();
}

async function addComment(clipId) {
  const inp = document.getElementById('cin-' + clipId);
  const txt = inp.value.trim(); if (!txt) return;
  await sbClient.from('comments').insert({ clip_id: clipId, player_id: currentUser.id, text: txt });
  await fetchAllData(); renderClips();
}

async function deleteClip(clipId) {
  if (!confirm('Deletar post?')) return;
  await sbClient.from('clips').delete().eq('id', clipId);
  await fetchAllData(); renderClips();
}

// Inicializar aplicativo SOMENTE após o DOM + CDN estarem prontos
// =========================================
// ADMIN PANEL
// =========================================
let adminResetTarget = null;

function renderAdminPanel() {
  const view = document.getElementById('admin-view');
  if (loggedInPlayerId !== 'lucas') {
    view.innerHTML = '<div class="empty">🔒 Acesso negado.</div>';
    return;
  }

  const evCount = globalState.evaluations.length;
  const mmCount = globalState.mataMataVotes.length;
  const clipsCount = globalState.clips.length;

  view.innerHTML = `
    <h1 class="page-title">Painel <span>Admin</span></h1>
    <p class="page-sub">Apenas você tem acesso a esta área. Ações aqui são irreversíveis.</p>

    <div class="admin-cards">

      <div class="admin-card">
        <div class="admin-card-head">
          <span class="admin-card-icon">📦</span>
          <span class="admin-card-title">Backup</span>
        </div>
        <p class="admin-card-desc">Exporta todas as avaliações, votos e clips como arquivo JSON no seu computador.</p>
        <div class="admin-stats">
          <span>${evCount} avaliações</span> · <span>${mmCount} votos</span> · <span>${clipsCount} clips</span>
        </div>
        <button class="btn btn-dark" onclick="downloadBackup()">⬇️ Baixar Backup</button>
      </div>

      <div class="admin-card admin-danger">
        <div class="admin-card-head">
          <span class="admin-card-icon">🗑️</span>
          <span class="admin-card-title">Zerar Avaliações</span>
        </div>
        <p class="admin-card-desc">Apaga todas as avaliações. As cartinhas voltarão a aparecer como <strong>bloqueadas</strong>.</p>
        <div class="admin-stats"><span class="admin-count">${evCount}</span> avaliações no banco</div>
        <button class="btn btn-red" onclick="adminConfirmReset('evaluations')">Apagar Avaliações</button>
      </div>

      <div class="admin-card admin-danger">
        <div class="admin-card-head">
          <span class="admin-card-icon">🗑️</span>
          <span class="admin-card-title">Zerar Mata-Mata</span>
        </div>
        <p class="admin-card-desc">Apaga todos os votos do Mata-Mata. Todos poderão <strong>votar novamente</strong>.</p>
        <div class="admin-stats"><span class="admin-count">${mmCount}</span> votos no banco</div>
        <button class="btn btn-red" onclick="adminConfirmReset('matamata')">Apagar Votos</button>
      </div>

      <div class="admin-card admin-danger admin-card-full">
        <div class="admin-card-head">
          <span class="admin-card-icon">💥</span>
          <span class="admin-card-title">Zerar Tudo</span>
        </div>
        <p class="admin-card-desc">Apaga <strong>todas as avaliações</strong> e <strong>todos os votos</strong> do Mata-Mata de uma vez. O site volta ao estado inicial.</p>
        <button class="btn btn-red" style="align-self:flex-start" onclick="adminConfirmReset('all')">💥 Zerar Tudo</button>
      </div>

    </div>

    <div class="admin-confirm-overlay" id="admin-confirm-overlay" style="display:none">
      <div class="admin-confirm-box">
        <div class="admin-confirm-title" id="admin-confirm-title"></div>
        <div class="admin-confirm-desc" id="admin-confirm-desc"></div>
        <div class="admin-confirm-hint">Digite <strong>CONFIRMAR</strong> para liberar o botão:</div>
        <input class="input-box" type="text" id="admin-confirm-input" placeholder="CONFIRMAR"
          oninput="checkAdminConfirm()" autocomplete="off" style="margin-bottom:0">
        <div class="modal-actions" style="margin-top:16px">
          <button class="btn btn-ghost" onclick="closeAdminConfirm()">Cancelar</button>
          <button class="btn btn-red" id="admin-confirm-btn" onclick="executeAdminReset()" disabled>Apagar</button>
        </div>
      </div>
    </div>
  `;
}

function adminConfirmReset(target) {
  adminResetTarget = target;
  const map = {
    evaluations: {
      title: '⚠️ Apagar todas as avaliações',
      desc: 'Todas as avaliações de TODOS os jogadores serão apagadas permanentemente. As cartinhas voltarão a aparecer como bloqueadas. Esta ação NÃO pode ser desfeita.'
    },
    matamata: {
      title: '⚠️ Apagar todos os votos',
      desc: 'Todos os votos do Mata-Mata serão apagados permanentemente. Todos poderão votar novamente do zero. Esta ação NÃO pode ser desfeita.'
    },
    all: {
      title: '💥 Zerar tudo',
      desc: 'TODAS as avaliações E TODOS os votos do Mata-Mata serão apagados permanentemente. O site voltará ao estado inicial. Esta ação NÃO pode ser desfeita.'
    },
  };
  const m = map[target];
  document.getElementById('admin-confirm-title').textContent = m.title;
  document.getElementById('admin-confirm-desc').textContent = m.desc;
  document.getElementById('admin-confirm-input').value = '';
  document.getElementById('admin-confirm-btn').disabled = true;
  document.getElementById('admin-confirm-overlay').style.display = 'flex';
  setTimeout(() => document.getElementById('admin-confirm-input').focus(), 100);
}

function checkAdminConfirm() {
  const val = document.getElementById('admin-confirm-input').value;
  document.getElementById('admin-confirm-btn').disabled = (val !== 'CONFIRMAR');
}

function closeAdminConfirm() {
  document.getElementById('admin-confirm-overlay').style.display = 'none';
  adminResetTarget = null;
}

async function executeAdminReset() {
  const btn = document.getElementById('admin-confirm-btn');
  btn.disabled = true;
  btn.textContent = 'Apagando...';

  try {
    if (adminResetTarget === 'evaluations' || adminResetTarget === 'all') {
      const { error } = await sbClient.from('evaluations').delete().gte('created_at', '2000-01-01T00:00:00Z');
      if (error) throw error;
    }
    if (adminResetTarget === 'matamata' || adminResetTarget === 'all') {
      const { error } = await sbClient.from('mata_mata_votes').delete().gte('created_at', '2000-01-01T00:00:00Z');
      if (error) throw error;
    }
    closeAdminConfirm();
    toast('Dados apagados com sucesso! ✅', 'ok');
    await fetchAllData();
    renderAdminPanel();
  } catch (e) {
    console.error(e);
    // Erro de RLS: orienta o usuário a configurar a política no Supabase
    const isRls = e.code === '42501' || (e.message && e.message.includes('policy'));
    toast(isRls
      ? 'Erro de permissão RLS. Veja o console para instruções.'
      : 'Erro ao apagar: ' + (e.message || 'desconhecido'), 'err');
    if (isRls) {
      console.warn(
        '%c[Admin] Para habilitar o reset, execute no SQL Editor do Supabase:\n\n' +
        'CREATE POLICY "Admin delete evaluations" ON public.evaluations FOR DELETE USING (\n' +
        '  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND player_key = \'lucas\')\n' +
        ');\n\n' +
        'CREATE POLICY "Admin delete mata_mata_votes" ON public.mata_mata_votes FOR DELETE USING (\n' +
        '  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND player_key = \'lucas\')\n' +
        ');',
        'color: orange; font-size: 13px;'
      );
    }
    btn.disabled = false;
    btn.textContent = 'Apagar';
  }
}

function downloadBackup() {
  const backup = {
    exportedAt: new Date().toISOString(),
    players: globalState.players,
    evaluations: globalState.evaluations,
    mataMataVotes: globalState.mataMataVotes,
    clips: globalState.clips,
    comments: globalState.comments,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cs2-ratings-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Backup baixado! 📦', 'ok');
}

// =========================================
// INIT
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  // Garante que o CDN do Supabase já carregou
  if (!window.supabase) {
    console.error('Supabase CDN não carregou!');
    return;
  }
  sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  initParticles();
  initPwListener();
  init();
});