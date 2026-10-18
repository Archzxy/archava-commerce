import { createServer, request as httpRequest } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPage } from './pages.mjs';

const root = fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || '127.0.0.1';
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.json': 'application/json',
};

function proxyAPI(request, response) {
  const upstream = httpRequest({ hostname: '127.0.0.1', port: Number(process.env.ARCHAVA_API_PORT || 5180), path: request.url, method: request.method, headers: request.headers }, incoming => {
    response.writeHead(incoming.statusCode, incoming.headers);
    incoming.pipe(response);
  });
  upstream.on('error', () => { if (!response.headersSent) response.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }).end(JSON.stringify({ error: 'Layanan Archava belum tersedia.' })); else response.destroy(); });
  upstream.setTimeout(45_000, () => upstream.destroy());
  request.pipe(upstream);
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);
    if (pathname === '/healthz' && ['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : JSON.stringify({ ok: true }));
      return;
    }
    if (pathname.startsWith('/api/')) { proxyAPI(request, response); return; }
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
      return;
    }
    if (pathname.split('/').some((part) => part.startsWith('.'))) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    if (!extname(pathname) || pathname === '/index.html') {
      const page = await renderPage(url);
      response.writeHead(page.status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      response.end(request.method === 'HEAD' ? undefined : page.html);
      return;
    }
    const publicFile = ['/app.js', '/styles.css', '/ui.js', '/data/products.js', '/data/catalog.js', '/data/comparison.js', '/data/product-knowledge.js'].includes(pathname) || pathname.startsWith('/assets/');
    if (!publicFile) throw new Error('Not a public file');
    const assetRoot = pathname.startsWith('/assets/archava/') ? resolve(root, 'archava/dist') : root;
    const file = resolve(assetRoot, pathname.startsWith('/assets/archava/') ? pathname.slice('/assets/archava/'.length) : `.${pathname}`);
    if (!file.startsWith(assetRoot + sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const info = await stat(file);
    if (!info.isFile() || !types[extname(file)]) throw new Error('Not a public asset');
    const body = await readFile(file);
    response.writeHead(200, {
      'Content-Type': types[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
}).listen(port, host, () => {
  console.log(`DOPAMINE is running at http://localhost:${port}`);
});
