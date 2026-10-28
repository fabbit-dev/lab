import { describe, it, expect } from 'vitest';
import { loadSprites } from './build.js';
import { checkWorldPng } from './canvas.js';

const sprites = await loadSprites();

describe('спрайты для мира', () => {
  it('есть стол, постер и кролик', () => {
    expect(sprites.map((s) => s.name).sort()).toEqual(['bunny-pumpkin', 'fabbit-desk', 'fabbit-poster']);
  });

  it.each(sprites)('$name: кратен 32, палитра, без полупрозрачности', ({ sprite }) => {
    expect(checkWorldPng(sprite.png(1)).errors).toEqual([]);
  });

  it.each(sprites)('$name: ссылка https и непустой спрайт', ({ link, sprite }) => {
    expect(link).toMatch(/^https:\/\//);
    expect(sprite.px.flat().some((c) => c !== null)).toBe(true);
  });

  it('размеры как договорились с организаторами', () => {
    const size = Object.fromEntries(sprites.map((s) => [s.name, `${s.sprite.w}×${s.sprite.h}`]));
    expect(size).toEqual({ 'fabbit-desk': '96×64', 'fabbit-poster': '64×64', 'bunny-pumpkin': '32×32' });
  });
});
