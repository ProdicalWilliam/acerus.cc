const tabData = [
  { title: 'We Are Acerus', desc: 'Everything we do is in service of players. This continuous focus inspires the most meaningful and lasting game experiences.' },
  { title: 'We Are The Best', desc: 'Players deserve something better than good, the best. We care about our customers more than anyone in the community. We match the passion of those who see games as a meaningful life pursuit, because we do too with our colorbot.' },
  { title: 'We Dream & Deliver', desc: 'Our vision for the future is bold. We relentlessly work to surpass players\' expectations of what games can be.' },
  { title: 'We Are In for the Long Term', desc: 'There\'s something special about our lasting relationship with games. We have been working hard for over 3 years to deliver the best Colorbot on the market.' },
  { title: 'We are Everything', desc: 'We are the most unique Colorbot Ever. We have sold over 5,000+ subscriptions in the past few months around the world, creating unique experiences that exceed the sum of their parts.' }
];

const tabs = document.querySelectorAll('.htab');
const htitle = document.getElementById('htitle');
const hdesc = document.getElementById('hdesc');
const videos = document.querySelectorAll('.hero-video');
const panels = document.querySelectorAll('.values-panel');

let autoTimer;

function switchTab(i) {
  tabs.forEach(t => t.classList.remove('active'));
  tabs[i].classList.add('active');

  videos.forEach(v => {
    v.classList.remove('active');
    v.pause();
  });

  videos[i].classList.add('active');
  videos[i].play();

  htitle.style.opacity = '0';
  hdesc.style.opacity = '0';

  setTimeout(() => {
    htitle.textContent = tabData[i].title;
    hdesc.textContent = tabData[i].desc;
    htitle.style.opacity = '1';
    hdesc.style.opacity = '1';
  }, 180);

  panels.forEach(p => p.classList.remove('active'));
  panels[i].classList.add('active');
}

htitle.style.transition = 'opacity 0.2s';
hdesc.style.transition = 'opacity 0.2s';

tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => {
    clearInterval(autoTimer);
    switchTab(i);
    startAuto(i);
  });
});

function startAuto(start) {
  let cur = start;
  autoTimer = setInterval(() => {
    cur = (cur + 1) % 5;
    switchTab(cur);
  }, 10000);
}

startAuto(0);

// Video play button
document.querySelectorAll('.video-thumb').forEach((thumb) => {
  const playBtn = thumb.querySelector('.video-play');
  const iframe = thumb.querySelector('iframe');

  if (!playBtn || !iframe) return;

  playBtn.addEventListener('click', () => {
    const newIframe = document.createElement('iframe');
    newIframe.src = iframe.src + '?autoplay=1';
    newIframe.width = iframe.width;
    newIframe.height = iframe.height;
    newIframe.frameBorder = '0';
    newIframe.allowFullscreen = true;

    iframe.parentNode.replaceChild(newIframe, iframe);
    playBtn.style.display = 'none';
  });
});

(() => {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const TAU = Math.PI * 2;

  const POINT_COUNT = 18000; 
  const points = [];

  let w = 0, h = 0, dpr = 1;
  let cx = 0, cy = 0, radius = 0;
  let rotY = 0;
  const tiltX = 0.76;
  let t = 0;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
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

      points.push({
        x, y, z,
        isLand: score > 0.35,
        isCoast: score > 0.27 && score <= 0.35,
        isOcean: score <= 0.27 && Math.random() < 0.08, // Subtle ocean dots
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
    cx = w / 2; cy = h / 2;
    radius = Math.min(w, h) * 0.44;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    const sphere = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius * 1.1);
    sphere.addColorStop(0, 'rgba(255,255,255,0.07)');
    sphere.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sphere;
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, TAU); ctx.fill();

    const cosY = Math.cos(rotY); const sinY = Math.sin(rotY);
    const cosX = Math.cos(tiltX); const sinX = Math.sin(tiltX);

    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, TAU); ctx.clip();

    // Loop through points
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (!p.isLand && !p.isCoast && !p.isOcean) continue;

      // Rotation math
      let x1 = p.x, y1 = p.y * cosX - p.z * sinX, z1 = p.y * sinX + p.z * cosX;
      let vx = x1 * cosY + z1 * sinY, vy = y1, vz = -x1 * sinY + z1 * cosY;

      if (vz <= 0) continue;

      const depth = vz;
      const edge = smoothstep(0.0, 0.2, depth);
      const shimmer = 0.9 + 0.1 * Math.sin(t * 1.5 + p.seed);
      
      let alpha = p.isLand ? (0.4 + depth * 0.5) : (0.1 + depth * 0.15);
      if (p.northAmerica && p.isLand) alpha += 0.1 * Math.max(0, Math.sin(t * 2 + p.seed));
      
      const x2 = cx + vx * radius * (1 + vz * 0.05);
      const y2 = cy + vy * radius * (1 + vz * 0.05);

      ctx.fillStyle = `rgba(255,255,255,${alpha * edge * shimmer})`;
      
      // Draw circle
      const s = p.size * (0.8 + depth * 0.5);
      ctx.beginPath();
      ctx.arc(x2, y2, s, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
    
    // Subtle Rim light
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, TAU); ctx.stroke();

    rotY += 0.0035;
    t += 0.016;
    requestAnimationFrame(draw);
  }

  buildPoints();
  resize();
  draw();
  window.addEventListener('resize', resize);
})();

document.querySelectorAll('.game-item').forEach((item) => {
  const preview = item.querySelector('.game-preview');

  if (!preview) return;

  preview.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.game-item').forEach((other) => {
      other.classList.remove('open');
    });

    if (!isOpen) {
      item.classList.add('open');
    }
  });
});
