import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const css = readFileSync(path.resolve(__dirname, 'style.css'), 'utf8');
const html = readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const body = css.replace(/:root \{[^}]*\}/, '');

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lum = (h) => {
  const [r, g, b] = hex(h).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const token = (name) => css.match(new RegExp(`--${name}: (#[0-9a-f]{6})`))[1];

describe('дизайн-система', () => {
  it('отступы только из шкалы: в правилах нет голых px, кроме 0 и пиксельных размеров', () => {
    const allowed = new Set(['0', '1px', '2px', '-2px', '999px', '48px', '24px', '80px', '82px', '32px', '72px', '320px', '640px', '960px', '1040px', '19px', '42px', '360px', '1200px', '120px']);
    const stray = [...body.matchAll(/(-?\d+(?:\.\d+)?px)/g)].map((m) => m[1]).filter((v) => !allowed.has(v));
    expect(stray).toEqual([]);
  });

  it('gap, padding и margin только токенами', () => {
    const decls = body.replace(/\/\*[\s\S]*?\*\//g, '').split(/[;{}]/).map((d) => d.trim()).filter(Boolean);
    for (const d of decls) {
      const m = d.match(/^((?:gap|row-gap|column-gap|padding|margin)(?:-[a-z]+)*):\s*(.+)$/);
      if (!m) continue;
      const [, prop, v] = m;
      if (prop === 'margin' && v === 'auto') continue;
      for (const part of v.replace(/calc\([^)]*\)/g, 'var(--calc)').split(/\s+/)) expect(part, `${prop}: ${v}`).toMatch(/^(0|auto|var\(--[\w-]+\))$/);
    }
  });

  it('шкала отступов кратна 4 px', () => {
    for (const [, v] of css.matchAll(/--s\d: (\d+)px/g)) expect(Number(v) % 4).toBe(0);
  });

  it('один пиксельный шрифт, кегль и межстрочный кратны 8 px', () => {
    expect(body).not.toMatch(/font-family/);
    expect([...css.matchAll(/--font[\w-]*:/g)]).toHaveLength(1);
    for (const [, v] of css.matchAll(/--(?:t|lh)-\w+: (\d+)px/g)) expect(Number(v) % 8).toBe(0);
    for (const [, v] of body.matchAll(/font-size: ([^;]+);/g)) expect(v).toMatch(/^var\(--t-/);
  });

  it('цвет в правилах только через токены', () => {
    expect(body.match(/#[0-9a-f]{3,6}\b/gi) ?? []).toEqual([]);
  });

  it('контраст текста не ниже 4,5:1', () => {
    const pairs = [
      ['text', 'cream'], ['text', 'paper'], ['text', 'pumpkin'], ['text-2', 'cream'],
      ['rust', 'cream'], ['cream', 'rust'], ['leaf', 'cream'], ['cream', 'leaf'], ['cream', 'leaf-hover'],
    ];
    for (const [fg, bg] of pairs) {
      const fgHex = fg === 'text' ? token('outline') : token(fg);
      expect(contrast(fgHex, token(bg)), `${fg} на ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('кнопки не ниже 40 px, основные 44 px', () => {
    expect(css).toContain('--control: 44px');
    expect(css).toContain('--control-s: 40px');
    expect(css).toMatch(/\.btn \{[^}]*min-height: var\(--control\)/);
  });

  it('все рамки через один класс .frame', () => {
    expect(css.match(/box-shadow:\s*\n\s*0 calc/g)).toHaveLength(1);
    for (const cls of ['panel', 'btn', 'lead', 'badge']) {
      for (const m of html.matchAll(new RegExp(`class="([^"]*\\b${cls}\\b[^"]*)"`, 'g'))) expect(m[1]).toMatch(/\bframe\b/);
    }
  });

  it('курсор: свой щуп с запасным системным', () => {
    expect(css).toMatch(/cursor: url\(\/img\/cursor@2x\.png\) 1 1, auto/);
    expect(css).toMatch(/cursor: url\(\/img\/pointer@2x\.png\) 11 1, pointer/);
    expect(body.match(/cursor: (pointer|inherit);/g) ?? []).toEqual([]);
  });

  it('без transition: all и с учётом reduced motion', () => {
    expect(css).not.toMatch(/transition:\s*all/);
    expect(css).toMatch(/prefers-reduced-motion: reduce/);
  });
});
