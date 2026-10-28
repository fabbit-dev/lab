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
    expect(document.querySelector('.note').textContent).toMatch(/Иллюстрация/);
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
});
