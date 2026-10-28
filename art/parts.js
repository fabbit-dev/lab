// Общие детали спрайтов: Fabbit, тыква, кролик.
import { Sprite } from './canvas.js';

// Fabbit вертикально, вид спереди. size 1: 15×24, size 2: 21×32. Контур включён.
// screen: 'scope' (синусоида), 'logic' (импульсы), 'bunny' (заставка).
export function fabbit(screen = 'scope', size = 1) {
  const W = size === 2 ? 21 : 15;
  const H = size === 2 ? 32 : 24;
  const s = new Sprite(W, H);
  s.rect(1, 1, W - 2, H - 2, 'cream');
  s.box(0, 0, W, H, 'outline');
  for (const [x, y, ix, iy] of [[0, 0, 1, 1], [W - 1, 0, W - 2, 1], [0, H - 1, 1, H - 2], [W - 1, H - 1, W - 2, H - 2]]) {
    s.set(x, y, null);
    s.set(ix, iy, 'outline');
  }
  // свет сверху слева, тень справа и толщина корпуса снизу
  s.hline(2, 1, W - 4, 'white');
  s.vline(1, 2, H - 6, 'white');
  s.vline(W - 2, 2, H - 5, 'paperShade');
  s.hline(2, H - 3, W - 4, 'paperShade');
  s.hline(2, H - 2, W - 4, 'paperDark');
  s.set(W - 2, H - 3, 'paperDark');

  // экран: рамка ink, рабочая область sw×sh
  const sx = 2, sy = 2, scW = W - 4, scH = Math.round(H * 0.42);
  s.rect(sx, sy, scW, scH, 'ink');
  const sw = scW - 2, sh = scH - 2;
  const scr = (x, y, c) => x >= 0 && y >= 0 && x < sw && y < sh && s.set(sx + 1 + x, sy + 1 + y, c);
  if (screen === 'scope') {
    const mid = Math.floor(sh / 2);
    for (let x = 0; x < sw; x += 2) scr(x, mid, 'screenDim');
    const amp = (sh - 1) / 2 - 0.4;
    let prev = null;
    for (let x = 0; x < sw; x++) {
      const y = Math.round(mid - amp * Math.sin((2 * Math.PI * x) / (sw - 1)));
      if (prev !== null) for (let k = Math.min(prev, y) + 1; k < Math.max(prev, y); k++) scr(x, k, 'screenGreen');
      scr(x, y, 'screenGreen');
      prev = y;
    }
  } else if (screen === 'logic') {
    const half = Math.floor(sh / 2);
    const lines = ['..###...###..###', '.#####.....##...'];
    lines.forEach((line, n) => {
      const top = n * half + (n ? 1 : 0), low = top + half - 2;
      for (let x = 0; x < sw; x++) {
        const v = line[x % line.length];
        const pv = x ? line[(x - 1) % line.length] : v;
        if (v !== pv) for (let k = top; k <= low; k++) scr(x, k, 'screenGreen');
        else scr(x, v === '#' ? top : low, 'screenGreen');
      }
    });
  } else if (screen === 'bunny') {
    const b = ['#...#', '#...#', '##.##', '#####', '#.#.#', '#####'];
    const bx = Math.floor((sw - 5) / 2), by = Math.floor((sh - 6) / 2);
    b.forEach((row, j) => [...row].forEach((c, i) => c === '#' && scr(bx + i, by + j, 'white')));
  }

  // крестовина и четыре кнопки F1–F4
  const cy = sy + scH + Math.round((H - sy - scH - 6) / 2);
  const dx = size === 2 ? 3 : 2;
  s.grid(dx, cy, ['.#.', '###', '.#.'], { '#': 'frameLight' });
  s.set(dx + 2, cy + 1, 'frame');
  s.set(dx + 1, cy + 2, 'frame');
  const bx = W - dx - 4;
  for (const [x, y] of [[bx + 1, cy - 1], [bx - 1, cy + 1], [bx + 3, cy + 1], [bx + 1, cy + 3]]) {
    s.set(x, y, 'frameLight');
    s.set(x, y + 1, 'frame');
  }
  // три маленькие кнопки внизу
  const mid = Math.floor(W / 2);
  for (const x of [mid - 2, mid, mid + 2]) s.set(x, H - 5, 'frame');
  return s;
}

// Тыква с черенком. w×h без контура, контур добавляется вокруг (+2 к каждой стороне).
export function pumpkin(w = 11, h = 8) {
  const s = new Sprite(w + 2, h + 4);
  const cx = (w + 2) / 2;
  const cy = 3 + h / 2;
  s.ellipse(cx, cy, w / 2, h / 2, 'pumpkin');
  // рёбра
  for (const dx of [-w / 4, w / 4]) {
    const x = Math.round(cx + dx - 0.5);
    for (let y = 0; y < s.h; y++) if (s.get(x, y) === 'pumpkin' && s.get(x, y - 1) !== null) s.set(x, y, 'pumpkinDark');
  }
  // нижняя тень, верхний блик
  for (let x = 0; x < s.w; x++)
    for (let y = s.h - 1; y >= 0; y--)
      if (s.get(x, y) !== null) { s.set(x, y, 'pumpkinShade'); break; }
  s.set(Math.round(cx - w / 4 - 1.5), Math.round(cy - h / 4), 'pumpkinLight');
  s.set(Math.round(cx - w / 4 - 1.5), Math.round(cy - h / 4) + 1, 'pumpkinLight');
  // черенок
  s.set(Math.floor(cx), 1, 'leaf');
  s.set(Math.floor(cx), 2, 'leaf');
  s.set(Math.floor(cx) + 1, 1, 'leafLight');
  s.outline('outline');
  return s;
}
