// ============================================================
// APP.JS - Logic chính cho Đại Chiến Bàn Nhậu
// ============================================================

// ─── State ───────────────────────────────────────────────
const state = {
  players: [],          // { name, active }
  soundEnabled: true,
  audioCtx: null,
};

// ─── Audio Engine (Web Audio API) ────────────────────────
function getAudioCtx() {
  if (!state.audioCtx) {
    state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return state.audioCtx;
}

function playTone(freq, type, duration, volume = 0.3, delay = 0) {
  if (!state.soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.05);
  } catch (e) {}
}

function playClick() {
  playTone(800, 'square', 0.04, 0.15);
  playTone(600, 'square', 0.04, 0.1, 0.03);
}

function playDiceShake() {
  if (!state.soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    for (let i = 0; i < 6; i++) {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < data.length; j++) data[j] = (Math.random() * 2 - 1) * 0.4;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.08);
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start(ctx.currentTime + i * 0.08);
    }
  } catch (e) {}
}

function playCelebration() {
  if (!state.soundEnabled) return;
  const notes = [523, 659, 784, 1047, 784, 1047, 1319];
  notes.forEach((f, i) => playTone(f, 'sine', 0.18, 0.25, i * 0.12));
}

function playBombTick(fast = false) {
  if (!state.soundEnabled) return;
  playTone(1200, 'square', 0.05, 0.2);
  if (fast) setTimeout(() => playTone(800, 'square', 0.05, 0.15), 60);
}

function playBombExplode() {
  if (!state.soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1.0, ctx.currentTime);
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    // Low boom
    playTone(60, 'sine', 0.6, 0.8);
    playTone(100, 'sine', 0.4, 0.6, 0.05);
  } catch (e) {}
}

function playSpinTick() {
  playTone(900, 'triangle', 0.03, 0.1);
}

// ─── LocalStorage ─────────────────────────────────────────
function savePlayers() {
  localStorage.setItem('dcbn_players', JSON.stringify(state.players));
}

function loadPlayers() {
  try {
    const saved = localStorage.getItem('dcbn_players');
    if (saved) state.players = JSON.parse(saved);
  } catch (e) {
    state.players = [];
  }
}

// ─── Player Management ────────────────────────────────────
function getActivePlayers() {
  return state.players.filter(p => p.active);
}

function renderPlayerList() {
  const container = document.getElementById('playerList');
  if (!container) return;
  container.innerHTML = '';
  if (state.players.length === 0) {
    container.innerHTML = '<p class="text-center text-slate-500 py-4 col-span-2">Chưa có người chơi nào. Hãy thêm vào nhé!</p>';
    return;
  }
  state.players.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.className = `player-chip flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
      p.active
        ? 'border-orange-500 bg-orange-500/20 text-orange-300'
        : 'border-slate-600 bg-slate-700/50 text-slate-500'
    }`;
    btn.innerHTML = `
      <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${p.active ? 'bg-orange-500 text-white' : 'bg-slate-600 text-slate-400'}">${i + 1}</span>
      <span class="flex-1 text-left truncate">${escHtml(p.name)}</span>
      <span class="text-xs">${p.active ? '✓' : '✗'}</span>
    `;
    btn.onclick = () => togglePlayer(i);
    container.appendChild(btn);
  });
  document.getElementById('playerCount').textContent = `${getActivePlayers().length}/${state.players.length} người đang chơi`;
}

function togglePlayer(idx) {
  state.players[idx].active = !state.players[idx].active;
  savePlayers();
  renderPlayerList();
  playClick();
}

function addPlayersFromTextarea() {
  const ta = document.getElementById('bulkInput');
  if (!ta) return;
  const raw = ta.value.trim();
  if (!raw) return;
  const names = raw.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
  if (names.length === 0) { showToast('Hãy nhập ít nhất 1 tên!'); return; }
  state.players = names.map(name => ({ name, active: true }));
  ta.value = '';
  savePlayers();
  renderPlayerList();
  showToast(`✅ Đã tạo danh sách ${names.length} người chơi!`);
  playCelebration();
}

function addSamplePlayers() {
  state.players = DATA.sampleNames.map(name => ({ name, active: true }));
  savePlayers();
  renderPlayerList();
  showToast('✅ Đã tạo 16 người mẫu!');
  playCelebration();
}

function clearPlayers() {
  if (!confirm('Xóa toàn bộ danh sách người chơi?')) return;
  state.players = [];
  savePlayers();
  renderPlayerList();
}

// ─── Helpers ──────────────────────────────────────────────
function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function randItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function showToast(msg, duration = 2500) {
  let t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('opacity-0', 'translate-y-4');
  t.classList.add('opacity-100', 'translate-y-0');
  setTimeout(() => {
    t.classList.add('opacity-0', 'translate-y-4');
    t.classList.remove('opacity-100', 'translate-y-0');
  }, duration);
}

function showModal(html) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  content.innerHTML = html;
  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('hidden');
  overlay.classList.remove('flex');
}

// ─────────────────────────────────────────────────────────
// TRÒ 1: VÒNG QUAY NHÂN PHẨM
// ─────────────────────────────────────────────────────────
let spinCanvas, spinCtx;
let spinAngle = 0;
let spinVelocity = 0;
let spinAnimId = null;
let isSpinning = false;

const COLORS = [
  '#F97316', '#EC4899', '#8B5CF6', '#06B6D4', '#10B981',
  '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#84CC16',
  '#F472B6', '#FB923C', '#A78BFA', '#34D399', '#FCD34D', '#60A5FA'
];

function initSpinWheel() {
  spinCanvas = document.getElementById('spinWheel');
  if (!spinCanvas) return;
  spinCtx = spinCanvas.getContext('2d');
  resizeCanvas();
  drawWheel();
}

function resizeCanvas() {
  const container = spinCanvas.parentElement;
  const size = Math.min(container.clientWidth - 16, 380);
  spinCanvas.width = size;
  spinCanvas.height = size;
}

function drawWheel() {
  if (!spinCtx) return;
  const players = getActivePlayers();
  const n = players.length;
  const cx = spinCanvas.width / 2;
  const cy = spinCanvas.height / 2;
  const r = cx - 8;

  spinCtx.clearRect(0, 0, spinCanvas.width, spinCanvas.height);

  if (n === 0) {
    spinCtx.fillStyle = '#1E293B';
    spinCtx.beginPath();
    spinCtx.arc(cx, cy, r, 0, Math.PI * 2);
    spinCtx.fill();
    spinCtx.fillStyle = '#94A3B8';
    spinCtx.font = `${Math.min(16, r / 5)}px sans-serif`;
    spinCtx.textAlign = 'center';
    spinCtx.fillText('Chưa có người chơi', cx, cy);
    return;
  }

  const sliceAngle = (Math.PI * 2) / n;

  players.forEach((p, i) => {
    const start = spinAngle + i * sliceAngle;
    const end = start + sliceAngle;

    // Slice
    spinCtx.beginPath();
    spinCtx.moveTo(cx, cy);
    spinCtx.arc(cx, cy, r, start, end);
    spinCtx.closePath();
    spinCtx.fillStyle = COLORS[i % COLORS.length];
    spinCtx.fill();
    spinCtx.strokeStyle = '#0B1120';
    spinCtx.lineWidth = 2;
    spinCtx.stroke();

    // Text
    spinCtx.save();
    spinCtx.translate(cx, cy);
    spinCtx.rotate(start + sliceAngle / 2);
    spinCtx.textAlign = 'right';

    const fontSize = Math.max(9, Math.min(14, r / (n * 0.55)));
    spinCtx.font = `bold ${fontSize}px sans-serif`;
    spinCtx.fillStyle = '#fff';
    spinCtx.shadowColor = 'rgba(0,0,0,0.8)';
    spinCtx.shadowBlur = 3;

    // Truncate name
    const maxLen = Math.max(4, Math.floor(16 / Math.sqrt(n)));
    let name = p.name;
    if (name.length > maxLen) name = name.slice(0, maxLen - 1) + '…';

    spinCtx.fillText(name, r - 10, fontSize / 3);
    spinCtx.restore();
  });

  // Center circle
  const grad = spinCtx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.18);
  grad.addColorStop(0, '#1E293B');
  grad.addColorStop(1, '#0B1120');
  spinCtx.beginPath();
  spinCtx.arc(cx, cy, r * 0.16, 0, Math.PI * 2);
  spinCtx.fillStyle = grad;
  spinCtx.fill();
  spinCtx.strokeStyle = '#F97316';
  spinCtx.lineWidth = 3;
  spinCtx.stroke();

  // Arrow pointer (top)
  spinCtx.save();
  spinCtx.translate(cx, 0);
  spinCtx.beginPath();
  spinCtx.moveTo(0, r * 0.08);
  spinCtx.lineTo(-14, -4);
  spinCtx.lineTo(14, -4);
  spinCtx.closePath();
  spinCtx.fillStyle = '#F97316';
  spinCtx.fill();
  spinCtx.restore();
}

function spinWheel() {
  if (isSpinning) return;
  const players = getActivePlayers();
  if (players.length < 2) {
    showToast('⚠️ Cần ít nhất 2 người chơi đang hoạt động!');
    return;
  }
  isSpinning = true;
  spinVelocity = 0.25 + Math.random() * 0.2;
  let tickCount = 0;

  function animate() {
    spinAngle += spinVelocity;
    spinVelocity *= 0.985;

    // Tick sound
    const prevSlice = Math.floor((spinAngle - spinVelocity) / (Math.PI * 2 / players.length));
    const currSlice = Math.floor(spinAngle / (Math.PI * 2 / players.length));
    if (currSlice !== prevSlice) {
      playSpinTick();
    }

    drawWheel();

    if (spinVelocity > 0.003) {
      spinAnimId = requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      onSpinEnd();
    }
  }

  cancelAnimationFrame(spinAnimId);
  animate();
}

function onSpinEnd() {
  const players = getActivePlayers();
  const n = players.length;
  const sliceAngle = (Math.PI * 2) / n;
  // Arrow is at top (angle = -PI/2 from positive x-axis)
  // Normalize spinAngle
  const normalized = ((spinAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  // The slice at top: pointer at -PI/2, offset by spinAngle
  const pointerAngle = (Math.PI * 2 - normalized + Math.PI * 2) % (Math.PI * 2);
  const idx = Math.floor(pointerAngle / sliceAngle) % n;
  const winner = players[idx];

  playCelebration();

  const challenge = randItem(DATA.spins);

  showModal(`
    <div class="text-center space-y-4">
      <div class="text-5xl mb-2">🎉</div>
      <h2 class="text-2xl font-black text-orange-400">Trúng thưởng!</h2>
      <div class="text-3xl font-black text-white py-2 px-4 bg-orange-500/20 rounded-2xl border-2 border-orange-500">
        ${escHtml(winner.name)}
      </div>
      <div class="bg-slate-700 rounded-2xl p-4 text-left space-y-2" id="spinChallengeBox">
        <div class="text-xs font-bold text-pink-400 uppercase tracking-wider">⚡ Thử thách</div>
        <div class="font-bold text-orange-300 text-base" id="spinChallengeTitleEl">${escHtml(challenge.title)}</div>
        <div class="text-slate-200 text-sm leading-relaxed" id="spinChallengeDescEl">${escHtml(challenge.desc)}</div>
      </div>
      <div class="flex gap-3 pt-2">
        <button onclick="closeModal()" class="flex-1 py-3 rounded-xl bg-slate-600 text-white font-bold active:scale-95">↩ Quay lại</button>
        <button onclick="changeSpinChallenge()" class="flex-1 py-3 rounded-xl bg-pink-500 text-white font-bold active:scale-95">🔀 Đổi thử thách</button>
      </div>
    </div>
  `);
}

function changeSpinChallenge() {
  const c = randItem(DATA.spins);
  const titleEl = document.getElementById('spinChallengeTitleEl');
  const descEl = document.getElementById('spinChallengeDescEl');
  if (titleEl) titleEl.textContent = c.title;
  if (descEl) descEl.textContent = c.desc;
  playClick();
}

// ─────────────────────────────────────────────────────────
// TRÒ 2: AI LÀ NGƯỜI...
// ─────────────────────────────────────────────────────────
let whoIsQuestion = null;
let whoIsCountdown = null;

function pickWhoIsQuestion() {
  whoIsQuestion = randItem(DATA.whoIs);
  const qEl = document.getElementById('whoIsQuestion');
  const btnArea = document.getElementById('whoIsBtn');
  if (qEl) {
    qEl.textContent = whoIsQuestion;
    qEl.classList.remove('text-slate-500');
    qEl.classList.add('text-white');
  }
  if (btnArea) btnArea.classList.remove('hidden');
  const resultEl = document.getElementById('whoIsResult');
  if (resultEl) {
    resultEl.classList.add('hidden');
    resultEl.textContent = '';
  }
  playClick();
}

function startWhoIsCountdown() {
  const players = getActivePlayers();
  if (players.length === 0) { showToast('⚠️ Cần có người chơi!'); return; }

  const countEl = document.getElementById('whoIsCount');
  const btnStart = document.getElementById('whoIsStartBtn');
  const resultEl = document.getElementById('whoIsResult');

  if (whoIsCountdown) {
    clearInterval(whoIsCountdown);
    whoIsCountdown = null;
  }

  if (btnStart) btnStart.disabled = true;
  if (resultEl) { resultEl.classList.add('hidden'); }

  let count = 3;
  if (countEl) {
    countEl.textContent = count;
    countEl.classList.remove('hidden', 'scale-0');
    countEl.classList.add('scale-100');
  }

  playTone(440, 'sine', 0.3, 0.4);

  whoIsCountdown = setInterval(() => {
    count--;
    if (count > 0) {
      if (countEl) {
        countEl.classList.remove('scale-100');
        setTimeout(() => {
          countEl.textContent = count;
          countEl.classList.add('scale-100');
        }, 100);
      }
      playTone(440, 'sine', 0.3, 0.4);
    } else {
      clearInterval(whoIsCountdown);
      whoIsCountdown = null;
      if (countEl) {
        countEl.classList.remove('scale-100');
        setTimeout(() => {
          countEl.textContent = '👆 CHỈ!';
          countEl.classList.add('scale-100');
          countEl.style.fontSize = '2rem';
        }, 100);
      }
      playCelebration();
      setTimeout(() => {
        if (countEl) countEl.classList.add('hidden');
        if (resultEl) {
          resultEl.textContent = '🏆 Ai bị chỉ nhiều nhất thì người đó UỐNG! 🍺';
          resultEl.classList.remove('hidden');
        }
        if (btnStart) btnStart.disabled = false;
      }, 2000);
    }
  }, 1000);
}

// ─────────────────────────────────────────────────────────
// TRÒ 3: THẬT HAY THÁCH
// ─────────────────────────────────────────────────────────
let todPlayer = null;
let todMode = null;    // 'truth' | 'dare'
let todLevel = null;   // 'mild' | 'spicy'
let todRolling = false;
let todRollTimer = null;

function pickToDPlayer() {
  const players = getActivePlayers();
  if (players.length === 0) { showToast('⚠️ Cần có người chơi!'); return; }

  if (todRolling) return;
  todRolling = true;

  const nameEl = document.getElementById('todPlayerName');
  const selectionEl = document.getElementById('todSelection');
  const cardArea = document.getElementById('todCardArea');

  if (selectionEl) selectionEl.classList.add('hidden');
  if (cardArea) cardArea.classList.add('hidden');

  let rollCount = 0;
  const totalRolls = 15;
  const intervalBase = 80;

  function roll() {
    const p = randItem(players);
    if (nameEl) nameEl.textContent = p.name;
    playTone(600 + Math.random() * 400, 'square', 0.04, 0.1);
    rollCount++;
    const delay = intervalBase + (rollCount / totalRolls) * 250;
    if (rollCount < totalRolls) {
      todRollTimer = setTimeout(roll, delay);
    } else {
      todPlayer = randItem(players);
      if (nameEl) nameEl.textContent = todPlayer.name;
      todRolling = false;
      playCelebration();
      if (selectionEl) selectionEl.classList.remove('hidden');
      if (cardArea) cardArea.classList.add('hidden');
    }
  }
  roll();
}

function selectToDMode(mode, level) {
  if (!todPlayer) { showToast('Hãy chọn người trước!'); return; }
  todMode = mode;
  todLevel = level;

  const pool = DATA[mode][level];
  const content = randItem(pool);

  const cardArea = document.getElementById('todCardArea');
  const cardInner = document.getElementById('todCardInner');
  const cardFront = document.getElementById('todCardFront');
  const cardBack = document.getElementById('todCardBack');

  if (!cardArea || !cardInner) return;

  const modeLabel = mode === 'truth' ? '🤔 THẬT' : '🔥 THÁCH';
  const levelLabel = level === 'mild' ? '☀️ Nhẹ nhàng' : '🔥 Cháy phố';
  const modeColor = mode === 'truth' ? 'text-cyan-400' : 'text-pink-400';
  const bgColor = mode === 'truth' ? 'from-cyan-900/50 to-slate-800' : 'from-pink-900/50 to-slate-800';

  if (cardFront) {
    cardFront.className = `tod-card-face tod-card-front absolute inset-0 rounded-2xl flex items-center justify-center bg-gradient-to-br ${bgColor} border-2 ${mode === 'truth' ? 'border-cyan-500' : 'border-pink-500'}`;
    cardFront.innerHTML = `
      <div class="text-center space-y-2">
        <div class="text-4xl">${mode === 'truth' ? '🤔' : '🔥'}</div>
        <div class="text-2xl font-black ${modeColor}">${modeLabel}</div>
        <div class="text-sm text-slate-400">${levelLabel}</div>
        <div class="text-xs text-slate-500 mt-2">Chạm để lật bài</div>
      </div>`;
  }
  if (cardBack) {
    cardBack.innerHTML = `
      <div class="p-5 space-y-3">
        <div class="flex items-center gap-2 text-xs font-bold ${modeColor} uppercase tracking-wider">
          <span>${modeLabel}</span><span class="text-slate-500">•</span><span class="text-slate-400">${levelLabel}</span>
        </div>
        <p class="text-white text-base font-semibold leading-relaxed">${escHtml(content)}</p>
        <div class="pt-2">
          <span class="inline-block text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded-full">Dành cho: ${escHtml(todPlayer.name)}</span>
        </div>
      </div>`;
  }

  cardArea.classList.remove('hidden');
  // Reset flip
  cardInner.classList.remove('flipped');
  setTimeout(() => cardInner.classList.add('flipped'), 50);
  playClick();
}

function todGiveUp() {
  showModal(`
    <div class="text-center space-y-4">
      <div class="text-5xl">😅</div>
      <h2 class="text-xl font-black text-orange-400">Chịu thua!</h2>
      <p class="text-slate-300">
        <span class="text-white font-bold">${todPlayer ? escHtml(todPlayer.name) : 'Người chơi'}</span> không dám thực hiện thử thách.<br>
        <span class="text-pink-400 font-bold text-lg">Phạt uống 1 ly! 🍺</span>
      </p>
      <button onclick="closeModal()" class="w-full py-3 rounded-xl bg-orange-500 text-white font-bold active:scale-95">OK, uống đi!</button>
    </div>
  `);
  playTone(220, 'sawtooth', 0.5, 0.3);
}

// ─────────────────────────────────────────────────────────
// TRÒ 4: LẮC XÚC XẮC
// ─────────────────────────────────────────────────────────
let diceCount = 2;
let diceValues = [];
let diceShaking = false;

function setDiceCount(n) {
  diceCount = n;
  document.querySelectorAll('.dice-count-btn').forEach((b, i) => {
    b.classList.toggle('active-dice-btn', i + 1 === n);
  });
  playClick();
}

function rollDice() {
  if (diceShaking) return;
  diceShaking = true;
  playDiceShake();

  const diceContainer = document.getElementById('diceContainer');
  const diceTip = document.getElementById('diceTip');
  if (diceTip) diceTip.textContent = '';

  // Animate
  diceValues = [];
  let frame = 0;
  const totalFrames = 20;

  const interval = setInterval(() => {
    const temp = Array.from({ length: diceCount }, () => Math.ceil(Math.random() * 6));
    renderDice(temp, true);
    frame++;
    if (frame >= totalFrames) {
      clearInterval(interval);
      diceValues = Array.from({ length: diceCount }, () => Math.ceil(Math.random() * 6));
      renderDice(diceValues, false);
      showDiceTip();
      diceShaking = false;
      playCelebration();
    }
  }, 60);
}

function renderDice(values, shaking) {
  const container = document.getElementById('diceContainer');
  if (!container) return;
  container.innerHTML = '';
  values.forEach(val => {
    const die = document.createElement('div');
    die.className = `dice-face ${shaking ? 'dice-shake' : ''}`;
    die.setAttribute('data-val', val);
    die.innerHTML = getDiceDots(val);
    container.appendChild(die);
  });

  const total = values.reduce((a, b) => a + b, 0);
  const totalEl = document.getElementById('diceTotal');
  if (totalEl) totalEl.textContent = values.length > 0 ? `Tổng: ${total}` : '';
}

function getDiceDots(n) {
  const positions = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
  };
  const dots = positions[n] || [];
  return `<svg viewBox="0 0 100 100" class="w-full h-full">${dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="currentColor"/>`).join('')}</svg>`;
}

function showDiceTip() {
  const tipEl = document.getElementById('diceTip');
  if (!tipEl || diceValues.length === 0) return;
  const total = diceValues.reduce((a, b) => a + b, 0);
  const max = diceCount * 6;
  const min = diceCount;

  // Check for pairs/triples/etc
  const freq = {};
  diceValues.forEach(v => freq[v] = (freq[v] || 0) + 1);
  const maxFreq = Math.max(...Object.values(freq));

  let tip = '';
  if (diceValues.length >= 2 && maxFreq === diceValues.length) {
    if (diceValues.length === 2) tip = '🎯 Đôi! Nhân phẩm cực mạnh – Chỉ định 1 người uống ngay!';
    else if (diceValues.length === 3) tip = '🔥 Bộ ba! Quyền lực tối thượng – Chọn 3 người uống cùng bạn!';
    else tip = '👑 Tứ quý! Bạn là chủ bàn hôm nay – Cả mâm uống theo lệnh bạn!';
  } else if (total === min) {
    tip = '😬 Điểm thấp nhất có thể... Tự uống đi thôi, số đen hôm nay!';
  } else if (total === max) {
    tip = '🚀 Điểm tối đa! Huyền thoại của bàn nhậu – Chọn ai uống tùy ý!';
  } else if (total >= max * 0.75) {
    tip = '💪 Điểm cao! Bạn được quyền ra 1 lệnh cho người bất kỳ trong mâm.';
  } else if (total <= min + (max - min) * 0.25) {
    tip = '😅 Điểm thấp... Uống nào, không có gì để bàn thêm cả!';
  } else {
    tip = '👍 Điểm trung bình – Uống ngang nhau, ai muốn thì cụng thêm!';
  }

  tipEl.textContent = tip;
  tipEl.classList.remove('hidden');
}

// Shake detection
function setupShakeDetector() {
  if (!window.DeviceMotionEvent) return;
  let lastShake = 0;
  let lastAcc = { x: 0, y: 0, z: 0 };

  const handler = (e) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const delta = Math.abs(acc.x - lastAcc.x) + Math.abs(acc.y - lastAcc.y) + Math.abs(acc.z - lastAcc.z);
    lastAcc = { x: acc.x, y: acc.y, z: acc.z };
    if (delta > 25 && Date.now() - lastShake > 1000) {
      lastShake = Date.now();
      // Check if dice tab is active
      const diceSection = document.getElementById('section-dice');
      if (diceSection && !diceSection.classList.contains('hidden')) {
        rollDice();
      }
    }
  };

  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    // iOS 13+
    document.getElementById('requestMotionBtn')?.classList.remove('hidden');
  } else {
    window.addEventListener('devicemotion', handler, { passive: true });
  }

  document.getElementById('requestMotionBtn')?.addEventListener('click', () => {
    DeviceMotionEvent.requestPermission().then(result => {
      if (result === 'granted') {
        window.addEventListener('devicemotion', handler, { passive: true });
        document.getElementById('requestMotionBtn')?.classList.add('hidden');
        showToast('✅ Đã bật cảm biến lắc!');
      }
    });
  });
}

// ─────────────────────────────────────────────────────────
// TRÒ 5: QUẢ BOM HẸN GIỜ
// ─────────────────────────────────────────────────────────
let bombTimer = null;
let bombEndTime = 0;
let bombTicking = false;
let bombTickInterval = null;
let bombFlashInterval = null;

function pickBombTopic() {
  const topic = randItem(DATA.bombTopics);
  const topicEl = document.getElementById('bombTopic');
  if (topicEl) {
    topicEl.textContent = topic;
    topicEl.classList.remove('text-slate-500');
    topicEl.classList.add('text-white');
  }
  const statusEl = document.getElementById('bombStatus');
  if (statusEl) statusEl.textContent = 'Nhấn BẮT ĐẦU khi cả mâm sẵn sàng!';
  stopBomb(false);
  playClick();
}

function startBomb() {
  if (bombTicking) return;
  const topicEl = document.getElementById('bombTopic');
  if (!topicEl || topicEl.classList.contains('text-slate-500')) {
    showToast('⚠️ Hãy chọn chủ đề trước!');
    return;
  }

  bombTicking = true;
  const duration = (20 + Math.floor(Math.random() * 26)) * 1000; // 20-45s
  bombEndTime = Date.now() + duration;

  const statusEl = document.getElementById('bombStatus');
  const timerEl = document.getElementById('bombTimerDisplay');
  const bombVisual = document.getElementById('bombVisual');
  const startBtn = document.getElementById('bombStartBtn');
  const stopBtn = document.getElementById('bombStopBtn');

  if (startBtn) startBtn.classList.add('hidden');
  if (stopBtn) stopBtn.classList.remove('hidden');

  let tickSpeed = 1200;

  function tick() {
    const remaining = bombEndTime - Date.now();
    if (remaining <= 0) {
      explodeBomb();
      return;
    }

    // Update tick speed (faster as time goes on)
    const progress = 1 - remaining / duration;
    tickSpeed = Math.max(300, 1200 - progress * 900);

    playBombTick(progress > 0.6);

    // Flash
    if (bombVisual) {
      bombVisual.classList.add('bomb-flash');
      setTimeout(() => bombVisual?.classList.remove('bomb-flash'), 150);
    }

    if (statusEl) {
      const dots = ['.', '..', '...'][Math.floor(Date.now() / 400) % 3];
      statusEl.textContent = `💣 Bom đang nổ${dots} Chuyền nhanh lên!`;
    }

    clearTimeout(bombTimer);
    bombTimer = setTimeout(tick, tickSpeed);
  }

  tick();
}

function explodeBomb() {
  bombTicking = false;
  clearTimeout(bombTimer);

  playBombExplode();

  const statusEl = document.getElementById('bombStatus');
  const bombVisual = document.getElementById('bombVisual');
  const startBtn = document.getElementById('bombStartBtn');
  const stopBtn = document.getElementById('bombStopBtn');

  if (statusEl) {
    statusEl.innerHTML = '<span class="text-red-400 font-black text-xl animate-pulse">💥 BOM NỔ! Người đang cầm điện thoại UỐNG! 🍺</span>';
  }

  if (bombVisual) {
    bombVisual.classList.add('bomb-explode');
    setTimeout(() => bombVisual?.classList.remove('bomb-explode'), 1000);
  }

  // Flash screen red
  const flashEl = document.getElementById('bombFlash');
  if (flashEl) {
    flashEl.style.opacity = '0.7';
    setTimeout(() => { if (flashEl) flashEl.style.opacity = '0'; }, 600);
  }

  if (startBtn) startBtn.classList.remove('hidden');
  if (stopBtn) stopBtn.classList.add('hidden');
}

function stopBomb(withToast = true) {
  bombTicking = false;
  clearTimeout(bombTimer);

  const startBtn = document.getElementById('bombStartBtn');
  const stopBtn = document.getElementById('bombStopBtn');
  const statusEl = document.getElementById('bombStatus');

  if (startBtn) startBtn.classList.remove('hidden');
  if (stopBtn) stopBtn.classList.add('hidden');
  if (statusEl && withToast) statusEl.textContent = 'Nhấn BẮT ĐẦU khi cả mâm sẵn sàng!';
}

// ─────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────
const SECTIONS = ['players', 'spin', 'whois', 'tod', 'dice', 'bomb'];

function showSection(id) {
  SECTIONS.forEach(s => {
    const el = document.getElementById(`section-${s}`);
    if (el) el.classList.toggle('hidden', s !== id);
  });

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('nav-active', btn.dataset.section === id);
  });

  // Init section-specific stuff
  if (id === 'spin') {
    setTimeout(initSpinWheel, 50);
  }
  if (id === 'players') {
    renderPlayerList();
  }

  // Stop bomb if leaving bomb section
  if (id !== 'bomb') stopBomb(false);

  playClick();
}

// ─────────────────────────────────────────────────────────
// SOUND TOGGLE
// ─────────────────────────────────────────────────────────
function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  const btn = document.getElementById('soundBtn');
  if (btn) btn.textContent = state.soundEnabled ? '🔊' : '🔇';
  if (state.soundEnabled) playClick();
}

// ─────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadPlayers();
  renderPlayerList();
  showSection('players');
  setupShakeDetector();

  // Initial dice display
  setDiceCount(2);
  renderDice([], false);

  // ToD card flip
  const cardInner = document.getElementById('todCardInner');
  if (cardInner) {
    cardInner.addEventListener('click', () => {
      cardInner.classList.toggle('flipped');
      playClick();
    });
  }

  // Modal close on backdrop click
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  // Resize spin wheel on orientation change
  window.addEventListener('resize', () => {
    if (!document.getElementById('section-spin')?.classList.contains('hidden')) {
      resizeCanvas();
      drawWheel();
    }
  });

  console.log('🍺 Đại Chiến Bàn Nhậu - Ready to party!');
});
