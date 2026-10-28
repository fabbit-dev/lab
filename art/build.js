// npm run art: спрайты из art/sprites/*.js → public/world/<имя>.png (1x) и art/out/<имя>@4x.png.
// npm run art -- --mock: ещё и art/out/mock.png, спрайты на куске карты мира рядом с их мебелью.
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { checkWorldPng } from './canvas.js';
import { renderMock } from './mock.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const world = path.join(root, 'public/world');
const out = path.join(here, 'out');

export async function loadSprites() {
  const dir = path.join(here, 'sprites');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.js')).sort();
  return Promise.all(
    files.map(async (f) => {
      const mod = await import(pathToFileURL(path.join(dir, f)));
      return { ...mod.meta, sprite: mod.default() };
    }),
  );
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
  if (process.argv.includes('--mock')) {
    const file = await renderMock(Object.fromEntries(sprites.map((s) => [s.name, s.sprite])), out);
    console.log(`мокап: ${path.relative(root, file)}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
