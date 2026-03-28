const videoFrame = document.getElementById('video-frame');
const playBtn = document.getElementById('play-btn');

if (playBtn && videoFrame) {
  playBtn.addEventListener('click', () => {
    const newIframe = document.createElement('iframe');
    const baseSrc = videoFrame.getAttribute('src') || '';
    newIframe.src = baseSrc.includes('?') ? `${baseSrc}&autoplay=1` : `${baseSrc}?autoplay=1`;
    newIframe.width = videoFrame.width;
    newIframe.height = videoFrame.height;
    newIframe.allowFullscreen = true;
    newIframe.setAttribute('frameborder', '0');
    newIframe.style.pointerEvents = 'none';
    videoFrame.parentNode.replaceChild(newIframe, videoFrame);
    playBtn.style.display = 'none';
  });
}

const heroTitle = document.querySelector('.hero-title');

if (heroTitle) {
  const text = heroTitle.textContent.trim();
  const words = text.split(/\s+/);

  heroTitle.innerHTML = words
    .map((word) => `<span class="hero-title-word">${word}</span>`)
    .join(' ');
}

const rail = document.querySelector('.side-rail');
if (rail) {
  rail.classList.add('intro');
  setTimeout(() => {
    rail.classList.remove('intro');
  }, 0);
}

// Lock down every image on the page without changing layout
function lockImage(img) {
  if (!img || img.dataset.imageLocked === '1') return;

  img.dataset.imageLocked = '1';
  img.setAttribute('draggable', 'false');
  img.addEventListener('dragstart', (e) => e.preventDefault());
  img.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Lock existing images
document.querySelectorAll('img').forEach(lockImage);

// Lock future images too
const imageObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== 1) return;

      if (node.tagName === 'IMG') {
        lockImage(node);
      } else {
        node.querySelectorAll?.('img').forEach(lockImage);
      }
    });
  }
});

imageObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

// Block right-click on any image, even inside wrappers
document.addEventListener(
  'contextmenu',
  (e) => {
    if (e.target.closest && e.target.closest('img')) {
      e.preventDefault();
    }
  },
  true
);

document.querySelectorAll('.game-item').forEach((item) => {
  const preview = item.querySelector('.game-preview');
  if (!preview) return;

  preview.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.game-item').forEach((other) => other.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

(() => {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const TAU = Math.PI * 2;
  const POINT_COUNT = 10000;
  const points = [];

  let w = 0;
  let h = 0;
  let dpr = 1;
  let cx = 0;
  let cy = 0;
  let radius = 0;
  let rotY = 0;
  const tiltX = 0.76;
  let t = 0;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function smoothstep(edge0, edge1, x) {
    const v = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return v * v * (3 - 2 * v);
  }

  function wrapLonDiff(a, b) {
    let d = a - b;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return d;
  }

  function blob(lat, lon, clat, clon, latR, lonR) {
    const dy = (lat - clat) / latR;
    const dx = wrapLonDiff(lon, clon) / lonR;
    return Math.exp(-(dx * dx + dy * dy));
  }

  function landScore(lat, lon) {
    let s = 0;
    s = Math.max(s, blob(lat, lon, 46, -103, 18, 30));
    s = Math.max(s, blob(lat, lon, 24, -102, 10, 16));
    s = Math.max(s, blob(lat, lon, -16, -60, 23, 14));
    s = Math.max(s, blob(lat, lon, 52, 15, 12, 18));
    s = Math.max(s, blob(lat, lon, 8, 20, 28, 18));
    s = Math.max(s, blob(lat, lon, 39, 92, 20, 42));
    s = Math.max(s, blob(lat, lon, 20, 112, 12, 16));
    s = Math.max(s, blob(lat, lon, -25, 134, 10, 14));
    s = Math.max(s, blob(lat, lon, 73, -42, 7, 11));
    return s;
  }

  function buildPoints() {
    points.length = 0;
    for (let i = 0; i < POINT_COUNT; i += 1) {
      const k = i + 0.5;
      const y = 1 - (k / POINT_COUNT) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const phi = TAU * k * 0.61803398875;
      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;
      const lat = Math.asin(y) * 180 / Math.PI;
      const lon = Math.atan2(z, x) * 180 / Math.PI;
      const score = landScore(lat, lon);

      points.push({
        x,
        y,
        z,
        isLand: score > 0.35,
        isCoast: score > 0.27 && score <= 0.35,
        isOcean: score <= 0.27 && Math.random() < 0.08,
        northAmerica: lat > 18 && lat < 62 && lon > -130 && lon < -60,
        seed: Math.random() * TAU,
        size: score > 0.35 ? (0.3 + Math.random() * 0.4) : (0.15 + Math.random() * 0.2)
      });
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.max(1, window.devicePixelRatio || 1);
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w / 2;
    cy = h / 2;
    radius = Math.min(w, h) * 0.44;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    const sphere = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius * 1.1);
    sphere.addColorStop(0, 'rgba(255,255,255,0.07)');
    sphere.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sphere;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.fill();

    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(tiltX);
    const sinX = Math.sin(tiltX);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.clip();

    for (let i = 0; i < points.length; i += 1) {
      const p = points[i];
      if (!p.isLand && !p.isCoast && !p.isOcean) continue;

      const y1 = p.y * cosX - p.z * sinX;
      const z1 = p.y * sinX + p.z * cosX;
      const vx = p.x * cosY + z1 * sinY;
      const vy = y1;
      const vz = -p.x * sinY + z1 * cosY;

      if (vz <= 0) continue;

      const depth = vz;
      const edge = smoothstep(0.0, 0.2, depth);
      const shimmer = 0.9 + 0.1 * Math.sin(t * 1.5 + p.seed);
      let alpha = p.isLand ? (0.4 + depth * 0.5) : (0.1 + depth * 0.15);

      if (p.northAmerica && p.isLand) {
        alpha += 0.1 * Math.max(0, Math.sin(t * 2 + p.seed));
      }

      const x2 = cx + vx * radius * (1 + vz * 0.05);
      const y2 = cy + vy * radius * (1 + vz * 0.05);

      ctx.fillStyle = `rgba(255,255,255,${alpha * edge * shimmer})`;
      const s = p.size * (0.8 + depth * 0.5);
      ctx.beginPath();
      ctx.arc(x2, y2, s, 0, TAU);
      ctx.fill();
    }

    ctx.restore();

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.stroke();

    rotY += 0.0035;
    t += 0.016;
    requestAnimationFrame(draw);
  }

  buildPoints();
  resize();
  draw();
  window.addEventListener('resize', resize);
})();


