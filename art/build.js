// npm run art: спрайты из art/sprites/*.js → public/world/<имя>.png (1x), из art/page/*.js → public/img/,
// превью art/out/<имя>@4x.png.
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
  for (const { name, sprite } of await loadSprites('page')) {
    await writeFile(path.join(img, `${name}.png`), sprite.png(1));
    await writeFile(path.join(out, `${name}@4x.png`), sprite.png(4));
    console.log(`img/${name}.png ${sprite.w}×${sprite.h}`);
  }
  if (process.argv.includes('--mock')) {
    const file = await renderMock(Object.fromEntries(sprites.map((s) => [s.name, s.sprite])), out);
    console.log(`мокап: ${path.relative(root, file)}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
