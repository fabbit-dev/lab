// Снимки страницы для README: docs/img/page-mobile.png (400 px, шапка и прибор), page-desktop.png (1440 px)
// и screen.gif: экран прибора, три профиля по очереди. Нужны Chrome с отладкой и запущенная страница:
//   google-chrome --headless=new --remote-debugging-port=9337 --user-data-dir=/tmp/chr about:blank
//   npm run dev
//   node art/docs-shots.mjs [http://localhost:5191/]
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import gifenc from 'gifenc';

const { GIFEncoder } = gifenc;
const URL_ = process.argv[2] ?? 'http://localhost:5191/';
const docs = path.join(path.dirname(fileURLToPath(import.meta.url)), '../docs/img');
const page = (await (await fetch('http://localhost:9337/json/list')).json()).find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// limit: высота кадра; для телефона хватает шапки и прибора, иначе README тянется на 2700 px.
async function full(name, width, limit = Infinity) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
  await send('Page.navigate', { url: `${URL_}?docs=${Date.now()}` });
  for (let t = 0; t < 50 && !(await ev('document.readyState === "complete" && document.fonts.status === "loaded"')); t++) await wait(100);
  await wait(1500); // заставка экрана уходит через 0,9 с
  // кадр со скрепкой и раскрытым узлом аккумулятора: самое живое состояние
  await ev('document.querySelector("[data-node-chip=battery]").click()');
  const h = await ev('document.documentElement.scrollHeight');
  await send('Emulation.setDeviceMetricsOverride', { width, height: h, deviceScaleFactor: 1, mobile: width < 600 });
  await wait(400);
  const height = Math.min(h, limit);
  const r = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width, height, scale: 1 } });
  writeFileSync(path.join(docs, name), Buffer.from(r.result.data, 'base64'));
  console.log(`docs/img/${name} ${width}×${height}`);
}

// Кадр экрана 64×48 из canvas, масштаб k без сглаживания.
const frame = (k) => ev(`(() => {
  const c = document.querySelector('[data-screen]');
  const o = document.createElement('canvas'); o.width = 64 * ${k}; o.height = 48 * ${k};
  const g = o.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0, o.width, o.height);
  return [...g.getImageData(0, 0, o.width, o.height).data];
})()`);

// Палитра GIF: цвета экрана из src/screen.js (COLORS), без квантования и дизеринга.
const SCREEN = [[17, 20, 17], [125, 255, 143], [47, 107, 58], [255, 247, 236], [232, 132, 60]];

function indexed(rgba) {
  const out = new Uint8Array(rgba.length / 4);
  for (let p = 0; p < out.length; p++) {
    const [r, g, b] = rgba.slice(p * 4, p * 4 + 3);
    let best = 0, d = Infinity;
    SCREEN.forEach(([R, G, B], i) => {
      const e = (r - R) ** 2 + (g - G) ** 2 + (b - B) ** 2;
      if (e < d) { d = e; best = i; }
    });
    out[p] = best;
  }
  return out;
}

async function gif() {
  const k = 5, step = 80;
  await send('Emulation.setDeviceMetricsOverride', { width: 400, height: 900, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: `${URL_}?docs=${Date.now()}` });
  await wait(200);
  const frames = [];
  const shot = async () => { frames.push(indexed(await frame(k))); await wait(step); };
  for (let i = 0; i < 10; i++) await shot(); // заставка
  // осциллограф: синус → меандр; логика: импульсы → разбор байтов; ретро: прыжки через тыквы
  for (const [mode, n, tapAt] of [['scope', 16, [8]], ['logic', 18, [6]], ['retro', 40, []]]) {
    await ev(`document.querySelector('[data-mode=${mode}]').click()`);
    for (let i = 0; i < n; i++) {
      if (tapAt.includes(i)) await ev("document.querySelector('[data-screen]').click()");
      // ретро: прыжок, когда левый край тыквы на x 18…23, середина окна прыжка
      // (src/screen.test.js проверяет окно 16…25)
      if (mode === 'retro')
        await ev(`(() => {
          const d = document.querySelector('[data-screen]').getContext('2d').getImageData(0, 42, 64, 1).data;
          let left = -1;
          for (let x = 0; x < 64; x++) if (d[x * 4] === 232 && d[x * 4 + 1] === 132) { left = x; break; }
          if (left >= 18 && left <= 23) document.querySelector('[data-screen]').click();
        })()`);
      await shot();
    }
  }
  const enc = GIFEncoder();
  const palette = SCREEN;
  for (const f of frames) enc.writeFrame(f, 64 * k, 48 * k, { palette, delay: step });
  enc.finish();
  writeFileSync(path.join(docs, 'screen.gif'), enc.bytes());
  console.log(`docs/img/screen.gif ${64 * k}×${48 * k}, кадров ${frames.length}`);
}

await send('Runtime.enable');
await send('Page.enable');
await full('page-mobile.png', 400, 940);
await full('page-desktop.png', 1440);
await gif();
ws.close();
