// Кролик в тыкве 32×32 (1 клетка): маскот выглядывает из тыквы, лапки на краю.
import { Sprite } from '../canvas.js';

export const meta = {
  name: 'bunny-pumpkin',
  title: 'Кролик в тыкве',
  link: 'https://lab.fabbit.dev/',
};

// o контур, W белый, s тень меха, n нос. Контур уже в сетке.
const BUNNY = [
  '...oo......oo...',
  '..oWWo....oWWo..',
  '..oWso....osWo..',
  '..oWso....osWo..',
  '..oWso....osWo..',
  '..oWso....osWo..',
  '..oWWo....oWWo..',
  '.ooWWWooooWWWoo.',
  'oWWWWWWWWWWWWWWo',
  'WWWWWWWWWWWWWWWW',
  'WWoWWWWWWWWWWoWW',
  'WWoWWWWWWWWWWoWW',
  'WsWWWWWnnWWWWWsW',
  'WWWWWWWWWWWWWWWW',
];
const KEY = { o: 'outline', W: 'white', s: 'paperShade', n: 'pumpkinShade' };
const PAW = ['oWWo', 'oWso', '.oo.'];

export default function bunnyPumpkin() {
  const s = new Sprite(32, 32);

  // тыква: овал, четыре борозды, тень снизу, блик слева
  const cx = 16, cy = 23, rx = 15, ry = 8.5;
  s.ellipse(cx, cy, rx, ry, 'pumpkin');
  for (let y = 0; y < 32; y++)
    for (let x = 0; x < 32; x++) {
      if (s.get(x, y) === null) continue;
      if ([6, 11, 20, 25].includes(x) && y > 16) s.set(x, y, 'pumpkinDark');
      if (!s.inEllipse(x, y + 2, cx, cy, rx, ry)) s.set(x, y, 'pumpkinShade');
      else if (x >= 27 && y > 18) s.set(x, y, 'pumpkinDark');
    }
  s.vline(3, 20, 4, 'pumpkinLight');
  s.vline(4, 18, 2, 'pumpkinLight');
  s.vline(8, 18, 2, 'pumpkinGlow');
  s.outline('outline');

  // срез сверху: тёмная полость с ярким краем
  s.ellipse(16, 15.5, 10, 2.5, 'outline2');
  for (let x = 6; x <= 26; x++)
    for (let y = 15; y < 20; y++)
      if (!s.inEllipse(x, y, 16, 15.5, 10, 2.5) && s.inEllipse(x, y - 1, 16, 15.5, 10, 2.5)) {
        s.set(x, y, 'pumpkinGlow');
        break;
      }

  // кролик в полости: голова ниже края скрыта
  const bx = 8, by = 1;
  BUNNY.forEach((row, j) => {
    if (by + j > 15) return;
    [...row].forEach((ch, i) => ch !== '.' && s.set(bx + i, by + j, KEY[ch]));
  });
  // боковой контур головы до края среза
  for (let y = by + 8; y <= 15; y++) {
    s.set(bx - 1, y, 'outline');
    s.set(bx + 16, y, 'outline');
  }

  // лапки на краю
  s.grid(10, 15, PAW, { o: 'outline', W: 'white', s: 'paperShade' });
  s.grid(18, 15, PAW.map((r) => [...r].reverse().join('')), { o: 'outline', W: 'white', s: 'paperShade' });

  // черенок у края
  s.grid(25, 11, ['..oo', '.ogo', 'oglo', '.oo.'], { o: 'outline', g: 'leaf', l: 'leafLight' });
  return s;
}
