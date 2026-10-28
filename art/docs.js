// npm run docs: картинки для README в docs/img/ из тех же спрайтов, что идут в мир и на страницу.
// hero.png: стол, постер и кролик ×4 на газоне мира; sprites-*.png: каждый спрайт ×6;
// page-art.png: прибор и плата; palette.png: палитра; mock.png: спрайты на карте мира.
// Скриншоты и GIF экрана снимает art/docs-shots.mjs через Chrome (нужен npm run dev).
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PNG } from 'pngjs';
import { loadSprites } from './build.js';
import { renderMock } from './mock.js';
import { PALETTE } from './palette.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const docs = path.join(here, '../docs/img');
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));

// Холст RGBA с заливкой и вставкой спрайтов в целом масштабе.
function canvas(w, h, bg) {
  const png = new PNG({ width: w, height: h });
  const [r, g, b] = hex(bg);
  for (let i = 0; i < png.data.length; i += 4) png.data.set([r, g, b, 255], i);
  return png;
}

function put(dst, sprite, x0, y0, k) {
  for (let y = 0; y < sprite.h; y++)
    for (let x = 0; x < sprite.w; x++) {
      const c = sprite.px[y][x];
      if (!c) continue;
      const rgb = hex(PALETTE[c]);
      for (let j = 0; j < k; j++)
        for (let i = 0; i < k; i++) {
          const px = x0 + x * k + i, py = y0 + y * k + j;
          if (px >= 0 && py >= 0 && px < dst.width && py < dst.height) dst.data.set([...rgb, 255], (py * dst.width + px) * 4);
        }
    }
}

// Газон мира: шалфей с редкими травинками, как тайлы пола Тыкворкинга.
function lawn(png) {
  const [r, g, b] = hex(PALETTE.sageDark);
  for (let y = 0; y < png.height; y++)
    for (let x = 0; x < png.width; x++) {
      const n = (x * 73856093) ^ (y * 19349663);
      if (((n >>> 0) % 97) === 0) png.data.set([r, g, b, 255], (y * png.width + x) * 4);
    }
}

async function hero(world) {
  const k = 4, pad = 48, gap = 56;
  const items = ['fabbit-poster', 'fabbit-desk', 'bunny-pumpkin'].map((n) => world[n]);
  const w = pad * 2 + items.reduce((a, s) => a + s.w * k, 0) + gap * (items.length - 1);
  const h = pad * 2 + 64 * k;
  const png = canvas(w, h, PALETTE.sage);
  lawn(png);
  let x = pad;
  for (const s of items) {
    put(png, s, x, pad + (64 - s.h) * k, k);
    x += s.w * k + gap;
  }
  return png;
}

// Один спрайт крупно на кремовом фоне с сеткой клеток мира 32×32.
function sheet(sprite, k) {
  const pad = 24;
  const png = canvas(sprite.w * k + pad * 2, sprite.h * k + pad * 2, PALETTE.cream);
  const [r, g, b] = hex(PALETTE.paperShade);
  for (let y = 0; y <= sprite.h; y += 32)
    for (let x = 0; x < sprite.w * k; x += 2) png.data.set([r, g, b, 255], ((pad + y * k - (y ? 1 : 0)) * png.width + pad + x) * 4);
  for (let x = 0; x <= sprite.w; x += 32)
    for (let y = 0; y < sprite.h * k; y += 2) png.data.set([r, g, b, 255], ((pad + y) * png.width + pad + x * k - (x ? 1 : 0)) * 4);
  put(png, sprite, pad, pad, k);
  return png;
}

function pageArt(page) {
  const k = 3, pad = 32, gap = 48;
  const items = [page.device, page.board];
  const w = pad * 2 + items.reduce((a, s) => a + s.w * k, 0) + gap;
  const h = pad * 2 + Math.max(...items.map((s) => s.h)) * k;
  const png = canvas(w, h, PALETTE.pumpkin);
  let x = pad;
  for (const s of items) {
    put(png, s, x, pad, k);
    x += s.w * k + gap;
  }
  return png;
}

// Палитра: квадраты 40 px с контуром, в порядке art/palette.js.
function palette() {
  const names = Object.keys(PALETTE);
  const cell = 40, gap = 8, cols = 11, pad = 16;
  const rows = Math.ceil(names.length / cols);
  const png = canvas(pad * 2 + cols * (cell + gap) - gap, pad * 2 + rows * (cell + gap) - gap, PALETTE.cream);
  names.forEach((n, i) => {
    const x0 = pad + (i % cols) * (cell + gap), y0 = pad + Math.floor(i / cols) * (cell + gap);
    const [r, g, b] = hex(PALETTE[n]);
    const [or, og, ob] = hex(PALETTE.outline);
    for (let y = 0; y < cell; y++)
      for (let x = 0; x < cell; x++) {
        const edge = x < 2 || y < 2 || x >= cell - 2 || y >= cell - 2;
        png.data.set(edge ? [or, og, ob, 255] : [r, g, b, 255], ((y0 + y) * png.width + x0 + x) * 4);
      }
  });
  return png;
}

async function main() {
  await mkdir(docs, { recursive: true });
  const world = Object.fromEntries((await loadSprites('sprites')).map((s) => [s.name, s.sprite]));
  const page = Object.fromEntries((await loadSprites('page')).map((s) => [s.name, s.sprite]));
  const write = async (name, png) => {
    await writeFile(path.join(docs, name), PNG.sync.write(png));
    console.log(`docs/img/${name} ${png.width}×${png.height}`);
  };
  await write('hero.png', await hero(world));
  await write('sprite-desk.png', sheet(world['fabbit-desk'], 6));
  await write('sprite-poster.png', sheet(world['fabbit-poster'], 6));
  await write('sprite-bunny.png', sheet(world['bunny-pumpkin'], 6));
  await write('page-art.png', pageArt(page));
  await write('palette.png', palette());
  const mock = await renderMock(world, path.join(here, 'out'), 2);
  await copyFile(mock, path.join(docs, 'mock.png'));
  console.log('docs/img/mock.png');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();

