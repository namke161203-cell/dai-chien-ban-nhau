// ============================================================
// APP.JS - Đại Chiến Bàn Nhậu (Phong cách Pháp cổ kính Art Deco)
// ============================================================

// ─── State ───────────────────────────────────────────────
const state = {
  players: [],          // { name, active }
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

function playDiceShake() {
  if (!state.soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    for (let i = 0; i < 6; i++) {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.07, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < data.length; j++) data[j] = (Math.random() * 2 - 1) * 0.3;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.07);
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start(ctx.currentTime + i * 0.07);
    }
  } catch (e) {}
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
    state.players = DATA.sampleNames.map(name => ({ name, active: true }));
    savePlayers();
  }
}

// ─── Player Management ────────────────────────────────────
function getActivePlayers() {
  return state.players.filter(p => p.active);
}

function getAvatarChar(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const last = parts[parts.length - 1];
  return (last[0] || name[0]).toUpperCase();
}

function renderMemberBar() {
  const container = document.getElementById('memberBarList');
  const countBadge = document.getElementById('memberCountBadge');
  if (!container) return;

  const activeCount = getActivePlayers().length;
  const totalCount = state.players.length;
  if (countBadge) {
    countBadge.textContent = `${activeCount}/${totalCount}`;
    countBadge.className = `text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
      activeCount > 0
        ? 'border-[#00D9FF] bg-[#E7FAFF] text-[#0088FF]'
        : 'border-red-300 bg-red-50 text-red-500'
    }`;
  }

  container.innerHTML = '';

  // Nút + tròn màu cyan #00D9FF chuẩn Art Deco Superdesign
  const addBtn = document.createElement('button');
  addBtn.className = 'w-10 h-10 rounded-full bg-[#00D9FF] text-[#10233D] font-black shadow-sm flex items-center justify-center shrink-0 active:scale-90 transition-transform';
  addBtn.title = 'Quản lý thành viên (nhập 16 tên)';
  addBtn.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  `;
  addBtn.onclick = () => openPlayerModal();
  container.appendChild(addBtn);

  // Danh sách avatar từng người cuộn ngang
  state.players.forEach((p, idx) => {
    const item = document.createElement('button');
    item.className = 'flex flex-col items-center shrink-0 group transition-all duration-150';
    item.onclick = () => togglePlayer(idx);

    const char = getAvatarChar(p.name);
    const avatarClass = p.active
      ? 'w-10 h-10 rounded-full border-2 border-[#00D9FF] bg-[#F0FBFF] text-[#0088FF] flex items-center justify-center text-xs font-clash font-bold shadow-sm'
      : 'w-10 h-10 rounded-full border border-slate-300 bg-slate-100 text-slate-400 opacity-50 flex items-center justify-center text-xs font-semibold';

    const textClass = p.active
      ? 'text-[10px] font-semibold text-[#10233D] max-w-[54px] truncate text-center mt-1'
      : 'text-[10px] text-slate-400 opacity-60 max-w-[54px] truncate text-center mt-1 line-through';

    item.innerHTML = `
      <div class="relative">
        <div class="${avatarClass}">${char}</div>
        ${p.active ? '<span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#18C9A6] rounded-full border-2 border-white"></span>' : ''}
      </div>
      <span class="${textClass}">${escHtml(p.name)}</span>
    `;
    container.appendChild(item);
  });
}

function togglePlayer(idx) {
  state.players[idx].active = !state.players[idx].active;
  savePlayers();
  renderMemberBar();
  renderModalPlayerList();
  if (spinCanvas) drawWheel();
  playClick();
}

function addPlayersFromTextarea() {
  const ta = document.getElementById('modalBulkInput');
  if (!ta) return;
  const raw = ta.value.trim();
  if (!raw) return;
  const names = raw.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
  if (names.length === 0) { showToast('Hãy nhập ít nhất 1 tên!'); return; }
  state.players = names.map(name => ({ name, active: true }));
  ta.value = '';
  savePlayers();
  renderMemberBar();
  renderModalPlayerList();
  if (spinCanvas) drawWheel();
  showToast(`✅ Đã cập nhật ${names.length} người chơi!`);
  playCelebration();
}

function addSamplePlayers() {
  state.players = DATA.sampleNames.map(name => ({ name, active: true }));
  savePlayers();
  renderMemberBar();
  renderModalPlayerList();
  if (spinCanvas) drawWheel();
  showToast('✅ Đã nạp 16 người mẫu!');
  playCelebration();
}

function clearPlayers() {
  if (!confirm('Xóa toàn bộ danh sách người chơi?')) return;
  state.players = [];
  savePlayers();
  renderMemberBar();
  renderModalPlayerList();
  if (spinCanvas) drawWheel();
}

// ─── Modal Quản Lý Người Chơi ─────────────────────────────
function openPlayerModal() {
  playClick();
  const html = `
    <div class="space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
        <div class="flex items-center gap-2">
          <span class="text-xl">👥</span>
          <div>
            <h3 class="font-clash text-base font-bold text-[#10233D]">Quản lý Thành viên</h3>
            <p class="font-boska text-xs italic text-[#55708D]">Dán danh sách hoặc chạm để bật/tắt</p>
          </div>
        </div>
        <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 hover:text-black flex items-center justify-center text-sm font-bold">✕</button>
      </div>

      <!-- Bulk input -->
      <div class="space-y-1.5">
        <label class="font-clash text-xs font-bold uppercase tracking-wider text-[#10233D]">📋 Dán nhanh 16 tên</label>
        <textarea id="modalBulkInput" rows="4"
          class="w-full bg-[#FDFBF7] border-2 border-[#C5A059]/40 rounded-xl px-3 py-2 text-[#10233D] text-xs placeholder-slate-400 focus:border-[#00D9FF] focus:outline-none resize-none font-medium leading-relaxed"
          placeholder="Minh Tuấn&#10;Hồng Nhung&#10;Quang Hải&#10;... (mỗi tên 1 dòng hoặc cách nhau dấu phẩy)"></textarea>
        <button class="btn-deco-primary text-xs py-2.5 w-full font-bold" onclick="addPlayersFromTextarea()">
          <span>✓</span> LƯU DANH SÁCH
        </button>
      </div>

      <!-- Quick actions -->
      <div class="flex gap-2">
        <button class="btn-deco-secondary text-xs py-2 flex-1" onclick="addSamplePlayers()">
          <span>🎲</span> Tạo 16 người mẫu
        </button>
        <button class="text-xs py-2 px-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-bold active:scale-95" onclick="clearPlayers()">
          🗑 Xóa hết
        </button>
      </div>

      <!-- Current players list -->
      <div class="space-y-1.5">
        <div class="flex justify-between items-center text-xs text-[#55708D] font-medium">
          <span>Danh sách hiện tại:</span>
          <span>Chạm để bật/tắt</span>
        </div>
        <div id="modalPlayerList" class="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1"></div>
      </div>
    </div>
  `;
  showModal(html);
  renderModalPlayerList();
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
    const btn = document.createElement('button');
    btn.className = `flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
      p.active
        ? 'border-[#00D9FF] bg-[#E7FAFF] text-[#0088FF]'
        : 'border-slate-200 bg-slate-50 text-slate-400 opacity-60'
    }`;
    btn.innerHTML = `
      <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${p.active ? 'bg-[#00D9FF] text-[#10233D]' : 'bg-slate-300 text-white'}">${i + 1}</span>
      <span class="flex-1 text-left truncate">${escHtml(p.name)}</span>
      <span class="text-[10px]">${p.active ? '✓' : '✗'}</span>
    `;
    btn.onclick = () => togglePlayer(i);
    container.appendChild(btn);
  });
}

// ─── Modal Cài Đặt ─────────────────────────────────────────
function openSettingsModal() {
  playClick();
  const html = `
    <div class="space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
        <div class="flex items-center gap-2">
          <span class="text-xl">⚙️</span>
          <div>
            <h3 class="font-clash text-base font-bold text-[#10233D]">Cài đặt & Luật Chơi</h3>
            <p class="font-boska text-xs italic text-[#55708D]">Đại Chiến Bàn Nhậu (Art Deco)</p>
          </div>
        </div>
        <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 hover:text-black flex items-center justify-center text-sm font-bold">✕</button>
      </div>

      <div class="space-y-3 text-xs leading-relaxed text-[#10233D]">
        <div class="flex items-center justify-between p-3 rounded-xl bg-[#FDFBF7] border border-[#E5DEC9]">
          <div>
            <div class="font-bold font-clash text-sm text-[#10233D]">Âm thanh hiệu ứng</div>
            <div class="text-[11px] text-[#55708D]">Web Audio API sống động</div>
          </div>
          <button onclick="toggleSound(); updateSettingsSoundBtn(this);" id="settingsSoundToggle" class="px-3 py-1.5 rounded-lg text-xs font-bold ${state.soundEnabled ? 'bg-[#E7FAFF] text-[#0088FF] border border-[#00D9FF]' : 'bg-slate-100 text-slate-500 border border-slate-200'}">
            ${state.soundEnabled ? 'BẬT 🔊' : 'TẮT 🔇'}
          </button>
        </div>

        <div class="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E5DEC9] space-y-1.5">
          <div class="font-bold font-clash text-[#0088FF] text-sm">🍺 Luật chơi mâm 16 người:</div>
          <p>• Nhấn vào avatar trên thanh thành viên để tạm ẩn người đang bận / đi vệ sinh.</p>
          <p>• Bấm nút <strong>+</strong> màu cyan ở góc trái để dán 16 tên bất kỳ lúc nào.</p>
          <p>• Vui vẻ, lịch sự – Đã uống rượu bia thì không lái xe!</p>
        </div>
      </div>

      <button onclick="closeModal()" class="btn-deco-primary w-full py-2.5 font-bold text-xs sm:text-sm">
        <span>✓</span> ĐÃ HIỂU, TIẾP TỤC CHƠI!
      </button>
    </div>
  `;
  showModal(html);
}

function updateSettingsSoundBtn(btn) {
  if (btn) {
    btn.textContent = state.soundEnabled ? 'BẬT 🔊' : 'TẮT 🔇';
    btn.className = `px-3 py-1.5 rounded-lg text-xs font-bold ${state.soundEnabled ? 'bg-[#E7FAFF] text-[#0088FF] border border-[#00D9FF]' : 'bg-slate-100 text-slate-500 border border-slate-200'}`;
  }
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
// TRÒ 1: VÒNG QUAY NHÂN PHẨM (Art Deco Palette)
// ─────────────────────────────────────────────────────────
let spinCanvas, spinCtx;
let spinAngle = 0;
let spinVelocity = 0;
let spinAnimId = null;
let isSpinning = false;

// Bảng màu Superdesign: Phối hợp Cyan, Xanh dương, Ngọc bích, Tím Art Deco
const COLORS = [
  '#0088FF', // Electric Blue
  '#00D9FF', // Neon Cyan
  '#18C9A6', // Emerald Teal
  '#5B3EE4', // Deep Violet
  '#0284C7', // Sky Blue
  '#00B4D8', // Light Cyan
  '#10B981', // Mint Emerald
  '#6366F1', // Indigo
  '#0077FF', // Vibrant Blue
  '#2DD4BF', // Turquoise
  '#4F46E5', // Royal Indigo
  '#0D9488', // Teal
  '#38BDF8', // Soft Sky
  '#14B8A6', // Aqua
  '#7C3AED', // Vivid Purple
  '#06B6D4'  // Pure Cyan
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
  const size = Math.min(container.clientWidth - 16, 330);
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
    spinCtx.fillStyle = '#FFFFFF';
    spinCtx.beginPath();
    spinCtx.arc(cx, cy, r, 0, Math.PI * 2);
    spinCtx.fill();
    spinCtx.strokeStyle = '#C5A059';
    spinCtx.lineWidth = 3;
    spinCtx.stroke();
    spinCtx.fillStyle = '#55708D';
    spinCtx.font = `600 ${Math.min(14, r / 5)}px "Clash Display", sans-serif`;
    spinCtx.textAlign = 'center';
    spinCtx.fillText('Chưa có người chơi', cx, cy);
    return;
  }

  const sliceAngle = (Math.PI * 2) / n;

  // Vẽ các ô
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
    spinCtx.lineWidth = 2.5;
    spinCtx.stroke();

    // Tên người chơi
    spinCtx.save();
    spinCtx.translate(cx, cy);
    spinCtx.rotate(start + sliceAngle / 2);
    spinCtx.textAlign = 'right';

    const fontSize = Math.max(10, Math.min(13, r / (n * 0.52)));
    spinCtx.font = `700 ${fontSize}px "Clash Display", "Be Vietnam Pro", sans-serif`;
    spinCtx.fillStyle = '#FFFFFF';
    spinCtx.shadowColor = 'rgba(16, 35, 61, 0.7)';
    spinCtx.shadowBlur = 3;

    const maxLen = Math.max(5, Math.floor(18 / Math.sqrt(n)));
    let name = p.name;
    if (name.length > maxLen) name = name.slice(0, maxLen - 1) + '…';

    spinCtx.fillText(name, r - 12, fontSize / 3);
    spinCtx.restore();
  });

  // Vành ngoài đậm chất Art Deco
  spinCtx.beginPath();
  spinCtx.arc(cx, cy, r, 0, Math.PI * 2);
  spinCtx.strokeStyle = '#10233D';
  spinCtx.lineWidth = 4;
  spinCtx.stroke();

  // Mũi tên định vị ở đỉnh
  spinCtx.save();
  spinCtx.translate(cx, 0);
  spinCtx.beginPath();
  spinCtx.moveTo(0, r * 0.14);
  spinCtx.lineTo(-13, -2);
  spinCtx.lineTo(13, -2);
  spinCtx.closePath();
  spinCtx.fillStyle = '#00D9FF';
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
  isSpinning = true;
  spinVelocity = 0.28 + Math.random() * 0.2;

  function animate() {
    spinAngle += spinVelocity;
    spinVelocity *= 0.985;

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
  const normalized = ((spinAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const pointerAngle = (Math.PI * 2 - normalized + Math.PI * 2) % (Math.PI * 2);
  const idx = Math.floor(pointerAngle / sliceAngle) % n;
  const winner = players[idx];

  playCelebration();

  const challenge = randItem(DATA.spins);

  showModal(`
    <div class="text-center space-y-3.5">
      <div class="text-4xl">🎉</div>
      <h2 class="font-clash text-xs font-bold text-[#0088FF] uppercase tracking-widest">Trúng thưởng!</h2>
      <div class="font-clash text-xl sm:text-2xl font-black text-[#10233D] py-3 px-4 bg-[#E7FAFF] rounded-2xl border-2 border-[#00D9FF]">
        ${escHtml(winner.name)}
      </div>
      <div class="bg-[#FFFDF9] border border-[#E5DEC9] rounded-2xl p-4 text-left space-y-1.5 shadow-sm">
        <div class="text-[11px] font-bold text-[#C5A059] uppercase tracking-wider font-clash">⚡ Lệnh Phạt / Thử thách</div>
        <div class="font-clash font-bold text-[#10233D] text-base" id="spinChallengeTitleEl">${escHtml(challenge.title)}</div>
        <div class="text-[#55708D] text-xs sm:text-sm leading-relaxed" id="spinChallengeDescEl">${escHtml(challenge.desc)}</div>
      </div>
      <div class="flex gap-2.5 pt-1">
        <button onclick="closeModal()" class="flex-1 py-3 rounded-2xl bg-white border border-slate-300 text-[#10233D] text-xs font-bold active:scale-95">↩ Xong</button>
        <button onclick="changeSpinChallenge()" class="flex-1 py-3 rounded-2xl btn-deco-primary text-xs font-bold active:scale-95">🔀 Đổi lệnh khác</button>
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
let whoIsIndex = 1;

function pickWhoIsQuestion() {
  whoIsQuestion = randItem(DATA.whoIs);
  const qEl = document.getElementById('whoIsQuestion');
  const btnArea = document.getElementById('whoIsBtn');
  const orderEl = document.getElementById('whoIsOrder');

  whoIsIndex = (whoIsIndex % 99) + 1;
  if (orderEl) {
    orderEl.textContent = `CÂU HỎI SỐ ${whoIsIndex < 10 ? '0' + whoIsIndex : whoIsIndex}`;
  }

  if (qEl) {
    qEl.textContent = whoIsQuestion;
    qEl.classList.remove('text-slate-400');
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
// TRÒ 3: THẬT HAY THÁCH
// ─────────────────────────────────────────────────────────
let todPlayer = null;
let todCurrentMode = 'truth';
let todCurrentLevel = 'mild';

function pickToDPlayer() {
  const players = getActivePlayers();
  if (players.length === 0) { showToast('⚠️ Cần có người chơi!'); return; }
  todPlayer = randItem(players);
  const nameEl = document.getElementById('todPlayerName');
  if (nameEl) nameEl.textContent = todPlayer.name;
  playCelebration();
  showToast(`🎯 Đến lượt: ${todPlayer.name}`);
}

function quickPickToD(mode) {
  const players = getActivePlayers();
  if (!todPlayer && players.length > 0) {
    todPlayer = randItem(players);
    const nameEl = document.getElementById('todPlayerName');
    if (nameEl) nameEl.textContent = todPlayer.name;
  }

  todCurrentMode = mode;
  // Ngẫu nhiên chọn mức độ nhẹ hoặc cháy
  todCurrentLevel = Math.random() > 0.5 ? 'mild' : 'spicy';

  const pool = DATA[mode][todCurrentLevel] || DATA[mode]['mild'];
  const question = randItem(pool);

  const typeEl = document.getElementById('todCardType');
  const qEl = document.getElementById('todCardQuestion');
  const cardInner = document.getElementById('todCardInner');

  if (typeEl) {
    typeEl.textContent = `${mode === 'truth' ? 'THẬT' : 'THÁCH'} · ${todCurrentLevel === 'mild' ? 'NHẸ NHÀNG' : 'CHÁY PHỐ'}`;
    typeEl.className = `text-[11px] font-bold uppercase ${mode === 'truth' ? 'text-[#0088FF]' : 'text-[#5B3EE4]'}`;
  }
  if (qEl) {
    qEl.textContent = question;
  }

  // Hiệu ứng lật thẻ
  if (cardInner) {
    cardInner.classList.remove('flipped');
    setTimeout(() => cardInner.classList.add('flipped'), 100);
  }

  playClick();
}

function changeCurrentToD() {
  quickPickToD(todCurrentMode || 'truth');
}

function todGiveUp() {
  showModal(`
    <div class="text-center space-y-3.5">
      <div class="text-4xl">😅</div>
      <h2 class="font-clash text-base font-bold text-[#0088FF] uppercase tracking-wider">Chịu thua!</h2>
      <p class="text-[#10233D] text-xs sm:text-sm">
        <span class="font-bold">${todPlayer ? escHtml(todPlayer.name) : 'Người chơi'}</span> không dám thực hiện thử thách.<br>
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
// TRÒ 4: LẮC XÚC XẮC
// ─────────────────────────────────────────────────────────
let diceCount = 2;
let diceValues = [3, 4];
let diceShaking = false;

function setDiceCount(n) {
  diceCount = n;
  document.querySelectorAll('.dice-count-btn').forEach((b, i) => {
    b.classList.toggle('active-dice-btn', i + 1 === n);
  });
  playClick();
  rollDice();
}

function rollDice() {
  if (diceShaking) return;
  diceShaking = true;
  playDiceShake();

  const diceTip = document.getElementById('diceTip');
  if (diceTip) diceTip.classList.add('hidden');

  let frame = 0;
  const totalFrames = 15;

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
    die.className = `dice-cube flex items-center justify-center ${shaking ? 'dice-shake' : ''}`;
    die.setAttribute('data-val', val);
    die.innerHTML = getDiceDots(val);
    container.appendChild(die);
  });

  const total = values.reduce((a, b) => a + b, 0);
  const totalEl = document.getElementById('diceTotal');
  if (totalEl) totalEl.textContent = total;

  // Thanh Điểm May Mắn %
  const max = diceCount * 6;
  const min = diceCount;
  const percent = max > min ? Math.round(((total - min) / (max - min)) * 100) : 100;

  const bar = document.getElementById('diceProgressBar');
  const pEl = document.getElementById('dicePercent');
  if (bar) bar.style.width = `${Math.max(5, Math.min(100, percent))}%`;
  if (pEl) pEl.textContent = `${percent}%`;
}

function getDiceDots(n) {
  const positions = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 22], [75, 22], [25, 50], [75, 50], [25, 78], [75, 78]],
  };
  const dots = positions[n] || [];
  return `<svg viewBox="0 0 100 100" class="w-full h-full text-white">${dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="currentColor"/>`).join('')}</svg>`;
}

function showDiceTip() {
  const tipEl = document.getElementById('diceTip');
  if (!tipEl || diceValues.length === 0) return;
  const total = diceValues.reduce((a, b) => a + b, 0);
  const max = diceCount * 6;
  const min = diceCount;

  const freq = {};
  diceValues.forEach(v => freq[v] = (freq[v] || 0) + 1);
  const maxFreq = Math.max(...Object.values(freq));

  let tip = '';
  if (diceValues.length >= 2 && maxFreq === diceValues.length) {
    if (diceValues.length === 2) tip = '🎯 Đôi! Nhân phẩm cực đại – Chỉ định 1 người uống ngay!';
    else if (diceValues.length === 3) tip = '🔥 Bộ ba! Quyền lực tối thượng – Chọn 3 người uống cùng bạn!';
    else tip = '👑 Tứ quý! Bạn là chủ bàn hôm nay – Cả mâm nâng ly theo lệnh bạn!';
  } else if (total === min) {
    tip = '😬 Điểm thấp nhất có thể... Tự uống 1 ly giải đen nhé!';
  } else if (total === max) {
    tip = '🚀 Điểm tối đa! Cực may mắn – Chỉ định người uống tùy ý!';
  } else if (total >= max * 0.75) {
    tip = '💪 Điểm cao! Bạn được quyền ra 1 lệnh cho người bất kỳ.';
  } else if (total <= min + (max - min) * 0.25) {
    tip = '😅 Điểm thấp... Tự phạt 1 ngụm cho tỉnh táo!';
  } else {
    tip = '👍 Điểm trung bình – Mọi người nâng ly cụng cái nào!';
  }

  tipEl.textContent = tip;
  tipEl.classList.remove('hidden');
}

function toggleShakeSensor() {
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission().then(response => {
      if (response === 'granted') {
        setupShakeDetector();
        showToast('✅ Đã bật cảm biến lắc!');
      } else {
        showToast('❌ Cảm biến lắc bị từ chối');
      }
    });
  } else {
    setupShakeDetector();
    showToast('✅ Cảm biến lắc đã sẵn sàng!');
  }
}

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
      const diceSection = document.getElementById('section-dice');
      if (diceSection && !diceSection.classList.contains('hidden')) {
        rollDice();
      }
    }
  };

  window.addEventListener('devicemotion', handler, { passive: true });
}

// ─────────────────────────────────────────────────────────
// TRÒ 5: QUẢ BOM HẸN GIỜ
// ─────────────────────────────────────────────────────────
let bombTimer = null;
let bombEndTime = 0;
let bombTicking = false;
let bombDuration = 25;

function pickBombTopic() {
  const topic = randItem(DATA.bombTopics);
  const topicEl = document.getElementById('bombTopic');
  if (topicEl) {
    topicEl.textContent = topic;
    topicEl.classList.remove('text-slate-400');
    topicEl.classList.add('text-[#10233D]');
  }
  stopBomb();
  playClick();
}

function startBomb() {
  if (bombTicking) return;
  const topicEl = document.getElementById('bombTopic');
  if (!topicEl) return;

  bombTicking = true;
  bombDuration = 20 + Math.floor(Math.random() * 26); // 20 - 45s
  bombEndTime = Date.now() + bombDuration * 1000;

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

    const progress = 1 - (remainingMs / (bombDuration * 1000));
    tickSpeed = Math.max(250, 1000 - progress * 750);

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
        Quả bom đã phát nổ trên tay!<br>
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

function stopBomb() {
  bombTicking = false;
  clearTimeout(bombTimer);

  const startBtn = document.getElementById('bombStartBtn');
  const passBtn = document.getElementById('bombPassBtn');
  const timeDisplay = document.getElementById('bombTimeDisplay');

  if (startBtn) startBtn.classList.remove('hidden');
  if (passBtn) passBtn.classList.add('hidden');
  if (timeDisplay) timeDisplay.textContent = '00:25';
}

// ─────────────────────────────────────────────────────────
// NAVIGATION (5 TABS & DYNAMIC HEADER)
// ─────────────────────────────────────────────────────────
const SECTIONS = ['spin', 'whois', 'tod', 'dice', 'bomb'];

const HEADER_META = {
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
  dice: {
    title: 'LẮC XÚC XẮC',
    subtitle: 'Lắc điện thoại hoặc bấm nút để đo điểm'
  },
  bomb: {
    title: 'QUẢ BOM HẸN GIỜ',
    subtitle: 'Chuyền thật nhanh — đừng để bom phát nổ!'
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

  // Cập nhật Header Title & Subtitle theo tab
  const meta = HEADER_META[id] || HEADER_META['spin'];
  const hTitle = document.getElementById('headerTitle');
  const hSub = document.getElementById('headerSubtitle');
  if (hTitle) hTitle.textContent = meta.title;
  if (hSub) hSub.textContent = meta.subtitle;

  if (id === 'spin') {
    setTimeout(initSpinWheel, 50);
  }

  if (id !== 'bomb') stopBomb();

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
  renderMemberBar();
  showSection('spin');

  setDiceCount(2);

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

  console.log('🍺 Đại Chiến Bàn Nhậu (Superdesign Art Deco) - Sẵn sàng!');
});
