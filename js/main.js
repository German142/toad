/* ══════════════════════════════════════════════════════════════
   ToadOS — Original Edition
   BIOS → splash → login → desktop, plus a small window manager.
   ══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   CONFIG — edit these three and the whole desktop updates.
   ⚠ ALWAYS re-verify the contract address before you deploy.
   ───────────────────────────────────────────────────────────── */
const CONFIG = {
  ca:        'A13oRB9FFaiUjfi6LdCg6p9ka1u8SfGkUFs4SKvPpump',
  x:         'https://x.com/thetoadmeme_',
  community: 'https://x.com/i/communities/1991148242780967304',
  tiktok:    'https://www.tiktok.com/@toad2066',
};
CONFIG.buy   = CONFIG.ca ? `https://pump.fun/coin/${CONFIG.ca}`          : 'https://pump.fun';
CONFIG.chart = CONFIG.ca ? `https://dexscreener.com/solana/${CONFIG.ca}` : 'https://dexscreener.com/solana';
CONFIG.scan  = CONFIG.ca ? `https://solscan.io/token/${CONFIG.ca}`       : 'https://solscan.io';

/* ── the tapes ── */
const CHANNELS = [
  { ch:'88', name:'THE ORIGINAL', tag:'Archivo 1988', file:'intro',                  poster:'poster-intro.jpg'  },
  { ch:'89', name:'THE ARENA',    tag:'Emblem',       file:'arena4_emblem',          poster:'poster-arena.jpg'  },
  { ch:'90', name:'LASER GRID',   tag:'Heist II',     file:'heist2_lasers',          poster:'poster-lasers.jpg' },
  { ch:'91', name:'THE VAULT',    tag:'Heist III',    file:'heist3_alarm',           poster:'poster-vault.jpg'  },
  { ch:'92', name:'THE SOURCE',   tag:'Green code',   file:'TOAD_matrix_4_web',      poster:'poster-source.jpg' },
  { ch:'93', name:'GOLDEN LIGHT', tag:'Aftermath II', file:'aftermath2_goldenlight', poster:'poster-march.jpg'  },
  { ch:'94', name:'THE ENTRANCE', tag:'Drywall',      file:'entrance_drywall',       poster:'poster-entrance_drywall.jpg' },
  { ch:'95', name:'RED LIGHTS',   tag:'Basement',     file:'red_lights',             poster:'poster-red_lights.jpg'       },
  { ch:'96', name:'FULL THROTTLE',tag:'Roadside',     file:'full_throttle',          poster:'poster-full_throttle.jpg'    },
  { ch:'97', name:'THE ROOFTOP',  tag:'Stunt tape',   file:'rooftop_stunt',          poster:'poster-rooftop_stunt.jpg'    },
  { ch:'98', name:'THE TITLE',    tag:'Ringside',     file:'ring_title',             poster:'poster-ring_title.jpg'       },
  { ch:'99', name:'NIGHT SHIFT',  tag:'Grinding',     file:'night_shift',            poster:'poster-night_shift.jpg'      },
  { ch:'100',name:'COLD OPEN',    tag:'Ice',          file:'cold_open',              poster:'poster-cold_open.jpg'        },
  { ch:'101',name:'LAST CALL',    tag:'Aftermath',    file:'last_call',              poster:'poster-last_call.jpg'        },
  { ch:'102',name:'THE MONTAGE',  tag:'Steps at dawn',file:'rocky_toad',             poster:'poster-rocky_toad.jpg'       },
  { ch:'103',name:'GOD CANDLE',   tag:'Ascension',    file:'god_candle',             poster:'poster-god_candle.jpg'       },
  { ch:'104',name:'THE LADDER',   tag:'WrestleMania', file:'wwe_return',             poster:'poster-wwe_return.jpg'       },
];

/* ── the archive ── */
const MEMES = [
  { f:'chains',        cap:'breaking_the_chains' },
  { f:'sniper',        cap:'sniper_season' },
  { f:'street',        cap:'street_legend' },
  { f:'toadmart',      cap:'toad_mart' },
  { f:'blade',         cap:'holder_of_the_blade' },
  { f:'solangeles',    cap:'solangeles' },
  { f:'deepliquidity', cap:'deep_liquidity' },
  { f:'greenwall',     cap:'green_candle_incoming' },
  { f:'astronaut',     cap:'already_past_the_moon' },
  { f:'greenpill',     cap:'take_the_green_pill' },
  { f:'beach',         cap:'generational_vacation' },
  { f:'mirror',        cap:'we_see_the_vision' },
  { f:'cashfloor',     cap:'1988_money' },
  { f:'jetski',        cap:'full_send' },
  { f:'torch',         cap:'passing_the_torch' },
  { f:'oldmoney',      cap:'old_money_toad' },
  { f:'timekeeper',    cap:'we_were_early' },
  { f:'tophat',        cap:'respectfully_no' },
  { f:'cheers',        cap:'cheers_to_38_years' },
  { f:'matrix',        cap:'the_green_source' },
  { f:'diamond_hands',      cap:'diamond_hands' },
  { f:'riding_the_bull',    cap:'riding_the_bull' },
  { f:'command_centre',     cap:'command_centre' },
  { f:'on_chain',           cap:'on_chain' },
  { f:'whale_watching',     cap:'whale_watching' },
  { f:'night_fishing',      cap:'night_fishing' },
  { f:'harvest_season',     cap:'harvest_season' },
  { f:'the_vault_opens',    cap:'the_vault_opens' },
  { f:'king_of_the_pond',   cap:'king_of_the_pond' },
  { f:'it_rains_green',     cap:'it_rains_green' },
  { f:'flight_deck',        cap:'flight_deck' },
  { f:'all_in',             cap:'all_in' },
  { f:'climbing_the_chart', cap:'climbing_the_chart' },
  { f:'green_eyes',         cap:'green_eyes' },
  { f:'riding_the_wave',    cap:'riding_the_wave' },
  { f:'outplaying_the_bear',cap:'outplaying_the_bear' },
];

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SMALL   = () => matchMedia('(max-width: 820px)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const LOGO = '/assets/brand/icon-32.png';

/* ══════════════════════════════════════════════════════════════
   SOUND — synthesised, no audio files shipped
   ══════════════════════════════════════════════════════════════ */
const Sound = (() => {
  let ctx = null, muted = false;
  const wake = () => {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  const blip = (freq = 880, dur = .07, vol = .05, type = 'square') => {
    const c = wake(); if (!c || muted) return;
    const t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + .008);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .02);
  };
  const croak = () => {
    const c = wake(); if (!c || muted) return;
    const t = c.currentTime;
    const osc = c.createOscillator(), lfo = c.createOscillator();
    const lg = c.createGain(), filt = c.createBiquadFilter(), gain = c.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(96, t + .16);
    lfo.type = 'square'; lfo.frequency.setValueAtTime(38, t);
    lg.gain.setValueAtTime(70, t); lfo.connect(lg).connect(osc.frequency);
    filt.type = 'lowpass'; filt.Q.value = 6;
    filt.frequency.setValueAtTime(1500, t);
    filt.frequency.exponentialRampToValueAtTime(420, t + .18);
    gain.gain.setValueAtTime(.0001, t);
    gain.gain.exponentialRampToValueAtTime(.16, t + .02);
    gain.gain.exponentialRampToValueAtTime(.0001, t + .2);
    osc.connect(filt).connect(gain).connect(c.destination);
    osc.start(t); lfo.start(t); osc.stop(t + .22); lfo.stop(t + .22);
  };
  /* the startup jingle, in the spirit of the original */
  const chime = () => {
    const c = wake(); if (!c || muted) return;
    [[587,0],[880,.16],[740,.32],[1175,.46]].forEach(([f, d]) => {
      const t = c.currentTime + d;
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(.09, t + .03);
      g.gain.exponentialRampToValueAtTime(.0001, t + .5);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + .55);
    });
  };
  return { blip, croak, chime, wake, toggle: () => (muted = !muted), get muted(){ return muted; } };
})();

/* ══════════════════════════════════════════════════════════════
   1 · BIOS
   ══════════════════════════════════════════════════════════════ */
const BIOS_LINES = [
  'Award Modular BIOS v6.88, An Energy Star Ally',
  'Copyright (C) 1988-2026, Canal 88 Software, Inc.',
  '',
  '<b>ToadOS(R) Sapentium(R) 1988 CPU at 926 MHz</b>',
  'Memory Test :  <i>640K OK</i>  (that ought to be enough)',
  '',
  'Detecting IDE Primary Master   ... <i>ARCHIVO_NACIONAL</i>',
  'Detecting IDE Primary Slave    ... <i>CANAL88_TAPES</i>',
  'Detecting IDE Secondary Master ... <i>MEME_ARCHIVE (20 files)</i>',
  'Detecting IDE Secondary Slave  ... None',
  '',
  'Frog Priority Check ............ <i>TOAD FIRST (1988)</i>',
  'Copycat Detected ............... <i>2005, IGNORED</i>',
  'Suspenders ..................... <i>YELLOW, OK</i>',
  'Shirt .......................... <i>RED, OK</i>',
  'Presale Allocation ............. <i>0 bytes</i>',
  '',
  'Award Plug and Toad BIOS Extension v88.0',
  '',
  '<b>Press any key to boot ToadOS Original Edition</b>',
];

(function bios() {
  const el = $('#bios'), out = $('#biosOut'), hint = $('#biosHint');
  let i = 0, done = false, timer;

  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    out.innerHTML = BIOS_LINES.join('\n');
    hint.classList.add('is-on');
    // nobody should be stuck staring at a POST screen
    setTimeout(() => { if (!el.classList.contains('is-gone')) go(); }, 5000);
  };

  const step = () => {
    if (i >= BIOS_LINES.length) { finish(); return; }
    out.innerHTML += (i ? '\n' : '') + BIOS_LINES[i];
    if (BIOS_LINES[i].trim()) Sound.blip(1200, .012, .012);
    i++;
    timer = setTimeout(step, BIOS_LINES[i - 1]?.trim() ? 95 : 40);
  };
  if (REDUCED) finish(); else step();

  const go = () => {
    if (!done) { finish(); return; }   // first press completes the POST
    el.removeEventListener('click', go);
    removeEventListener('keydown', go);
    el.classList.add('is-gone');
    splash();
  };
  el.addEventListener('click', go);
  addEventListener('keydown', go);
})();

/* ══════════════════════════════════════════════════════════════
   2 · SPLASH → 3 · LOGIN
   ══════════════════════════════════════════════════════════════ */
function splash() {
  const el = $('#splash');
  el.classList.add('is-on');
  Sound.wake();
  setTimeout(() => { el.classList.add('is-gone'); login(); }, REDUCED ? 300 : 2600);
}

function login() {
  const el = $('#login');
  el.classList.add('is-on');
  const guest = $('#userGuest');
  guest.classList.add('is-armed');
  guest.focus?.();

  $('#userWallet').addEventListener('click', () => {
    Sound.blip(220, .12, .05);
    toast('Wallet login is not wired up yet — come in as Guest.');
  });

  const enter = () => {
    guest.removeEventListener('click', enter);
    Sound.chime();
    el.classList.add('is-gone');
    document.body.classList.remove('booting');
    boot();
  };
  guest.addEventListener('click', enter);
  addEventListener('keydown', e => { if (e.key === 'Enter' && !el.classList.contains('is-gone')) enter(); });

  $('#scanToggle').addEventListener('click', () => {
    $('#scanlines').classList.toggle('is-on');
    Sound.blip(660, .05, .04);
  });
}

/* ══════════════════════════════════════════════════════════════
   4 · APP REGISTRY
   ══════════════════════════════════════════════════════════════ */
const APPS = {
  explorer:   { title:'Toad Explorer',         icon:'ic-explorer',   tpl:'app-explorer',   w:1000, h:660, status:'Done — the pond', mount:mountExplorer },
  canal88:    { title:'Canal 88 Player',       icon:'ic-canal88',    tpl:'app-canal88',    w:660,  h:620, status:`${CHANNELS.length} tapes in the playlist`, mount:mountPlayer },
  /* Toad Run is not a window — it launches full screen, like a PC game.
     `fullscreen` short-circuits the window manager below. */
  toadrun:    { title:'Toad Run',              icon:'/toadrun/assets/icon-192.png', fullscreen:true },
  /* title and status count the array rather than hardcoding it, so adding a
     meme is still a one-line change */
  paint:      { title:'Toad Paint',            icon:'ic-paint',      tpl:'app-paint',      w:640,  h:560, status:'Untitled - Toad Paint', mount:mountPaint },
  gallery:    { title:'Toad Gallery',          icon:'ic-gallery',    tpl:'app-gallery',    w:700,  h:520, status:'Drawings from the pond', mount:mountGallery },
  memes:      { title:`Evidence — ${MEMES.length} objects`, icon:'ic-memes', tpl:'app-memes', w:640, h:500, status:`${MEMES.length} objects`, mount:mountMemes },
  viewer:     { title:'Toad Viewer',           icon:'ic-viewer',     tpl:'app-viewer',     w:720,  h:600, status:'', mount:mountViewer },
  tokenomics: { title:'Tokenomics.xls',        icon:'ic-tokenomics', tpl:'app-tokenomics', w:520,  h:470, status:'Read only' },
  buy:        { title:'HowToBuy.txt — Notepad',icon:'ic-buy',        tpl:'app-buy',        w:560,  h:520, status:'', mount:mountBuy },
  lore:       { title:'Lore.hlp — Help',       icon:'ic-lore',       tpl:'app-lore',       w:600,  h:560, status:'The Record' },
  chart:      { title:'Live chart — Dexscreener', icon:'ic-chart',   tpl:'app-chart',      w:1000, h:690, status:'Streaming from Dexscreener', mount:mountChart },
  contract:   { title:'Contract address',      icon:'ic-contract',   tpl:'app-contract',   w:460,  h:300, status:'', mount:mountContract, dialog:true },
  safety:     { title:'ReadMe.txt — Notepad',  icon:'ic-safety',     tpl:'app-safety',     w:540,  h:480, status:'' },
  bin:        { title:'Recycle Bin',           icon:'ic-bin',        tpl:'app-bin',        w:480,  h:320, status:'3 objects' },
};

/* an icon is either a sprite id or an image path */
const iconHTML = (icon, cls = 'ico') =>
  icon.startsWith('ic-')
    ? `<svg class="${cls}" viewBox="0 0 48 48" aria-hidden="true"><use href="#${icon}"/></svg>`
    : `<img class="${cls}" src="${icon}" alt="">`;

const DESKTOP_ICONS = [
  { app:'explorer',   label:'Toad Explorer' },
  { app:'canal88',    label:'Canal 88' },
  { link:'tiktok',    label:'TikTok',        icon:'ic-tiktok' },
  { app:'toadrun',    label:'Toad Run' },
  { app:'paint',      label:'Toad Paint' },
  { app:'gallery',    label:'Gallery' },
  { app:'chart',      label:'Live Chart' },
  { app:'memes',      label:'Evidence' },
  { app:'tokenomics', label:'Tokenomics.xls' },
  { app:'buy',        label:'HowToBuy.txt' },
  { app:'lore',       label:'Lore.hlp' },
  { app:'contract',   label:'Contract' },
  { app:'safety',     label:'ReadMe.txt' },
  { app:'bin',        label:'Recycle Bin' },
];

/* ══════════════════════════════════════════════════════════════
   5 · WINDOW MANAGER
   ══════════════════════════════════════════════════════════════ */
const WM = {
  open: new Map(),
  z: 10,
  cascade: 0,

  launch(id, opts = {}) {
    const app = APPS[id];
    if (!app) return;

    if (app.fullscreen) { launchGame(id); return; }

    if (this.open.has(id)) {
      const w = this.open.get(id);
      w.el.classList.remove('is-min');
      this.focus(id);
      app.mount?.(w.el, opts);
      return w;
    }

    const el = document.createElement('section');
    el.className = 'win';
    el.dataset.app = id;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', app.title);

    el.innerHTML =
      `<header class="win__bar">
         ${iconHTML(app.icon, 'win__ico')}
         <span class="win__title">${app.title}</span>
         <span class="win__btns">
           <button class="win__btn win__btn--min" data-act="min" aria-label="Minimize">_</button>
           <button class="win__btn win__btn--max" data-act="max" aria-label="Maximize">□</button>
           <button class="win__btn win__btn--x"   data-act="close" aria-label="Close">✕</button>
         </span>
       </header>
       <div class="win__body"></div>
       ${app.dialog ? '' : `<footer class="win__status"><span class="win__st">${app.status || ''}</span></footer>`}
       <span class="win__grip"></span>`;

    el.querySelector('.win__body').appendChild($('#' + app.tpl).content.cloneNode(true));

    /* geometry — cascade so stacked windows stay findable */
    const host = $('#windows');
    const maxW = host.clientWidth, maxH = host.clientHeight;
    const w = Math.min(app.w, maxW - 20), h = Math.min(app.h, maxH - 20);
    const off = (this.cascade++ % 6) * 26;
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    // start clear of the icon column on the left
    el.style.left = clamp(Math.round((maxW - w) / 2) + off, 104, Math.max(104, maxW - w - 8)) + 'px';
    el.style.top  = clamp(Math.round((maxH - h) / 2) + off - 40, 8, Math.max(8, maxH - h - 8)) + 'px';

    host.appendChild(el);

    const rec = { el, id, min: false, max: false };
    this.open.set(id, rec);

    el.addEventListener('pointerdown', () => this.focus(id), true);
    el.querySelector('.win__btns').addEventListener('click', e => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (!act) return;
      if (act === 'min')   this.minimize(id);
      if (act === 'max')   this.toggleMax(id);
      if (act === 'close') this.close(id);
    });
    el.addEventListener('click', e => { if (e.target.closest('[data-close]')) this.close(id); });

    this.drag(rec);
    this.resize(rec);
    el.querySelector('.win__bar').addEventListener('dblclick', () => this.toggleMax(id));

    app.mount?.(el, opts);
    wireLinks(el);

    this.focus(id);
    this.syncTasks();
    Sound.blip(760, .05, .035);
    return rec;
  },

  focus(id) {
    const rec = this.open.get(id);
    if (!rec) return;
    this.open.forEach(w => w.el.classList.add('is-blur'));
    rec.el.classList.remove('is-blur', 'is-min');
    rec.min = false;
    rec.el.style.zIndex = ++this.z;
    this.syncTasks();
  },

  minimize(id) {
    const rec = this.open.get(id);
    if (!rec) return;
    rec.min = true;
    rec.el.classList.add('is-min');
    Sound.blip(420, .06, .03);
    this.syncTasks();
  },

  toggleMax(id) {
    const rec = this.open.get(id);
    if (!rec || SMALL()) return;
    rec.max = !rec.max;
    rec.el.classList.toggle('is-max', rec.max);
    Sound.blip(rec.max ? 900 : 620, .05, .03);
  },

  close(id) {
    const rec = this.open.get(id);
    if (!rec) return;
    if (id === 'canal88') stopTape();
    rec.el.remove();
    this.open.delete(id);
    Sound.blip(340, .07, .035);
    this.syncTasks();
  },

  drag(rec) {
    const bar = rec.el.querySelector('.win__bar');
    let sx = 0, sy = 0, ox = 0, oy = 0, on = false;
    bar.addEventListener('pointerdown', e => {
      if (e.target.closest('.win__btns') || rec.max || SMALL()) return;
      on = true;
      sx = e.clientX; sy = e.clientY;
      ox = rec.el.offsetLeft; oy = rec.el.offsetTop;
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener('pointermove', e => {
      if (!on) return;
      const host = $('#windows');
      rec.el.style.left = clamp(ox + e.clientX - sx, -rec.el.offsetWidth + 90, host.clientWidth - 60) + 'px';
      rec.el.style.top  = clamp(oy + e.clientY - sy, 0, host.clientHeight - 34) + 'px';
    });
    const up = e => { if (!on) return; on = false; try { bar.releasePointerCapture(e.pointerId); } catch {} };
    bar.addEventListener('pointerup', up);
    bar.addEventListener('pointercancel', up);
  },

  resize(rec) {
    const grip = rec.el.querySelector('.win__grip');
    let sx = 0, sy = 0, ow = 0, oh = 0, on = false;
    grip.addEventListener('pointerdown', e => {
      if (rec.max || SMALL()) return;
      on = true; e.stopPropagation();
      sx = e.clientX; sy = e.clientY;
      ow = rec.el.offsetWidth; oh = rec.el.offsetHeight;
      grip.setPointerCapture(e.pointerId);
    });
    grip.addEventListener('pointermove', e => {
      if (!on) return;
      rec.el.style.width  = Math.max(280, ow + e.clientX - sx) + 'px';
      rec.el.style.height = Math.max(160, oh + e.clientY - sy) + 'px';
    });
    const up = e => { if (!on) return; on = false; try { grip.releasePointerCapture(e.pointerId); } catch {} };
    grip.addEventListener('pointerup', up);
    grip.addEventListener('pointercancel', up);
  },

  syncTasks() {
    const bar = $('#tasks');
    bar.innerHTML = '';
    this.open.forEach((rec, id) => {
      const app = APPS[id];
      const b = document.createElement('button');
      b.className = 'task' + (!rec.min && !rec.el.classList.contains('is-blur') ? ' is-active' : '');
      b.innerHTML = iconHTML(app.icon, 'task__ico') + `<span>${app.title}</span>`;
      b.addEventListener('click', () => {
        if (rec.min) { rec.el.classList.remove('is-min'); rec.min = false; this.focus(id); }
        else if (!rec.el.classList.contains('is-blur')) this.minimize(id);
        else this.focus(id);
      });
      bar.appendChild(b);
    });
  },
};

/* ══════════════════════════════════════════════════════════════
   FULL-SCREEN GAME LAUNCHER
   Toad Run does not open in a window. Double-click and the desktop
   hands the whole screen over — a black launch frame, then the game
   — exactly how a PC game took over the machine. The game quits
   itself back to the desktop with a postMessage.
   ══════════════════════════════════════════════════════════════ */
let gameFS = null;
function launchGame(id) {
  if (gameFS) return;                       // already running
  closeStart();
  Sound.blip(760, .05, .035);

  gameFS = document.createElement('div');
  gameFS.className = 'gamefs';
  gameFS.innerHTML = `<iframe class="gamefs__frame" title="Toad Run" allow="fullscreen"></iframe>`;
  document.body.appendChild(gameFS);

  /* black first, then the frame fades in — the "launch" beat */
  requestAnimationFrame(() => gameFS.classList.add('is-on'));
  const frame = gameFS.querySelector('iframe');
  frame.src = '/toadrun/';                  // trailing slash matters, as ever
  setTimeout(() => { try { frame.contentWindow.focus(); } catch (e) {} }, 300);

  /* real browser fullscreen while we still hold the user gesture */
  gameFS.requestFullscreen?.().catch(() => { /* denied is fine — the overlay is full-bleed anyway */ });
}
function quitGame() {
  if (!gameFS) return;
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  gameFS.classList.remove('is-on');
  const g = gameFS;
  gameFS = null;
  setTimeout(() => g.remove(), 350);
  Sound.croak();
}
addEventListener('message', e => {
  if (e.origin === location.origin && e.data && e.data.type === 'toadrun:quit') quitGame();
});

/* ══════════════════════════════════════════════════════════════
   DESKTOP ICONS — drag, snap, remember
   Icons sit on a grid of squares. Drag one and it lands in the
   nearest free square, exactly like the machine this imitates,
   and the arrangement survives a reload.
   ══════════════════════════════════════════════════════════════ */
const CELL_W = 104, CELL_H = 106;
const SPOT_KEY = 'toados.icons';

function loadIconSpots() {
  try {
    const raw = JSON.parse(localStorage.getItem(SPOT_KEY) || '{}');
    return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
  } catch (e) { return {}; }
}
function saveIconSpots(spots) {
  try { localStorage.setItem(SPOT_KEY, JSON.stringify(spots)); } catch (e) {}
}

/* How many squares fit down the screen before the taskbar cuts them off. */
function gridRows() {
  const host = $('#icons');
  const h = host ? host.clientHeight : innerHeight - 90;
  return Math.max(1, Math.floor(h / CELL_H));
}
function firstFreeCell(taken, from = 0) {
  const rows = gridRows();
  for (let i = from; i < from + 200; i++) {
    const c = Math.floor(i / rows), r = i % rows;
    if (!taken.has(c + ',' + r)) return { c, r };
  }
  return { c: 0, r: 0 };
}
function placeIcon(el, cell) {
  el.style.left = (cell.c * CELL_W) + 'px';
  el.style.top  = (cell.r * CELL_H) + 'px';
  el.dataset.c = cell.c;
  el.dataset.r = cell.r;
}

function makeIconDraggable(el) {
  let sx = 0, sy = 0, ox = 0, oy = 0, moved = false, id = null;

  el.addEventListener('pointerdown', e => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    id = e.pointerId; moved = false;
    sx = e.clientX; sy = e.clientY;
    ox = parseFloat(el.style.left) || 0;
    oy = parseFloat(el.style.top)  || 0;
    /* Capture keeps the drag alive when the cursor outruns the icon. Some
       pointers refuse it; the drag still works, it just needs the cursor to
       stay over the element — better than losing the handler to a throw. */
    try { el.setPointerCapture(id); } catch (err) {}
  });

  el.addEventListener('pointermove', e => {
    if (id === null || e.pointerId !== id) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    /* Four pixels of slack: a click stays a click, and a double-click still
       opens the app instead of nudging it half a square. */
    if (!moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
    moved = true;
    el.classList.add('is-dragging');
    el.style.left = (ox + dx) + 'px';
    el.style.top  = (oy + dy) + 'px';
  });

  const drop = e => {
    if (id === null || (e && e.pointerId !== id)) return;
    try { el.releasePointerCapture(id); } catch (err) {}
    id = null;
    if (!moved) return;
    el.classList.remove('is-dragging');

    const host = $('#icons');
    const maxC = Math.max(0, Math.floor((host.clientWidth  - CELL_W) / CELL_W));
    const maxR = gridRows() - 1;
    let c = clamp(Math.round(parseFloat(el.style.left) / CELL_W), 0, maxC);
    let r = clamp(Math.round(parseFloat(el.style.top)  / CELL_H), 0, maxR);

    /* If the square is occupied, the dropped icon takes it and the previous
       tenant moves to the nearest free one — nothing is ever hidden under
       another icon. */
    const other = $$('.icon', host).find(o => o !== el && +o.dataset.c === c && +o.dataset.r === r);
    placeIcon(el, { c, r });
    if (other) {
      const taken = new Set($$('.icon', host).map(o => o.dataset.c + ',' + o.dataset.r));
      placeIcon(other, firstFreeCell(taken));
    }

    const spots = {};
    $$('.icon', host).forEach(o => { spots[o.dataset.spot] = { c: +o.dataset.c, r: +o.dataset.r }; });
    saveIconSpots(spots);
    Sound.blip(520, .03, .025);
  };
  el.addEventListener('pointerup', drop);
  el.addEventListener('pointercancel', drop);
  /* A drag that ends on an icon must not also count as opening it. */
  el.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);
}

/* ══════════════════════════════════════════════════════════════
   DESKTOP CONTEXT MENU
   Right-click the wallpaper, like the machine this is pretending
   to be. The wallpaper choice is the only thing here that sticks.
   ══════════════════════════════════════════════════════════════ */
/* `fit` mirrors the old Display Properties: cover fills the screen, centre
   sets the picture down at its own shape on a plain ground — which is what a
   portrait picture needs, since stretching one across a wide monitor costs it
   its head. Kept for the wallpaper Max is making. */
const WALLPAPERS = [
  { id:'bliss',   name:'Bliss',            fit:'cover',  file:'/assets/brand/wallpaper.jpg',         thumb:'/assets/brand/thumb-wallpaper.jpg' },
  { id:'cloud',   name:'Toad in the Sky',  fit:'cover',  file:'/assets/brand/wallpaper-cloud.jpg',   thumb:'/assets/brand/thumb-wallpaper-cloud.jpg' },
];
const WALL_KEY = 'toados.wallpaper';

function customWallpaper() {
  try { return localStorage.getItem(CUSTOM_WALL_KEY); } catch (e) { return null; }
}
function applyWallpaper(id, remember = true) {
  /* A drawing from Toad Paint is not in the list — it lives in storage as a
     data url and only appears once somebody has made one. */
  if (id === 'custom') {
    const data = customWallpaper();
    if (data) {
      const el = $('.wall');
      if (el) { el.src = data; el.classList.remove('wall--centre'); }
      if (remember) { try { localStorage.setItem(WALL_KEY, 'custom'); } catch (e) {} }
      return 'custom';
    }
    id = 'bliss';
  }
  const w = WALLPAPERS.find(x => x.id === id) || WALLPAPERS[0];
  const el = $('.wall');
  if (el) {
    el.src = w.file;
    el.classList.toggle('wall--centre', w.fit === 'centre');
  }
  if (remember) { try { localStorage.setItem(WALL_KEY, w.id); } catch (e) {} }
  return w.id;
}
function savedWallpaper() {
  try { return localStorage.getItem(WALL_KEY) || 'bliss'; } catch (e) { return 'bliss'; }
}

let ctxEl = null;
function closeCtx() { if (ctxEl) { ctxEl.remove(); ctxEl = null; } }

function openCtx(x, y) {
  closeCtx();
  const current = savedWallpaper();
  const menu = document.createElement('ul');
  menu.className = 'ctx';

  const row = (html, fn, cls = '') => {
    const li = document.createElement('li');
    if (cls) li.className = cls;
    li.innerHTML = html;
    if (fn) li.addEventListener('click', () => { fn(); closeCtx(); });
    return li;
  };

  menu.append(
    row('<span>Refresh</span>', () => { buildIcons(); Sound.blip(700, .04, .03); }),
    row('<span>Align icons to grid</span>', () => {
      try { localStorage.removeItem(SPOT_KEY); } catch (e) {}
      buildIcons(); Sound.blip(660, .05, .03);
    }),
    row('', null, 'sep'),
    row('<small class="ctx__head">Change wallpaper</small>', null, 'head'),
  );
  const drawn = customWallpaper();
  if (drawn) {
    menu.appendChild(row(
      `<img class="ctx__thumb" src="${drawn}" alt="" /><span>My drawing</span>` +
      (current === 'custom' ? '<b class="ctx__tick">✓</b>' : ''),
      () => { applyWallpaper('custom'); Sound.blip(880, .05, .03); },
    ));
  }
  WALLPAPERS.forEach(w => {
    menu.appendChild(row(
      `<img class="ctx__thumb" src="${w.thumb}" alt="" /><span>${w.name}</span>` +
      (w.id === current ? '<b class="ctx__tick">✓</b>' : ''),
      () => { applyWallpaper(w.id); Sound.blip(880, .05, .03); },
    ));
  });
  menu.append(
    row('', null, 'sep'),
    row('<span>Toggle scanlines</span>', () => $('#scanlines').classList.toggle('is-on')),
  );

  document.body.appendChild(menu);
  /* keep it on screen — a menu opened near the right edge must not vanish */
  const r = menu.getBoundingClientRect();
  menu.style.left = Math.min(x, innerWidth  - r.width  - 6) + 'px';
  menu.style.top  = Math.min(y, innerHeight - r.height - 6) + 'px';
  ctxEl = menu;
}

/* turn any data-open / data-cfg inside a window into working links */
function wireLinks(root) {
  $$('[data-open]', root).forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); WM.launch(el.dataset.open); });
  });
  $$('[data-cfg]', root).forEach(el => {
    const url = CONFIG[el.dataset.cfg];
    if (url) el.href = url;
  });
}

/* ══════════════════════════════════════════════════════════════
   6 · DESKTOP CHROME
   ══════════════════════════════════════════════════════════════ */
function boot() {
  $('#desktop').classList.add('is-on');
  applyWallpaper(savedWallpaper(), false);   // restore the visitor's choice
  buildIcons();
  buildStartMenu();
  clock();
  WM.launch('explorer');
  setTimeout(() => assistant(`Welcome, fren. Everything lives behind the start button — or double-click an icon. Canal 88 has ${CHANNELS.length} tapes.`), 1400);
  scheduleAssistant();
}

function buildIcons() {
  const host = $('#icons');
  host.innerHTML = '';
  const placed = loadIconSpots();
  const taken = new Set();
  DESKTOP_ICONS.forEach(({ app, label, link, icon }, idx) => {
    // an icon either opens an app window or, with `link`, a CONFIG url off-site
    const glyph = icon || APPS[app].icon;
    const openIt = link
      ? () => open(CONFIG[link], '_blank', 'noopener')
      : () => WM.launch(app);
    const el = document.createElement('button');
    el.className = 'icon';
    el.innerHTML = `<span class="icon__img">${iconHTML(glyph)}</span><span>${label}</span>`;
    // single click selects, double click opens — as it should be
    el.addEventListener('click', () => {
      $$('.icon', host).forEach(i => i.classList.remove('is-sel'));
      el.classList.add('is-sel');
    });
    el.addEventListener('dblclick', openIt);
    // touch has no dblclick worth relying on
    if (matchMedia('(pointer: coarse)').matches) {
      el.addEventListener('click', openIt);
    }

    /* Every icon carries its own square on the grid. A saved spot wins; the
       rest fall into the first free square, so the desktop never stacks two
       icons on top of each other after a rename or a new entry. */
    const key = app || ('link:' + link);
    el.dataset.spot = key;
    let cell = placed[key];
    if (!cell || taken.has(cell.c + ',' + cell.r)) cell = firstFreeCell(taken, idx);
    taken.add(cell.c + ',' + cell.r);
    placeIcon(el, cell);
    makeIconDraggable(el);

    host.appendChild(el);
  });
  $('#desktop').addEventListener('pointerdown', e => {
    if (!e.target.closest('.icon')) $$('.icon', host).forEach(i => i.classList.remove('is-sel'));
    if (!e.target.closest('#startMenu') && !e.target.closest('#startBtn')) closeStart();
    if (!e.target.closest('.ctx')) closeCtx();
  });

  /* Only the bare desktop gets our menu — inside a window the browser's own
     right-click stays, so copying a contract address still works. */
  $('#desktop').addEventListener('contextmenu', e => {
    if (e.target.closest('.win') || e.target.closest('.taskbar') || e.target.closest('.startmenu')) return;
    e.preventDefault();
    openCtx(e.clientX, e.clientY);
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeCtx(); });
  addEventListener('blur', closeCtx);
}

function buildStartMenu() {
  const left = $('#startLeft'), right = $('#startRight');
  const item = (icon, label, sub, fn) => {
    const li = document.createElement('li');
    li.innerHTML = iconHTML(icon, 'menu__ico') +
      `<span><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</span>`;
    li.addEventListener('click', () => { fn(); closeStart(); });
    return li;
  };
  const sep = () => { const li = document.createElement('li'); li.className = 'sep'; return li; };

  left.innerHTML = ''; right.innerHTML = '';
  left.append(
    item('ic-explorer', 'Toad Explorer', 'The whole story', () => WM.launch('explorer')),
    item('ic-canal88',  'Canal 88 Player', `${CHANNELS.length} tapes`, () => WM.launch('canal88')),
    item('/toadrun/assets/icon-192.png', 'Toad Run', 'Full screen. He runs.', () => WM.launch('toadrun')),
    item('ic-paint',    'Toad Paint', 'Draw something', () => WM.launch('paint')),
    item('ic-gallery',  'Toad Gallery', 'What others drew', () => WM.launch('gallery')),
    item('ic-memes',    'Evidence', `${MEMES.length} memes`, () => WM.launch('memes')),
    sep(),
    item('ic-tokenomics', 'Tokenomics.xls', '', () => WM.launch('tokenomics')),
    item('ic-buy',        'HowToBuy.txt', '', () => WM.launch('buy')),
    item('ic-lore',       'Lore.hlp', '', () => WM.launch('lore')),
    item('ic-safety',     'ReadMe.txt', '', () => WM.launch('safety')),
  );

  right.append(
    item('ic-contract', 'Contract address', '', () => WM.launch('contract')),
    item(LOGO, 'Buy on pump.fun', '', () => open(CONFIG.buy, '_blank', 'noopener')),
    item('ic-chart', 'Live chart', 'Opens here', () => WM.launch('chart')),
    sep(),
    item(LOGO, 'X / Twitter', '', () => open(CONFIG.x, '_blank', 'noopener')),
    item(LOGO, 'X Community', '', () => open(CONFIG.community, '_blank', 'noopener')),
    item(LOGO, 'TikTok', '', () => open(CONFIG.tiktok, '_blank', 'noopener')),
    sep(),
    item('ic-canal88', 'Toggle scanlines', '', () => $('#scanlines').classList.toggle('is-on')),
    item('ic-bin', 'Recycle Bin', '', () => WM.launch('bin')),
  );

  const btn = $('#startBtn'), menu = $('#startMenu');
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = menu.hidden;
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    Sound.blip(open ? 720 : 480, .06, .04);
  });
  $('#logOff').addEventListener('click', () => location.reload());
  $('#shutDown').addEventListener('click', () => {
    closeStart();
    document.body.style.transition = 'opacity .6s';
    document.body.style.opacity = '0';
    setTimeout(() => location.reload(), 700);
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeStart(); });
}
function closeStart() {
  const m = $('#startMenu');
  if (!m || m.hidden) return;
  m.hidden = true;
  $('#startBtn').setAttribute('aria-expanded', 'false');
}

function clock() {
  const el = $('#clock');
  const tick = () => {
    const d = new Date();
    let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    el.textContent = `${h}:${String(d.getMinutes()).padStart(2, '0')} ${ap}`;
  };
  tick(); setInterval(tick, 20000);
  $('#trayVol').addEventListener('click', () => {
    const muted = Sound.toggle();
    $('#trayVol').textContent = muted ? '🔇' : '🔊';
  });

  /* The television zaps to a tape at random. It clicks the playlist row
     rather than reaching into the player, so tuning, static and blip all
     run exactly as they do when a visitor picks one by hand. */
  $('#trayTv').addEventListener('click', () => {
    WM.launch('canal88');
    const win = WM.open.get('canal88')?.el;
    const items = win ? $$('#channels li', win) : [];
    if (!items.length) return;
    let i;
    do { i = Math.floor(Math.random() * items.length); }
    while (i === tapeCurrent && items.length > 1);
    items[i].click();
  });

  /* The pond has always been on dial-up. */
  let netState = 0;
  const NET_LINES = [
    'You are now connected to the pond. Speed: 56.6 Kbps.',
    'A network cable is unplugged. The pond is unreachable. Try croaking louder.',
    'Acquiring network address... the pond is thinking about it.',
  ];
  $('#trayNet').addEventListener('click', () => {
    assistant(NET_LINES[netState % NET_LINES.length]);
    netState += 1;
  });
}

/* the assistant, mercifully closeable */
let assistTimer;
function assistant(msg) {
  const el = $('#clip');
  $('#clipText').textContent = msg;
  el.hidden = false;
  clearTimeout(assistTimer);
  assistTimer = setTimeout(() => (el.hidden = true), 11000);
}
$('#clipX').addEventListener('click', () => ($('#clip').hidden = true));

/* ── the assistant speaks up on its own ───────────────────────────
   Half of these quietly carry the safety line, so the warning reaches
   people who never open ReadMe.txt. */
const ASSIST_LINES = [
  'It looks like you are trying to buy a toad. Would you like help with that?',
  'Canal 88 has been broadcasting since 1988. Your browser is only now catching up.',
  'Nobody from this desktop will ever DM you first.',
  'Never give your seed phrase to a toad. Or to anyone else.',
  'If a stranger offers you a presale, it is not us. There is no presale.',
  'Defragmenting the pond... 3% complete. Estimated time remaining: 1988.',
  'Pepe arrived in 2005. The toad was already on air seventeen years earlier.',
  'Always check the contract against Solscan before you buy. A wrong address costs real money.',
  'Windows found new hardware: one (1) toad.',
  'Your free trial of ToadOS expired in 1994. Enjoy the full version.',
  'Tip: you can toggle the scanlines from the start menu.',
  'This desktop is not financial advice. It is barely a desktop.',
];

/* Never twice in a row, never on top of a balloon that is still up, and
   never while the tab is in the background — nobody wants to come back to
   a queue of them. */
let lastLine = -1;
function scheduleAssistant() {
  const wait = 45000 + Math.floor(Math.random() * 45000);
  setTimeout(() => {
    const clip = $('#clip');
    if (clip && clip.hidden && !document.hidden) {
      let i;
      do { i = Math.floor(Math.random() * ASSIST_LINES.length); }
      while (i === lastLine && ASSIST_LINES.length > 1);
      lastLine = i;
      assistant(ASSIST_LINES[i]);
    }
    scheduleAssistant();
  }, wait);
}

/* a toast that looks like a tooltip */
function toast(msg) {
  assistant(msg);
}

/* ══════════════════════════════════════════════════════════════
   7 · APP MOUNTS
   ══════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════
   TOAD PAINT
   The one program everybody opened first. Pencil, shapes, a fill
   bucket and the twenty-eight colours, on a canvas — no library.
   ══════════════════════════════════════════════════════════════ */
const PAINT_COLOURS = [
  '#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080',
  '#808040','#004040','#0080ff','#004080','#8000ff','#804000','#ffffff','#c0c0c0',
  '#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff','#ffff80','#00ff80',
  '#80ffff','#8080ff','#ff0080','#ff8040',
];
/* Drawn rather than typed: an emoji brush renders as an empty box wherever
   the font lacks it, which is most places. */
const svg = d => '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">' + d + '</svg>';
const PAINT_TOOLS = [
  { id:'pencil',  label:'Pencil',    glyph: svg('<path d="M2 14l1-3 8-8 2 2-8 8z" fill="#f5c518" stroke="#5a4a10"/><path d="M11 3l1.4-1.4 2 2L13 5z" fill="#8d99a8" stroke="#3b4450"/>') },
  { id:'brush',   label:'Brush',     glyph: svg('<path d="M3 13c0-2 1-3 2-3s2 1 2 2-1 2-4 2z" fill="#e0342a" stroke="#6d1a15"/><path d="M6 10l6-7 3 2-6 7z" fill="#c9a06a" stroke="#7a5a2e"/>') },
  { id:'eraser',  label:'Eraser',    glyph: svg('<rect x="2" y="8" width="9" height="5" rx="1" fill="#fff" stroke="#5a6470"/><path d="M5 8l4-5 5 3-3 5z" fill="#f2a0a0" stroke="#7a3b3b"/>') },
  { id:'fill',    label:'Fill',      glyph: svg('<path d="M3 8l5-5 5 5-5 5z" fill="#2f7ddb" stroke="#123a70"/><path d="M13 10c1 1.5 1.5 2.2 1.5 3a1.5 1.5 0 0 1-3 0c0-.8.5-1.5 1.5-3z" fill="#74c13b" stroke="#2c5a14"/>') },
  { id:'line',    label:'Line',      glyph: svg('<path d="M3 13L13 3" stroke="#000" stroke-width="1.6"/>') },
  { id:'rect',    label:'Rectangle', glyph: svg('<rect x="2.5" y="4.5" width="11" height="7" fill="none" stroke="#000" stroke-width="1.4"/>') },
  { id:'ellipse', label:'Ellipse',   glyph: svg('<ellipse cx="8" cy="8" rx="5.5" ry="4.5" fill="none" stroke="#000" stroke-width="1.4"/>') },
  { id:'spray',   label:'Spray',     glyph: svg('<g fill="#000"><circle cx="6" cy="5" r=".9"/><circle cx="9" cy="7" r=".9"/><circle cx="5" cy="9" r=".9"/><circle cx="10" cy="11" r=".9"/><circle cx="7" cy="12" r=".9"/><circle cx="12" cy="8" r=".9"/></g>') },
];
const PAINT_SIZES = [1, 3, 6, 12];
const CUSTOM_WALL_KEY = 'toados.wall.custom';

/* ══════════════════════════════════════════════════════════════
   PUBLIC GALLERY
   Anyone may submit a drawing; nobody may publish one. Rows land
   with approved=false and the database refuses anything else — the
   key below is a publishable one and is meant to be here, but it
   only works because the row-level rules do.
   ══════════════════════════════════════════════════════════════ */
const GAL_URL = 'https://cnpkiasoianvabctmvym.supabase.co/rest/v1/toad_gallery';
const GAL_KEY = 'sb_publishable_JqeJrbDTeEJGPc-kYU81jQ_tcXL5m9o';
const GAL_HEAD = { apikey: GAL_KEY, Authorization: 'Bearer ' + GAL_KEY, 'Content-Type': 'application/json' };

async function galleryFetch() {
  const r = await fetch(GAL_URL + '?select=id,name,image,created_at&order=created_at.desc&limit=60', { headers: GAL_HEAD });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

async function gallerySubmit(name, dataUrl) {
  const r = await fetch(GAL_URL, {
    method: 'POST',
    headers: { ...GAL_HEAD, Prefer: 'return=minimal' },
    body: JSON.stringify({ name: name.slice(0, 24), image: dataUrl }),
  });
  if (!r.ok) throw new Error(await r.text());
}

function mountGallery(win) {
  const grid = $('#galGrid', win), count = $('#galCount', win);

  async function render() {
    grid.innerHTML = '';
    count.textContent = 'loading…';
    try {
      const rows = await galleryFetch();
      count.textContent = rows.length === 1 ? '1 picture' : rows.length + ' pictures';
      if (!rows.length) {
        count.textContent = 'nothing here yet';
        return;
      }
      rows.forEach(row => {
        const b = document.createElement('button');
        b.className = 'file';
        const img = document.createElement('img');
        img.className = 'file__thumb'; img.loading = 'lazy'; img.alt = '';
        img.src = row.image;                         // src, never innerHTML
        const cap = document.createElement('span');
        cap.textContent = row.name;                  // textContent: the name is a stranger's text
        b.append(img, cap);
        b.addEventListener('click', () => {
          $$('.file', grid).forEach(f => f.classList.remove('is-sel'));
          b.classList.add('is-sel');
        });
        grid.appendChild(b);
      });
    } catch (e) {
      count.textContent = 'could not load the gallery';
    }
  }

  $('#galReload', win).addEventListener('click', () => { Sound.blip(700, .04, .03); render(); });
  render();
}

function mountPaint(win) {
  const cv   = $('#ptCanvas', win);
  const ctx  = cv.getContext('2d', { willReadFrequently: true });
  const tools = $('#ptTools', win), sizes = $('#ptSizes', win);
  const pal  = $('#ptPalette', win), cur = $('#ptCurrent', win);

  let tool = 'pencil', colour = '#000000', size = 3;
  let drawing = false, sx = 0, sy = 0, snapshot = null;
  const undo = [];

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const push = () => { undo.push(ctx.getImageData(0, 0, cv.width, cv.height)); if (undo.length > 20) undo.shift(); };

  /* The canvas is drawn at a fixed 560x360 but displayed at whatever the
     window allows, so every pointer position has to be scaled back. */
  const pos = e => {
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (cv.width / r.width), y: (e.clientY - r.top) * (cv.height / r.height) };
  };

  tools.innerHTML = '';
  PAINT_TOOLS.forEach(t => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pt' + (t.id === tool ? ' is-on' : '');
    b.title = t.label; b.innerHTML = t.glyph;
    b.addEventListener('click', () => {
      tool = t.id;
      $$('.pt', tools).forEach(x => x.classList.remove('is-on'));
      b.classList.add('is-on');
      Sound.blip(720, .03, .025);
    });
    tools.appendChild(b);
  });

  sizes.innerHTML = '';
  PAINT_SIZES.forEach(n => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pt pt--size' + (n === size ? ' is-on' : '');
    b.title = n + ' px';
    b.innerHTML = `<i style="width:${Math.min(n, 12)}px;height:${Math.min(n, 12)}px"></i>`;
    b.addEventListener('click', () => {
      size = n;
      $$('.pt--size', sizes).forEach(x => x.classList.remove('is-on'));
      b.classList.add('is-on');
    });
    sizes.appendChild(b);
  });

  cur.style.background = colour;
  pal.innerHTML = '';
  PAINT_COLOURS.forEach(c => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pc'; b.style.background = c; b.title = c;
    b.addEventListener('click', () => { colour = c; cur.style.background = c; });
    pal.appendChild(b);
  });

  /* ── flood fill, four-way, on a copy of the pixels ── */
  function fill(x, y, hex) {
    const img = ctx.getImageData(0, 0, cv.width, cv.height), d = img.data;
    const at = (px, py) => (py * cv.width + px) * 4;
    const start = at(x | 0, y | 0);
    const t = [d[start], d[start + 1], d[start + 2], d[start + 3]];
    const m = hex.match(/\w\w/g).map(h => parseInt(h, 16));
    if (t[0] === m[0] && t[1] === m[1] && t[2] === m[2] && t[3] === 255) return;
    const stack = [[x | 0, y | 0]];
    while (stack.length) {
      const [px, py] = stack.pop();
      if (px < 0 || py < 0 || px >= cv.width || py >= cv.height) continue;
      const i = at(px, py);
      if (d[i] !== t[0] || d[i+1] !== t[1] || d[i+2] !== t[2] || d[i+3] !== t[3]) continue;
      d[i] = m[0]; d[i+1] = m[1]; d[i+2] = m[2]; d[i+3] = 255;
      stack.push([px+1, py], [px-1, py], [px, py+1], [px, py-1]);
    }
    ctx.putImageData(img, 0, 0);
  }

  function stroke(a, b) {
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : colour;
    ctx.lineWidth = tool === 'brush' ? size * 2 : tool === 'eraser' ? size * 3 : size;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }

  cv.addEventListener('pointerdown', e => {
    e.preventDefault();
    const p = pos(e);
    push();
    if (tool === 'fill') { fill(p.x, p.y, colour); return; }
    drawing = true; sx = p.x; sy = p.y;
    snapshot = ctx.getImageData(0, 0, cv.width, cv.height);
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') stroke(p, p);
  });

  cv.addEventListener('pointermove', e => {
    if (!drawing) return;
    const p = pos(e);
    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      stroke({ x: sx, y: sy }, p); sx = p.x; sy = p.y; return;
    }
    if (tool === 'spray') {
      ctx.fillStyle = colour;
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2, r = Math.random() * size * 2.5;
        ctx.fillRect(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, 1, 1);
      }
      return;
    }
    /* shapes redraw from the snapshot, so dragging previews instead of smearing */
    ctx.putImageData(snapshot, 0, 0);
    ctx.strokeStyle = colour; ctx.lineWidth = size;
    ctx.beginPath();
    if (tool === 'line') { ctx.moveTo(sx, sy); ctx.lineTo(p.x, p.y); }
    if (tool === 'rect') ctx.rect(sx, sy, p.x - sx, p.y - sy);
    if (tool === 'ellipse') ctx.ellipse((sx + p.x) / 2, (sy + p.y) / 2, Math.abs(p.x - sx) / 2, Math.abs(p.y - sy) / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  });

  const stop = () => { drawing = false; snapshot = null; };
  cv.addEventListener('pointerup', stop);
  cv.addEventListener('pointercancel', stop);
  cv.addEventListener('pointerleave', () => { if (tool !== 'pencil' && tool !== 'brush' && tool !== 'eraser') stop(); });

  $('#ptUndo', win).addEventListener('click', () => {
    const last = undo.pop();
    if (last) ctx.putImageData(last, 0, 0);
  });
  $('#ptClear', win).addEventListener('click', () => {
    push(); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, cv.width, cv.height);
  });

  $('#ptWall', win).addEventListener('click', () => {
    try {
      localStorage.setItem(CUSTOM_WALL_KEY, cv.toDataURL('image/png'));
      applyWallpaper('custom');
      toast('Your drawing is now the wallpaper. Right-click the desktop to change it back.');
    } catch (err) {
      toast('The drawing was too large to keep. Try clearing some of it.');
    }
  });

  $('#ptSubmit', win).addEventListener('click', async () => {
    const name = (prompt('Sign it — what name should appear under your picture?') || '').trim();
    if (!name) return;
    const btn = $('#ptSubmit', win);
    btn.disabled = true;
    try {
      await gallerySubmit(name, cv.toDataURL('image/png'));
      toast('Sent. It appears in the gallery once it has been looked at.');
    } catch (e) {
      toast('That did not go through. Maybe the drawing is too large — try clearing some of it.');
    }
    btn.disabled = false;
  });

  $('#ptShare', win).addEventListener('click', () => {
    cv.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'toad-paint.png'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      open('https://x.com/intent/post?text=' + encodeURIComponent(
        'made this in Toad Paint 🐸🎨\n\nthetoadmeme.com'
      ), '_blank', 'noopener');
    }, 'image/png');
  });
}

function mountExplorer(win) {
  $$('.ie__tb[data-nav]', win).forEach(b => b.addEventListener('click', () => Sound.blip(600, .04, .03)));
}

/* Dexscreener in a window rather than a new tab. Their embed mode is built
   for this; if they ever refuse the frame, the fallback panel stays up and
   points at the button that opens it properly. */
function mountChart(win) {
  const frame = $('#chartFrame', win), load = $('#chartLoad', win);
  const embed = CONFIG.ca
    ? `https://dexscreener.com/solana/${CONFIG.ca}?embed=1&theme=dark&trades=1&info=0`
    : 'https://dexscreener.com/solana?embed=1&theme=dark';

  $('#chartUrl', win).textContent = 'dexscreener.com/solana/' +
    (CONFIG.ca ? CONFIG.ca.slice(0, 6) + '…' + CONFIG.ca.slice(-4) : '');
  $('#chartOpen', win).href = CONFIG.chart;

  let arrived = false;
  frame.addEventListener('load', () => { arrived = true; load.hidden = true; }, { once: true });
  frame.src = embed;

  setTimeout(() => { if (!arrived) load.classList.add('is-fail'); }, 9000);
}

function mountContract(win) {
  const ca = CONFIG.ca || 'Not announced yet — watch @thetoadmeme_';
  $('#dlgCA', win).textContent = ca;
  $('#dlgScan', win).href = CONFIG.scan;
  $('#dlgCopy', win).addEventListener('click', () => copyCA());
}

function mountBuy(win) {
  $('#padCA', win).textContent = CONFIG.ca || 'Not announced yet — watch @thetoadmeme_';
  $('#padBuy', win).href = CONFIG.buy;
  $('#padCopy', win).addEventListener('click', () => copyCA());
}

async function copyCA() {
  if (!CONFIG.ca) { assistant('No contract yet. Watch @thetoadmeme_.'); return; }
  try { await navigator.clipboard.writeText(CONFIG.ca); }
  catch {
    const ta = document.createElement('textarea');
    ta.value = CONFIG.ca; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch {}
    ta.remove();
  }
  Sound.croak();
  assistant('Contract copied. Check it against Solscan before you buy — a wrong address costs real money.');
}

/* ── memes ── */
let memeOrder = MEMES.map((_, i) => i);
function mountMemes(win) {
  const grid = $('#memeGrid', win);
  const render = () => {
    grid.innerHTML = '';
    memeOrder.forEach(idx => {
      const m = MEMES[idx];
      const b = document.createElement('button');
      b.className = 'file';
      b.innerHTML = `<img class="file__thumb" src="/assets/memes/thumb/${m.f}.jpg" alt="" loading="lazy">` +
                    `<span>${m.cap}.jpg</span>`;
      b.addEventListener('click', () => {
        $$('.file', grid).forEach(f => f.classList.remove('is-sel'));
        b.classList.add('is-sel');
      });
      b.addEventListener('dblclick', () => WM.launch('viewer', { index: idx }));
      if (matchMedia('(pointer: coarse)').matches) {
        b.addEventListener('click', () => WM.launch('viewer', { index: idx }));
      }
      grid.appendChild(b);
    });
    $('#memeCount', win).textContent = `${MEMES.length} objects`;
  };
  render();
  $('#memeShuffle', win).addEventListener('click', () => {
    for (let i = memeOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [memeOrder[i], memeOrder[j]] = [memeOrder[j], memeOrder[i]];
    }
    render();
    Sound.croak();
  });
}

let viewerIndex = 0;
function mountViewer(win, opts = {}) {
  if (typeof opts.index === 'number') viewerIndex = opts.index;
  const img = $('#viewerImg', win), cap = $('#viewerCap', win);
  const show = () => {
    const m = MEMES[viewerIndex];
    img.src = `/assets/memes/${m.f}.jpg`;
    img.alt = m.cap;
    cap.textContent = `${m.cap}.jpg — ${viewerIndex + 1} of ${MEMES.length}`;
    const t = win.querySelector('.win__title');
    if (t) t.textContent = `${m.cap}.jpg — Toad Viewer`;
    const st = win.querySelector('.win__st');
    if (st) st.textContent = `${viewerIndex + 1} of ${MEMES.length}`;
  };
  const step = d => { viewerIndex = (viewerIndex + d + MEMES.length) % MEMES.length; show(); Sound.blip(700, .04, .03); };
  const prev = $('#viewerPrev', win), next = $('#viewerNext', win);
  if (!prev.dataset.wired) {
    prev.dataset.wired = '1';
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    addEventListener('keydown', e => {
      if (!WM.open.has('viewer')) return;
      if (e.key === 'ArrowLeft')  step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }
  show();
}

/* ── Canal 88 ── */
let tapeVid = null, tapeCurrent = 0, staticRaf = null;
function stopTape() {
  if (tapeVid) { tapeVid.pause(); tapeVid.removeAttribute('src'); tapeVid.load(); tapeVid = null; }
  cancelAnimationFrame(staticRaf); staticRaf = null;
}

function mountPlayer(win) {
  const root  = $('.wmp', win);
  const vid   = $('#tapeVideo', win);
  const cv    = $('#tvStatic', win);
  const list  = $('#channels', win);
  const chEl  = $('#tapeCh', win), nameEl = $('#tapeName', win);
  const timeEl = $('#tapeTime', win), seek = $('#wmpSeek', win);
  tapeVid = vid;

  const sctx = cv.getContext('2d', { alpha: false });
  const staticOn = () => {
    cv.width  = Math.max(1, Math.round(cv.offsetWidth  / 4));
    cv.height = Math.max(1, Math.round(cv.offsetHeight / 4));
    const draw = () => {
      const { width: w, height: h } = cv;
      const img = sctx.createImageData(w, h), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
      }
      sctx.putImageData(img, 0, 0);
      staticRaf = requestAnimationFrame(draw);
    };
    if (!REDUCED) draw();
  };
  const staticOff = () => { cancelAnimationFrame(staticRaf); staticRaf = null; };

  /* playlist */
  list.innerHTML = '';
  CHANNELS.forEach((c, i) => {
    const li = document.createElement('li');
    li.className = i === tapeCurrent ? 'is-live' : '';
    li.innerHTML = `<img src="/assets/posters/${c.poster}" alt="" loading="lazy">` +
                   `<span><b>CH ${c.ch} — ${c.name}</b><span>${c.tag}</span></span>`;
    li.addEventListener('click', () => tune(i));
    list.appendChild(li);
  });
  const marks = () => $$('li', list).forEach((li, i) => li.classList.toggle('is-live', i === tapeCurrent));

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  function play() {
    vid.muted = false;
    vid.play().then(() => root.classList.add('is-playing'))
      .catch(() => { vid.muted = true; vid.play().then(() => {
        root.classList.add('is-playing');
        assistant('Autoplay blocked the sound. Hit the speaker button to turn it on.');
      }).catch(() => {}); });
  }

  /* the static IS the loading state — it holds until the tape can play through */
  function tune(i, autoplay = true) {
    tapeCurrent = i;
    const c = CHANNELS[i];
    marks();
    chEl.textContent = `CH ${c.ch}`;
    nameEl.textContent = c.name;

    root.classList.add('is-tuning');
    staticOn();
    Sound.blip(180 + i * 40, .12, .05);

    vid.poster = `/assets/posters/${c.poster}`;
    vid.preload = 'auto';
    vid.src = `/assets/video/${c.file}.mp4`;
    vid.load();

    let settled = false;
    const lock = () => {
      if (settled || tapeCurrent !== i) return;
      settled = true;
      root.classList.remove('is-tuning');
      staticOff();
      if (autoplay) play();
    };
    vid.addEventListener('canplaythrough', lock, { once: true });
    setTimeout(lock, 9000);
    setTimeout(() => { if (vid.readyState >= 4) lock(); }, 500);
  }

  $('#tapePlay', win).addEventListener('click', () => vid.src ? play() : tune(tapeCurrent));
  $('#wmpPlay', win).addEventListener('click', () => {
    if (!vid.src) return tune(tapeCurrent);
    if (vid.paused) play();
    else { vid.pause(); root.classList.remove('is-playing'); }
  });
  $('#wmpPrev', win).addEventListener('click', () => tune((tapeCurrent - 1 + CHANNELS.length) % CHANNELS.length));
  $('#wmpNext', win).addEventListener('click', () => tune((tapeCurrent + 1) % CHANNELS.length));
  $('#wmpMute', win).addEventListener('click', () => {
    vid.muted = !vid.muted;
    $('#wmpMute', win).textContent = vid.muted ? '🔇' : '🔊';
    if (vid.paused && vid.src) play();
  });
  $('#wmpFull', win).addEventListener('click', () => {
    const s = $('.wmp__screen', win);
    if (!document.fullscreenElement) s.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  });

  vid.addEventListener('timeupdate', () => {
    timeEl.textContent = fmt(vid.currentTime);
    if (vid.duration) seek.style.width = (vid.currentTime / vid.duration) * 100 + '%';
  });
  vid.addEventListener('ended', () => tune((tapeCurrent + 1) % CHANNELS.length));
  vid.addEventListener('click', () => {
    if (vid.paused) play();
    else { vid.pause(); root.classList.remove('is-playing'); }
  });

  marks();
}

/* ══════════════════════════════════════════════════════════════
   8 · EASTER EGG — still works
   ══════════════════════════════════════════════════════════════ */
(function egg() {
  let buf = '';
  addEventListener('keydown', e => {
    if (e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-4);
    if (buf !== 'toad') return;
    buf = '';
    Sound.croak(); setTimeout(() => Sound.croak(), 160);
    const shots = [];
    for (let i = 0; i < 14; i++) {
      const m = MEMES[Math.floor(Math.random() * MEMES.length)];
      const img = document.createElement('img');
      img.src = `/assets/memes/thumb/${m.f}.jpg`;
      Object.assign(img.style, {
        position: 'fixed', zIndex: 940, width: '150px', pointerEvents: 'none',
        border: '3px solid #fff', boxShadow: '3px 4px 12px rgba(0,0,0,.6)',
        left: Math.random() * 82 + 'vw', top: Math.random() * 74 + 'vh',
        transform: `rotate(${Math.random() * 60 - 30}deg)`,
        transition: 'opacity .5s', opacity: '0',
      });
      document.body.appendChild(img);
      shots.push(img);
      setTimeout(() => (img.style.opacity = '1'), i * 55);
    }
    assistant('It looks like you are trying to buy a toad. Would you like help with that?');
    setTimeout(() => shots.forEach(i => { i.style.opacity = '0'; setTimeout(() => i.remove(), 600); }), 4200);
  });
})();

console.log('%c🐸 ToadOS Original Edition ', 'background:#a8ff1a;color:#030603;font:700 14px monospace;padding:6px 12px');
console.log('%cThe first Pepe. Since 1988. Type TOAD anywhere.', 'color:#74c13b;font:12px monospace');
