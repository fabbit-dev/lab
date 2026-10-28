// Курсор страницы: пиксельная стрелка 11×16, в файле ×2 (22×32) и ×4 для HiDPI.
// Привычная форма системной стрелки, заливка кремовая, контур как у спрайтов мира. Hotspot 1,1.
import { Sprite } from '../canvas.js';

export const meta = { name: 'cursor', title: 'Курсор: стрелка', scales: [2, 4] };

const ROWS = [
  'X..........',
  'XX.........',
  'XoX........',
  'XooX.......',
  'XoooX......',
  'XooooX.....',
  'XoooooX....',
  'XooooooX...',
  'XoooooooX..',
  'XooooosssX.',
  'XoooXXXXXXX',
  'XooXsX.....',
  'XoX.XsX....',
  'XX..XosX...',
  'X....XosX..',
  '.....XXXX..',
];

export default function cursor() {
  const s = new Sprite(11, 16);
  s.grid(0, 0, ROWS, { X: 'outline', o: 'cream', s: 'paperShade' });
  return s;
}
