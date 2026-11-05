import { Sfx } from './engine.js';

export const PLEAS = [
  'Tha cho em, Diêm Vương ơi!', 'Khoan đã, cho em ôn thêm chút!', 'Em biết lỗi rồi, tha cho em!',
  'Thả em ra, em hứa học bài!', 'Cho em về chỗ đi mà!', 'Đừng kéo nữa, em tự lên bảng!'
];

const clips = new Map();
let source;
let cue = 0;

export function preloadPleas() {
  const context = Sfx.ctx;
  if (!context) return;
  PLEAS.forEach((line, index) => {
    if (clips.has(line)) return;
    clips.set(line, fetch(`${import.meta.env.BASE_URL}audio/plea-${index + 1}.mp3`)
      .then(response => {
        if (!response.ok) throw new Error('Cannot load plea');
        return response.arrayBuffer();
      })
      .then(data => context.decodeAudioData(data))
      .catch(() => { clips.delete(line); }));
  });
}

export function stopPlea() {
  cue++;
  if (!source) return;
  source.stop();
  source.disconnect();
  source = undefined;
}

export async function speakPlea(line) {
  if (!Sfx.ok() || Sfx.muted) return;
  stopPlea();
  const currentCue = cue;
  const buffer = await clips.get(line);
  if (!buffer || currentCue !== cue || !Sfx.ok() || Sfx.muted) return;
  const node = Sfx.ctx.createBufferSource();
  node.buffer = buffer;
  node.connect(Sfx.master);
  node.onended = () => {
    node.disconnect();
    if (source === node) source = undefined;
  };
  source = node;
  node.start();
}

export function rattleChain(strength = 1) {
  if (!Sfx.ok() || Sfx.muted) return;
  const start = Sfx.ctx.currentTime;
  for (let i = 0; i < 4; i++) {
    const time = start + i * .038;
    const strike = Sfx._osc('triangle', 1270 + i * 263);
    const overtone = Sfx._osc('sine', 2017 + i * 421);
    const gain = Sfx._gain(0);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(.044 * strength / (1 + i * .45), time + .004);
    gain.gain.exponentialRampToValueAtTime(.001, time + .13);
    strike.connect(gain);
    overtone.connect(gain);
    gain.connect(Sfx.master);
    for (const node of [strike, overtone]) {
      node.start(time);
      node.stop(time + .14);
    }
  }
}
