// Экран пиксельного Fabbit: 64×48 логических пикселей, три демо-профиля. Иллюстрация, не измерение.
// Чистые функции (wave, uartBits, runner) отдельно от рисования: их проверяет screen.test.js.
import { drawText, textWidth } from './pixfont.js';

export const W = 64;
export const H = 48;

// Цвета экрана: RGBA одним 32-битным словом в порядке байт ImageData (little-endian).
const rgba = (r, g, b) => ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
const COLORS = {
  bg: rgba(17, 20, 17),
  fg: rgba(125, 255, 143),
  dim: rgba(47, 107, 58),
  white: rgba(255, 247, 236),
  orange: rgba(232, 132, 60),
};

// Спрайт как список закрашенных точек [x, y, …]: рисовать без разбора строк каждый кадр.
const points = (rows) => rows.flatMap((row, y) => [...row].flatMap((c, x) => (c === '#' ? [x, y] : [])));

// ── осциллограф ──
export const WAVES = ['SIN', 'SQR', 'SAW'];

// t: фаза в периодах. Значение от −1 до 1.
export function wave(kind, t) {
  const f = t - Math.floor(t);
  if (kind === 'SQR') return f < 0.5 ? 1 : -1;
  if (kind === 'SAW') return 1 - 2 * f;
  return Math.sin(2 * Math.PI * f);
}

// ── логический анализатор: UART 8N1, младший бит первым ──
export function uartBits(ch) {
  const code = ch.charCodeAt(0);
  const data = Array.from({ length: 8 }, (_, i) => (code >> i) & 1);
  return [0, ...data, 1];
}

const MESSAGE = 'FABBIT';
const BIT = 2; // пикселей на бит
const GAP = 4; // бит простоя между байтами

// Линия TX: массив уровней по пикселям и где начинается каждый байт.
export function uartTrack(text = MESSAGE) {
  const level = [];
  const frames = [];
  for (const ch of text) {
    frames.push({ ch, x: level.length });
    for (const b of uartBits(ch)) for (let k = 0; k < BIT; k++) level.push(b);
    for (let k = 0; k < GAP * BIT; k++) level.push(1);
  }
  return { level, frames };
}

// ── ретро: кролик прыгает через тыквы ──
export const GROUND = 44; // нижний ряд кролика и тыквы
const GRAVITY = 220; // пикс/с²: мягкий прыжок, 0,77 с в воздухе
const JUMP = -88; // пикс/с: высота 17 px, почти втрое выше тыквы
export const SPEED = 32; // пикс/с
const BUNNY_X = 6;

export function createRunner() {
  return { y: 0, vy: 0, obstacles: [], next: 0.6, score: 0, hit: 0 };
}

export function jump(r) {
  if (r.y === 0) r.vy = JUMP;
}

// Столкновение по пикселям: общий закрашенный пиксель у кролика и тыквы.
export function collides(r, o) {
  const by = GROUND - GAME_BUNNY.length + 1 + Math.round(r.y);
  const py = GROUND - HIT.length + 1;
  const ox = Math.round(o.x);
  for (let j = 0; j < HIT.length; j++)
    for (let i = 0; i < HIT[j].length; i++) {
      if (HIT[j][i] !== '#') continue;
      const row = GAME_BUNNY[py + j - by];
      if (row && row[ox + i - BUNNY_X] === '#') return true;
    }
  return false;
}

// dt в секундах. rand(): 0..1, для тестов подменяется.
export function stepRunner(r, dt, rand = Math.random) {
  if (r.hit > 0) {
    r.hit -= dt;
    if (r.hit <= 0) Object.assign(r, createRunner(), { next: 0.8 });
    return r;
  }
  r.vy += GRAVITY * dt;
  r.y = Math.min(0, r.y + r.vy * dt);
  if (r.y === 0) r.vy = Math.min(r.vy, 0);
  r.next -= dt;
  if (r.next <= 0) {
    r.obstacles.push({ x: W + 2, passed: false });
    r.next = 1.4 + rand() * 1.2;
  }
  for (const o of r.obstacles) o.x -= SPEED * dt;
  r.obstacles = r.obstacles.filter((o) => o.x > -PUMPKIN[0].length);
  for (const o of r.obstacles) {
    if (collides(r, o)) r.hit = 0.9;
    if (!o.passed && o.x + PUMPKIN[0].length < BUNNY_X) {
      o.passed = true;
      r.score += 1;
    }
  }
  return r;
}

// Кролик с лого fabbit.dev (public/img/logo.svg), 16×19: левое ухо прямое, правое к центру,
// глаза и рот прорезаны. На заставке без изменений, в игре уменьшенный GAME_BUNNY.
export const LOGO_BUNNY = [
  '.###.......###..',
  '.###.......###..',
  '.####....#####..',
  '.####....#####..',
  '.####....#####..',
  '.####....#####..',
  '.####..#####....',
  '.####..#####....',
  '..##########....',
  '..############..',
  '..############..',
  '################',
  '###..######..###',
  '###..######..###',
  '################',
  '#######..#######',
  '#######..#######',
  '..############..',
  '..############..',
];
// Кролик для игры: лого, уменьшенное до 10×12. Левое ухо прямое, правое к центру,
// глаза и рот на тех же местах. Крупный кролик 16×19 почти не перепрыгивал тыквы.
export const GAME_BUNNY = [
  '.##....##.',
  '.##...###.',
  '.##...###.',
  '.##..###..',
  '.##.###...',
  '.#######..',
  '.########.',
  '##########',
  '##.####.##',
  '##########',
  '####..####',
  '.########.',
];

// Тыква 7×6: черенок и круглые бока, низ на земле.
const PUMPKIN = ['...#...', '.#####.', '#######', '#######', '#######', '.#####.'];
// Зона удара тыквы: без черенка и крайних пикселей, задеть их краем лапы не обидно.
const HIT = ['.......', '..###..', '.#####.', '.#####.', '.#####.', '.......'];

export function createScreen(canvas) {
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d', { alpha: false });
  const img = g.createImageData(W, H);
  const px = new Uint32Array(img.data.buffer);
  const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  let mode = 'boot';
  let next = 'scope';
  let waveIndex = 0;
  let decoded = false;
  let runner = createRunner();
  let clock = 0;
  let bootLeft = 0.9;
  let last = 0;
  let raf = 0;
  let visible = true;

  // Кадр собирается в Uint32Array поверх ImageData: одна запись на пиксель, без аллокаций.
  const plot = (x, y, c = COLORS.fg) => {
    x |= 0;
    y |= 0;
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    px[y * W + x] = c;
  };
  const clear = () => px.fill(COLORS.bg);
  const cache = new Map();
  const sprite = (rows, x, y, c) => {
    let pts = cache.get(rows);
    if (!pts) cache.set(rows, (pts = points(rows)));
    x = Math.round(x);
    y = Math.round(y);
    for (let i = 0; i < pts.length; i += 2) plot(x + pts[i], y + pts[i + 1], c);
  };
  const text = (s, x, y, c) => drawText((px, py) => plot(px, py, c), s, x, y);
  const textRight = (s, y, c) => text(s, W - 1 - textWidth(s), y, c);

  function drawBoot() {
    sprite(LOGO_BUNNY, 24, 7, COLORS.white);
    text('FABBIT', 21, 32, COLORS.white);
  }

  function drawScope() {
    text('CH1', 1, 1, COLORS.fg);
    textRight('1V', 1, COLORS.dim);
    for (let x = 0; x < W; x += 2) plot(x, 26, COLORS.dim);
    for (let y = 9; y < 44; y += 2) plot(32, y, COLORS.dim);
    for (let x = 0; x < W; x += 8) for (let y = 10; y < 44; y += 8) plot(x, y, COLORS.dim);
    const kind = WAVES[waveIndex];
    const phase = reduced ? 0 : clock * 0.6;
    let prev = null;
    for (let x = 0; x < W; x++) {
      const y = Math.round(26 - 13 * wave(kind, x / 32 - phase));
      if (prev !== null) for (let k = Math.min(prev, y) + 1; k < Math.max(prev, y); k++) plot(x, k);
      plot(x, y);
      prev = y;
    }
    textRight(kind, 43, COLORS.fg);
    text('1MS', 1, 43, COLORS.dim);
  }

  const track = uartTrack();
  function drawLogic() {
    text(decoded ? 'UART' : 'LA', 1, 1, COLORS.fg);
    textRight('3CH', 1, COLORS.dim);
    const x0 = 10;
    const span = W - x0;
    const shift = reduced ? 0 : Math.floor(clock * 14);
    // D0: UART TX, D1: тактовый меандр, D2: медленный строб
    const lanes = [
      { name: 'D0', hi: 13, lo: 19, at: (i) => track.level[(i + shift) % track.level.length] },
      { name: 'D1', hi: 27, lo: 31, at: (i) => (Math.floor((i + shift) / 2) % 2 ? 1 : 0) },
      { name: 'D2', hi: 38, lo: 42, at: (i) => (((i + shift) % 40) < 12 ? 1 : 0) },
    ];
    for (const lane of lanes) {
      text(lane.name, 1, lane.hi + (lane.lo - lane.hi) / 2 - 2, COLORS.dim);
      let prev = lane.at(0);
      for (let i = 0; i < span; i++) {
        const v = lane.at(i);
        if (v !== prev) for (let y = lane.hi; y <= lane.lo; y++) plot(x0 + i, y);
        else plot(x0 + i, v ? lane.hi : lane.lo);
        prev = v;
      }
    }
    if (decoded) {
      const total = track.level.length;
      for (const f of track.frames) {
        for (const rep of [0, total]) {
          const x = x0 + f.x + rep - (shift % total);
          if (x < x0 - 6 || x > W) continue;
          const mid = x + 10;
          for (let k = x + 2; k < x + 18; k++) if (k >= x0) plot(k, 9, COLORS.orange);
          if (mid - 1 >= x0) text(f.ch, mid - 1, 3, COLORS.orange);
        }
      }
    }
  }

  function drawRetro() {
    for (let x = 0; x < W; x++) plot(x, GROUND + 1, COLORS.dim);
    for (let x = (W - Math.floor(clock * SPEED) % 6) - 6; x < W; x += 6) plot(x, GROUND + 3, COLORS.dim);
    for (const o of runner.obstacles) sprite(PUMPKIN, Math.round(o.x), GROUND - PUMPKIN.length + 1, COLORS.orange);
    const blink = runner.hit > 0 && Math.floor(runner.hit * 8) % 2;
    if (!blink) sprite(GAME_BUNNY, BUNNY_X, GROUND - GAME_BUNNY.length + 1 + Math.round(runner.y), COLORS.white);
    textRight(String(runner.score), 1, COLORS.fg);
    text(runner.hit > 0 ? 'OUCH' : 'HOP', 1, 1, COLORS.dim);
  }

  function render() {
    clear();
    if (mode === 'boot') drawBoot();
    else if (mode === 'scope') drawScope();
    else if (mode === 'logic') drawLogic();
    else drawRetro();
    g.putImageData(img, 0, 0);
  }

  const animated = () => mode === 'boot' || mode === 'retro' || !reduced;

  // dt ограничен 1/30 с: после фриза телефона кролик не пролетает тыкву за один кадр.
  function frame(now) {
    raf = 0;
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 0;
    last = now;
    clock += dt;
    if (mode === 'boot') {
      bootLeft -= dt;
      if (bootLeft <= 0) mode = next;
    }
    if (mode === 'retro') stepRunner(runner, dt);
    render();
    if (visible && animated()) raf = requestAnimationFrame(frame);
  }

  function wake() {
    if (!raf && visible) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  }

  render();
  wake();

  return {
    get mode() {
      return mode === 'boot' ? next : mode;
    },
    setMode(m) {
      if (mode === 'boot') next = m;
      else mode = m;
      if (m === 'retro') runner = createRunner();
      decoded = false;
      render();
      wake();
    },
    // Нажатие на экран: действие текущего профиля.
    tap() {
      if (mode === 'boot') return;
      if (mode === 'scope') waveIndex = (waveIndex + 1) % WAVES.length;
      else if (mode === 'logic') decoded = !decoded;
      else jump(runner);
      render();
      wake();
    },
    setVisible(v) {
      visible = v;
      if (v) wake();
    },
    get wave() {
      return WAVES[waveIndex];
    },
    get decoded() {
      return decoded;
    },
  };
}
