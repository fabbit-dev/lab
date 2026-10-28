// Стол Fabbit 96×64 (3×2 клетки): верстак, белый Fabbit с осциллограммой, макетка с проводами, тыква.
// Вид как у столов мира: светлая столешница с волокнами, серая рама и ножки.
import { Sprite } from '../canvas.js';
import { fabbit, pumpkin } from '../parts.js';

export const meta = {
  name: 'fabbit-desk',
  title: 'Стол Fabbit',
  link: 'https://lab.fabbit.dev/',
};

export default function desk() {
  const s = new Sprite(96, 64);
  const top = 30; // верх столешницы
  const front = 52; // начало передней грани
  const bottom = 63;

  // столешница
  s.rect(1, top, 94, front - top, 'wood');
  for (const x of [7, 19, 28, 52, 61, 74, 86]) s.vline(x, top + 2, front - top - 3, 'woodGrain');
  for (const x of [13, 45, 68, 91]) s.vline(x, top + 5, front - top - 9, 'woodGrain');
  s.hline(1, top, 94, 'frameLight');
  // передняя грань и ножки
  s.rect(1, front, 94, 3, 'frame');
  s.hline(1, front, 94, 'frameLight');
  for (const x of [2, 89]) {
    s.rect(x, front + 3, 5, bottom - front - 3, 'frame');
    s.vline(x, front + 3, bottom - front - 3, 'frameLight');
  }
  s.box(0, top - 1, 96, bottom - top + 2, 'outline');
  s.rect(7, front + 4, 82, bottom - front - 3, null);
  s.hline(7, front + 3, 82, 'outline');
  for (const x of [7, 88]) s.vline(x, front + 4, bottom - front - 4, 'outline');
  s.set(0, top - 1, null);
  s.set(95, top - 1, null);

  // макетка слева: белая плата с рядами отверстий и чипом
  const bx = 6, by = 37;
  s.rect(bx, by, 22, 11, 'cream');
  s.hline(bx, by + 10, 22, 'paperShade');
  s.box(bx - 1, by - 1, 24, 13, 'outline');
  for (let x = bx + 1; x < bx + 21; x += 2) {
    s.set(x, by + 1, 'paperDark');
    s.set(x, by + 8, 'paperDark');
  }
  s.hline(bx + 1, by + 5, 20, 'paperShade');
  s.rect(bx + 7, by + 3, 7, 4, 'ink');
  s.hline(bx + 7, by + 3, 7, 'coal');
  for (let x = bx + 8; x < bx + 14; x += 2) s.set(x, by + 7, 'frame');

  // Fabbit в центре: стоит на столе, экран с осциллограммой. Крупнее спрайта мира в 1,5 раза,
  // иначе экран не читается.
  const f = fabbit('scope', 2);
  const fx = 48 - Math.floor(f.w / 2), fy = top + 18 - f.h;
  s.rect(fx + 3, fy + f.h - 1, f.w - 2, 3, 'woodDark');
  s.draw(f, fx, fy);

  // провода от макетки к правому боку Fabbit: красный и синий дугами
  const wire = (pts, c) => pts.forEach(([x, y]) => s.set(x, y, c));
  const ex = fx - 1;
  wire([[bx + 18, by + 1], [bx + 19, by], [bx + 20, by - 1], [29, by - 2], [30, by - 2], [31, by - 2], [32, by - 1],
    [33, by], [34, by + 1], [ex, by + 2]], 'red');
  wire([[bx + 20, by + 8], [29, by + 9], [30, by + 10], [31, by + 10], [32, by + 10], [33, by + 9], [34, by + 8],
    [ex, by + 7]], 'blue');

  // тыква справа
  const p = pumpkin(15, 10);
  s.rect(65, 47, 15, 2, 'woodDark');
  s.draw(p, 64, 37);

  // листок с заметкой у края
  s.rect(83, 33, 8, 10, 'paper');
  s.box(82, 32, 10, 12, 'outline');
  for (const y of [35, 37, 39, 41]) s.hline(84, y, y === 41 ? 3 : 6, 'paperDark');
  return s;
}
