// Курсор над кнопками и ссылками: пиксельная рука 16×16, в файле ×2 (32×32) и ×4.
// Указательный палец вверх, остальные поджаты. Hotspot: кончик пальца, в файле ×2 это 11,1.
import { Sprite } from '../canvas.js';

export const meta = { name: 'pointer', title: 'Курсор: рука', scales: [2, 4] };

export default function pointer() {
  const s = new Sprite(16, 16);
  const fill = (x, y, w, h) => s.rect(x, y, w, h, 'cream');
  fill(5, 1, 2, 9); // указательный
  fill(8, 5, 2, 5); // средний
  fill(11, 6, 2, 4); // безымянный
  fill(14, 7, 1, 3); // мизинец
  fill(3, 9, 12, 4); // ладонь
  fill(1, 8, 2, 3); // большой
  fill(4, 13, 10, 2); // запястье
  s.set(3, 11, 'cream');
  // тень справа у каждого пальца и снизу ладони
  for (const [x, y, h] of [[6, 2, 7], [9, 6, 3], [12, 7, 2]]) s.rect(x, y, 1, h, 'paperShade');
  s.rect(4, 14, 10, 1, 'paperShade');
  s.outline('outline');
  // промежутки между поджатыми пальцами
  for (const [x, y] of [[7, 9], [10, 9], [13, 9]]) s.set(x, y, 'outline');
  return s;
}
