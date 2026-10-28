// Постер 64×64 (2×2 клетки) на стену: кролик с лого Fabbit, надпись FABBIT и «МАСТЕРСКАЯ».
// Рамка и бумага как у вывески «ТЫКВОРКИНГ» в мире.
import { Sprite } from '../canvas.js';
import { text, textWidth } from '../font.js';
import { pumpkin } from '../parts.js';

export const meta = {
  name: 'fabbit-poster',
  title: 'Постер Fabbit',
  link: 'https://fabbit.dev/',
};

// Кролик из лого fabbit.dev (brand/fabbit-logo-ink.svg), 16×19, пропорции как на лого.
// '#': тело, '.': фон или дырки (глаза, рот).
const BUNNY = [
  '.###.......###..',
  '.###.......###..',
  '.####....#####..',
  '.####....#####..',
  '.####....#####..',
  '.####....#####..',
  '.####..#####....',
  '.####..#####....',
  '..##########....',
  '..############..',
  '..############..',
  '################',
  '###..######..###',
  '###..######..###',
  '################',
  '#######..#######',
  '#######..#######',
  '..############..',
  '..############..',
];

export default function poster() {
  const s = new Sprite(64, 64);
  const x0 = 2, y0 = 4, w = 60, h = 56;
  s.rect(x0, y0, w, h, 'paper');
  s.hline(x0 + 1, y0 + h - 2, w - 2, 'paperShade');
  s.box(x0, y0, w, h, 'outline2');
  s.box(x0 - 1, y0 - 1, w + 2, h + 2, 'outline');
  // гвоздик сверху
  s.rect(31, 1, 2, 2, 'frameDark');

  // кролик белый с тенью справа и контуром; дырки лого: глаза тёмные, рот тыквенный
  const b = new Sprite(18, 21);
  BUNNY.forEach((row, j) => [...row].forEach((c, i) => c === '#' && b.set(1 + i, 1 + j, 'white')));
  for (const [x, y] of [[4, 13], [5, 13], [4, 14], [5, 14], [12, 13], [13, 13], [12, 14], [13, 14]]) b.set(x, y, 'outline');
  for (const [x, y] of [[8, 16], [9, 16], [8, 17], [9, 17]]) b.set(x, y, 'pumpkinShade');
  for (let j = 0; j < b.h; j++)
    for (let i = b.w - 1; i >= 0; i--) if (b.get(i, j) === 'white') { b.set(i, j, 'paperShade'); break; }
  b.outline('outline');
  s.draw(b, 22, 12);
  const p = pumpkin(9, 6);
  s.draw(p, 40, 25);
  // надписи тёмно-зелёным, как у вывесок мира
  const t1 = 'FABBIT';
  text(s, t1, Math.round(32 - textWidth(t1, 2) / 2), 41, 'leaf', 2);
  const t2 = 'МАСТЕРСКАЯ';
  text(s, t2, Math.round(32 - textWidth(t2) / 2), 53, 'pumpkinShade');
  return s;
}
