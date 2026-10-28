import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 5191 },
  // публичный туннель для проверки с телефона: cloudflared или ssh -p 443 -R0:localhost:4174 a.pinggy.io
  preview: { port: 4174, allowedHosts: ['.trycloudflare.com', '.pinggy.net', '.pinggy-free.link', '.pinggy.link'] },
  test: { environment: 'jsdom' },
});
