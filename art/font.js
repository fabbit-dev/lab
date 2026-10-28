// Пиксельный шрифт высотой 5 px для надписей на спрайтах. '#': пиксель.
const G = {
  F: ['###', '#..', '##.', '#..', '#..'],
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  L: ['#..', '#..', '#..', '#..', '###'],
  М: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  А: ['.#.', '#.#', '###', '#.#', '#.#'],
  С: ['.##', '#..', '#..', '#..', '.##'],
  Т: ['###', '.#.', '.#.', '.#.', '.#.'],
  Е: ['###', '#..', '##.', '#..', '###'],
  Р: ['##.', '#.#', '##.', '#..', '#..'],
  К: ['#.#', '#.#', '##.', '#.#', '#.#'],
  Я: ['.##', '#.#', '.##', '#.#', '#.#'],
  ' ': ['.', '.', '.', '.', '.'],
};

export function textWidth(s, scale = 1) {
  const glyphs = [...s].map((ch) => glyph(ch));
  return (glyphs.reduce((n, g) => n + g[0].length, 0) + glyphs.length - 1) * scale;
}

function glyph(ch) {
  const g = G[ch];
  if (!g) throw new Error(`нет глифа «${ch}»`);
  return g;
}

export function text(sprite, s, x, y, color, scale = 1) {
  let cx = x;
  for (const ch of s) {
    const g = glyph(ch);
    g.forEach((row, j) =>
      [...row].forEach((p, i) => {
        if (p === '#') sprite.rect(cx + i * scale, y + j * scale, scale, scale, color);
      }),
    );
    cx += (g[0].length + 1) * scale;
  }
}
