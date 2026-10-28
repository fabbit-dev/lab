// Канцелярская скрепка 19×42: держит фото стенда на панели. Проволока 2 px, сталь с бликом слева.
// Три петли, как у обычной скрепки: внешняя, средняя и внутренняя.
import { Sprite } from '../canvas.js';

export const meta = { name: 'clip', title: 'Скрепка' };

export default function clip() {
  const s = new Sprite(19, 42);
  const v = (x, y0, y1) => {
    s.rect(x, y0, 1, y1 - y0 + 1, 'frameLight');
    s.rect(x + 1, y0, 1, y1 - y0 + 1, 'frame');
  };
  const h = (x0, x1, y) => {
    s.rect(x0, y, x1 - x0 + 1, 1, 'frameLight');
    s.rect(x0, y + 1, x1 - x0 + 1, 1, 'frame');
  };
  // скругление на 45°: ступенька из двух пикселей
  const corner = (pts) => pts.forEach(([x, y, c]) => s.set(x, y, c ?? 'frame'));

  // внешняя петля: левая стойка вверх, дуга, правая стойка вниз
  v(1, 4, 31);
  h(4, 14, 1);
  corner([[2, 3, 'frameLight'], [3, 2, 'frameLight'], [2, 2], [3, 3], [15, 2], [16, 3], [16, 2, 'frameLight'], [17, 3]]);
  v(16, 4, 37);
  // нижняя дуга к средней стойке
  h(8, 14, 39);
  corner([[15, 39], [16, 38], [17, 38], [15, 40], [7, 38, 'frameLight'], [6, 38], [7, 39]]);
  v(6, 9, 37);
  // верхняя дуга к внутренней стойке
  h(8, 10, 6);
  corner([[7, 7, 'frameLight'], [6, 8, 'frameLight'], [7, 8], [11, 7], [12, 8]]);
  v(11, 9, 28);
  s.outline('outline');
  return s;
}
