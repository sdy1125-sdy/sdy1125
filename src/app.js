const $ = (selector) => document.querySelector(selector);
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const safeUrl = (value) => {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
};
const assetUrl = (value) => {
  if (typeof value !== 'string') return null;
  if (value.startsWith('/') && !value.startsWith('//') && !value.split('/').includes('..')) return new URL(value.slice(1), document.baseURI).href;
  return safeUrl(value);
};
const formatTime = (seconds) => Number.isFinite(seconds) ? Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0') : '0:00';
const arrowIcon = () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('ui-icon');
  use.setAttribute('href', '#icon-arrow');
  svg.append(use);
  return svg;
};

function renderLinks(links) {
  const list = $('#social-list');
  const icons = { github: 'icons/github.svg', facebook: 'icons/facebook.svg', discord: 'icons/discord.svg', instagram: 'icons/instagram.svg' };
  const active = links.filter((item) => safeUrl(item.url));
  $('#link-count').textContent = String(active.length).padStart(2, '0');
  for (const item of active) {
    const link = document.createElement('a');
    link.className = 'social-link';
    link.dataset.network = icons[item.icon] ? item.icon : 'other';
    link.href = safeUrl(item.url);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', item.label + (item.handle ? ', ' + item.handle : '') + ', mở trong tab mới');
    const mark = document.createElement('span');
    mark.className = 'social-icon';
    mark.setAttribute('aria-hidden', 'true');
    if (icons[item.icon]) mark.style.setProperty('--icon', 'url("' + new URL(icons[item.icon], document.baseURI).href + '")');
    else mark.append(arrowIcon());
    const name = document.createElement('span');
    name.className = 'social-name';
    name.textContent = item.label;
    const arrow = document.createElement('span');
    arrow.className = 'social-arrow';
    arrow.append(arrowIcon());
    arrow.setAttribute('aria-hidden', 'true');
    link.append(mark, name, arrow);
    list.append(link);
  }
  if (!active.length) {
    const note = document.createElement('p');
    note.textContent = 'Liên kết đang được cập nhật.';
    list.append(note);
  }
}

function setupMusic(media) {
  const url = assetUrl(media.audio?.fileUrl);
  const button = $('#play-button');
  const music = $('#music');
  const status = $('#music-status');
  const title = $('#music-title');
  const progress = $('#track-progress');
  const timer = $('#track-time');
  title.textContent = media.audio?.title || 'Âm nhạc';
  if (!url) {
    button.disabled = true;
    status.textContent = 'Chưa có tệp nhạc';
    return null;
  }
  const player = $('#background-audio');
  if (player.src !== url) player.src = url;
  player.loop = true;
  player.preload = 'auto';
  player.autoplay = true;
  player.volume = .78;
  let userPaused = false;
  let playFailed = false;
  let mediaError = false;
  const update = () => {
    const playing = !player.paused;
    music.dataset.playing = String(playing);
    music.dataset.awaiting = String(playFailed && !playing);
    button.setAttribute('aria-label', playing ? 'Tạm dừng nhạc' : 'Bật nhạc');
    status.textContent = mediaError ? 'Không phát được tệp nhạc' : playing ? 'Đang phát' : playFailed ? 'Chạm để bật nhạc' : userPaused ? 'Đã tạm dừng' : 'Sẵn sàng';
  };
  const play = async () => {
    if (mediaError || !player.paused) return;
    try {
      await player.play();
      playFailed = false;
      update();
    } catch (error) {
      playFailed = error.name === 'NotAllowedError';
      if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') mediaError = true;
      update();
    }
  };
  button.addEventListener('click', () => {
    if (player.paused) { userPaused = false; void play(); }
    else { userPaused = true; player.pause(); update(); }
  });
  player.addEventListener('play', update);
  player.addEventListener('playing', () => { playFailed = false; update(); });
  player.addEventListener('pause', update);
  player.addEventListener('timeupdate', () => {
    const duration = player.duration;
    progress.value = Number.isFinite(duration) && duration > 0 ? String((player.currentTime / duration) * 100) : '0';
    timer.textContent = formatTime(player.currentTime);
  });
  player.addEventListener('loadedmetadata', () => { progress.disabled = false; });
  player.addEventListener('error', () => {
    mediaError = true;
    button.disabled = true;
    update();
  });
  progress.addEventListener('input', () => {
    if (Number.isFinite(player.duration)) player.currentTime = Number(progress.value) / 100 * player.duration;
  });
  const retry = (event) => {
    if (userPaused || !player.paused || button.contains(event.target)) return;
    void play();
  };
  document.addEventListener('touchend', retry, { capture: true, passive: true });
  document.addEventListener('click', retry, true);
  document.addEventListener('keydown', retry, true);
  addEventListener('pageshow', () => { if (!userPaused) void play(); });
  update();
  void play();
  return { player, toggle: () => button.click() };
}

function setupRain() {
  const canvas = $('#rain-canvas');
  const scene = $('.scene');
  const context = canvas.getContext('2d', { alpha: true });
  if (!context || motionPreference.matches) return;
  let width = 0;
  let height = 0;
  let drops = [];
  let raf = 0;
  const resize = () => {
    const bounds = scene.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    drops = Array.from({ length: Math.min(110, Math.floor(width / 10)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 10 + Math.random() * 25,
      speed: 2.2 + Math.random() * 3.8,
      opacity: .09 + Math.random() * .2
    }));
  };
  const draw = () => {
    if (document.hidden || motionPreference.matches) return;
    context.clearRect(0, 0, width, height);
    for (const drop of drops) {
      context.beginPath();
      context.lineWidth = .55;
      context.strokeStyle = 'rgba(197,223,255,' + drop.opacity + ')';
      context.moveTo(drop.x, drop.y);
      context.lineTo(drop.x - drop.length * .18, drop.y + drop.length);
      context.stroke();
      drop.x -= drop.speed * .18;
      drop.y += drop.speed;
      if (drop.y > height + 40) { drop.y = -40; drop.x = Math.random() * width; }
    }
    raf = requestAnimationFrame(draw);
  };
  const restart = () => {
    cancelAnimationFrame(raf);
    if (!document.hidden && !motionPreference.matches) draw();
    else context.clearRect(0, 0, width, height);
  };
  resize();
  draw();
  addEventListener('resize', () => { resize(); restart(); }, { passive: true });
  document.addEventListener('visibilitychange', restart);
  motionPreference.addEventListener('change', restart);
}

function setupParallax() {
  if (motionPreference.matches || !matchMedia('(pointer: fine)').matches) return;
  const host = $('#experience');
  let raf = 0;
  host.addEventListener('pointermove', (event) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const x = (event.clientX / innerWidth - .5) * -12;
      const y = (event.clientY / innerHeight - .5) * -10;
      host.style.setProperty('--px', x.toFixed(1) + 'px');
      host.style.setProperty('--py', y.toFixed(1) + 'px');
    });
  }, { passive: true });
  host.addEventListener('pointerleave', () => {
    host.style.setProperty('--px', '0px');
    host.style.setProperty('--py', '0px');
  });
}

function setupCommands(config, music) {
  const dialog = $('#command-dialog');
  const toggle = $('#command-toggle');
  const close = $('#command-close');
  const input = $('#command-input');
  const output = $('#command-output');
  let previousFocus = null;
  const open = () => {
    previousFocus = document.activeElement;
    dialog.hidden = false;
    input.focus();
  };
  const dismiss = () => {
    dialog.hidden = true;
    previousFocus?.focus();
  };
  toggle.addEventListener('click', open);
  close.addEventListener('click', dismiss);
  dialog.addEventListener('pointerdown', (event) => { if (event.target === dialog) dismiss(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && dialog.hidden && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      event.preventDefault(); open();
    } else if (event.key === 'Escape' && !dialog.hidden) dismiss();
    else if (event.key === 'Tab' && !dialog.hidden) {
      const focusables = [close, input, ...dialog.querySelectorAll('.command-form button, .command-hints button')];
      const next = event.shiftKey ? focusables[focusables.length - 1] : focusables[0];
      if (event.shiftKey && document.activeElement === focusables[0]) { event.preventDefault(); next.focus(); }
      else if (!event.shiftKey && document.activeElement === focusables[focusables.length - 1]) { event.preventDefault(); next.focus(); }
    }
  });
  const print = (message, isError = false) => {
    const row = document.createElement('p');
    row.textContent = message;
    if (isError) row.className = 'error';
    output.append(row);
    output.scrollTop = output.scrollHeight;
  };
  const run = (raw) => {
    const command = raw.trim().toLowerCase();
    if (!command) return;
    if (command === 'clear') { output.replaceChildren(); return; }
    print('> ' + command);
    if (command === 'help') print('help · whoami · links · contact · music · about · projects · clear');
    else if (command === 'whoami' || command === 'about') print(config.name + ' — ' + config.role + '. ' + config.intro);
    else if (command === 'links' || command === 'contact') print('GitHub · Facebook · Discord · Instagram. Chọn một liên kết ngay trên trang.');
    else if (command === 'music') {
      if (music) { music.toggle(); print('Đã đổi trạng thái nhạc.'); }
      else print('Chưa có tệp nhạc.');
    } else if (command === 'projects') print('Chưa có dự án được thêm.');
    else print('Không có lệnh này. Gõ help để xem danh sách.', true);
  };
  $('#command-form').addEventListener('submit', (event) => {
    event.preventDefault();
    run(input.value);
    input.value = '';
  });
  document.querySelectorAll('[data-command]').forEach((button) => button.addEventListener('click', () => {
    run(button.dataset.command);
    input.focus();
  }));
}

async function init() {
  try {
    const response = await fetch(new URL('config.json', document.baseURI));
    if (!response.ok) throw new Error('Không tải được cấu hình.');
    const config = await response.json();
    $('#person-name').textContent = config.name || 'Tên của bạn';
    $('#person-role').textContent = config.role || 'Developer';
    $('#person-intro').textContent = config.intro || '';
    const photo = assetUrl(config.media?.images?.[0]?.src);
    if (photo) $('#portrait').src = photo;
    renderLinks(config.links || []);
    const music = setupMusic(config.media || {});
    setupCommands(config, music);
    setupRain();
    setupParallax();
  } catch {
    $('#music-status').textContent = 'Không tải được nội dung. Hãy tải lại trang.';
  }
}
init();

