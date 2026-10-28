// npm run art: спрайты из art/sprites/*.js → public/world/<имя>.png (1x), из art/page/*.js → public/img/,
// превью art/out/<имя>@4x.png.
// npm run art -- --mock: ещё и art/out/mock.png, спрайты на куске карты мира рядом с их мебелью.
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { PNG } from 'pngjs';
import { checkWorldPng } from './canvas.js';
import { renderMock } from './mock.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const world = path.join(root, 'public/world');
const out = path.join(here, 'out');

// sprites/: для мира (кратны 32, ссылка), page/: картинки страницы в public/img/.
export async function loadSprites(kind = 'sprites') {
  const dir = path.join(here, kind);
  const files = (await readdir(dir)).filter((f) => f.endsWith('.js')).sort();
  return Promise.all(
    files.map(async (f) => {
      const mod = await import(pathToFileURL(path.join(dir, f)));
      return { ...mod.meta, sprite: mod.default() };
    }),
  );
}

// Иконка сайта: кролик в тыкве. favicon.ico (32 и 64 px PNG внутри), favicon.png 32 px,
// apple-touch-icon 180 px: спрайт ×5 по центру кремового квадрата.
async function writeFavicons(sprite) {
  const png = (k) => sprite.png(k);
  const sizes = [[32, png(1)], [64, png(2)]];
  const head = Buffer.alloc(6 + 16 * sizes.length);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(sizes.length, 4);
  let offset = head.length;
  sizes.forEach(([size, data], i) => {
    const o = 6 + 16 * i;
    head.writeUInt8(size, o);
    head.writeUInt8(size, o + 1);
    head.writeUInt16LE(1, o + 4);
    head.writeUInt16LE(32, o + 6);
    head.writeUInt32LE(data.length, o + 8);
    head.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  await writeFile(path.join(root, 'public/favicon.ico'), Buffer.concat([head, ...sizes.map(([, d]) => d)]));
  await writeFile(path.join(root, 'public/favicon.png'), png(1));

  const big = PNG.sync.read(png(5));
  const touch = new PNG({ width: 180, height: 180 });
  for (let i = 0; i < touch.data.length; i += 4) touch.data.set([0xff, 0xf7, 0xec, 0xff], i);
  const off = (180 - big.width) / 2;
  for (let y = 0; y < big.height; y++)
    for (let x = 0; x < big.width; x++) {
      const si = (y * big.width + x) * 4;
      if (big.data[si + 3]) touch.data.set(big.data.subarray(si, si + 4), ((y + off) * 180 + x + off) * 4);
    }
  await writeFile(path.join(root, 'public/apple-touch-icon.png'), PNG.sync.write(touch));
  console.log('favicon.ico 32+64, favicon.png 32, apple-touch-icon.png 180');
}

async function main() {
  await mkdir(world, { recursive: true });
  await mkdir(out, { recursive: true });
  const sprites = await loadSprites();
  const links = [];
  for (const { name, title, link, sprite } of sprites) {
    const png = sprite.png(1);
    const { errors } = checkWorldPng(png);
    if (errors.length) throw new Error(`${name}: ${errors.join(', ')}`);
    await writeFile(path.join(world, `${name}.png`), png);
    await writeFile(path.join(out, `${name}@4x.png`), sprite.png(4));
    links.push({ file: `${name}.png`, title, size: `${sprite.w}×${sprite.h}`, link });
    console.log(`${name}.png ${sprite.w}×${sprite.h} → ${link}`);
  }
  await writeFile(path.join(world, 'links.json'), JSON.stringify(links, null, 2) + '\n');
  const img = path.join(root, 'public/img');
  await mkdir(img, { recursive: true });
  for (const { name, sprite, scales = [] } of await loadSprites('page')) {
    await writeFile(path.join(img, `${name}.png`), sprite.png(1));
    for (const k of scales) await writeFile(path.join(img, `${name}@${k}x.png`), sprite.png(k));
    await writeFile(path.join(out, `${name}@4x.png`), sprite.png(4));
    console.log(`img/${name}.png ${sprite.w}×${sprite.h}`);
  }
  await writeFavicons(sprites.find((s) => s.name === 'bunny-pumpkin').sprite);
  if (process.argv.includes('--mock')) {
    const file = await renderMock(Object.fromEntries(sprites.map((s) => [s.name, s.sprite])), out);
    console.log(`мокап: ${path.relative(root, file)}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
