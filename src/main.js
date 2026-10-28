import '@fontsource/tiny5/cyrillic-400.css';
import '@fontsource/tiny5/latin-400.css';
import './style.css';
import { createScreen } from './screen.js';
import { MODES, NODE_TEXT } from './copy.js';
import { DEVICE, BOARD, NODES } from './geom.js';

// Невидимые копии всех вариантов текста в ячейке .stack: высота блока равна самому длинному.
function reserve(stack, variants, render) {
  for (const v of variants) {
    const ghost = render(v);
    ghost.classList.add('stack__ghost');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.removeAttribute('aria-live');
    for (const el of [ghost, ...ghost.querySelectorAll('[data-node-title],[data-node-what],[data-node-spec],[data-mode-desc]')])
      for (const a of Object.keys(el.dataset)) delete el.dataset[a];
    stack.append(ghost);
  }
}

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
  if (box.lab) return box.lab; // повторный вызов (тесты, HMR) не дублирует обработчики
  const canvas = box.querySelector('[data-screen]');
  place(canvas, DEVICE.screen, DEVICE);
  const screen = createScreen(canvas);
  const tabs = [...root.querySelectorAll('[data-mode]')];
  const desc = root.querySelector('[data-mode-desc]');
  const hint = root.querySelector('[data-mode-hint]');
  reserve(root.querySelector('[data-mode-stack]'), Object.values(MODES), (m) => {
    const p = desc.cloneNode();
    p.textContent = m.desc;
    return p;
  });

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
  // пробел для прыжка: экран виден, фокус ни на чём (на кнопке пробел нажимает её)
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
  box.lab = { screen, select };
  return box.lab;
}

export function initBoard(root = document) {
  const box = root.querySelector('[data-board]');
  if (!box) return null;
  if (box.lab) return box.lab;
  const card = root.querySelector('[data-node-card]');
  const info = card.querySelector('[data-node-info]');
  reserve(card.querySelector('[data-node-stack]'), Object.values(NODE_TEXT), (t) => {
    const el = info.cloneNode(true);
    el.querySelector('[data-node-title]').textContent = t.title;
    el.querySelector('[data-node-what]').textContent = t.what;
    el.querySelector('[data-node-spec]').textContent = t.spec ?? '';
    return el;
  });
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
    info.querySelector('[data-node-title]').textContent = t.title;
    info.querySelector('[data-node-what]').textContent = t.what;
    const spec = info.querySelector('[data-node-spec]');
    spec.textContent = t.spec ?? '';
    spec.hidden = !t.spec;
  };
  for (const b of buttons) b.addEventListener('click', () => select(b.dataset.node));
  for (const c of chips) c.addEventListener('click', () => select(c.dataset.nodeChip));
  select('fpga');
  box.lab = { select };
  return box.lab;
}

// Фото стенда: превью 720 px, полный кадр 1600 px грузится при первом открытии.
export function initZoom(root = document) {
  const open = root.querySelector('[data-zoom]');
  const dialog = root.querySelector('[data-zoom-dialog]');
  if (!open || !dialog || open.lab) return null;
  const img = dialog.querySelector('img');
  open.lab = true;
  open.addEventListener('click', () => {
    if (!img.getAttribute('src')) img.src = img.dataset.src;
    dialog.showModal?.();
  });
  // клик по фону или картинке закрывает
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target === img) dialog.close();
  });
  return dialog;
}

if (typeof document !== 'undefined' && document.querySelector('[data-device]')) {
  initDevice();
  initBoard();
  initZoom();
}
