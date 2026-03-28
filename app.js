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

function animateOnScroll() {
  const elements = document.querySelectorAll('.animate-slide');

  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const triggerPoint = window.innerHeight * 0.85;

    if (rect.top < triggerPoint && !el.classList.contains('active')) {
      el.classList.add('active'); // Animate once
    }
  });
}

// Run on scroll and on load
window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

function initScatter() {
  // Only scatter the h3, not the paragraph
  document.querySelectorAll('h3.scatter-target').forEach(el => {
    const text = el.innerText;
    el.innerHTML = '';

    [...text].forEach(char => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.classList.add('scatter-letter');

      const rx = (Math.random() - 0.5) * 600;
      const ry = (Math.random() - 0.5) * 400;
      const rot = (Math.random() - 0.5) * 180;
      const scale = 0.4 + Math.random() * 1.2;

      span.style.setProperty('--rx', `${rx}px`);
      span.style.setProperty('--ry', `${ry}px`);
      span.style.setProperty('--rot', `${rot}deg`);
      span.style.setProperty('--scale', scale);
      span.style.transitionDelay = `${Math.random() * 0.5}s`;

      el.appendChild(span);
    });
  });

  // Paragraph gets a simple fade-up instead
  document.querySelectorAll('p.scatter-target').forEach(el => {
    el.classList.add('fade-up-target');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate heading letters
        entry.target.querySelectorAll('.scatter-letter').forEach(span => {
          span.classList.add('scatter-in');
        });
        // Animate paragraph
        const para = entry.target.closest('.video-text')?.querySelector('.fade-up-target');
        if (para) para.classList.add('fade-up-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('h3.scatter-target').forEach(el => observer.observe(el));
}

initScatter();

// ── Unmute overlay ──
const unmuteOverlay = document.getElementById('unmute-overlay');
const unmuteBtn = document.getElementById('unmute-btn');
const player = document.getElementById('streamable-player');

if (unmuteBtn && unmuteOverlay && player) {
  unmuteBtn.addEventListener('click', () => {
    // Reload iframe without muted param so audio plays
    const src = player.src.replace('&muted=1', '').replace('muted=1&', '');
    player.src = src;
    unmuteOverlay.classList.add('hidden');
  });
}

(() => {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  const TAU = Math.PI * 2;
  const POINT_COUNT = 30000; // was 20000
  const points = [];

  let w = 0, h = 0, cx = 0, cy = 0, radius = 0;
  let rotY = 0, t = 0;
  const tiltX = 0.76;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // cap dpr

  // Throttle to ~40fps instead of 60
  let lastFrame = 0;
  const FPS_INTERVAL = 1000 / 40;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smoothstep(e0, e1, x) {
    const v = clamp((x - e0) / (e1 - e0), 0, 1);
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
    for (let i = 0; i < POINT_COUNT; i++) {
      const k = i + 0.5;
      const y = 1 - (k / POINT_COUNT) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const phi = TAU * k * 0.61803398875;
      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;
      const lat = Math.asin(y) * 180 / Math.PI;
      const lon = Math.atan2(z, x) * 180 / Math.PI;
      const score = landScore(lat, lon);

      // Pre-filter: skip ocean points mostly
      const isLand = score > 0.35;
      const isCoast = score > 0.27 && score <= 0.35;
      const isOcean = score <= 0.27 && Math.random() < 0.04; // was 0.08

      if (!isLand && !isCoast && !isOcean) continue; // don't even store it

      points.push({
        x, y, z,
        isLand, isCoast, isOcean,
        seed: Math.random() * TAU,
        size: isLand ? (0.8 + Math.random() * 0.6) : (0.4 + Math.random() * 0.3)
      });
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w / 2;
    cy = h / 2;
    radius = Math.min(w, h) * 0.44;
  }

  function draw(ts) {
    requestAnimationFrame(draw);

    // Throttle fps
    if (ts - lastFrame < FPS_INTERVAL) return;
    lastFrame = ts;

    ctx.clearRect(0, 0, w, h);

    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(tiltX);
    const sinX = Math.sin(tiltX);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.clip();

    // Batch all dots into ONE path per alpha bucket instead of individual arcs
    // Group by rough alpha to minimize fillStyle changes
    const buckets = {};

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const y1 = p.y * cosX - p.z * sinX;
      const z1 = p.y * sinX + p.z * cosX;
      const vx = p.x * cosY + z1 * sinY;
      const vy = y1;
      const vz = -p.x * sinY + z1 * cosY;

      if (vz <= 0) continue;

      const edge = smoothstep(0.0, 0.2, vz);
      const shimmer = 0.9 + 0.1 * Math.sin(t * 1.5 + p.seed);
      const alpha = p.isLand
        ? (0.4 + vz * 0.5) * edge * shimmer
        : (0.1 + vz * 0.15) * edge * shimmer;

      // Round alpha to nearest 0.05 to batch draw calls
      const key = Math.round(alpha / 0.05) * 0.05;
      if (!buckets[key]) buckets[key] = [];

      const x2 = cx + vx * radius;
      const y2 = cy + vy * radius;
      buckets[key].push(x2, y2, p.size);
    }

    // Draw each bucket with a single fillStyle + beginPath
    for (const [alpha, dots] of Object.entries(buckets)) {
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      for (let i = 0; i < dots.length; i += 3) {
        ctx.moveTo(dots[i] + dots[i + 2], dots[i + 1]);
        ctx.arc(dots[i], dots[i + 1], dots[i + 2], 0, TAU);
      }
      ctx.fill();
    }

    ctx.restore();

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.stroke();

    rotY += 0.003;
    t += 0.016;
  }

  buildPoints();
  resize();
  requestAnimationFrame(draw);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 100);
  });

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) requestAnimationFrame(draw);
  });
})();

