(function(){

  const cursorEl  = document.getElementById('r4t8y');
  const trailCanvas = document.getElementById('q9w3e');
  const ctx = trailCanvas.getContext('2d');

  let mouseX = -200, mouseY = -200;
  let lastX  = -200, lastY  = -200;
  const particles = [];

  function resizeCanvas(){
    trailCanvas.width  = window.innerWidth;
    trailCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorEl.style.left = mouseX + 'px';
    cursorEl.style.top  = mouseY + 'px';

    const dx  = mouseX - lastX;
    const dy  = mouseY - lastY;
    const spd = Math.sqrt(dx*dx + dy*dy);

    if (spd > 2.5) {
      const count = Math.min(Math.floor(spd / 5), 5);
      for (let i = 0; i < count; i++) {
        particles.push({
          x:    mouseX + (Math.random() - 0.5) * 8,
          y:    mouseY + (Math.random() - 0.5) * 8,
          vx:   (Math.random() - 0.5) * 1.6,
          vy:   (Math.random() - 0.5) * 1.6 - 0.5,
          life: 1,
          size: Math.random() * 2.8 + 1,
          hue:  78 + Math.random() * 44
        });
      }
      lastX = mouseX;
      lastY = mouseY;
    }
  });

  document.addEventListener('mouseleave', () => {
    mouseX = -200; mouseY = -200;
    cursorEl.style.left = '-200px';
    cursorEl.style.top  = '-200px';
  });

  function renderTrail(){
    ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

    for (let i = particles.length - 1; i >= 0; i--){
      const p = particles[i];
      p.x    += p.vx;
      p.y    += p.vy;
      p.vy   += 0.035;
      p.life -= 0.03;
      p.size *= 0.975;

      if (p.life <= 0 || p.size < 0.25){
        particles.splice(i, 1);
        continue;
      }

      const a   = p.life * 0.8;
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.8);
      grd.addColorStop(0,   `hsla(${p.hue}, 95%, 65%, ${a})`);
      grd.addColorStop(0.4, `hsla(${p.hue}, 90%, 55%, ${a * 0.55})`);
      grd.addColorStop(1,   `hsla(${p.hue}, 85%, 45%, 0)`);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.8, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 90%, ${a})`;
      ctx.fill();
    }

    if (particles.length > 220) particles.splice(0, particles.length - 220);
    requestAnimationFrame(renderTrail);
  }
  renderTrail();

  const revealEls = document.querySelectorAll('.reveal');
  const observer  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('in');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => observer.observe(el));

  function checkVisible(){
    revealEls.forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in');
    });
  }
  setTimeout(checkVisible, 80);

  const tickerEl = document.getElementById('p5u1i');
  if (tickerEl){
const items = [
  'Valorant',
  'Apex Legends',
  'FragPunk',
  'Strinova',
  'Overwatch 2',

  'Always Updated',
  'Streamproof',
  'Fully External',
  'Instant Delivery',
  'Optimized Performance',
  'Stable Architecture',
  'Precision Tuning',
  'Advanced Protection',
  'Dedicated Support',
  'Custom Builds'
];
    tickerEl.innerHTML = [...items,...items]
      .map(i => `<span class="ti"><span>·</span>${i}</span>`)
      .join('');
  }

  const menuWrap = document.getElementById('menuWrap');
  if (menuWrap) setTimeout(() => menuWrap.classList.add('in'), 200);

  function runHeroTypewriter(){
    const emEl    = document.getElementById('tw-em');
    const slideEl = document.getElementById('tw-slide');
    const subEl   = document.getElementById('hero-sub-text');
    const btnsEl  = document.querySelector('.hero-btns');
    const statsEl = document.querySelector('.hero-stats');

    if (!emEl || !slideEl) return;

    const word   = 'precision.';
    let   idx    = 0;
    let   cursor = document.createElement('span');
    cursor.className = 'tw-cursor';
    emEl.appendChild(cursor);

    function typeChar(){
      if (idx < word.length){
        emEl.insertBefore(document.createTextNode(word[idx]), cursor);
        idx++;
        setTimeout(typeChar, 68 + Math.random() * 40);
      } else {
        setTimeout(() => {
          cursor.remove();
          slideEl.classList.add('in');
          setTimeout(() => {
            if (subEl)   subEl.classList.add('in');
            if (btnsEl)  btnsEl.classList.add('in');
            if (statsEl) statsEl.classList.add('in');
          }, 400);
        }, 180);
      }
    }

    setTimeout(typeChar, 520);
  }

  runHeroTypewriter();

  document.querySelectorAll('[data-wtoggle]').forEach(t => {
    t.addEventListener('click', () => t.classList.toggle('on'));
  });

  document.querySelectorAll('[data-bone]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-bone]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  const wFmt = sl => {
    const v   = Number(sl.value);
    const fmt = sl.dataset.format || 'int';
    if (fmt === 'smooth')   return (v / 2).toFixed(1);
    if (fmt === 'sens')     return (v / 100).toFixed(2);
    if (fmt === 'humanize') return (v / 70).toFixed(1);
    return String(Math.round(v));
  };

  document.querySelectorAll('[data-wslider]').forEach(sl => {
    const valEl = sl.parentElement.querySelector('.w-slider-value');
    const update = () => {
      const mn  = Number(sl.min  || 0);
      const mx  = Number(sl.max  || 100);
      const val = Number(sl.value);
      const pct = ((val - mn) / (mx - mn)) * 100;
      sl.style.setProperty('--fill', pct + '%');
      if (valEl) valEl.textContent = wFmt(sl);
    };
    sl.addEventListener('input', update);
    update();
  });

  const masterToggle = document.getElementById('wMasterToggle');
  if (masterToggle){
    masterToggle.addEventListener('click', () => {
      masterToggle.classList.toggle('on');
      const lbl = masterToggle.querySelector('.wmt-label');
      if (lbl) lbl.textContent = masterToggle.classList.contains('on') ? 'ON' : 'OFF';
    });
  }

})();