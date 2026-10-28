import '@fontsource/tiny5/cyrillic-400.css';
import '@fontsource/tiny5/latin-400.css';
import './style.css';
import { createScreen } from './screen.js';
import { MODES, NODE_TEXT } from './copy.js';
import { DEVICE, BOARD, NODES } from './geom.js';

const pct = (v, total) => `${(v / total) * 100}%`;
const place = (el, r, total) => {
  el.style.left = pct(r.x, total.w);
  el.style.top = pct(r.y, total.h);
  el.style.width = pct(r.w, total.w);
  el.style.height = pct(r.h, total.h);
};

export function initDevice(root = document) {
  const box = root.querySelector('[data-device]');
  if (!box) return null;
  const canvas = box.querySelector('[data-screen]');
  place(canvas, DEVICE.screen, DEVICE);
  const screen = createScreen(canvas);
  const tabs = [...root.querySelectorAll('[data-mode]')];
  const desc = root.querySelector('[data-mode-desc]');
  const hint = root.querySelector('[data-mode-hint]');

  const select = (id) => {
    screen.setMode(id);
    for (const t of tabs) t.setAttribute('aria-pressed', String(t.dataset.mode === id));
    desc.textContent = MODES[id].desc;
    hint.textContent = MODES[id].hint;
    canvas.setAttribute('aria-label', `Экран Fabbit: ${MODES[id].tab}. ${MODES[id].hint}`);
  };
  for (const t of tabs) t.addEventListener('click', () => select(t.dataset.mode));
  canvas.addEventListener('click', () => screen.tap());
  canvas.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      screen.tap();
    }
  });
  // пробел для прыжка, пока экран в зоне видимости и фокус не в поле ввода
  root.addEventListener?.('keydown', (e) => {
    if (e.key !== ' ' || screen.mode !== 'retro' || e.target !== root.body) return;
    const r = canvas.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    e.preventDefault();
    screen.tap();
  });
  if ('IntersectionObserver' in globalThis)
    new IntersectionObserver(([e]) => screen.setVisible(e.isIntersecting)).observe(canvas);
  select('scope');
  return { screen, select };
}

export function initBoard(root = document) {
  const box = root.querySelector('[data-board]');
  if (!box) return null;
  const card = root.querySelector('[data-node-card]');
  const buttons = Object.entries(NODES).map(([id, r]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'node';
    b.dataset.node = id;
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', NODE_TEXT[id].title);
    place(b, r, BOARD);
    box.append(b);
    return b;
  });
  const chips = [...root.querySelectorAll('[data-node-chip]')];

  const select = (id) => {
    box.dataset.active = id;
    for (const b of [...buttons, ...chips]) b.setAttribute('aria-pressed', String((b.dataset.node ?? b.dataset.nodeChip) === id));
    const t = NODE_TEXT[id];
    card.querySelector('[data-node-title]').textContent = t.title;
    card.querySelector('[data-node-what]').textContent = t.what;
    const spec = card.querySelector('[data-node-spec]');
    spec.textContent = t.spec ?? '';
    spec.hidden = !t.spec;
  };
  for (const b of buttons) b.addEventListener('click', () => select(b.dataset.node));
  for (const c of chips) c.addEventListener('click', () => select(c.dataset.nodeChip));
  select('fpga');
  return { select };
}

if (typeof document !== 'undefined' && document.querySelector('[data-device]')) {
  initDevice();
  initBoard();
}
