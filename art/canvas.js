import { PNG } from 'pngjs';
import { PALETTE, OPAQUE } from './palette.js';

const hex = (c) => {
  const v = parseInt(c.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};

// Холст в 1x. Пиксель: имя цвета из PALETTE или null (прозрачный).
export class Sprite {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.px = Array.from({ length: h }, () => Array(w).fill(null));
  }

  set(x, y, c) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    if (c !== null && !(c in PALETTE)) throw new Error(`нет цвета ${c} в палитре`);
    this.px[y][x] = c;
  }

  get(x, y) {
    return x < 0 || y < 0 || x >= this.w || y >= this.h ? null : this.px[y][x];
  }

  rect(x, y, w, h, c) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c);
  }

  hline(x, y, w, c) { this.rect(x, y, w, 1, c); }
  vline(x, y, h, c) { this.rect(x, y, 1, h, c); }

  inEllipse(x, y, cx, cy, rx, ry) {
    const dx = (x + 0.5 - cx) / rx;
    const dy = (y + 0.5 - cy) / ry;
    return dx * dx + dy * dy <= 1;
  }

  ellipse(cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
      for (let x = Math.floor(cx - rx); x <= cx + rx; x++)
        if (this.inEllipse(x, y, cx, cy, rx, ry)) this.set(x, y, c);
  }

  // Рамка в 1 px по краю прямоугольника.
  box(x, y, w, h, c) {
    this.hline(x, y, w, c);
    this.hline(x, y + h - 1, w, c);
    this.vline(x, y, h, c);
    this.vline(x + w - 1, y, h, c);
  }

  // Сетка символов: каждая строка: ряд пикселей, key: символ → цвет. Пробел и '.' прозрачны.
  grid(x, y, rows, key) {
    rows.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        if (ch === ' ' || ch === '.') return;
        if (!(ch in key)) throw new Error(`символ «${ch}» без цвета`);
        this.set(x + i, y + j, key[ch]);
      });
    });
  }

  // Контур снаружи силуэта: прозрачные соседи непрозрачных пикселей (4-связность).
  outline(c = 'outline') {
    const add = [];
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        if (this.px[y][x] !== null) continue;
        if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => this.get(x + dx, y + dy) !== null))
          add.push([x, y]);
      }
    for (const [x, y] of add) this.set(x, y, c);
  }

  // Вставить другой спрайт (прозрачные пиксели не перекрывают).
  draw(s, x, y) {
    for (let j = 0; j < s.h; j++)
      for (let i = 0; i < s.w; i++) if (s.px[j][i] !== null) this.set(x + i, y + j, s.px[j][i]);
  }

  png(scale = 1) {
    const png = new PNG({ width: this.w * scale, height: this.h * scale });
    for (let y = 0; y < png.height; y++)
      for (let x = 0; x < png.width; x++) {
        const c = this.px[Math.floor(y / scale)][Math.floor(x / scale)];
        const o = (y * png.width + x) * 4;
        if (c === null) png.data.fill(0, o, o + 4);
        else {
          png.data.set(hex(PALETTE[c]), o);
          png.data[o + 3] = 255;
        }
      }
    return PNG.sync.write(png);
  }
}

// Проверка формата для мира: размеры кратны 32, только цвета палитры, альфа 0 или 255.
export function checkWorldPng(buf) {
  const png = PNG.sync.read(buf);
  const errors = [];
  if (png.width % 32 || png.height % 32) errors.push(`размер ${png.width}×${png.height} не кратен 32`);
  const colors = new Set([...OPAQUE].map((c) => c.toLowerCase()));
  for (let o = 0; o < png.data.length; o += 4) {
    const a = png.data[o + 3];
    if (a !== 0 && a !== 255) { errors.push('полупрозрачный пиксель'); break; }
    if (a === 255) {
      const c = '#' + [...png.data.subarray(o, o + 3)].map((v) => v.toString(16).padStart(2, '0')).join('');
      if (!colors.has(c)) { errors.push(`цвет ${c} не из палитры`); break; }
    }
  }
  return { width: png.width, height: png.height, errors };
}
