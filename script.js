// =========================================
// CONSTANTS & SUPABASE
// =========================================
const SUPABASE_URL = 'https://pdyqoajbdyjiktnkxqqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_0c5ydPhGf8lGIXTjrGiidQ_Jrp1WW_O';
let sbClient; // inicializado no DOMContentLoaded


// NOTA: a antiga lista fixa de personagens (DEFAULT_PLAYERS) foi removida.
// Agora o elenco é dinâmico: cada time tem suas próprias cartinhas,
// criadas automaticamente quando alguém entra no time (ver create_player_card
// e claim_player_card no script.js e na migração team_scoped_data_migration.sql).

const ARSENAL_ATTRS = [
  { key: 'rifles', icon: '🔫', short: 'Rifles' },
  { key: 'precisao', icon: '🎯', short: 'Precisão' },
  { key: 'smgs', icon: '💨', short: 'SMGs' },
  { key: 'pistolas', icon: '🔫', short: 'Pistolas' },
  { key: 'utilitarias', icon: '💣', short: 'Utilitárias' }
];

const MAP_POOL = [
  { key: 'mirage', short: 'Mirage' },
  { key: 'inferno', short: 'Inferno' },
  { key: 'dust2', short: 'Dust II' },
  { key: 'nuke', short: 'Nuke' },
  { key: 'ancient', short: 'Ancient' },
  { key: 'cache', short: 'Cache' },
  { key: 'overpass', short: 'Overpass' },
  { key: 'anubis', short: 'Anubis' }
];

const CS2_WEAPONS = [
  "AK-47", "M4A4", "M4A1-S", "AWP", "Desert Eagle", "USP-S", "Glock-18",
  "MAC-10", "MP9", "Galil AR", "FAMAS", "SSG 08", "P250", "Tec-9", "Five-SeveN"
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
  IGL: { aim: 0.25, sense: 0.20, impacto: 0.15, comms: 0.15, teamplay: 0.12, clutch: 0.08, reflexo: 0.03, tilt: 0.02 },
  'Entry Fragger': { aim: 0.30, reflexo: 0.20, impacto: 0.18, clutch: 0.12, sense: 0.10, teamplay: 0.05, comms: 0.03, tilt: 0.02 },
  AWPer: { aim: 0.28, reflexo: 0.18, clutch: 0.18, impacto: 0.16, sense: 0.12, teamplay: 0.04, comms: 0.02, tilt: 0.02 },
  Suporte: { aim: 0.24, teamplay: 0.20, comms: 0.18, sense: 0.16, impacto: 0.12, clutch: 0.05, reflexo: 0.03, tilt: 0.02 },
  Lurker: { aim: 0.26, sense: 0.22, clutch: 0.18, impacto: 0.16, reflexo: 0.08, teamplay: 0.05, comms: 0.03, tilt: 0.02 },
  Anchor: { aim: 0.25, clutch: 0.20, sense: 0.18, reflexo: 0.15, impacto: 0.10, teamplay: 0.05, tilt: 0.05, comms: 0.02 }
};
const ROLE_DISPLAY_NAMES = {
  IGL: 'IGL',
  'Entry Fragger': 'Entry',
  AWPer: 'AWP',
  Suporte: 'Sup',
  Lurker: 'Lurk',
  Anchor: 'Anchor'
};
const CARD_ATTRS_LEFT = ['aim', 'reflexo', 'sense'];
const CARD_ATTRS_RIGHT = ['teamplay', 'clutch', 'comms'];
const MM_QUESTIONS = [
  { id: 'mvp', emoji: '🏆', q: 'Quem é o MVP da line?', short: 'MVP', bonus: 0.35 },
  { id: 'carrega', emoji: '🚛', q: 'Quem carrega o time?', short: 'Carregador', bonus: 0.50 },
  { id: 'melhorMira', emoji: '🎯', q: 'Quem possui a melhor mira?', short: 'Melhor Mira (AIM)', bonus: 0.20 },
  { id: 'melhorSense', emoji: '🧠', q: 'Quem possui o melhor Game Sense?', short: 'Game Sense', bonus: 0.20 },
  { id: 'reiClutch', emoji: '💣', q: 'Quem é o Rei do Clutch?', short: 'Rei do Clutch', bonus: 0.20 },
  { id: 'melhorComms', emoji: '🎙️', q: 'Quem tem a melhor comunicação?', short: 'Boa Comunicação', bonus: 0.20 },
  { id: 'melhorIGL', emoji: '👑', q: 'Quem é o melhor IGL?', short: 'Melhor IGL', bonus: 0.35 },
  { id: 'consistente', emoji: '📈', q: 'Quem é o jogador mais consistente?', short: 'Mais Consistente', bonus: 0.35 },
  { id: 'melhorAWP', emoji: '🔭', q: 'Quem é o melhor AWPer?', short: 'Melhor AWP', bonus: 0.20 },
  { id: 'melhorEntry', emoji: '⚔️', q: 'Quem é o melhor Entry?', short: 'Melhor Entry', bonus: 0.20 },
  { id: 'melhorLurker', emoji: '🥷', q: 'Quem é o melhor Lurker?', short: 'Melhor Lurker', bonus: 0.20 },
  { id: 'melhorSupport', emoji: '🛡️', q: 'Quem é o melhor Support?', short: 'Melhor Suporte', bonus: 0.20 },
  { id: 'engracado', emoji: '😂', q: 'Quem é o mais engraçado?', short: 'Engraçado', bonus: 0.10 },
  { id: 'frio', emoji: '😎', q: 'Quem é o mais frio?', short: 'Frio e Calculista', bonus: 0.10 },
  { id: 'mentalidade', emoji: '🔥', q: 'Quem tem a melhor mentalidade?', short: 'Mentalidade Forte', bonus: 0.10 },
  { id: 'parceiro', emoji: '🤝', q: 'Quem é o melhor parceiro?', short: 'Bom Parceiro', bonus: 0.10 },
  { id: 'trolla', emoji: '🤡', q: 'Quem trolla a partida?', short: 'Troll da Partida', bonus: -0.50 },
  { id: 'ragequit', emoji: '🔌', q: 'Quem dá rage quit?', short: 'Rage Quitter', bonus: -0.50 },
  { id: 'naoComunica', emoji: '🔇', q: 'Quem não comunica?', short: 'Mudo', bonus: -0.35 },
  { id: 'semUtilitaria', emoji: '🚫', q: 'Quem não sabe usar utilitária?', short: 'Inimigo das Granadas', bonus: -0.35 },
  { id: 'morrePrimeiro', emoji: '💀', q: 'Quem morre primeiro sem trocar?', short: 'First Blood Ambulante', bonus: -0.35 },
  { id: 'naoJogaEquipe', emoji: '🐺', q: 'Quem nunca joga em equipe?', short: 'Lobo Solitário', bonus: -0.35 },
  { id: 'fazBarulho', emoji: '🐘', q: 'Quem faz muito barulho (passos)?', short: 'Pé de Elefante', bonus: -0.20 },
  { id: 'compraErrado', emoji: '🛒', q: 'Quem compra errado?', short: 'Força Todo Round', bonus: -0.20 },
  { id: 'maisTiltado', emoji: '🤬', q: 'Quem é o mais tiltado?', short: 'Tiltado', bonus: -0.20 },
  { id: 'perdeClutchAnsiedade', emoji: '😰', q: 'Quem perde clutch por ansiedade?', short: 'Pipoca no Clutch', bonus: -0.20 },
  { id: 'atrasaEntrar', emoji: '🐌', q: 'Quem atrasa para entrar?', short: 'Lento / Baits', bonus: -0.10 },
  { id: 'reclamaMuito', emoji: '🗣️', q: 'Quem reclama muito?', short: 'Reclamão', bonus: -0.10 },
  { id: 'rushaDemais', emoji: '🏃', q: 'Quem rusha demais?', short: 'W + Mouse 1', bonus: -0.10 }
];

let globalState = { players: [], evaluations: [], mataMataVotes: [], clips: [], comments: [] };
let currentUser = null; // Supabase user
let loggedInPlayerId = null; // Ex: 'vitin'

// ---- Sistema de Times ----
let currentTeam = null;          // Time ativo do usuário logado (linha de teams_public)
let isCaptain = false;           // currentUser é o capitão do currentTeam?
let teamsListCache = [];         // Lista de times carregada na tela de seleção
let teamMembersCache = [];       // Membros do time atual (modal de configurações)
let pendingJoinTeamId = null;    // Time aguardando confirmação de senha
let newTeamPhotoB64 = null;      // Foto escolhida ao criar um time novo (aguardando salvar)
let teamSettingsPhotoB64 = null; // Foto escolhida ao editar o time atual (aguardando salvar)

// NOTA: o antigo `profilesMap` (auth.users.id -> player_key via tabela profiles)
// foi removido. Agora cada cartinha (players) sabe diretamente sua conta dona
// através da coluna `owner_id`, o que é mais direto e já é escopado por time.

// =========================================
// UTILS & MATH
// =========================================
function esc(s) { return s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') : ''; }
function calcBaseOverall(attrs, role) {
  let r = role || 'Anchor';
  if (r === 'Rifler') r = 'Anchor';
  if (r === 'Support') r = 'Suporte';
  if (r === 'Entry') r = 'Entry Fragger';

  const weights = ROLE_WEIGHTS[r] || ROLE_WEIGHTS['Anchor'];
  let t = 0;
  for (const [k, w] of Object.entries(weights)) t += (attrs[k] || 0) * w;
  return t;
}

function getPlayerPlaystyles(playerId) {
  // Cada linha de mataMataVotes tem um campo `votes` (JSON: categoryId -> playerId).
  const votesCount = {}; // { categoryId: { playerId: contagem } }
  globalState.mataMataVotes.forEach(row => {
    if (!row.votes) return;
    for (const categoryId in row.votes) {
      const votedPlayerId = row.votes[categoryId];
      if (!votesCount[categoryId]) votesCount[categoryId] = {};
      votesCount[categoryId][votedPlayerId] = (votesCount[categoryId][votedPlayerId] || 0) + 1;
    }
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
  if (totalBonus > 1.5) totalBonus = 1.5;
  if (totalBonus < -1.5) totalBonus = -1.5;
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
  const sum = {}; 
  [...ATTRS, ...ARSENAL_ATTRS, ...MAP_POOL].forEach(a => sum[a.key] = 0);
  evals.forEach(e => {
    [...ATTRS, ...ARSENAL_ATTRS, ...MAP_POOL].forEach(a => sum[a.key] += (e[a.key] || 0));
  });
  const avg = {}; 
  ATTRS.forEach(a => avg[a.key] = Math.round(sum[a.key] / evals.length));
  ARSENAL_ATTRS.forEach(a => avg[a.key] = parseFloat((sum[a.key] / evals.length).toFixed(1)));
  MAP_POOL.forEach(a => avg[a.key] = parseFloat((sum[a.key] / evals.length).toFixed(1)));
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

const TEAM_ERROR_MAP = {
  'wrong_password': 'Senha incorreta.',
  'team_not_found': 'Este time não existe mais.',
  'not_authenticated': 'Sua sessão expirou. Faça login novamente.',
  'invalid_name': 'O nome do time precisa ter entre 2 e 40 caracteres.',
  'not_captain': 'Apenas o capitão pode alterar essas configurações.',
  'not_a_member': 'Essa ação não é válida porque você não é membro desse time.',
  'captain_must_transfer': 'Você é o capitão deste time. Transfira a capitania para outro membro antes de sair ou trocar de time.',
  'already_has_card': 'Você já tem uma cartinha neste time.',
  'card_not_available': 'Essa cartinha já foi reivindicada por outra pessoa.',
  'card_not_found': 'Essa cartinha não existe mais.',
};
function translateTeamError(msg) {
  if (!msg) return 'Erro desconhecido.';
  for (const key in TEAM_ERROR_MAP) { if (msg.includes(key)) return TEAM_ERROR_MAP[key]; }
  return msg;
}
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
function initParticles(containerId = 'login-particles') {
  const container = document.getElementById(containerId);
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
let regData = { fullName: '', apelido: '' };
let regCurrentStep = 1;

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
    const apelido = document.getElementById('reg-apelido').value.trim();
    // Apelido é opcional — se não preencher, usamos o primeiro nome como fallback
    regData.apelido = apelido || regData.fullName.split(' ')[0];
    regGoStep(3);
  }
}

function updatePlayerPreview() {
  const av = document.getElementById('preview-av');
  const nm = document.getElementById('preview-name');
  const nk = document.getElementById('preview-nick');
  if (av) av.textContent = initials(regData.fullName);
  if (nm) nm.textContent = regData.fullName;
  if (nk) nk.textContent = regData.apelido ? `"${regData.apelido}"` : '';
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

async function submitUpdatePassword() {
  const newPw = document.getElementById('up-password').value;
  if (!newPw || newPw.length < 6) {
    shakeInput('up-password');
    return toast('A senha deve ter pelo menos 6 caracteres.', 'err');
  }

  const btn = document.getElementById('btn-update-password');
  btn.disabled = true;
  btn.innerText = 'Salvando...';

  const { error } = await sbClient.auth.updateUser({ password: newPw });
  if (error) {
    btn.disabled = false;
    btn.innerText = 'Salvar Nova Senha';
    return toast('Erro ao atualizar senha: ' + translateAuthError(error.message), 'err');
  }

  toast('Senha atualizada com sucesso! 🔑', 'ok');
  closeModal('modal-update-password');
  btn.disabled = false;
  btn.innerText = 'Salvar Nova Senha';
}

async function cancelPasswordReset() {
  closeModal('modal-update-password');
  await logout();
}

async function handleRegister() {
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-password').value;
  const btn = document.getElementById('btn-register');

  if (!email) { shakeInput('reg-email'); return toast('Digite seu e-mail!', 'err'); }
  if (!pass || pass.length < 6) { shakeInput('reg-password'); return toast('Senha deve ter ao menos 6 caracteres!', 'err'); }
  if (!regData.fullName) { regGoStep(1); return toast('Digite seu nome!', 'err'); }

  btn.disabled = true;
  btn.innerHTML = '<span class="btn-text">Criando conta</span><span class="btn-arrow">⏳</span>';

  const { data: signUpData, error: signUpError } = await sbClient.auth.signUp({
    email, password: pass,
    options: { data: { full_name: regData.fullName, apelido: regData.apelido } }
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

  // Cria o perfil (sem vínculo a nenhum time ainda — isso acontece na
  // tela "Escolha seu Time", logo em seguida).
  const { error: profileError } = await sbClient.from('profiles').insert({
    id: loginData.user.id, full_name: regData.fullName, apelido: regData.apelido
  });
  if (profileError) {
    console.error(profileError);
    toast('Erro ao criar seu perfil. Fale com um admin.', 'err');
    await sbClient.auth.signOut();
    return;
  }

  toast('Conta criada! Bem-vindo 🏆', 'ok');

  // Garante que a checagem de time rode com o perfil já existente, mesmo que
  // o listener de auth tenha disparado antes deste insert terminar.
  if (currentUser) await resolveTeamAndProceed();
}


async function logout() {
  await sbClient.auth.signOut();
  currentUser = null; loggedInPlayerId = null; currentTeam = null; isCaptain = false;
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-screen').style.opacity = '1';
  document.getElementById('team-select-screen').style.display = 'none';
  document.getElementById('team-badge').style.display = 'none';
  document.getElementById('main-header').style.display = 'none';
  document.getElementById('main-content').style.display = 'none';
}

// Inicialização e Listener de Auth
async function init() {
  const isRecovery = window.location.hash.includes('type=recovery');

  const { data: { session } } = await sbClient.auth.getSession();
  await handleAuthChange(session);

  if (isRecovery) {
    setTimeout(() => {
      openModal('modal-update-password');
    }, 800);
  }

  sbClient.auth.onAuthStateChange(async (_event, session) => {
    if (_event === 'PASSWORD_RECOVERY') {
      setTimeout(() => {
        openModal('modal-update-password');
      }, 800);
    }
    await handleAuthChange(session);
  });
}

async function handleAuthChange(session) {
  if (session) {
    currentUser = session.user;
    // loggedInPlayerId agora é calculado depois do fetchAllData, comparando
    // players.owner_id com o UUID da conta (ver enterAppWithTeam / finishEnteringApp).

    // Oculta login com fade
    const ls = document.getElementById('login-screen');
    ls.style.opacity = '0';
    ls.style.transition = 'opacity 0.5s';
    setTimeout(() => { ls.style.display = 'none'; }, 500);

    // Antes de entrar no app, verifica se o usuário já está em um time.
    // Se não estiver, mostra a tela de seleção/criação de time.
    await resolveTeamAndProceed();
  } else {
    currentUser = null; loggedInPlayerId = null; currentTeam = null; isCaptain = false;
    const ls = document.getElementById('login-screen');
    ls.style.display = 'flex';
    ls.style.opacity = '1';
    document.getElementById('team-select-screen').style.display = 'none';
    document.getElementById('team-badge').style.display = 'none';
    document.getElementById('main-header').style.display = 'none';
    document.getElementById('main-content').style.display = 'none';
  }
}

// =========================================
// SISTEMA DE TIMES
// =========================================

// Decide se o usuário entra direto no app (já tem time) ou precisa
// escolher/criar um time primeiro.
async function resolveTeamAndProceed() {
  let teamId = null;
  try {
    const { data } = await sbClient.from('profiles').select('team_id').eq('id', currentUser.id).maybeSingle();
    teamId = data?.team_id || null;
  } catch (err) {
    console.error('Erro ao checar time do usuário', err);
  }

  if (!teamId) return showTeamSelectScreen();

  const { data: team, error } = await sbClient.from('teams_public').select('*').eq('id', teamId).maybeSingle();
  if (error || !team) {
    // Time foi apagado (ex: capitão saiu e era o único membro) — volta pra seleção
    return showTeamSelectScreen();
  }
  await enterAppWithTeam(team);
}

async function showTeamSelectScreen() {
  document.getElementById('main-header').style.display = 'none';
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('team-badge').style.display = 'none';
  const screen = document.getElementById('team-select-screen');
  screen.style.display = 'flex';
  screen.style.opacity = '1';
  initParticles('team-select-particles');
  await loadTeamsList();
}

async function enterAppWithTeam(team) {
  currentTeam = team;
  isCaptain = !!(currentUser && team.captain_id === currentUser.id);

  document.getElementById('team-select-screen').style.display = 'none';
  document.getElementById('main-header').style.display = 'flex';
  document.getElementById('main-content').style.display = 'block';

  renderTeamBadge();
  toast('Sincronizando dados...', 'inf');
  await fetchAllData();

  const myCard = globalState.players.find(p => p.owner_id === currentUser.id);
  if (myCard) {
    updateHeader();
    nav('colecao');
  } else {
    await promptPlayerCardSetup();
  }
}

// Roda depois que a cartinha do usuário já existe (criada ou reivindicada).
async function finishEnteringApp() {
  await fetchAllData();
  updateHeader();
  nav('colecao');
}

// Decide se mostra o seletor "essa cartinha é sua?" ou cria uma nova direto.
async function promptPlayerCardSetup() {
  const { data: unclaimed, error } = await sbClient
    .from('players').select('*')
    .eq('team_id', currentTeam.id).is('owner_id', null);

  if (error) { console.error(error); return autoCreateMyCard(); }

  if (unclaimed && unclaimed.length > 0) {
    renderClaimCardModal(unclaimed);
    openModal('modal-claim-card');
  } else {
    await autoCreateMyCard();
  }
}

function renderClaimCardModal(list) {
  const grid = document.getElementById('claim-card-grid');
  grid.innerHTML = list.map(p => `
    <div class="team-card" style="cursor:pointer" onclick="claimCard('${p.id}')">
      <div class="team-card-av">${p.photo ? `<img src="${esc(p.photo)}">` : initials(p.name)}</div>
      <div class="team-card-name">${esc(p.name)}</div>
      <div class="team-card-meta">${p.apelido ? `"${esc(p.apelido)}"` : ''}</div>
      <button class="btn btn-gold team-card-enter" onclick="event.stopPropagation();claimCard('${p.id}')">Essa é
        minha</button>
    </div>
  `).join('');
}

async function claimCard(playerId) {
  closeModal('modal-claim-card');
  const { error } = await sbClient.rpc('claim_player_card', { p_player_id: playerId });
  if (error) {
    console.error(error);
    toast(translateTeamError(error.message), 'err');
    return promptPlayerCardSetup();
  }
  toast('Cartinha vinculada à sua conta — histórico preservado! 🎉', 'ok');
  await finishEnteringApp();
}

async function skipClaimCreateNew() {
  closeModal('modal-claim-card');
  await autoCreateMyCard();
}

async function autoCreateMyCard() {
  const { error } = await sbClient.rpc('create_player_card', { p_team_id: currentTeam.id });
  if (error) {
    console.error(error);
    toast('Erro ao criar sua cartinha: ' + translateTeamError(error.message), 'err');
  }
  await finishEnteringApp();
}

function teamInitials(name) { return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??'; }

function renderTeamBadge() {
  if (!currentTeam) return;
  const badge = document.getElementById('team-badge');
  badge.style.display = 'flex';
  document.getElementById('team-badge-av').innerHTML = currentTeam.photo ? `<img src="${esc(currentTeam.photo)}">` : teamInitials(currentTeam.name);
  document.getElementById('team-badge-name').textContent = currentTeam.name;
  document.getElementById('team-badge-role').textContent = isCaptain ? '👑 Capitão' : '';
}

// ---- Listagem / busca de times ----
async function loadTeamsList() {
  const grid = document.getElementById('team-grid');
  grid.innerHTML = `<div class="team-empty-state">Carregando times...</div>`;
  try {
    const { data, error } = await sbClient.from('teams_public').select('*').order('member_count', { ascending: false });
    if (error) throw error;
    teamsListCache = data || [];
  } catch (err) {
    console.error('Erro ao carregar times', err);
    teamsListCache = [];
    toast('Não foi possível carregar os times. Verifique se a migração SQL foi executada no Supabase.', 'err');
  }
  const search = document.getElementById('team-search');
  if (search) search.value = '';
  renderTeamGrid(teamsListCache);
}

function filterTeams() {
  const q = document.getElementById('team-search').value.trim().toLowerCase();
  const filtered = q ? teamsListCache.filter(t => t.name.toLowerCase().includes(q)) : teamsListCache;
  renderTeamGrid(filtered);
}

function renderTeamGrid(list) {
  const grid = document.getElementById('team-grid');
  if (!list.length) {
    grid.innerHTML = `<div class="team-empty-state">Nenhum time encontrado.<br>Que tal criar o seu?
      <button class="btn btn-gold btn-sm" onclick="openCreateTeamModal()">✨ Criar Time</button></div>`;
    return;
  }
  grid.innerHTML = list.map(t => `
    <div class="team-card">
      ${t.has_password ? `<span class="team-card-lock" title="Time protegido por senha">🔒</span>` : ''}
      <div class="team-card-av">${t.photo ? `<img src="${esc(t.photo)}">` : teamInitials(t.name)}</div>
      <div class="team-card-name">${esc(t.name)}</div>
      <div class="team-card-meta">${t.member_count} ${t.member_count === 1 ? 'membro' : 'membros'}${t.captain_name ? ' • Cap. ' + esc(t.captain_name) : ''}</div>
      <button class="btn btn-gold team-card-enter" onclick="attemptJoinTeam('${t.id}')">Entrar</button>
    </div>
  `).join('');
}

// ---- Criar time ----
function openCreateTeamModal() {
  document.getElementById('ct-name').value = '';
  document.getElementById('ct-has-password').checked = false;
  document.getElementById('ct-password').value = '';
  document.getElementById('ct-password-group').style.display = 'none';
  newTeamPhotoB64 = null;
  document.getElementById('ct-photo-preview').innerHTML = `<span id="ct-photo-placeholder" class="team-photo-placeholder">📷<span>Foto do time</span></span>`;
  openModal('modal-create-team');
}

function toggleCreatePasswordField() {
  const checked = document.getElementById('ct-has-password').checked;
  const group = document.getElementById('ct-password-group');
  group.style.display = checked ? 'flex' : 'none';
  group.style.flexDirection = 'column';
}

async function submitCreateTeam() {
  const name = document.getElementById('ct-name').value.trim();
  const hasPassword = document.getElementById('ct-has-password').checked;
  const password = document.getElementById('ct-password').value;

  if (!name || name.length < 2) { shakeInput('ct-name'); return toast('Digite o nome do time!', 'err'); }
  if (hasPassword && password.length < 4) { shakeInput('ct-password'); return toast('A senha deve ter ao menos 4 caracteres!', 'err'); }

  const btn = document.getElementById('btn-create-team');
  btn.disabled = true; btn.textContent = 'Criando...';

  const { data: teamId, error } = await sbClient.rpc('create_team', {
    p_name: name, p_photo: newTeamPhotoB64, p_password: hasPassword ? password : null
  });

  btn.disabled = false; btn.textContent = 'Criar Time';

  if (error) { console.error(error); return toast(translateTeamError(error.message), 'err'); }

  closeModal('modal-create-team');
  toast('Time criado! Você é o capitão 👑', 'ok');

  if (teamId) {
    document.getElementById('team-select-container').style.opacity = '0.5';
    await joinTeamRpc(teamId, hasPassword ? password : null);
  } else {
    await loadTeamsList();
  }
}

// ---- Entrar em um time ----
function attemptJoinTeam(teamId) {
  const team = teamsListCache.find(t => t.id === teamId);
  if (!team) return;
  if (team.has_password) {
    pendingJoinTeamId = teamId;
    document.getElementById('jp-team-name-label').textContent = `Digite a senha para entrar em "${team.name}".`;
    document.getElementById('jp-password').value = '';
    openModal('modal-join-password');
    setTimeout(() => document.getElementById('jp-password').focus(), 150);
  } else {
    joinTeamRpc(teamId, null);
  }
}

async function submitJoinPassword() {
  const pass = document.getElementById('jp-password').value;
  if (!pass) { shakeInput('jp-password'); return toast('Digite a senha!', 'err'); }
  await joinTeamRpc(pendingJoinTeamId, pass);
}

async function joinTeamRpc(teamId, password) {
  const btn = document.getElementById('btn-join-password');
  const wasFromModal = document.getElementById('modal-join-password').classList.contains('open');
  if (wasFromModal) { btn.disabled = true; btn.textContent = 'Entrando...'; }

  const { error } = await sbClient.rpc('join_team', { p_team_id: teamId, p_password: password });

  if (wasFromModal) { btn.disabled = false; btn.textContent = 'Entrar'; }

  if (error) { console.error(error); return toast(translateTeamError(error.message), 'err'); }

  closeModal('modal-join-password');
  pendingJoinTeamId = null;
  toast('Você entrou no time! 🎉', 'ok');

  const { data: team } = await sbClient.from('teams_public').select('*').eq('id', teamId).maybeSingle();
  if (team) await enterAppWithTeam(team);
}

// ---- Configurações do time ----
async function openTeamSettings() {
  if (!currentTeam) return;
  openModal('team-settings-modal');
  document.getElementById('team-settings-content').innerHTML = `<div class="empty">Carregando...</div>`;
  teamSettingsPhotoB64 = null;

  const [teamRes, membersRes] = await Promise.all([
    sbClient.from('teams_public').select('*').eq('id', currentTeam.id).maybeSingle(),
    sbClient.from('team_members_public').select('*').eq('team_id', currentTeam.id).order('joined_at')
  ]);

  if (teamRes.error || !teamRes.data) {
    document.getElementById('team-settings-content').innerHTML = `<div class="empty">Não foi possível carregar o time.</div>`;
    return;
  }

  currentTeam = teamRes.data;
  isCaptain = !!(currentUser && currentTeam.captain_id === currentUser.id);
  teamMembersCache = membersRes.data || [];
  renderTeamBadge();
  renderTeamSettingsContent();
}

function renderTeamSettingsContent() {
  const t = currentTeam;

  const membersHtml = teamMembersCache.map(m => {
    const isTeamCaptain = m.user_id === t.captain_id;
    const displayName = m.full_name || 'Sem nome';
    const safeName = esc(displayName).replace(/'/g, "\\'");
    return `
    <div class="team-member-row">
      <div class="team-member-av">${initials(displayName)}</div>
      <div class="team-member-name">${esc(displayName)}${isTeamCaptain ? '<span class="team-member-crown" title="Capitão">👑</span>' : ''}</div>
      ${(isCaptain && !isTeamCaptain) ? `<button class="team-member-transfer-btn" onclick="transferCaptain('${m.user_id}', '${safeName}')">Tornar Capitão</button>` : ''}
    </div>`;
  }).join('');

  const photoBlock = `
    <div class="team-settings-photo-row">
      <input type="file" id="ts-photo-input" accept="image/*" class="hidden-file" onchange="initCrop(event, 'TEAM_SETTINGS', 1)" ${isCaptain ? '' : 'disabled'} />
      <label for="ts-photo-input" class="team-photo-upload ${isCaptain ? 'editable' : ''}" id="ts-photo-preview" title="${isCaptain ? 'Trocar foto do time' : ''}">
        ${t.photo ? `<img src="${esc(t.photo)}">` : `<span class="team-photo-placeholder">${isCaptain ? '📷' : '🛡️'}<span>${isCaptain ? 'Trocar' : 'Time'}</span></span>`}
      </label>
      <div style="flex:1; min-width:0">
        <div class="team-settings-name-view" id="ts-name-view" style="display:${isCaptain ? 'none' : 'block'}">${esc(t.name)}</div>
        <input type="text" id="ts-name-input" class="input-box" value="${esc(t.name)}" maxlength="40" style="margin:0; display:${isCaptain ? 'block' : 'none'}" />
        <div class="team-settings-sub">Criado em ${new Date(t.created_at).toLocaleDateString('pt-BR')} • ${t.member_count} ${t.member_count === 1 ? 'membro' : 'membros'}</div>
      </div>
    </div>`;

  let passwordBlock;
  if (isCaptain) {
    passwordBlock = `
    <div class="team-settings-section">
      <div class="team-settings-section-title">Senha de acesso</div>
      <div class="team-pw-toggle-row">
        <label class="switch">
          <input type="checkbox" id="ts-has-password" ${t.has_password ? 'checked' : ''} onchange="toggleSettingsPasswordField()" />
          <span class="switch-slider"></span>
        </label>
        <div>
          <div class="team-pw-toggle-label">Proteger com senha</div>
          <div class="team-pw-toggle-sub">${t.has_password ? 'Time protegido. Deixe em branco para manter a senha atual.' : 'Só quem souber a senha consegue entrar no time'}</div>
        </div>
      </div>
      <div class="input-group" id="ts-password-group" style="display:${t.has_password ? 'flex' : 'none'}; flex-direction:column; margin-top:12px; margin-bottom:0">
        <label class="input-label" for="ts-password">${t.has_password ? 'Trocar senha (opcional)' : 'Senha do time'}</label>
        <input type="text" id="ts-password" class="input-box" placeholder="Mínimo 4 caracteres" maxlength="40" style="margin-bottom:0" />
      </div>
    </div>`;
  } else {
    passwordBlock = `
    <div class="team-settings-section">
      <div class="team-settings-section-title">Senha de acesso</div>
      <div class="team-readonly-note">${t.has_password ? '🔒 Este time é protegido por senha.' : '🔓 Este time está aberto — qualquer um pode entrar.'}</div>
    </div>`;
  }

  const membersBlock = `
    <div class="team-settings-section">
      <div class="team-settings-section-title">Membros (${teamMembersCache.length})</div>
      <div class="team-members-list">${membersHtml || '<div class="empty">Nenhum membro encontrado.</div>'}</div>
    </div>`;

  const saveBlock = isCaptain ? `
    <div class="team-settings-section">
      <button class="btn btn-gold btn-block" onclick="submitTeamSettings()">💾 Salvar Alterações</button>
    </div>` : '';

  const footerBlock = `
    <div class="team-settings-section">
      <button class="btn btn-ghost btn-block" onclick="switchTeam()">🔄 Trocar de Time</button>
    </div>`;

  document.getElementById('team-settings-content').innerHTML = photoBlock + passwordBlock + membersBlock + saveBlock + footerBlock;
}

function toggleSettingsPasswordField() {
  const checked = document.getElementById('ts-has-password').checked;
  document.getElementById('ts-password-group').style.display = checked ? 'flex' : 'none';
}

async function submitTeamSettings() {
  if (!isCaptain) return;
  const name = document.getElementById('ts-name-input').value.trim();
  const hasPasswordChecked = document.getElementById('ts-has-password').checked;
  const passwordField = document.getElementById('ts-password');
  const passwordVal = passwordField ? passwordField.value : '';

  if (!name || name.length < 2) { shakeInput('ts-name-input'); return toast('O nome do time precisa ter ao menos 2 caracteres!', 'err'); }
  if (hasPasswordChecked && !currentTeam.has_password && passwordVal.length < 4) {
    shakeInput('ts-password'); return toast('Defina uma senha com ao menos 4 caracteres!', 'err');
  }
  if (hasPasswordChecked && passwordVal && passwordVal.length < 4) {
    shakeInput('ts-password'); return toast('A senha deve ter ao menos 4 caracteres!', 'err');
  }

  const { error } = await sbClient.rpc('update_team_settings', {
    p_team_id: currentTeam.id,
    p_name: name,
    p_photo: teamSettingsPhotoB64,
    p_password: hasPasswordChecked ? (passwordVal || null) : null,
    p_remove_password: !hasPasswordChecked
  });

  if (error) { console.error(error); return toast(translateTeamError(error.message), 'err'); }

  toast('Configurações salvas! ✅', 'ok');
  teamSettingsPhotoB64 = null;

  const { data: team } = await sbClient.from('teams_public').select('*').eq('id', currentTeam.id).maybeSingle();
  if (team) { currentTeam = team; renderTeamBadge(); }
  renderTeamSettingsContent();
}

async function transferCaptain(newCaptainId, name) {
  if (!isCaptain) return;
  if (!confirm(`Transferir a capitania do time para ${name}? Você deixará de ser capitão.`)) return;

  const { error } = await sbClient.rpc('transfer_captain', { p_team_id: currentTeam.id, p_new_captain_id: newCaptainId });
  if (error) { console.error(error); return toast(translateTeamError(error.message), 'err'); }

  toast(`${name} agora é o capitão do time! 👑`, 'ok');

  const { data: team } = await sbClient.from('teams_public').select('*').eq('id', currentTeam.id).maybeSingle();
  if (team) {
    currentTeam = team;
    isCaptain = !!(currentUser && team.captain_id === currentUser.id);
    renderTeamBadge();
  }
  renderTeamSettingsContent();
}

async function switchTeam() {
  if (!confirm('Trocar de time? Você poderá entrar em outro time ou criar um novo.')) return;

  const { error } = await sbClient.rpc('leave_team');
  if (error) { console.error(error); return toast(translateTeamError(error.message), 'err'); }

  closeModal('team-settings-modal');
  currentTeam = null; isCaptain = false;
  toast('Você saiu do time.', 'inf');
  await showTeamSelectScreen();
}

// =========================================
// DATA FETCHING (SUPABASE)
// =========================================
async function fetchAllData() {
  if (!currentTeam) return;

  try {
    const [playersRes, evalsRes, mmRes, clipsRes, commRes] = await Promise.all([
      sbClient.from('players').select('*').eq('team_id', currentTeam.id),
      sbClient.from('evaluations').select('*').eq('team_id', currentTeam.id),
      sbClient.from('mata_mata_votes').select('*').eq('team_id', currentTeam.id),
      sbClient.from('clips').select('*').eq('team_id', currentTeam.id),
      sbClient.from('comments').select('*').eq('team_id', currentTeam.id)
    ]);

    globalState.players = (playersRes.data || []).map(dbP => ({
      id: dbP.player_key, // Mantemos o ID como player_key para compatibilidade no front-end
      db_id: dbP.id, // UUID real
      owner_id: dbP.owner_id, // conta dona desta cartinha (null = sem dono ainda)
      name: dbP.name,
      apelido: dbP.apelido,
      role: dbP.role,
      team: dbP.team,
      photo: dbP.photo,
      card_color: dbP.card_color,
      signature_weapon: dbP.signature_weapon
    }));

    globalState.evaluations = (evalsRes.data || []).map(e => {
      [...ARSENAL_ATTRS, ...MAP_POOL].forEach(m => { 
        if (e[m.key] > 5) e[m.key] = Math.round((e[m.key] / 20) * 2) / 2; 
      });
      return {
        ...e,
        evaluatorId: getPlayerKeyByAuthId(e.evaluator_id),
        playerId: getPlayerKeyByPlayersId(e.player_id),
      };
    });

    globalState.mataMataVotes = (mmRes.data || []).map(m => ({
      ...m, evaluatorId: getPlayerKeyByAuthId(m.evaluator_id)
    }));

    globalState.clips = (clipsRes.data || []).map(c => ({
      // clips.player_id é auth.users.id (quem postou), não players.id
      ...c, playerId: getPlayerKeyByAuthId(c.player_id), mediaType: c.media_type, mediaUrl: c.media_url
    }));

    globalState.comments = (commRes.data || []).map(cm => ({
      ...cm, playerId: getPlayerKeyByAuthId(cm.player_id), clipId: cm.clip_id
    }));

    // Recalcula quem é o jogador logado dentro deste time (via owner_id),
    // já que times diferentes têm cartinhas diferentes para a mesma conta.
    const myPlayer = globalState.players.find(p => p.owner_id === currentUser?.id);
    loggedInPlayerId = myPlayer ? myPlayer.id : null;
  } catch (err) {
    console.error("Erro ao puxar dados", err);
    toast("Erro ao carregar dados do time.", "err");
  }
}

// player_id em `evaluations` e `id` em `players` referenciam a tabela
// `players` (players.id / "db_id"). Use esta função para traduzir esse tipo de UUID.
function getPlayerKeyByPlayersId(uuid) {
  const p = globalState.players.find(x => x.db_id === uuid);
  return p ? p.id : null;
}

// evaluator_id em `evaluations`/`mata_mata_votes` e player_id em `clips`/`comments`
// guardam o UUID de auth.users (quem está logado). Como cada cartinha (players)
// agora sabe diretamente quem é a sua conta dona (owner_id), não precisamos mais
// passar pela tabela `profiles` para essa tradução.
function getPlayerByAuthId(uuid) {
  if (!uuid) return null;
  return globalState.players.find(p => p.owner_id === uuid) || null;
}
function getPlayerKeyByAuthId(uuid) {
  const p = getPlayerByAuthId(uuid);
  return p ? p.id : null;
}

function getPlayerUUIDByKey(key) {
  const p = globalState.players.find(x => x.id === key);
  return p ? p.db_id : null;
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
document.querySelectorAll('.overlay').forEach(el => el.addEventListener('click', e => {
  if (e.target === el) {
    if (el.id === 'modal-update-password') return; // Obriga a alterar a senha
    el.classList.remove('open');
  }
}));

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
    const r = parseInt(hex.slice(1, 3), 16) || 48;
    const g = parseInt(hex.slice(3, 5), 16) || 64;
    const b = parseInt(hex.slice(5, 7), 16) || 80;
    const rgb = `${r}, ${g}, ${b}`;
    colorStyle = `style="
      --card-main: ${hex};
      --card-glow-strong: rgba(${rgb}, 0.8);
    "`;
  }

  let psHtml = '';
  if (playstyles && playstyles.length > 0 && size === 'big') {
    psHtml = `<div class="card-playstyles">` + playstyles.map(ps => {
      const isNeg = ps.bonus < 0;
      return `<div class="ps-badge ${isNeg ? 'neg' : 'pos'}" title="${esc(ps.q)}">${ps.emoji}</div>`;
    }).join('') + `</div>`;
  }

  return `<div class="fifa-card ${tc}" ${colorStyle}><div class="card-bg"></div>
    <div class="card-photo" ${photoBg}>${placeholder}</div>
    <div class="card-deco top"></div><div class="card-deco bot"></div>
    <div class="card-top-left"><div class="card-ovr">${overall !== null ? overall : '??'}</div><div class="card-pos">${esc(ROLE_DISPLAY_NAMES[player.role] || player.role)}</div><div class="card-team-sm">${esc(player.team)}</div></div>
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
  }).sort((a, b) => {
    if (b.ov !== a.ov) return b.ov - a.ov;
    return a.p.name.localeCompare(b.p.name);
  });

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

  let tableRows = evals.map(ev => `<tr><td>${esc(globalState.players.find(p => p.id === ev.evaluatorId)?.name || ev.evaluatorId)}</td>${ATTRS.map(a => `<td class="vm">${ev[a.key] ?? '—'}</td>`).join('')}<td class="vm" style="font-size:15px">${Math.round(calcBaseOverall(ev, player.role))}</td></tr>`).join('');
  let avgRow = avg ? `<tr style="background:rgba(255,184,0,0.08)"><td style="font-weight:700;color:var(--accent)">MÉDIA</td>${ATTRS.map(a => `<td class="vm" style="color:var(--accent)">${avg[a.key]}</td>`).join('')}<td class="vm" style="color:var(--accent);font-size:15px">${overall}</td></tr>` : '';

  let colorPicker = '';
  let rolePicker = '';
  let nameEditor = '';
  
  const pstylesObj = getPlayerPlaystyles(player.id);
  let playstylesBlock = '';
  if (pstylesObj.styles.length > 0) {
    playstylesBlock = `
    <div style="margin-top:20px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.05)">
      <div style="font-size:12px; color:var(--text-sec); margin-bottom:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Playstyles (Mata-Mata)</div>
      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        ${pstylesObj.styles.map(ps => {
          const isNeg = ps.bonus < 0;
          const bg = isNeg ? 'rgba(229,57,53,0.1)' : 'rgba(255,184,0,0.1)';
          const color = isNeg ? 'var(--red)' : 'var(--accent)';
          const border = isNeg ? 'rgba(229,57,53,0.3)' : 'rgba(255,184,0,0.3)';
          return `<div style="display:inline-flex; align-items:center; gap:6px; background:${bg}; color:${color}; border:1px solid ${border}; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:600; letter-spacing:0.5px; box-shadow:0 2px 8px rgba(0,0,0,0.2);">
            <span style="font-size:14px;">${ps.emoji}</span>
            <span>${esc(ps.short || ps.q)}</span>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }
  
  if (playerId === loggedInPlayerId) {
    nameEditor = `
    <div style="margin-top:20px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.05)">
      <div style="font-size:12px; color:var(--text-sec); margin-bottom:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Nome e Apelido</div>
      <div style="display:flex; flex-direction:column; gap:8px; max-width:260px">
        <input type="text" id="edit-name-${playerId}" class="input-box" value="${esc(player.name)}" maxlength="30" placeholder="Nome" style="margin-bottom:0" />
        <input type="text" id="edit-apelido-${playerId}" class="input-box" value="${esc(player.apelido || '')}" maxlength="30" placeholder="Apelido" style="margin-bottom:0" />
        <select id="edit-signature-${playerId}" class="input-box" style="margin-bottom:0; background:var(--bg-elevated); color:var(--text); border:1px solid var(--border)">
          <option value="">Arma Assinatura (Nenhuma)</option>
          ${CS2_WEAPONS.map(w => `<option value="${esc(w)}" ${player.signature_weapon === w ? 'selected' : ''}>${esc(w)}</option>`).join('')}
        </select>
        <button class="btn btn-dark btn-sm" style="margin:0" onclick="saveNameApelido('${playerId}')">💾 Salvar Perfil</button>
      </div>
    </div>`;
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

  if (loggedInPlayerId) {
    rolePicker = `
    <div style="margin-top:20px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.05)">
      <div style="font-size:12px; color:var(--text-sec); margin-bottom:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Função Tática (Role)</div>
      <select class="role-select" onchange="setPlayerRole('${playerId}', this.value)" style="background:var(--bg-elevated); color:white; border:1px solid rgba(255,255,255,0.1); padding:8px 12px; border-radius:6px; font-family:'Rajdhani',sans-serif; font-weight:600; width:100%; max-width:220px; cursor:pointer;">
        ${['IGL', 'Entry Fragger', 'AWPer', 'Suporte', 'Lurker', 'Anchor'].map(r => `<option value="${r}" ${player.role === r ? 'selected' : ''}>${r}</option>`).join('')}
      </select>
      <div style="font-size:11px; color:var(--text-muted); margin-top:8px;">Altere a função de ${esc(player.name)}. O overall recalculará automaticamente.</div>
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
        ${playstylesBlock}
        ${(function() {
          if (!avg) return '';
          let bestArsenal = null; let bestArsenalVal = -1;
          ARSENAL_ATTRS.forEach(a => { if (avg[a.key] > bestArsenalVal) { bestArsenalVal = avg[a.key]; bestArsenal = a; } });
          
          const arsenalRows = ARSENAL_ATTRS.map(a => {
            const fillPct = (avg[a.key] / 5) * 100;
            return `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:14px;"><span style="color:var(--text);">${a.short}</span><span style="display:flex; gap:8px; align-items:center;"><div class="star-component static" style="--fill: ${fillPct}%;"><div class="stars-spacer">★★★★★</div><div class="stars-bg">★★★★★</div><div class="stars-fill">★★★★★</div></div></span></div>`;
          }).join('');
          
          let arsenalBlock = `<div style="margin-top:20px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.05)"><div style="font-size:12px; color:var(--text-sec); margin-bottom:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Perfil de Jogo</div><div style="background:var(--bg-elevated); border:1px solid var(--border); border-radius:var(--radius); padding:16px; margin-bottom:12px;"><div style="color:var(--text-sec); font-size:12px; text-transform:uppercase; font-weight:700; margin-bottom:12px;">🔫 Arsenal</div>${arsenalRows}${bestArsenal ? `<div style="margin-top:12px; padding-top:12px; border-top:1px dashed var(--border); color:var(--accent); font-weight:700; font-size:13px; text-transform:uppercase;">🔫 Especialidade: ${bestArsenal.short} — ${bestArsenalVal.toFixed(1)}/5</div>` : ''}${player.signature_weapon ? `<div style="margin-top:8px; color:var(--text); font-weight:600; font-size:13px;">⭐ Arma Preferida: <span style="color:var(--accent);">${esc(player.signature_weapon)}</span></div>` : ''}</div>`;

          let bestMap = null; let bestMapVal = -1;
          const mapRows = MAP_POOL.map(a => {
            const val5 = avg[a.key] || 0;
            if (val5 > bestMapVal) { bestMapVal = val5; bestMap = a; }
            const fillPct = (val5 / 5) * 100;
            return { html: `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:14px;"><span style="display:flex; align-items:center; color:var(--text);"><div class="map-icon ${a.key}" style="transform:scale(0.8); margin-right:4px;"></div>${a.short}</span><span style="display:flex; gap:8px; align-items:center;"><div class="star-component static" style="--fill: ${fillPct}%;"><div class="stars-spacer">★★★★★</div><div class="stars-bg">★★★★★</div><div class="stars-fill">★★★★★</div></div></span></div>`, val: val5 };
          }).sort((a,b) => b.val - a.val).map(x => x.html).join('');
          
          let mapPoolBlock = `<div style="background:var(--bg-elevated); border:1px solid var(--border); border-radius:var(--radius); padding:16px;"><div style="color:var(--text-sec); font-size:12px; text-transform:uppercase; font-weight:700; margin-bottom:12px;">🗺️ Map Pool</div>${mapRows}${bestMap ? `<div style="margin-top:12px; padding-top:12px; border-top:1px dashed var(--border); color:var(--accent); font-weight:700; font-size:13px; text-transform:uppercase;">🏆 Melhor Mapa: ${bestMap.short} — ${bestMapVal.toFixed(1)}/5</div>` : ''}</div></div>`;
          return arsenalBlock + mapPoolBlock;
        })()}
        ${colorPicker}
        ${rolePicker}
        ${nameEditor}
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

async function setPlayerRole(playerId, newRole) {
  const p = globalState.players.find(x => x.id === playerId);
  if (!p) return;

  // Update state
  p.role = newRole;

  // Optimistic UI updates
  renderCollection();
  openDetailModal(playerId);
  updateHeader();

  // Try saving to DB
  try {
    const { error } = await sbClient.from('players').update({ role: newRole }).eq('id', p.db_id);
    if (error) {
      console.error(error);
      toast('Função não salva.', 'err');
    } else {
      toast('Função atualizada!', 'ok');
    }
  } catch (err) {
    console.error(err);
  }
}

async function saveNameApelido(playerId) {
  const p = globalState.players.find(x => x.id === playerId);
  if (!p) return;
  const nameInput = document.getElementById('edit-name-' + playerId);
  const apelidoInput = document.getElementById('edit-apelido-' + playerId);
  const sigInput = document.getElementById('edit-signature-' + playerId);
  const newName = nameInput.value.trim();
  const newApelido = apelidoInput.value.trim();
  const newSig = sigInput ? sigInput.value : p.signature_weapon;

  if (!newName) { shakeInput('edit-name-' + playerId); return toast('O nome não pode ficar em branco!', 'err'); }

  p.name = newName; p.apelido = newApelido; p.signature_weapon = newSig;
  renderCollection(); openDetailModal(playerId); updateHeader();

  try {
    const { error } = await sbClient.from('players').update({ name: newName, apelido: newApelido, signature_weapon: newSig }).eq('id', p.db_id);
    if (error) { console.error(error); toast('Nome/apelido não salvo.', 'err'); }
    else toast('Cartinha atualizada!', 'ok');
  } catch (err) { console.error(err); }
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
  } else if (cropTargetId === 'TEAM_NEW') {
    // Foto do time — modal de criação (ainda não salvo, aguarda "Criar Time")
    newTeamPhotoB64 = b64;
    const preview = document.getElementById('ct-photo-preview');
    if (preview) preview.innerHTML = `<img src="${b64}">`;
  } else if (cropTargetId === 'TEAM_SETTINGS') {
    // Foto do time — modal de configurações (aguarda "Salvar Alterações")
    teamSettingsPhotoB64 = b64;
    const preview = document.getElementById('ts-photo-preview');
    if (preview) preview.innerHTML = `<img src="${b64}">`;
    toast('Foto pronta! Clique em "Salvar Alterações" para confirmar.', 'inf');
  } else {
    // Player photo — toda cartinha agora vem do banco, então db_id sempre existe
    const p = globalState.players.find(x => x.id === cropTargetId);
    if (p && p.db_id) {
      toast('Salvando foto no banco...', 'inf');
      p.photo = b64;
      await sbClient.from('players').update({ photo: b64 }).eq('id', p.db_id);
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
  
  if (Object.keys(evalState.ratings).length > 0) {
    nav('eval-view');
    renderEvalStep();
    return;
  }

  const draftKey = `evalDraft_${currentUser.id}_${currentTeam.id}`;
  const draft = localStorage.getItem(draftKey);
  if (draft) {
    try {
      const parsed = JSON.parse(draft);
      if (parsed && parsed.players && parsed.players.length > 0) {
        evalState = parsed;
        toast('Retomando rascunho salvo...', 'inf');
        nav('eval-view');
        renderEvalStep();
        return;
      }
    } catch(e) {}
  }

  evalState = { step: 1, players: globalState.players.filter(p => p.id !== loggedInPlayerId), ratings: {}, mataMata: {} };

  // Pré-carrega avaliações anteriores se existirem (para permitir edição)
  const myEvals = globalState.evaluations.filter(e => e.evaluatorId === loggedInPlayerId);
  const myMM = globalState.mataMataVotes.find(v => v.evaluator_id === currentUser.id);

  evalState.players.forEach(p => {
    evalState.ratings[p.id] = {};
    const existing = myEvals.find(e => e.playerId === p.id);
    ATTRS.forEach(a => {
      evalState.ratings[p.id][a.key] = existing && existing[a.key] !== undefined ? existing[a.key] : 50;
    });
    ARSENAL_ATTRS.forEach(a => {
      let val = existing && existing[a.key] !== undefined ? existing[a.key] : 0;
      if (val > 5) val = Math.round((val / 20) * 2) / 2;
      evalState.ratings[p.id][a.key] = val;
    });
    MAP_POOL.forEach(a => {
      let val = existing && existing[a.key] !== undefined ? existing[a.key] : 0;
      if (val > 5) val = Math.round((val / 20) * 2) / 2;
      evalState.ratings[p.id][a.key] = val;
    });
  });

  if (myMM && myMM.votes) {
    evalState.mataMata = myMM.votes;
  }

  renderEvalStep();
}

function renderEvalStep() {
  saveEvalDraft();
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
    const arsenalRows = ARSENAL_ATTRS.map(a => {
      const v = ratings[a.key] || 0;
      const hitZones = Array.from({length:5}, (_, i) => `<div class="hit-zone" onclick="onStarClick('${player.id}','${a.key}', ${i+1})"></div>`).join('');
      return `
        <div class="attr-row" style="align-items:center; display:flex; justify-content:space-between; padding: 12px 16px;">
          <div class="attr-top" style="margin-bottom:0; width:auto;">
            <span class="attr-icon">${a.icon}</span>
            <span class="attr-lbl">${a.short}</span>
          </div>
          <div class="star-component" id="stars-${player.id}-${a.key}" style="--fill: ${(v / 5) * 100}%;">
            <div class="stars-spacer">★★★★★</div>
            <div class="stars-bg">★★★★★</div>
            <div class="stars-fill">★★★★★</div>
            <div class="stars-hitbox">${hitZones}</div>
          </div>
        </div>
      `;
    }).join('');

    const mapRows = MAP_POOL.map(a => {
      const v = ratings[a.key] || 0;
      const hitZones = Array.from({length:5}, (_, i) => `<div class="hit-zone" onclick="onStarClick('${player.id}','${a.key}', ${i+1})"></div>`).join('');
      return `
        <div class="attr-row" style="align-items:center; display:flex; justify-content:space-between; padding: 12px 16px;">
          <div class="attr-top" style="margin-bottom:0; width:auto;">
            <div class="map-icon ${a.key}"></div>
            <span class="attr-lbl">${a.short}</span>
          </div>
          <div class="star-component" id="stars-${player.id}-${a.key}" style="--fill: ${(v / 5) * 100}%;">
            <div class="stars-spacer">★★★★★</div>
            <div class="stars-bg">★★★★★</div>
            <div class="stars-fill">★★★★★</div>
            <div class="stars-hitbox">${hitZones}</div>
          </div>
        </div>
      `;
    }).join('');

    ev.innerHTML = `<div class="step-progress">${dots}<span class="step-label">PASSO ${stepN} DE ${totalSteps}</span></div><div class="wizard-header"><div class="wizard-avatar">${player.photo ? `<img src="${esc(player.photo)}">` : initials(player.name)}</div><div class="wizard-info"><div class="wizard-name">${esc(player.name)}</div><div class="wizard-sub">"${esc(player.apelido)}"</div></div><div class="live-ovr-wrap"><div class="live-ovr-lbl">Base OVR</div><div class="live-ovr-num" id="live-ovr">${Math.round(calcBaseOverall(ratings, player.role))}</div></div></div><div class="panel"><div class="panel-label">Avalie: ${esc(player.name)}</div>${attrRows}<div class="panel-label" style="margin-top:24px;">🔫 Arsenal</div><div class="panel-sub" style="font-size:12px;color:var(--text-sec);margin-bottom:12px;">Avalie a habilidade (1 a 5 estrelas)</div>${arsenalRows}<div class="panel-label" style="margin-top:24px;">🗺️ Map Pool</div><div class="panel-sub" style="font-size:12px;color:var(--text-sec);margin-bottom:12px;">Avalie o conhecimento de cada mapa (1 a 5 estrelas)</div>${mapRows}<div style="margin-top:20px;display:flex;gap:12px">${stepN > 1 ? `<button class="btn btn-ghost" onclick="evalState.step--;renderEvalStep()">← Voltar</button>` : ''}<button class="btn btn-gold" onclick="evalState.step++;renderEvalStep()">${stepN < totalSteps ? 'Próximo →' : 'Mata-Mata →'}</button></div></div>`;
    ATTRS.forEach(a => updateSliderBg(a.key, ratings[a.key]));
}
function onStarClick(pId, k, index) {
  const currentVal = evalState.ratings[pId][k] || 0;
  let newVal = index;
  
  if (currentVal === index) {
    newVal = index - 0.5;
  } else if (currentVal === index - 0.5) {
    newVal = index;
  }

  evalState.ratings[pId][k] = newVal;
  saveEvalDraft();
  const container = document.getElementById('stars-' + pId + '-' + k);
  if (container) container.style.setProperty('--fill', (newVal / 5) * 100 + '%');
}
function onSlider(pId, k) {
  const v = parseInt(document.getElementById('sl-' + k).value);
  evalState.ratings[pId][k] = v; document.getElementById('av-' + k).textContent = v; updateSliderBg(k, v);
  saveEvalDraft();
  const player = globalState.players.find(p => p.id === pId);
  document.getElementById('live-ovr').textContent = Math.round(calcBaseOverall(evalState.ratings[pId], player?.role));
}
function adjustSlider(pId, k, delta) {
  const slider = document.getElementById('sl-' + k);
  const newVal = Math.max(0, Math.min(99, parseInt(slider.value) + delta));
  slider.value = newVal;
  evalState.ratings[pId][k] = newVal;
  document.getElementById('av-' + k).textContent = newVal;
  updateSliderBg(k, newVal);
  saveEvalDraft();
  const player = globalState.players.find(p => p.id === pId);
  document.getElementById('live-ovr').textContent = Math.round(calcBaseOverall(evalState.ratings[pId], player?.role));
}
function updateSliderBg(k, v) { const pct = (v / 99) * 100; document.getElementById('sl-' + k).style.background = `linear-gradient(90deg, var(--accent) ${pct}%, var(--bg-elevated) ${pct}%)`; }

function renderMataMataStep(totalSteps) {
  const ev = document.getElementById('eval-view');
  saveEvalDraft();
  const dots = Array.from({ length: totalSteps }, (_, i) => `<div class="step-dot ${i < totalSteps - 1 ? 'done' : 'current'}"></div>`).join('');
  const qHtml = MM_QUESTIONS.map(q => `<div class="mm-question"><div class="mm-q-label"><span class="mm-q-emoji">${q.emoji}</span> ${esc(q.q)}</div><div class="mm-options">${globalState.players.map(p => `<div class="mm-option"><input type="radio" name="mm-${q.id}" id="mm-${q.id}-${p.id}" ${evalState.mataMata[q.id] === p.id ? 'checked' : ''} onchange="evalState.mataMata['${q.id}']='${p.id}'; saveEvalDraft();" /><label for="mm-${q.id}-${p.id}">${esc(p.name)}</label></div>`).join('')}</div></div>`).join('');
  ev.innerHTML = `<div class="step-progress">${dots}<span class="step-label">MATA-MATA</span></div><div class="panel"><div class="mm-section-title">⚔️ Perguntas Diretas</div>${qHtml}<div style="margin-top:24px;display:flex;gap:12px"><button class="btn btn-gold" onclick="submitEvaluation()" id="btn-submit-eval">🏆 Enviar Avaliação</button><button class="btn btn-ghost" onclick="evalState.step--;renderEvalStep()">← Voltar</button></div></div>`;
}

async function submitEvaluation() {
  if (MM_QUESTIONS.some(q => !evalState.mataMata[q.id])) { toast('Responda todas as perguntas do Mata-Mata.', 'err'); return; }
  const btn = document.getElementById('btn-submit-eval'); btn.disabled = true; btn.textContent = 'Enviando...';

  try {
    const evalInserts = evalState.players.map(p => ({
      evaluator_id: currentUser.id, // auth.users.id
      player_id: getPlayerUUIDByKey(p.id),
      team_id: currentTeam.id,
      ...evalState.ratings[p.id]
    })).filter(x => x.player_id); // garante q p achou o uuid

    if (evalInserts.length > 0) {
      // Supabase nao tem UPSERT massivo facil se a constraint (evaluator_id, player_id) for acionada
      // Vamos tentar dar upsert/delete manual ou apenas insert.
      // Escopado por team_id: avaliações feitas em OUTROS times não são tocadas.
      await sbClient.from('evaluations').delete().eq('evaluator_id', currentUser.id).eq('team_id', currentTeam.id);
      await sbClient.from('evaluations').insert(evalInserts);
    }

    await sbClient.from('mata_mata_votes').delete().eq('evaluator_id', currentUser.id).eq('team_id', currentTeam.id);
    await sbClient.from('mata_mata_votes').insert({ evaluator_id: currentUser.id, team_id: currentTeam.id, votes: evalState.mataMata });

    await fetchAllData();
    clearEvalDraft();
    toast('Avaliação salva! 🏆', 'ok');
    evalState = { step: 1, players: [], ratings: {}, mataMata: {} };
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
    team_id: currentTeam.id,
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
  await sbClient.from('comments').insert({ clip_id: clipId, player_id: currentUser.id, team_id: currentTeam.id, text: txt });
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
        <p class="admin-card-desc">Apaga as avaliações <strong>deste time</strong>. As cartinhas voltarão a aparecer como <strong>bloqueadas</strong>. Outros times não são afetados.</p>
        <div class="admin-stats"><span class="admin-count">${evCount}</span> avaliações neste time</div>
        <button class="btn btn-red" onclick="adminConfirmReset('evaluations')">Apagar Avaliações</button>
      </div>

      <div class="admin-card admin-danger">
        <div class="admin-card-head">
          <span class="admin-card-icon">🗑️</span>
          <span class="admin-card-title">Zerar Mata-Mata</span>
        </div>
        <p class="admin-card-desc">Apaga os votos do Mata-Mata <strong>deste time</strong>. Todos poderão <strong>votar novamente</strong>. Outros times não são afetados.</p>
        <div class="admin-stats"><span class="admin-count">${mmCount}</span> votos neste time</div>
        <button class="btn btn-red" onclick="adminConfirmReset('matamata')">Apagar Votos</button>
      </div>

      <div class="admin-card admin-danger admin-card-full">
        <div class="admin-card-head">
          <span class="admin-card-icon">💥</span>
          <span class="admin-card-title">Zerar Tudo</span>
        </div>
        <p class="admin-card-desc">Apaga <strong>todas as avaliações</strong> e <strong>todos os votos</strong> do Mata-Mata <strong>deste time</strong>. Outros times não são afetados.</p>
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
      title: '⚠️ Apagar avaliações deste time',
      desc: `Todas as avaliações do time "${currentTeam?.name || ''}" serão apagadas permanentemente. As cartinhas voltarão a aparecer como bloqueadas. Times não afetados. Esta ação NÃO pode ser desfeita.`
    },
    matamata: {
      title: '⚠️ Apagar votos deste time',
      desc: `Todos os votos do Mata-Mata do time "${currentTeam?.name || ''}" serão apagados permanentemente. Todos poderão votar novamente. Times não afetados. Esta ação NÃO pode ser desfeita.`
    },
    all: {
      title: '💥 Zerar este time',
      desc: `TODAS as avaliações E TODOS os votos do Mata-Mata do time "${currentTeam?.name || ''}" serão apagados permanentemente. Outros times não são afetados. Esta ação NÃO pode ser desfeita.`
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
      const { error } = await sbClient.from('evaluations').delete().eq('team_id', currentTeam.id);
      if (error) throw error;
    }
    if (adminResetTarget === 'matamata' || adminResetTarget === 'all') {
      const { error } = await sbClient.from('mata_mata_votes').delete().eq('team_id', currentTeam.id);
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

  function saveEvalDraft() {
    if (!currentTeam || !currentUser || !evalState || !evalState.players || evalState.players.length === 0) return;
    const draftKey = `evalDraft_${currentUser.id}_${currentTeam.id}`;
    localStorage.setItem(draftKey, JSON.stringify(evalState));
  }

  function clearEvalDraft() {
    if (!currentTeam || !currentUser) return;
    const draftKey = `evalDraft_${currentUser.id}_${currentTeam.id}`;
    localStorage.removeItem(draftKey);
  }

});




