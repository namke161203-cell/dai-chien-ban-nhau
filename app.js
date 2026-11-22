// ============================================================
// APP.JS - Logic chính cho Đại Chiến Bàn Nhậu
// Giao diện: Maison de Jeux (trắng · xanh Pháp · serif)
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
  playTone(850, 'sine', 0.035, 0.12);
  playTone(1250, 'sine', 0.03, 0.08, 0.02);
}

function playDiceShake() {
  if (!state.soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    for (let i = 0; i < 6; i++) {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < data.length; j++) data[j] = (Math.random() * 2 - 1) * 0.35;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.07);
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
  notes.forEach((f, i) => playTone(f, 'triangle', 0.18, 0.22, i * 0.11));
}

function playBombTick(fast = false) {
  if (!state.soundEnabled) return;
  playTone(1100, 'square', 0.04, 0.18);
  if (fast) setTimeout(() => playTone(880, 'square', 0.04, 0.14), 50);
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
    playTone(55, 'sine', 0.7, 0.8);
    playTone(95, 'sine', 0.4, 0.6, 0.05);
  } catch (e) {}
}

function playSpinTick() {
  playTone(950, 'triangle', 0.025, 0.08);
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
  // Mặc định khởi tạo 16 người mẫu nếu chưa có
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

// Render thanh thành viên nằm ngang dưới header
function renderMemberBar() {
  const container = document.getElementById('memberBarList');
  const countBadge = document.getElementById('memberCountBadge');
  if (!container) return;

  const activeCount = getActivePlayers().length;
  const totalCount = state.players.length;
  if (countBadge) {
    countBadge.textContent = `${activeCount}/${totalCount}`;
    countBadge.className = `chip ${
      activeCount > 0
        ? ''
        : '!bg-[#FFF5F6] !text-[#C0223B] !border-[#F0CFD5]'
    }`;
  }

  container.innerHTML = '';

  // Nút + tròn mở modal nhập nhanh danh sách tên
  const addBtn = document.createElement('button');
  addBtn.className = 'w-10 h-10 rounded-full bg-gradient-to-br from-[#24457F] to-[#16336B] text-white font-semibold shadow-[0_0_0_1px_#16336B,0_0_0_3px_#FFFFFF,0_0_0_4px_rgba(184,148,90,0.55),0_8px_16px_-10px_rgba(22,51,107,0.8)] flex items-center justify-center shrink-0 active:scale-90 transition-transform';
  addBtn.title = 'Quản lý thành viên (nhập 16 tên)';
  addBtn.innerHTML = `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  `;
  addBtn.onclick = () => openPlayerModal();
  container.appendChild(addBtn);

  // Danh sách avatar từng người cuộn ngang
  state.players.forEach((p, idx) => {
    const item = document.createElement('button');
    item.className = 'flex flex-col items-center shrink-0 group transition-all duration-200';
    item.onclick = () => togglePlayer(idx);

    const char = getAvatarChar(p.name);
    const avatarClass = p.active ? 'avatar-on' : 'avatar-off';
    const textClass = p.active ? 'avatar-name-on' : 'avatar-name-off';

    item.innerHTML = `
      <div class="relative">
        <div class="${avatarClass}">${char}</div>
        ${p.active ? '<span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#B8945A] rounded-full border-2 border-white shadow-sm"></span>' : ''}
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
    <div class="space-y-5">
      <div class="flex items-start justify-between pb-3 border-b border-[#E6EBF3]">
        <div class="flex items-center gap-3">
          <div class="seal">👥</div>
          <div>
            <h3 class="font-serif text-xl font-semibold text-[#16336B] leading-tight">Quản lý Thành viên</h3>
            <p class="text-[11px] text-[#8A97AC] tracking-wide mt-0.5">Nhập danh sách hoặc chạm để bật/tắt</p>
          </div>
        </div>
        <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-white border border-[#E1E8F2] text-[#8A97AC] hover:text-[#16336B] hover:border-[#C9D6E8] flex items-center justify-center text-xs transition-colors">✕</button>
      </div>

      <!-- Bulk input -->
      <div class="space-y-2">
        <label class="eyebrow block">📋 Dán nhanh danh sách tên</label>
        <textarea id="modalBulkInput" rows="4"
          class="field"
          placeholder="Minh Tuấn&#10;Hồng Nhung&#10;Quang Hải&#10;... (mỗi tên 1 dòng hoặc cách nhau dấu phẩy)"></textarea>
        <button class="btn-primary text-[11px] py-3 w-full" onclick="addPlayersFromTextarea()">
          Lưu danh sách
        </button>
      </div>

      <!-- Quick actions -->
      <div class="flex gap-2">
        <button class="btn-secondary text-[10px] py-2.5 flex-1" onclick="addSamplePlayers()">
          🎲 Tạo 16 người mẫu
        </button>
        <button class="btn-danger text-[10px] py-2.5 px-3" onclick="clearPlayers()">
          🗑 Xóa hết
        </button>
      </div>

      <!-- Current players list -->
      <div class="space-y-2">
        <div class="flex justify-between items-center eyebrow">
          <span>Danh sách hiện tại</span>
          <span class="normal-case tracking-normal text-[10px] text-[#A9B4C4]">Chạm để bật/tắt</span>
        </div>
        <div id="modalPlayerList" class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1"></div>
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
    container.innerHTML = '<p class="text-center text-[#A9B4C4] py-4 col-span-2 text-[11px]">Chưa có người chơi nào.</p>';
    return;
  }
  state.players.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.className = `flex items-center gap-2 px-2.5 py-2 rounded-xl text-[11px] font-medium transition-all border ${
      p.active
        ? 'border-[#C9D9EF] bg-[#F3F7FC] text-[#16336B]'
        : 'border-[#E6EBF3] bg-[#FAFBFD] text-[#A9B4C4] opacity-80'
    }`;
    btn.innerHTML = `
      <span class="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold ${p.active ? 'bg-[#16336B] text-white' : 'bg-[#E9EEF6] text-[#A9B4C4]'}">${i + 1}</span>
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
    <div class="space-y-5">
      <div class="flex items-start justify-between pb-3 border-b border-[#E6EBF3]">
        <div class="flex items-center gap-3">
          <div class="seal">⚙️</div>
          <div>
            <h3 class="font-serif text-xl font-semibold text-[#16336B] leading-tight">Cài đặt & Luật Chơi</h3>
            <p class="text-[11px] text-[#8A97AC] tracking-wide mt-0.5">Maison de Jeux · Édition Bleue</p>
          </div>
        </div>
        <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-white border border-[#E1E8F2] text-[#8A97AC] hover:text-[#16336B] hover:border-[#C9D6E8] flex items-center justify-center text-xs transition-colors">✕</button>
      </div>

      <div class="space-y-3 text-[12px] leading-relaxed text-[#5B6A82]">
        <div class="flex items-center justify-between p-3.5 rounded-xl bg-[#FAFBFD] border border-[#E6EBF3]">
          <div>
            <div class="font-semibold text-[#16336B] text-[13px]">Âm thanh hiệu ứng</div>
            <div class="text-[11px] text-[#8A97AC] mt-0.5">Web Audio API synth sinh động</div>
          </div>
          <button onclick="toggleSound(); updateSettingsSoundBtn(this);" id="settingsSoundToggle" class="px-3.5 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide ${state.soundEnabled ? 'bg-[#EDF3FC] text-[#16336B] border border-[#C9D9EF]' : 'bg-[#F4F6FA] text-[#8A97AC] border border-[#E6EBF3]'}">
            ${state.soundEnabled ? 'BẬT 🔊' : 'TẮT 🔇'}
          </button>
        </div>

        <div class="p-4 rounded-xl bg-[#FAFBFD] border border-[#E6EBF3] space-y-2">
          <div class="font-semibold text-[#16336B] text-[13px]">🍺 Luật chơi mâm đông người</div>
          <p>• Nhấn vào avatar bất kỳ trên thanh thành viên để tạm ẩn người đang đi vệ sinh/bận nghe máy.</p>
          <p>• Bấm nút <strong class="text-[#16336B] font-semibold">+</strong> ở góc trái thanh thành viên để dán danh sách tên mới bất cứ lúc nào.</p>
          <p>• Chơi vui là chính, an toàn là trên hết – đã uống bia rượu thì không lái xe!</p>
        </div>
      </div>

      <button onclick="closeModal()" class="btn-primary w-full py-3.5 text-[12px]">Đã hiểu, chiến tiếp!</button>
    </div>
  `;
  showModal(html);
}

function updateSettingsSoundBtn(btn) {
  if (btn) {
    btn.textContent = state.soundEnabled ? 'BẬT 🔊' : 'TẮT 🔇';
    btn.className = `px-3.5 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide ${state.soundEnabled ? 'bg-[#EDF3FC] text-[#16336B] border border-[#C9D9EF]' : 'bg-[#F4F6FA] text-[#8A97AC] border border-[#E6EBF3]'}`;
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
// TRÒ 1: VÒNG QUAY NHÂN PHẨM (Xanh dương - Xanh ngọc - Tím pastel)
// ─────────────────────────────────────────────────────────
let spinCanvas, spinCtx;
let spinAngle = 0;
let spinVelocity = 0;
let spinAnimId = null;
let isSpinning = false;

// Bảng màu: các sắc xanh Pháp (navy → bleu de France)
const COLORS = [
  '#16336B', // Bleu marine
  '#2B5AA7', // Bleu de France
  '#1E4480',
  '#3E6BB5',
  '#274E92',
  '#4A78BE',
  '#1A3E7C',
  '#3565AC',
  '#16336B',
  '#2B5AA7',
  '#1E4480',
  '#3E6BB5',
  '#274E92',
  '#4A78BE',
  '#1A3E7C',
  '#3565AC'
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
  const size = Math.min(container.clientWidth - 16, 350);
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
    spinCtx.fillStyle = '#F5F8FD';
    spinCtx.beginPath();
    spinCtx.arc(cx, cy, r, 0, Math.PI * 2);
    spinCtx.fill();
    spinCtx.strokeStyle = '#D9E4F4';
    spinCtx.lineWidth = 2;
    spinCtx.stroke();
    spinCtx.fillStyle = '#93A1B6';
    spinCtx.font = `500 ${Math.min(14, r / 5)}px Jost, sans-serif`;
    spinCtx.textAlign = 'center';
    spinCtx.fillText('Chưa có người chơi', cx, cy);
    return;
  }

  const sliceAngle = (Math.PI * 2) / n;

  // Draw slices
  players.forEach((p, i) => {
    const start = spinAngle + i * sliceAngle;
    const end = start + sliceAngle;

    spinCtx.beginPath();
    spinCtx.moveTo(cx, cy);
    spinCtx.arc(cx, cy, r, start, end);
    spinCtx.closePath();
    spinCtx.fillStyle = COLORS[i % COLORS.length];
    spinCtx.fill();
    spinCtx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
    spinCtx.lineWidth = 1.5;
    spinCtx.stroke();

    // Text name
    spinCtx.save();
    spinCtx.translate(cx, cy);
    spinCtx.rotate(start + sliceAngle / 2);
    spinCtx.textAlign = 'right';

    const fontSize = Math.max(10, Math.min(13, r / (n * 0.52)));
    spinCtx.font = `600 ${fontSize}px Jost, sans-serif`;
    spinCtx.fillStyle = '#FFFFFF';
    spinCtx.shadowColor = 'rgba(9, 22, 45, 0.45)';
    spinCtx.shadowBlur = 3;

    const maxLen = 12;
    let name = p.name;
    if (name.length > maxLen) name = name.slice(0, maxLen - 1) + '…';

    spinCtx.fillText(name, r - 13, fontSize / 3);
    spinCtx.restore();
  });

  // Inner hairline around the central button
  spinCtx.beginPath();
  spinCtx.arc(cx, cy, 38, 0, Math.PI * 2);
  spinCtx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  spinCtx.lineWidth = 1;
  spinCtx.stroke();

  // Outer rings: fine gold line + navy rim
  spinCtx.beginPath();
  spinCtx.arc(cx, cy, r + 3, 0, Math.PI * 2);
  spinCtx.strokeStyle = 'rgba(184, 148, 90, 0.55)';
  spinCtx.lineWidth = 1;
  spinCtx.stroke();

  spinCtx.beginPath();
  spinCtx.arc(cx, cy, r, 0, Math.PI * 2);
  spinCtx.strokeStyle = '#16336B';
  spinCtx.lineWidth = 3;
  spinCtx.stroke();

  // Pointer at top
  spinCtx.save();
  spinCtx.translate(cx, cy - r);
  spinCtx.beginPath();
  spinCtx.moveTo(0, 20);
  spinCtx.lineTo(-11, -2);
  spinCtx.lineTo(11, -2);
  spinCtx.closePath();
  spinCtx.fillStyle = '#B8945A';
  spinCtx.strokeStyle = '#16336B';
  spinCtx.lineWidth = 2;
  spinCtx.fill();
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
  spinVelocity = 0.28 + Math.random() * 0.22;

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
    <div class="text-center space-y-4">
      <p class="eyebrow">Le Grand Tirage</p>
      <div class="text-4xl mb-1">🎉</div>
      <h2 class="font-serif text-2xl font-semibold text-[#16336B] tracking-wide">Trúng thưởng!</h2>
      <div class="font-serif text-2xl font-semibold text-[#16336B] py-3 px-4 bg-[#F4F8FE] border border-[#D9E4F4] rounded-xl shadow-[inset_0_1px_0_#FFFFFF]">
        ${escHtml(winner.name)}
      </div>
      <div class="bg-[#FAFBFD] border border-[#E3E9F2] rounded-xl p-4 text-left space-y-2">
        <div class="text-[9px] font-medium tracking-[0.24em] uppercase text-[#B8945A]">⚡ Lệnh phạt / Thử thách</div>
        <div class="font-semibold text-[#16336B] text-base" id="spinChallengeTitleEl">${escHtml(challenge.title)}</div>
        <div class="text-[#5B6A82] text-[13px] leading-relaxed" id="spinChallengeDescEl">${escHtml(challenge.desc)}</div>
      </div>
      <div class="flex gap-3 pt-1">
        <button onclick="closeModal()" class="flex-1 py-3 rounded-xl bg-white border border-[#DCE5F1] text-[#5B6A82] font-medium text-[12px] active:scale-95 transition-transform">↩ Xong</button>
        <button onclick="changeSpinChallenge()" class="flex-1 py-3 rounded-xl bg-gradient-to-br from-[#24457F] to-[#16336B] text-white font-medium text-[12px] tracking-wide shadow-[0_12px_24px_-14px_rgba(22,51,107,0.9)] active:scale-95 transition-transform">🔀 Đổi lệnh</button>
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
    qEl.classList.remove('placeholder-text');
    qEl.classList.add('chosen-text');
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
    countEl.classList.remove('count-final');
    countEl.classList.remove('hidden', 'scale-0');
    countEl.classList.add('scale-100');
  }

  playTone(520, 'sine', 0.25, 0.4);

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
      playTone(520, 'sine', 0.25, 0.4);
    } else {
      clearInterval(whoIsCountdown);
      whoIsCountdown = null;
      if (countEl) {
        countEl.classList.remove('scale-100');
        setTimeout(() => {
          countEl.textContent = '👆 CHỈ!';
          countEl.classList.add('count-final');
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
let todMode = null;
let todLevel = null;
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
  const intervalBase = 70;

  function roll() {
    const p = randItem(players);
    if (nameEl) nameEl.textContent = p.name;
    playTone(700 + Math.random() * 300, 'square', 0.04, 0.1);
    rollCount++;
    const delay = intervalBase + (rollCount / totalRolls) * 220;
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
  const modeColor = mode === 'truth' ? 'text-[#2B5AA7]' : 'text-[#C0223B]';
  const borderColor = mode === 'truth' ? 'border-[#C9D9EF]' : 'border-[#EBC9CF]';

  if (cardFront) {
    cardFront.className = `tod-card-face tod-card-front absolute inset-0 flex items-center justify-center bg-white border ${borderColor} shadow-[0_20px_44px_-30px_rgba(22,51,107,0.5)]`;
    cardFront.innerHTML = `
      <div class="text-center space-y-2.5 p-6">
        <div class="text-3xl">${mode === 'truth' ? '🤔' : '🔥'}</div>
        <div class="font-serif text-3xl font-semibold tracking-wide ${modeColor}">${modeLabel}</div>
        <div class="eyebrow">${levelLabel}</div>
        <div class="text-[9px] text-[#B8945A] font-medium tracking-[0.2em] uppercase pt-3 animate-pulse">Chạm để lật thẻ bài ✦</div>
      </div>`;
  }
  if (cardBack) {
    cardBack.className = `tod-card-face tod-card-back absolute inset-0 bg-white border ${borderColor} shadow-[0_20px_44px_-30px_rgba(22,51,107,0.5)] flex flex-col justify-between p-5`;
    cardBack.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between text-[9px] font-medium uppercase tracking-[0.2em]">
          <span class="${modeColor}">${modeLabel}</span>
          <span class="text-[#A9B4C4]">${levelLabel}</span>
        </div>
        <p class="text-[#1A2436] text-sm sm:text-[15px] font-medium leading-relaxed">${escHtml(content)}</p>
      </div>
      <div class="pt-2 border-t border-[#E6EBF3]">
        <span class="text-[10px] tracking-wide text-[#8A97AC]">Dành cho: <span class="text-[#16336B] font-semibold">${escHtml(todPlayer.name)}</span></span>
      </div>`;
  }

  cardArea.classList.remove('hidden');
  cardInner.classList.remove('flipped');
  setTimeout(() => cardInner.classList.add('flipped'), 60);
  playClick();
}

function todGiveUp() {
  showModal(`
    <div class="text-center space-y-4">
      <p class="eyebrow">Sans courage</p>
      <div class="text-4xl">😅</div>
      <h2 class="font-serif text-2xl font-semibold text-[#16336B] tracking-wide">Chịu thua!</h2>
      <p class="text-[#5B6A82] text-[13px] leading-relaxed">
        <span class="text-[#16336B] font-semibold">${todPlayer ? escHtml(todPlayer.name) : 'Người chơi'}</span> không dám thực hiện thử thách.<br>
        <span class="text-[#C0223B] font-semibold text-base">Phạt uống 1 ly! 🍺</span>
      </p>
      <button onclick="closeModal()" class="btn-primary w-full py-3.5 text-[12px]">OK, uống ngay!</button>
    </div>
  `);
  playTone(220, 'sawtooth', 0.4, 0.3);
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

  const diceTip = document.getElementById('diceTip');
  if (diceTip) diceTip.textContent = '';

  let frame = 0;
  const totalFrames = 18;

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
  return `<svg viewBox="0 0 100 100" class="w-full h-full text-[#16336B]">${dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="currentColor"/>`).join('')}</svg>`;
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

  if (typeof DeviceMotionEvent.requestPermission === 'function') {
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

function pickBombTopic() {
  const topic = randItem(DATA.bombTopics);
  const topicEl = document.getElementById('bombTopic');
  if (topicEl) {
    topicEl.textContent = topic;
    topicEl.classList.remove('placeholder-text');
    topicEl.classList.add('chosen-text');
  }
  const statusEl = document.getElementById('bombStatus');
  if (statusEl) statusEl.textContent = 'Nhấn BẮT ĐẦU khi cả mâm sẵn sàng!';
  stopBomb(false);
  playClick();
}

function startBomb() {
  if (bombTicking) return;
  const topicEl = document.getElementById('bombTopic');
  if (!topicEl || topicEl.classList.contains('placeholder-text')) {
    showToast('⚠️ Hãy chọn chủ đề trước!');
    return;
  }

  bombTicking = true;
  const duration = (20 + Math.floor(Math.random() * 26)) * 1000;
  bombEndTime = Date.now() + duration;

  const statusEl = document.getElementById('bombStatus');
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

    const progress = 1 - remaining / duration;
    tickSpeed = Math.max(280, 1200 - progress * 920);

    playBombTick(progress > 0.6);

    if (bombVisual) {
      bombVisual.classList.add('bomb-flash');
      setTimeout(() => bombVisual?.classList.remove('bomb-flash'), 120);
    }

    if (statusEl) {
      const dots = ['.', '..', '...'][Math.floor(Date.now() / 400) % 3];
      statusEl.textContent = `💣 Bom đang tích tắc${dots} Chuyền nhanh lên!`;
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
    statusEl.innerHTML = '<span class="text-[#C0223B] font-semibold text-lg animate-pulse">💥 BOM NỔ! Người đang cầm điện thoại UỐNG! 🍺</span>';
  }

  if (bombVisual) {
    bombVisual.classList.add('bomb-explode');
    setTimeout(() => bombVisual?.classList.remove('bomb-explode'), 1000);
  }

  const flashEl = document.getElementById('bombFlash');
  if (flashEl) {
    flashEl.style.opacity = '0.75';
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
// NAVIGATION (5 TABS GAME)
// ─────────────────────────────────────────────────────────
const SECTIONS = ['spin', 'whois', 'tod', 'dice', 'bomb'];

function showSection(id) {
  SECTIONS.forEach(s => {
    const el = document.getElementById(`section-${s}`);
    if (el) el.classList.toggle('hidden', s !== id);
  });

  document.querySelectorAll('.nav-btn').forEach(btn => {
    const isActive = btn.dataset.section === id;
    btn.classList.toggle('nav-active', isActive);
  });

  if (id === 'spin') {
    setTimeout(initSpinWheel, 50);
  }

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
  renderMemberBar();
  showSection('spin');
  setupShakeDetector();

  setDiceCount(2);
  renderDice([], false);

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

  console.log('🍺 Đại Chiến Bàn Nhậu (Maison de Jeux · Édition Bleue) - Ready!');
});
