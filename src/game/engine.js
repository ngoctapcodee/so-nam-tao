
/* ---- 00-util.js ---- */
/* ============ Tiện ích toán học, màu sắc, ngẫu nhiên ============ */
const TAU = Math.PI * 2;
const WW = 1920, WH = 1080; // khung logic 16:9

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const invLerp = (a, b, v) => clamp((v - a) / (b - a), 0, 1);
const smooth = (t) => t * t * (3 - 2 * t);
const sstep = (a, b, v) => smooth(invLerp(a, b, v));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t) => t * t * t;
const easeInQuad = (t) => t * t;
const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

function angDiff(a, b) {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}
const lerpAngle = (a, b, t) => a + angDiff(a, b) * t;

const V = (x, y) => ({ x, y });
const vadd = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
const vsub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
const vmul = (a, k) => ({ x: a.x * k, y: a.y * k });
const vlerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const vlen = (a) => Math.hypot(a.x, a.y);
const vdist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const dirv = (ang, len = 1) => ({ x: Math.cos(ang) * len, y: Math.sin(ang) * len });
const vnorm = (a) => { const l = Math.hypot(a.x, a.y) || 1; return { x: a.x / l, y: a.y / l }; };
const vrot = (p, c, ang) => {
  const s = Math.sin(ang), co = Math.cos(ang), dx = p.x - c.x, dy = p.y - c.y;
  return { x: c.x + dx * co - dy * s, y: c.y + dx * s + dy * co };
};

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// Bộ sinh ngẫu nhiên cho hoạt cảnh (có thể gieo hạt khi kiểm thử)
let RND = Math.random;
const rr = (a, b) => a + RND() * (b - a);
const ri = (a, b) => Math.floor(rr(a, b + 1));
const pickR = (arr) => arr[Math.floor(RND() * arr.length)];
function shuffleR(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(RND() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

// Bốc thăm công bằng bằng crypto (không bị thiên lệch modulo)
function cryptoInt(n) {
  try {
    if (window.crypto && window.crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      const lim = Math.floor(0x100000000 / n) * n;
      let x;
      do { window.crypto.getRandomValues(buf); x = buf[0]; } while (x >= lim);
      return x % n;
    }
  } catch (e) { /* bỏ qua */ }
  return Math.floor(Math.random() * n);
}
function cryptoSample(arr, k) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = cryptoInt(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a.slice(0, k);
}

// Nhiễu mượt 1 chiều (tổng các sin lệch pha)
function noise1(t, seed) {
  return Math.sin(t * 1.93 + seed) * 0.5 + Math.sin(t * 3.71 + seed * 1.7) * 0.3 + Math.sin(t * 7.13 + seed * 2.3) * 0.2;
}

// Màu
function hex2rgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgb2hex(r, g, b) {
  const c = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}
const _mixCache = new Map();
function mix(c1, c2, t) {
  t = clamp(t, 0, 1);
  const key = c1 + c2 + Math.round(t * 100);
  let v = _mixCache.get(key);
  if (v) return v;
  const a = hex2rgb(c1), b = hex2rgb(c2);
  v = rgb2hex(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
  if (_mixCache.size > 4000) _mixCache.clear();
  _mixCache.set(key, v);
  return v;
}
const shade = (c, f) => (f < 1 ? mix(c, '#101018', 1 - f) : mix(c, '#ffffff', f - 1));
function rgba(c, a) { const [r, g, b] = hex2rgb(c); return `rgba(${r},${g},${b},${a})`; }

// Vẽ nhanh
function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function ellipse(ctx, x, y, rx, ry, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, TAU);
}
function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, Math.max(0.01, r), 0, TAU); }
function line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

const FONT_UI = '"Be Vietnam Pro", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const FONT_DISPLAY = '"Chakra Petch", "Be Vietnam Pro", "Segoe UI", Arial, sans-serif';

/* ---- 01-names.js ---- */
/* ============ Xử lý danh sách học sinh ============ */
const NAME_MAX = 60;

function titleCaseVN(s) {
  return s
    .toLocaleLowerCase('vi')
    .split(' ')
    .map((w) => (w ? w.charAt(0).toLocaleUpperCase('vi') + w.slice(1) : w))
    .join(' ');
}

const HEADER_RE = /^(stt|tt|số thứ tự|họ và tên|họ tên|họ đệm|họ và đệm|tên|danh sách|lớp|ghi chú|học sinh)(\s|$)/iu;
const GENDER_RE = /^(nam|nữ|nu|male|female|x)$/iu;

// Dán từ Excel: có thể là "STT \t Họ đệm \t Tên \t Ngày sinh ..." hoặc "1. Nguyễn Văn An"
function parseNames(text) {
  // Nhập từng dòng: giữ nguyên tên người, nhóm, chữ viết tắt và mã số.
  // Chỉ áp dụng bộ đọc bảng Excel khi dữ liệu có cột tab.
  if (!String(text || '').includes('\t')) {
    return [...new Set(String(text || '').normalize('NFC').split(/\r?\n/)
      .map(line => line.trim().replace(/\s+/g, ' ')).filter(Boolean))];
  }
  const rows = [];
  const lines = String(text || '').normalize('NFC').split(/\r?\n/);
  for (const raw of lines) {
    if (!raw.trim()) continue;
    let cells = raw.split('\t').map((c) => c.trim()).filter(Boolean);
    if (cells.length === 1) cells = cells[0].split(/\s*[;|]\s*/).filter(Boolean);
    cells = cells
      .map((c) => c.replace(/^\s*\d+\s*[.)\-:]?\s+/, '').replace(/^\s*\d+\s*[.)\-:]\s*/, '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    const nameLike = cells.filter((c) => {
      if (GENDER_RE.test(c)) return false;
      const letters = (c.match(/\p{L}/gu) || []).length;
      const other = c.replace(/[\s\p{L}]/gu, '').length;
      return letters >= 2 && letters >= other * 2;
    });
    if (!nameLike.length) continue;
    const joined = (nameLike[0] + ' ' + (nameLike[1] || '')).trim();
    if (HEADER_RE.test(nameLike[0]) || HEADER_RE.test(joined)) continue;
    rows.push(nameLike);
  }
  // Nhận dạng kiểu bảng "Họ đệm | Tên": cột thứ hai là một từ và đa dạng (không phải cột lặp như "Kinh")
  const two = rows.filter((r) => r.length >= 2 && !/\s/.test(r[1]) && r[0].split(' ').length <= 3);
  let joinMode = false;
  if (rows.length && two.length >= rows.length * 0.6) {
    const freq = new Map();
    two.forEach((r) => { const k = r[1].toLocaleLowerCase('vi'); freq.set(k, (freq.get(k) || 0) + 1); });
    const maxF = Math.max(...freq.values());
    joinMode = two.length < 3 ? true : maxF < two.length * 0.4;
  }
  return rows.map((r) => {
    let name = joinMode && r.length >= 2 && !/\s/.test(r[1]) ? r[0] + ' ' + r[1] : r[0];
    name = name.replace(/\s+/g, ' ').trim();
    if (name === name.toLocaleUpperCase('vi') || name === name.toLocaleLowerCase('vi')) name = titleCaseVN(name);
    return name;
  }).filter(Boolean);
}

// Nhãn ngắn trên đầu nhân vật: tên gọi; trùng thì thêm tên đệm
function makeLabels(fullNames) {
  const words = fullNames.map((n) => n.split(' ').filter(Boolean));
  const k = fullNames.map(n => /^(nhóm|đội|tổ|team|group)(\s|$)/iu.test(n) ? n.split(' ').filter(Boolean).length : 1);
  const labelOf = (i) => words[i].slice(-k[i]).join(' ');
  for (let guard = 0; guard < 6; guard++) {
    const groups = new Map();
    fullNames.forEach((_, i) => {
      const l = labelOf(i).toLocaleLowerCase('vi');
      if (!groups.has(l)) groups.set(l, []);
      groups.get(l).push(i);
    });
    let changed = false;
    for (const g of groups.values()) {
      if (g.length < 2) continue;
      for (const i of g) if (k[i] < words[i].length) { k[i]++; changed = true; }
    }
    if (!changed) break;
  }
  const labels = fullNames.map((_, i) => labelOf(i));
  const seen = new Map();
  const count = new Map();
  labels.forEach((l) => count.set(l, (count.get(l) || 0) + 1));
  return labels.map((l) => {
    if (count.get(l) < 2) return l;
    const n = (seen.get(l) || 0) + 1;
    seen.set(l, n);
    return l + ' ' + n;
  });
}

const F_GIVEN = new Set('hương lan mai hoa trang thảo hằng nga nhung thu thủy thuỷ vy vi uyên yến chi hạnh hiền huyền loan ly my mỹ nhi nhàn quyên quỳnh thư trâm tuyết vân diệp oanh phượng thơ hân ngân nguyệt duyên châu ánh hồng liên như thúy thuý trinh tiên đào kiều trà linh ngọc hà phương dung lam mơ nhiên ngà quế sen trúc cúc huệ lụa na sương thắm thoa giao diễm hường mến nương thương xoan hoài hảo nhàn tuyền'.split(' '));
const M_GIVEN = new Set('hùng dũng cường tuấn huy khoa khang kiên long lâm nam nghĩa phong phúc quân quang sơn tài thắng thành thịnh tiến toàn trí trọng trung tùng việt vinh vũ đạt đức hải hiếu hưng duy đông bảo bình chiến công danh định hào hiệp hòa hoà hoan khải lực mạnh nhân nhật phát phi quốc sang tân thái thiện thuận tín toản tuân tường vương đăng khôi kha luân lộc lợi thông trường kiệt minh hoàng đạo sỹ sĩ thạch thiên vĩnh triều hoàn doanh cảnh chính cương đại điền giáp hậu hiển học khiêm kỳ lĩnh lương nguyên nhất phước quyết sáng tâm thanh thế thịnh thọ tiệp toại trình tuyển tỉnh vỹ vĩ'.split(' '));
const F_TWO = new Set(['minh anh', 'lan anh', 'mai anh', 'quỳnh anh', 'ngọc anh', 'phương anh', 'vân anh', 'kim anh', 'tú anh', 'hà anh', 'diệu anh', 'thục anh', 'bảo anh', 'hải anh', 'khánh linh', 'bảo ngọc', 'minh châu', 'bảo châu', 'anh thư', 'minh thư', 'thùy dương', 'thuỳ dương', 'ánh dương', 'khánh an', 'thanh tâm', 'minh tâm', 'thanh hà', 'thu hà', 'thanh xuân', 'thu trang', 'minh thu', 'khánh vy', 'tường vy', 'gia hân', 'bảo hân', 'ngọc hân', 'mỹ tâm', 'hồng nhung', 'thảo my', 'diễm my', 'tuệ minh', 'thanh thanh', 'minh ngọc', 'bích ngọc', 'như ý', 'mỹ duyên', 'kim ngân', 'bảo trâm']);
const M_TWO = new Set(['tuấn anh', 'đức anh', 'việt anh', 'hoàng anh', 'quang anh', 'duy anh', 'trung anh', 'thế anh', 'nhật anh', 'tùng dương', 'hải dương', 'đại dương', 'bình an', 'thiện tâm', 'đức tâm', 'minh khang', 'gia huy', 'gia bảo', 'nhật minh', 'minh khôi', 'đăng khoa', 'hải đăng', 'thanh tùng', 'xuân trường', 'thanh bình', 'minh quân', 'anh tuấn', 'gia khánh', 'quốc khánh', 'duy khánh']);
const F_MID = new Set(['thị']);
const M_MID = new Set(['văn', 'đức', 'hữu', 'công', 'mạnh', 'bá', 'quốc', 'trọng', 'đình', 'viết', 'duy', 'tiến', 'thế', 'quang']);

function guessGender(full) {
  const w = full.toLocaleLowerCase('vi').split(' ').filter(Boolean);
  if (w.length === 0) return 'm';
  const given = w[w.length - 1];
  const two = w.slice(-2).join(' ');
  const mids = w.slice(1, -1);
  if (mids.some((m) => F_MID.has(m))) return 'f';
  if (F_TWO.has(two)) return 'f';
  if (M_TWO.has(two)) return 'm';
  if (mids.some((m) => M_MID.has(m)) && !F_GIVEN.has(given)) return 'm';
  if (F_GIVEN.has(given)) return 'f';
  if (M_GIVEN.has(given)) return 'm';
  return hashStr(full) & 1 ? 'f' : 'm';
}


const DEFAULT_SCREAMS = [
  'Em chưa học bàiii!',
  'Thầy ơi cứuuu!',
  'Cho em khất một hôm!',
  'Sao lại là emmm?!',
  'Em mới ôn có một nửa!',
  'Mẹ ơiii!',
  'Áaaaa!',
  'Tha cho emmm!',
  'Em thuộc bài rồi mà!',
  'Không phải emmm!',
];

/* ---- 02-audio.js ---- */
/* ============ Âm thanh tổng hợp bằng Web Audio (không cần file ngoài) ============ */
const Sfx = {
  ctx: null,
  master: null,
  muted: false,
  silent: false,
  noiseBuf: null,
  siren: null,
  hum: null,
  wind: null,

  init() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        const comp = this.ctx.createDynamicsCompressor();
        comp.threshold.value = -14; comp.ratio.value = 4;
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.85;
        this.master.connect(comp);
        comp.connect(this.ctx.destination);
        const len = Math.floor(this.ctx.sampleRate * 2);
        const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        this.noiseBuf = buf;
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { this.ctx = null; }
  },
  ok() { return !!(this.ctx && this.master) && !this.silent; },
  setMuted(m) {
    this.muted = m;
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.85, this.ctx.currentTime, 0.05);
  },
  _noise() { const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true; return s; },
  _osc(type, f) { const o = this.ctx.createOscillator(); o.type = type; o.frequency.value = f; return o; },
  _gain(v) { const g = this.ctx.createGain(); g.gain.value = v; return g; },
  _filter(type, f, q = 1) { const b = this.ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; },
  _stopLater(nodes, t) { nodes.forEach((n) => { try { n.stop(t); } catch (e) { /* */ } }); },

  sirenOn() {
    if (!this.ok() || this.siren) return;
    const c = this.ctx, t = c.currentTime;
    const o1 = this._osc('sawtooth', 760), o2 = this._osc('square', 764);
    const lfo = this._osc('triangle', 0.62), lg = this._gain(300);
    lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
    const f = this._filter('lowpass', 2000, 0.8);
    const g2 = this._gain(0.35), g = this._gain(0);
    o1.connect(f); o2.connect(g2); g2.connect(f); f.connect(g); g.connect(this.master);
    g.gain.setTargetAtTime(0.075, t, 0.12);
    o1.start(t); o2.start(t); lfo.start(t);
    this.siren = { nodes: [o1, o2, lfo], g };
  },
  sirenOff() {
    if (!this.ok() || !this.siren) return;
    const t = this.ctx.currentTime;
    this.siren.g.gain.cancelScheduledValues(t);
    this.siren.g.gain.setTargetAtTime(0, t, 0.25);
    this._stopLater(this.siren.nodes, t + 1.6);
    this.siren = null;
  },

  humOn() {
    if (!this.ok() || this.hum) return;
    const c = this.ctx, t = c.currentTime;
    const o1 = this._osc('sine', 55), o2 = this._osc('triangle', 110.4), o3 = this._osc('sine', 880);
    const vib = this._osc('sine', 0.7), vg = this._gain(2.5);
    vib.connect(vg); vg.connect(o1.frequency); vg.connect(o2.frequency);
    const trem = this._osc('sine', 11), tg = this._gain(0.012);
    const g3 = this._gain(0.014); trem.connect(tg); tg.connect(g3.gain);
    const f = this._filter('lowpass', 700, 0.7);
    const g = this._gain(0);
    o1.connect(f); o2.connect(f); f.connect(g); o3.connect(g3); g3.connect(g); g.connect(this.master);
    g.gain.setTargetAtTime(0.26, t, 0.5);
    [o1, o2, o3, vib, trem].forEach((n) => n.start(t));
    this.hum = { nodes: [o1, o2, o3, vib, trem], o1, o2, o3, g };
  },
  humOff(rise) {
    if (!this.ok() || !this.hum) return;
    const t = this.ctx.currentTime, h = this.hum;
    if (rise) {
      h.o1.frequency.cancelScheduledValues(t); h.o1.frequency.setValueAtTime(55, t); h.o1.frequency.exponentialRampToValueAtTime(260, t + 0.8);
      h.o2.frequency.cancelScheduledValues(t); h.o2.frequency.setValueAtTime(110, t); h.o2.frequency.exponentialRampToValueAtTime(520, t + 0.8);
    }
    h.g.gain.cancelScheduledValues(t);
    h.g.gain.setTargetAtTime(0, t + (rise ? 0.25 : 0), 0.25);
    this._stopLater(h.nodes, t + 2);
    this.hum = null;
  },

  windOn() {
    if (!this.ok() || this.wind) return;
    const c = this.ctx, t = c.currentTime;
    const n1 = this._noise(), n2 = this._noise();
    const bp = this._filter('bandpass', 500, 0.7), lp = this._filter('lowpass', 220, 0.7);
    const g1 = this._gain(0), g2 = this._gain(0);
    n1.connect(bp); bp.connect(g1); g1.connect(this.master);
    n2.connect(lp); lp.connect(g2); g2.connect(this.master);
    n1.start(t); n2.start(t, 0.7);
    this.wind = { nodes: [n1, n2], bp, g1, g2 };
  },
  setWind(level, gust) {
    if (!this.ok() || !this.wind) return;
    const t = this.ctx.currentTime, w = this.wind;
    w.g1.gain.setTargetAtTime(level * 0.2, t, 0.12);
    w.g2.gain.setTargetAtTime(level * 0.32, t, 0.2);
    w.bp.frequency.setTargetAtTime(380 + level * 800 + gust * 400, t, 0.15);
  },
  windOff() {
    if (!this.ok() || !this.wind) return;
    const t = this.ctx.currentTime, w = this.wind;
    w.g1.gain.setTargetAtTime(0, t, 0.2); w.g2.gain.setTargetAtTime(0, t, 0.3);
    this._stopLater(w.nodes, t + 2);
    this.wind = null;
  },

  beam() {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime;
    const o = this._osc('sawtooth', 70), f = this._filter('lowpass', 180, 9), g = this._gain(0);
    f.frequency.setValueAtTime(180, t); f.frequency.exponentialRampToValueAtTime(2600, t + 0.7);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.16, t + 0.06); g.gain.exponentialRampToValueAtTime(0.001, t + 1.3);
    o.connect(f); f.connect(g); g.connect(this.master);
    const s = this._osc('sine', 180), sg = this._gain(0);
    s.frequency.exponentialRampToValueAtTime(760, t + 0.6);
    sg.gain.setValueAtTime(0, t); sg.gain.linearRampToValueAtTime(0.09, t + 0.05); sg.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
    s.connect(sg); sg.connect(this.master);
    o.start(t); s.start(t); o.stop(t + 1.4); s.stop(t + 1.1);
  },
  whoop() {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime;
    const base = 380 + Math.random() * 120;
    const o = this._osc('sine', base), g = this._gain(0);
    o.frequency.setValueAtTime(base, t); o.frequency.exponentialRampToValueAtTime(base * 3.8, t + 0.95);
    const lfo = this._osc('sine', 9), lg = this._gain(28); lfo.connect(lg); lg.connect(o.detune);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.13, t + 0.04);
    g.gain.setValueAtTime(0.13, t + 0.7); g.gain.exponentialRampToValueAtTime(0.001, t + 1.05);
    o.connect(g); g.connect(this.master);
    o.start(t); lfo.start(t); o.stop(t + 1.1); lfo.stop(t + 1.1);
  },
  pop() {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime;
    const o = this._osc('sine', 480), g = this._gain(0);
    o.frequency.setValueAtTime(480, t); o.frequency.exponentialRampToValueAtTime(1400, t + 0.07);
    g.gain.setValueAtTime(0.22, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.2);
  },
  slam() {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime;
    const n = this._noise(), f = this._filter('lowpass', 900, 0.8), g = this._gain(0);
    g.gain.setValueAtTime(0.55, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    n.connect(f); f.connect(g); g.connect(this.master); n.start(t); n.stop(t + 0.4);
    const o = this._osc('sine', 120), og = this._gain(0);
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.35);
    og.gain.setValueAtTime(0.7, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    o.connect(og); og.connect(this.master); o.start(t); o.stop(t + 0.55);
    [196, 293].forEach((fr) => {
      const m = this._osc('square', fr), mf = this._filter('bandpass', 1400, 2), mg = this._gain(0);
      mg.gain.setValueAtTime(0.05, t); mg.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      m.connect(mf); mf.connect(mg); mg.connect(this.master); m.start(t); m.stop(t + 0.6);
    });
  },
  flyAway() {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime;
    const o = this._osc('sine', 260), g = this._gain(0);
    o.frequency.setValueAtTime(260, t); o.frequency.exponentialRampToValueAtTime(2600, t + 0.75);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.05); g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.95);
    const n = this._noise(), f = this._filter('bandpass', 400, 1.2), ng = this._gain(0);
    f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(4200, t + 0.7);
    ng.gain.setValueAtTime(0, t); ng.gain.linearRampToValueAtTime(0.14, t + 0.1); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
    n.connect(f); f.connect(ng); ng.connect(this.master); n.start(t); n.stop(t + 0.9);
  },
  ting() {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime;
    [[2637, 0], [3951, 0.09]].forEach(([fr, dt]) => {
      const o = this._osc('sine', fr), g = this._gain(0);
      g.gain.setValueAtTime(0, t + dt); g.gain.linearRampToValueAtTime(0.07, t + dt + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + dt + 0.8);
      o.connect(g); g.connect(this.master); o.start(t + dt); o.stop(t + dt + 0.85);
    });
  },
  fanfare() {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime;
    [[523.25, 0, 0.14], [659.25, 0.12, 0.14], [783.99, 0.24, 0.14], [1046.5, 0.36, 0.55]].forEach(([fr, dt, dur]) => {
      const o = this._osc('triangle', fr), g = this._gain(0);
      g.gain.setValueAtTime(0, t + dt); g.gain.linearRampToValueAtTime(0.13, t + dt + 0.015); g.gain.exponentialRampToValueAtTime(0.001, t + dt + dur);
      o.connect(g); g.connect(this.master); o.start(t + dt); o.stop(t + dt + dur + 0.05);
    });
  },
  blip() {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime;
    const o = this._osc('sine', 900), g = this._gain(0);
    g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.08);
  },
  stopAll() {
    const s = this.silent; this.silent = false;
    this.sirenOff(); this.humOff(false); this.windOff();
    this.silent = s;
  },
};

/* ---- 03-env.js ---- */
/* ============ Bối cảnh: bầu trời, nhà phố, mặt đường (lớp tĩnh vẽ sẵn: bản ngày + bản đêm) ============ */
const GROUND = {
  backTop: 690, backBot: 744, roadTop: 756, roadBot: 900, frontTop: 912, bottom: WH,
};
// Bảng màu dịu, cùng một họ màu cho cả dãy phố
const HOUSE_COLORS = ['#efe4d1', '#e6d6c0', '#dfe3d4', '#e9ddd5', '#d9e2e4', '#ece6d8'];
const SHUTTER_COLORS = ['#7f9e88', '#8497a8'];
const SIGN_STYLES = [
  ['#b24c3f', '#fff1dc'], // đỏ gạch
  ['#2f6d68', '#f2faf7'], // xanh két
  ['#3c4b64', '#eef2f7'], // xanh than
  ['#c69a42', '#3b2a12'], // vàng mù tạt
];
const SIGN_TEXTS = ['CỔNG ĐỊA PHỦ', 'CẦU NẠI HÀ', 'ĐIỆN DIÊM VƯƠNG', 'SỔ SINH TỬ', 'TRẠM ĐẦU THAI', 'PHỦ NAM TÀO', 'QUÁN MẠNH BÀ', 'TY PHÁN QUAN', 'KHO CÔNG ĐỨC', 'BẾN VONG XUYÊN', 'ĐƯỜNG HOÀNG TUYỀN', 'PHÒNG TRA SỔ', 'BƯU CỤC ÂM GIỚI', 'CỔNG LUÂN HỒI'];
const GOODS = ['#c9a24a', '#b86b5a', '#6f9aa0', '#d8d2c0', '#8aa37a'];
const CREAM = '#f6efe2';

// Độ sâu → tỉ lệ (xa nhỏ, gần to)
const depthScale = (y) => 0.58 + 0.42 * clamp((y - 690) / (1060 - 690), 0, 1);

function buildStatic(px) {
  const mk = () => {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(WW * px));
    c.height = Math.max(1, Math.round(WH * px));
    return c;
  };
  const cv = mk();
  const ctx = cv.getContext('2d');
  ctx.scale(px, px);
  const rng = mulberry32(20260929);
  const info = { windows: [], signs: [], details: [] };
  drawSkyline(ctx, rng);
  drawHouses(ctx, rng, info);
  drawUtility(ctx);
  drawStreetGround(ctx, rng);
  const night = buildNight(cv, info, px, mk);
  return { canvas: cv, night, info };
}

// Bản đêm: tối toàn bộ, cửa sổ sáng đèn nhưng vẫn nằm SAU lan can, chậu cây, dây điện...
function buildNight(day, info, px, mk) {
  const nv = mk();
  const c = nv.getContext('2d');
  c.drawImage(day, 0, 0);
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = 'rgba(12,14,42,0.56)';
  c.fillRect(0, 0, nv.width, nv.height);
  c.globalCompositeOperation = 'source-over';
  // lớp ánh đèn cửa sổ
  const lv = mk();
  const l = lv.getContext('2d');
  l.scale(px, px);
  for (const w of info.windows) {
    if (!w.lit) continue;
    const g = l.createLinearGradient(0, w.y, 0, w.y + w.h);
    g.addColorStop(0, w.warm ? 'rgba(255,222,150,0.95)' : 'rgba(214,232,255,0.85)');
    g.addColorStop(1, w.warm ? 'rgba(248,196,110,0.95)' : 'rgba(176,206,240,0.85)');
    l.fillStyle = g;
    l.fillRect(w.x, w.y, w.w, w.h);
  }
  // khoét bỏ phần bị chi tiết phía trước che (lan can, cây cảnh, cục nóng, dây điện)
  l.globalCompositeOperation = 'destination-out';
  for (const d of info.details) d(l);
  drawUtility(l);
  l.globalCompositeOperation = 'source-over';
  c.drawImage(lv, 0, 0);
  // biển hiệu phát sáng nhẹ
  c.setTransform(px, 0, 0, px, 0, 0);
  for (const s of info.signs) {
    c.fillStyle = rgba(s.bg, 0.78);
    c.fillRect(s.x, s.y, s.w, s.h);
    c.font = `800 ${s.fs}px ${FONT_UI}`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = s.fg;
    c.fillText(s.text, s.x + s.w / 2, s.y + 21);
  }
  return nv;
}

function drawSkyline(ctx, rng) {
  let x = -30;
  while (x < WW + 40) {
    const w = 70 + rng() * 90;
    const h = 300 + rng() * 190;
    const top = GROUND.backTop - h;
    ctx.fillStyle = rng() < 0.5 ? '#c6d6e3' : '#cfdce8';
    ctx.fillRect(x, top, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let yy = top + 14; yy < GROUND.backTop - 20; yy += 22) {
      for (let xx = x + 10; xx < x + w - 12; xx += 18) ctx.fillRect(xx, yy, 8, 11);
    }
    if (rng() < 0.35) { ctx.fillStyle = '#b9c9d6'; ctx.fillRect(x + w * 0.45, top - 36, 3, 36); }
    x += w + 6 + rng() * 30;
  }
}

function drawHouses(ctx, rng, info) {
  let x = -24;
  let si = Math.floor(rng() * SIGN_TEXTS.length);
  let ci = Math.floor(rng() * HOUSE_COLORS.length);
  while (x < WW + 30) {
    const w = 150 + rng() * 80;
    const h = 300 + rng() * 115;
    ci = (ci + 1 + Math.floor(rng() * 2)) % HOUSE_COLORS.length;
    drawHouse(ctx, x, w, h, rng, info, SIGN_TEXTS[si % SIGN_TEXTS.length], SIGN_STYLES[si % SIGN_STYLES.length], HOUSE_COLORS[ci]);
    si++;
    x += w;
  }
}

function drawHouse(ctx, x, w, h, rng, info, signText, signStyle, wall) {
  const base = GROUND.backTop;
  const top = base - h;
  ctx.fillStyle = wall;
  ctx.fillRect(x, top, w, h);
  ctx.fillStyle = shade(wall, 0.93);
  ctx.fillRect(x + w - 6, top, 6, h);
  // mái
  if (rng() < 0.2) {
    ctx.fillStyle = '#b8715c';
    ctx.beginPath();
    ctx.moveTo(x - 6, top + 4); ctx.lineTo(x + w * 0.2, top - 26); ctx.lineTo(x + w * 0.8, top - 26); ctx.lineTo(x + w + 6, top + 4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 2;
    for (let i = 1; i < 6; i++) line(ctx, x + w * 0.2 - 4 + i * w * 0.12, top - 24, x + i * w * 0.18, top + 3);
  } else {
    ctx.fillStyle = shade(wall, 0.86);
    ctx.fillRect(x - 2, top - 8, w + 4, 12);
    if (rng() < 0.45) {
      const tx = x + 20 + rng() * (w - 80);
      ctx.fillStyle = '#9aa2ab'; ctx.fillRect(tx + 6, top - 22, 4, 14); ctx.fillRect(tx + 38, top - 22, 4, 14);
      ctx.fillStyle = '#d9dfe5'; rrect(ctx, tx, top - 44, 48, 24, 12); ctx.fill();
      ctx.fillStyle = '#eef2f5'; ctx.fillRect(tx + 8, top - 40, 32, 4);
    }
  }
  // tầng trên
  const gf = 118;
  const floorTop = base - gf - 8;
  const nFloors = Math.max(1, Math.floor((floorTop - top - 10) / 92));
  const shutter = SHUTTER_COLORS[Math.floor(rng() * SHUTTER_COLORS.length)];
  for (let f = 0; f < nFloors; f++) {
    const fy = floorTop - (f + 1) * 92;
    const nWin = w > 185 ? 2 : 1;
    for (let k = 0; k < nWin; k++) {
      const ww = 46, wh = 60;
      const wx = nWin === 1 ? x + w / 2 - ww / 2 : x + (k + 0.5) * (w / nWin) - ww / 2;
      const wy = fy + 14;
      ctx.fillStyle = '#fbfaf5';
      ctx.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);
      if (rng() < 0.5) {
        ctx.fillStyle = shutter; ctx.fillRect(wx, wy, ww, wh);
        ctx.strokeStyle = 'rgba(0,0,0,0.14)'; ctx.lineWidth = 1.2;
        for (let yy = wy + 5; yy < wy + wh; yy += 6) { line(ctx, wx + 2, yy, wx + ww / 2 - 1, yy); line(ctx, wx + ww / 2 + 1, yy, wx + ww - 2, yy); }
        line(ctx, wx + ww / 2, wy, wx + ww / 2, wy + wh);
      } else {
        ctx.fillStyle = '#a9c8da'; ctx.fillRect(wx, wy, ww, wh);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath(); ctx.moveTo(wx + 6, wy + wh - 6); ctx.lineTo(wx + ww * 0.55, wy + 4); ctx.lineTo(wx + ww * 0.75, wy + 4); ctx.lineTo(wx + 16, wy + wh - 6); ctx.fill();
        ctx.strokeStyle = '#fbfaf5'; ctx.lineWidth = 3; line(ctx, wx + ww / 2, wy, wx + ww / 2, wy + wh);
      }
      info.windows.push({ x: wx, y: wy, w: ww, h: wh, lit: rng() < 0.72, warm: rng() < 0.75 });
    }
    // ban công (lưu lại để khoét ánh đèn cửa sổ phía sau)
    if ((f + (w > 190 ? 1 : 0)) % 2 === 0) {
      const by = fy + 80;
      const railC = shade(wall, 0.8);
      const pots = [];
      const nPots = Math.floor(rng() * 3);
      for (let p = 0; p < nPots; p++) pots.push(x + 18 + rng() * (w - 44));
      const det = (c) => {
        c.fillStyle = railC; c.fillRect(x + 4, by, w - 10, 6);
        c.strokeStyle = 'rgba(70,70,80,0.5)'; c.lineWidth = 2;
        line(c, x + 6, by - 22, x + w - 8, by - 22);
        for (let bx = x + 10; bx < x + w - 8; bx += 9) line(c, bx, by - 22, bx, by);
        for (const px of pots) {
          c.fillStyle = '#a8704f'; c.fillRect(px, by - 12, 14, 12);
          c.fillStyle = '#6f9a6b';
          circle(c, px + 7, by - 18, 10); c.fill(); circle(c, px + 2, by - 14, 6); c.fill(); circle(c, px + 13, by - 14, 6); c.fill();
        }
      };
      det(ctx); info.details.push(det);
    }
    if (rng() < 0.3) {
      const ax = x + (rng() < 0.5 ? 10 : w - 44);
      const ay = fy + 30;
      const det = (c) => {
        c.fillStyle = '#eceff2'; c.fillRect(ax, ay, 30, 20);
        c.strokeStyle = '#a9b1bb'; c.lineWidth = 1.5; circle(c, ax + 11, ay + 10, 6); c.stroke();
      };
      det(ctx); info.details.push(det);
    }
  }
  // biển hiệu
  const sy = base - gf - 6;
  ctx.fillStyle = signStyle[0];
  ctx.fillRect(x + 6, sy, w - 12, 40);
  ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(x + 6, sy, w - 12, 4);
  let fs = 24;
  ctx.font = `800 ${fs}px ${FONT_UI}`;
  while (ctx.measureText(signText).width > w - 30 && fs > 12) { fs -= 1; ctx.font = `800 ${fs}px ${FONT_UI}`; }
  ctx.fillStyle = signStyle[1];
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(signText, x + w / 2, sy + 21);
  info.signs.push({ x: x + 6, y: sy, w: w - 12, h: 40, text: signText, bg: signStyle[0], fg: signStyle[1], fs });
  // mặt tiền cửa hàng
  const fx = x + 12, fw = w - 24, fyy = sy + 44, fh = base - fyy;
  if (rng() < 0.72) {
    ctx.fillStyle = '#4a4650'; ctx.fillRect(fx, fyy, fw, fh);
    for (let r = 0; r < 3; r++) {
      const ry = fyy + 14 + r * 20;
      ctx.fillStyle = '#6a6470'; ctx.fillRect(fx + 4, ry + 12, fw - 8, 3);
      for (let gx = fx + 8; gx < fx + fw - 12; gx += 11 + rng() * 8) {
        ctx.fillStyle = GOODS[Math.floor(rng() * GOODS.length)];
        ctx.globalAlpha = 0.85;
        ctx.fillRect(gx, ry + 2 + rng() * 3, 6 + rng() * 4, 10);
        ctx.globalAlpha = 1;
      }
    }
  } else {
    ctx.fillStyle = '#bcc0c7'; ctx.fillRect(fx, fyy, fw, fh);
    ctx.strokeStyle = '#a2a7b0'; ctx.lineWidth = 1.5;
    for (let yy = fyy + 5; yy < base; yy += 6) line(ctx, fx, yy, fx + fw, yy);
    ctx.fillStyle = '#4a4650'; ctx.fillRect(fx, base - 26, fw, 26);
  }
  // mái hiên sọc: màu biển hiệu + kem
  const aw = [signStyle[0], CREAM];
  const ay = fyy + 2;
  for (let i = 0, ax = fx - 4; ax < fx + fw + 4; ax += 16, i++) {
    ctx.fillStyle = aw[i % 2];
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + 16, ay); ctx.lineTo(ax + 18, ay + 18); ctx.lineTo(ax - 2, ay + 18); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(ax + 8, ay + 18, 9, 0, Math.PI); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(fx - 4, ay, fw + 8, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(x, top, 2, h);
}

function drawUtility(ctx) {
  // cột điện bê tông + vài đường dây điện
  const poles = [700, 1400];
  const topY = 380;
  poles.forEach((px) => {
    ctx.fillStyle = '#a0a6ac'; ctx.beginPath();
    ctx.moveTo(px - 7, GROUND.backTop + 30); ctx.lineTo(px - 4, topY); ctx.lineTo(px + 4, topY); ctx.lineTo(px + 7, GROUND.backTop + 30); ctx.fill();
    ctx.fillStyle = '#868d94'; ctx.fillRect(px - 26, topY + 12, 52, 5); ctx.fillRect(px - 20, topY + 34, 40, 4);
  });
  ctx.strokeStyle = 'rgba(45,45,55,0.6)'; ctx.lineWidth = 1.6;
  const ys = [topY + 12, topY + 34, topY + 16];
  const sags = [40, 30, 58];
  const pts = [-40, poles[0], poles[1], WW + 40];
  ys.forEach((y, i) => {
    for (let k = 0; k < pts.length - 1; k++) {
      const x1 = pts[k] + (k === 0 ? 0 : (i - 1) * 10), x2 = pts[k + 1] + (k === pts.length - 2 ? 0 : (i - 1) * 10);
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.quadraticCurveTo((x1 + x2) / 2, y + sags[i], x2, y); ctx.stroke();
    }
  });
}

function drawStreetGround(ctx, rng) {
  const G = GROUND;
  ctx.fillStyle = '#ece3d3'; ctx.fillRect(0, G.backTop, WW, G.backBot - G.backTop);
  ctx.strokeStyle = '#ddd1bb'; ctx.lineWidth = 1.5;
  line(ctx, 0, G.backTop + 18, WW, G.backTop + 18); line(ctx, 0, G.backTop + 36, WW, G.backTop + 36);
  for (let x = 0; x < WW; x += 40) { line(ctx, x, G.backTop, x - 6, G.backBot); }
  ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(0, G.backTop, WW, 5);
  ctx.fillStyle = '#dad3c4'; ctx.fillRect(0, G.backBot, WW, 5);
  ctx.fillStyle = '#aca596'; ctx.fillRect(0, G.backBot + 5, WW, G.roadTop - G.backBot - 5);
  const rg = ctx.createLinearGradient(0, G.roadTop, 0, G.roadBot);
  rg.addColorStop(0, '#6d7480'); rg.addColorStop(1, '#5f6671');
  ctx.fillStyle = rg; ctx.fillRect(0, G.roadTop, WW, G.roadBot - G.roadTop);
  for (let i = 0; i < 1200; i++) {
    ctx.fillStyle = rng() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(rng() * WW, G.roadTop + rng() * (G.roadBot - G.roadTop), 2, 2);
  }
  ctx.fillStyle = 'rgba(240,240,236,0.5)';
  ctx.fillRect(0, G.roadTop + 8, WW, 3); ctx.fillRect(0, G.roadBot - 9, WW, 3);
  ctx.fillStyle = '#efefe9';
  for (let x = 20; x < WW; x += 120) ctx.fillRect(x, 826, 62, 5);
  ctx.fillStyle = 'rgba(242,242,236,0.9)';
  for (let k = 0; k < 6; k++) {
    const x0 = 1552 + k * 30;
    ctx.beginPath(); ctx.moveTo(x0 + 6, G.roadTop + 12); ctx.lineTo(x0 + 22, G.roadTop + 12); ctx.lineTo(x0 + 16, G.roadBot - 12); ctx.lineTo(x0, G.roadBot - 12); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#535963'; ellipse(ctx, 330, 866, 34, 9); ctx.fill();
  ctx.strokeStyle = '#737a85'; ctx.lineWidth = 1.5; ellipse(ctx, 330, 866, 26, 6); ctx.stroke();
  ctx.fillStyle = '#9f988a'; ctx.fillRect(0, G.roadBot, WW, 3);
  ctx.fillStyle = '#d8d0bf'; ctx.fillRect(0, G.roadBot + 3, WW, G.frontTop - G.roadBot - 3);
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  for (let x = 0; x < WW; x += 90) ctx.fillRect(x, G.roadBot + 3, 2, G.frontTop - G.roadBot - 3);
  ctx.fillStyle = '#e9e1d2'; ctx.fillRect(0, G.frontTop, WW, WH - G.frontTop);
  ctx.strokeStyle = '#dacdb8'; ctx.lineWidth = 1.5;
  let row = 0;
  for (let y = G.frontTop; y < WH; y += 28, row++) {
    line(ctx, 0, y, WW, y);
    const off = row % 2 ? 30 : 0;
    for (let x = -off; x < WW; x += 60) line(ctx, x, y, x, y + 28);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(0, G.frontTop, WW, 4);
}

/* -------- Bầu trời động -------- */
function makeSkyStuff() {
  const rng = mulberry32(77);
  const stars = [];
  for (let i = 0; i < 90; i++) stars.push({ x: rng() * WW, y: rng() * 420, r: 0.8 + rng() * 1.6, p: rng() * TAU });
  const clouds = [];
  for (let i = 0; i < 6; i++) {
    const puffs = [];
    const n = 4 + Math.floor(rng() * 3);
    for (let k = 0; k < n; k++) puffs.push({ dx: (k - n / 2) * 34 + rng() * 14, dy: -Math.sin((k / (n - 1)) * Math.PI) * 26 + rng() * 8, r: 26 + rng() * 22 });
    clouds.push({ x: rng() * WW, y: 70 + rng() * 170, s: 0.7 + rng() * 0.6, puffs, v: 6 + rng() * 8 });
  }
  return { stars, clouds };
}

function drawSky(ctx, sky, d, time, storm) {
  const top = mix('#86c7ec', '#221e50', d);
  const bot = mix('#e1f1fa', '#5f4d80', d);
  const g = ctx.createLinearGradient(0, 0, 0, GROUND.backTop);
  g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(-60, -60, WW + 120, GROUND.backTop + 60);
  if (d < 1) {
    const sg = ctx.createRadialGradient(280, 140, 10, 280, 140, 220);
    sg.addColorStop(0, `rgba(255,252,228,${0.9 * (1 - d)})`);
    sg.addColorStop(0.25, `rgba(255,246,200,${0.45 * (1 - d)})`);
    sg.addColorStop(1, 'rgba(255,246,200,0)');
    ctx.fillStyle = sg; ctx.fillRect(40, -100, 480, 480);
  }
  const sa = sstep(0.35, 1, d);
  if (sa > 0) {
    for (const s of sky.stars) {
      ctx.fillStyle = `rgba(255,255,255,${sa * (0.55 + 0.45 * Math.sin(time * 2.2 + s.p))})`;
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }
  }
  const cc = mix('#ffffff', '#57507a', d);
  for (const c of sky.clouds) {
    ctx.fillStyle = rgba(cc, 0.92 - 0.25 * d);
    for (const p of c.puffs) { circle(ctx, c.x + p.dx * c.s, c.y + p.dy * c.s, p.r * c.s); ctx.fill(); }
    if (storm > 0) {
      ctx.fillStyle = `rgba(20,16,40,${0.25 * storm})`;
      for (const p of c.puffs) { circle(ctx, c.x + p.dx * c.s, c.y + p.dy * c.s + 6, p.r * c.s * 0.8); ctx.fill(); }
    }
  }
}
function updateClouds(sky, dt, storm, ufoX) {
  for (const c of sky.clouds) {
    if (storm > 0.05) {
      const dir = Math.sign(ufoX - c.x) || 1;
      c.x += (dir * (40 + 160 * storm) + c.v) * dt;
      if (Math.abs(ufoX - c.x) < 60) c.x = ufoX - dir * (700 + Math.random() * 400);
    } else {
      c.x += c.v * dt;
    }
    if (c.x > WW + 200) c.x = -200;
    if (c.x < -260) c.x = WW + 200;
  }
}

/* ---- 04-objects.js ---- */
/* ============ Phương tiện & vật thể trên phố ============ */
const CAR_COLORS = ['#c1574b', '#5d7ea6', '#f2f2ee'];
const BIKE_COLORS = ['#3a3d44', '#c9ced4', '#efeee9', '#a8473e', '#4f6d8f', '#6f7b5a', '#8a8f98', '#b99a64'];

function mkObj(type, x, y, facing, extra) {
  const o = Object.assign({ type, x, y, facing, s: depthScale(y), seed: Math.random() * 100, anchors: [] }, extra || {});
  return o;
}
function toWorld(o, lx, ly) { return { x: o.x + lx * o.s * o.facing, y: o.y + ly * o.s }; }
function addAnchor(o, type, lx, ly, extra) {
  const a = Object.assign({ type, obj: o, grip: toWorld(o, lx, ly), ground: o.y, depth: o.y + 6, taken: null }, extra || {});
  o.anchors.push(a);
  return a;
}
function objShake(o, env) {
  if (!env.W) return 0;
  return Math.sin(env.time * 23 + o.seed) * env.W * 1.4;
}

/* ---------- Ô tô ---------- */
function setupCar(o) {
  const s = o.s;
  addAnchor(o, 'wheel', -102, -38, { wheelR: 31 * s, depth: o.y + 8 });
  addAnchor(o, 'wheel', 104, -38, { wheelR: 31 * s, depth: o.y + 8 });
  addAnchor(o, 'handle', -41, -70, { depth: o.y + 6 });
  addAnchor(o, 'handle', 43, -70, { depth: o.y + 6 });
  addAnchor(o, 'handle', 158, -50, { depth: o.y + 7, low: true });
}
function drawCar(ctx, o, env) {
  const s = o.s, c = o.color;
  ctx.save();
  ctx.translate(o.x, o.y + objShake(o, env) * 0.6);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ellipse(ctx, 0, 1, 172 * s, 10 * s); ctx.fill();
  ctx.scale(s * o.facing, s);
  // thân xe
  ctx.beginPath();
  ctx.moveTo(-158, -24);
  ctx.lineTo(-164, -40);
  ctx.quadraticCurveTo(-168, -70, -150, -78);
  ctx.lineTo(-112, -82);
  ctx.quadraticCurveTo(-92, -86, -76, -118);
  ctx.quadraticCurveTo(-68, -131, -48, -132);
  ctx.lineTo(28, -132);
  ctx.quadraticCurveTo(46, -131, 58, -116);
  ctx.lineTo(88, -86);
  ctx.quadraticCurveTo(96, -82, 112, -80);
  ctx.lineTo(152, -74);
  ctx.quadraticCurveTo(168, -70, 167, -48);
  ctx.lineTo(163, -26);
  ctx.closePath();
  ctx.fillStyle = c; ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = shade(c, 0.78); ctx.fillRect(-170, -36, 340, 14);
  ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(-170, -82, 340, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(-170, -60, 340, 24);
  // hốc bánh
  ctx.fillStyle = '#23262d';
  [-102, 104].forEach((wx) => { circle(ctx, wx, -26, 37); ctx.fill(); });
  ctx.restore();
  ctx.strokeStyle = shade(c, 0.6); ctx.lineWidth = 2; ctx.stroke();
  // kính
  const glass = ctx.createLinearGradient(0, -128, 0, -84);
  glass.addColorStop(0, '#d9f1fb'); glass.addColorStop(1, '#8ec6e3');
  ctx.fillStyle = glass;
  ctx.beginPath(); ctx.moveTo(-100, -84); ctx.quadraticCurveTo(-86, -98, -76, -114); ctx.quadraticCurveTo(-66, -125, -50, -125); ctx.lineTo(-16, -125); ctx.lineTo(-16, -84); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-8, -84); ctx.lineTo(-8, -125); ctx.lineTo(26, -125); ctx.quadraticCurveTo(40, -124, 50, -112); ctx.lineTo(76, -86); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.moveTo(-60, -86); ctx.lineTo(-40, -123); ctx.lineTo(-30, -123); ctx.lineTo(-50, -86); ctx.fill();
  ctx.beginPath(); ctx.moveTo(10, -86); ctx.lineTo(30, -123); ctx.lineTo(36, -123); ctx.lineTo(16, -86); ctx.fill();
  ctx.fillStyle = '#2f3440'; ctx.fillRect(-16, -126, 8, 44);
  ctx.strokeStyle = '#2f3440'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-102, -83); ctx.lineTo(78, -85); ctx.stroke();
  // khe cửa, tay nắm
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2;
  line(ctx, -96, -82, -96, -30); line(ctx, -12, -84, -12, -30); line(ctx, 80, -84, 80, -32);
  ctx.fillStyle = shade(c, 0.55);
  rrect(ctx, -50, -73, 18, 5, 2); ctx.fill(); rrect(ctx, 34, -73, 18, 5, 2); ctx.fill();
  // gương
  ctx.fillStyle = '#2f3440'; ctx.fillRect(58, -92, 8, 6);
  ctx.fillStyle = c; rrect(ctx, 60, -100, 16, 11, 4); ctx.fill();
  // đèn
  ctx.fillStyle = env.hazard ? '#ffe9a8' : '#fff6cf'; ellipse(ctx, 154, -64, 11, 6.5); ctx.fill();
  ctx.strokeStyle = shade(c, 0.6); ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#e53935'; rrect(ctx, -165, -72, 9, 15, 3); ctx.fill();
  ctx.fillStyle = shade(c, 0.7); rrect(ctx, 150, -40, 18, 10, 4); ctx.fill(); rrect(ctx, -168, -40, 16, 10, 4); ctx.fill();
  if (o.taxi) {
    ctx.fillStyle = '#2f7f76'; rrect(ctx, -34, -146, 48, 16, 4); ctx.fill();
    ctx.save(); ctx.scale(o.facing, 1);
    ctx.fillStyle = '#ffffff'; ctx.font = `900 12px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('TAXI', -10 * o.facing, -137.5);
    ctx.restore();
    ctx.fillStyle = '#2f7f76'; ctx.fillRect(-150, -52, 302, 7);
  }
  // bánh xe
  [-102, 104].forEach((wx) => {
    ctx.fillStyle = '#1f2227'; circle(ctx, wx, -31, 31); ctx.fill();
    ctx.fillStyle = '#c9ced6'; circle(ctx, wx, -31, 18); ctx.fill();
    ctx.strokeStyle = '#9aa1ab'; ctx.lineWidth = 3;
    for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU + 0.3; line(ctx, wx, -31, wx + Math.cos(a) * 16, -31 + Math.sin(a) * 16); }
    ctx.fillStyle = '#7c838d'; circle(ctx, wx, -31, 6); ctx.fill();
  });
  ctx.restore();
}
function drawCarLights(ctx, o, env) {
  if (!env.hazard) return;
  const on = Math.sin(env.time * TAU * 1.4) > 0;
  if (!on) return;
  const s = o.s;
  [[154, -64], [-160, -64]].forEach(([lx, ly]) => {
    const p = toWorld(o, lx, ly);
    const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 34 * s);
    g.addColorStop(0, 'rgba(255,180,60,0.95)'); g.addColorStop(1, 'rgba(255,150,40,0)');
    ctx.fillStyle = g; circle(ctx, p.x, p.y, 34 * s); ctx.fill();
  });
}

/* ---------- Xe máy ---------- */
function setupBike(o) {
  addAnchor(o, 'handlebar', 66, -106, { depth: o.y + 5 });
}
function drawBike(ctx, o, env) {
  const s = o.s, c = o.color;
  ctx.save();
  const wob = objShake(o, env);
  ctx.translate(o.x, o.y);
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ellipse(ctx, 0, 1, 100 * s, 7 * s); ctx.fill();
  ctx.scale(s * o.facing, s);
  ctx.rotate(wob * 0.004);
  // ống xả
  ctx.fillStyle = '#9aa0a6'; rrect(ctx, -76, -30, 42, 8, 4); ctx.fill();
  // bánh
  [-62, 66].forEach((wx) => {
    ctx.fillStyle = '#1f2227'; circle(ctx, wx, -24, 24); ctx.fill();
    ctx.fillStyle = '#b9c0c9'; circle(ctx, wx, -24, 14); ctx.fill();
    ctx.fillStyle = '#6e757f'; circle(ctx, wx, -24, 5); ctx.fill();
  });
  // càng trước
  ctx.strokeStyle = '#8a9099'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  line(ctx, 58, -96, 66, -24);
  // chắn bùn trước
  ctx.strokeStyle = shade(c, 0.9); ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(66, -24, 29, Math.PI * 1.08, Math.PI * 1.75); ctx.stroke();
  // thân sau
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(-98, -52);
  ctx.quadraticCurveTo(-102, -82, -76, -88);
  ctx.lineTo(-18, -86);
  ctx.quadraticCurveTo(-4, -84, -3, -64);
  ctx.lineTo(-10, -44);
  ctx.lineTo(-70, -42);
  ctx.quadraticCurveTo(-92, -40, -98, -52);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = shade(c, 0.7); ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-80, -80, 50, 4);
  // sàn để chân
  ctx.fillStyle = '#4a4f58'; ctx.fillRect(-12, -42, 52, 10);
  // yếm trước
  ctx.fillStyle = shade(c, 0.95);
  ctx.beginPath();
  ctx.moveTo(34, -34); ctx.quadraticCurveTo(40, -70, 48, -100); ctx.lineTo(64, -102);
  ctx.quadraticCurveTo(62, -70, 54, -44); ctx.lineTo(42, -32); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = shade(c, 0.7); ctx.lineWidth = 1.5; ctx.stroke();
  // yên
  ctx.fillStyle = '#2b2d33'; rrect(ctx, -90, -98, 78, 13, 6); ctx.fill();
  // ghi-đông, gương, đèn
  ctx.strokeStyle = '#2b2d33'; ctx.lineWidth = 5; line(ctx, 44, -104, 70, -107);
  ctx.strokeStyle = '#555b63'; ctx.lineWidth = 2; line(ctx, 50, -105, 44, -124);
  ctx.fillStyle = '#3b3f46'; ellipse(ctx, 44, -127, 6, 4); ctx.fill();
  ctx.fillStyle = '#fff7cf'; ellipse(ctx, 70, -90, 7, 5.5); ctx.fill();
  ctx.fillStyle = '#e53935'; ctx.fillRect(-103, -68, 6, 9);
  // chân chống
  ctx.strokeStyle = '#555b63'; ctx.lineWidth = 3; line(ctx, -6, -32, -16, -1);
  ctx.restore();
}

/* ---------- Cột đèn ---------- */
function setupLamp(o) {
  const col = o.color;
  const hs = o.hugs || [-110, -250, -390];
  hs.forEach((h) => addAnchor(o, 'pole', 0, h, { depth: o.y + 5, poleX: o.x, poleW: 12 * o.s, poleColor: col, poleTop: o.y - 560 * o.s, poleBot: o.y }));
}
function drawLamp(ctx, o, env) {
  const s = o.s, c = o.color;
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ellipse(ctx, 0, 1, 22 * s, 5 * s); ctx.fill();
  ctx.scale(s * o.facing, s);
  ctx.fillStyle = shade(c, 0.82); rrect(ctx, -15, -46, 30, 46, 4); ctx.fill();
  ctx.fillStyle = shade(c, 0.95); ctx.fillRect(-11, -54, 22, 9);
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.moveTo(-6, -52); ctx.lineTo(-4, -560); ctx.lineTo(4, -560); ctx.lineTo(6, -52); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(-4, -540, 2.5, 480);
  ctx.fillStyle = shade(c, 0.85); ctx.fillRect(-7, -210, 14, 6); ctx.fillRect(-6, -400, 12, 5);
  ctx.strokeStyle = c; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -556); ctx.quadraticCurveTo(8, -590, 58, -584); ctx.stroke();
  ctx.fillStyle = shade(c, 0.9);
  ctx.beginPath(); ctx.moveTo(52, -594); ctx.lineTo(92, -594); ctx.lineTo(102, -574); ctx.lineTo(44, -574); ctx.closePath(); ctx.fill();
  const lit = env.lampOn;
  ctx.fillStyle = lit > 0.1 ? mix('#fff4c2', '#fffbe8', lit) : '#e8e6da';
  ellipse(ctx, 73, -572, 22, 5); ctx.fill();
  ctx.restore();
}
function drawLampLight(ctx, o, env) {
  const lit = env.lampOn;
  if (lit <= 0.02) return;
  const s = o.s;
  const b = toWorld(o, 73, -570);
  const g = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, 90 * s);
  g.addColorStop(0, `rgba(255,236,170,${0.9 * lit})`); g.addColorStop(1, 'rgba(255,220,140,0)');
  ctx.fillStyle = g; circle(ctx, b.x, b.y, 90 * s); ctx.fill();
  const cg = ctx.createLinearGradient(0, b.y, 0, o.y);
  cg.addColorStop(0, `rgba(255,230,160,${0.28 * lit})`); cg.addColorStop(1, 'rgba(255,230,160,0)');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.moveTo(b.x - 16 * s, b.y); ctx.lineTo(b.x + 16 * s, b.y); ctx.lineTo(b.x + 110 * s, o.y); ctx.lineTo(b.x - 110 * s, o.y); ctx.closePath(); ctx.fill();
}

/* ---------- Cây ---------- */
function setupTree(o) {
  [-96, -196].forEach((h) => addAnchor(o, 'pole', 0, h, { depth: o.y + 5, poleX: o.x, poleW: 22 * o.s, poleColor: '#7a5a3f', poleTop: o.y - 300 * o.s, poleBot: o.y }));
}
function drawTree(ctx, o, env) {
  const s = o.s;
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.fillStyle = 'rgba(0,0,0,0.16)'; ellipse(ctx, 0, 1, 36 * s, 6 * s); ctx.fill();
  ctx.scale(s, s);
  ctx.fillStyle = '#6d6a64'; ctx.fillRect(-28, -14, 56, 14);
  ctx.strokeStyle = '#8b877f'; ctx.lineWidth = 2; for (let k = -20; k <= 20; k += 10) line(ctx, k, -14, k, 0);
  ctx.fillStyle = '#7a5a3f';
  ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-9, -300); ctx.lineTo(9, -300); ctx.lineTo(14, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 2;
  line(ctx, -4, -40, -2, -120); line(ctx, 4, -150, 3, -260);
  ctx.strokeStyle = '#7a5a3f'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  line(ctx, 0, -250, -40, -300); line(ctx, 0, -270, 42, -320);
  const sway = Math.sin(env.time * 1.3 + o.seed) * 3 + (env.W || 0) * 16 * Math.sign(960 - o.x) + (env.W || 0) * Math.sin(env.time * 9 + o.seed) * 5;
  const puffs = [[-62, -310, 66, '#4a8458'], [54, -318, 68, '#4a8458'], [0, -372, 84, '#579463'], [-46, -398, 58, '#65a06d'], [48, -402, 56, '#65a06d'], [0, -300, 58, '#579463'], [-10, -430, 44, '#72aa78']];
  for (const [dx, dy, r, col] of puffs) {
    const k = (-dy - 280) / 150;
    ctx.fillStyle = col; circle(ctx, dx + sway * k, dy, r); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; circle(ctx, -20 + sway, -400, 26); ctx.fill();
  ctx.restore();
}

/* ---------- Trạm xe buýt ---------- */
function setupBusStop(o) {
  const s = o.s;
  const pc = '#8397ad';
  const poleA = (lx, h, depth) => addAnchor(o, 'pole', lx, h, { depth, poleX: toWorld(o, lx, 0).x, poleW: 9 * s, poleColor: pc, poleTop: o.y - 256 * s, poleBot: o.y });
  poleA(-172, -118, o.y + 20);
  poleA(172, -118, o.y + 20);
  addAnchor(o, 'pole', -206, -92, { depth: o.y + 2, poleX: toWorld(o, -206, 0).x, poleW: 8 * s, poleColor: '#6b7a8c', poleTop: o.y - 300 * s, poleBot: o.y });
  addAnchor(o, 'pole', -206, -196, { depth: o.y + 2, poleX: toWorld(o, -206, 0).x, poleW: 8 * s, poleColor: '#6b7a8c', poleTop: o.y - 300 * s, poleBot: o.y });
  addAnchor(o, 'lie', 92, -10, { depth: o.y + 4 });
  o.seats = [-70, 0, 70].map((lx) => toWorld(o, lx, 0).x);
}
function drawBusStopBack(ctx, o, env) {
  const s = o.s;
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(-190 * s, -4 * s, 380 * s, 8 * s);
  ctx.scale(s, s);
  // biển báo trạm
  ctx.fillStyle = '#6b7a8c'; ctx.fillRect(-210, -300, 8, 300);
  ctx.fillStyle = '#ffffff'; circle(ctx, -206, -300, 30); ctx.fill();
  ctx.fillStyle = '#34609f'; circle(ctx, -206, -300, 25); ctx.fill();
  ctx.fillStyle = '#ffffff'; rrect(ctx, -220, -314, 28, 22, 5); ctx.fill();
  ctx.fillStyle = '#34609f'; ctx.fillRect(-216, -310, 8, 7); ctx.fillRect(-204, -310, 8, 7);
  ctx.fillStyle = '#ffffff'; circle(ctx, -214, -290, 3); ctx.fill(); circle(ctx, -198, -290, 3); ctx.fill();
  ctx.fillStyle = '#ffffff'; rrect(ctx, -250, -262, 88, 26, 4); ctx.fill();
  ctx.strokeStyle = '#34609f'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#34609f'; ctx.font = `800 11px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('TRẠM XE BUÝT', -206, -248.5);
  // cột sau
  ctx.fillStyle = '#8397ad'; ctx.fillRect(-168, -250, 7, 250); ctx.fillRect(161, -250, 7, 250);
  // mái
  ctx.fillStyle = '#3a5f95';
  ctx.beginPath(); ctx.moveTo(-184, -268); ctx.lineTo(184, -268); ctx.lineTo(190, -252); ctx.lineTo(-190, -252); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-184, -268, 368, 3);
  // vách sau: quảng cáo + bản đồ
  const pg = ctx.createLinearGradient(0, -236, 0, -60);
  pg.addColorStop(0, '#4f78b0'); pg.addColorStop(1, '#6d93c4');
  ctx.fillStyle = pg; ctx.fillRect(-156, -236, 150, 172);
  ctx.fillStyle = '#ffffff'; ctx.font = `900 30px ${FONT_UI}`;
  ctx.fillText('XE BUÝT', -81, -186);
  ctx.font = `700 15px ${FONT_UI}`; ctx.fillText('Tuyến 09 · 18 · 32', -81, -154);
  ctx.fillStyle = '#f3e6c4'; rrect(ctx, -136, -132, 110, 30, 8); ctx.fill();
  ctx.fillStyle = '#2c3e63'; ctx.font = `800 14px ${FONT_UI}`; ctx.fillText('5 phút/chuyến', -81, -116);
  ctx.fillStyle = '#f8fafc'; ctx.fillRect(-2, -236, 158, 172);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#c26a5a'; ctx.beginPath(); ctx.moveTo(8, -200); ctx.lineTo(60, -170); ctx.lineTo(90, -190); ctx.lineTo(146, -130); ctx.stroke();
  ctx.strokeStyle = '#5f9a78'; ctx.beginPath(); ctx.moveTo(10, -110); ctx.lineTo(70, -140); ctx.lineTo(120, -90); ctx.lineTo(148, -100); ctx.stroke();
  ctx.fillStyle = '#44506a'; [[60, -170], [90, -190], [70, -140], [120, -90]].forEach(([x, y]) => { circle(ctx, x, y, 5); ctx.fill(); });
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 3; ctx.strokeRect(-158, -238, 316, 176);
  // ghế chờ
  ctx.fillStyle = '#7a5433'; ctx.fillRect(-92, -54, 6, 54); ctx.fillRect(86, -54, 6, 54);
  ctx.fillStyle = '#a4703f'; rrect(ctx, -112, -64, 224, 12, 3); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(-110, -64, 220, 3);
  ctx.restore();
}
function drawBusStopFront(ctx, o, env) {
  const s = o.s;
  ctx.save(); ctx.translate(o.x, o.y); ctx.scale(s, s);
  ctx.fillStyle = '#8397ad'; ctx.fillRect(-176, -256, 8, 256); ctx.fillRect(168, -256, 8, 256);
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(-175, -250, 2, 240); ctx.fillRect(169, -250, 2, 240);
  ctx.restore();
}

/* ---------- Bốt điện thoại ---------- */
function setupBooth(o) {
  addAnchor(o, 'booth', -14, -148, { depth: o.y });
  addAnchor(o, 'door', 44, -108, { depth: o.y + 12 });
}
function drawBoothBack(ctx, o, env) {
  const s = o.s;
  ctx.save(); ctx.translate(o.x, o.y);
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ellipse(ctx, 0, 1, 64 * s, 7 * s); ctx.fill();
  ctx.scale(s, s);
  ctx.fillStyle = '#3a4a5c'; ctx.fillRect(-50, -236, 100, 232);
  ctx.fillStyle = '#cfd6de'; rrect(ctx, -30, -172, 32, 42, 4); ctx.fill();
  ctx.fillStyle = '#6b7785'; for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) ctx.fillRect(-24 + k * 8, -158 + r * 8, 5, 5);
  ctx.fillStyle = '#1f2328'; rrect(ctx, -40, -178, 8, 36, 3); ctx.fill();
  ctx.strokeStyle = '#1f2328'; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 0; i <= 12; i++) { const yy = -142 + i * 2.5; const xx = -36 + Math.sin(i * 1.6) * 3; if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }
  ctx.stroke();
  ctx.fillStyle = '#8a96a3'; ctx.fillRect(-54, -6, 108, 6);
  ctx.restore();
}
function drawBoothFront(ctx, o, env) {
  const s = o.s;
  ctx.save(); ctx.translate(o.x, o.y + objShake(o, env) * 0.3); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(190,232,255,0.28)'; ctx.fillRect(-46, -232, 92, 226);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.moveTo(-40, -120); ctx.lineTo(-10, -220); ctx.lineTo(0, -220); ctx.lineTo(-30, -120); ctx.fill();
  ctx.beginPath(); ctx.moveTo(10, -30); ctx.lineTo(34, -110); ctx.lineTo(40, -110); ctx.lineTo(16, -30); ctx.fill();
  ctx.fillStyle = '#3f79ad';
  ctx.fillRect(-54, -244, 8, 244); ctx.fillRect(46, -244, 8, 244);
  ctx.fillRect(-46, -152, 92, 5); ctx.fillRect(-46, -62, 92, 5);
  ctx.fillRect(-56, -264, 112, 26);
  ctx.fillStyle = '#2d5f8c'; ctx.fillRect(-60, -272, 120, 10);
  ctx.fillStyle = '#ffffff'; ctx.font = `800 13px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('ĐIỆN THOẠI', 0, -250);
  ctx.fillStyle = '#e8c36a'; rrect(ctx, 38, -120, 6, 24, 3); ctx.fill();
  ctx.restore();
}

/* ---------- Hạt bay: lá, giấy, bụi, nón, dép ---------- */
function drawParticle(ctx, p, x, y, sc, time) {
  const r = p.rot + time * p.spin;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(r); ctx.scale(sc, sc);
  ctx.globalAlpha = p.alpha;
  switch (p.kind) {
    case 'leaf':
      ctx.fillStyle = p.color; ellipse(ctx, 0, 0, 7, 3.4); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.8; line(ctx, -6, 0, 6, 0);
      break;
    case 'paper': {
      const fl = Math.cos(time * 9 + p.rot) ;
      ctx.scale(fl, 1);
      ctx.fillStyle = '#fbfbf6'; ctx.fillRect(-7, -9, 14, 18);
      ctx.fillStyle = '#9aa7b8'; ctx.fillRect(-5, -5, 10, 1.5); ctx.fillRect(-5, -1, 10, 1.5); ctx.fillRect(-5, 3, 7, 1.5);
      break;
    }
    case 'dust':
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; circle(ctx, 0, 0, 1.8); ctx.fill();
      break;
    case 'hat':
      ctx.fillStyle = '#e9d7a4';
      ctx.beginPath(); ctx.moveTo(-22, 6); ctx.lineTo(0, -14); ctx.lineTo(22, 6); ctx.quadraticCurveTo(0, 12, -22, 6); ctx.fill();
      ctx.strokeStyle = '#c4ad73'; ctx.lineWidth = 1; line(ctx, -12, -3, 12, -3); line(ctx, -17, 2, 17, 2);
      break;
    case 'sandal':
      ctx.fillStyle = p.color; rrect(ctx, -12, -5, 24, 10, 5); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let k = -8; k <= 8; k += 4) { circle(ctx, k, -1, 1); ctx.fill(); circle(ctx, k + 2, 2, 1); ctx.fill(); }
      ctx.strokeStyle = shade(p.color, 0.7); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(2, -3, 6, Math.PI, TAU); ctx.stroke();
      break;
    case 'bag':
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath(); ctx.moveTo(-8, 8); ctx.quadraticCurveTo(-12, -6, -5, -10); ctx.lineTo(5, -10); ctx.quadraticCurveTo(12, -6, 8, 8); ctx.closePath(); ctx.fill();
      break;
  }
  ctx.restore();
}

/* ---- 05-ufo.js ---- */
/* ============ Đĩa bay & luồng sáng ============ */
const UFO_REST_Y = 232;           // tâm đĩa khi lơ lửng
const HATCH_DY = 58;              // cửa hầm nằm dưới tâm đĩa
const LIGHT_COLS = ['#ffd45c', '#8eeaff'];

function drawAlien(ctx, x, y, s, t, ph) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.rotate(Math.sin(t * 2 + ph) * 0.12);
  ctx.strokeStyle = '#6cc24f'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  line(ctx, -8, -20, -14, -36); line(ctx, 8, -20, 14, -36);
  ctx.fillStyle = '#ffe066'; circle(ctx, -14, -38, 4.5); ctx.fill(); circle(ctx, 14, -38, 4.5); ctx.fill();
  ctx.fillStyle = '#8ee06c'; ellipse(ctx, 0, 0, 21, 25); ctx.fill();
  ctx.fillStyle = '#16181d';
  ellipse(ctx, -8, -2, 7, 10, -0.45); ctx.fill(); ellipse(ctx, 8, -2, 7, 10, 0.45); ctx.fill();
  ctx.fillStyle = '#ffffff'; circle(ctx, -10, -6, 2.4); ctx.fill(); circle(ctx, 6, -6, 2.4); ctx.fill();
  ctx.strokeStyle = '#2e6b2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 11, 5, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.restore();
}

function drawUFO(ctx, u, time) {
  ctx.save();
  ctx.translate(u.x, u.y);
  ctx.rotate(u.rot || 0);
  ctx.scale(u.sc, u.sc);
  // bóng quầng dưới đáy
  const halo = ctx.createRadialGradient(0, 40, 20, 0, 40, 520);
  halo.addColorStop(0, `rgba(160,255,215,${0.18 + 0.2 * u.hatch})`); halo.addColorStop(1, 'rgba(160,255,215,0)');
  ctx.fillStyle = halo; ellipse(ctx, 0, 40, 520, 120); ctx.fill();
  // người ngoài hành tinh trong vòm
  drawAlien(ctx, -52, -64, 1.1, time, 0);
  drawAlien(ctx, 50, -66, 1.0, time, 1.7);
  // vòm kính
  const dg = ctx.createLinearGradient(0, -155, 0, -50);
  dg.addColorStop(0, 'rgba(200,245,255,0.62)'); dg.addColorStop(1, 'rgba(110,200,240,0.38)');
  ctx.fillStyle = dg;
  ctx.beginPath(); ctx.ellipse(0, -52, 150, 102, 0, Math.PI, TAU); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.ellipse(0, -52, 124, 80, 0, Math.PI * 1.12, Math.PI * 1.36); ctx.stroke();
  ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -52, 124, 80, 0, Math.PI * 1.42, Math.PI * 1.5); ctx.stroke();
  ctx.fillStyle = '#9aa6b4'; ellipse(ctx, 0, -52, 160, 18); ctx.fill();
  // thân trên
  const hg = ctx.createLinearGradient(0, -80, 0, 44);
  hg.addColorStop(0, '#f4f7fa'); hg.addColorStop(0.45, '#c3ccd6'); hg.addColorStop(1, '#7f8b99');
  ctx.fillStyle = hg; ellipse(ctx, 0, -16, 472, 66); ctx.fill();
  ctx.strokeStyle = 'rgba(80,90,105,0.35)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, -16, 380, 46, 0, 0.1, Math.PI - 0.1); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -16, 260, 30, 0, 0.15, Math.PI - 0.15); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ellipse(ctx, -170, -52, 150, 10, -0.05); ctx.fill();
  // vành đèn
  ctx.fillStyle = '#5f6b79'; ellipse(ctx, 0, 10, 478, 34); ctx.fill();
  ctx.fillStyle = '#4b5562'; ctx.beginPath(); ctx.ellipse(0, 10, 478, 34, 0, 0, Math.PI); ctx.fill();
  for (let i = 0; i < 18; i++) {
    const th = (Math.PI * (i + 0.5)) / 18;
    const lx = -Math.cos(th) * 452, ly = 10 + Math.sin(th) * 26;
    const on = u.lights * (0.35 + 0.65 * (Math.sin(time * 9 - i * 0.9) > 0.2 ? 1 : 0));
    const col = LIGHT_COLS[i % LIGHT_COLS.length];
    if (on > 0.5) {
      const lg = ctx.createRadialGradient(lx, ly, 1, lx, ly, 26);
      lg.addColorStop(0, rgba(col, 0.7 * on)); lg.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = lg; circle(ctx, lx, ly, 26); ctx.fill();
    }
    ctx.fillStyle = on > 0.5 ? col : shade(col, 0.55);
    circle(ctx, lx, ly, 9); ctx.fill();
  }
  // thân dưới
  const lg2 = ctx.createLinearGradient(0, 10, 0, 74);
  lg2.addColorStop(0, '#8994a2'); lg2.addColorStop(1, '#56606d');
  ctx.fillStyle = lg2; ellipse(ctx, 0, 34, 300, 42); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 34, 220, 28, 0, 0.2, Math.PI - 0.2); ctx.stroke();
  // cửa hầm
  ctx.fillStyle = '#3a414c'; ellipse(ctx, 0, HATCH_DY, 82, 18); ctx.fill();
  if (u.hatch > 0.01) {
    const hw = 78 * u.hatch, hh = 16 * u.hatch;
    const cg = ctx.createRadialGradient(0, HATCH_DY, 2, 0, HATCH_DY, Math.max(4, hw));
    cg.addColorStop(0, '#ffffff'); cg.addColorStop(0.5, '#caffea'); cg.addColorStop(1, '#6dffc6');
    ctx.fillStyle = cg; ellipse(ctx, 0, HATCH_DY, hw, hh); ctx.fill();
  } else {
    ctx.strokeStyle = '#59626f'; ctx.lineWidth = 2;
    for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU; line(ctx, 0, HATCH_DY, Math.cos(a) * 78, HATCH_DY + Math.sin(a) * 16); }
  }
  if (u.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${u.flash})`; ellipse(ctx, 0, HATCH_DY, 120, 30); ctx.fill();
  }
  // bảng đếm
  if (u.total > 0) {
    ctx.fillStyle = '#16202b'; rrect(ctx, -72, -32, 144, 40, 9); ctx.fill();
    ctx.strokeStyle = '#7cffb2'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#7cffb2'; ctx.font = `700 26px ${FONT_DISPLAY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${u.count} / ${u.total}`, 0, -11);
  }
  ctx.restore();
}

// Luồng sáng hình nón phủ cả con phố
function beamGeom(b) {
  const yTop = b.y + 8, yBot = WH + 30;
  const topHW = 76 * b.open, botHW = 1750;
  const reachY = lerp(yTop, yBot, b.reach);
  const hwAt = (y) => lerp(topHW, botHW, clamp((y - yTop) / (yBot - yTop), 0, 1));
  return { yTop, yBot, topHW, botHW, reachY, hwAt };
}
function beamCone(ctx, b, G, hwFn) {
  ctx.beginPath();
  ctx.moveTo(b.x - hwFn(G.yTop), G.yTop); ctx.lineTo(b.x + hwFn(G.yTop), G.yTop);
  ctx.lineTo(b.x + hwFn(G.reachY), G.reachY); ctx.lineTo(b.x - hwFn(G.reachY), G.reachY);
  ctx.closePath();
}
// Phần sáng chiếu lên nhà cửa, mặt đường (vẽ SAU nền, TRƯỚC người & xe)
function drawBeamBack(ctx, b) {
  if (b.reach <= 0 || b.alpha <= 0) return;
  const G = beamGeom(b), a = b.alpha;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const g = ctx.createLinearGradient(0, G.yTop, 0, G.yBot);
  g.addColorStop(0, `rgba(200,255,232,${0.8 * a})`);
  g.addColorStop(0.3, `rgba(150,245,210,${0.34 * a})`);
  g.addColorStop(1, `rgba(110,225,190,${0.22 * a})`);
  ctx.fillStyle = g; beamCone(ctx, b, G, G.hwAt); ctx.fill();
  const gg = ctx.createRadialGradient(b.x, 1000, 20, b.x, 1000, 1100);
  gg.addColorStop(0, `rgba(170,255,215,${0.22 * a * b.reach})`); gg.addColorStop(1, 'rgba(170,255,215,0)');
  ctx.fillStyle = gg; ellipse(ctx, b.x, 1000, 1150, 190); ctx.fill();
  ctx.restore();
}
// Phần sáng phía trước (mỏng): lõi sáng gần cửa hầm, vòng sáng, hạt lấp lánh, vệt gió xoáy
function drawBeamFront(ctx, b, time) {
  if (b.reach <= 0 || b.alpha <= 0) return;
  const G = beamGeom(b), a = b.alpha;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const fg = ctx.createLinearGradient(0, G.yTop, 0, G.yBot);
  fg.addColorStop(0, `rgba(210,255,236,${0.35 * a})`); fg.addColorStop(0.35, `rgba(160,250,215,${0.06 * a})`); fg.addColorStop(1, `rgba(140,240,205,${0.04 * a})`);
  ctx.fillStyle = fg; beamCone(ctx, b, G, G.hwAt); ctx.fill();
  const cHW = (y) => lerp(G.topHW * 0.7, 520, clamp((y - G.yTop) / (G.yBot - G.yTop), 0, 1));
  const cg = ctx.createLinearGradient(0, G.yTop, 0, G.yBot);
  cg.addColorStop(0, `rgba(235,255,245,${0.45 * a})`); cg.addColorStop(0.5, `rgba(200,255,235,${0.04 * a})`); cg.addColorStop(1, 'rgba(200,255,235,0)');
  ctx.fillStyle = cg; beamCone(ctx, b, G, cHW); ctx.fill();
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const ph = (time * 0.8 + i / 8) % 1;
    const y = lerp(G.yBot - 40, G.yTop + 10, ph);
    if (y > G.reachY) continue;
    const hw = G.hwAt(y) * 0.92;
    ctx.strokeStyle = `rgba(225,255,240,${0.2 * a * (1 - ph) * sstep(0, 0.1, ph)})`;
    ellipse(ctx, b.x, y, hw, Math.max(4, hw * 0.05)); ctx.stroke();
  }
  for (let k = 0; k < 46; k++) {
    const span = G.yBot - G.yTop;
    const y = G.yBot - ((time * 140 + k * 57) % span);
    if (y > G.reachY) continue;
    const fr = ((k * 0.6180339) % 1) * 2 - 1;
    const x = b.x + fr * G.hwAt(y) * 0.9;
    const tw = 0.5 + 0.5 * Math.sin(time * 7 + k);
    ctx.fillStyle = `rgba(255,255,255,${0.7 * a * tw})`;
    ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
  }
  if (b.swirl > 0) {
    ctx.lineCap = 'round';
    for (let k = 0; k < 22; k++) {
      const y = lerp(G.yTop + 80, WH - 30, ((k * 0.381966) % 1));
      if (y > G.reachY) continue;
      const hw = G.hwAt(y) * (0.35 + 0.55 * ((k * 0.7548) % 1));
      const ph = time * (2.2 + (k % 5) * 0.3) + k;
      const x0 = b.x + Math.cos(ph) * hw;
      const front = Math.sin(ph);
      const len = 40 + 30 * ((k * 0.414) % 1);
      ctx.strokeStyle = `rgba(255,255,255,${0.32 * b.swirl * (front > 0 ? 1 : 0.35)})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      const dir = -Math.sin(ph) > 0 ? 1 : -1;
      ctx.quadraticCurveTo(x0 + dir * len * 0.5, y - 10, x0 + dir * len, y - 4);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/* ---- 06-person.js ---- */
/* ============ Nhân vật: ngoại hình, tư thế (khung xương), vẽ ============ */
const BODY = { torso: 50, neck: 7, headR: 14.5, upper: 30, fore: 28, thigh: 41, shin: 40, armW: 9.5, legW: 12.5, torsoW: 30, handR: 5.4 };
const SKINS = ['#f3cfae', '#eebf98', '#f7d9bf', '#e5b48d', '#dcaa82'];
const HAIRS = ['#1f1916', '#2a201b', '#3a2a22', '#191a1f', '#4a3326'];
const SHIRTS = ['#d46a5f', '#dda04c', '#4f978c', '#5f8fc4', '#8aab6c', '#9a86c2', '#f2eee5', '#c47790', '#6c80a6'];
const PANTS = ['#34466b', '#4a5f86', '#3a3f47', '#6b6f78', '#a58d6d', '#2f3b52'];
const BAGS = ['#b9574d', '#4a79ad', '#3f8a78', '#c99a45', '#7c6ba6', '#5b6573'];
const TAGC = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

function makeLook(name, gender, outfit) {
  const r = mulberry32(hashStr(name + '|' + gender));
  const pick = (a) => a[Math.floor(r() * a.length)];
  const L = { skin: pick(SKINS), hair: pick(HAIRS) };
  const h = r();
  if (gender === 'f') L.hairStyle = h < 0.42 ? 'long' : h < 0.78 ? 'pony' : 'bob';
  else L.hairStyle = h < 0.55 ? 'short' : h < 0.85 ? 'spiky' : 'side';
  const shirt = pick(SHIRTS), pants = pick(PANTS), b = r(), shoe = pick(['#f3f3f0', '#2f3238', '#dfe2e6', '#f3f3f0']);
  if (outfit === 'uniform') {
    L.shirt = '#f8f9fb'; L.pants = '#23386b';
    L.bottom = gender === 'f' ? (b < 0.55 ? 'skirt' : 'pants') : 'pants';
    L.shoes = shoe === '#2a2d33' ? '#2a2d33' : '#f5f5f5';
    L.badge = true;
  } else {
    L.shirt = shirt; L.pants = pants;
    L.bottom = gender === 'f' ? (b < 0.35 ? 'skirt' : b < 0.8 ? 'pants' : 'shorts') : (b < 0.72 ? 'pants' : 'shorts');
    L.shoes = shoe;
  }
  L.bag = r() < 0.45 ? pick(BAGS) : null;
  L.h = gender === 'f' ? 0.93 + r() * 0.07 : 0.97 + r() * 0.08;
  L.tag = pick(TAGC);
  L.glasses = r() < 0.14;
  L.blush = r() < 0.5;
  return L;
}

// Góc chi: 0 = hướng xuống, dương = về phía trước (theo hướng mặt f)
const fdir = (a, f) => ({ x: Math.sin(a) * f, y: Math.cos(a) });

function fkUpright(o) {
  const B = BODY, s = o.s, f = o.f;
  const hipN = V(0.8 * s * f, 0), hipF = V(-0.8 * s * f, 0);
  const kN = vadd(hipN, vmul(fdir(o.lN[0], f), B.thigh * s));
  const ftN = vadd(kN, vmul(fdir(o.lN[0] - o.lN[1], f), B.shin * s));
  const kF = vadd(hipF, vmul(fdir(o.lF[0], f), B.thigh * s));
  const ftF = vadd(kF, vmul(fdir(o.lF[0] - o.lF[1], f), B.shin * s));
  const py = o.pelvisY != null ? o.pelvisY : o.ground - Math.max(ftN.y, ftF.y) - 4 * s - (o.lift || 0);
  const P = V(o.x, py);
  const off = (p) => V(p.x + P.x, p.y + P.y);
  const lean = o.lean || 0;
  const up = V(Math.sin(lean) * f, -Math.cos(lean));
  const neck = vadd(P, vmul(up, B.torso * s));
  const ha = lean + (o.tilt || 0);
  const hup = V(Math.sin(ha) * f, -Math.cos(ha));
  const head = vadd(neck, vmul(hup, (B.neck + B.headR) * s));
  const shN = vadd(neck, vmul(up, -3 * s)), shF = vadd(neck, vmul(up, -3 * s));
  shN.x += 1.5 * s * f; shF.x -= 1.5 * s * f;
  const elN = vadd(shN, vmul(fdir(o.aN[0] + lean, f), B.upper * s));
  const haN = vadd(elN, vmul(fdir(o.aN[0] + lean + o.aN[1], f), B.fore * s));
  const elF = vadd(shF, vmul(fdir(o.aF[0] + lean, f), B.upper * s));
  const haF = vadd(elF, vmul(fdir(o.aF[0] + lean + o.aF[1], f), B.fore * s));
  return {
    s, facing: f, pelvis: P, neck, head, headRot: Math.atan2(hup.x, -hup.y),
    shN, shF, elN, elF, haN, haF,
    hipN: off(hipN), hipF: off(hipF), knN: off(kN), knF: off(kF), ftN: off(ftN), ftF: off(ftF),
  };
}

const J_PTS = ['pelvis', 'neck', 'head', 'shN', 'shF', 'elN', 'elF', 'haN', 'haF', 'hipN', 'hipF', 'knN', 'knF', 'ftN', 'ftF'];
function lerpJ(A, B, t) {
  const J = { s: lerp(A.s, B.s, t), facing: t < 0.5 ? A.facing : B.facing, headRot: lerpAngle(A.headRot, B.headRot, t) };
  for (const k of J_PTS) J[k] = vlerp(A[k], B[k], t);
  return J;
}
function mapJ(A, fn) {
  const J = { s: A.s, facing: A.facing, headRot: A.headRot };
  for (const k of J_PTS) J[k] = fn(A[k]);
  return J;
}
function ik2(A, T, l1, l2, P) {
  let dx = T.x - A.x, dy = T.y - A.y;
  let d = Math.hypot(dx, dy);
  const maxd = (l1 + l2) * 0.998;
  if (d > maxd) { dx *= maxd / d; dy *= maxd / d; d = maxd; }
  if (d < 0.001) d = 0.001;
  const base = Math.atan2(dy, dx);
  const c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const off = Math.acos(c);
  const e1 = { x: A.x + Math.cos(base + off) * l1, y: A.y + Math.sin(base + off) * l1 };
  const e2 = { x: A.x + Math.cos(base - off) * l1, y: A.y + Math.sin(base - off) * l1 };
  return { el: vdist(e1, P) > vdist(e2, P) ? e1 : e2, ha: { x: A.x + dx, y: A.y + dy } };
}

// Cấu hình tư thế bám lúc chưa bị hút mạnh (khung σ=+1: người ở bên phải điểm bám, quay mặt sang trái)
function clingRest(a, s, G) {
  const gy = a.ground;
  const H = Math.PI / 2;
  switch (a.type) {
    case 'wheel': return { px: a.wheelR + 40 * s, py: gy - 12 * s, tor: Math.PI + 0.25, legs: [0.08, -0.35, 0.0, -0.15], cap: 0.7, hands: [-2 * s, 3 * s, 6 * s, -4 * s], kick: 1 };
    case 'lie': return { px: 50 * s, py: gy - 11 * s, tor: Math.PI + 0.18, legs: [0.06, -0.3, 0.0, -0.12], cap: 0.6, hands: [0, 0, 5 * s, -3 * s], kick: 1 };
    case 'handle': return { px: 28 * s, py: gy - 17 * s, tor: -H - 0.42, legs: [Math.PI + 0.6, H + 0.15, Math.PI + 0.45, H + 0.05], cap: 1, hands: [0, 0, 5 * s, -2 * s] };
    case 'booth': return { px: 24 * s, py: gy - 17 * s, tor: -H - 0.38, legs: [Math.PI + 0.6, H + 0.15, Math.PI + 0.45, H + 0.05], cap: 0.22, hands: [0, 0, 4 * s, 3 * s] };
    case 'handlebar': return { px: 46 * s, py: gy - 30 * s, tor: -H - 0.55, legs: [Math.PI + 0.22, H + 0.12, Math.PI + 0.08, H + 0.02], cap: 1, hands: [0, 0, -5 * s, 1 * s] };
    case 'door': return { px: 32 * s, py: gy - 74 * s, tor: -H - 0.35, legs: [H - 0.38, H - 0.12, H - 0.12, H + 0.05], cap: 1, hands: [0, 0, 3 * s, 4 * s] };
    case 'pole':
    default: {
      const hw = (a.poleW || 10) / 2;
      return { px: hw + 6 * s, py: G.y + 47 * s, tor: -H - 0.12, legs: [H + 0.8, H - 0.55, H + 0.62, H - 0.3], cap: 0.85, hands: [-(hw + 4 * s), 5 * s, -(hw - 1 * s), -4 * s], pole: true };
    }
  }
}
function approachOffset(a, s) {
  switch (a.type) {
    case 'wheel': return a.wheelR + 40 * s;
    case 'lie': return 50 * s;
    case 'handle': return 28 * s;
    case 'booth': return 24 * s;
    case 'handlebar': return 46 * s;
    case 'door': return 32 * s;
    default: return (a.poleW || 10) / 2 + 8 * s;
  }
}

class Person {
  constructor(st, outfit) {
    this.st = st;
    this.look = makeLook(st.name, st.gender, outfit);
    this.x = 0; this.y = 900; this.facing = 1;
    this.mode = 'walk';
    this.state = 'lobby';
    this.t0 = 0;
    this.speed = rr(55, 80);
    this.phase = rr(0, TAU);
    this.timer = rr(1, 5);
    this.seed = rr(1, 100);
    this.emotion = 'calm';
    this.anchor = null; this.side = 1;
    this.lift = 0; this.tension = 0; this.relHand = 0;
    this.J = null; this.J0 = null;
    this.flight = null;
    this.exclaim = 0;
    this.depth = 900;
    this.air = 0;
    this.pole = null;
    this.visible = true;
  }
  get s() { return depthScale(this.y) * this.look.h; }

  /* ----- các tư thế ----- */
  poseLobby(time) {
    const s = this.s, f = this.facing, t = time + this.seed;
    const base = { x: this.x, ground: this.y, s, f, lean: 0, tilt: 0 };
    switch (this.mode) {
      case 'walk': {
        const ph = this.phase;
        const kn = (p) => 0.12 + 0.62 * Math.pow(Math.max(0, Math.cos(p)), 1.5);
        return fkUpright(Object.assign(base, { lean: 0.05, lN: [0.42 * Math.sin(ph), kn(ph)], lF: [0.42 * Math.sin(ph + Math.PI), kn(ph + Math.PI)], aN: [-0.42 * Math.sin(ph), 0.28], aF: [0.42 * Math.sin(ph), 0.28] }));
      }
      case 'talk':
        return fkUpright(Object.assign(base, { tilt: 0.06 * Math.sin(t * 2.3), lN: [0.07, 0.06], lF: [-0.05, 0.04], aN: [0.22 + 0.12 * Math.sin(t * 3.1), 1.8 + 0.2 * Math.sin(t * 4.3)], aF: [-0.05, 0.25] }));
      case 'phone':
        return fkUpright(Object.assign(base, { tilt: 0.12 + 0.05 * Math.sin(t * 1.3), lN: [0.06, 0.05], lF: [-0.06, 0.05], aN: [0.3, 2.55], aF: [0.05, 0.3] }));
      case 'sit':
        return fkUpright(Object.assign(base, { pelvisY: this.y - 52 * s, lean: -0.05, tilt: 0.05 * Math.sin(t * 1.1), lN: [1.45, 1.35], lF: [1.38, 1.28], aN: [0.55, 0.55], aF: [0.5, 0.6] }));
      case 'look':
        return fkUpright(Object.assign(base, { tilt: 0.38, lN: [0.06, 0.05], lF: [-0.05, 0.05], aN: [0.55, 1.85], aF: [0.5, 1.9] }));
      case 'para': {
        const sw = Math.sin(t * 2.4) * 0.12;
        return fkUpright(Object.assign(base, { pelvisY: this.paraY, lean: sw, tilt: -0.2, lN: [0.12 + 0.1 * Math.sin(t * 3), 0.2], lF: [-0.08, 0.15], aN: [Math.PI - 0.32, 0.12], aF: [Math.PI - 0.12, 0.1] }));
      }
      default: // idle
        return fkUpright(Object.assign(base, { tilt: 0.05 * Math.sin(t * 0.9), lN: [0.07, 0.06], lF: [-0.05, 0.04], aN: [0.06 + 0.03 * Math.sin(t * 1.7), 0.18], aF: [-0.04, 0.22] }));
    }
  }
  poseAlert(time, scared) {
    const s = this.s, f = this.facing, t = time + this.seed;
    if (!scared) {
      return fkUpright({ x: this.x, ground: this.y, s, f, lean: -0.1, tilt: -0.55 + 0.05 * Math.sin(t * 3), lN: [0.1, 0.08], lF: [-0.1, 0.06], aN: [0.3, 0.9], aF: [-0.15, 0.55] });
    }
    const sh = Math.sin(t * 40) * 1.2 * s;
    const J = fkUpright({ x: this.x + sh, ground: this.y, s, f, lean: 0.12, tilt: -0.35, lN: [0.28, 0.55], lF: [-0.12, 0.45], aN: [1.95 + 0.1 * Math.sin(t * 25), 0.9], aF: [1.75, 1.05] });
    return J;
  }
  poseRun(time) {
    const s = this.s, f = this.facing, ph = this.phase;
    const kn = (p) => 0.35 + 1.35 * Math.pow(Math.max(0, Math.cos(p)), 1.3);
    const lift = 6 * s * Math.max(0, Math.sin(ph * 2)) + this.air * 70 * s;
    const flail = this.air;
    const aN = flail > 0.05 ? [Math.PI - 0.6 + 0.5 * Math.sin(time * 16), 0.5] : [-0.95 * Math.sin(ph), 1.45];
    const aF = flail > 0.05 ? [Math.PI + 0.4 + 0.5 * Math.sin(time * 14), 0.6] : [0.95 * Math.sin(ph), 1.45];
    return fkUpright({ x: this.x, ground: this.y, s, f, lean: 0.28 - 0.4 * flail, tilt: -0.1, lift, lN: [0.85 * Math.sin(ph), kn(ph)], lF: [0.85 * Math.sin(ph + Math.PI), kn(ph + Math.PI)], aN, aF });
  }
  poseSitGround(x, ground, time) {
    const s = depthScale(ground) * this.look.h, t = time + this.seed;
    return fkUpright({ x, ground, s, f: this.facing, pelvisY: ground - 9 * s, lean: -0.3, tilt: 0.12 + 0.05 * Math.sin(t * 1.5), lN: [1.4, 0.3], lF: [1.52, 0.6], aN: [-0.62, -0.2], aF: [-0.5, -0.15] });
  }
  poseFlyLocal(time, s) {
    const t = time * 1.0 + this.seed;
    return fkUpright({ x: 0, pelvisY: 0, s, f: this.facing, lean: 0, tilt: 0.3 * Math.sin(t * 9),
      aN: [Math.PI - 0.5 + 0.6 * Math.sin(t * 17), 0.4 + 0.3 * Math.sin(t * 13)],
      aF: [Math.PI + 0.5 + 0.6 * Math.sin(t * 15 + 1), 0.5],
      lN: [0.6 * Math.sin(t * 14), 0.6 + 0.4 * Math.sin(t * 14 + 1)],
      lF: [-0.6 * Math.sin(t * 14), 0.7] });
  }

  poseCling(time, W, H) {
    const a = this.anchor, B = BODY;
    const s = depthScale(a.depth) * this.look.h;
    const σ = this.side, f = -σ;
    const G = a.grip;
    const c = clingRest(a, s, G);
    const mA = (ang) => (σ > 0 ? ang : Math.PI - ang);
    const t = time;
    const legsR = c.legs.slice();
    if (c.kick) { legsR[1] += 0.3 * Math.sin(t * 9 + this.seed); legsR[3] += 0.25 * Math.sin(t * 8 + this.seed * 2); }
    const Prest = V(G.x + σ * c.px, c.py);
    const torR = mA(c.tor);
    const legsRest = legsR.map(mA);
    // tư thế bị hút căng về phía cửa hầm
    const θ = Math.atan2(H.y - G.y, H.x - G.x);
    const reach = (B.upper + B.fore) * s * 0.9;
    const Sst = vadd(G, dirv(θ, reach));
    const Pst = vadd(Sst, dirv(θ, B.torso * s));
    const torS = θ + Math.PI;
    const fl = (k, w) => Math.sin(t * w + this.seed * (k + 1));
    const tn = this.tension;
    const legsSt = [θ + 0.12 + 0.35 * fl(1, 17), 0, θ - 0.1 + 0.35 * fl(2, 15), 0];
    legsSt[1] = legsSt[0] + 0.3 * fl(3, 19);
    legsSt[3] = legsSt[2] + 0.35 * fl(4, 21);
    const L = clamp(Math.min(this.lift, c.cap) + 0.25 * tn * c.cap, 0, 1);
    let pel = vlerp(Prest, Pst, L);
    const tor = lerpAngle(torR, torS, L);
    const legs = legsRest.map((ang, i) => lerpAngle(ang, legsSt[i], L));
    const shake = (1.2 + 2.6 * W + 3 * tn) * s;
    pel = vadd(pel, V(noise1(t * 9, this.seed) * shake, noise1(t * 11, this.seed + 3) * shake));
    let neck = vadd(pel, dirv(tor, B.torso * s));
    const maxR = (B.upper + B.fore) * s * 0.96;
    const dG = vdist(neck, G);
    if (dG > maxR) {
      const shift = vmul(vsub(G, neck), (dG - maxR) / dG);
      pel = vadd(pel, shift); neck = vadd(neck, shift);
    }
    const perp = dirv(tor + Math.PI / 2, 1.5 * s);
    const back = dirv(tor, -3 * s);
    const shN = vadd(vadd(neck, back), perp), shF = vsub(vadd(neck, back), perp);
    const hipN = vadd(pel, vmul(perp, 0.5)), hipF = vsub(pel, vmul(perp, 0.5));
    const knN = vadd(hipN, dirv(legs[0], B.thigh * s)), ftN = vadd(knN, dirv(legs[1], B.shin * s));
    const knF = vadd(hipF, dirv(legs[2], B.thigh * s)), ftF = vadd(knF, dirv(legs[3], B.shin * s));
    const hup = dirv(tor, 1);
    const head = vadd(neck, vmul(hup, (B.neck + B.headR) * s));
    // tay: bám điểm bám (có thể tuột một/hai tay)
    let tgN = V(G.x + σ * c.hands[0], G.y + c.hands[1]);
    let tgF = V(G.x + σ * c.hands[2], G.y + c.hands[3]);
    const r1 = sstep(0.3, 0.75, tn), r2 = sstep(1.02, 1.2, tn);
    const flailN = vadd(shN, dirv(θ + 0.5 * Math.sin(t * 13 + this.seed), (B.upper + B.fore) * s * 0.95));
    const flailF = vadd(shF, dirv(θ - 0.4 + 0.5 * Math.sin(t * 11 + this.seed), (B.upper + B.fore) * s * 0.95));
    if (this.relHand === 0) { tgN = vlerp(tgN, flailN, r1); tgF = vlerp(tgF, flailF, r2); }
    else { tgF = vlerp(tgF, flailF, r1); tgN = vlerp(tgN, flailN, r2); }
    const aN = ik2(shN, tgN, B.upper * s, B.fore * s, pel);
    const aF = ik2(shF, tgF, B.upper * s, B.fore * s, pel);
    this.pole = c.pole ? { x: a.poleX, w: a.poleW, top: a.poleTop, bot: a.poleBot, color: a.poleColor } : null;
    return {
      s, facing: f, pelvis: pel, neck, head, headRot: Math.atan2(hup.x, -hup.y),
      shN, shF, elN: aN.el, elF: aF.el, haN: aN.ha, haF: aF.ha,
      hipN, hipF, knN, knF, ftN, ftF,
    };
  }
}

/* ----- Vẽ ----- */
function drawLimb(ctx, a, b, w, col) {
  ctx.strokeStyle = col; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
}
function drawArm(ctx, J, sh, el, ha, L, dark) {
  const s = J.s;
  const shirt = dark ? shade(L.shirt, 0.86) : L.shirt;
  const skin = dark ? shade(L.skin, 0.88) : L.skin;
  drawLimb(ctx, sh, el, BODY.armW * s, skin);
  drawLimb(ctx, el, ha, BODY.armW * s * 0.9, skin);
  drawLimb(ctx, sh, vlerp(sh, el, 0.6), BODY.armW * s * 1.22, shirt);
  ctx.fillStyle = skin; circle(ctx, ha.x, ha.y, BODY.handR * s); ctx.fill();
}
function drawLeg(ctx, J, hip, kn, ft, L, dark) {
  const s = J.s, f = J.facing;
  const pants = dark ? shade(L.pants, 0.84) : L.pants;
  const skin = dark ? shade(L.skin, 0.88) : L.skin;
  const w = BODY.legW * s;
  if (L.bottom === 'pants') {
    drawLimb(ctx, hip, kn, w, pants); drawLimb(ctx, kn, ft, w * 0.9, pants);
  } else {
    drawLimb(ctx, hip, kn, w * 0.86, skin); drawLimb(ctx, kn, ft, w * 0.8, skin);
    if (L.bottom === 'shorts') drawLimb(ctx, hip, vlerp(hip, kn, 0.62), w * 1.14, pants);
  }
  const d = vnorm(vsub(ft, kn));
  const ang = -Math.PI / 2 * f;
  const fw = V(d.x * Math.cos(ang) - d.y * Math.sin(ang), d.x * Math.sin(ang) + d.y * Math.cos(ang));
  const c = vadd(vadd(ft, vmul(fw, 4 * s)), vmul(d, 1.5 * s));
  ctx.fillStyle = dark ? shade(L.shoes, 0.85) : L.shoes;
  ellipse(ctx, c.x, c.y, 8.8 * s, 4.8 * s, Math.atan2(fw.y, fw.x)); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1 * s; ctx.stroke();
}
function drawTorso(ctx, J, L) {
  const s = J.s, P = J.pelvis, N = J.neck;
  const ang = Math.atan2(N.y - P.y, N.x - P.x);
  const len = vdist(P, N);
  const w = BODY.torsoW * s;
  const back = -J.facing;
  ctx.save();
  ctx.translate(P.x, P.y); ctx.rotate(ang);
  // cặp sách sau lưng
  if (L.bag) {
    ctx.fillStyle = L.bag;
    rrect(ctx, len * 0.18, back > 0 ? w * 0.3 : -w * 0.3 - 13 * s, len * 0.72, 13 * s, 5 * s); ctx.fill();
    ctx.fillStyle = shade(L.bag, 0.8);
    rrect(ctx, len * 0.26, back > 0 ? w * 0.3 + 8 * s : -w * 0.3 - 13 * s, len * 0.5, 5 * s, 2 * s); ctx.fill();
  }
  ctx.fillStyle = L.shirt;
  ctx.beginPath();
  ctx.moveTo(-3 * s, -w * 0.44);
  ctx.lineTo(len - 2 * s, -w * 0.52);
  ctx.quadraticCurveTo(len + 7 * s, 0, len - 2 * s, w * 0.52);
  ctx.lineTo(-3 * s, w * 0.44);
  ctx.quadraticCurveTo(-7 * s, 0, -3 * s, -w * 0.44);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = rgba(shade(L.shirt, 0.62), 0.55); ctx.lineWidth = 1.2 * s; ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.09)';
  ctx.fillRect(0, back > 0 ? w * 0.18 : -w * 0.46, len - 3 * s, w * 0.28);
  // cổ áo
  ctx.fillStyle = shade(L.shirt, 0.82);
  ctx.beginPath(); ctx.moveTo(len - 1 * s, -5 * s); ctx.lineTo(len - 8 * s, 0); ctx.lineTo(len - 1 * s, 5 * s); ctx.closePath(); ctx.fill();
  if (L.badge) { ctx.fillStyle = '#2563eb'; ctx.fillRect(len * 0.62, back > 0 ? -w * 0.4 : w * 0.18, 6 * s, 4 * s); }
  // cạp quần / cạp váy
  ctx.fillStyle = L.pants; ctx.fillRect(-4 * s, -w * 0.45, 7 * s, w * 0.9);
  ctx.restore();
}
// Váy chữ A bám theo hai đùi (ngồi, chạy, bị hút đều trông tự nhiên)
function hull(pts) {
  const p = pts.slice().sort((a, b) => (a.x - b.x) || (a.y - b.y));
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  up.pop(); lo.pop();
  return lo.concat(up);
}
function drawSkirt(ctx, J, L, flow, time, W) {
  const s = J.s, w = BODY.torsoW * s;
  const ax = vnorm(vsub(J.neck, J.pelvis));
  const pt = V(-ax.y, ax.x);
  const waist = vadd(J.pelvis, vmul(ax, 3 * s));
  const pts = [vadd(waist, vmul(pt, w * 0.44)), vsub(waist, vmul(pt, w * 0.44))];
  const fl = flow ? vnorm(flow) : V(0, 1);
  const wob = W > 0.05 ? Math.sin(time * 16 + J.pelvis.x * 0.1) * W * 3 * s : 0;
  const len = L.badge ? 0.72 : 0.64;
  [[J.hipN, J.knN], [J.hipF, J.knF]].forEach(([h, k]) => {
    const d = vnorm(vsub(k, h));
    const n = V(-d.y, d.x);
    const m = vadd(vlerp(h, k, len), vmul(fl, wob));
    const flare = BODY.legW * s * 1.2;
    pts.push(vadd(m, vmul(n, flare)), vsub(m, vmul(n, flare)));
  });
  const hp = hull(pts);
  if (hp.length < 3) return;
  ctx.fillStyle = L.pants;
  ctx.strokeStyle = L.pants; ctx.lineWidth = 2.2 * s; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(hp[0].x, hp[0].y);
  for (let i = 1; i < hp.length; i++) ctx.lineTo(hp[i].x, hp[i].y);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1 * s;
  const mid = vlerp(J.hipN, J.knN, len * 0.9);
  line(ctx, waist.x, waist.y, mid.x, mid.y);
}
function drawHairTail(ctx, J, L, flow, time, W) {
  if (L.hairStyle !== 'long' && L.hairStyle !== 'pony') return;
  const s = J.s, R = BODY.headR * s, f = J.facing;
  const rot = J.headRot;
  const loc = L.hairStyle === 'long' ? V(-R * 0.55, R * 0.05) : V(-R * 0.95, -R * 0.35);
  const lx = loc.x * f;
  const base = V(J.head.x + lx * Math.cos(rot) - loc.y * Math.sin(rot), J.head.y + lx * Math.sin(rot) + loc.y * Math.cos(rot));
  const len = (L.hairStyle === 'long' ? 34 : 26) * s;
  const d = vnorm(flow);
  const n = V(-d.y, d.x);
  const wav = Math.sin(time * (8 + W * 14) + J.head.x * 0.05) * (1.5 + W * 5) * s;
  const tip = vadd(vadd(base, vmul(d, len)), vmul(n, wav));
  const mid = vadd(vadd(base, vmul(d, len * 0.5)), vmul(n, -wav * 0.6));
  const bw = (L.hairStyle === 'long' ? R * 0.95 : R * 0.45);
  ctx.fillStyle = L.hair;
  ctx.beginPath();
  ctx.moveTo(base.x + n.x * bw, base.y + n.y * bw);
  ctx.quadraticCurveTo(mid.x + n.x * bw * 0.8, mid.y + n.y * bw * 0.8, tip.x, tip.y);
  ctx.quadraticCurveTo(mid.x - n.x * bw * 0.8, mid.y - n.y * bw * 0.8, base.x - n.x * bw, base.y - n.y * bw);
  ctx.closePath(); ctx.fill();
  if (L.hairStyle === 'pony') { ctx.fillStyle = '#e8505b'; circle(ctx, base.x, base.y, 2.6 * s); ctx.fill(); }
}
function drawHead(ctx, J, L, emo, time, look) {
  const s = J.s, R = BODY.headR * s, f = J.facing;
  ctx.save();
  ctx.translate(J.head.x, J.head.y);
  ctx.rotate(J.headRot);
  ctx.scale(f, 1);
  ctx.fillStyle = L.skin; circle(ctx, 0, 0, R); ctx.fill();
  ctx.fillStyle = shade(L.skin, 0.9); circle(ctx, -R * 0.16, R * 0.14, R * 0.24); ctx.fill();
  // tóc
  ctx.fillStyle = L.hair;
  const hs = L.hairStyle;
  ctx.beginPath();
  if (hs === 'bob' || hs === 'long') {
    ctx.arc(0, 0, R * 1.06, Math.PI * 0.62, Math.PI * 1.95);
    ctx.quadraticCurveTo(R * 0.8, -R * 0.15, R * 0.35, -R * 0.38);
    ctx.quadraticCurveTo(-R * 0.1, -R * 0.2, -R * 0.2, R * 0.2);
    ctx.quadraticCurveTo(-R * 0.3, R * 0.75, -R * 0.55, R * 0.92);
  } else if (hs === 'pony') {
    ctx.arc(0, 0, R * 1.05, Math.PI * 0.85, Math.PI * 1.95);
    ctx.quadraticCurveTo(R * 0.75, -R * 0.2, R * 0.38, -R * 0.45);
    ctx.quadraticCurveTo(R * 0.05, -R * 0.25, -R * 0.35, -R * 0.02);
    ctx.quadraticCurveTo(-R * 0.75, R * 0.2, -R * 0.95, R * 0.38);
  } else if (hs === 'spiky') {
    ctx.moveTo(-R * 0.98, R * 0.3);
    const n = 6;
    for (let i = 0; i <= n; i++) {
      const a = Math.PI * (0.92 + (1.02 * i) / n);
      const rr2 = i % 2 === 0 ? R * 1.05 : R * 1.32;
      ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2);
    }
    ctx.lineTo(R * 0.5, -R * 0.45);
    ctx.quadraticCurveTo(0, -R * 0.2, -R * 0.35, -R * 0.02);
    ctx.quadraticCurveTo(-R * 0.7, R * 0.2, -R * 0.98, R * 0.3);
  } else if (hs === 'side') {
    ctx.arc(0, 0, R * 1.06, Math.PI * 0.88, Math.PI * 1.92);
    ctx.quadraticCurveTo(R * 1.0, -R * 0.05, R * 0.7, -R * 0.2);
    ctx.quadraticCurveTo(R * 0.1, -R * 0.55, -R * 0.35, -R * 0.02);
    ctx.quadraticCurveTo(-R * 0.72, R * 0.22, -R * 0.96, R * 0.36);
  } else {
    ctx.arc(0, 0, R * 1.05, Math.PI * 0.88, Math.PI * 1.93);
    ctx.quadraticCurveTo(R * 0.85, -R * 0.22, R * 0.45, -R * 0.42);
    ctx.quadraticCurveTo(R * 0.08, -R * 0.2, -R * 0.35, -R * 0.02);
    ctx.quadraticCurveTo(-R * 0.72, R * 0.22, -R * 0.96, R * 0.36);
  }
  ctx.closePath(); ctx.fill();
  if (hs === 'pony') { ctx.fillStyle = shade(L.hair, 1.25); ctx.fillRect(-R * 0.3, -R * 0.95, R * 0.5, R * 0.12); }
  // mặt
  const e1 = R * 0.3, e2 = R * 0.7, ey = R * 0.02;
  let lv = V(0, 0);
  if (look) {
    const co = Math.cos(-J.headRot), sn = Math.sin(-J.headRot);
    lv = vnorm(V((look.x * co - look.y * sn) * f, look.x * sn + look.y * co));
  }
  const dark = '#1d1b22';
  if (emo === 'relieved') {
    ctx.strokeStyle = dark; ctx.lineWidth = 1.5 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(e1, ey + R * 0.08, R * 0.12, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(e2, ey + R * 0.08, R * 0.12, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  } else if (emo === 'dizzy') {
    ctx.strokeStyle = dark; ctx.lineWidth = 1.3 * s;
    [e1, e2].forEach((ex) => { ctx.beginPath(); ctx.arc(ex, ey, R * 0.13, time * 8, time * 8 + Math.PI * 1.6); ctx.stroke(); });
  } else if (emo === 'calm' || emo === 'talk') {
    ctx.fillStyle = dark;
    ellipse(ctx, e1, ey, R * 0.1, R * 0.14); ctx.fill(); ellipse(ctx, e2, ey, R * 0.1, R * 0.14); ctx.fill();
  } else {
    const big = emo === 'scream' ? 0.2 : 0.18;
    ctx.fillStyle = '#ffffff';
    ellipse(ctx, e1, ey, R * big, R * (big + 0.05)); ctx.fill(); ellipse(ctx, e2, ey, R * big, R * (big + 0.05)); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 0.8 * s;
    ellipse(ctx, e1, ey, R * big, R * (big + 0.05)); ctx.stroke(); ellipse(ctx, e2, ey, R * big, R * (big + 0.05)); ctx.stroke();
    ctx.fillStyle = dark;
    const pr = emo === 'scream' ? R * 0.07 : R * 0.085;
    circle(ctx, e1 + lv.x * R * 0.08, ey + lv.y * R * 0.1, pr); ctx.fill();
    circle(ctx, e2 + lv.x * R * 0.08, ey + lv.y * R * 0.1, pr); ctx.fill();
    // lông mày lo lắng
    ctx.strokeStyle = dark; ctx.lineWidth = 1.4 * s; ctx.lineCap = 'round';
    line(ctx, e1 - R * 0.14, ey - R * 0.3, e1 + R * 0.12, ey - R * 0.42);
    line(ctx, e2 - R * 0.12, ey - R * 0.42, e2 + R * 0.14, ey - R * 0.3);
  }
  if (L.glasses && emo !== 'dizzy') {
    ctx.strokeStyle = '#2b2b33'; ctx.lineWidth = 1.2 * s;
    circle(ctx, e1, ey, R * 0.22); ctx.stroke(); circle(ctx, e2, ey, R * 0.22); ctx.stroke();
    line(ctx, e1 + R * 0.22, ey, e2 - R * 0.22, ey); line(ctx, e1 - R * 0.22, ey, -R * 0.2, ey - R * 0.05);
  }
  // miệng
  const mx = R * 0.52, my = R * 0.48;
  ctx.fillStyle = '#8a2b2b'; ctx.strokeStyle = dark; ctx.lineWidth = 1.3 * s; ctx.lineCap = 'round';
  if (emo === 'scream') {
    ellipse(ctx, mx, my + R * 0.04, R * 0.2, R * 0.27); ctx.fill();
    ctx.fillStyle = '#f08a8a'; ellipse(ctx, mx, my + R * 0.2, R * 0.12, R * 0.08); ctx.fill();
  } else if (emo === 'scared') {
    ellipse(ctx, mx, my, R * 0.14, R * 0.1 + R * 0.04 * Math.abs(Math.sin(time * 20))); ctx.fill();
  } else if (emo === 'surprised') {
    ellipse(ctx, mx, my, R * 0.09, R * 0.12); ctx.fill();
  } else if (emo === 'talk') {
    ellipse(ctx, mx, my, R * 0.13, R * 0.03 + R * 0.1 * Math.abs(Math.sin(time * 11))); ctx.fill();
  } else if (emo === 'dizzy') {
    ctx.beginPath(); ctx.moveTo(mx - R * 0.18, my); ctx.quadraticCurveTo(mx - R * 0.06, my - R * 0.1, mx, my); ctx.quadraticCurveTo(mx + R * 0.06, my + R * 0.1, mx + R * 0.18, my); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(mx, my - R * 0.1, R * (emo === 'relieved' ? 0.2 : 0.16), Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
  }
  if (L.blush && (emo === 'calm' || emo === 'talk' || emo === 'relieved')) {
    ctx.fillStyle = 'rgba(255,120,130,0.3)'; ellipse(ctx, R * 0.62, R * 0.3, R * 0.16, R * 0.09); ctx.fill();
  }
  if (emo === 'scared' || emo === 'relieved' || emo === 'scream') {
    ctx.fillStyle = 'rgba(120,200,255,0.9)';
    ctx.beginPath(); ctx.moveTo(-R * 0.55, -R * 1.02); ctx.quadraticCurveTo(-R * 0.35, -R * 0.62, -R * 0.55, -R * 0.55); ctx.quadraticCurveTo(-R * 0.75, -R * 0.62, -R * 0.55, -R * 1.02); ctx.fill();
  }
  ctx.restore();
}

function drawPerson(ctx, P, env) {
  const J = P.J;
  if (!J || !P.visible) return;
  const L = P.look, s = J.s;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (P.shadowY != null) {
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ellipse(ctx, J.pelvis.x, P.shadowY, 17 * s, 4.5 * s); ctx.fill();
  }
  drawLeg(ctx, J, J.hipF, J.knF, J.ftF, L, true);
  drawArm(ctx, J, J.shF, J.elF, J.haF, L, true);
  if (P.pole) {
    const pl = P.pole;
    let y0 = Math.min(J.head.y, J.ftN.y, J.ftF.y, J.haN.y) - 14 * s, y1 = Math.max(J.ftN.y, J.ftF.y, J.pelvis.y, J.head.y) + 14 * s;
    y0 = Math.max(y0, pl.top); y1 = Math.min(y1, pl.bot);
    if (y1 > y0) {
      ctx.fillStyle = pl.color; ctx.fillRect(pl.x - pl.w / 2, y0, pl.w, y1 - y0);
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(pl.x - pl.w / 2 + pl.w * 0.2, y0, pl.w * 0.2, y1 - y0);
    }
  }
  drawHairTail(ctx, J, L, P.hairFlow || V(0, 1), env.time, env.W || 0);
  drawLimb(ctx, J.neck, vlerp(J.neck, J.head, 0.5), 7.5 * s, shade(L.skin, 0.93));
  if (L.bottom === 'skirt') {
    drawLeg(ctx, J, J.hipN, J.knN, J.ftN, L, false);
    drawSkirt(ctx, J, L, P.hairFlow, env.time, env.W || 0);
    drawTorso(ctx, J, L);
  } else {
    drawTorso(ctx, J, L);
    drawLeg(ctx, J, J.hipN, J.knN, J.ftN, L, false);
  }
  drawHead(ctx, J, L, P.emotion, env.time, P.lookDir);
  drawArm(ctx, J, J.shN, J.elN, J.haN, L, false);
}

function drawParachute(ctx, P, time) {
  const J = P.J; if (!J) return;
  const s = J.s;
  const c = V((J.haN.x + J.haF.x) / 2, Math.min(J.haN.y, J.haF.y) - 58 * s);
  const w = 62 * s, h = 34 * s;
  const cols = ['#ff6b6b', '#ffffff', '#ffd93d', '#ffffff', '#4dabf7', '#ffffff'];
  ctx.save();
  ctx.translate(c.x, c.y); ctx.rotate(Math.sin(time * 2.4 + P.seed) * 0.12);
  for (let i = 0; i < 6; i++) {
    const a0 = Math.PI + (i / 6) * Math.PI, a1 = Math.PI + ((i + 1) / 6) * Math.PI;
    ctx.fillStyle = cols[i];
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.ellipse(0, 0, w, h, 0, a0, a1); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.2 * s;
  ctx.beginPath(); ctx.ellipse(0, 0, w, h, 0, Math.PI, TAU); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = 'rgba(60,60,70,0.55)'; ctx.lineWidth = 1 * s;
  line(ctx, c.x - w * 0.95, c.y, J.haF.x, J.haF.y); line(ctx, c.x + w * 0.95, c.y, J.haN.x, J.haN.y);
  line(ctx, c.x - w * 0.4, c.y, J.haF.x, J.haF.y); line(ctx, c.x + w * 0.4, c.y, J.haN.x, J.haN.y);
}

// Ảnh chân dung nhỏ cho màn hình kết quả
function renderAvatar(canvas, st, outfit) {
  const ctx = canvas.getContext('2d');
  const W0 = canvas.width, H0 = canvas.height;
  ctx.clearRect(0, 0, W0, H0);
  const look = makeLook(st.name, st.gender, outfit);
  const J = fkUpright({ x: 0, pelvisY: 0, s: 1, f: 1, lean: 0, tilt: -0.12, lN: [0.05, 0.05], lF: [-0.05, 0.05], aN: [0.25, 0.5], aF: [-0.1, 0.3] });
  const k = (W0 * 0.25) / BODY.headR;
  const hx = J.head.x, hy = J.head.y;
  ctx.save();
  ctx.translate(W0 / 2, H0 * 0.4);
  ctx.scale(k, k);
  const P = { J: mapJ(J, (q) => V(q.x - hx, q.y - hy)), look, emotion: 'surprised', visible: true, lookDir: V(0.2, -1), seed: 1 };
  drawPerson(ctx, P, { time: 0.4, W: 0 });
  ctx.restore();
}

/* ---- 07-scene.js ---- */
/* ============ Sân khấu: bố cục, kịch bản, cập nhật & vẽ ============ */
// Mốc thời gian (giây, tính từ lúc bấm Bắt đầu). Kéo giãn theo thời lượng chọn: 15 / 20 / 25 giây.
// Tốc độ chạy, vùng vẫy... giữ nguyên; chỉ các giai đoạn dài ra (UFO hạ chậm hơn, nhiều lượt nhử hơn).
const TL = {};
function setTimeline(D) {
  const k = clamp((D - 15) / 10, 0, 1);
  const L = (a, b) => a + (b - a) * k;
  Object.assign(TL, {
    D,
    siren: L(0.45, 0.7), react: L(0.5, 0.8), dark0: L(0.5, 0.8), dark1: L(2.0, 3.4),
    ufo0: L(0.75, 1.3), ufo1: L(3.15, 5.2), hatch0: L(3.15, 5.2), hatch1: L(3.45, 5.6),
    beam0: L(3.35, 5.45), beam1: L(4.05, 6.4), wind0: L(3.85, 6.0), run0: L(4.25, 6.6),
    w1: L(4.75, 6.9), w2: L(6.6, 10.2), w3: L(7.8, 11.8), windTalk: L(6.7, 9.6),
    round0: L(8.1, 12.8), roundEnd: L(11.5, 20.3), minRounds: D >= 20 ? 4 : 3,
    flight: L(1.35, 1.55),
    leave: L(0.45, 0.7), leaveDur: L(0.85, 1.15), bright0: L(0.8, 1.25), bright1: L(1.9, 2.6), ting: L(1.25, 1.8), result: L(2.0, 2.9),
  });
}
setTimeline(15);
const LINES = {
  chat: ['Hihi', 'Trà sữa không?', 'Bài hôm qua khó ghê', 'Đi ăn bánh mì đi!', 'Hôm nay kiểm tra à?', 'Ơ, thật á?', 'Haha', 'Chiều đá bóng nhé!', 'Ăn gì giờ?', 'Làm bài tập chưa?', '…'],
  phone: ['Alô? Ừ…', 'Tớ đang ở trạm xe buýt', 'Ừ, về ngay đây'],
  alert: ['Cái gì kia?!', 'Ơ…', 'Đĩa bay!!!', 'Trời ơi!', 'Thật hay mơ đây?'],
  run: ['Chạy đi!', 'Bám chắc vào!', 'Cứu với!', 'Mẹ ơi!'],
  wind: ['Gió to quá!', 'Áaa!', 'Đừng buông tay!', 'Bám chặt!'],
  near: ['Hú hồn!', 'Suýt nữa!', 'Úi!', 'Tim em!'],
  relief: ['Phù!', 'Hú hồn…', 'May quá!', 'Thoát rồi!', 'Chóng mặt quá…'],
};

class Scene {
  constructor(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.px = 1;
    this.static = null;
    this.sky = makeSkyStuff();
    this.time = 0;
    this.people = [];
    this.objects = [];
    this.anchors = [];
    this.objDraw = [];
    this.lamps = []; this.cars = [];
    this.particles = [];
    this.bubbles = [];
    this.mode = 'lobby';
    this.run = null;
    this.timeScale = 1;
    this.onResult = null;
    this.screams = DEFAULT_SCREAMS.slice();
    this.outfit = 'free';
    this.shakeAmp = 0;
    this.flash = 0;
    this.chatT = 1;
    this.env = this.dayEnv();
  }
  dayEnv() {
    return { time: 0, d: 0, W: 0, gust: 0, lampOn: 0, hazard: false, storm: 0, beam: null, ufo: null, sirenVis: 0, star: 0 };
  }

  resize(cssW, cssH) {
    const sc = Math.min(cssW / WW, cssH / WH);
    const w = Math.max(1, Math.floor(WW * sc)), h = Math.max(1, Math.floor(WH * sc));
    this.cv.style.width = w + 'px';
    this.cv.style.height = h + 'px';
    const dpr = window.devicePixelRatio || 1;
    let px = sc * dpr;
    px = Math.min(px, 1.34);
    px = Math.max(px, 0.3);
    if (Math.abs(px - this.px) > 0.001 || !this.static) {
      this.px = px;
      this.cv.width = Math.round(WW * px);
      this.cv.height = Math.round(WH * px);
      this.static = buildStatic(px);
      this.world = document.createElement('canvas');
      this.world.width = this.cv.width; this.world.height = this.cv.height;
      this.wctx = this.world.getContext('2d');
    }
  }

  /* ---------- Học sinh & bố cục ---------- */
  setStudents(students, outfit) {
    this.outfit = outfit || 'free';
    this.people = students.map((st) => new Person(st, this.outfit));
    this.buildLayout(this.people.length);
    this.mode = 'lobby';
    this.run = null;
    this.env = this.dayEnv();
    this.particles = [];
    this.bubbles = [];
    this.placeLobby(null);
  }
  buildLayout(n) {
    const O = [];
    const ext = n > 45 ? (n > 55 ? 2 : 1) : 0;
    [150, 1010, 1830].forEach((x) => O.push(mkObj('tree', x, 716, 1)));
    const bikes = [290, 410, 530, 650, 1170, 1290, 1410, 1530];
    if (ext >= 1) bikes.push(770, 1650);
    if (ext >= 2) bikes.push(880, 1760);
    bikes.forEach((x, i) => O.push(mkObj('bike', x, 731, i % 3 === 1 ? -1 : 1, { color: BIKE_COLORS[i % BIKE_COLORS.length] })));
    O.push(mkObj('car', 560, 872, 1, { color: '#c1574b' }));
    O.push(mkObj('car', 1370, 862, -1, { color: '#f2f2ee', taxi: true }));
    if (ext >= 1) O.push(mkObj('car', 975, 848, 1, { color: '#5d7ea6' }));
    const lampX = [520, 850, 1180, 1510];
    if (ext >= 1) lampX.push(1640);
    lampX.forEach((x, i) => O.push(mkObj('lamp', x, 944, i % 2 ? -1 : 1, { color: '#4f6b66' })));
    const fb = [690, 1345];
    if (ext >= 2) fb.push(1020, 1600);
    fb.forEach((x, i) => O.push(mkObj('bike', x, 1018, i % 2 ? -1 : 1, { color: BIKE_COLORS[(i + 3) % BIKE_COLORS.length] })));
    O.push(mkObj('bus', 262, 985, 1));
    O.push(mkObj('booth', 1780, 1002, 1));
    this.objects = O;
    this.anchors = [];
    this.objDraw = [];
    this.lamps = []; this.cars = [];
    this.bus = null; this.booth = null;
    for (const o of O) {
      switch (o.type) {
        case 'tree': setupTree(o); this.objDraw.push({ depth: o.y, fn: (c, e) => drawTree(c, o, e) }); break;
        case 'bike': setupBike(o); this.objDraw.push({ depth: o.y, fn: (c, e) => drawBike(c, o, e) }); break;
        case 'car': setupCar(o); this.cars.push(o); this.objDraw.push({ depth: o.y, fn: (c, e) => drawCar(c, o, e) }); break;
        case 'lamp': setupLamp(o); this.lamps.push(o); this.objDraw.push({ depth: o.y, fn: (c, e) => drawLamp(c, o, e) }); break;
        case 'bus': setupBusStop(o); this.bus = o;
          this.objDraw.push({ depth: o.y - 14, fn: (c, e) => drawBusStopBack(c, o, e) });
          this.objDraw.push({ depth: o.y + 18, fn: (c, e) => drawBusStopFront(c, o, e) });
          break;
        case 'booth': setupBooth(o); this.booth = o;
          this.objDraw.push({ depth: o.y - 6, fn: (c, e) => drawBoothBack(c, o, e) });
          this.objDraw.push({ depth: o.y + 7, fn: (c, e) => drawBoothFront(c, o, e) });
          break;
      }
      this.anchors.push(...o.anchors);
    }
    // chỗ bám dự phòng dọc bó vỉa khi lớp quá đông
    const extra = n - this.anchors.length;
    for (let i = 0; i < extra; i++) {
      const x = 90 + ((i * 173) % 1740);
      const o = { type: 'curb', x, y: 922, s: depthScale(922), facing: 1, anchors: [] };
      this.anchors.push({ type: 'lie', obj: o, grip: V(x, 908), ground: 922, depth: 924, taken: null });
    }
  }

  placeLobby(returning) {
    const ppl = shuffleR(this.people);
    const n = ppl.length;
    ppl.forEach((p) => {
      p.state = 'lobby'; p.visible = true; p.flight = null; p.anchor = null; p.pole = null;
      p.tension = 0; p.lift = 0; p.air = 0; p.exclaim = 0; p.busy = false; p.regrabT = null;
      p.emotion = 'calm'; p.lookDir = null; p.hairFlow = V(0, 1); p.isPick = false;
    });
    let idx = 0;
    if (this.booth && n > 3) {
      const p = ppl[idx++];
      p.mode = 'phone'; p.x = this.booth.x + 6 * this.booth.s; p.y = this.booth.y; p.facing = -1;
    }
    if (this.bus && n > 6) {
      for (let k = 0; k < 2; k++) {
        const p = ppl[idx++];
        p.mode = 'sit'; p.x = this.bus.seats[k * 2]; p.y = this.bus.y; p.facing = k === 0 ? 1 : -1;
      }
    }
    const rest = ppl.slice(idx);
    const back = [], front = [];
    rest.forEach((p, i) => ((i % 5) < 2 ? back : front).push(p));
    const spread = (arr, depthFn) => {
      const m = arr.length;
      arr.forEach((p, i) => {
        p.x = clamp(70 + ((i + 0.5) / m) * 1780 + rr(-35, 35), 40, 1880);
        p.y = depthFn(i);
        p.xmin = 40; p.xmax = 1880;
        if (p.y > 900 && p.y < 1010) {
          // dải xa của vỉa hè trước: nằm sau trạm xe buýt & bốt điện thoại → chỉ đi trong khoảng giữa
          p.xmin = 460; p.xmax = 1690;
          p.x = clamp(460 + ((i + 0.5) / m) * 1230 + rr(-30, 30), p.xmin, p.xmax);
        }
        p.facing = RND() < 0.5 ? 1 : -1;
        const r = RND();
        p.mode = r < 0.55 ? 'walk' : r < 0.8 ? 'idle' : 'look';
        p.timer = rr(1, 6);
      });
    };
    spread(back, () => rr(700, 738));
    spread(front, () => (RND() < 0.55 ? rr(926, 984) : rr(1018, 1064)));
    // ghép cặp trò chuyện
    const pairUp = (arr) => {
      const sorted = arr.slice().sort((a, b) => a.x - b.x);
      for (let i = 0; i + 1 < sorted.length; i += 2) {
        const a = sorted[i], b = sorted[i + 1];
        if (a.st.gender === b.st.gender && RND() < 0.5) {
          b.y = a.y; b.xmin = a.xmin; b.xmax = a.xmax;
          const gap = rr(100, 115) * depthScale(a.y);
          b.x = a.x + gap * (a.x < (a.xmax || 1880) - gap ? 1 : -1);
          a.facing = Math.sign(b.x - a.x) || 1; b.facing = -a.facing;
          a.mode = 'talk'; b.mode = 'talk';
          a.partner = b; b.partner = a;
          a.speakT = rr(0, 2); b.speakT = 99;
        }
      }
    };
    pairUp(back); pairUp(front);
    const relax = (arr) => {
      const bands = [];
      arr.slice().sort((a, b) => a.y - b.y).forEach((p) => {
        const bd = bands.find((b) => Math.abs(b.y - p.y) < 22);
        if (bd) bd.list.push(p); else bands.push({ y: p.y, list: [p] });
      });
      for (const bd of bands) {
        const L = bd.list.sort((a, b) => a.x - b.x);
        for (let it = 0; it < 4; it++) {
          for (let i = 1; i < L.length; i++) {
            const a = L[i - 1], b = L[i];
            if (a.partner === b) continue;
            const need = 78 * depthScale(Math.max(a.y, b.y));
            const gap = b.x - a.x;
            if (gap < need) {
              const push = (need - gap) / 2;
              if (a.mode !== 'talk') a.x = clamp(a.x - push, a.xmin || 40, a.xmax || 1880);
              if (b.mode !== 'talk') b.x = clamp(b.x + push, b.xmin || 40, b.xmax || 1880);
            }
          }
        }
        // hai bạn khác giới đứng cạnh nhau thì không quay mặt vào nhau
        for (let i = 1; i < L.length; i++) {
          const a = L[i - 1], b = L[i];
          if (a.partner === b || a.st.gender === b.st.gender) continue;
          if (b.x - a.x < 150 * depthScale(a.y) && a.facing === 1 && b.facing === -1) { if (a.mode !== 'talk') a.facing = -1; else if (b.mode !== 'talk') b.facing = 1; }
        }
      }
    };
    relax(back); relax(front);
    if (returning && returning.length) {
      returning.forEach((p, i) => {
        if (p.mode === 'sit' || p.mode === 'phone' || p.mode === 'talk') {
          if (p.partner) { p.partner.mode = 'idle'; p.partner.partner = null; }
          p.partner = null;
          p.x = clamp(500 + ((i + 0.5) / returning.length) * 1150, 480, 1680);
          p.y = rr(930, 980);
          p.xmin = 460; p.xmax = 1690;
        }
        p.mode = 'para';
        p.paraY = -120 - i * 70 - rr(0, 60);
      });
    }
    this.people.forEach((p) => { p.depth = p.y; p.J = p.poseLobby(this.time); });
  }

  /* ---------- Bắt đầu một lượt ---------- */
  startRun(picks) {
    setTimeline(this.duration || 15);
    const N = picks.length;
    const R = Math.max(N, TL.minRounds);
    const order = shuffleR(picks);
    const rounds = [];
    for (let i = 0; i < R; i++) {
      const t = TL.round0 + (R === 1 ? 0 : (i * (TL.roundEnd - TL.round0)) / (R - 1));
      rounds.push({ t, pick: i >= R - N ? order[i - (R - N)] : null, started: false, done: false, decoys: [], near: null });
    }
    this.run = { t: 0, picks, N, count: 0, slam: null, rounds, ev: new Set(), resultShown: false, spawnAcc: 0, special: { hat: 0, sandal: 0 } };
    this.mode = 'run';
    this.particles = [];
    this.bubbles = [];
    for (const p of this.people) {
      p.isPick = picks.includes(p);
      p.react = rr(0, 0.45);
      p.runDelay = rr(0, 0.35);
      p.str = rr(0.78, 1.05);
      p.drama = false;
      if (p.mode === 'para') { p.mode = 'idle'; }
    }
    this.assignAnchors();
    // vài bạn chạy chậm bị nhấc bổng giữa đường cho kịch tính
    const far = this.people.filter((p) => !p.isPick && p.anchor && vdist(V(p.x, p.y), V(p.tx, p.ty)) > 220);
    shuffleR(far).slice(0, 2).forEach((p) => { p.drama = true; p.runDelay += 0.25; });
    this.env = this.dayEnv();
  }
  assignAnchors() {
    const pairs = [];
    const ppl = this.people.filter((p) => p.visible);
    this.anchors.forEach((a) => { a.taken = null; });
    for (const p of ppl) {
      for (const a of this.anchors) {
        if (p.isPick && a.type === 'booth') continue;
        let cost = Math.abs(p.x - a.grip.x) + 1.7 * Math.abs(p.y - a.depth);
        if (p.mode === 'phone' && a.type === 'booth') cost -= 5000;
        if (p.mode === 'sit' && a.obj === this.bus) cost -= 60;
        pairs.push([cost, p, a]);
      }
    }
    pairs.sort((u, v) => u[0] - v[0]);
    const done = new Set();
    const load = new Map();
    const free = this.anchors.length - ppl.length;
    const penalty = free > 10 ? 260 : free > 3 ? 120 : 0;
    // tham lam có phạt: vật đã có người bám thì "đắt" hơn → mỗi vật ưu tiên một bạn
    while (done.size < ppl.length) {
      let best = null, bestCost = Infinity;
      for (const pr of pairs) {
        const [c, p, a] = pr;
        if (done.has(p) || a.taken) continue;
        const cc = c + penalty * (load.get(a.obj) || 0);
        if (cc < bestCost) { bestCost = cc; best = pr; }
        if (c > bestCost) break;
      }
      if (!best) break;
      const [, p, a] = best;
      a.taken = p; p.anchor = a; done.add(p);
      load.set(a.obj, (load.get(a.obj) || 0) + 1);
    }
    for (const p of ppl) {
      const a = p.anchor;
      if (!a) continue;
      const s = depthScale(a.depth) * p.look.h;
      if (a.type === 'booth' || a.type === 'door') p.side = 1;
      else p.side = Math.sign(p.x - a.grip.x) || (a.grip.x < 960 ? 1 : -1);
      p.tx = a.grip.x + p.side * approachOffset(a, s);
      p.ty = a.depth;
    }
  }

  /* ---------- Tiện ích hiệu ứng ---------- */
  addShake(a) { this.shakeAmp = Math.max(this.shakeAmp, a); }
  addBubble(p, text, dur, big) {
    if (!p) return;
    this.bubbles = this.bubbles.filter((b) => b.p !== p);
    if (!big && this.bubbles.length > 7) return;
    this.bubbles.push({ p, text, t0: this.time, dur, big: !!big });
  }
  hatchPos() {
    const u = this.env.ufo;
    if (!u) return V(960, UFO_REST_Y + HATCH_DY);
    return V(u.x + Math.sin(u.rot) * -HATCH_DY * u.sc, u.y + HATCH_DY * u.sc * Math.cos(u.rot));
  }
  helix(f, u) {
    const H = this.hatchPos();
    const k = Math.pow(u, 1.55);
    const ang = f.turns * TAU * k;
    const amp = f.amp * (1 - k);
    const x = H.x + (f.x0 - H.x) * Math.pow(1 - k, 1.1) + amp * Math.sin(ang);
    const y = lerp(f.y0, H.y, easeInOut(Math.min(1, k * 1.05))) - Math.sin(Math.min(1, u * 4) * Math.PI) * 18 * (1 - k);
    const z = amp * Math.cos(ang);
    const sc = (1 + (0.18 * z) / (Math.abs(f.amp) + 1)) * lerp(1, 0.26, Math.pow(k, 1.3));
    return { x, y, z, sc, k };
  }

  /* ---------- Cập nhật ---------- */
  update(dt) {
    this.time += dt;
    const E = this.env;
    E.time = this.time;
    this.shakeAmp = Math.max(0, this.shakeAmp - dt * 22);
    this.flash = Math.max(0, this.flash - dt * 2.8);
    if (this.mode === 'run') this.updateRun(dt);
    else this.updateLobby(dt);
    updateClouds(this.sky, dt, E.storm, E.ufo ? E.ufo.x : 960);
    this.bubbles = this.bubbles.filter((b) => this.time - b.t0 < b.dur && b.p.visible);
  }

  updateLobbyPerson(p, dt) {
    switch (p.mode) {
      case 'walk': {
        p.x += p.facing * p.speed * p.s * dt;
        p.phase += (dt * p.speed * TAU) / 105;
        const xmin = p.xmin || 40, xmax = p.xmax || 1880;
        if (p.x < xmin) { p.x = xmin; p.facing = 1; }
        if (p.x > xmax) { p.x = xmax; p.facing = -1; }
        p.timer -= dt;
        if (p.timer <= 0) { p.mode = RND() < 0.6 ? 'idle' : 'look'; p.timer = rr(1.5, 4); }
        break;
      }
      case 'idle': case 'look':
        p.timer -= dt;
        if (p.timer <= 0) { p.mode = 'walk'; p.timer = rr(3, 8); if (RND() < 0.45) p.facing *= -1; }
        break;
      case 'para': {
        const target = p.y - 86 * p.s;
        p.paraY += 190 * dt;
        if (p.paraY >= target) { p.paraY = target; p.mode = 'idle'; p.timer = rr(1.5, 3); p.emotion = 'relieved'; p.landT = this.time; }
        break;
      }
    }
    if (p.mode === 'talk') p.emotion = p.speaking ? 'talk' : 'calm';
    else if (p.mode === 'phone') p.emotion = Math.sin(this.time * 0.7 + p.seed) > 0 ? 'talk' : 'calm';
    else if (p.mode === 'para') p.emotion = 'surprised';
    else if (p.emotion === 'relieved' && this.time - (p.landT || 0) > 2.5) p.emotion = 'calm';
    else if (p.emotion !== 'relieved') p.emotion = 'calm';
    p.J = p.poseLobby(this.time);
    p.depth = p.y;
    p.shadowY = p.mode === 'para' ? null : p.y;
    p.hairFlow = V(Math.sin(this.time * 1.3 + p.seed) * 0.08, 1);
    p.lookDir = null;
  }
  lobbyChatter(dt) {
    this.chatT -= dt;
    for (const p of this.people) {
      if (p.mode !== 'talk' || !p.partner) continue;
      p.speakT -= dt;
      if (p.speakT <= 0 && p.speakT > -50) {
        p.speaking = true; p.partner.speaking = false;
        p.speakT = -99; p.partner.speakT = rr(1.8, 3.2);
      }
    }
    if (this.chatT <= 0) {
      this.chatT = rr(1.3, 2.6);
      const talkers = this.people.filter((p) => (p.mode === 'talk' && p.speaking) || p.mode === 'phone');
      if (talkers.length) {
        const p = pickR(talkers);
        this.addBubble(p, pickR(p.mode === 'phone' ? LINES.phone : LINES.chat), 2.2);
      }
    }
  }
  updateLobby(dt) {
    const E = this.env;
    if (this.mode === 'lobby') {
      E.d = 0; E.W = 0; E.lampOn = 0; E.hazard = false; E.beam = null; E.ufo = null; E.storm = 0; E.sirenVis = 0; E.star = 0;
      for (const p of this.people) this.updateLobbyPerson(p, dt);
      this.lobbyChatter(dt);
    } else {
      // 'done': cảnh sau khi UFO bay đi — mọi người ngồi thở phào
      for (const p of this.people) if (p.visible) this.updatePersonAfter(p, dt);
    }
  }
  updatePersonAfter(p, dt) {
    if (p.state === 'drop' || p.state === 'relieved') this.stepDrop(p);
  }

  updateRun(dt) {
    const run = this.run, E = this.env;
    run.t += dt;
    const t = run.t;
    const once = (key, cond, fn) => { if (cond && !run.ev.has(key)) { run.ev.add(key); fn(); } };
    const ts = run.slam;
    // --- môi trường ---
    let d = t < TL.dark0 ? 0 : easeInOut(invLerp(TL.dark0, TL.dark1, t));
    if (ts) d *= 1 - sstep(ts + TL.bright0, ts + TL.bright1, t);
    E.d = d;
    const lampT = TL.dark0 + 0.7;
    E.lampOn = t < lampT ? 0 : t < lampT + 0.45 ? (Math.sin(t * 70) > 0 ? 1 : 0.15) : 1;
    E.lampOn *= sstep(0.2, 0.5, d);
    E.hazard = t > TL.siren && (!ts || t < ts + 1.0);
    E.storm = sstep(TL.dark0, TL.ufo1, t) * (ts ? 1 - sstep(ts + 0.5, ts + 1.6, t) : 1);
    E.sirenVis = t > TL.siren ? 1 - sstep(TL.beam0, TL.beam0 + 0.6, t) : 0;
    // --- UFO ---
    let ux = 960, uy = t < TL.ufo1 ? lerp(-330, UFO_REST_Y, easeOutCubic(invLerp(TL.ufo0, TL.ufo1, t))) : UFO_REST_Y;
    uy += Math.sin(t * 1.7) * 5 * sstep(TL.ufo1 - 0.4, TL.ufo1 + 0.6, t);
    let usc = 1, urot = Math.sin(t * 1.25) * 0.018;
    if (ts && t > ts + TL.leave) {
      const k = easeInCubic(invLerp(ts + TL.leave, ts + TL.leave + TL.leaveDur, t));
      ux = lerp(960, 2380, k); uy = lerp(uy, -380, k); usc = lerp(1, 0.4, k); urot = lerp(urot, -0.26, sstep(0, 0.3, k));
    }
    let hatch = sstep(TL.hatch0, TL.hatch1, t);
    if (ts && t >= ts) hatch = 0;
    const prevUfo = E.ufo;
    E.ufo = { x: ux, y: uy, sc: usc, rot: urot, hatch, lights: 1, count: run.count, total: run.N, flash: prevUfo ? Math.max(0, prevUfo.flash - dt * 2.5) : 0, visible: t > TL.ufo0 - 0.05 && !(ts && t > ts + TL.leave + TL.leaveDur - 0.02) };
    const HP = this.hatchPos();
    E.beam = { x: HP.x, y: HP.y - 8, open: sstep(TL.beam0, TL.beam0 + 0.3, t), reach: easeOutCubic(invLerp(TL.beam0, TL.beam1, t)), alpha: 1, swirl: sstep(TL.wind0, TL.wind0 + 1, t) };
    if (ts) { const k = sstep(ts, ts + 0.28, t); E.beam.reach *= 1 - k; E.beam.alpha = 1 - k; E.beam.swirl *= 1 - k; }
    if (t < TL.beam0) E.beam.reach = 0;
    // --- gió ---
    let W = 0;
    if (t > TL.wind0) W = 0.35 * sstep(TL.wind0, TL.w1, t) + 0.3 * sstep(TL.w1, TL.w2, t) + 0.2 * sstep(TL.w2, TL.w3, t);
    E.gust = W > 0 ? noise1(t * 1.3, 5) * 0.08 : 0;
    W = clamp(W + E.gust, 0, 1);
    if (ts) W *= 1 - sstep(ts, ts + 0.45, t);
    E.W = W;
    E.star = ts ? sstep(ts + TL.ting - 0.05, ts + TL.ting + 0.08, t) * (1 - sstep(ts + TL.ting + 0.45, ts + TL.ting + 1.0, t)) : 0;
    // --- âm thanh & sự kiện ---
    once('siren', t >= TL.siren, () => Sfx.sirenOn());
    once('sirenOff', t >= TL.beam0 + 0.25, () => Sfx.sirenOff());
    once('hum', t >= TL.ufo0, () => Sfx.humOn());
    once('land', t >= TL.ufo1, () => this.addShake(5));
    once('beam', t >= TL.beam0, () => { Sfx.beam(); this.flash = 0.35; this.addShake(4); });
    once('wind', t >= TL.wind0, () => Sfx.windOn());
    if (run.ev.has('wind') && !ts) Sfx.setWind(W, E.gust);
    once('alertTalk', t >= TL.react + 0.75, () => {
      shuffleR(this.people.filter((p) => p.visible)).slice(0, 3).forEach((p, i) => this.addBubble(p, LINES.alert[(i + ri(0, 4)) % LINES.alert.length], 1.6));
    });
    once('runTalk', t >= TL.run0 + 0.35, () => {
      shuffleR(this.people.filter((p) => p.visible && !p.isPick)).slice(0, 2).forEach((p, i) => this.addBubble(p, LINES.run[(i + ri(0, 3)) % LINES.run.length], 1.4));
    });
    once('windTalk', t >= TL.windTalk, () => {
      shuffleR(this.people.filter((p) => p.state === 'cling' && !p.isPick)).slice(0, 2).forEach((p, i) => this.addBubble(p, LINES.wind[(i + ri(0, 3)) % LINES.wind.length], 1.3));
    });
    if (!ts && run.count >= run.N) { run.slam = t + 0.12; }
    if (ts) {
      once('slam', t >= ts, () => {
        Sfx.slam(); Sfx.windOff(); this.addShake(14);
        for (const p of this.people) if (p.visible && p.state !== 'fly' && p.state !== 'gone') this.startDrop(p);
        this.spreadSeats();
      });
      once('leave', t >= ts + TL.leave, () => { Sfx.humOff(true); Sfx.flyAway(); });
      once('ting', t >= ts + TL.ting, () => Sfx.ting());
      once('relief', t >= ts + 0.55, () => {
        shuffleR(this.people.filter((p) => p.visible && p.state !== 'gone')).slice(0, 4).forEach((p, i) => this.addBubble(p, LINES.relief[(i + ri(0, 4)) % LINES.relief.length], 1.8));
      });
      once('result', t >= ts + TL.result, () => {
        this.mode = 'done';
        Sfx.stopAll();
        if (this.onResult) this.onResult(run.picks.map((p) => p.st));
      });
    }
    // --- các vòng nhử & tuột tay ---
    for (const r of run.rounds) {
      if (!r.started && t >= r.t - 0.65) {
        r.started = true;
        const cands = this.people.filter((q) => q.state === 'cling' && !q.isPick && q.anchor && q.anchor.type !== 'booth' && !q.busy);
        r.decoys = shuffleR(cands).slice(0, r.pick ? ri(1, 2) : 2);
        r.near = r.decoys.length && RND() < (r.pick ? 0.4 : 0.85) ? r.decoys[0] : null;
        r.decoys.forEach((q) => { q.busy = true; q.relHand = RND() < 0.5 ? 0 : 1; q.regrabT = null; });
        if (r.pick) r.pick.relHand = RND() < 0.5 ? 0 : 1;
      }
      if (r.started && !r.done) {
        const k = clamp((t - (r.t - 0.65)) / 0.65, 0, 1);
        if (r.pick && (r.pick.state === 'cling' || r.pick.state === 'grab')) r.pick.tension = k;
        r.decoys.forEach((q) => { q.tension = q === r.near ? (k < 0.75 ? k : lerp(0.75, 1.25, (k - 0.75) / 0.25)) : k * 0.9; });
        if (t >= r.t) {
          r.done = true;
          if (r.pick && r.pick.state !== 'fly' && r.pick.state !== 'gone') this.startFlight(r.pick);
          r.decoys.forEach((q) => { q.regrabT = t; });
          if (r.near) this.addBubble(r.near, pickR(LINES.near), 1.2);
        }
      }
    }
    // --- từng nhân vật ---
    for (const p of this.people) {
      if (!p.visible) continue;
      this.updateRunPerson(p, dt, t, W);
    }
    // --- hạt bay ---
    this.updateParticles(dt, t, W, ts);
  }

  updateRunPerson(p, dt, t, W) {
    const E = this.env;
    const HP = this.hatchPos();
    if (p.regrabT != null && p.state === 'cling') {
      p.tension = Math.max(0, p.tension - dt * 3.2);
      if (p.tension <= 0) { p.regrabT = null; p.busy = false; }
    }
    switch (p.state) {
      case 'lobby':
        if (t >= TL.react + p.react) {
          p.state = 'alert'; p.exclaim = 1.1;
          if (p.mode === 'sit' || p.mode === 'para') p.mode = 'idle';
          if (p.mode !== 'phone') p.facing = Math.sign(960 - p.x) || 1;
          p.speaking = false;
        } else { this.updateLobbyPerson(p, dt); break; }
      // eslint-disable-next-line no-fallthrough
      case 'alert': {
        p.exclaim = Math.max(0, p.exclaim - dt);
        if (t >= TL.run0 + p.runDelay && p.anchor) {
          p.state = 'run'; p.t0 = t; p.phase = rr(0, TAU);
          p.facing = Math.sign(p.tx - p.x) || p.facing;
          p.J0 = null;
        } else {
          const scared = t > TL.beam0 + 0.1;
          p.emotion = scared ? 'scared' : 'surprised';
          p.J = p.poseAlert(this.time, scared);
          p.lookDir = vsub(HP, p.J.head);
          p.shadowY = p.y; p.depth = p.y;
          p.hairFlow = this.flowAt(p.J.head, W, HP);
          break;
        }
      }
      // eslint-disable-next-line no-fallthrough
      case 'run': {
        const dx = p.tx - p.x, dy = p.ty - p.y;
        const dist = Math.hypot(dx, dy);
        const sp = 470 * dt;
        if (Math.abs(dx) > 3) p.facing = Math.sign(dx);
        p.phase += dt * 15;
        if (p.drama) {
          const u = t - p.t0;
          p.air = u < 0.15 ? 0 : Math.sin(clamp((u - 0.15) / 0.75, 0, 1) * Math.PI);
          if (u > 0.2 && u < 0.3 && !p.dramaSaid) { p.dramaSaid = true; this.addBubble(p, 'Áaa!', 1.0); }
        }
        const slow = p.drama ? 1 - 0.55 * p.air : 1;
        if (dist <= sp * slow) {
          p.x = p.tx; p.y = p.ty;
          p.state = 'grab'; p.t0 = t; p.J0 = p.J; p.air = 0;
        } else {
          p.x += (dx / dist) * sp * slow; p.y += (dy / dist) * sp * slow;
        }
        p.emotion = p.air > 0.2 ? 'scream' : 'scared';
        p.J = p.poseRun(this.time);
        p.lookDir = vsub(HP, p.J.head);
        p.depth = p.y; p.shadowY = p.y;
        p.hairFlow = this.flowAt(p.J.head, W, HP);
        p.pole = null;
        if (p.state !== 'grab') break;
      }
      // eslint-disable-next-line no-fallthrough
      case 'grab': {
        const dur = 0.3;
        const k = clamp((t - p.t0) / dur, 0, 1);
        this.stepLift(p, dt, W);
        const J1 = p.poseCling(this.time, W, HP);
        let J = p.J0 ? lerpJ(p.J0, J1, easeOutQuad(k)) : J1;
        if (p.anchor.type === 'pole' && k < 1) {
          const hop = Math.sin(k * Math.PI) * 26 * J.s;
          J = mapJ(J, (q) => V(q.x, q.y - hop));
        }
        p.J = J;
        p.depth = p.anchor.depth; p.shadowY = null;
        p.emotion = 'scared';
        p.lookDir = vsub(HP, J.head);
        p.hairFlow = this.flowAt(J.head, W, HP);
        if (k >= 1) p.state = 'cling';
        break;
      }
      case 'cling': {
        this.stepLift(p, dt, W);
        p.J = p.poseCling(this.time, W, HP);
        p.depth = p.anchor.depth; p.shadowY = null;
        p.emotion = p.tension > 0.35 ? 'scream' : 'scared';
        p.lookDir = vsub(HP, p.J.head);
        p.hairFlow = this.flowAt(p.J.head, W, HP);
        break;
      }
      case 'fly': {
        const f = p.flight;
        const u = clamp((t - f.t0) / f.dur, 0, 1);
        const pos = this.helix(f, u);
        const s = f.s0 * pos.sc;
        const JL = p.poseFlyLocal(this.time, s);
        const c = vlerp(JL.pelvis, JL.neck, 0.5);
        const rot = f.rot0 + f.spin * easeInQuad(u) + 0.25 * Math.sin(this.time * 6);
        const co = Math.cos(rot), sn = Math.sin(rot);
        let J = mapJ(JL, (q) => { const x = q.x - c.x, y = q.y - c.y; return V(pos.x + x * co - y * sn, pos.y + x * sn + y * co); });
        J.headRot = JL.headRot + rot;
        J.s = s;
        const blend = sstep(0, 0.16, t - f.t0);
        if (f.J0 && blend < 1) J = lerpJ(f.J0, J, blend);
        p.J = J; p.z = pos.z; p.flyK = pos.k; p.flyU = u;
        p.emotion = 'scream';
        p.pole = null; p.shadowY = null;
        p.hairFlow = vsub(HP, J.head);
        if (u >= 1) {
          p.state = 'gone'; p.visible = false;
          this.run.count++;
          if (this.env.ufo) this.env.ufo.flash = 0.8;
          Sfx.pop();
          this.burst(HP);
        }
        break;
      }
      case 'drop': case 'relieved':
        this.stepDrop(p);
        break;
    }
  }
  stepLift(p, dt, W) {
    const target = sstep(0.45, 1.0, W) * (p.str || 1);
    p.lift += (target - p.lift) * Math.min(1, dt * 2.6);
  }
  flowAt(head, W, HP) {
    const d = vnorm(vsub(HP, head));
    return vnorm(V(d.x * W * 1.6, lerp(1, d.y, W)));
  }
  startFlight(p) {
    const t = this.run.t;
    const J = p.J;
    const c = vlerp(J.pelvis, J.neck, 0.5);
    const body = Math.atan2(J.neck.y - J.pelvis.y, J.neck.x - J.pelvis.x);
    p.flight = {
      t0: t, dur: TL.flight, x0: c.x, y0: c.y, s0: J.s,
      amp: rr(90, 150) * (RND() < 0.5 ? 1 : -1), turns: rr(1.5, 2.3),
      rot0: body + Math.PI / 2, spin: rr(1.1, 1.9) * TAU * (RND() < 0.5 ? 1 : -1), J0: J,
    };
    p.state = 'fly'; p.tension = 0; p.exclaim = 0;
    if (p.anchor) p.anchor.taken = null;
    Sfx.whoop();
    this.addBubble(p, pickR(this.screams.length ? this.screams : DEFAULT_SCREAMS), 1.4, true);
  }
  startDrop(p) {
    const J = p.J;
    const wasClinging = p.state === 'cling' || p.state === 'grab';
    p.state = 'drop'; p.t0 = this.run ? this.run.t : 0; p.J0 = J;
    p.tension = 0; p.busy = false; p.exclaim = 0;
    p.dropGround = wasClinging && p.anchor ? p.anchor.depth : p.y;
    p.dropX = clamp(J.pelvis.x, 30, 1890);
    const h = Math.max(0, p.dropGround - J.pelvis.y);
    p.dropDur = 0.28 + clamp(h / 900, 0, 0.35);
    p.emotion = 'surprised';
    p.pole = null;
  }
  spreadSeats() {
    const sitters = this.people.filter((p) => p.state === 'drop').sort((a, b) => a.dropX - b.dropX);
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 1; i < sitters.length; i++) {
        const a = sitters[i - 1], b = sitters[i];
        if (Math.abs(a.dropGround - b.dropGround) > 40) continue;
        const need = 62 * depthScale(Math.max(a.dropGround, b.dropGround));
        if (b.dropX - a.dropX < need) {
          const push = (need - (b.dropX - a.dropX)) / 2;
          a.dropX = clamp(a.dropX - push, 30, 1890); b.dropX = clamp(b.dropX + push, 30, 1890);
        }
      }
    }
  }
  stepDrop(p) {
    const t = this.run ? this.run.t : 0;
    const k = clamp((t - p.t0) / p.dropDur, 0, 1);
    const J1 = p.poseSitGround(p.dropX, p.dropGround, this.time);
    p.J = k < 1 && p.J0 ? lerpJ(p.J0, J1, easeInQuad(k)) : J1;
    p.depth = p.dropGround; p.shadowY = k >= 1 ? p.dropGround : null;
    p.hairFlow = V(0, 1); p.lookDir = null;
    if (k >= 1 && p.state === 'drop') { p.state = 'relieved'; p.emotion = RND() < 0.3 ? 'dizzy' : 'relieved'; if (this.run) this.addShake(1.5); }
  }

  /* ---------- Hạt bay ---------- */
  updateParticles(dt, t, W, ts) {
    const run = this.run;
    const E = this.env;
    if (t > TL.beam0 + 0.2 && (!ts || t < ts)) {
      run.spawnAcc += (18 + 95 * W) * dt;
      const G = E.beam ? beamGeom(E.beam) : null;
      while (run.spawnAcc >= 1 && this.particles.length < 170) {
        run.spawnAcc -= 1;
        const x = rr(-20, WW + 20), y = rr(690, 1075);
        if (G && y > G.reachY) continue;
        const r = RND();
        let kind = r < 0.36 ? 'leaf' : r < 0.58 ? 'paper' : r < 0.9 ? 'dust' : r < 0.95 ? 'bag' : r < 0.975 ? 'hat' : 'sandal';
        if (kind === 'hat' && (run.special.hat >= 2 || W < 0.4)) kind = 'leaf';
        if (kind === 'sandal' && (run.special.sandal >= 2 || W < 0.4)) kind = 'paper';
        if (kind === 'hat') run.special.hat++;
        if (kind === 'sandal') run.special.sandal++;
        this.particles.push({
          kind, x0: x, y0: y, t0: t, dur: rr(1.4, 3.0) * (kind === 'dust' ? 0.8 : 1),
          amp: rr(40, 170) * (RND() < 0.5 ? 1 : -1), turns: rr(1, 2.6), rot: rr(0, TAU), spin: rr(-7, 7),
          color: kind === 'leaf' ? pickR(['#6a9f5f', '#8fb06a', '#b9a24f', '#5a8f60']) : pickR(['#f4f1ea', '#7a9cc0', '#c98476', '#d8bf7a']),
          alpha: 1, sc0: depthScale(y) * (kind === 'hat' || kind === 'sandal' ? 1.1 : 1),
        });
      }
    }
    for (const p of this.particles) {
      const u = (t - p.t0) / p.dur;
      if (u >= 1) { p.dead = true; continue; }
      if (p.spark) continue;
      const pos = this.helix(p, clamp(u, 0, 1));
      p.x = pos.x; p.y = pos.y; p.z = pos.z; p.sc = p.sc0 * pos.sc;
      p.alpha = sstep(0, 0.08, u) * (1 - sstep(0.9, 1, u));
    }
    this.particles = this.particles.filter((p) => !p.dead);
  }
  burst(P) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({ kind: 'spark', x0: P.x, y0: P.y, t0: this.run.t, dur: 0.5, vx: rr(-160, 160), vy: rr(-40, 120), rot: 0, spin: 0, alpha: 1, sc0: 1, spark: true });
    }
  }

  /* ---------- Vẽ ---------- */
  render() {
    const ctx = this.ctx, E = this.env;
    const PF = this.prof ? (k) => { const n = performance.now(); this.prof[k] = (this.prof[k] || 0) + n - this._pt; this._pt = n; } : () => {};
    if (this.prof) this._pt = performance.now();
    ctx.setTransform(this.px, 0, 0, this.px, 0, 0);
    ctx.save();
    if (this.shakeAmp > 0.05) {
      ctx.translate(noise1(this.time * 40, 1) * this.shakeAmp, noise1(this.time * 37, 2) * this.shakeAmp);
    }
    drawSky(ctx, this.sky, E.d, this.time, E.storm);
    if (E.star > 0) this.drawStar(ctx, 1730, 86, E.star);
    PF('sky');
    ctx.drawImage(this.static.canvas, 0, 0, WW, WH);
    if (E.d > 0.001) {
      ctx.globalAlpha = clamp(E.d, 0, 1);
      ctx.drawImage(this.static.night, 0, 0, WW, WH);
      ctx.globalAlpha = 1;
    }
    if (E.beam && E.beam.reach > 0) drawBeamBack(ctx, E.beam);
    PF('static');
    // vật thể + người theo chiều sâu (khi trời tối: vẽ lên lớp riêng rồi phủ tối đúng phần đã vẽ)
    const list = this.objDraw.slice();
    for (const p of this.people) {
      if (!p.visible || p.state === 'fly' || p.state === 'gone') continue;
      list.push({ depth: p.depth + 0.01, fn: (c) => { if (p.mode === 'para' && p.state === 'lobby') drawParachute(c, p, this.time); drawPerson(c, p, E); } });
    }
    list.sort((a, b) => a.depth - b.depth);
    if (E.d > 0.001 && this.world) {
      const w = this.world, wc = this.wctx;
      wc.setTransform(1, 0, 0, 1, 0, 0);
      wc.clearRect(0, 0, w.width, w.height);
      wc.setTransform(this.px, 0, 0, this.px, 0, 0);
      if (this.shakeAmp > 0.05) wc.translate(noise1(this.time * 40, 1) * this.shakeAmp, noise1(this.time * 37, 2) * this.shakeAmp);
      for (const it of list) it.fn(wc, E);
      const lit = E.beam ? E.beam.reach * E.beam.alpha : 0;
      const a0 = 0.5 * E.d, a1 = a0 * (1 - 0.74 * lit);
      const dg = wc.createLinearGradient(0, 250, 0, 780);
      dg.addColorStop(0, `rgba(10,12,40,${a0})`);
      dg.addColorStop(1, `rgba(10,12,40,${a1})`);
      wc.globalCompositeOperation = 'source-atop';
      wc.fillStyle = dg;
      wc.fillRect(-60, -60, WW + 120, WH + 120);
      wc.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(w, 0, 0);
      ctx.restore();
    } else {
      for (const it of list) it.fn(ctx, E);
    }
    PF('world');
    if (E.lampOn > 0.01 || E.hazard) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (E.lampOn > 0.01) for (const o of this.lamps) drawLampLight(ctx, o, E);
      if (E.hazard) for (const o of this.cars) drawCarLights(ctx, o, E);
      ctx.restore();
    }
    PF('dark+lights');
    if (E.beam && E.beam.reach > 0) drawBeamFront(ctx, E.beam, this.time);
    PF('beam');
    // người bay + hạt theo độ sâu z
    const flyers = [];
    for (const p of this.people) if (p.visible && p.state === 'fly') flyers.push({ z: p.z || 0, p });
    for (const q of this.particles) flyers.push({ z: q.z || 0, q });
    flyers.sort((a, b) => a.z - b.z);
    for (const it of flyers) {
      if (it.p) {
        ctx.save();
        const u = it.p.flyU || 0;
        ctx.globalAlpha = 1 - sstep(0.9, 1, u);
        drawPerson(ctx, it.p, E);
        ctx.restore();
      } else if (it.q.spark) {
        const q = it.q, u = (this.run ? this.run.t : 0) - q.t0;
        if (u < q.dur) {
          ctx.fillStyle = `rgba(210,255,235,${1 - u / q.dur})`;
          const x = q.x0 + q.vx * u, y = q.y0 + q.vy * u + 200 * u * u;
          ctx.fillRect(x - 2, y - 2, 4, 4);
        } else q.dead = true;
      } else {
        drawParticle(ctx, it.q, it.q.x, it.q.y, it.q.sc, this.time);
      }
    }
    PF('flyers');
    if (E.ufo && E.ufo.visible) drawUFO(ctx, E.ufo, this.time);
    PF('ufo');
    this.drawOverlay(ctx);
    PF('overlay');
    ctx.restore();
    // hiệu ứng toàn màn hình
    if (E.sirenVis > 0.01) {
      const pulse = 0.5 + 0.5 * Math.sin(this.time * TAU * 1.24);
      const g = ctx.createRadialGradient(WW / 2, WH / 2, WH * 0.35, WW / 2, WH / 2, WW * 0.62);
      g.addColorStop(0, 'rgba(255,40,40,0)');
      g.addColorStop(1, `rgba(255,30,30,${0.42 * E.sirenVis * pulse})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, WW, WH);
    }
    if (this.flash > 0.01) { ctx.fillStyle = `rgba(235,255,245,${this.flash})`; ctx.fillRect(0, 0, WW, WH); }
    PF('fx');
  }
  drawStar(ctx, x, y, k) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(this.time * 2); ctx.scale(k, k);
    ctx.fillStyle = '#fffbe0';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) { const r = i % 2 ? 7 : 30; const a = (i / 8) * TAU; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fill();
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 40);
    g.addColorStop(0, 'rgba(255,250,210,0.8)'); g.addColorStop(1, 'rgba(255,250,210,0)');
    ctx.fillStyle = g; circle(ctx, 0, 0, 40); ctx.fill();
    ctx.restore();
  }

  drawOverlay(ctx) {
    const E = this.env;
    // bảng tên (tránh chồng lấp bằng cách xếp tầng)
    const tags = [];
    let flyer = [];
    for (const p of this.people) {
      if (!p.visible || !p.J) continue;
      if (p.state === 'fly') { flyer.push(p); continue; }
      const J = p.J, s = J.s;
      const hx = J.head.x, hy = Math.min(J.head.y, J.neck.y) - BODY.headR * s - 9;
      const fs = clamp(19 * s, 16, 21);
      ctx.font = `700 ${fs}px ${FONT_UI}`;
      const w = ctx.measureText(p.st.label).width + 14;
      tags.push({ p, x: hx, y: hy, w, h: fs + 9, fs });
    }
    tags.sort((a, b) => a.x - b.x);
    const placed = [];
    for (const tg of tags) {
      let lvl = 0;
      for (; lvl < 4; lvl++) {
        const y = tg.y - lvl * (tg.h + 3);
        const hit = placed.some((o) => Math.abs(o.x - tg.x) < (o.w + tg.w) / 2 + 2 && Math.abs(o.yy - y) < (o.h + tg.h) / 2 + 1);
        if (!hit) break;
      }
      lvl = Math.min(lvl, 3);
      tg.yy = tg.y - lvl * (tg.h + 3);
      tg.lvl = lvl;
      placed.push(tg);
    }
    const tagAlpha = this.mode === 'run' ? (E.W > 0.05 ? 0.8 : 0.92) : 1;
    for (const tg of placed) this.drawTag(ctx, tg, tagAlpha);
    // dấu chấm than
    for (const p of this.people) {
      if (!p.visible || !p.J || p.exclaim <= 0) continue;
      const J = p.J, s = J.s;
      const k = Math.min(1, (1.1 - p.exclaim) * 6);
      const x = J.head.x + (BODY.headR + 17) * s * p.facing, y = J.head.y - 4 * s;
      ctx.save(); ctx.translate(x, y); ctx.scale(easeOutBack(k), easeOutBack(k));
      ctx.fillStyle = '#ffffff'; circle(ctx, 0, 0, 13); ctx.fill();
      ctx.strokeStyle = '#e03131'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#e03131'; ctx.font = `900 20px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, 1);
      ctx.restore();
    }
    // bong bóng thoại
    for (const b of this.bubbles) this.drawBubble(ctx, b);
    // bảng tên lớn cho người đang bị hút
    for (const p of flyer) this.drawBigTag(ctx, p);
  }
  drawTag(ctx, tg, alpha) {
    const p = tg.p, x = tg.x, y = tg.yy;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (tg.lvl > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.5;
      line(ctx, x, y + tg.h / 2, x, tg.y + tg.h / 2 - 2);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    rrect(ctx, x - tg.w / 2, y - tg.h / 2, tg.w, tg.h, tg.h / 2); ctx.fill();
    ctx.strokeStyle = '#5b6b7c'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#1b2533';
    ctx.font = `700 ${tg.fs}px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(p.st.label, x, y + 1);
    ctx.restore();
  }
  drawBigTag(ctx, p) {
    const J = p.J;
    const u = p.flyU || 0;
    const k = easeOutBack(clamp(u * 5, 0, 1));
    const x = clamp(J.head.x, 180, WW - 180), y = clamp(J.head.y - 70, 60, WH - 60);
    const fs = 46;
    ctx.save();
    ctx.translate(x, y); ctx.scale(k, k);
    ctx.globalAlpha = 1 - sstep(0.92, 1, u);
    ctx.font = `800 ${fs}px ${FONT_UI}`;
    const w = ctx.measureText(p.st.label).width + 44;
    ctx.fillStyle = 'rgba(12,30,26,0.55)'; rrect(ctx, -w / 2 + 4, -fs * 0.72 + 6, w, fs * 1.44, 20); ctx.fill();
    ctx.fillStyle = '#ffffff'; rrect(ctx, -w / 2, -fs * 0.72, w, fs * 1.44, 20); ctx.fill();
    ctx.strokeStyle = '#12b886'; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#0b3d2e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(p.st.label, 0, 2);
    ctx.restore();
  }
  drawBubble(ctx, b) {
    const p = b.p;
    if (!p.J) return;
    const age = this.time - b.t0;
    const k = easeOutBack(clamp(age * 6, 0, 1)) * (1 - sstep(b.dur - 0.2, b.dur, age));
    if (k <= 0.01) return;
    const J = p.J, s = J.s;
    const fs = b.big ? 34 : 21;
    ctx.font = `800 ${fs}px ${FONT_UI}`;
    const w = ctx.measureText(b.text).width + (b.big ? 36 : 24);
    const h = fs + (b.big ? 24 : 16);
    let x = J.head.x + (b.big ? 0 : 34 * s * p.facing);
    let y = J.head.y - (b.big ? 130 : 58 * s + 16);
    x = clamp(x, w / 2 + 10, WW - w / 2 - 10);
    y = clamp(y, h / 2 + 10, WH - h / 2 - 10);
    ctx.save();
    ctx.translate(x, y); ctx.scale(k, k);
    ctx.fillStyle = b.big ? '#fff4e6' : '#ffffff';
    ctx.strokeStyle = b.big ? '#e8590c' : '#343a40';
    ctx.lineWidth = b.big ? 4 : 2.5;
    rrect(ctx, -w / 2, -h / 2, w, h, 16); ctx.fill(); ctx.stroke();
    const tx = clamp((J.head.x - x) / k, -w / 2 + 16, w / 2 - 16);
    ctx.beginPath(); ctx.moveTo(tx - 9, h / 2 - 2); ctx.lineTo(tx + 9, h / 2 - 2); ctx.lineTo(tx + (J.head.x > x ? 14 : -14), h / 2 + 14); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = b.big ? '#fff4e6' : '#ffffff'; ctx.fillRect(tx - 8, h / 2 - 5, 16, 5);
    ctx.fillStyle = b.big ? '#c92a2a' : '#212529';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(b.text, 0, 1);
    ctx.restore();
  }

  /* ---------- Bỏ qua tới kết quả ---------- */
  skipToEnd() {
    if (this.mode !== 'run' || !this.run) return;
    let guard = 0;
    Sfx.stopAll();
    Sfx.silent = true;
    try {
      while (this.mode === 'run' && guard < 2000) { this.update(1 / 30); guard++; }
    } finally {
      Sfx.silent = false;
      Sfx.stopAll();
    }
  }
}


Scene.prototype.newLobby = function (returning) {
 this.mode = 'lobby'; this.run = null; this.env = this.dayEnv();
 this.particles = []; this.bubbles = []; this.timeScale = 1; this.placeLobby(returning || null);
};
export { Scene, Sfx, parseNames, makeLabels, guessGender, cryptoSample, DEFAULT_SCREAMS, NAME_MAX };

// Trống gọi tên: âm trầm rơi nhanh, không cần tệp âm thanh ngoài.
Sfx.drum = function () {
 if (!this.ctx || this.muted || this.silent) return;
 const t = this.ctx.currentTime;
 const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
 osc.frequency.setValueAtTime(130,t); osc.frequency.exponentialRampToValueAtTime(42,t+.18);
 gain.gain.setValueAtTime(.3,t); gain.gain.exponentialRampToValueAtTime(.001,t+.23);
 osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t); osc.stop(t+.24);
};
Sfx.stamp = function () { this.drum(); };
