/* ══════════════════════════════════════════════════════════════
   $TOAD — CANAL 88
   ══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   CONFIG — edit these four values and the whole site updates.
   ⚠ ALWAYS re-verify the contract address before you deploy.
   ───────────────────────────────────────────────────────────── */
const CONFIG = {
  ca:        'A13oRB9FFaiUjfi6LdCg6p9ka1u8SfGkUFs4SKvPpump',
  x:         'https://x.com/eltoadpepe',
  community: 'https://x.com/i/communities/2030839209980989725',
};
CONFIG.buy   = CONFIG.ca ? `https://pump.fun/coin/${CONFIG.ca}`            : 'https://pump.fun';
CONFIG.chart = CONFIG.ca ? `https://dexscreener.com/solana/${CONFIG.ca}`   : 'https://dexscreener.com/solana';
CONFIG.scan  = CONFIG.ca ? `https://solscan.io/token/${CONFIG.ca}`         : 'https://solscan.io';

/* ─────────────────────────────────────────────────────────────
   THE ARCHIVE
   ───────────────────────────────────────────────────────────── */
const MEMES = [
  { f: 'chains',        cap: 'BREAKING THE CHAINS' },
  { f: 'sniper',        cap: 'SNIPER SEASON' },
  { f: 'street',        cap: 'STREET LEGEND',        tall: true },
  { f: 'toadmart',      cap: 'TOAD MART',            tall: true },
  { f: 'blade',         cap: 'HOLDER OF THE BLADE' },
  { f: 'solangeles',    cap: 'SOLANGELES' },
  { f: 'deepliquidity', cap: 'DEEP LIQUIDITY' },
  { f: 'greenwall',     cap: 'GREEN CANDLE INCOMING' },
  { f: 'astronaut',     cap: 'ALREADY PAST THE MOON', tall: true },
  { f: 'greenpill',     cap: 'TAKE THE GREEN PILL' },
  { f: 'beach',         cap: 'GENERATIONAL VACATION' },
  { f: 'mirror',        cap: 'WE SEE THE VISION' },
  { f: 'cashfloor',     cap: '1988 MONEY' },
  { f: 'jetski',        cap: 'FULL SEND' },
  { f: 'torch',         cap: 'PASSING THE TORCH' },
  { f: 'oldmoney',      cap: 'OLD MONEY TOAD' },
  { f: 'timekeeper',    cap: 'WE WERE EARLY',        tall: true },
  { f: 'tophat',        cap: 'RESPECTFULLY, NO' },
  { f: 'cheers',        cap: 'CHEERS TO 38 YEARS' },
  { f: 'matrix',        cap: 'THE GREEN SOURCE',     tall: true },
];

/* ─────────────────────────────────────────────────────────────
   THE CHANNELS — drop an mp4 in /assets/video, a still in
   /assets/posters, add a line here. That's the whole procedure.
   ───────────────────────────────────────────────────────────── */
const CHANNELS = [
  { ch: '88', name: 'THE ORIGINAL', tag: 'ARCHIVO 1988', file: 'intro',                  poster: 'poster-intro.jpg'  },
  { ch: '89', name: 'THE ARENA',    tag: 'EMBLEM',       file: 'arena4_emblem',          poster: 'poster-arena.jpg'  },
  { ch: '90', name: 'LASER GRID',   tag: 'HEIST II',     file: 'heist2_lasers',          poster: 'poster-lasers.jpg' },
  { ch: '91', name: 'THE VAULT',    tag: 'HEIST III',    file: 'heist3_alarm',           poster: 'poster-vault.jpg'  },
  { ch: '92', name: 'THE SOURCE',   tag: 'GREEN CODE',   file: 'TOAD_matrix_4_web',      poster: 'poster-source.jpg' },
  { ch: '93', name: 'GOLDEN LIGHT', tag: 'AFTERMATH II', file: 'aftermath2_goldenlight', poster: 'poster-march.jpg'  },
];

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE  = matchMedia('(pointer: coarse)').matches;

/* ── how much machine are we working with? ──
   A full-screen looping video plus grain, scanlines and a particle canvas is
   a lot to ask of a thin laptop. On weak hardware we drop the decorations
   first, and on the weakest we drop the background video too and leave the
   poster frame — the page still reads exactly the same. */
const SAVE_DATA = navigator.connection?.saveData === true;
const SLOW_NET  = /^(slow-2g|2g|3g)$/.test(navigator.connection?.effectiveType || '');
const CORES     = navigator.hardwareConcurrency || 4;
const LITE      = REDUCED || SAVE_DATA || SLOW_NET || CORES <= 4 || COARSE;
/* Deliberately *not* keyed to SLOW_NET: browsers report "3g" on plenty of
   healthy connections, and the buffering gate below measures what actually
   happens instead of trusting the label. */
const NO_HERO_VIDEO = REDUCED || SAVE_DATA || CORES <= 2;

/* Core count is a poor proxy for how a machine actually feels — a four-core
   laptop with a decent GPU sails through this, an eight-core one with weak
   integrated graphics chokes. So we also measure real frame rate once the
   hero is running and step down if the numbers are bad. Tiers only go up. */
const Perf = {
  level: 0,                       // 0 full · 1 lite · 2 minimal
  _subs: [],
  onChange(fn) { this._subs.push(fn); fn(this.level); },
  set(level, why) {
    if (level <= this.level) return;
    this.level = level;
    document.body.classList.toggle('perf-lite', level >= 1);
    document.body.classList.toggle('perf-min',  level >= 2);
    this._subs.forEach(fn => fn(level));
    console.info(`%c🐸 effects → tier ${level} (${why})`, 'color:#74c13b;font:12px monospace');
  },
};
if (LITE) Perf.set(1, 'device hints');

/* ?fx=lite / ?fx=min force a tier, ?fx=full pins everything on — handy for
   checking what a slower machine actually sees */
const FX_FORCE = new URLSearchParams(location.search).get('fx');
if (FX_FORCE === 'lite') Perf.set(1, 'url override');
if (FX_FORCE === 'min')  Perf.set(2, 'url override');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rand  = (a, b) => a + Math.random() * (b - a);

/* ══════════════════════════════════════════════════════════════
   1. SOUND — a synthesised croak. No audio files needed.
   ══════════════════════════════════════════════════════════════ */
const Sound = (() => {
  let ctx = null, muted = false;
  const wake = () => {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  const croak = () => {
    const c = wake(); if (!c || muted) return;
    const t = c.currentTime;
    const osc = c.createOscillator();
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    const filt = c.createBiquadFilter();
    const gain = c.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(96, t + 0.16);

    lfo.type = 'square';
    lfo.frequency.setValueAtTime(38, t);
    lfoGain.gain.setValueAtTime(70, t);
    lfo.connect(lfoGain).connect(osc.frequency);

    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(1500, t);
    filt.frequency.exponentialRampToValueAtTime(420, t + 0.18);
    filt.Q.value = 6;

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

    osc.connect(filt).connect(gain).connect(c.destination);
    osc.start(t); lfo.start(t);
    osc.stop(t + 0.22); lfo.stop(t + 0.22);
  };
  const blip = (freq = 880, dur = 0.07, vol = 0.05) => {
    const c = wake(); if (!c || muted) return;
    const t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'square'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  };
  return { croak, blip, wake, toggle: () => (muted = !muted), get muted() { return muted; } };
})();

/* ══════════════════════════════════════════════════════════════
   2. TOAST
   ══════════════════════════════════════════════════════════════ */
const toastEl = $('#toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2400);
}

/* ══════════════════════════════════════════════════════════════
   3. BOOT SEQUENCE
   ══════════════════════════════════════════════════════════════ */
(function boot() {
  const el = $('#boot');
  const cv = $('#bootStatic');
  const line = $('#bootLine');
  const btn = $('#bootBtn');
  const ctx = cv.getContext('2d', { alpha: false });
  let raf, alive = true;

  document.documentElement.classList.add('is-locked');

  function size() {
    cv.width  = Math.max(1, Math.floor(innerWidth  / 3));
    cv.height = Math.max(1, Math.floor(innerHeight / 3));
  }
  size();
  addEventListener('resize', size);

  function noise() {
    if (!alive) return;
    const { width: w, height: h } = cv;
    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    raf = setTimeout(() => requestAnimationFrame(noise), 55);
  }
  if (!REDUCED) noise(); else ctx.fillStyle = '#000', ctx.fillRect(0, 0, cv.width, cv.height);

  // Buffer the hero footage behind the tuning screen instead of after it.
  // Deferred by a tick so the rest of this module finishes evaluating first.
  setTimeout(() => primeHeroVideo(), 0);

  const lines = [
    'TUNING SIGNAL…',
    'CANAL 88 — ARCHIVO NACIONAL',
    'TAPE FOUND: EL TOAD PEPE, 1988',
    'RESTORING COLOUR…',
    'SIGNAL LOCKED ✓',
  ];
  let i = 0;
  const seq = setInterval(() => {
    i++;
    if (i >= lines.length) { clearInterval(seq); return; }
    line.textContent = lines[i];
    Sound.blip(560 + i * 90, 0.05, 0.03);
  }, 620);

  function enter() {
    btn.removeEventListener('click', enter);
    clearInterval(seq);
    Sound.wake();
    Sound.croak();
    el.classList.add('is-off');
    setTimeout(() => {
      el.classList.add('is-gone');
      document.documentElement.classList.remove('is-locked');
      alive = false; clearTimeout(raf);
      document.body.classList.add('is-live');
      startHeroVideo();
      revealHero();
      window.__armWatchdog?.();
      setTimeout(() => el.remove(), 600);
    }, 560);
  }
  btn.addEventListener('click', enter);

  // failsafe: never trap anyone behind the curtain
  setTimeout(() => { if (document.body.contains(el) && !el.classList.contains('is-off')) line.textContent = 'SIGNAL LOCKED ✓'; }, 4200);
})();

/* ══════════════════════════════════════════════════════════════
   4. HERO
   ══════════════════════════════════════════════════════════════ */
const heroVideo = $('#heroVideo');
let heroOnScreen = true;
let heroBanned = NO_HERO_VIDEO;
let heroReady = false;

/* ── buffering ──
   Locally the file is on disk and plays instantly; over a CDN it is a real
   download, and calling play() on an empty buffer gives you a slideshow.
   So: start fetching during the boot sequence — that screen exists to cover
   exactly this — and refuse to start until the browser says it can play the
   whole thing through. Until then the poster frame stands in, which is a
   still image of the same footage, so nobody can tell. */
/* If you ever add smaller .webm versions alongside the .mp4 files, flip this
   to true and browsers that can read VP9 will take them; everything else
   falls back to the mp4. See the Performance notes in the README. */
const PREFER_WEBM = false;
const WEBM_OK = PREFER_WEBM && !!document.createElement('video').canPlayType('video/webm; codecs="vp9"');
const videoSrc = base => `/assets/video/${base}.${WEBM_OK ? 'webm' : 'mp4'}`;

function primeHeroVideo() {
  if (!heroVideo || heroBanned || heroVideo.src) return;
  heroVideo.preload = 'auto';
  heroVideo.src = videoSrc('intro');
  heroVideo.load();

  heroVideo.addEventListener('canplaythrough', () => {
    heroReady = true;
    startHeroVideo();
  }, { once: true });

  /* On a marginal connection canplaythrough may never fire at all. Rather than
     give up on the video entirely, drop to a weaker bar after a while and let
     the stall counter below be the real judge. */
  setTimeout(() => {
    if (!heroReady && heroVideo.readyState >= 3) { heroReady = true; startHeroVideo(); }
  }, 9000);

  // a stuttering hero is worse than a still one — three stalls and we stop
  let stalls = 0;
  const onStall = () => {
    if (++stalls < 3) return;
    heroBanned = true;
    heroVideo.pause();
    console.info('%c🐸 hero video stalled repeatedly — holding the poster frame', 'color:#74c13b;font:12px monospace');
  };
  heroVideo.addEventListener('waiting', onStall);
  heroVideo.addEventListener('stalled', onStall);
}

function startHeroVideo() {
  if (!heroVideo || heroBanned || !heroReady || !heroOnScreen || document.hidden) return;
  heroVideo.play().catch(() => {});
}

/* Decoding 720p behind six screens of content nobody is looking at is pure
   waste — stop the moment the hero leaves the viewport. */
if (heroVideo && !NO_HERO_VIDEO) {
  new IntersectionObserver(([en]) => {
    heroOnScreen = en.isIntersecting;
    if (heroOnScreen) startHeroVideo();
    else heroVideo.pause();
  }, { threshold: 0.01 }).observe($('#hero'));
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) heroVideo?.pause();
  else startHeroVideo();
});

/* ── frame-rate watchdog ──
   Runs for a few seconds after the hero starts. If the page can't hold a
   comfortable frame rate we drop a tier, and if it still can't, we park the
   video on its poster frame. Better a still hero than a stuttering one. */
(function watchdog() {
  if (REDUCED || FX_FORCE) return;
  let frames = 0, since = 0, rounds = 0, armed = false;

  window.__armWatchdog = () => {
    if (armed) return;
    armed = true;
    setTimeout(() => {                       // let the first paint settle
      since = performance.now();
      requestAnimationFrame(tick);
    }, 1200);
  };

  function tick(now) {
    if (document.hidden) { frames = 0; since = now; return requestAnimationFrame(tick); }
    frames++;
    const dt = now - since;
    if (dt < 1500) return requestAnimationFrame(tick);

    const fps = (frames * 1000) / dt;
    frames = 0; since = now; rounds++;

    if (fps < 34 && Perf.level < 2) {
      Perf.set(2, `${fps.toFixed(0)} fps`);
      if (heroVideo && !heroVideo.paused) { heroBanned = true; heroVideo.pause(); }
      return;                                 // nothing left to step down to
    }
    if (fps < 50 && Perf.level < 1) Perf.set(1, `${fps.toFixed(0)} fps`);
    if (rounds < 4) requestAnimationFrame(tick);
  }
})();
function revealHero() {
  const k = $('.hero__kicker');
  const title = $('.wordmark');
  if (title) { title.classList.add('is-glitch'); setTimeout(() => title.classList.remove('is-glitch'), 320); }
  if (k) k.style.animation = 'none';
}

/* split kicker into per-letter spans for the stagger */
(function splitKicker() {
  const el = $('[data-split]');
  if (!el || REDUCED) return;
  const text = el.textContent.trim();
  el.textContent = '';
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.textContent = ch === ' ' ? ' ' : ch;
    s.style.opacity = '0';
    s.style.transform = 'translateY(14px)';
    s.style.transition = `opacity .5s ease ${400 + i * 26}ms, transform .5s cubic-bezier(.22,1,.36,1) ${400 + i * 26}ms`;
    el.appendChild(s);
    requestAnimationFrame(() => requestAnimationFrame(() => { s.style.opacity = '1'; s.style.transform = 'none'; }));
  });
})();

/* rolling timecode */
(function timecode() {
  const el = $('#timecode');
  if (!el) return;
  const t0 = performance.now();
  const pad = n => String(n).padStart(2, '0');
  setInterval(() => {
    const ms = performance.now() - t0;
    const f = Math.floor((ms % 1000) / 40);
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    el.textContent = `00:${pad(m)}:${pad(s)}:${pad(f)}`;
  }, 60);
})();

/* random VHS glitch on the wordmark */
if (!REDUCED) {
  const wm = $('.wordmark');
  setInterval(() => {
    if (!wm || Math.random() > 0.35) return;
    wm.classList.add('is-glitch');
    setTimeout(() => wm.classList.remove('is-glitch'), 300);
  }, 3600);
}

/* ══════════════════════════════════════════════════════════════
   5. SPORES — drifting swamp particles
   ══════════════════════════════════════════════════════════════ */
(function spores() {
  const cv = $('#spores');
  if (!cv || REDUCED) { if (cv) cv.style.display = 'none'; return; }
  const ctx = cv.getContext('2d');
  let w, h, parts = [], dpr = 1, running = true, dead = false;

  /* The glow used to come from ctx.shadowBlur, which is a fresh gaussian blur
     per particle per frame — dozens of blurs every 16 ms. Now each colour is
     rendered once into a little sprite and simply stamped. */
  const sprite = (rgb) => {
    const S = 64, c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    grad.addColorStop(0,   `rgba(${rgb},1)`);
    grad.addColorStop(.28, `rgba(${rgb},.55)`);
    grad.addColorStop(1,   `rgba(${rgb},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, S, S);
    return c;
  };
  const SPRITES = [sprite('168,255,26'), sprite('245,197,24')];

  function tierSettings() {
    if (Perf.level >= 1) return { dpr: 1,   div: 46, min: 10, max: 26 };
    return                      { dpr: Math.min(devicePixelRatio || 1, 1.5), div: 26, min: 22, max: 60 };
  }

  function size() {
    if (dead) return;
    const s = tierSettings();
    dpr = s.dpr;
    w = cv.width  = Math.max(1, Math.round(innerWidth  * dpr));
    h = cv.height = Math.max(1, Math.round(innerHeight * dpr));
    cv.style.width = innerWidth + 'px';
    cv.style.height = innerHeight + 'px';
    const n = clamp(Math.round(innerWidth / s.div), s.min, s.max);
    parts = Array.from({ length: n }, () => spawn());
  }

  Perf.onChange(level => {
    if (level >= 2) { dead = true; running = false; cv.style.display = 'none'; return; }
    size();
  });

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden && !dead;
    if (running) frame();
  });
  function spawn(atBottom) {
    return {
      x: rand(0, w), y: atBottom ? h + rand(0, 60) : rand(0, h),
      r: rand(0.7, 2.6) * dpr,
      vy: -rand(0.08, 0.42) * dpr,
      vx: rand(-0.14, 0.14) * dpr,
      a: rand(0.15, 0.7),
      p: rand(0, Math.PI * 2),
      warm: Math.random() > 0.82,
    };
  }
  function frame() {
    if (!running || dead) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.p += 0.014;
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.p) * 0.22 * dpr;
      if (p.y < -20) Object.assign(p, spawn(true));
      const glow = (Math.sin(p.p * 1.7) + 1) / 2;
      ctx.globalAlpha = p.a * (0.45 + glow * 0.55);
      const d = p.r * 7;
      ctx.drawImage(SPRITES[p.warm ? 1 : 0], p.x - d / 2, p.y - d / 2, d, d);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  size();
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(size, 150); });
  frame();
})();

/* ══════════════════════════════════════════════════════════════
   6. CURSOR + THE FLY
   ══════════════════════════════════════════════════════════════ */
/* The toad head itself is a native CSS cursor — see style.css. All that is
   left here is the fly it keeps failing to catch. */
if (!COARSE && !LITE) {
  const fly = $('#fly');
  let mx = innerWidth / 2, my = innerHeight / 2;
  let fx = mx, fy = my, fvx = 0, fvy = 0, t = 0, awake = true;

  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    fly.classList.add('is-on');
  }, { passive: true });
  addEventListener('mouseleave', () => fly.classList.remove('is-on'));
  document.addEventListener('visibilitychange', () => {
    awake = !document.hidden;
    if (awake) loop();
  });

  function loop() {
    if (!awake) return;
    t += 0.045;
    const tx = mx + Math.cos(t * 1.7) * 46 + Math.sin(t * 0.6) * 20;
    const ty = my + Math.sin(t * 2.3) * 38 + Math.cos(t * 0.9) * 16;
    fvx += (tx - fx) * 0.055; fvy += (ty - fy) * 0.055;
    fvx *= 0.82; fvy *= 0.82;
    fx += fvx; fy += fvy;
    fly.style.transform = `translate3d(${fx}px, ${fy}px, 0)`;
    requestAnimationFrame(loop);
  }
  loop();
}

/* ══════════════════════════════════════════════════════════════
   7. NAV
   ══════════════════════════════════════════════════════════════ */
(function nav() {
  const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');

  const onScroll = () => nav.classList.toggle('is-stuck', scrollY > 40);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  burger.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    Sound.blip(open ? 720 : 480, 0.06, 0.04);
  });
  links.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      links.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  // active section highlight
  const ids = $$('#navLinks a').map(a => a.getAttribute('href').slice(1));
  const secs = ids.map(id => document.getElementById(id)).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      $$('#navLinks a').forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => spy.observe(s));
})();

/* ══════════════════════════════════════════════════════════════
   8. TAPE PROGRESS BAR
   ══════════════════════════════════════════════════════════════ */
(function progress() {
  const fill = $('#tapebarFill');
  const upd = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    fill.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  };
  upd();
  addEventListener('scroll', upd, { passive: true });
  addEventListener('resize', upd);
})();

/* ══════════════════════════════════════════════════════════════
   9. MARQUEES — RAF driven, seamless, hover-slow
   ══════════════════════════════════════════════════════════════ */
const marquees = [];
function initMarquee(track) {
  const speed = parseFloat(track.dataset.speed) || 40;
  const dir   = parseFloat(track.dataset.dir) || 1;
  const base  = [...track.children].map(n => n.cloneNode(true));
  if (!base.length) return;

  const fill = () => {
    while (track.scrollWidth < track.parentElement.offsetWidth * 2.4 && track.children.length < 240) {
      base.forEach(n => track.appendChild(n.cloneNode(true)));
    }
  };
  fill();

  const m = { track, speed, dir, x: 0, half: 0, factor: 1, visible: true };
  m.measure = () => { m.half = track.scrollWidth / 2; };
  m.measure();
  track.addEventListener('mouseenter', () => (m.factor = 0.15));
  track.addEventListener('mouseleave', () => (m.factor = 1));

  // a belt scrolling past six screens above the fold is work nobody sees
  marqueeSpy.observe(track.parentElement || track);
  visibilityMap.set(track.parentElement || track, m);

  marquees.push(m);
  return m;
}
const visibilityMap = new WeakMap();
const marqueeSpy = new IntersectionObserver(entries => {
  entries.forEach(en => {
    const m = visibilityMap.get(en.target);
    if (m) m.visible = en.isIntersecting;
  });
}, { rootMargin: '150px 0px' });

(function marqueeLoop() {
  let last = performance.now();
  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!document.hidden) {
      for (const m of marquees) {
        if (!m.visible) continue;
        if (!m.half) { m.measure(); continue; }
        m.x -= m.speed * m.factor * m.dir * dt;
        if (m.dir > 0 && m.x <= -m.half) m.x += m.half;
        if (m.dir < 0 && m.x >= 0) m.x -= m.half;
        m.track.style.transform = `translate3d(${m.x}px,0,0)`;
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ══════════════════════════════════════════════════════════════
   10. MEME STRIPS + LIGHTBOX
   ══════════════════════════════════════════════════════════════ */
let order = MEMES.map((_, i) => i);

function buildStrips() {
  const rows = [[], [], []];
  order.forEach((idx, i) => rows[i % 3].push(idx));

  $$('.strip__track').forEach((track, r) => {
    track.innerHTML = '';
    track.style.transform = 'translate3d(0,0,0)';
    rows[r].forEach(idx => {
      const m = MEMES[idx];
      const fig = document.createElement('figure');
      fig.className = 'meme' + (m.tall ? ' meme--tall' : '');
      fig.dataset.idx = idx;
      fig.innerHTML =
        `<img src="/assets/memes/thumb/${m.f}.jpg" alt="${m.cap}" loading="lazy" decoding="async">` +
        `<figcaption class="meme__cap">${m.cap}</figcaption>`;
      track.appendChild(fig);
    });
  });

  // drop only the strip marquees, then re-register them — the ticker
  // and footer keep running untouched
  for (let i = marquees.length - 1; i >= 0; i--) {
    if (marquees[i].track.classList.contains('strip__track')) marquees.splice(i, 1);
  }
  $$('.strip__track').forEach(initMarquee);
}

$('#shuffleBtn')?.addEventListener('click', () => {
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  buildStrips();
  Sound.croak();
  toast('🎲 ARCHIVE RESHUFFLED');
  glitch();
});

/* lightbox */
const LB = {
  el: $('#lightbox'), img: $('#lbImg'), cap: $('#lbCap'), idx: $('#lbIdx'), i: 0,
  open(i) {
    this.i = (i + MEMES.length) % MEMES.length;
    const m = MEMES[this.i];
    this.img.src = `/assets/memes/${m.f}.jpg`;
    this.img.alt = m.cap;
    this.cap.textContent = m.cap;
    this.idx.textContent = `${String(this.i + 1).padStart(2, '0')} / ${MEMES.length}`;
    this.el.classList.add('is-on');
    document.documentElement.classList.add('is-locked');
    Sound.blip(760, 0.05, 0.04);
  },
  close() {
    this.el.classList.remove('is-on');
    document.documentElement.classList.remove('is-locked');
  },
  step(d) { this.open(this.i + d); },
};

document.addEventListener('click', e => {
  const meme = e.target.closest('.meme');
  if (meme) { LB.open(+meme.dataset.idx); return; }
});
$('#lbClose').addEventListener('click', () => LB.close());
$('#lbPrev').addEventListener('click', () => LB.step(-1));
$('#lbNext').addEventListener('click', () => LB.step(1));
LB.el.addEventListener('click', e => { if (e.target === LB.el || e.target.classList.contains('lb__figure')) LB.close(); });
addEventListener('keydown', e => {
  if (!LB.el.classList.contains('is-on')) return;
  if (e.key === 'Escape') LB.close();
  if (e.key === 'ArrowRight') LB.step(1);
  if (e.key === 'ArrowLeft') LB.step(-1);
});

/* ══════════════════════════════════════════════════════════════
   11. REVEAL ON SCROLL
   ══════════════════════════════════════════════════════════════ */
(function reveal() {
  const items = $$('[data-reveal]');
  if (REDUCED) { items.forEach(i => i.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const sibs = [...(en.target.parentElement?.children || [])].filter(c => c.hasAttribute('data-reveal'));
      en.target.style.setProperty('--d', Math.min(sibs.indexOf(en.target), 6) * 90 + 'ms');
      en.target.classList.add('is-in');
      obs.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  items.forEach(i => io.observe(i));
})();

/* ══════════════════════════════════════════════════════════════
   12. COUNTERS
   ══════════════════════════════════════════════════════════════ */
(function counters() {
  const els = $$('[data-count]');
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      obs.unobserve(el);
      const target = parseFloat(el.dataset.count);
      if (el.hasAttribute('data-plain') || REDUCED) { el.textContent = target; return; }
      const dur = 1500, t0 = performance.now();
      (function step(now) {
        const p = clamp((now - t0) / dur, 0, 1);
        const e = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * e).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.4 });
  els.forEach(e => io.observe(e));
})();

/* ══════════════════════════════════════════════════════════════
   13. TILT + MAGNET
   ══════════════════════════════════════════════════════════════ */
if (!COARSE && !REDUCED) {
  $$('[data-tilt]').forEach(el => {
    const strength = 10;
    const base = getComputedStyle(el).transform;
    const baseT = base === 'none' ? '' : '';
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `${baseT} perspective(900px) rotateX(${-py * strength}deg) rotateY(${px * strength}deg) translateZ(8px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  $$('[data-magnet]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.24;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.34;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* every element that should croak */
document.addEventListener('click', e => {
  if (e.target.closest('[data-croak]')) Sound.croak();
}, true);

/* ══════════════════════════════════════════════════════════════
   14. CONTRACT ADDRESS
   ══════════════════════════════════════════════════════════════ */
(function contract() {
  const bar = $('#caBar'), val = $('#caValue');
  const has = !!CONFIG.ca;
  val.textContent = has ? CONFIG.ca : 'DROPPING SOON — WATCH @eltoadpepe';

  async function copy() {
    if (!has) { toast('NO CONTRACT YET — STAY TUNED'); return; }
    try {
      await navigator.clipboard.writeText(CONFIG.ca);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = CONFIG.ca; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch {}
      ta.remove();
    }
    bar.classList.add('is-copied');
    setTimeout(() => bar.classList.remove('is-copied'), 1600);
    toast('✓ CONTRACT COPIED — VERIFY BEFORE YOU BUY');
  }
  bar.addEventListener('click', copy);
  $('#caBar2')?.addEventListener('click', copy);

  // wire every outbound link from CONFIG
  const wire = (sel, url) => { const el = $(sel); if (el) el.href = url; };
  wire('#buyLink',       CONFIG.buy);
  wire('#lnkX',          CONFIG.x);
  wire('#lnkCommunity',  CONFIG.community);
  wire('#lnkChart',      CONFIG.chart);
  wire('#lnkScan',       CONFIG.scan);
})();

/* ══════════════════════════════════════════════════════════════
   15. THE TV
   ══════════════════════════════════════════════════════════════ */
(function tv() {
  const tv = $('#tv'), vid = $('#tapeVideo'), play = $('#tapePlay');
  const time = $('#tapeTime'), kSound = $('#knobSound'), kFull = $('#knobFull');
  const chEl = $('#tapeCh'), nameEl = $('#tapeName'), list = $('#channels');
  const staticCv = $('#tvStatic');
  if (!tv) return;

  let current = 0;
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  /* ── build the dial ── */
  CHANNELS.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'chan' + (i === 0 ? ' is-live' : '');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', String(i === 0));
    b.innerHTML =
      `<span class="chan__thumb"><img src="/assets/posters/${c.poster}" alt="" loading="lazy" decoding="async">` +
      `<span class="chan__num">CH ${c.ch}</span></span>` +
      `<span class="chan__meta"><b>${c.name}</b><span>${c.tag}</span></span>`;
    b.addEventListener('click', () => tune(i));
    list.appendChild(b);
  });
  const buttons = () => [...list.children];

  /* ── static burst between channels ── */
  const sctx = staticCv.getContext('2d', { alpha: false });
  let staticRaf = null;
  function staticOn() {
    staticCv.width  = Math.max(1, Math.round(staticCv.offsetWidth  / 4));
    staticCv.height = Math.max(1, Math.round(staticCv.offsetHeight / 4));
    const draw = () => {
      const { width: w, height: h } = staticCv;
      const img = sctx.createImageData(w, h), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
      }
      sctx.putImageData(img, 0, 0);
      staticRaf = requestAnimationFrame(draw);
    };
    if (!REDUCED) draw();
  }
  function staticOff() { cancelAnimationFrame(staticRaf); staticRaf = null; }

  /* ── tune to a channel ── */
  function tune(i, autoplay = true) {
    const c = CHANNELS[i];
    const same = i === current;
    current = i;

    buttons().forEach((b, n) => {
      b.classList.toggle('is-live', n === i);
      b.setAttribute('aria-selected', String(n === i));
    });
    chEl.textContent = `CH ${c.ch}`;
    nameEl.textContent = c.name;

    if (!same || !vid.src) {
      /* The static isn't decoration here — it's the loading state. These tapes
         are big, and holding the noise until the browser can actually play
         through means you never see a stuttering picture, just a set tuning
         itself in. Exactly what the section is pretending to be anyway. */
      tv.classList.add('is-tuning');
      staticOn();
      Sound.blip(180 + i * 40, 0.12, 0.05);

      vid.poster = `/assets/posters/${c.poster}`;
      vid.preload = 'auto';
      vid.src = videoSrc(c.file);
      vid.load();

      let settled = false;
      const lock = () => {
        if (settled || current !== i) return;
        settled = true;
        tv.classList.remove('is-tuning');
        staticOff();
        if (autoplay) start();
      };
      vid.addEventListener('canplaythrough', lock, { once: true });
      // don't hold the noise forever on a bad line
      setTimeout(lock, 9000);
      // ...but always show at least a beat of static, or the switch reads as a glitch
      setTimeout(() => { if (vid.readyState >= 4) lock(); }, 420);
    } else if (autoplay) {
      start();
    }
  }

  function start() {
    tv.classList.add('is-switching');
    setTimeout(() => tv.classList.remove('is-switching'), 420);
    if (!vid.src) { tune(current); return; }
    vid.muted = false;
    vid.play().then(() => {
      tv.classList.add('is-playing');
      kSound.classList.add('is-on');
    }).catch(() => {
      vid.muted = true;
      vid.play().then(() => { tv.classList.add('is-playing'); toast('AUTOPLAY BLOCKED — TAP VOL FOR SOUND'); });
    });
  }

  play.addEventListener('click', start);
  vid.addEventListener('click', () => {
    if (vid.paused) start();
    else { vid.pause(); tv.classList.remove('is-playing'); }
  });
  vid.addEventListener('timeupdate', () => { time.textContent = fmt(vid.currentTime); });
  // when a tape runs out, roll straight into the next channel
  vid.addEventListener('ended', () => tune((current + 1) % CHANNELS.length));

  kSound.addEventListener('click', () => {
    vid.muted = !vid.muted;
    kSound.classList.toggle('is-on', !vid.muted);
    if (vid.paused) start();
    Sound.blip(vid.muted ? 340 : 880, 0.07, 0.04);
  });

  kFull.addEventListener('click', () => {
    const el = $('#tvScreen');
    if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  });

  // pause the hero video while the tape is on screen — one soundtrack at a time
  const io = new IntersectionObserver(([en]) => {
    if (en.isIntersecting) { heroVideo?.pause(); }
    else { if (!vid.paused) { vid.pause(); tv.classList.remove('is-playing'); } startHeroVideo(); }
  }, { threshold: 0.35 });
  io.observe(tv);
})();

/* ══════════════════════════════════════════════════════════════
   16. LORE RAIL — drag to scrub, line fills with progress
   ══════════════════════════════════════════════════════════════ */
(function lore() {
  const track = $('#loreTrack');
  if (!track) return;
  const rail  = $('#loreRailBar'), thumb = $('#loreThumb'), fill = $('#loreFill');
  const bLeft = $('#loreLeft'),    bRight = $('#loreRight');
  const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);

  /* ── grab the cards themselves ── */
  let down = false, sx = 0, sl = 0, moved = 0;
  track.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    down = true; moved = 0;
    sx = e.clientX; sl = track.scrollLeft;
    track.classList.add('is-dragging');
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener('pointermove', e => {
    if (!down) return;
    const d = e.clientX - sx;
    moved = Math.abs(d);
    track.scrollLeft = sl - d;
  });
  const up = e => {
    if (!down) return;
    down = false;
    track.classList.remove('is-dragging');
    try { track.releasePointerCapture(e.pointerId); } catch {}
  };
  track.addEventListener('pointerup', up);
  track.addEventListener('pointercancel', up);
  track.addEventListener('click', e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);

  /* ── wheel over the rail scrolls the rail, not the page ──
     …until you hit an end, then the page takes over again so
     nobody gets trapped inside the timeline. ── */
  track.addEventListener('wheel', e => {
    const max = maxScroll();
    if (!max) return;
    // horizontal intent (trackpad) is already handled natively
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const step = e.deltaY * (e.deltaMode === 1 ? 24 : 1);
    const next = track.scrollLeft + step;
    const atEdge = (step < 0 && track.scrollLeft <= 0) || (step > 0 && track.scrollLeft >= max - 1);
    if (atEdge) return;                 // let the page scroll on
    e.preventDefault();
    track.scrollLeft = clamp(next, 0, max);
  }, { passive: false });

  /* ── the scrubber ── */
  function sync() {
    const max = maxScroll();
    const ratio = track.clientWidth / track.scrollWidth;
    const railW = rail.clientWidth;
    const tw = clamp(Math.round(railW * ratio), 56, railW);
    const p = max > 0 ? track.scrollLeft / max : 0;
    thumb.style.width = tw + 'px';
    thumb.style.transform = `translateX(${(railW - tw) * p}px)`;
    fill.style.width = ((railW - tw) * p) + 'px';   // track already travelled
    thumb.setAttribute('aria-valuenow', Math.round(p * 100));
    bLeft.disabled  = track.scrollLeft <= 1;
    bRight.disabled = track.scrollLeft >= max - 1;
  }

  let scrubbing = false, grabX = 0, grabLeft = 0;
  const seekTo = clientX => {
    const r = rail.getBoundingClientRect();
    const tw = thumb.offsetWidth;
    const p = clamp((clientX - r.left - tw / 2) / (r.width - tw), 0, 1);
    track.scrollLeft = p * maxScroll();
  };

  thumb.addEventListener('pointerdown', e => {
    e.stopPropagation();
    scrubbing = true; grabX = e.clientX; grabLeft = track.scrollLeft;
    thumb.classList.add('is-grabbing');
    thumb.setPointerCapture(e.pointerId);
  });
  thumb.addEventListener('pointermove', e => {
    if (!scrubbing) return;
    const r = rail.getBoundingClientRect();
    const travel = r.width - thumb.offsetWidth;
    if (travel <= 0) return;
    track.scrollLeft = clamp(grabLeft + ((e.clientX - grabX) / travel) * maxScroll(), 0, maxScroll());
  });
  const stopScrub = e => {
    if (!scrubbing) return;
    scrubbing = false;
    thumb.classList.remove('is-grabbing');
    try { thumb.releasePointerCapture(e.pointerId); } catch {}
  };
  thumb.addEventListener('pointerup', stopScrub);
  thumb.addEventListener('pointercancel', stopScrub);

  rail.addEventListener('pointerdown', e => {
    if (e.target === thumb) return;
    seekTo(e.clientX);
    Sound.blip(620, 0.05, 0.03);
  });

  thumb.addEventListener('keydown', e => {
    const card = track.querySelector('.lore-card');
    const stepW = card ? card.offsetWidth + 20 : 300;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); track.scrollBy({ left: -stepW, behavior: 'smooth' }); }
    if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left:  stepW, behavior: 'smooth' }); }
  });

  const nudge = dir => {
    const card = track.querySelector('.lore-card');
    const stepW = card ? card.offsetWidth + 20 : 300;
    track.scrollBy({ left: dir * stepW, behavior: REDUCED ? 'auto' : 'smooth' });
    Sound.blip(dir > 0 ? 760 : 520, 0.05, 0.035);
  };
  bLeft.addEventListener('click', () => nudge(-1));
  bRight.addEventListener('click', () => nudge(1));

  sync();
  track.addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', sync);
  addEventListener('load', sync);
})();

/* ══════════════════════════════════════════════════════════════
   17. GLITCH BURSTS
   ══════════════════════════════════════════════════════════════ */
function glitch() {
  if (REDUCED) return;
  document.body.classList.add('glitching');
  setTimeout(() => document.body.classList.remove('glitching'), 320);
}
if (!REDUCED) setInterval(() => { if (Math.random() < 0.14) glitch(); }, 7000);

/* ══════════════════════════════════════════════════════════════
   18. EASTER EGG — type TOAD
   ══════════════════════════════════════════════════════════════ */
(function egg() {
  let buf = '';
  const flash = $('#fxFlash');
  addEventListener('keydown', e => {
    if (e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-4);
    if (buf !== 'toad') return;
    buf = '';
    rave();
  });

  function rave() {
    Sound.croak();
    setTimeout(() => Sound.croak(), 160);
    setTimeout(() => Sound.croak(), 320);
    flash.classList.remove('is-on'); void flash.offsetWidth; flash.classList.add('is-on');
    document.body.classList.add('rave');
    toast('🐸 RIBBIT MODE ENGAGED');

    const imgs = [];
    for (let i = 0; i < 22; i++) {
      const m = MEMES[Math.floor(Math.random() * MEMES.length)];
      const img = document.createElement('img');
      img.className = 'rave-toad';
      img.src = `/assets/memes/thumb/${m.f}.jpg`;
      img.style.left = rand(-5, 95) + 'vw';
      img.style.top = rand(-5, 90) + 'vh';
      img.style.transform = `rotate(${rand(-35, 35)}deg) scale(${rand(.6, 1.4)})`;
      img.style.transition = 'transform 1.1s cubic-bezier(.22,1,.36,1), opacity .5s ease';
      img.style.opacity = '0';
      document.body.appendChild(img);
      imgs.push(img);
      setTimeout(() => {
        img.style.opacity = '1';
        img.style.transform = `rotate(${rand(-45, 45)}deg) scale(${rand(.8, 1.7)}) translateY(${rand(-60, 60)}px)`;
      }, i * 38);
    }

    setTimeout(() => {
      document.body.classList.remove('rave');
      imgs.forEach(i => { i.style.opacity = '0'; setTimeout(() => i.remove(), 600); });
    }, 4200);
  }

  $('#eggHint')?.addEventListener('click', rave);
})();

/* ══════════════════════════════════════════════════════════════
   19. BOOTSTRAP
   ══════════════════════════════════════════════════════════════ */
buildStrips();
$$('.ticker__track, .foot__track').forEach(initMarquee);
addEventListener('resize', () => marquees.forEach(m => m.measure()));
addEventListener('load',   () => marquees.forEach(m => m.measure()));

/* smooth-scroll for in-page anchors that smooth-behavior misses */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id.length < 2) return;
  const target = document.querySelector(id);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
});

console.log('%c🐸 $TOAD — CANAL 88 ', 'background:#a8ff1a;color:#030603;font:700 14px monospace;padding:6px 12px;border-radius:3px');
console.log('%cThe first Pepe. Since 1988. Type TOAD anywhere for a surprise.', 'color:#74c13b;font:12px monospace');
