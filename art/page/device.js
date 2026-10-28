// Fabbit крупно для страницы, 82×130: белый корпус спереди. Экран пустой: поверх него
// страница ставит canvas (src/screen.js) по прямоугольнику DEVICE.screen.
// Пропорции по рендеру fabbit.dev: корпус 90×150 мм, экран 3,5″.
import { Sprite } from '../canvas.js';
import { text } from '../font.js';
import { DEVICE } from '../../src/geom.js';

export const meta = { name: 'device', title: 'Fabbit спереди' };

function roundRect(s, x, y, w, h, r, c) {
  for (let j = y; j < y + h; j++)
    for (let i = x; i < x + w; i++) {
      const dx = Math.max(x + r - i - 0.5, i + 0.5 - (x + w - r), 0);
      const dy = Math.max(y + r - j - 0.5, j + 0.5 - (y + h - r), 0);
      if (dx * dx + dy * dy <= r * r) s.set(i, j, c);
    }
}

// Круглая кнопка: тёмный ободок, светлая шапка, тень снизу.
function button(s, cx, cy, r) {
  s.ellipse(cx, cy + 1, r, r, 'paperDark');
  s.ellipse(cx, cy, r, r, 'paperShade');
  s.ellipse(cx, cy, r - 1, r - 1, 'white');
}

export default function device() {
  const { w, h, screen } = DEVICE;
  const s = new Sprite(w, h);
  // корпус: толщина снизу, тень справа, свет слева сверху
  roundRect(s, 1, 3, w - 2, h - 4, 5, 'paperDark');
  roundRect(s, 1, 1, w - 2, h - 4, 5, 'paperShade');
  roundRect(s, 1, 1, w - 3, h - 5, 5, 'cream');
  roundRect(s, 2, 2, w - 5, h - 8, 4, 'cream');
  for (let j = 4; j < h - 10; j++) if (s.get(2, j) === 'cream') s.set(2, j, 'white');
  for (let i = 5; i < w - 6; i++) s.set(i, 2, 'white');

  // экран в чёрной рамке
  s.rect(screen.x - 3, screen.y - 3, screen.w + 6, screen.h + 6, 'ink');
  s.hline(screen.x - 3, screen.y + screen.h + 3, screen.w + 6, 'paperShade');
  s.rect(screen.x, screen.y, screen.w, screen.h, 'coal');
  // индикатор питания справа над экраном
  s.set(screen.x + screen.w + 1, screen.y - 5, 'leafLight');

  // крестовина: плюс с тенью снизу справа
  const dx = 19, dy = 84;
  s.rect(dx - 8, dy - 2, 18, 6, 'paperDark');
  s.rect(dx - 2, dy - 8, 6, 18, 'paperDark');
  s.rect(dx - 9, dy - 3, 18, 6, 'paperShade');
  s.rect(dx - 3, dy - 9, 6, 18, 'paperShade');
  s.rect(dx - 8, dy - 2, 16, 4, 'white');
  s.rect(dx - 2, dy - 8, 4, 16, 'white');
  s.rect(dx - 1, dy - 1, 2, 2, 'paperShade');

  // F1–F4 ромбом
  const bx = 61, by = 84;
  for (const [x, y] of [[bx, by - 7], [bx + 7, by], [bx, by + 7], [bx - 7, by]]) button(s, x, y, 3.5);

  // динамик: шестиугольник из точек
  for (const [n, y] of [[3, 100], [4, 102], [5, 104], [4, 106], [3, 108]])
    for (let i = 0; i < n; i++) s.set(41 - (n - 1) + 2 * i, y, 'paperDark');

  // три малые кнопки: Fn, меню, назад
  for (const x of [34, 42, 50]) button(s, x, 116, 2.5);
  // надпись на корпусе слева снизу
  text(s, 'FABBIT', 7, 120, 'paperShade');

  s.outline('outline');
  return s;
}
