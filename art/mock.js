// Мокап: кусок карты мира Тыкворкинга с нашими спрайтами. Карту и тайлсеты качает
// в art/out/ref/ при первом запуске; в git они не идут (это графика организаторов).
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

const BASE = 'https://mpei.cubemeta.ru/map-storage/tykworking/tykworking26/test/';
const T = 32;
// Область карты в клетках: коридор у стола «ТЫКВОРКИНГ» с компьютерами.
const AREA = { x: 82, y: 80, w: 20, h: 11 };
// Где стоят наши спрайты (клетки карты).
const PLACE = {
  'fabbit-poster': [86, 84],
  'fabbit-desk': [85, 86],
  'bunny-pumpkin': [89, 87],
};

async function cached(dir, name) {
  const file = path.join(dir, name);
  try {
    await access(file);
  } catch {
    const r = await fetch(BASE + name);
    if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
    await writeFile(file, Buffer.from(await r.arrayBuffer()));
  }
  return readFile(file);
}

function blit(dst, src, sx, sy, w, h, dx, dy) {
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const si = ((sy + y) * src.width + sx + x) * 4;
      const a = src.data[si + 3];
      if (!a) continue;
      const tx = dx + x, ty = dy + y;
      if (tx < 0 || ty < 0 || tx >= dst.width || ty >= dst.height) continue;
      const di = (ty * dst.width + tx) * 4;
      for (let k = 0; k < 3; k++) dst.data[di + k] = Math.round((src.data[si + k] * a + dst.data[di + k] * (255 - a)) / 255);
      dst.data[di + 3] = 255;
    }
}

export async function renderMock(sprites, out, scale = 3) {
  const ref = path.join(out, 'ref');
  await mkdir(ref, { recursive: true });
  const map = JSON.parse(await cached(ref, 'office.tmj'));
  const sets = await Promise.all(
    map.tilesets.map(async (t) => ({ ...t, png: PNG.sync.read(await cached(ref, t.image)) })),
  );
  sets.sort((a, b) => a.firstgid - b.firstgid);
  const img = new PNG({ width: AREA.w * T, height: AREA.h * T });
  img.data.fill(0);

  const layers = map.layers.filter((l) => l.type === 'tilelayer');
  const drawLayer = (l) => {
    for (let y = 0; y < AREA.h; y++)
      for (let x = 0; x < AREA.w; x++) {
        const gid = l.data[(AREA.y + y) * map.width + AREA.x + x] & 0x1fffffff;
        if (!gid) continue;
        const set = sets.filter((s) => s.firstgid <= gid).at(-1);
        const k = gid - set.firstgid;
        blit(img, set.png, (k % set.columns) * T, Math.floor(k / set.columns) * T, T, T, x * T, y * T);
      }
  };
  // в WorkAdventure объекты (entities) рисуются поверх тайлов карты
  layers.forEach(drawLayer);
  for (const [name, [cx, cy]] of Object.entries(PLACE)) {
    const s = sprites[name];
    if (!s) continue;
    const png = PNG.sync.read(s.png(1));
    blit(img, png, 0, 0, png.width, png.height, (cx - AREA.x) * T, (cy - AREA.y) * T);
  }

  const big = new PNG({ width: img.width * scale, height: img.height * scale });
  for (let y = 0; y < big.height; y++)
    for (let x = 0; x < big.width; x++) {
      const si = (Math.floor(y / scale) * img.width + Math.floor(x / scale)) * 4;
      big.data.set(img.data.subarray(si, si + 4), (y * big.width + x) * 4);
    }
  const file = path.join(out, 'mock.png');
  await writeFile(file, PNG.sync.write(big));
  return file;
}

