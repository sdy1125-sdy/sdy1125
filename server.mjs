import { createServer } from 'node:http';
import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const root = new URL('./dist/', import.meta.url).pathname;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.aac': 'audio/aac', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime' };
createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  let path;
  try { path = normalize(decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); }
  catch { res.writeHead(400); res.end('Bad request'); return; }
  const file = path === '/' ? 'index.html' : path.slice(1);
  if (file.startsWith('..')) { res.writeHead(403); res.end(); return; }
  try {
    const filename = join(root, file);
    const info = await stat(filename);
    if (!info.isFile()) { res.writeHead(404); res.end(); return; }
    const type = types[extname(file)] || 'application/octet-stream';
    const headers = { 'content-type': /^(text\/|application\/json)/.test(type) ? `${type}; charset=utf-8` : type, 'accept-ranges': 'bytes' };
    let start = 0, end = info.size - 1, status = 200;
    if (req.headers.range) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!range || (!range[1] && !range[2])) { res.writeHead(416, { 'content-range': `bytes */${info.size}` }); res.end(); return; }
      start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
      end = range[1] && range[2] ? Math.min(Number(range[2]), end) : end;
      if (start > end || start >= info.size) { res.writeHead(416, { 'content-range': `bytes */${info.size}` }); res.end(); return; }
      status = 206;
      headers['content-range'] = `bytes ${start}-${end}/${info.size}`;
    }
    headers['content-length'] = Math.max(0, end - start + 1);
    res.writeHead(status, headers);
    if (req.method === 'HEAD' || info.size === 0) { res.end(); return; }
    const stream = createReadStream(filename, { start, end });
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}).listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173'));
