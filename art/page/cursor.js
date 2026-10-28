// Курсор страницы 24×24: щуп осциллографа, остриё в левом верхнем углу (hotspot 1,1).
// Металлический наконечник, тыквенная ручка, провод из торца.
import { Sprite } from '../canvas.js';

// @2x для экранов высокой плотности: CSS image-set, размер курсора 24 CSS px.
export const meta = { name: 'cursor', title: 'Курсор: щуп', scales: [2] };

export default function cursor() {
  const s = new Sprite(24, 24);
  // точка на диагонали: t от острия, d поперёк (левее-ниже минус, правее-выше плюс)
  const at = (t, d, c) => s.set(1 + t + d, 1 + t - d, c);
  for (let t = 0; t <= 16; t++) {
    let half, color, light;
    if (t <= 4) { half = t < 2 ? 0 : 1; color = 'frame'; light = 'white'; }
    else if (t <= 6) { half = 2; color = 'pumpkinLight'; light = 'pumpkinGlow'; }
    else { half = t >= 15 ? 1 : 2; color = 'pumpkin'; light = 'pumpkinLight'; }
    for (let d = -half; d <= half; d++) {
      at(t, d, d === half ? light : d === -half && half > 0 ? 'pumpkinShade' : color);
      // заполнить щели диагонали: соседний пиксель по x
      s.set(2 + t + d, 1 + t - d, s.get(2 + t + d, 1 + t - d) ?? color);
    }
  }
  // металл без тени тыквенного цвета
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (s.get(x, y) === 'pumpkinShade') s.set(x, y, 'frameDark');
  s.outline('outline');
  // провод
  for (const [x, y] of [[19, 19], [20, 20], [20, 21], [21, 22], [22, 22]]) s.set(x, y, 'outline2');
  return s;
}
