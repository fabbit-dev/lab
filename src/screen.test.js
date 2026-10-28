import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { wave, uartBits, uartTrack, createRunner, jump, stepRunner, WAVES, LOGO_BUNNY, collides } from './screen.js';
import { drawText, textWidth, glyph } from './pixfont.js';

describe('осциллограф', () => {
  it('формы в пределах −1…1', () => {
    for (const k of WAVES) for (let t = 0; t < 2; t += 0.05) expect(Math.abs(wave(k, t))).toBeLessThanOrEqual(1);
  });
  it('меандр: половина периода вверху', () => {
    expect(wave('SQR', 0.1)).toBe(1);
    expect(wave('SQR', 0.6)).toBe(-1);
  });
});

describe('UART 8N1', () => {
  it('старт 0, младший бит первым, стоп 1', () => {
    // 'F' = 0x46 = 0100 0110
    expect(uartBits('F')).toEqual([0, 0, 1, 1, 0, 0, 0, 1, 0, 1]);
  });
  it('байты идут подряд с простоем', () => {
    const { level, frames } = uartTrack('AB');
    expect(frames.map((f) => f.ch)).toEqual(['A', 'B']);
    expect(frames[1].x).toBeGreaterThan(frames[0].x + 20);
    expect(level[frames[0].x]).toBe(0);
  });
});

describe('ретро: кролик и тыквы', () => {
  const never = () => 0.5;
  it('прыжок только с земли', () => {
    const r = createRunner();
    jump(r);
    stepRunner(r, 0.05, never);
    expect(r.y).toBeLessThan(0);
    const vy = r.vy;
    jump(r);
    expect(r.vy).toBe(vy);
  });
  it('без прыжка тыква сбивает, потом игра заново', () => {
    const r = createRunner();
    let hit = false;
    for (let i = 0; i < 300 && !hit; i++) hit = stepRunner(r, 1 / 60, never).hit > 0;
    expect(hit).toBe(true);
    for (let i = 0; i < 120; i++) stepRunner(r, 1 / 60, never);
    expect(r.hit).toBeLessThanOrEqual(0);
    expect(r.score).toBe(0);
  });
  it('окно для прыжка: не меньше 6 px пути тыквы дают очко', () => {
    const wins = [];
    for (let at = 0; at <= 50; at++) {
      const r = createRunner();
      for (let i = 0; i < 600 && r.score === 0 && r.hit <= 0; i++) {
        const o = r.obstacles[0];
        if (o && o.x <= at) jump(r);
        stepRunner(r, 1 / 60, never);
      }
      if (r.score === 1) wins.push(at);
    }
    expect(wins.length).toBeGreaterThanOrEqual(6);
  });
});

describe('кролик с лого', () => {
  const logo = readFileSync(path.resolve(__dirname, '../public/img/logo.svg'), 'utf8');
  it('заставка: пиксель в пиксель как кролик в logo.svg', () => {
    const px = new Set([...logo.matchAll(/M(\d+) (\d+)h(\d+)/g)].flatMap(([, x, y, w]) =>
      Array.from({ length: Number(w) }, (_, i) => `${Number(x) + i},${y}`)));
    LOGO_BUNNY.forEach((row, y) => [...row].forEach((c, x) => expect(px.has(`${x},${y}`), `${x},${y}`).toBe(c === '#')));
  });
  it('в игре тот же кролик, столкновение по пикселям', () => {
    const r = createRunner();
    expect(collides(r, { x: 30 })).toBe(false);
    expect(collides(r, { x: 10 })).toBe(true);
    r.y = -20;
    expect(collides(r, { x: 10 })).toBe(false);
  });
});

describe('шрифт экрана', () => {
  it('ширина: 3 px на символ и 1 px зазор', () => {
    expect(textWidth('FABBIT')).toBe(23);
  });
  it('все символы экрана есть', () => {
    for (const ch of 'FABBIT CH1 1V 1MS SIN SQR SAW LA UART 3CH D0 D1 D2 HOP OUCH 0123456789') expect(() => glyph(ch)).not.toThrow();
  });
  it('рисует пиксели в своей рамке', () => {
    const pts = [];
    drawText((x, y) => pts.push([x, y]), 'H', 10, 20);
    expect(pts.every(([x, y]) => x >= 10 && x < 13 && y >= 20 && y < 25)).toBe(true);
  });
});
