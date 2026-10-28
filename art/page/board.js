// Плата со снятой задней крышкой, 82×130. Раскладка по docs/img/fabbit-board.png монорепы
// (сторона крышки, вид сзади). Микроконтроллер на лицевой стороне у USB-C: здесь пунктир.
import { Sprite } from '../canvas.js';
import { BOARD, NODES } from '../../src/geom.js';

export const meta = { name: 'board', title: 'Плата Fabbit без крышки' };

export default function board() {
  const s = new Sprite(BOARD.w, BOARD.h);
  const W = BOARD.w, H = BOARD.h;
  // плата
  s.rect(1, 1, W - 2, H - 2, 'leaf');
  s.hline(1, 1, W - 2, 'leafLight');
  s.vline(1, 1, H - 2, 'leafLight');
  // дорожки
  for (const [x, y, len, vert] of [[30, 48, 30, 0], [12, 82, 8, 1], [76, 50, 32, 1], [18, 47, 20, 0], [4, 26, 22, 1]])
    vert ? s.vline(x, y, len, 'leafLight') : s.hline(x, y, len, 'leafLight');
  // крепёжные отверстия
  for (const [x, y] of [[4, 11], [77, 11], [4, 47], [77, 47], [4, 79], [77, 79], [4, 125], [77, 125]]) {
    s.rect(x - 1, y - 1, 3, 3, 'paperShade');
    s.set(x, y, 'outline2');
  }

  // разъёмы сверху: MIPI-20, порт B 2×10, порт A 2×12
  for (const [x, w] of [[6, 9], [21, 24], [48, 28]]) {
    s.rect(x, 1, w, 6, 'ink');
    for (let i = x + 1; i < x + w - 1; i += 2) {
      s.set(i, 2, 'pumpkinLight');
      s.set(i, 4, 'pumpkinLight');
    }
  }
  // радиомодуль ESP32-C5 слева
  s.rect(1, 13, 13, 11, 'frame');
  s.rect(2, 14, 11, 9, 'frameLight');
  s.rect(4, 16, 7, 5, 'frame');

  // аналоговый модуль: отдельная плата-мезонин, разъём 2×40 снизу
  const a = NODES.analog;
  s.rect(a.x, a.y, a.w, a.h, 'sage');
  s.hline(a.x, a.y, a.w, 'paper');
  s.box(a.x, a.y, a.w, a.h, 'outline2');
  s.rect(a.x + 6, a.y + 6, 10, 8, 'ink'); // АЦП
  s.rect(a.x + 22, a.y + 7, 7, 6, 'ink'); // ЦАП
  s.rect(a.x + 35, a.y + 7, 6, 5, 'ink'); // ADS1220
  for (const [x, y] of [[a.x + 6, a.y + 6], [a.x + 22, a.y + 7], [a.x + 35, a.y + 7]]) s.set(x + 1, y + 1, 'frame');
  for (const x of [a.x + 9, a.x + 25, a.x + 38]) for (const y of [a.y + 17, a.y + 19]) s.hline(x - 2, y, 4, 'sageDark');
  s.rect(a.x + 12, a.y + a.h - 6, 28, 4, 'ink');
  // SMA-разъёмы над модулем
  for (const x of [a.x + 8, a.x + 24, a.x + 40]) {
    s.rect(x, a.y - 3, 4, 3, 'pumpkinLight');
    s.set(x + 1, a.y - 2, 'pumpkinShade');
  }

  // модуль Colorlight i9+ с ПЛИС Artix-7 в разъёме SO-DIMM
  const f = NODES.fpga;
  s.rect(f.x - 2, f.y + 2, f.w + 4, f.h - 4, 'frameLight');
  s.rect(f.x, f.y, f.w, f.h, 'ink');
  s.hline(f.x, f.y, f.w, 'coal');
  s.rect(f.x + 22, f.y + 6, 18, 17, 'coal');
  s.box(f.x + 22, f.y + 6, 18, 17, 'frame');
  s.rect(f.x + 25, f.y + 9, 3, 2, 'frame');
  for (const x of [f.x + 5, f.x + 46]) s.rect(x, f.y + 8, 10, 6, 'coal');
  for (const x of [f.x + 5, f.x + 46]) s.rect(x, f.y + 17, 8, 4, 'coal');
  for (let x = f.x + 2; x < f.x + f.w - 2; x += 2) s.set(x, f.y + f.h - 2, 'pumpkinLight');

  // аккумулятор Li-pol: серебристый пакет с полосами
  const b = NODES.battery;
  s.rect(b.x, b.y, b.w, b.h, 'frameLight');
  s.hline(b.x, b.y, b.w, 'white');
  s.box(b.x, b.y, b.w, b.h, 'frameDark');
  for (let k = 0; k < b.w + b.h; k += 6)
    for (let t = 0; t < b.h; t++) {
      const x = b.x + k - t;
      if (x > b.x && x < b.x + b.w - 1 && t > 0 && t < b.h - 1) s.set(x, b.y + t, 'frame');
    }
  s.rect(b.x + 12, b.y + 15, 31, 8, 'pumpkin');
  s.box(b.x + 12, b.y + 15, 31, 8, 'pumpkinShade');
  s.rect(b.x + 16, b.y + 18, 18, 2, 'cream');
  s.rect(b.x + 36, b.y + 17, 3, 4, 'cream');

  // микроконтроллер на обратной стороне: пунктир
  const m = NODES.mcu;
  for (let i = 0; i < m.w; i += 2) {
    s.set(m.x + i, m.y, 'pumpkinGlow');
    s.set(m.x + i, m.y + m.h - 1, 'pumpkinGlow');
  }
  for (let j = 0; j < m.h; j += 2) {
    s.set(m.x, m.y + j, 'pumpkinGlow');
    s.set(m.x + m.w - 1, m.y + j, 'pumpkinGlow');
  }

  s.outline('outline');
  return s;
}
