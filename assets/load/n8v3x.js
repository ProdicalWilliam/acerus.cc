(function(){

  const m3 = document.getElementById('r4t8y');
  const c9 = document.getElementById('q9w3e');
  const x8 = c9.getContext('2d');

  let mx = -200, my = -200;
  let lx = -200, ly = -200;
  const p2 = [];
  const k7 = 28;

  c9.width  = window.innerWidth;
  c9.height = window.innerHeight;

  window.addEventListener('resize', () => {
    c9.width  = window.innerWidth;
    c9.height = window.innerHeight;
  });

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    m3.style.left = mx + 'px';
    m3.style.top  = my + 'px';

    const dx = mx - lx;
    const dy = my - ly;
    const spd = Math.sqrt(dx*dx + dy*dy);

    if (spd > 2) {
      const count = Math.min(Math.floor(spd / 6), 4);
      for (let i = 0; i < count; i++) {
        p2.push({
          x:    mx + (Math.random() - 0.5) * 10,
          y:    my + (Math.random() - 0.5) * 10,
          vx:   (Math.random() - 0.5) * 1.8,
          vy:   (Math.random() - 0.5) * 1.8 - 0.6,
          life: 1,
          size: Math.random() * 3 + 1.2,
          hue:  80 + Math.random() * 40
        });
      }
      lx = mx;
      ly = my;
    }
  });

  document.addEventListener('mouseleave', () => {
    mx = -200; my = -200;
    m3.style.left = '-200px';
    m3.style.top  = '-200px';
  });

  function v6(){
    x8.clearRect(0, 0, c9.width, c9.height);

    for (let i = p2.length - 1; i >= 0; i--) {
      const p = p2[i];
      p.x    += p.vx;
      p.y    += p.vy;
      p.vy   += 0.04;
      p.life -= 0.032;
      p.size *= 0.97;

      if (p.life <= 0 || p.size < 0.3) {
        p2.splice(i, 1);
        continue;
      }

      const alpha = p.life * 0.85;
      const grd = x8.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
      grd.addColorStop(0, `hsla(${p.hue}, 95%, 65%, ${alpha})`);
      grd.addColorStop(0.4, `hsla(${p.hue}, 90%, 55%, ${alpha * 0.6})`);
      grd.addColorStop(1, `hsla(${p.hue}, 85%, 45%, 0)`);

      x8.beginPath();
      x8.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
      x8.fillStyle = grd;
      x8.fill();

      x8.beginPath();
      x8.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
      x8.fillStyle = `hsla(${p.hue}, 100%, 88%, ${alpha})`;
      x8.fill();
    }

    if (p2.length > k7 * 8) p2.splice(0, p2.length - k7 * 8);

    requestAnimationFrame(v6);
  }

  v6();

  const z1 = document.querySelectorAll('.reveal');
  const q4 = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        q4.unobserve(e.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -40px 0px' });
  z1.forEach(el => q4.observe(el));

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      z1.forEach(el => {
        if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in');
      });
    }, 60);
  });

  setTimeout(() => {
    z1.forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in');
    });
  }, 120);

  const f2 = document.getElementById('p5u1i');
  if (f2) {
    const t9 = [
      'Unique Builds','Advanced Protection','Peak Performance',
      'Instant Delivery','Precision Tuning','Dedicated Support',
      'Custom Generation','Optimized Core','Stable Architecture',
      'Always Updated','Streamproof','Fully External'
    ];
    f2.innerHTML = [...t9, ...t9].map(i => `<span class="ti"><span>·</span>${i}</span>`).join('');
  }

  const b1 = document.getElementById('fov-canvas');
  const b2 = b1 ? b1.getContext('2d') : null;

  const s1 = document.getElementById('fov-slider');
  const s2 = document.getElementById('smooth-slider');
  const s3 = document.getElementById('delay-slider');
  const s4 = document.getElementById('bone-slider');

  const v1 = document.getElementById('fov-val');
  const v2 = document.getElementById('smooth-val');
  const v3 = document.getElementById('delay-val');
  const v4 = document.getElementById('bone-val');

  const h1 = document.getElementById('hud-fov');
  const h2 = document.getElementById('hud-smooth');
  const h3 = document.getElementById('hud-delay');
  const h4 = document.getElementById('hud-bone');

  const bL = ['Head','Neck','Body'];
  let aF, dA = 0;

  function rC(){
    if (!b1) return;
    const r = b1.parentElement.getBoundingClientRect();
    b1.width  = r.width;
    b1.height = r.height;
  }

  function dF(){
    if (!b2 || !b1) return;
    cancelAnimationFrame(aF);

    const fv = parseInt(s1.value);
    const sm = parseInt(s2.value);
    const dl = parseInt(s3.value);
    const bn = parseInt(s4.value);

    const W  = b1.width;
    const H  = b1.height;
    const cx = W / 2;
    const cy = H / 2;

    const rad  = (fv / 200) * (Math.min(W,H) * 0.42);
    const op   = 0.18 + (sm / 100) * 0.22;
    const spd  = 0.004 + (1 - dl / 100) * 0.018;

    b2.clearRect(0, 0, W, H);

    const g1 = b2.createRadialGradient(cx, cy, rad * 0.3, cx, cy, rad * 1.1);
    g1.addColorStop(0, 'rgba(200,245,68,0.03)');
    g1.addColorStop(1, 'rgba(200,245,68,0)');
    b2.beginPath();
    b2.arc(cx, cy, rad * 1.1, 0, Math.PI * 2);
    b2.fillStyle = g1;
    b2.fill();

    b2.beginPath();
    b2.arc(cx, cy, rad, 0, Math.PI * 2);
    b2.strokeStyle = `rgba(200,245,68,${op})`;
    b2.lineWidth = 1.5;
    b2.setLineDash([6,4]);
    b2.lineDashOffset = -dA * (rad * 0.5);
    b2.stroke();
    b2.setLineDash([]);

    b2.beginPath();
    b2.arc(cx, cy, rad, 0, Math.PI * 2);
    b2.strokeStyle = 'rgba(200,245,68,0.06)';
    b2.lineWidth = 8;
    b2.stroke();

    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 + dA * 0.3;
      b2.beginPath();
      b2.moveTo(cx + Math.cos(ang) * (rad - 6), cy + Math.sin(ang) * (rad - 6));
      b2.lineTo(cx + Math.cos(ang) * (rad + 6), cy + Math.sin(ang) * (rad + 6));
      b2.strokeStyle = `rgba(200,245,68,${op * 0.7})`;
      b2.lineWidth = 1;
      b2.stroke();
    }

    const dR  = 3 + (sm / 100) * 3;
    const dX  = cx + Math.cos(dA) * rad;
    const dY  = cy + Math.sin(dA) * rad;
    const dG  = b2.createRadialGradient(dX, dY, 0, dX, dY, dR * 4);
    dG.addColorStop(0, 'rgba(200,245,68,0.5)');
    dG.addColorStop(1, 'rgba(200,245,68,0)');
    b2.beginPath();
    b2.arc(dX, dY, dR * 4, 0, Math.PI * 2);
    b2.fillStyle = dG;
    b2.fill();

    b2.beginPath();
    b2.arc(dX, dY, dR, 0, Math.PI * 2);
    b2.fillStyle = 'rgba(200,245,68,0.95)';
    b2.fill();

    [0.25, 0.55].forEach(f => {
      b2.beginPath();
      b2.arc(cx, cy, rad * f, 0, Math.PI * 2);
      b2.strokeStyle = 'rgba(200,245,68,0.04)';
      b2.lineWidth = 1;
      b2.stroke();
    });

    if (bn === 0) {
      b2.beginPath();
      b2.arc(cx, cy - rad * 0.18, 5, 0, Math.PI * 2);
      b2.strokeStyle = 'rgba(200,245,68,0.35)';
      b2.lineWidth = 1.2;
      b2.stroke();
    } else if (bn === 1) {
      b2.beginPath();
      b2.moveTo(cx, cy - rad * 0.1);
      b2.lineTo(cx, cy + rad * 0.1);
      b2.strokeStyle = 'rgba(200,245,68,0.3)';
      b2.lineWidth = 1.5;
      b2.stroke();
    } else {
      b2.beginPath();
      b2.rect(cx - 8, cy - 10, 16, 20);
      b2.strokeStyle = 'rgba(200,245,68,0.25)';
      b2.lineWidth = 1.2;
      b2.stroke();
    }

    dA += spd;
    aF = requestAnimationFrame(dF);
  }

  function uL(){
    if (!s1) return;
    const bLabel = bL[parseInt(s4.value)];
    if (v1) v1.textContent = s1.value;
    if (v2) v2.textContent = s2.value;
    if (v3) v3.textContent = s3.value;
    if (v4) v4.textContent = bLabel;
    if (h1) h1.textContent = s1.value;
    if (h2) h2.textContent = s2.value;
    if (h3) h3.textContent = s3.value + 'ms';
    if (h4) h4.textContent = bLabel;
  }

  if (s1) {
    [s1, s2, s3, s4].forEach(s => s.addEventListener('input', uL));
  }

  window.addEventListener('resize', rC);

  window.addEventListener('load', () => {
    rC();
    uL();
    dF();
  });

  document.addEventListener('DOMContentLoaded', () => {
    rC();
    uL();
    if (b2) dF();
  });

  document.querySelectorAll('[data-wtoggle]').forEach(t => {
    t.addEventListener('click', () => t.classList.toggle('on'));
  });

  const wFmt = s => {
    const v   = Number(s.value);
    const fmt = s.dataset.format || 'int';
    if (fmt === 'smooth')    return (v / 2).toFixed(1);
    if (fmt === 'sens')      return (v / 100).toFixed(2);
    if (fmt === 'humanize')  return (v / 70).toFixed(1);
    return String(Math.round(v));
  };

  document.querySelectorAll('[data-wslider]').forEach(sl => {
    const vEl = sl.parentElement.querySelector('.w-slider-value');
    const uF  = () => {
      const mn  = Number(sl.min  || 0);
      const mx2 = Number(sl.max  || 100);
      const vl  = Number(sl.value);
      const pct = ((vl - mn) / (mx2 - mn)) * 100;
      sl.style.setProperty('--fill', pct + '%');
    };
    const uV = () => { if (vEl) vEl.textContent = wFmt(sl); };
    sl.addEventListener('input', () => { uF(); uV(); });
    uF();
    uV();
  });

})();