import { readFile, writeFile, mkdir, copyFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const root = new URL('.', import.meta.url).pathname;
const src = join(root, 'src');
const dist = join(root, 'dist');
const config = JSON.parse(await readFile(join(src, 'config.json'), 'utf8'));

if (!config.name || !config.role || !Array.isArray(config.links)) {
  throw new Error('src/config.json cần name, role và links.');
}

const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const title = `${config.name} — ${config.role}`;
const description = `${config.intro}. Ảnh cá nhân, âm nhạc và các kênh kết nối của ${config.name}.`;
let html = await readFile(join(src, 'index.html'), 'utf8');
const siteUrl = String(config.siteUrl || '').replace(/\/$/, '');
if (!/^https:\/\//.test(siteUrl)) throw new Error('src/config.json cần siteUrl là URL https hợp lệ.');
html = html
  .replaceAll('%%TITLE%%', escape(title))
  .replaceAll('%%DESCRIPTION%%', escape(description))
  .replaceAll('%%SITE_URL%%', escape(siteUrl))
  .replaceAll('%%OG_IMAGE%%', escape(siteUrl + '/og.png'));
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await Promise.all([
  writeFile(join(dist, 'index.html'), html),
  copyFile(join(src, 'style.css'), join(dist, 'style.css')),
  copyFile(join(src, 'app.js'), join(dist, 'app.js')),
  copyFile(join(src, 'config.json'), join(dist, 'config.json')),
  copyFile(join(src, 'favicon.svg'), join(dist, 'favicon.svg')),
  copyFile(join(src, 'og.png'), join(dist, 'og.png'))
]);
const media = config.media || {};
const supportedIcons = new Set(['github', 'facebook', 'discord', 'instagram']);
const localAssets = new Set([
  ...(media.images || []).map((item) => item.src),
  media.audio?.fileUrl,
  ...config.links.map((item) => supportedIcons.has(item.icon) ? '/icons/' + item.icon + '.svg' : null)
].filter((value) => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.split('/').includes('..')).map((value) => value.replace(/^\//, '')));
await Promise.all([...localAssets].map(async (asset) => {
  const destination = join(dist, asset);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(join(src, asset), destination);
}));
await promisify(execFile)('tar', [
  '-czf', join(dist, 'developer-bio-link-termux.tar.gz'),
  '-C', root,
  'README.md', 'package.json', 'build.mjs', 'server.mjs', 'src'
]);
console.log('Đã tạo dist/ từ src/config.json.');
