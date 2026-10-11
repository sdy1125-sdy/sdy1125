import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const dist = new URL('./dist/', import.meta.url).pathname;
const required = [
  'index.html', 'style.css', 'app.js', 'config.json',
  'portrait-cafe.jpg', 'background-music.mp3', 'favicon.svg', 'og.png'
];

for (const file of required) {
  const info = await stat(join(dist, file));
  if (!info.isFile() || info.size === 0) throw new Error(`Thiếu tệp cần đăng: dist/${file}`);
}

const html = await readFile(join(dist, 'index.html'), 'utf8');
const config = JSON.parse(await readFile(join(dist, 'config.json'), 'utf8'));
if (!html.includes('<html') || !config.name || !config.role || !Array.isArray(config.links)) {
  throw new Error('dist/index.html hoặc dist/config.json không hợp lệ.');
}

console.log('dist/ sẵn sàng để đăng lên GitHub Pages.');
