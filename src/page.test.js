// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { MODES, NODE_TEXT } from './copy.js';
import { NODES } from './geom.js';

const html = readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

beforeAll(() => {
  document.documentElement.innerHTML = html.replace(/<script[^>]*><\/script>/g, '');
  // jsdom без canvas: заглушка контекста
  HTMLCanvasElement.prototype.getContext = () => ({
    createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
    putImageData() {},
  });
  globalThis.requestAnimationFrame = () => 0;
});

describe('страница', () => {
  it('заголовки разделов', () => {
    const titles = [...document.querySelectorAll('h2')].map((h) => h.textContent);
    expect(titles).toEqual(['Прибор', 'Загляни внутрь', 'Что сейчас', 'Команда']);
  });

  it('у кнопок профилей есть тексты', () => {
    const tabs = [...document.querySelectorAll('[data-mode]')];
    expect(tabs.map((t) => t.dataset.mode)).toEqual(Object.keys(MODES));
    for (const t of tabs) expect(t.textContent).toBe(MODES[t.dataset.mode].tab);
  });

  it('узлы платы и тексты совпадают', () => {
    expect(Object.keys(NODES).sort()).toEqual(Object.keys(NODE_TEXT).sort());
    const chips = [...document.querySelectorAll('[data-node-chip]')].map((c) => c.dataset.nodeChip);
    expect(chips.sort()).toEqual(Object.keys(NODES).sort());
  });

  it('внешние ссылки открываются в новой вкладке', () => {
    for (const a of document.querySelectorAll('a[href^="http"]')) {
      expect(a.target).toBe('_blank');
      expect(a.rel).toContain('noopener');
    }
  });

  it('демо подписано как иллюстрация', () => {
    expect(document.querySelector('#device .note').textContent).toMatch(/Иллюстрация/);
  });

  it('профиль и узел переключаются', async () => {
    const { initDevice, initBoard } = await import('./main.js');
    const d = initDevice();
    const b = initBoard();
    document.querySelector('[data-mode="logic"]').click();
    expect(document.querySelector('[data-mode-desc]').textContent).toBe(MODES.logic.desc);
    expect(document.querySelector('[data-mode="logic"]').getAttribute('aria-pressed')).toBe('true');
    expect(d.screen.mode).toBe('logic');
    document.querySelector('[data-node-chip="battery"]').click();
    expect(document.querySelector('[data-node-title]').textContent).toBe('Аккумулятор');
    expect(document.querySelector('.node[data-node="battery"]').getAttribute('aria-pressed')).toBe('true');
    expect(b).not.toBeNull();
  });

  it('высота текста не зависит от выбора: копии всех вариантов без data-атрибутов', () => {
    const ghosts = document.querySelectorAll('[data-mode-stack] .stack__ghost');
    expect(ghosts.length).toBe(Object.keys(MODES).length);
    expect(document.querySelectorAll('[data-node-stack] .stack__ghost').length).toBe(Object.keys(NODES).length);
    expect(document.querySelectorAll('[data-node-title]').length).toBe(1);
    for (const g of document.querySelectorAll('.stack__ghost')) expect(g.getAttribute('aria-hidden')).toBe('true');
  });

  it('фото стенда: превью сразу, полный кадр по нажатию', async () => {
    const { initZoom } = await import('./main.js');
    const dialog = document.querySelector('[data-zoom-dialog]');
    dialog.showModal = function () { this.open = true; };
    initZoom();
    const big = dialog.querySelector('img');
    expect(big.hasAttribute('src')).toBe(false);
    document.querySelector('[data-zoom]').click();
    expect(big.getAttribute('src')).toBe('/img/stand.webp');
    expect(dialog.open).toBe(true);
  });

  it('у картинок размеры, у декоративных пустой alt', () => {
    for (const img of document.querySelectorAll('img')) {
      expect(img.getAttribute('width')).toMatch(/^\d+$/);
      expect(img.getAttribute('height')).toMatch(/^\d+$/);
      expect(img.hasAttribute('alt')).toBe(true);
    }
  });

  it('заголовок страницы h1, разделы h2', () => {
    expect(document.querySelectorAll('h1').length).toBe(1);
    expect(document.querySelector('h1 img').alt).toBe('Fabbit');
  });
});
