// ============================================================
// APP.JS - Đại Chiến Bàn Nhậu (Desert Art Deco Mobile Edition)
// ============================================================

// ─── State ───────────────────────────────────────────────
const state = {
  players: [],          // { name, active, weight, shieldTurns, cooldownTurns }
  soundEnabled: true,
  audioCtx: null,
};

// ─── Audio Engine (Web Audio API - Không cần mp3 ngoài) ────
function getAudioCtx() {
  if (!state.audioCtx) {
    state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return state.audioCtx;
}

function playTone(freq, type, duration, volume = 0.25, delay = 0) {
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
  playTone(850, 'sine', 0.03, 0.1);
  playTone(1200, 'sine', 0.025, 0.07, 0.02);
}

function playCelebration() {
  if (!state.soundEnabled) return;
  const notes = [523, 659, 784, 1047, 784, 1047, 1319];
  notes.forEach((f, i) => playTone(f, 'triangle', 0.16, 0.2, i * 0.11));
}

function playBombTick(fast = false) {
  if (!state.soundEnabled) return;
  playTone(1050, 'square', 0.035, 0.15);
  if (fast) setTimeout(() => playTone(850, 'square', 0.035, 0.12), 50);
}

function playBombExplode() {
  if (!state.soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.75, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.9, ctx.currentTime);
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    playTone(55, 'sine', 0.6, 0.7);
    playTone(95, 'sine', 0.35, 0.5, 0.05);
  } catch (e) {}
}

function playSpinTick() {
  playTone(950, 'triangle', 0.02, 0.07);
}

// ─── LocalStorage ─────────────────────────────────────────
function savePlayers() {
  localStorage.setItem('dcbn_players', JSON.stringify(state.players));
}

function loadPlayers() {
  try {
    const saved = localStorage.getItem('dcbn_players');
    if (saved) {
      state.players = JSON.parse(saved);
    }
  } catch (e) {
    state.players = [];
  }
  if (!state.players || state.players.length === 0) {
    state.players = DATA.sampleNames.map(name => ({
      name,
      active: true,
      weight: 1,
      shieldTurns: name.toLowerCase() === 'nam ké' ? 10 : 0,
      cooldownTurns: 0
    }));
    savePlayers();
  } else {
    state.players.forEach(p => {
      if (p.weight === undefined) p.weight = 1;
      if (p.shieldTurns === undefined) {
        p.shieldTurns = p.name.toLowerCase() === 'nam ké' ? 10 : 0;
      }
      if (p.cooldownTurns === undefined) {
        p.cooldownTurns = 0;
      }
    });
  }
}

// ─── Player Management, Shield & 2-Round Cooldown Mechanics ──
function getActivePlayers() {
  return state.players.filter(p => p.active);
}

function getAvatarChar(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const last = parts[parts.length - 1];
  return (last[0] || name[0]).toUpperCase();
}

// Lấy danh sách những người có thể bị trúng (loại trừ: người có khiên bảo kê >0 HOẶC đang trong 2 round nghỉ >0)
function getEligiblePlayers() {
  const active = getActivePlayers();
  // 1. Lọc người không có khiên và không trong 2 round hồi chiêu
  let eligible = active.filter(p => (!p.shieldTurns || p.shieldTurns <= 0) && (!p.cooldownTurns || p.cooldownTurns <= 0));
  
  // 2. Fallback nếu số người bị loại quá nhiều dẫn đến danh sách trống (ví dụ bàn chỉ có 2-3 người chơi)
  if (eligible.length === 0) {
    eligible = active.filter(p => !p.shieldTurns || p.shieldTurns <= 0);
  }
  return eligible.length > 0 ? eligible : active;
}

// Chọn người ngẫu nhiên theo trọng số (1x, 2x, 3x)
function pickWeightedWinner(list) {
  if (!list || list.length === 0) return null;
  const totalWeight = list.reduce((sum, p) => sum + (p.weight || 1), 0);
  let random = Math.random() * totalWeight;
  for (const p of list) {
    random -= (p.weight || 1);
    if (random <= 0) return p;
  }
  return list[list.length - 1];
}

// Xử lý sau khi kết thúc 1 round: Người vừa trúng nghỉ 2 round tiếp theo + Giảm khiên bảo kê
function processRoundEnd(winner) {
  if (!winner) return;

  // Người vừa trúng nghỉ 2 round tiếp theo để đảm bảo công bằng!
  winner.cooldownTurns = 2;

  // Giảm lượt cooldown và khiên của những người khác
  state.players.forEach(p => {
    if (p !== winner) {
      if (p.cooldownTurns && p.cooldownTurns > 0) {
        p.cooldownTurns--;
      }
      // Giảm khiên bảo vệ nếu có (hoàn toàn âm thầm, không hiển thị toast làm lộ)
      if (p.shieldTurns && p.shieldTurns > 0) {
        p.shieldTurns--;
      }
    }
  });

  savePlayers();
  renderHomePlayerGrid();
  renderModalPlayerList();
  if (spinCanvas) drawWheel();
}

// Bật/tắt hoặc cài đặt khiên né lượt
function setPlayerShield(name, turns) {
  const p = state.players.find(x => x.name.toLowerCase() === name.toLowerCase());
  if (p) {
    p.shieldTurns = parseInt(turns, 10) || 0;
    savePlayers();
    renderHomePlayerGrid();
    renderModalPlayerList();
    showToast(`✅ Đã lưu cài đặt thành công!`);
  }
}

function removePlayerShield(name) {
  const p = state.players.find(x => x.name.toLowerCase() === name.toLowerCase());
  if (p) {
    p.shieldTurns = 0;
    savePlayers();
    renderHomePlayerGrid();
    renderModalPlayerList();
    showToast(`Đã tắt bảo kê cho ${p.name}`);
  }
}

// Chạm để đổi tỷ lệ trúng: 1x ➔ 2x ➔ 3x ➔ 1x
function togglePlayerWeight(idx) {
  const p = state.players[idx];
  if (!p) return;
  const current = p.weight || 1;
  p.weight = current === 1 ? 2 : current === 2 ? 3 : 1;
  savePlayers();
  renderHomePlayerGrid();
  renderModalPlayerList();
  playClick();
  showToast(`⚡ Tỷ lệ trúng của ${p.name}: ${p.weight}x`);
}

// Render danh sách thành viên trên TRANG CHỦ
function renderHomePlayerGrid() {
  const container = document.getElementById('homePlayerGrid');
  const badge = document.getElementById('homeMemberBadge');
  if (!container) return;

  const activeCount = getActivePlayers().length;
  const totalCount = state.players.length;

  if (badge) {
    badge.textContent = `${activeCount}/${totalCount} Sẵn sàng`;
    badge.className = `text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
      activeCount > 0
        ? 'border-[#00D9FF] bg-[#E7FAFF] text-[#0080FF]'
        : 'border-red-300 bg-red-50 text-red-600'
    }`;
  }

  container.innerHTML = '';

  if (state.players.length === 0) {
    container.innerHTML = `
      <div class="col-span-2 text-center py-4 text-xs text-slate-400">
        Chưa có thành viên nào. Hãy dán 16 tên hoặc bấm nút "16 Mẫu"!
      </div>`;
    return;
  }

  state.players.forEach((p, idx) => {
    const card = document.createElement('div');
    const char = getAvatarChar(p.name);
    const borderStyle = p.active
      ? 'border-[#D8C49D] bg-[#FFFDF9] text-[#10233D] shadow-sm'
      : 'border-slate-200 bg-slate-100 text-slate-400 opacity-60';

    const avatarStyle = p.active
      ? 'bg-[#C65D3B] text-white'
      : 'bg-slate-300 text-slate-500';

    const hasShield = p.shieldTurns && p.shieldTurns > 0;
    const hasCooldown = p.cooldownTurns && p.cooldownTurns > 0;
    const weight = p.weight || 1;

    card.className = `flex items-center justify-between p-2 rounded-xl border transition-all ${borderStyle}`;
    card.innerHTML = `
      <button type="button" onclick="togglePlayer(${idx})" class="flex items-center gap-2 flex-1 min-w-0 text-left">
        <div class="w-8 h-8 rounded-full ${avatarStyle} flex items-center justify-center font-clash font-bold text-xs shrink-0 shadow-sm relative">
          ${char}
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-clash font-bold text-xs truncate ${p.active ? 'text-[#10233D]' : 'text-slate-400 line-through'}">
            ${escHtml(p.name)}
          </div>
          <div class="text-[10px] flex items-center gap-1">
            ${p.active ? '<span class="text-[#18C9A6] font-semibold">● Đang chơi</span>' : '<span class="text-slate-400">○ Tạm vắng</span>'}
          </div>
        </div>
      </button>

      <!-- Nút chỉnh tỷ lệ trúng 1x / 2x / 3x -->
      <button type="button" onclick="togglePlayerWeight(${idx})" title="Chỉnh tỷ lệ trúng (1x, 2x, 3x)"
        class="ml-1 px-1.5 py-0.5 rounded-lg border text-[10px] font-clash font-extrabold ${weight > 1 ? 'bg-[#C65D3B] text-white border-[#C65D3B]' : 'bg-[#FAF7F0] text-[#756856] border-[#D8C49D]'} active:scale-90">
        ${weight}x
      </button>
    `;
    container.appendChild(card);
  });
}

function togglePlayer(idx) {
  state.players[idx].active = !state.players[idx].active;
  savePlayers();
  renderHomePlayerGrid();
  renderModalPlayerList();
  if (spinCanvas) drawWheel();
  playClick();
}

function activateAllPlayers() {
  state.players.forEach(p => p.active = true);
  savePlayers();
  renderHomePlayerGrid();
  renderModalPlayerList();
  if (spinCanvas) drawWheel();
  showToast('✅ Đã bật tất cả người chơi!');
  playCelebration();
}

function addPlayersFromHomeTextarea() {
  const ta = document.getElementById('homeBulkInput');
  if (!ta) return;
  const raw = ta.value.trim();
  if (!raw) return;
  const names = raw.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
  if (names.length === 0) { showToast('Hãy nhập ít nhất 1 tên!'); return; }
  state.players = names.map(name => ({
    name,
    active: true,
    weight: 1,
    shieldTurns: name.toLowerCase() === 'nam ké' ? 10 : 0,
    cooldownTurns: 0
  }));
  ta.value = '';
  savePlayers();
  renderHomePlayerGrid();
  renderModalPlayerList();
  if (spinCanvas) drawWheel();
  showToast(`✅ Đã lưu ${names.length} người chơi!`);
  playCelebration();
}

function addSamplePlayers() {
  state.players = DATA.sampleNames.map(name => ({
    name,
    active: true,
    weight: 1,
    shieldTurns: name.toLowerCase() === 'nam ké' ? 10 : 0,
    cooldownTurns: 0
  }));
  savePlayers();
  renderHomePlayerGrid();
  renderModalPlayerList();
  if (spinCanvas) drawWheel();
  showToast('✅ Đã nạp 16 người mẫu!');
  playCelebration();
}

function clearPlayers() {
  if (!confirm('Xóa toàn bộ danh sách người chơi?')) return;
  state.players = [];
  savePlayers();
  renderHomePlayerGrid();
  renderModalPlayerList();
  if (spinCanvas) drawWheel();
}

// ─── Modal Quản Lý & Cài Đặt Bảo Kê ───────────────────────
function openPlayerModal() {
  playClick();
  const activeShields = state.players.filter(p => p.shieldTurns && p.shieldTurns > 0);

  const html = `
    <div class="space-y-3.5">
      <div class="flex items-center justify-between pb-2 border-b border-[#E8DEC9]">
        <div class="flex items-center gap-2">
          <span class="text-xl">⚙️</span>
          <div>
            <h3 class="font-clash text-base font-bold text-[#10233D]">Quản lý & Bảo Kê</h3>
            <p class="font-boska text-xs italic text-[#756856]">Chỉnh tỷ lệ trúng & né phạt theo số lượt</p>
          </div>
        </div>
        <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 hover:text-black flex items-center justify-center text-sm font-bold">✕</button>
      </div>

      <!-- KHUNG BẢO KÊ / NÉ LƯỢT PHẠT -->
      <div class="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#D8C49D] space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 font-clash font-bold text-xs text-[#10233D] uppercase">
            <span>🛡️</span> KHIÊN BẢO KÊ (NÉ PHẠT)
          </div>
          <span class="text-[10px] text-[#756856] italic">Sau X người dính mới tới</span>
        </div>

        <div class="flex gap-2">
          <select id="shieldPlayerSelect" class="flex-1 bg-white border border-[#D8C49D] rounded-xl px-2.5 py-2 text-xs text-[#10233D] font-bold">
            ${state.players.map(p => `<option value="${escHtml(p.name)}" ${p.name.toLowerCase() === 'nam ké' ? 'selected' : ''}>${escHtml(p.name)}</option>`).join('')}
          </select>
          <select id="shieldTurnsSelect" class="w-24 bg-white border border-[#D8C49D] rounded-xl px-2 py-2 text-xs text-[#10233D] font-bold">
            <option value="5">5 lượt</option>
            <option value="10" selected>10 lượt</option>
            <option value="15">15 lượt</option>
            <option value="20">20 lượt</option>
            <option value="999">Bất tử</option>
          </select>
        </div>

        <button onclick="applyShieldFromModal()" class="btn-deco-primary text-xs py-2 w-full">
          <span>🛡️</span> KÍCH HOẠT NÉ LƯỢT
        </button>

        <div id="modalActiveShieldsList" class="space-y-1 pt-1">
          ${activeShields.length > 0 ? activeShields.map(p => `
            <div class="flex justify-between items-center text-xs p-1.5 rounded-lg bg-white border border-[#D8C49D]">
              <span class="font-bold text-[#10233D]">🛡️ ${escHtml(p.name)}: <span class="text-[#C65D3B]">còn ${p.shieldTurns} lượt né</span></span>
              <button onclick="removePlayerShield('${escHtml(p.name)}'); openPlayerModal();" class="text-red-500 font-bold px-1.5 text-xs">✕ Hủy</button>
            </div>
          `).join('') : '<p class="text-[11px] text-slate-400 italic text-center">Chưa có ai được bảo kê.</p>'}
        </div>
      </div>

      <!-- Quick actions -->
      <div class="grid grid-cols-2 gap-2">
        <button class="btn-deco-secondary text-xs py-2" onclick="activateAllPlayers()">
          <span>⚡</span> Bật tất cả người
        </button>
        <button class="btn-deco-secondary text-xs py-2" onclick="showSection('home'); closeModal();">
          <span>🏠</span> Về Trang Chủ
        </button>
      </div>

      <!-- Current players list -->
      <div class="space-y-1.5">
        <div class="text-[11px] text-[#756856] flex justify-between">
          <span>Chạm vào tên để bật/tắt:</span>
          <span>Bấm 1x để chỉnh tỷ lệ:</span>
        </div>
        <div id="modalPlayerList" class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1"></div>
      </div>

      <button onclick="closeModal()" class="btn-deco-primary w-full py-2.5 font-bold text-xs">
        <span>✓</span> TIẾP TỤC CHƠI
      </button>
    </div>
  `;
  showModal(html);
  renderModalPlayerList();
}

function applyShieldFromModal() {
  const nameSelect = document.getElementById('shieldPlayerSelect');
  const turnsSelect = document.getElementById('shieldTurnsSelect');
  if (!nameSelect || !turnsSelect) return;
  const name = nameSelect.value;
  const turns = turnsSelect.value;
  setPlayerShield(name, turns);
  openPlayerModal();
}

function renderModalPlayerList() {
  const container = document.getElementById('modalPlayerList');
  if (!container) return;
  container.innerHTML = '';
  if (state.players.length === 0) {
    container.innerHTML = '<p class="text-center text-slate-400 py-3 col-span-2 text-xs">Chưa có người chơi nào.</p>';
    return;
  }
  state.players.forEach((p, i) => {
    const btn = document.createElement('div');
    const weight = p.weight || 1;
    const hasShield = p.shieldTurns && p.shieldTurns > 0;
    const hasCooldown = p.cooldownTurns && p.cooldownTurns > 0;
    btn.className = `flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
      p.active
        ? 'border-[#D8C49D] bg-[#FFFDF9] text-[#10233D]'
        : 'border-slate-200 bg-slate-100 text-slate-400 opacity-60'
    }`;
    btn.innerHTML = `
      <button onclick="togglePlayer(${i})" class="flex items-center gap-1.5 flex-1 text-left truncate">
        <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${p.active ? 'bg-[#C65D3B] text-white' : 'bg-slate-300 text-white'}">${i + 1}</span>
        <span class="truncate">${escHtml(p.name)}</span>
      </button>
      <button onclick="togglePlayerWeight(${i})" class="px-1.5 py-0.5 rounded text-[10px] font-extrabold border ${weight > 1 ? 'bg-[#C65D3B] text-white' : 'bg-slate-100 text-[#756856]'}">
        ${weight}x
      </button>
    `;
    container.appendChild(btn);
  });
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
  t.classList.remove('opacity-0', 'translate-y-3');
  t.classList.add('opacity-100', 'translate-y-0');
  setTimeout(() => {
    t.classList.add('opacity-0', 'translate-y-3');
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
// TRÒ 1: VÒNG QUAY NHÂN PHẨM (Target Landing + Nghỉ 2 Round)
// ─────────────────────────────────────────────────────────
let spinCanvas, spinCtx;
let spinAngle = 0;
let spinVelocity = 0;
let spinAnimId = null;
let isSpinning = false;

const COLORS = [
  '#C65D3B', '#8B6F47', '#7B5364', '#D4A574', '#A55A3C',
  '#9B8652', '#5C4456', '#C27B52', '#4E6B66', '#B8924A',
  '#6D4A5E', '#A87D56', '#D7BF8A', '#3D5A56', '#BF6B4E', '#8B734B'
];

function initSpinWheel() {
  spinCanvas = document.getElementById('spinWheel');
  if (!spinCanvas) return;
  spinCtx = spinCanvas.getContext('2d');
  resizeCanvas();
  drawWheel();
}

function resizeCanvas() {
  if (!spinCanvas) return;
  const container = spinCanvas.parentElement;
  const size = Math.min(container.clientWidth - 16, 320);
  spinCanvas.width = size;
  spinCanvas.height = size;
}

function drawWheel() {
  if (!spinCtx || !spinCanvas) return;
  const players = getActivePlayers();
  const n = players.length;
  const cx = spinCanvas.width / 2;
  const cy = spinCanvas.height / 2;
  const r = cx - 8;

  spinCtx.clearRect(0, 0, spinCanvas.width, spinCanvas.height);

  if (n === 0) {
    spinCtx.fillStyle = '#FFFDF9';
    spinCtx.beginPath();
    spinCtx.arc(cx, cy, r, 0, Math.PI * 2);
    spinCtx.fill();
    spinCtx.strokeStyle = '#D8C49D';
    spinCtx.lineWidth = 3;
    spinCtx.stroke();
    spinCtx.fillStyle = '#756856';
    spinCtx.font = `600 ${Math.min(14, r / 5)}px "Clash Display", sans-serif`;
    spinCtx.textAlign = 'center';
    spinCtx.fillText('Chưa có người chơi', cx, cy);
    return;
  }

  const sliceAngle = (Math.PI * 2) / n;

  players.forEach((p, i) => {
    const start = spinAngle + i * sliceAngle;
    const end = start + sliceAngle;

    spinCtx.beginPath();
    spinCtx.moveTo(cx, cy);
    spinCtx.arc(cx, cy, r, start, end);
    spinCtx.closePath();
    spinCtx.fillStyle = COLORS[i % COLORS.length];
    spinCtx.fill();
    spinCtx.strokeStyle = '#FFFFFF';
    spinCtx.lineWidth = 2;
    spinCtx.stroke();

    spinCtx.save();
    spinCtx.translate(cx, cy);
    spinCtx.rotate(start + sliceAngle / 2);
    spinCtx.textAlign = 'right';

    const fontSize = Math.max(10, Math.min(13, r / (n * 0.52)));
    spinCtx.font = `700 ${fontSize}px "Be Vietnam Pro", system-ui, sans-serif`;
    spinCtx.fillStyle = '#FFFFFF';
    spinCtx.shadowColor = 'rgba(16, 35, 61, 0.7)';
    spinCtx.shadowBlur = 3;

    const maxLen = Math.max(5, Math.floor(18 / Math.sqrt(n)));
    let name = p.name;
    if (name.length > maxLen) name = name.slice(0, maxLen - 1) + '…';

    spinCtx.fillText(name, r - 12, fontSize / 3);
    spinCtx.restore();
  });

  spinCtx.beginPath();
  spinCtx.arc(cx, cy, r, 0, Math.PI * 2);
  spinCtx.strokeStyle = '#10233D';
  spinCtx.lineWidth = 4;
  spinCtx.stroke();

  spinCtx.save();
  spinCtx.translate(cx, 0);
  spinCtx.beginPath();
  spinCtx.moveTo(0, r * 0.15);
  spinCtx.lineTo(-12, -2);
  spinCtx.lineTo(12, -2);
  spinCtx.closePath();
  spinCtx.fillStyle = '#C65D3B';
  spinCtx.fill();
  spinCtx.strokeStyle = '#10233D';
  spinCtx.lineWidth = 1.5;
  spinCtx.stroke();
  spinCtx.restore();
}

function spinWheel() {
  if (isSpinning) return;
  const players = getActivePlayers();
  if (players.length < 2) {
    showToast('⚠️ Cần ít nhất 2 người chơi đang hoạt động!');
    return;
  }

  // 1. Lựa chọn người thắng hợp lệ:
  // - KHÔNG dính khiên bảo kê
  // - KHÔNG dính 2 round hồi chiêu vừa trúng
  const eligible = getEligiblePlayers();
  const winner = pickWeightedWinner(eligible);
  const targetIdx = players.indexOf(winner);

  isSpinning = true;

  const n = players.length;
  const sliceAngle = (Math.PI * 2) / n;

  // Tính góc đích dừng chính xác tại tâm ô của winner
  const offset = (Math.random() - 0.5) * 0.5 * sliceAngle;
  const targetAngle = -Math.PI / 2 - (targetIdx + 0.5) * sliceAngle + offset;

  const currentNormalized = ((spinAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  let diff = (targetAngle - currentNormalized) % (Math.PI * 2);
  if (diff < 0) diff += Math.PI * 2;

  // Quay từ 5 đến 7 vòng đầy đủ trước khi dừng
  const totalRotation = (5 + Math.floor(Math.random() * 3)) * Math.PI * 2 + diff;
  const startAngle = spinAngle;
  const duration = 4000;
  const startTime = performance.now();

  let lastSlice = -1;

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const ease = 1 - Math.pow(1 - progress, 3);
    spinAngle = startAngle + totalRotation * ease;

    const currSlice = Math.floor(spinAngle / sliceAngle);
    if (currSlice !== lastSlice) {
      playSpinTick();
      lastSlice = currSlice;
    }

    drawWheel();

    if (progress < 1) {
      spinAnimId = requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      onSpinEnd(winner);
    }
  }

  cancelAnimationFrame(spinAnimId);
  spinAnimId = requestAnimationFrame(animate);
}

function onSpinEnd(winner) {
  playCelebration();
  // Kích hoạt: Người vừa trúng nghỉ 2 round tiếp theo + Giảm khiên bảo kê
  processRoundEnd(winner);

  const challenge = randItem(DATA.spins);

  showModal(`
    <div class="text-center space-y-3.5">
      <div class="text-4xl">🎉</div>
      <h2 class="font-clash text-xs font-bold text-[#C65D3B] uppercase tracking-widest">Trúng thưởng!</h2>
      <div class="font-clash text-xl sm:text-2xl font-black text-[#10233D] py-3 px-4 bg-[#F5EFE3] rounded-2xl border-2 border-[#D8C49D]">
        ${escHtml(winner.name)}
      </div>
      <div class="bg-[#FFFDF9] border border-[#E8DEC9] rounded-2xl p-4 text-left space-y-1.5 shadow-sm">
        <div class="text-[11px] font-bold text-[#C65D3B] uppercase tracking-wider font-clash">⚡ Lệnh Phạt / Thử thách</div>
        <div class="font-clash font-bold text-[#10233D] text-base" id="spinChallengeTitleEl">${escHtml(challenge.title)}</div>
        <div class="text-[#756856] text-xs sm:text-sm leading-relaxed" id="spinChallengeDescEl">${escHtml(challenge.desc)}</div>
      </div>
      <div class="flex gap-2.5 pt-1">
        <button onclick="closeModal()" class="flex-1 py-3 rounded-2xl bg-white border border-slate-300 text-[#10233D] text-xs font-bold active:scale-95">↩ Xong</button>
        <button onclick="changeSpinChallenge()" class="flex-1 py-3 rounded-2xl btn-deco-primary text-xs font-bold active:scale-95">🔀 Đổi lệnh</button>
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
// TRÒ 2: AI LÀ NGƯỜI... (Xoay vòng toàn bộ câu hỏi không trùng lặp)
// ─────────────────────────────────────────────────────────
let whoIsQuestion = null;
let whoIsCountdown = null;
let whoIsDeck = [];
let whoIsQuestionNum = 0;

function initWhoIsDeck() {
  const pool = (window.DATA && DATA.whoIs && DATA.whoIs.length > 0) ? DATA.whoIs : [];
  whoIsDeck = [...pool];
  // Xáo trộn ngẫu nhiên toàn bộ câu hỏi (Fisher-Yates)
  for (let i = whoIsDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [whoIsDeck[i], whoIsDeck[j]] = [whoIsDeck[j], whoIsDeck[i]];
  }
}

function pickWhoIsQuestion() {
  const total = (window.DATA && DATA.whoIs) ? DATA.whoIs.length : 49;
  if (!whoIsDeck || whoIsDeck.length === 0) {
    initWhoIsDeck();
    whoIsQuestionNum = 0;
  }

  whoIsQuestion = whoIsDeck.pop();
  whoIsQuestionNum++;

  const qEl = document.getElementById('whoIsQuestion');
  const orderEl = document.getElementById('whoIsOrder');
  const scoreEl = document.getElementById('whoIsGroupScore');
  const progressEl = document.getElementById('whoIsProgressBar');

  const formattedNum = whoIsQuestionNum < 10 ? '0' + whoIsQuestionNum : whoIsQuestionNum;
  if (orderEl) {
    orderEl.textContent = `CÂU HỎI SỐ ${formattedNum} / ${total}`;
  }

  if (scoreEl) {
    scoreEl.textContent = `${whoIsQuestionNum} / ${total} CÂU`;
  }
  if (progressEl) {
    const pct = Math.min(100, Math.round((whoIsQuestionNum / total) * 100));
    progressEl.style.width = `${pct}%`;
  }

  if (qEl) qEl.textContent = whoIsQuestion;
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
  if (resultEl) resultEl.classList.add('hidden');

  let count = 3;
  if (countEl) {
    countEl.textContent = count;
    countEl.classList.remove('hidden', 'scale-0');
    countEl.classList.add('scale-100');
  }

  playTone(520, 'sine', 0.25, 0.35);

  whoIsCountdown = setInterval(() => {
    count--;
    if (count > 0) {
      if (countEl) {
        countEl.classList.remove('scale-100');
        setTimeout(() => {
          countEl.textContent = count;
          countEl.classList.add('scale-100');
        }, 80);
      }
      playTone(520, 'sine', 0.25, 0.35);
    } else {
      clearInterval(whoIsCountdown);
      whoIsCountdown = null;
      if (countEl) {
        countEl.classList.remove('scale-100');
        setTimeout(() => {
          countEl.textContent = 'CHỈ!';
          countEl.classList.add('scale-100');
        }, 80);
      }
      playCelebration();
      setTimeout(() => {
        if (countEl) countEl.classList.add('hidden');
        if (resultEl) {
          resultEl.innerHTML = '🏆 <strong>Ai bị chỉ nhiều nhất</strong> thì người đó <strong>UỐNG! 🍺</strong>';
          resultEl.classList.remove('hidden');
        }
        if (btnStart) btnStart.disabled = false;
      }, 2000);
    }
  }, 1000);
}

// ─────────────────────────────────────────────────────────
// TRÒ 3: THẬT HAY THÁCH (Tôn trọng Khiên + Nghỉ 2 Round)
// ─────────────────────────────────────────────────────────
const todState = {
  step: 1,
  player: null,
  mode: 'truth',
  level: 'mild',
  question: '',
  isRolling: false
};

function pickToDPlayer() {
  const active = getActivePlayers();
  if (active.length === 0) {
    showToast('⚠️ Cần có người chơi trong danh sách!');
    return;
  }
  if (todState.isRolling) return;
  todState.isRolling = true;

  // Lựa chọn người thắng hợp lệ (tôn trọng khiên né lượt và 2 round nghỉ)
  const eligible = getEligiblePlayers();
  const winner = pickWeightedWinner(eligible);

  const playerEl = document.getElementById('todPlayerName');
  const cardInner = document.getElementById('todCardInner');
  const promptText = document.getElementById('todPromptText');
  const promptSub = document.getElementById('todPromptSub');
  const choiceBox = document.getElementById('todChoiceButtons');
  const pickBtn = document.getElementById('todPickBtn');
  const actionGroup = document.getElementById('todActionGroup');
  const subtitle = document.getElementById('todSubtitle');

  if (cardInner) cardInner.classList.remove('flipped');
  if (choiceBox) choiceBox.classList.add('hidden');
  if (actionGroup) actionGroup.classList.add('hidden');
  if (pickBtn) pickBtn.classList.add('hidden');

  let rollCount = 0;
  const totalRolls = 10;
  const interval = 70;

  const timer = setInterval(() => {
    const temp = randItem(active);
    if (playerEl) playerEl.textContent = temp.name;
    playTone(650 + Math.random() * 250, 'square', 0.03, 0.08);
    rollCount++;

    if (rollCount >= totalRolls) {
      clearInterval(timer);
      todState.player = winner;
      todState.step = 2;
      todState.isRolling = false;

      // Người này trúng thì nghỉ 2 round tiếp theo!
      processRoundEnd(winner);

      if (playerEl) playerEl.textContent = todState.player.name;
      if (promptText) promptText.textContent = `${todState.player.name} ơi, bạn chọn THẬT hay THÁCH?`;
      if (promptSub) promptSub.textContent = `Chạm nút THẬT hoặc THÁCH bên dưới!`;
      if (subtitle) subtitle.textContent = `Đã chọn: ${todState.player.name}! Hãy chọn Thật hoặc Thách`;

      if (choiceBox) {
        choiceBox.classList.remove('hidden');
      }

      playCelebration();
      showToast(`🎯 Lượt của: ${todState.player.name}`);
    }
  }, interval);
}

function todSelectChoice(mode) {
  if (!todState.player) {
    showToast('⚠️ Hãy chọn người ngẫu nhiên trước!');
    return;
  }

  todState.mode = mode;
  todState.level = Math.random() > 0.5 ? 'mild' : 'spicy';

  const pool = DATA[mode][todState.level] || DATA[mode]['mild'];
  todState.question = randItem(pool);
  todState.step = 3;

  const typeEl = document.getElementById('todCardType');
  const qEl = document.getElementById('todCardQuestion');
  const playerLabel = document.getElementById('todCardPlayerLabel');
  const cardInner = document.getElementById('todCardInner');
  const choiceBox = document.getElementById('todChoiceButtons');
  const actionGroup = document.getElementById('todActionGroup');
  const subtitle = document.getElementById('todSubtitle');

  const modeName = mode === 'truth' ? 'THẬT' : 'THÁCH';
  const levelName = todState.level === 'mild' ? 'NHẸ NHÀNG' : 'CHÁY PHỐ';

  if (typeEl) {
    typeEl.textContent = `${modeName} · ${levelName}`;
    typeEl.className = `text-[11px] font-bold uppercase ${mode === 'truth' ? 'text-[#C65D3B]' : 'text-[#7D5F3C]'}`;
  }
  if (qEl) qEl.textContent = todState.question;
  if (playerLabel) playerLabel.textContent = todState.player.name;
  if (subtitle) subtitle.textContent = `Thử thách dành cho ${todState.player.name}`;

  if (choiceBox) choiceBox.classList.add('hidden');
  if (actionGroup) actionGroup.classList.remove('hidden');

  if (cardInner) {
    cardInner.classList.remove('flipped');
    setTimeout(() => cardInner.classList.add('flipped'), 80);
  }

  playClick();
}

function changeCurrentToD() {
  if (!todState.player || !todState.mode) return;
  const pool = DATA[todState.mode][todState.level] || DATA[todState.mode]['mild'];
  todState.question = randItem(pool);
  const qEl = document.getElementById('todCardQuestion');
  if (qEl) qEl.textContent = todState.question;
  playClick();
  showToast('🔀 Đã đổi câu hỏi khác!');
}

function todGiveUp() {
  showModal(`
    <div class="text-center space-y-3.5">
      <div class="text-4xl">😅</div>
      <h2 class="font-clash text-base font-bold text-[#C65D3B] uppercase tracking-wider">Chịu thua!</h2>
      <p class="text-[#10233D] text-xs sm:text-sm">
        <span class="font-bold">${todState.player ? escHtml(todState.player.name) : 'Người chơi'}</span> không dám thực hiện thử thách.<br>
        <span class="text-[#D9383A] font-clash font-bold text-base mt-1 block">Phạt uống 1 ly! 🍺</span>
      </p>
      <button onclick="closeModal()" class="btn-deco-primary w-full py-2.5 font-bold text-xs sm:text-sm">
        <span>✓</span> OK, UỐNG NGAY!
      </button>
    </div>
  `);
  playTone(220, 'sawtooth', 0.35, 0.25);
}

// ─────────────────────────────────────────────────────────
// TRÒ 4: NỐI TỪ CĂNG NÃO (Thay thế Xúc Xắc)
// ─────────────────────────────────────────────────────────
let wordChainStreak = 0;
let wordChainTimer = null;
let wordChainTime = 5;
let wordChainTicking = false;
let wordChainCurrent = null;

function initWordChain() {
  if (!wordChainCurrent) {
    pickWordChain();
  }
}

function pickWordChain() {
  stopWordChainTimer();
  const pool = DATA.wordChain || [
    { word: "Bia hơi", nextHint: "Hơi..." },
    { word: "Mồi nhắm", nextHint: "Nhắm..." },
    { word: "Cạn ly", nextHint: "Ly..." }
  ];
  wordChainCurrent = randItem(pool);

  const displayEl = document.getElementById('wordChainDisplay');
  const hintEl = document.getElementById('wordChainHint');
  const statusEl = document.getElementById('wordChainStatus');
  const timerDisplay = document.getElementById('wordChainTimeDisplay');

  if (displayEl) displayEl.textContent = wordChainCurrent.word.toUpperCase();
  if (hintEl) hintEl.textContent = wordChainCurrent.nextHint;
  if (statusEl) statusEl.textContent = 'Bấm "BẮT ĐẦU 5 GIÂY" cho mỗi lượt nói!';
  if (timerDisplay) {
    timerDisplay.textContent = '5';
    timerDisplay.className = 'font-clash text-3xl font-extrabold text-[#C65D3B]';
  }

  playClick();
}

function startWordChainTimer() {
  if (wordChainTicking) return;
  wordChainTicking = true;
  wordChainTime = 5;

  const startBtn = document.getElementById('wordChainStartBtn');
  const passBtn = document.getElementById('wordChainPassBtn');
  const timerDisplay = document.getElementById('wordChainTimeDisplay');
  const statusEl = document.getElementById('wordChainStatus');

  if (startBtn) startBtn.classList.add('hidden');
  if (passBtn) passBtn.classList.remove('hidden');
  if (statusEl) statusEl.textContent = '⏱ Đang đếm 5 giây... Nhanh miệng lên!';

  if (timerDisplay) {
    timerDisplay.textContent = '5';
    timerDisplay.className = 'font-clash text-3xl font-extrabold text-[#C65D3B] animate-pulse';
  }

  playTone(750, 'square', 0.05, 0.2);

  clearInterval(wordChainTimer);
  wordChainTimer = setInterval(() => {
    wordChainTime--;
    if (timerDisplay) {
      timerDisplay.textContent = wordChainTime;
    }

    if (wordChainTime > 0) {
      playTone(700 + (5 - wordChainTime) * 80, 'square', 0.05, 0.2);
    } else {
      clearInterval(wordChainTimer);
      wordChainTicking = false;

      playTone(180, 'sawtooth', 0.5, 0.4);
      if (statusEl) {
        statusEl.innerHTML = '<span class="text-red-600 font-bold">💥 HẾT 5 GIÂY! BẠN ĐÃ BỊ PHẠT UỐNG! 🍺</span>';
      }

      showModal(`
        <div class="text-center space-y-3.5">
          <div class="text-5xl animate-bounce">⏱️💥</div>
          <h2 class="font-clash text-xl font-bold text-[#D9383A] uppercase tracking-wider">HẾT 5 GIÂY!</h2>
          <p class="text-[#10233D] text-sm leading-relaxed">
            Bạn đã không kịp nối từ trong 5 giây hoặc bị ngọng!<br>
            <span class="text-[#D9383A] font-clash font-extrabold text-lg mt-1 block">TỰ PHẠT UỐNG 1 LY! 🍺</span>
          </p>
          <button onclick="closeModal(); pickWordChain();" class="btn-deco-primary w-full py-3 font-bold text-sm">
            <span>✓</span> UỐNG XONG, CHƠI TỪ MỚI!
          </button>
        </div>
      `);

      wordChainStreak = 0;
      updateWordChainStreak();

      if (startBtn) startBtn.classList.remove('hidden');
      if (passBtn) passBtn.classList.add('hidden');
    }
  }, 1000);
}

function passWordChainSuccess() {
  if (!wordChainTicking) return;
  clearInterval(wordChainTimer);
  wordChainTicking = false;

  wordChainStreak++;
  updateWordChainStreak();

  const startBtn = document.getElementById('wordChainStartBtn');
  const passBtn = document.getElementById('wordChainPassBtn');
  const timerDisplay = document.getElementById('wordChainTimeDisplay');
  const statusEl = document.getElementById('wordChainStatus');

  if (startBtn) startBtn.classList.remove('hidden');
  if (passBtn) passBtn.classList.add('hidden');
  if (timerDisplay) {
    timerDisplay.textContent = '5';
    timerDisplay.className = 'font-clash text-3xl font-extrabold text-[#18C9A6]';
  }
  if (statusEl) {
    statusEl.textContent = `✅ Chuỗi nối đạt ${wordChainStreak} từ! Bấm Bắt đầu cho người tiếp theo!`;
  }

  playCelebration();
  showToast(`🎉 Tuyệt vời! Chuỗi nối: ${wordChainStreak} từ!`);
}

function wordChainGiveUp() {
  stopWordChainTimer();
  wordChainStreak = 0;
  updateWordChainStreak();

  showModal(`
    <div class="text-center space-y-3.5">
      <div class="text-4xl">😅</div>
      <h2 class="font-clash text-base font-bold text-[#C65D3B] uppercase tracking-wider">Bí từ rồi!</h2>
      <p class="text-[#10233D] text-xs sm:text-sm">
        Từ ngữ hiểm hóc quá không nghĩ ra được từ nối.<br>
        <span class="text-[#D9383A] font-clash font-bold text-base mt-1 block">Phạt uống 1 ly giải xui! 🍺</span>
      </p>
      <button onclick="closeModal(); pickWordChain();" class="btn-deco-primary w-full py-2.5 font-bold text-xs sm:text-sm">
        <span>🔀</span> UỐNG VÀ ĐỔI TỪ MỚI
      </button>
    </div>
  `);
  playTone(220, 'sawtooth', 0.35, 0.25);
}

function stopWordChainTimer() {
  wordChainTicking = false;
  clearInterval(wordChainTimer);
  const startBtn = document.getElementById('wordChainStartBtn');
  const passBtn = document.getElementById('wordChainPassBtn');
  if (startBtn) startBtn.classList.remove('hidden');
  if (passBtn) passBtn.classList.add('hidden');
}

function updateWordChainStreak() {
  const el = document.getElementById('wordChainStreak');
  if (el) el.textContent = `${wordChainStreak} từ`;
}

// ─────────────────────────────────────────────────────────
// TRÒ 5: QUẢ BOM HẸN GIỜ (CHÍNH XÁC 20 GIÂY NỔ)
// ─────────────────────────────────────────────────────────
let bombTimer = null;
let bombEndTime = 0;
let bombTicking = false;
let bombDuration = 20;

function pickBombTopic() {
  const topic = randItem(DATA.bombTopics);
  const topicEl = document.getElementById('bombTopic');
  if (topicEl) {
    topicEl.textContent = topic;
  }
  resetBomb();
  playClick();
}

function startBomb() {
  if (bombTicking) return;
  const topicEl = document.getElementById('bombTopic');
  if (!topicEl) return;

  bombTicking = true;
  bombDuration = 20;
  bombEndTime = Date.now() + 20 * 1000;

  const timeDisplay = document.getElementById('bombTimeDisplay');
  const startBtn = document.getElementById('bombStartBtn');
  const passBtn = document.getElementById('bombPassBtn');

  if (startBtn) startBtn.classList.add('hidden');
  if (passBtn) passBtn.classList.remove('hidden');

  let tickSpeed = 1000;

  function tick() {
    const remainingMs = bombEndTime - Date.now();
    const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

    if (timeDisplay) {
      timeDisplay.textContent = `00:${remainingSec < 10 ? '0' + remainingSec : remainingSec}`;
    }

    if (remainingMs <= 0) {
      explodeBomb();
      return;
    }

    const progress = 1 - (remainingMs / (20 * 1000));
    tickSpeed = Math.max(200, 1000 - progress * 800);

    playBombTick(progress > 0.6);

    clearTimeout(bombTimer);
    bombTimer = setTimeout(tick, tickSpeed);
  }

  tick();
}

function passBomb() {
  if (!bombTicking) return;
  playClick();
  showToast('💣 Đã chuyền bom! Người tiếp theo nói ngay!');
}

function explodeBomb() {
  bombTicking = false;
  clearTimeout(bombTimer);

  playBombExplode();

  const timeDisplay = document.getElementById('bombTimeDisplay');
  const startBtn = document.getElementById('bombStartBtn');
  const passBtn = document.getElementById('bombPassBtn');

  if (timeDisplay) {
    timeDisplay.textContent = 'BÙM!';
  }

  const flashEl = document.getElementById('bombFlash');
  if (flashEl) {
    flashEl.style.opacity = '0.75';
    setTimeout(() => { if (flashEl) flashEl.style.opacity = '0'; }, 600);
  }

  showModal(`
    <div class="text-center space-y-3.5">
      <div class="text-5xl animate-bounce">💥</div>
      <h2 class="font-clash text-xl font-bold text-[#D9383A] uppercase tracking-wider">BOM PHÁT NỔ!</h2>
      <p class="text-[#10233D] text-sm leading-relaxed">
        Đúng 20 giây quả bom đã phát nổ trên tay!<br>
        <span class="text-[#D9383A] font-clash font-extrabold text-lg mt-1 block">Người cầm điện thoại UỐNG 1 LY! 🍺</span>
      </p>
      <button onclick="closeModal(); pickBombTopic();" class="btn-deco-primary w-full py-3 font-bold text-sm">
        <span>✦</span> CHƠI VÒNG MỚI
      </button>
    </div>
  `);

  if (startBtn) startBtn.classList.remove('hidden');
  if (passBtn) passBtn.classList.add('hidden');
}

function resetBomb() {
  bombTicking = false;
  clearTimeout(bombTimer);

  const startBtn = document.getElementById('bombStartBtn');
  const passBtn = document.getElementById('bombPassBtn');
  const timeDisplay = document.getElementById('bombTimeDisplay');

  if (startBtn) startBtn.classList.remove('hidden');
  if (passBtn) passBtn.classList.add('hidden');
  if (timeDisplay) timeDisplay.textContent = '00:20';
}

function stopBomb() {
  bombTicking = false;
  clearTimeout(bombTimer);

  const startBtn = document.getElementById('bombStartBtn');
  const passBtn = document.getElementById('bombPassBtn');

  if (startBtn) startBtn.classList.remove('hidden');
  if (passBtn) passBtn.classList.add('hidden');
}

// ─────────────────────────────────────────────────────────
// NAVIGATION (6 TABS: HOME + 5 TRÒ CHƠI)
// ─────────────────────────────────────────────────────────
const SECTIONS = ['home', 'spin', 'whois', 'tod', 'wordchain', 'bomb'];

const HEADER_META = {
  home: {
    title: 'ĐẠI CHIẾN BÀN NHẬU',
    subtitle: 'Mâm đông 16 người · Desert Art Deco'
  },
  spin: {
    title: 'VÒNG QUAY NHÂN PHẨM',
    subtitle: 'Trúng tên ai người đó nhận hình phạt!'
  },
  whois: {
    title: 'AI LÀ NGƯỜI...',
    subtitle: 'Cả 16 người cùng giơ tay chỉ một!'
  },
  tod: {
    title: 'THẬT HAY THÁCH',
    subtitle: 'Chọn một thử thách cho đêm nay'
  },
  wordchain: {
    title: 'NỐI TỪ CĂNG NÃO',
    subtitle: 'Nhanh trí nối từ — chậm 5 giây là uống!'
  },
  bomb: {
    title: 'QUẢ BOM HẸN GIỜ (20S)',
    subtitle: 'Đúng 20 giây phát nổ — chuyền thật nhanh!'
  }
};

function showSection(id) {
  SECTIONS.forEach(s => {
    const el = document.getElementById(`section-${s}`);
    if (el) el.classList.toggle('hidden', s !== id);
  });

  document.querySelectorAll('.nav-btn').forEach(btn => {
    const isActive = btn.dataset.section === id;
    btn.classList.toggle('nav-active', isActive);
  });

  const meta = HEADER_META[id] || HEADER_META['home'];
  const hTitle = document.getElementById('headerTitle');
  const hSub = document.getElementById('headerSubtitle');
  if (hTitle) hTitle.textContent = meta.title;
  if (hSub) hSub.textContent = meta.subtitle;

  if (id === 'home') {
    renderHomePlayerGrid();
  }

  if (id === 'spin') {
    setTimeout(initSpinWheel, 50);
  }

  if (id === 'tod') {
    if (!todState.player) {
      document.getElementById('todPickBtn')?.classList.remove('hidden');
      document.getElementById('todChoiceButtons')?.classList.add('hidden');
      document.getElementById('todActionGroup')?.classList.add('hidden');
      document.getElementById('todCardInner')?.classList.remove('flipped');
    }
  }

  if (id === 'wordchain') {
    initWordChain();
  } else {
    stopWordChainTimer();
  }

  if (id !== 'bomb') stopBomb();

  playClick();
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

function toggleShakeSensor() {
  showToast('📱 Cảm biến sẵn sàng!');
}

// ─────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadPlayers();
  renderHomePlayerGrid();
  initWhoIsDeck();
  showSection('home');

  const cardInner = document.getElementById('todCardInner');
  if (cardInner) {
    cardInner.addEventListener('click', () => {
      cardInner.classList.toggle('flipped');
      playClick();
    });
  }

  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  window.addEventListener('resize', () => {
    if (!document.getElementById('section-spin')?.classList.contains('hidden')) {
      resizeCanvas();
      drawWheel();
    }
  });

  console.log('🍺 Đại Chiến Bàn Nhậu (Desert Art Deco 16P) - Sẵn sàng!');
});
