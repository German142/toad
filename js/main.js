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
  terminal:   { title:'Toad Terminal',            icon:'ic-terminal',   tpl:'app-terminal',   w:720,  h:620, status:'Live from Dexscreener', mount:mountTerminal },
  chat:       { title:'Toad Messenger',          icon:'ic-chat',       tpl:'app-chat',       w:520,  h:560, status:'The Pond', mount:mountChat },
  gallery:    { title:'Toad Gallery',          icon:'ic-gallery',    tpl:'app-gallery',    w:700,  h:520, status:'Drawings from the pond', mount:mountGallery },
  memes:      { title:`Evidence — ${MEMES.length} objects`, icon:'ic-memes', tpl:'app-memes', w:640, h:500, status:`${MEMES.length} objects`, mount:mountMemes },
  viewer:     { title:'Toad Viewer',           icon:'ic-viewer',     tpl:'app-viewer',     w:720,  h:600, status:'', mount:mountViewer, remount:true },
  tokenomics: { title:'Tokenomics.xls',        icon:'ic-tokenomics', tpl:'app-tokenomics', w:520,  h:470, status:'Read only' },
  buy:        { title:'HowToBuy.txt — Notepad',icon:'ic-buy',        tpl:'app-buy',        w:560,  h:520, status:'', mount:mountBuy },
  lore:       { title:'Lore.hlp — Help',       icon:'ic-lore',       tpl:'app-lore',       w:600,  h:560, status:'The Record', mount:mountLore },
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
  { app:'terminal',   label:'Terminal' },
  { app:'chat',       label:'Messenger' },
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
      /* Reopening used to run mount again, which quietly stacked a second set
         of listeners -- and, where a mount also starts a loop, a second loop.
         Only the viewer wants to be told again, because it is being handed a
         different picture; everything else is already set up. */
      if (app.remount) app.mount?.(w.el, opts);
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

  mountGameChat(gameFS);

  /* real browser fullscreen while we still hold the user gesture */
  gameFS.requestFullscreen?.().catch(() => { /* denied is fine — the overlay is full-bleed anyway */ });
}

/* ── the room, over the game ───────────────────────────────────
   Deliberately built on top of the frame rather than inside the game:
   Toad Run belongs to somebody else, and a chat that lives in this file
   cannot collide with what they are building.

   It reads the same room as Toad Messenger and stays out of the way --
   dimmed until it is touched, no background behind the lines, and it
   never steals the arrow keys the game is listening for. */
function mountGameChat(host) {
  const box = document.createElement('div');
  box.className = 'gchat';
  box.innerHTML =
    `<div class="gchat__head">
       <span class="gchat__dot"></span>
       <span class="gchat__room">The Pond</span>
       <span class="gchat__count" id="gcCount"></span>
       <button class="gchat__fold" id="gcFold" type="button" title="Hide the chat" aria-label="Hide the chat">–</button>
     </div>
     <div class="gchat__log" id="gcLog"></div>
     <form class="gchat__row" id="gcForm">
       <input class="gchat__in" id="gcIn" maxlength="200" placeholder="Press Enter to chat…" autocomplete="off" spellcheck="false" />
       <span class="gchat__hint">Enter</span>
     </form>`;
  host.appendChild(box);

  const log = box.querySelector('#gcLog'), input = box.querySelector('#gcIn');
  const count = box.querySelector('#gcCount');

  /* Somebody deep in a run should be able to put it away without leaving the
     game, and find it again in the same corner. */
  const FOLD_KEY = 'toados.gchat.folded';
  const fold = box.querySelector('#gcFold');
  try { if (localStorage.getItem(FOLD_KEY) === '1') box.classList.add('is-folded'); } catch (e) {}
  fold.addEventListener('click', () => {
    const folded = box.classList.toggle('is-folded');
    fold.textContent = folded ? '+' : '–';
    fold.title = folded ? 'Show the chat' : 'Hide the chat';
    try { localStorage.setItem(FOLD_KEY, folded ? '1' : '0'); } catch (e) {}
  });
  if (box.classList.contains('is-folded')) { fold.textContent = '+'; fold.title = 'Show the chat'; }
  let lastId = 0, dead = false, faces = {}, mine = null, timer = null;
  let polling = false;
  const seen = new Set();

  const nickOf = () => { try { return (localStorage.getItem(NICK_KEY) || '').trim(); } catch (e) { return ''; } };

  /* The game listens for arrows and space. While the line is focused those
     keys belong to the writer, and Escape hands them back. */
  input.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Escape') { input.blur(); box.classList.remove('is-live'); }
  });
  input.addEventListener('focus', () => box.classList.add('is-live'));
  input.addEventListener('blur',  () => box.classList.remove('is-live'));

  box.querySelector('#gcForm').addEventListener('submit', async e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) { input.blur(); return; }
    const n = nickOf();
    if (!n) { line({ nick: 'Toad', is_bot: true, body: 'Open the Messenger once and pick a name first.' }); return; }
    input.value = '';
    try {
      const res = await chatSay(n, text);
      if (res && res.ok === false) line({ nick: 'Toad', is_bot: true, body: 'Keep it clean in here.' });
      await tick();
    } catch (err) {
      line({ nick: 'Toad', is_bot: true, body: err.message === 'no links in here' ? 'No links in here.' : 'That did not go through.' });
    }
  });

  function line(row) {
    const l = document.createElement('p');
    l.dataset.id = row.id;
    l.className = 'gchat__line' + (row.is_bot ? ' is-toad' : '') + (!row.is_bot && row.who === mine ? ' is-me' : '');
    const face = row.is_bot ? '/assets/brand/logo.png' : faces[row.who];
    if (face) {
      const f = document.createElement('img');
      f.className = 'gchat__face'; f.alt = ''; f.src = face;      // src, never innerHTML
      l.appendChild(f);
    }
    const n = document.createElement('b');
    n.textContent = (row.is_bot ? 'Toad' : row.nick) + ':';        // textContent, always
    const t = document.createElement('span');
    t.textContent = row.image && !row.body ? 'sent a drawing' : row.body;
    l.append(n, t);
    log.appendChild(l);
    while (log.children.length > 14) log.firstChild.remove();      // a panel, not a transcript
    log.scrollTop = log.scrollHeight;
  }

  async function tick(first) {
    if (dead || !gameFS) { clearTimeout(timer); return; }
    if (polling) return;
    polling = true;
    clearTimeout(timer);
    try {
      if (first) { mine = await chatWhoAmI(); faces = await chatFaces(); }
      /* `seen` is the memory now, not lastId -- but the corner popup still
         works from ids, so keep it fed. */
      const ids  = await chatFetchIds();
      const rows = await chatFetchThese(ids.filter(id => !seen.has(id)));
      const alive = new Set(ids);
      /* An empty list means the room really is empty -- a failed fetch never gets
         this far, it throws first. So nothing is protected and everything goes. */
      const oldest = ids.length ? Math.min(...ids) : -Infinity;
      [...log.querySelectorAll('.gchat__line[data-id]')].forEach(el => {
        const id = Number(el.dataset.id);
        /* The guard is about the edge of the window we asked for, not the top
           of it: only sixty ids come back, so anything older than the oldest
           of them is simply out of view and must be left alone. Guarding
           against the newest instead -- as this did at first -- exempted
           exactly the case that matters, a message taken down moments ago. */
        if (!alive.has(id) && id >= oldest) { el.remove(); seen.delete(id); }
      });
      if (rows.some(r => !r.is_bot && !faces[r.who])) faces = await chatFaces();
      rows.forEach(r => {
        lastId = Math.max(lastId, r.id);
        if (seen.has(r.id)) return;
        seen.add(r.id);
        line(r);
      });
      const n = nickOf();
      if (n) chatHere(n);
      const here = await chatOnline();
      count.textContent = here.length ? here.length + ' online' : '';
    } catch (e) { /* a quiet panel is better than an error over a game */ }
    polling = false;
    clearTimeout(timer);
    timer = setTimeout(() => tick(false), document.hidden ? 15000 : 4000);
  }

  /* When the game closes, the strip goes with it. */
  const obs = new MutationObserver(() => {
    if (!host.isConnected) { dead = true; clearTimeout(timer); obs.disconnect(); }
  });
  obs.observe(document.body, { childList: true });

  tick(true);
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
  TOASTER.start();          // the room keeps talking whether or not you look
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

/* WHEN SOMETHING NEW SHIPS, ADD A LINE HERE. Newest first. These are said
   roughly every other time, so a returning visitor finds out what changed
   without anybody having to announce it anywhere. Keep the oldest few and
   drop the rest, or the news stops being news. */
const NEWS_LINES = [
  'New: the messenger keeps listening after you close it \u2014 a message pops up in the corner, like 2003.',
  'New: Toad Messenger. One public room, like it is 2003. No links, no DMs, no seed phrases.',
  'New: the public gallery. Anything drawn in Toad Paint can go up on the wall.',
  'New: you can vote on other people\u2019s drawings. Open the Gallery and press the heart.',
  'New in Toad Paint: stamps. Drop one, then drag it, resize it from a corner, or throw it away.',
  'Tip: in Toad Paint, the arrow tool picks a stamp back up. Nothing you place is ever stuck.',
  'New in Toad Paint: Mirror. Every stroke happens twice, and suddenly you can draw.',
  'New in Toad Paint: Start from a meme, then draw straight over it.',
  'Canal 88 is up to seventeen channels now. The reception has never been worse.',
];

/* Never twice in a row, never on top of a balloon that is still up, and
   never while the tab is in the background — nobody wants to come back to
   a queue of them. */
let lastLine = '';
function sayAssistant(pool) {
  let line;
  do { line = pool[Math.floor(Math.random() * pool.length)]; }
  while (line === lastLine && pool.length > 1);
  lastLine = line;
  assistant(line);
}

function scheduleAssistant(first) {
  const wait = first ? 9000 : 45000 + Math.floor(Math.random() * 45000);
  setTimeout(() => {
    const clip = $('#clip');
    /* On a phone the window is the whole screen, so a balloon that appears on
       its own does not sit beside anything -- it sits on top of whatever you
       were reading or typing. The assistant keeps its chatter for desktops.
       Toasts still come through: those are answers to something you did. */
    const roomy = innerWidth > 640;
    if (roomy && clip && clip.hidden && !document.hidden) {
      /* The first thing it says is always news; after that it alternates, so
         the jokes still get a turn. */
      sayAssistant(first || Math.random() < .5 ? NEWS_LINES : ASSIST_LINES);
    }
    scheduleAssistant(false);
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
  { id:'select',  label:'Select \u2014 move, resize or delete a stamp',
    glyph: svg('<path d="M4 2l8 6-3.4.7 2.2 4-1.8.9-2.2-4L4 12z" fill="#fff" stroke="#000" stroke-width="1.1" stroke-linejoin="round"/>') },
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
/* ── stamps ────────────────────────────────────────────────────
   Most people cannot draw, but everybody can arrange. The toad head
   is the existing cut-out logo; the rest are drawn here, so they cost
   nothing to load and scale to any size. */
const STAMP_SVG = d =>
  'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' + d + '</svg>');
const STAMPS = [
  { id:'toad',    label:'Toad',        src:'/assets/brand/logo.png' },
  { id:'shades',  label:'Shades',      src:STAMP_SVG('<g fill="#111"><rect x="6" y="38" width="38" height="26" rx="6"/><rect x="56" y="38" width="38" height="26" rx="6"/><rect x="44" y="46" width="12" height="7"/><rect x="0" y="40" width="8" height="6"/><rect x="92" y="40" width="8" height="6"/></g>') },
  { id:'cap',     label:'Cap',         src:STAMP_SVG('<path d="M12 62c0-24 16-38 38-38s38 14 38 38z" fill="#e0342a"/><path d="M8 62h84c4 0 6 3 6 6s-2 6-6 6H8c-4 0-6-3-6-6s2-6 6-6z" fill="#b8241b"/><circle cx="50" cy="26" r="5" fill="#f5c518"/>') },
  { id:'candle',  label:'Green candle',src:STAMP_SVG('<rect x="44" y="4" width="6" height="26" fill="#1a7f37"/><rect x="30" y="30" width="34" height="46" rx="2" fill="#22c55e" stroke="#14561f" stroke-width="3"/><rect x="44" y="76" width="6" height="20" fill="#1a7f37"/>') },
  { id:'wine',    label:'Wine',        src:STAMP_SVG('<path d="M28 10h44l-6 30a16 16 0 0 1-32 0z" fill="#f2e8a0" stroke="#8d7f43" stroke-width="3"/><rect x="47" y="56" width="6" height="26" fill="#8d7f43"/><rect x="32" y="82" width="36" height="6" rx="3" fill="#8d7f43"/>') },
  { id:'money',   label:'Money',       src:STAMP_SVG('<rect x="8" y="26" width="84" height="48" rx="4" fill="#74c13b" stroke="#2c5a14" stroke-width="3"/><circle cx="50" cy="50" r="14" fill="none" stroke="#2c5a14" stroke-width="3"/><path d="M50 38v24M44 44h12M44 56h12" stroke="#2c5a14" stroke-width="3"/>') },
  { id:'heart',   label:'Heart',       src:STAMP_SVG('<path d="M50 84C22 64 8 50 8 34a20 20 0 0 1 42-8 20 20 0 0 1 42 8c0 16-14 30-42 50z" fill="#e0342a"/>') },
  { id:'star',    label:'Star',        src:STAMP_SVG('<path d="M50 6l12 30 32 2-25 21 8 31-27-18-27 18 8-31L6 38l32-2z" fill="#f5c518" stroke="#8a6d00" stroke-width="3"/>') },
];
const STAMP_PX = { 1: 56, 3: 84, 6: 120, 12: 170 };

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

/* Reads come from a view that only ever contains approved, unhidden rows and
   carries the tally with them, so the count cannot be read from somewhere the
   picture is not. */
const GAL_VIEW = 'https://cnpkiasoianvabctmvym.supabase.co/rest/v1/toad_gallery_public';
const GAL_RPC  = 'https://cnpkiasoianvabctmvym.supabase.co/rest/v1/rpc/toad_vote';
const GAL_FLAG = 'https://cnpkiasoianvabctmvym.supabase.co/rest/v1/rpc/toad_report';
const GAL_DEL  = 'https://cnpkiasoianvabctmvym.supabase.co/rest/v1/rpc/toad_gallery_remove';
const VOTER_KEY = 'toados.voter', VOTED_KEY = 'toados.voted';

/* A random name for this browser. It is not an identity and does not pretend
   to be one -- it stops the same person counting twice by accident, which is
   what a like button on a meme site is actually for. */
function voterToken() {
  try {
    let t = localStorage.getItem(VOTER_KEY);
    if (!t) {
      t = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now());
      localStorage.setItem(VOTER_KEY, t);
    }
    return t;
  } catch (e) { return 'anon-' + String(Math.random()).slice(2, 18); }
}
const votedSet = () => {
  try { return new Set(JSON.parse(localStorage.getItem(VOTED_KEY) || '[]')); }
  catch (e) { return new Set(); }
};
const rememberVote = (id, mine) => {
  try {
    const v = votedSet();
    mine ? v.add(id) : v.delete(id);
    localStorage.setItem(VOTED_KEY, JSON.stringify([...v]));
  } catch (e) {}
};

async function galleryFetch(order) {
  const by = order === 'top' ? 'votes.desc,created_at.desc' : 'created_at.desc';
  const r = await fetch(GAL_VIEW + '?select=id,name,image,created_at,votes,owner_who&order=' + by + '&limit=60', { headers: GAL_HEAD });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

/* ── the pond ──────────────────────────────────────────────────
   A single public room. No accounts, no private messages, no links --
   the database refuses all three, so the browser never has to be trusted
   about it. Messages are read by polling rather than a socket: it needs no
   library, no second origin in the security policy, and at this size the
   difference is invisible. */
/* A browser whose token starts with probe- is a test, and reads a parallel
   room. Visitors and tests can then run against the same database without
   ever appearing in each other's window -- which is what happened once, in
   front of a real visitor. Nothing about this is reachable by choice: the
   token decides, and a visitor's token never starts that way. */
const IS_PROBE = (() => { try { return (localStorage.getItem(VOTER_KEY) || '').startsWith('probe-'); }
                          catch (e) { return false; } })();
const ROOM = IS_PROBE ? '_probe' : '';
const SB_REST  = 'https://cnpkiasoianvabctmvym.supabase.co/rest/v1/';
const CHAT_URL  = SB_REST + (IS_PROBE ? 'toad_chat_probe' : 'toad_chat_public');
const CHAT_AVA  = SB_REST + (IS_PROBE ? 'toad_avatars_probe' : 'toad_avatars');
const CHAT_ME   = 'https://cnpkiasoianvabctmvym.supabase.co/rest/v1/rpc/toad_whoami';
const CHAT_SETA = 'https://cnpkiasoianvabctmvym.supabase.co/rest/v1/rpc/toad_set_avatar';
const CHAT_HERE = 'https://cnpkiasoianvabctmvym.supabase.co/rest/v1/rpc/toad_here';
const CHAT_FLAG = 'https://cnpkiasoianvabctmvym.supabase.co/rest/v1/rpc/toad_chat_report';
const CHAT_ADMIN = 'https://cnpkiasoianvabctmvym.supabase.co/rest/v1/rpc/toad_is_admin';
const CHAT_QUEUE = SB_REST + 'rpc/toad_moderation';
const CHAT_MOD   = SB_REST + 'rpc/toad_moderate';
const WALL_MOD   = SB_REST + 'rpc/toad_gallery_moderate';
const CHAT_BAN   = SB_REST + 'rpc/toad_ban_for';
const WALL_PURGE = SB_REST + 'rpc/toad_gallery_purge';
const CHAT_WHOS = SB_REST + (IS_PROBE ? 'toad_online_probe' : 'toad_online');
const CHAT_CFG  = 'https://cnpkiasoianvabctmvym.supabase.co/rest/v1/toad_chat_config';
const CHAT_RPC  = 'https://cnpkiasoianvabctmvym.supabase.co/rest/v1/rpc/toad_say';
const NICK_KEY  = 'toados.nick';
const NUDGE = '*nudge*';

async function chatFetch(sinceId) {
  const q = sinceId ? '&id=gt.' + sinceId : '';
  const r = await fetch(CHAT_URL + '?select=id,created_at,nick,body,who,image,is_bot&order=id.asc&limit=80' + q, { headers: GAL_HEAD });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

/* A drawing that waited for approval is older than everything since, so
   asking for "anything newer than the last id I saw" will never find it. The
   room therefore asks which ids exist -- a tiny query, ids only -- and fetches
   just the ones it has not shown. Late arrivals slot in wherever they belong. */
async function chatFetchIds() {
  const r = await fetch(CHAT_URL + '?select=id&order=id.desc&limit=60', { headers: GAL_HEAD });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return (await r.json()).map(x => x.id);
}
async function chatFetchThese(ids) {
  if (!ids.length) return [];
  const r = await fetch(CHAT_URL + '?select=id,created_at,nick,body,who,image,is_bot&order=id.asc&id=in.(' + ids.join(',') + ')', { headers: GAL_HEAD });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
/* Faces are keyed by the same one-way hash the messages carry, so the room can
   show who drew what without anyone learning anybody's token. */
async function chatFaces() {
  const r = await fetch(CHAT_AVA + '?select=who,avatar', { headers: GAL_HEAD });
  if (!r.ok) return {};
  const out = {};
  (await r.json()).forEach(p => { out[p.who] = p.avatar; });
  return out;
}
async function chatWhoAmI() {
  const r = await fetch(CHAT_ME, { method: 'POST', headers: GAL_HEAD,
    body: JSON.stringify({ speaker: voterToken() }) });
  if (!r.ok) return null;
  return (await r.json()).who;
}
async function chatSetFace(dataUrl) {
  const r = await fetch(CHAT_SETA, { method: 'POST', headers: GAL_HEAD,
    body: JSON.stringify({ speaker: voterToken(), avatar: dataUrl }) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/* Presence is a heartbeat, not a subscription: the browser says "still here"
   while the window is open, and anyone unheard from for ninety seconds has
   left. Nothing is kept that the room does not already show. */
async function chatHere(nick) {
  const r = await fetch(CHAT_HERE, { method: 'POST', headers: GAL_HEAD,
    body: JSON.stringify({ speaker: voterToken(), nick }) }).catch(() => null);
  if (r && !r.ok) {
    /* A refused name has to be said out loud. Silently leaving somebody off
       the list looks like the list is broken. */
    try { return { error: JSON.parse(await r.text()).message }; } catch (e) { return { error: 'no' }; }
  }
  return {};
}
/* A drawing is the one thing no filter can read -- somebody advertised a rival
   site by drawing it. So the room gets the same brake the gallery has: enough
   people calling a message wrong takes it down until a human looks. */
async function chatReport(id) {
  const r = await fetch(CHAT_FLAG, { method: 'POST', headers: GAL_HEAD,
    body: JSON.stringify({ msg: id, reporter: voterToken() }) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/* The queue of drawings waiting to be let in. Every one of these refuses
   anybody who is not registered as the owner -- the check is in the function,
   so hiding the button is only tidiness, never the protection. */
const chatAmAdmin = () => fetch(CHAT_ADMIN, { method: 'POST', headers: GAL_HEAD,
  body: JSON.stringify({ speaker: voterToken() }) })
  .then(r => r.ok ? r.json() : { admin: false }).then(j => !!j.admin).catch(() => false);

async function chatPending() {
  const r = await fetch(CHAT_QUEUE, { method: 'POST', headers: GAL_HEAD,
    body: JSON.stringify({ speaker: voterToken() }) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function chatModerate(id, allow) {
  const r = await fetch(CHAT_MOD, { method: 'POST', headers: GAL_HEAD,
    body: JSON.stringify({ msg: id, speaker: voterToken(), allow }) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function wallModerate(id, show) {
  const r = await fetch(WALL_MOD, { method: 'POST', headers: GAL_HEAD,
    body: JSON.stringify({ pic: id, speaker: voterToken(), show }) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
/* For good. Only reachable from the desk, where the picture is on screen
   while the decision is being made. */
async function wallPurge(id) {
  const r = await fetch(WALL_PURGE, { method: 'POST', headers: GAL_HEAD,
    body: JSON.stringify({ pic: id, speaker: voterToken() }) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function chatBanFor(id) {
  const r = await fetch(CHAT_BAN, { method: 'POST', headers: GAL_HEAD,
    body: JSON.stringify({ msg: id, speaker: voterToken() }) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function chatOnline() {
  const r = await fetch(CHAT_WHOS + '?select=who,nick,avatar', { headers: GAL_HEAD });
  if (!r.ok) return [];
  return r.json();
}

async function chatOpen() {
  const r = await fetch(CHAT_CFG + '?select=enabled,notice&limit=1', { headers: GAL_HEAD });
  if (!r.ok) return { enabled: true };
  return (await r.json())[0] || { enabled: true };
}
async function chatSay(nick, body, image) {
  const r = await fetch(CHAT_RPC, {
    method: 'POST', headers: GAL_HEAD,
    body: JSON.stringify({ nick, body, speaker: voterToken(), image: image || null }),
  });
  if (!r.ok) {
    let m = 'that did not go through';
    try { m = (JSON.parse(await r.text()).message) || m; } catch (e) {}
    throw new Error(m);
  }
  /* A swear is not an error: the toad answers in the room, so the message has
     to come back rather than blow up, or the reply would be rolled back. */
  return r.json();
}

/* Pictures go up instantly now, so the brake sits behind them instead of in
   front: enough people calling something wrong takes it down on its own. */
async function galleryReport(id) {
  const r = await fetch(GAL_FLAG, {
    method: 'POST', headers: GAL_HEAD,
    body: JSON.stringify({ pic: id, reporter: voterToken() }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/* Only the browser that put a picture up can take it down. The check lives in
   the function, not here -- this is just the button. */
async function galleryRemove(id) {
  const r = await fetch(GAL_DEL, {
    method: 'POST', headers: GAL_HEAD,
    body: JSON.stringify({ pic: id, owner: voterToken() }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function galleryVote(id) {
  const r = await fetch(GAL_RPC, {
    method: 'POST', headers: GAL_HEAD,
    body: JSON.stringify({ pic: id, voter: voterToken() }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function gallerySubmit(name, dataUrl) {
  const r = await fetch(GAL_URL, {
    method: 'POST',
    headers: { ...GAL_HEAD, Prefer: 'return=minimal' },
    body: JSON.stringify({ name: name.slice(0, 24), image: dataUrl, owner: voterToken() }),
  });
  if (!r.ok) throw new Error(await r.text());
}

/* ── the little window in the corner ──────────────────────────
   The messenger keeps listening after you close or minimise it, and says so
   the way it did in 2003: a small panel that slides up from the bottom right,
   shows who wrote and what, and takes you to the room when clicked.

   It runs on its own, separate from any open window, so minimising costs you
   nothing. It stays quiet while the messenger is open and focused -- being
   told about a line you are already looking at is just noise. */
const TOASTER = {
  lastId: 0, started: false, timer: null, polling: false, faces: {}, mine: null,

  start() {
    if (this.started) return;
    this.started = true;
    /* Start from the present: a returning visitor should not be met by a
       stack of everything said while they were away. */
    chatFetch(0).then(rows => {
      rows.forEach(r => { this.lastId = Math.max(this.lastId, r.id); });
    }).catch(() => {}).finally(() => this.tick());
    chatWhoAmI().then(w => { this.mine = w; });
  },

  visible() {
    const rec = WM.open && WM.open.get && WM.open.get('chat');
    return !!(rec && rec.el && !rec.el.classList.contains('is-min') && !rec.el.classList.contains('is-blur'));
  },

  async tick() {
    if (this.polling) return;
    this.polling = true;
    clearTimeout(this.timer);
    try {
      const rows = await chatFetch(this.lastId);
      const fresh = [];
      rows.forEach(r => { this.lastId = Math.max(this.lastId, r.id); fresh.push(r); });
      if (fresh.some(r => !r.is_bot && !this.faces[r.who])) this.faces = await chatFaces();
      /* Never announce your own lines, and never while the room is in front. */
      const worth = fresh.filter(r => r.who !== this.mine && !this.visible());
      if (worth.length) this.pop(worth[worth.length - 1], worth.length);
    } catch (e) {}
    this.polling = false;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.tick(), document.hidden ? 20000 : 6000);
  },

  pop(row, more) {
    const old = $('#msnpop');
    if (old) old.remove();

    const box = document.createElement('aside');
    box.className = 'msnpop'; box.id = 'msnpop';
    box.setAttribute('role', 'status');

    const face = row.is_bot ? '/assets/brand/logo.png' : this.faces[row.who];
    const img = document.createElement('img');
    img.className = 'msnpop__face'; img.alt = '';
    img.src = face || '/assets/brand/logo.png';        // src, never innerHTML

    const txt = document.createElement('div');
    txt.className = 'msnpop__txt';
    const who = document.createElement('b');
    who.textContent = row.is_bot ? 'Toad' : row.nick;   // textContent: a stranger's text
    const line = document.createElement('span');
    line.textContent = row.image && !row.body ? 'sent a drawing' : row.body;
    txt.append(who, line);
    if (more > 1) {
      const rest = document.createElement('i');
      rest.textContent = `and ${more - 1} more`;
      txt.appendChild(rest);
    }

    const shut = document.createElement('button');
    shut.className = 'msnpop__x'; shut.type = 'button';
    shut.setAttribute('aria-label', 'Dismiss');
    shut.textContent = '\u2715';
    shut.addEventListener('click', e => { e.stopPropagation(); box.remove(); });

    box.append(img, txt, shut);
    box.addEventListener('click', () => { box.remove(); WM.launch('chat'); });
    document.body.appendChild(box);

    requestAnimationFrame(() => box.classList.add('is-up'));
    Sound.blip(880, .05, .04);
    setTimeout(() => Sound.blip(1180, .05, .035), 110);   // the two-note one
    setTimeout(() => {
      box.classList.remove('is-up');
      setTimeout(() => box.remove(), 260);
    }, 7000);
  },
};

const CHAT_EMOS = ['\uD83D\uDC38', '\uD83C\uDF7A', '\uD83D\uDCC8', '\uD83D\uDCC9', '\uD83D\uDD25', '\uD83D\uDC8E', '\uD83E\uDD1D', '\uD83D\uDE02', '\uD83D\uDE2D', '\uD83D\uDC40', '\uD83C\uDF19', '\u2764\uFE0F'];

/* ── the terminal ──────────────────────────────────────────────
   The numbers everybody checks anyway, without leaving the desktop, and a
   look at what is being pushed on Solana right now.

   Everything here comes from Dexscreener's public endpoints: no key, no
   account, nothing of ours on the wire. What is deliberately NOT here is
   holders, top wallets and bundler analysis -- that needs an indexed RPC,
   which needs a paid key, which must never sit in a page anyone can read. */
const DEX_API = 'https://api.dexscreener.com';
const CA = 'A13oRB9FFaiUjfi6LdCg6p9ka1u8SfGkUFs4SKvPpump';

const money = n => {
  const v = Number(n);
  if (!isFinite(v)) return '—';
  if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
  if (v >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K';
  return '$' + v.toFixed(2);
};
const price = n => {
  const v = Number(n);
  if (!isFinite(v)) return '—';
  return '$' + (v < 0.01 ? v.toFixed(6) : v.toFixed(4));
};

function mountTerminal(win) {
  /* Not open yet. Everybody gets the sign; the owner gets the window. The
     check is the same one the moderation desk uses, and it decides before
     anything is fetched -- so a visitor's click costs no API call either. */
  chatAmAdmin().then(ok => {
    if (!ok) return;
    $('#tmSoon', win).hidden = true;
    $('#tmBody', win).hidden = false;
    start();
  });

  const statsEl = $('#tmStats', win), pairEl = $('#tmPair', win);
  const discEl = $('#tmDisc', win), liveEl = $('#tmLive', win), countEl = $('#tmDiscCount', win);
  let timer = null, busy = false;

  const cell = (label, value, tone) => {
    const d = document.createElement('div');
    d.className = 'term__cell' + (tone ? ' is-' + tone : '');
    const k = document.createElement('span'); k.textContent = label;
    const v = document.createElement('b');    v.textContent = value;
    d.append(k, v);
    return d;
  };

  async function loadOwn() {
    const r = await fetch(DEX_API + '/latest/dex/tokens/' + CA);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const pairs = (await r.json()).pairs || [];
    if (!pairs.length) throw new Error('no pairs');
    /* Twenty pairs come back; the one with the deepest liquidity is the one
       whose price actually means anything. */
    const p = pairs.slice().sort((a, b) =>
      ((b.liquidity || {}).usd || 0) - ((a.liquidity || {}).usd || 0))[0];

    const ch = Number((p.priceChange || {}).h24);
    const tx = p.txns && p.txns.h24 ? p.txns.h24 : { buys: 0, sells: 0 };

    statsEl.innerHTML = '';
    statsEl.append(
      cell('Price', price(p.priceUsd)),
      cell('24h', (isFinite(ch) ? (ch > 0 ? '+' : '') + ch.toFixed(2) + '%' : '—'),
           isFinite(ch) ? (ch >= 0 ? 'up' : 'down') : ''),
      cell('Market cap', money(p.marketCap || p.fdv)),
      cell('Liquidity', money((p.liquidity || {}).usd)),
      cell('Volume 24h', money((p.volume || {}).h24)),
      cell('Buys / sells 24h', `${tx.buys} / ${tx.sells}`, tx.buys >= tx.sells ? 'up' : 'down'),
    );
    pairEl.textContent = `Deepest pool: ${p.dexId} \u00b7 ${p.baseToken?.symbol || '$TOAD'}/${p.quoteToken?.symbol || 'SOL'} \u00b7 ${pairs.length} pools in total`;
  }

  /* Holders come from our own endpoint rather than straight from an RPC: the
     key that makes this answerable must not be in a page anyone can read. */
  async function loadHolders() {
    const statsEl = $('#tmHoldStats', win), listEl = $('#tmHoldList', win), note = $('#tmHoldNote', win);
    const r = await fetch('/api/holders');
    let d;
    try { d = await r.json(); }
    catch (e) { d = { error: 'no endpoint here', keyed: false }; }

    statsEl.innerHTML = ''; listEl.innerHTML = '';
    if (d.error) {
      note.textContent = '';
      const p = document.createElement('p');
      p.className = 'term__note';
      p.textContent = d.keyed
        ? 'The node did not answer just now.'
        : 'Not available yet — this needs an indexed node, and none is configured.';
      listEl.appendChild(p);
      return;
    }

    statsEl.append(
      cell('Holders', d.holders === null ? 'needs a node' : d.holders.toLocaleString()),
      cell('Top 20 hold', d.topShare != null ? d.topShare.toFixed(1) + '%' : '—',
           d.topShare != null ? (d.topShare > 40 ? 'down' : 'up') : ''),
      cell('Supply', d.supply ? (d.supply / 1e6).toFixed(0) + 'M' : '—'),
    );
    note.textContent = d.holders === null ? '· top wallets only' : '';

    /* The pool itself is usually the largest account by far, and calling that
       a whale would be nonsense -- so the biggest ones are shown as they are
       and left for the reader to judge. */
    (d.top || []).slice(0, 10).forEach((t, i) => {
      const row = document.createElement('div');
      row.className = 'term__row term__row--tight';
      const col = document.createElement('div');
      col.className = 'term__rowtext';
      const line = document.createElement('span');
      line.textContent = `${i + 1}. ${t.address.slice(0, 6)}…${t.address.slice(-4)}`;
      const sub = document.createElement('i');
      sub.textContent = `${(t.amount / 1e6).toFixed(2)}M \u00b7 ${t.share != null ? t.share.toFixed(2) + '%' : '—'}`;
      col.append(line, sub);

      const bar = document.createElement('div');
      bar.className = 'term__bar2';
      const fill = document.createElement('i');
      fill.style.width = Math.min(100, (t.share || 0) * 3).toFixed(1) + '%';
      bar.appendChild(fill);

      const copy = document.createElement('button');
      copy.type = 'button'; copy.className = 'xp-btn xp-btn--sm'; copy.textContent = 'Copy';
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(t.address); toast('Address copied.'); }
        catch (e) { toast('Could not copy that.'); }
      });

      row.append(col, bar, copy);
      listEl.appendChild(row);
    });
  }

  async function loadDiscovery() {
    const r = await fetch(DEX_API + '/token-boosts/latest/v1');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    let rows = await r.json();
    if (!Array.isArray(rows)) rows = [rows];
    rows = rows.filter(x => x && x.chainId === 'solana' && x.tokenAddress);

    countEl.textContent = rows.length ? `· ${rows.length}` : '';
    discEl.innerHTML = '';
    if (!rows.length) {
      const p = document.createElement('p');
      p.className = 'term__note'; p.textContent = 'Nothing being pushed right now.';
      discEl.appendChild(p);
      return;
    }
    rows.forEach(t => {
      const row = document.createElement('div');
      row.className = 'term__row';

      /* The payload carries a logo for each token, and it is deliberately not
         used: that would pull an image from a stranger's server into this
         page for every entry, hand them a hit from every visitor, and widen
         the security policy to let it happen. A row of text is enough. */

      const col = document.createElement('div');
      col.className = 'term__rowtext';
      const desc = document.createElement('span');
      desc.textContent = (t.description || '(no description)').slice(0, 120);   // a stranger's text
      const addr = document.createElement('i');
      addr.textContent = t.tokenAddress.slice(0, 6) + '…' + t.tokenAddress.slice(-4);
      col.append(desc, addr);

      const acts = document.createElement('div');
      acts.className = 'term__rowacts';
      const copy = document.createElement('button');
      copy.type = 'button'; copy.className = 'xp-btn xp-btn--sm'; copy.textContent = 'Copy address';
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(t.tokenAddress); toast('Address copied.'); }
        catch (e) { toast('Could not copy that.'); }
      });
      /* Only ever Dexscreener. A token's own site is a stranger's domain and
         this desktop does not hand those out. */
      const look = document.createElement('a');
      look.className = 'xp-btn xp-btn--sm';
      look.href = 'https://dexscreener.com/solana/' + encodeURIComponent(t.tokenAddress);
      look.target = '_blank'; look.rel = 'noopener noreferrer';
      look.textContent = 'Chart';
      acts.append(copy, look);

      row.append(col, acts);
      discEl.appendChild(row);
    });
  }

  async function refresh() {
    if (busy) return;
    busy = true;
    liveEl.textContent = 'loading…';
    liveEl.className = 'term__live';
    /* Three independent sections, so one that cannot answer does not take the
       other two with it -- which is exactly what happened when the holders
       endpoint was missing and the discovery list silently stayed empty. */
    const parts = await Promise.allSettled([loadOwn(), loadHolders(), loadDiscovery()]);
    const failed = parts.filter(p => p.status === 'rejected').length;
    if (failed === parts.length) {
      liveEl.textContent = 'nothing is answering';
      liveEl.className = 'term__live is-off';
    } else {
      liveEl.textContent = (failed ? 'partly live \u00b7 ' : 'live \u00b7 ')
        + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      liveEl.className = 'term__live ' + (failed ? 'is-part' : 'is-on');
    }
    busy = false;
  }

  function start() {
    $('#tmReload', win).addEventListener('click', () => { Sound.blip(700, .04, .03); refresh(); });
    refresh();
    timer = setInterval(() => { if (!document.hidden) refresh(); }, 45000);

    const obs = new MutationObserver(() => {
      if (!win.isConnected) { clearInterval(timer); obs.disconnect(); }
    });
    obs.observe(document.body, { childList: true });
  }
}

function mountChat(win) {
  const log = $('#chLog', win), body = $('#chBody', win), nick = $('#chNick', win);
  const who = $('#chWho', win), state = $('#chState', win), emos = $('#chEmos', win);
  let lastId = 0, timer = null, dead = false, mine = null, faces = {};
  /* Sending calls poll straight away so the line shows without waiting for the
     tick. That used to leave the scheduled poll running as well, so two
     fetches went out holding the same lastId and both appended the same rows --
     and every send added another chain on top. One chain, one at a time, and
     ids remembered as a last line of defence. */
  let polling = false;
  const seen = new Set();

  try { nick.value = localStorage.getItem(NICK_KEY) || ''; } catch (e) {}
  nick.addEventListener('change', () => {
    try { localStorage.setItem(NICK_KEY, nick.value.trim().slice(0, 18)); } catch (e) {}
  });

  CHAT_EMOS.forEach(ch => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'msn__emo'; b.textContent = ch;
    b.addEventListener('click', () => { body.value += ch; body.focus(); });
    emos.appendChild(b);
  });

  const stamp = iso => {
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  function add(row) {
    if (row.body === NUDGE) {
      const l = document.createElement('p');
      l.className = 'msn__nudged';
      l.textContent = `${row.nick} just sent you a nudge!`;   // textContent: a stranger's text
      log.appendChild(l);
      win.classList.remove('is-nudged'); void win.offsetWidth; win.classList.add('is-nudged');
      Sound.blip(300, .09, .05);
      return;
    }
    const l = document.createElement('p');
    l.dataset.id = row.id;                    // so a message that goes away can be taken away
    l.className = 'msn__line'
      + (row.is_bot ? ' is-toad' : '')
      + (!row.is_bot && row.who === mine ? ' is-me' : '');
    /* A face if they drew one, the toad's own if it is the guardian speaking,
       and nothing at all otherwise — an empty square would be worse. */
    const face = row.is_bot ? '/assets/brand/logo.png' : faces[row.who];
    if (face) {
      const f = document.createElement('img');
      f.className = 'msn__face'; f.alt = ''; f.loading = 'lazy';
      f.src = face;                                  // src, never innerHTML
      l.appendChild(f);
      l.classList.add('has-face');
    }
    const n = document.createElement('b');
    n.textContent = row.is_bot ? '\uD83D\uDC38 Toad:' : row.nick + ' says:';   // textContent, always
    const t = document.createElement('i');
    t.textContent = stamp(row.created_at);
    const txt = document.createElement('span');
    txt.textContent = row.body;
    l.append(n, t, txt);
    /* Drawings arrive as data, and go in through src -- never innerHTML.
       There is no file picker anywhere in here, so nothing but a Toad Paint
       canvas can ever reach this element. */
    if (row.image) {
      const pic = document.createElement('img');
      pic.className = 'msn__pic-msg'; pic.alt = 'a drawing'; pic.loading = 'lazy';
      pic.src = row.image;
      l.appendChild(pic);
    }
    /* Anything somebody else put here can be called wrong. Your own lines and
       the toad's cannot -- reporting yourself is noise. */
    if (!row.is_bot && row.who !== mine) {
      const flag = document.createElement('button');
      flag.type = 'button'; flag.className = 'msn__flag';
      flag.textContent = '\u2691';
      flag.title = 'Report this — enough reports take it down';
      flag.addEventListener('click', async () => {
        if (!confirm('Report this message?\n\nEnough reports take it down until someone looks at it.')) return;
        flag.disabled = true;
        try { await chatReport(row.id); toast('Reported. Thank you.'); }
        catch (e) { toast('That report did not go through.'); flag.disabled = false; }
      });
      l.appendChild(flag);
    }
    log.appendChild(l);
  }

  const list = $('#chOnline', win), headCount = $('#chCount', win);

  async function refreshList() {
    const n = nick.value.trim();
    if (n) {
      const res = await chatHere(n);             // announce, then read the room
      if (res.error === 'that name is taken') toast('That name belongs to the toad. Pick another.');
      if (res.error === 'no links in a name') toast('A name cannot be a web address. Pick another.');
    }
    const rows = await chatOnline();
    list.innerHTML = '';
    rows.forEach(r => {
      const li = document.createElement('li');
      li.className = 'msn__buddy' + (r.who === mine ? ' is-me' : '');
      if (r.avatar) {
        const f = document.createElement('img');
        f.className = 'msn__buddyface'; f.alt = ''; f.src = r.avatar;   // src, never innerHTML
        li.appendChild(f);
      } else {
        const dot = document.createElement('span');
        dot.className = 'msn__buddydot';
        li.appendChild(dot);
      }
      const nm = document.createElement('span');
      nm.textContent = r.nick;                   // textContent: a stranger's text
      li.appendChild(nm);
      list.appendChild(li);
    });
    headCount.textContent = rows.length ? '(' + rows.length + ')' : '';
    who.textContent = !rows.length ? 'nobody here but you'
      : rows.length === 1 ? '1 toad in the pond' : rows.length + ' toads in the pond';
  }

  /* Typing a name is what puts you on the list, so do not wait for the next
     tick to show it. */
  nick.addEventListener('change', () => refreshList());

  async function poll(first) {
    if (dead || polling) return;
    polling = true;
    clearTimeout(timer);
    try {
      if (first) {
        const cfg = await chatOpen();
        if (!cfg.enabled) {
          state.textContent = 'closed';
          who.textContent = cfg.notice || 'The room is closed for now.';
          body.disabled = true; $('#chSend', win).disabled = true; $('#chNudge', win).disabled = true;
          dead = true; return;
        }
      }
      if (first) { mine = await chatWhoAmI(); faces = await chatFaces(); }
      const ids  = await chatFetchIds();
      const rows = await chatFetchThese(ids.filter(id => !seen.has(id)));

      /* A message that was reported away, refused, or deleted stops being in
         that list. An open window used to keep showing it until somebody
         reloaded, which meant a taken-down message stayed up for whoever was
         already looking -- the one place it most needed to go. */
      const alive = new Set(ids);
      /* An empty list means the room really is empty -- a failed fetch never gets
         this far, it throws first. So nothing is protected and everything goes. */
      const oldest = ids.length ? Math.min(...ids) : -Infinity;
      $$('.msn__line[data-id]', log).forEach(el => {
        const id = Number(el.dataset.id);
        /* The guard is about the edge of the window we asked for, not the top
           of it: only sixty ids come back, so anything older than the oldest
           of them is simply out of view and must be left alone. Guarding
           against the newest instead -- as this did at first -- exempted
           exactly the case that matters, a message taken down moments ago. */
        if (!alive.has(id) && id >= oldest) { el.remove(); seen.delete(id); }
      });

      /* Whatever this window has shown, the corner need not announce. */
      rows.forEach(r => { TOASTER.lastId = Math.max(TOASTER.lastId, r.id); });
      /* A face that arrives after its owner has spoken should still show up,
         so refresh the set whenever somebody unfamiliar turns up. */
      if (rows.some(r => !r.is_bot && !faces[r.who])) faces = await chatFaces();
      const stuck = log.scrollHeight - log.scrollTop - log.clientHeight < 40;
      rows.forEach(r => {
        lastId = Math.max(lastId, r.id);
        if (seen.has(r.id)) return;
        seen.add(r.id);
        add(r);
      });
      if (rows.length && stuck) log.scrollTop = log.scrollHeight;
      state.textContent = '';
      /* Counting distinct voices in the last five minutes is honest and cheap;
         it is not presence, and it does not pretend to be. */
      await refreshList();
    } catch (e) {
      state.textContent = 'offline';
    }
    polling = false;
    clearTimeout(timer);
    timer = setTimeout(() => poll(false), document.hidden ? 15000 : 3000);
  }

  const REFUSALS = {
    'no links in here': 'No links in here — that rule is what keeps this room safe.',
    'slow down': 'Slow down a moment.',
    'that name is taken': 'That name belongs to the toad. Pick another.',
    'drawings only': 'Only drawings from Toad Paint can go in here.',
    'too many drawings': 'That is enough drawings for now.',
    'the room is closed': 'The room is closed.',
    'message out of range': 'Too long, or nothing to say.',
    'no links in a name': 'A name cannot be a web address. Pick another.',
    'say hello first': 'Say something first — drawings after that.',
    'bad speaker token': 'Something is wrong with this browser. Try reloading.',
  };

  async function send(text, image) {
    const n = nick.value.trim();
    if (!n) { toast('Pick a name first — the box on the right.'); nick.focus(); return; }
    const t = (text !== undefined ? text : body.value).trim();
    if (!t && !image) return;
    $('#chSend', win).disabled = true;
    try {
      const res = await chatSay(n, t, image);
      if (res && res.ok === false && res.reason === 'language') {
        toast('The toad had a word with you about that.');
      } else if (res && res.pending) {
        toast('Your drawing is waiting for the toad to look at it.');
        if (text === undefined) body.value = '';
      } else if (text === undefined) {
        body.value = '';
      }
      await poll(false);                    // show it without waiting for the tick
    } catch (e) {
      toast(REFUSALS[e.message] || 'That did not go through.');
    }
    $('#chSend', win).disabled = false;
    body.focus();
  }
  win.__chatSend = send;                    // Toad Paint hands its canvas over here

  $('#chSend', win).addEventListener('click', () => send());
  $('#chNudge', win).addEventListener('click', () => send(NUDGE));

  /* The round trip in one press: opens Paint with its Send-to-chat button
     already lit, so the way back is obvious rather than something to find. */
  $('#chDraw', win).addEventListener('click', () => {
    const rec = WM.launch('paint');
    if (!rec || !rec.el) return;
    const back = $('#ptToChat', rec.el);
    if (back) {
      back.classList.add('is-waiting');
      back.scrollIntoView({ block: 'nearest' });
    }
    toast('Draw something, then press Send to chat.');
  });
  body.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });

  /* The gate. Present for exactly one browser; everyone else never learns it
     is there, and could not use it if they did. */
  const gate = $('#chGate', win), gateList = $('#chGateList', win), queueBtn = $('#chQueue', win);
  let amAdmin = false;

  let deskTab = 'waiting', desk = { waiting: [], room: [], wall: [] };

  const when = iso => {
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleString(undefined,
      { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  function card({ image, title, meta, note, actions }) {
    const el = document.createElement('div');
    el.className = 'msn__gatecard';
    if (image) {
      const img = document.createElement('img');
      img.src = image; img.alt = '';            // src, never innerHTML
      el.appendChild(img);
    }
    const col = document.createElement('div');
    col.className = 'msn__gateacts';
    const who = document.createElement('span');
    who.textContent = title;                    // textContent: a stranger's text
    col.appendChild(who);
    if (note) {
      const n = document.createElement('q');
      n.textContent = note;
      col.appendChild(n);
    }
    const m = document.createElement('i');
    m.textContent = meta;
    col.appendChild(m);
    const row = document.createElement('div');
    row.className = 'msn__gaterow';
    actions.forEach(([label, cls, fn]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'xp-btn xp-btn--sm' + (cls ? ' ' + cls : '');
      b.textContent = label;
      b.addEventListener('click', async () => {
        [...row.children].forEach(x => { x.disabled = true; });
        try { await fn(); await refreshQueue(); }
        catch (e) { toast('That did not go through.'); [...row.children].forEach(x => { x.disabled = false; }); }
      });
      row.appendChild(b);
    });
    col.appendChild(row);
    el.appendChild(col);
    return el;
  }

  function drawDesk() {
    const counts = { waiting: desk.waiting.length, room: desk.room.length, wall: desk.wall.length };
    $('#chTabWait', win).querySelector('span').textContent = counts.waiting;
    $('#chTabRoom', win).querySelector('span').textContent = counts.room;
    $('#chTabWall', win).querySelector('span').textContent = counts.wall;
    ['Wait', 'Room', 'Wall'].forEach((k, i) =>
      $('#chTab' + k, win).classList.toggle('is-on', ['waiting', 'room', 'wall'][i] === deskTab));

    const total = counts.waiting + counts.room;      // the wall does not nag; the room does
    queueBtn.hidden = false;
    queueBtn.querySelector('b').textContent = total;
    queueBtn.classList.toggle('is-waiting', total > 0);

    gateList.innerHTML = '';
    const rows = desk[deskTab];
    if (!rows.length) {
      const p = document.createElement('p');
      p.className = 'msn__gateempty';
      p.textContent = deskTab === 'waiting'
        ? 'Nothing waiting. Drawings appear here before anyone else can see them.'
        : 'Nothing has been reported here.';
      gateList.appendChild(p);
      return;
    }

    rows.forEach(row => {
      if (deskTab === 'waiting') {
        gateList.appendChild(card({
          image: row.image, title: row.nick, meta: when(row.created_at),
          actions: [
            ['Let it in', 'xp-btn--go', () => chatModerate(row.id, true).then(() => poll(false))],
            ['Refuse', '', () => chatModerate(row.id, false)],
            ['Ban them', 'xp-btn--danger', () => {
              if (!confirm('Ban whoever sent this?\n\nEverything they have written goes out of sight too.')) return;
              return chatBanFor(row.id);
            }],
          ],
        }));
      } else if (deskTab === 'room') {
        gateList.appendChild(card({
          image: row.image || null, title: row.nick,
          note: row.body || (row.image ? 'a drawing' : ''),
          meta: `${row.reports} report${row.reports === 1 ? '' : 's'} \u00b7 ${row.hidden ? 'taken down' : 'still up'} \u00b7 ${when(row.created_at)}`,
          actions: row.hidden
            ? [['Put it back', 'xp-btn--go', () => chatModerate(row.id, true).then(() => poll(false))],
               ['Ban them', 'xp-btn--danger', () => {
                 if (!confirm('Ban whoever sent this?')) return;
                 return chatBanFor(row.id);
               }]]
            : [['Take it down', '', () => chatModerate(row.id, false)],
               ['Clear the reports', 'xp-btn--go', () => chatModerate(row.id, true).then(() => poll(false))]],
        }));
      } else {
        gateList.appendChild(card({
          image: row.image, title: row.name,
          meta: `${row.reports} report${row.reports === 1 ? '' : 's'} \u00b7 ${row.hidden ? 'taken down' : 'still up'} \u00b7 ${when(row.created_at)}`,
          actions: row.hidden
            ? [['Put it back', 'xp-btn--go', () => wallModerate(row.id, true)],
               ['Delete for good', 'xp-btn--danger', () => {
                 if (!confirm('Delete this drawing for good?\n\nThere is no copy of it anywhere. This one really cannot be undone.')) return;
                 return wallPurge(row.id);
               }]]
            : [['Take it down', '', () => wallModerate(row.id, false)],
               ['Clear the reports', 'xp-btn--go', () => wallModerate(row.id, true)]],
        }));
      }
    });
  }

  async function refreshQueue() {
    if (!amAdmin) return;
    try { desk = await chatPending(); } catch (e) { return; }
    drawDesk();
  }

  ['Wait:waiting', 'Room:room', 'Wall:wall'].forEach(pair => {
    const [k, name] = pair.split(':');
    $('#chTab' + k, win).addEventListener('click', () => { deskTab = name; drawDesk(); });
  });

  queueBtn.addEventListener('click', () => { gate.hidden = false; refreshQueue(); });
  $('#chGateClose', win).addEventListener('click', () => { gate.hidden = true; });

  chatAmAdmin().then(ok => {
    amAdmin = ok;
    if (ok) { refreshQueue(); setInterval(refreshQueue, 30000); }
  });

  /* Stop polling when the window is gone, or a closed messenger keeps asking
     the server about a room nobody is looking at. */
  const obs = new MutationObserver(() => {
    if (!win.isConnected) { dead = true; clearTimeout(timer); obs.disconnect(); }
  });
  obs.observe(document.body, { childList: true, subtree: true });

  poll(true);
}

function mountGallery(win) {
  const grid  = $('#galGrid', win),  count = $('#galCount', win);
  const view  = $('#galView', win),  big   = $('#galBig', win);
  const title = $('#galTitle', win), meta  = $('#galMeta', win);
  const voteBtn = $('#galVote', win), sortBtn = $('#galSort', win);
  let order = 'new', rows = [], open = null, mine = null;
  /* Your own hash arrives a moment after the window does. Anything already on
     screen has to be told, or opening a picture too quickly offers Report on
     a drawing that is yours. */
  chatWhoAmI().then(w => { mine = w; if (open) markOwnership(open); });

  const label = (n, mine) => `${mine ? '\u2665' : '\u2661'} ${n}`;
  const when = iso => {
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  /* One place decides how a vote button looks, so the tile and the big view
     can never disagree about whether you already voted. */
  function paintVote(btn, row) {
    const mine = votedSet().has(row.id);
    btn.textContent = label(row.votes || 0, mine);
    btn.classList.toggle('is-mine', mine);
    btn.title = mine ? 'You already gave this one a heart.' : 'Give this drawing a heart';
  }

  /* A heart cannot be taken back. It used to toggle, and taking one back
     looked exactly like the count vanishing on its own. */
  async function cast(row, ...btns) {
    if (votedSet().has(row.id)) { toast('You already gave that one a heart.'); return; }
    btns.forEach(b => b && (b.disabled = true));
    try {
      const res = await galleryVote(row.id);
      row.votes = res.votes;
      rememberVote(row.id, true);
      btns.forEach(b => b && paintVote(b, row));
      Sound.blip(980, .05, .03);
    } catch (e) {
      toast('That heart did not go through.');
    }
    btns.forEach(b => b && (b.disabled = false));
  }

  async function report(row) {
    if (!confirm('Report this drawing as not okay?\n\nEnough reports take it down until someone looks at it.')) return;
    try {
      await galleryReport(row.id);
      toast('Reported. Thank you — enough reports take it down on their own.');
    } catch (e) {
      toast('That report did not go through.');
    }
  }

  /* Your own picture offers a way out; everyone else's offers a way to
     complain. Never both, and never guessed before the answer is in. */
  function markOwnership(row) {
    const known = mine !== null;
    const isMine = !!(known && row.owner_who && row.owner_who === mine);
    $('#galMine', win).hidden = !isMine;
    $('#galFlag', win).hidden = !known || isMine;
  }

  function show(row) {
    open = row;
    big.src = row.image;
    title.textContent = row.name;                 // textContent: a stranger's text
    meta.textContent = 'Drawn in Toad Paint \u00b7 ' + when(row.created_at);
    paintVote(voteBtn, row);
    markOwnership(row);
    view.hidden = false;
    Sound.blip(760, .04, .03);
  }
  const back = () => { view.hidden = true; open = null; };

  $('#galBack', win).addEventListener('click', back);
  $('#galFlag', win).addEventListener('click', () => { if (open) report(open); });
  $('#galMine', win).addEventListener('click', async () => {
    if (!open) return;
    if (!confirm('Take your drawing off the wall?\n\nIt stops being visible. You can put it back from the desk.')) return;
    try {
      await galleryRemove(open.id);
      toast('Off the wall. You can put it back from the desk.');
      back();
      render();
    } catch (e) {
      toast('That did not come down.');
    }
  });
  voteBtn.addEventListener('click', () => {
    if (!open) return;
    const tile = grid.querySelector(`[data-id="${open.id}"] .gal__tilevote`);
    cast(open, voteBtn, tile);
  });
  win.addEventListener('keydown', e => { if (e.key === 'Escape' && !view.hidden) back(); });

  async function render() {
    grid.innerHTML = '';
    count.textContent = 'loading\u2026';
    try {
      rows = await galleryFetch(order);
      count.textContent = !rows.length ? 'nothing here yet'
                        : rows.length === 1 ? '1 picture' : rows.length + ' pictures';
      rows.forEach(row => {
        /* A div rather than a button, because a vote button lives inside it
           and a button inside a button is not a thing. */
        const card = document.createElement('div');
        card.className = 'file'; card.dataset.id = row.id;
        card.setAttribute('role', 'button'); card.tabIndex = 0;

        const img = document.createElement('img');
        img.className = 'file__thumb'; img.loading = 'lazy'; img.alt = '';
        img.src = row.image;                       // src, never innerHTML

        const cap = document.createElement('span');
        cap.textContent = row.name;

        const v = document.createElement('button');
        v.type = 'button'; v.className = 'gal__tilevote';
        paintVote(v, row);
        v.addEventListener('click', e => { e.stopPropagation(); cast(row, v, open && open.id === row.id ? voteBtn : null); });

        card.append(img, cap, v);
        card.addEventListener('click', () => show(row));
        card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(row); } });
        grid.appendChild(card);
      });
    } catch (e) {
      count.textContent = 'could not load the gallery';
    }
  }

  sortBtn.addEventListener('click', () => {
    order = order === 'new' ? 'top' : 'new';
    sortBtn.textContent = order === 'top' ? 'Sort: most loved' : 'Sort: newest';
    Sound.blip(700, .04, .03);
    render();
  });
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
  let mirror = false, stamp = null;
  const stampImg = {};
  /* Stamps used to be paint -- once down, gone. They are objects now: they
     live above the canvas in their own list, so they can still be picked up,
     resized and thrown away long after they were placed. The pencil keeps
     writing straight onto the canvas underneath, untouched. */
  let objects = [], sel = null, grab = null;
  const layer = $('#ptObjects', win), lctx = layer.getContext('2d');
  const HANDLE = 7, BADGE = 9;
  const undo = [];

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  /* Undo is greyed until there is something to take back, the way Delete stamp
     is. A button that is simply unavailable is honest; one that looks ready
     and does nothing reads as broken. */
  const syncUndo = () => { const b = $('#ptUndo', win); if (b) b.disabled = !undo.length; };
  const push = () => {
    undo.push(ctx.getImageData(0, 0, cv.width, cv.height));
    if (undo.length > 20) undo.shift();
    syncUndo();
  };

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
    b.addEventListener('click', () => { useTool(t.id); Sound.blip(720, .03, .025); });
    tools.appendChild(b);
  });

  /* Stamps are a tool like any other, so picking one deselects the pencil
     and the size buttons keep meaning what they meant — how big. */
  const stampBar = $('#ptStamps', win);
  stampBar.innerHTML = '';
  STAMPS.forEach(st => {
    const img = new Image();
    img.src = st.src;
    stampImg[st.id] = img;

    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pt pt--stamp'; b.title = st.label;
    b.innerHTML = `<img src="${st.src}" alt="${st.label}">`;
    b.addEventListener('click', () => {
      useTool('stamp'); stamp = st.id;
      $$('.pt--stamp', stampBar).forEach(x => x.classList.remove('is-on'));
      b.classList.add('is-on');
      Sound.blip(820, .04, .03);
    });
    stampBar.appendChild(b);
  });
  $('#ptMirror', win).addEventListener('change', e => {
    mirror = e.target.checked;
    Sound.blip(mirror ? 900 : 600, .04, .03);
  });

  /* An empty white rectangle is the hardest thing to start on. This drops a
     meme underneath and leaves every tool exactly as it was — drawing stays
     free, this is only a different sheet of paper. */
  $('#ptMeme', win).addEventListener('click', () => {
    const m = MEMES[Math.floor(Math.random() * MEMES.length)];
    const img = new Image();
    img.onload = () => {
      push();
      const scale = Math.max(cv.width / img.width, cv.height / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
      Sound.blip(680, .05, .03);
    };
    img.src = `/assets/memes/${m.f}.jpg`;
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

  /* With mirror on, the same segment is drawn again at its reflection about
     the vertical centre — the cheapest way to make a scribble look deliberate. */
  const flip = p => ({ x: cv.width - p.x, y: p.y });
  function segment(a, b) {
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  function stroke(a, b) {
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : colour;
    ctx.lineWidth = tool === 'brush' ? size * 2 : tool === 'eraser' ? size * 3 : size;
    segment(a, b);
    if (mirror) segment(flip(a), flip(b));
  }

  function addStamp(p) {
    const img = stampImg[stamp];
    if (!img || !img.complete || !img.naturalWidth) return;
    const w = STAMP_PX[size] || 84;
    const h = w * (img.naturalHeight / img.naturalWidth);
    const put = (cx, flip) => objects.push({ id: stamp, x: cx - w / 2, y: p.y - h / 2, w, h, flip });
    put(p.x, false);
    if (mirror) put(cv.width - p.x, true);
    sel = objects[objects.length - 1];
    render();
  }

  function drawObjects(g, withHandles) {
    objects.forEach(o => {
      const img = stampImg[o.id];
      if (!img || !img.complete) return;
      g.save();
      if (o.flip) { g.translate(o.x + o.w / 2, 0); g.scale(-1, 1); g.translate(-(o.x + o.w / 2), 0); }
      g.drawImage(img, o.x, o.y, o.w, o.h);
      g.restore();
    });
    if (!withHandles || !sel) return;
    /* The frame is drawn white-under-black so it stays visible on any picture. */
    g.save();
    g.lineWidth = 1;
    [['#fff', 0], ['#000', 0]].forEach(([c], i) => {
      g.strokeStyle = c; g.setLineDash(i ? [4, 3] : []);
      g.strokeRect(sel.x - .5, sel.y - .5, sel.w + 1, sel.h + 1);
    });
    g.setLineDash([]);
    corners(sel).forEach(c => {
      g.fillStyle = '#fff'; g.strokeStyle = '#000';
      g.fillRect(c.x - HANDLE / 2, c.y - HANDLE / 2, HANDLE, HANDLE);
      g.strokeRect(c.x - HANDLE / 2, c.y - HANDLE / 2, HANDLE, HANDLE);
    });
    const b = badge(sel);
    g.fillStyle = '#c0392b'; g.strokeStyle = '#fff'; g.lineWidth = 1.5;
    g.beginPath(); g.arc(b.x, b.y, BADGE, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = 2;
    g.beginPath();
    g.moveTo(b.x - 4, b.y - 4); g.lineTo(b.x + 4, b.y + 4);
    g.moveTo(b.x + 4, b.y - 4); g.lineTo(b.x - 4, b.y + 4);
    g.stroke();
    g.restore();
  }

  const corners = o => [
    { k: 'nw', x: o.x,       y: o.y },
    { k: 'ne', x: o.x + o.w, y: o.y },
    { k: 'sw', x: o.x,       y: o.y + o.h },
    { k: 'se', x: o.x + o.w, y: o.y + o.h },
  ];
  const badge = o => ({ x: o.x + o.w, y: o.y - 2 });

  function render() {
    lctx.clearRect(0, 0, layer.width, layer.height);
    drawObjects(lctx, tool === 'select');
    $('#ptDel', win).disabled = !sel;
  }

  /* Everything that leaves Paint -- wallpaper, download, gallery -- has to be
     the canvas and the objects pressed together, or the stamps would vanish. */
  function flatten() {
    const out = document.createElement('canvas');
    out.width = cv.width; out.height = cv.height;
    const g = out.getContext('2d');
    g.drawImage(cv, 0, 0);
    drawObjects(g, false);
    return out;
  }

  const hitObject = p => {
    for (let i = objects.length - 1; i >= 0; i--) {
      const o = objects[i];
      if (p.x >= o.x && p.x <= o.x + o.w && p.y >= o.y && p.y <= o.y + o.h) return o;
    }
    return null;
  };
  const near = (p, c, r) => Math.abs(p.x - c.x) <= r && Math.abs(p.y - c.y) <= r;

  function removeSelected() {
    if (!sel) return;
    objects = objects.filter(o => o !== sel);
    sel = null; render();
    Sound.blip(320, .06, .03);
  }

  /* Picking a stamp and immediately wanting to move it is the common case, so
     placing one hands the arrow back automatically. */
  function useTool(id) {
    tool = id;
    $$('.pt', tools).forEach((x, i) => x.classList.toggle('is-on', PAINT_TOOLS[i] && PAINT_TOOLS[i].id === id));
    if (id !== 'stamp') { stamp = null; $$('.pt--stamp', stampBar).forEach(x => x.classList.remove('is-on')); }
    if (id !== 'select') sel = null;
    cv.classList.toggle('is-picking', id === 'select');
    render();
  }

  cv.addEventListener('pointerdown', e => {
    e.preventDefault();
    const p = pos(e);

    if (tool === 'select') {
      if (sel && near(p, badge(sel), BADGE + 2)) { removeSelected(); return; }
      if (sel) {
        const c = corners(sel).find(c => near(p, c, HANDLE + 3));
        if (c) {
          grab = { mode: 'size', k: c.k, o: sel, ox: sel.x, oy: sel.y, ow: sel.w, oh: sel.h };
          try { cv.setPointerCapture(e.pointerId); } catch (err) {}
          return;
        }
      }
      const hit = hitObject(p);
      sel = hit;
      if (hit) {
        grab = { mode: 'move', o: hit, dx: p.x - hit.x, dy: p.y - hit.y };
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
        Sound.blip(760, .03, .02);
      }
      render();
      return;
    }

    push();
    if (tool === 'fill')  { fill(p.x, p.y, colour); return; }
    if (tool === 'stamp') { addStamp(p); Sound.blip(940, .04, .03); useTool('select'); return; }
    drawing = true; sx = p.x; sy = p.y;
    snapshot = ctx.getImageData(0, 0, cv.width, cv.height);
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') stroke(p, p);
  });

  cv.addEventListener('pointermove', e => {
    if (grab) {
      const p = pos(e), o = grab.o;
      if (grab.mode === 'move') { o.x = p.x - grab.dx; o.y = p.y - grab.dy; }
      else {
        /* Resize from the corner you are not holding, and keep the shape --
           a squashed toad head looks like a mistake, never like a choice. */
        const ax = grab.k.includes('w') ? grab.ox + grab.ow : grab.ox;
        const ay = grab.k.includes('n') ? grab.oy + grab.oh : grab.oy;
        const ratio = grab.oh / grab.ow;
        let w = Math.abs(p.x - ax);
        w = Math.max(16, Math.min(w, cv.width * 1.5));
        const h = w * ratio;
        o.w = w; o.h = h;
        o.x = grab.k.includes('w') ? ax - w : ax;
        o.y = grab.k.includes('n') ? ay - h : ay;
      }
      render();
      return;
    }
    if (!drawing) return;
    const p = pos(e);
    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      stroke({ x: sx, y: sy }, p); sx = p.x; sy = p.y; return;
    }
    if (tool === 'spray') {
      ctx.fillStyle = colour;
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2, r = Math.random() * size * 2.5;
        const dx = Math.cos(a) * r, dy = Math.sin(a) * r;
        ctx.fillRect(p.x + dx, p.y + dy, 1, 1);
        if (mirror) ctx.fillRect(cv.width - (p.x + dx), p.y + dy, 1, 1);
      }
      return;
    }
    /* shapes redraw from the snapshot, so dragging previews instead of smearing */
    ctx.putImageData(snapshot, 0, 0);
    ctx.strokeStyle = colour; ctx.lineWidth = size;
    const shape = (ax, ay, bx, by) => {
      ctx.beginPath();
      if (tool === 'line') { ctx.moveTo(ax, ay); ctx.lineTo(bx, by); }
      if (tool === 'rect') ctx.rect(ax, ay, bx - ax, by - ay);
      if (tool === 'ellipse') ctx.ellipse((ax + bx) / 2, (ay + by) / 2, Math.abs(bx - ax) / 2, Math.abs(by - ay) / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    };
    shape(sx, sy, p.x, p.y);
    if (mirror) shape(cv.width - sx, sy, cv.width - p.x, p.y);
  });

  const stop = () => { drawing = false; snapshot = null; grab = null; };
  cv.addEventListener('pointerup', stop);
  cv.addEventListener('pointercancel', stop);
  cv.addEventListener('pointerleave', () => { if (tool !== 'pencil' && tool !== 'brush' && tool !== 'eraser') stop(); });

  $('#ptDel', win).addEventListener('click', removeSelected);
  win.addEventListener('keydown', e => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); removeSelected(); }
    if (e.key === 'Escape' && sel) { sel = null; render(); }
  });
  win.tabIndex = -1;

  $('#ptUndo', win).addEventListener('click', () => {
    const last = undo.pop();
    if (last) ctx.putImageData(last, 0, 0);
    syncUndo();
  });
  syncUndo();
  $('#ptClear', win).addEventListener('click', () => {
    push(); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, cv.width, cv.height);
    objects = []; sel = null; render();
  });

  $('#ptWall', win).addEventListener('click', () => {
    try {
      localStorage.setItem(CUSTOM_WALL_KEY, flatten().toDataURL('image/png'));
      applyWallpaper('custom');
      toast('Your drawing is now the wallpaper. Right-click the desktop to change it back.');
    } catch (err) {
      toast('The drawing was too large to keep. Try clearing some of it.');
    }
  });

  /* A pencil sketch is tiny as PNG and mushy as JPEG; a picture drawn over a
     meme photo is the other way round -- half a megabyte as PNG, which the
     gallery refuses. So try the lossless one first and only fall back when it
     will not fit, stepping the quality down rather than rejecting the drawing. */
  const GAL_MAX = 255000, CHAT_MAX = 128000;
  function exportUnder(max) {
    const flat = flatten();
    const png = flat.toDataURL('image/png');
    if (png.length <= max) return png;
    for (const q of [0.85, 0.7, 0.55, 0.4, 0.3]) {
      const jpg = flat.toDataURL('image/jpeg', q);
      if (jpg.length <= max) return jpg;
    }
    return flat.toDataURL('image/jpeg', 0.25);
  }
  const exportForGallery = () => exportUnder(GAL_MAX);

  /* Avatars are drawings too. Scaled here rather than in CSS so a 560x360
     canvas does not travel to everyone at full size just to be shown at 24px. */
  $('#ptFace', win).addEventListener('click', async () => {
    const src = flatten();
    const box = document.createElement('canvas');
    box.width = box.height = 96;
    const g = box.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, 96, 96);
    const side = Math.min(src.width, src.height);
    g.drawImage(src, (src.width - side) / 2, (src.height - side) / 2, side, side, 0, 0, 96, 96);
    let url = box.toDataURL('image/png');
    if (url.length > 23000) url = box.toDataURL('image/jpeg', 0.75);
    try {
      await chatSetFace(url);
      toast('That is your face in the room now. Draw a new one whenever you like.');
    } catch (e) {
      toast('That did not stick. Try something simpler.');
    }
  });

  /* Paint is the only place a picture can enter the room from. The chat has
     no file picker at all, which is exactly the rule: drawings, nothing else. */
  $('#ptToChat', win).addEventListener('click', async () => {
    const rec = WM.launch('chat');            // returns {el, id, …}, not the element
    const btn = $('#ptToChat', win);
    btn.disabled = true;
    /* mountChat has to have run before its send function exists. */
    for (let i = 0; i < 40 && !(rec && rec.el && rec.el.__chatSend); i++) await new Promise(r => setTimeout(r, 100));
    if (rec && rec.el && rec.el.__chatSend) {
      await rec.el.__chatSend('', exportUnder(CHAT_MAX));
      btn.classList.remove('is-waiting');
    } else {
      toast('Could not reach the room.');
    }
    btn.disabled = false;
  });

  $('#ptSubmit', win).addEventListener('click', async () => {
    const name = (prompt('Sign it — what name should appear under your picture?') || '').trim();
    if (!name) return;
    const btn = $('#ptSubmit', win);
    btn.disabled = true;
    try {
      await gallerySubmit(name, exportForGallery());
      toast('Up on the wall. Open the Gallery to see it.');
    } catch (e) {
      toast('That did not go through. Maybe the drawing is too large — try clearing some of it.');
    }
    btn.disabled = false;
  });

  $('#ptShare', win).addEventListener('click', () => {
    /* X cannot be handed a picture through a link -- an intent URL carries
       text and nothing else, so the post preview shows this site's card
       rather than the drawing. The best we can do is put the image where it
       is one gesture away and say so plainly, instead of letting people
       believe it went along. */
    flatten().toBlob(async blob => {
      const file = new File([blob], 'toad-paint.png', { type: 'image/png' });
      const text = 'made this in Toad Paint 🐸🎨\n\nthetoadmeme.com';

      // Phones can hand the actual file to the app. Nothing else needed.
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], text }); return; } catch (err) { if (err.name === 'AbortError') return; }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'toad-paint.png'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);

      let msg = 'Saved to your downloads. X cannot take the picture through a link — drag the file into the post.';
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        msg = 'Copied and saved. Click the post box and paste — the drawing goes in as an image.';
      } catch (err) {}
      toast(msg);

      open('https://x.com/intent/post?text=' + encodeURIComponent(text), '_blank', 'noopener');
    }, 'image/png');
  });
}

/* Four buttons in the help viewer had no listeners at all -- they looked
   like a help viewer's chrome and did nothing. They have real work now, and
   it is the work those words actually mean. */
function mountLore(win) {
  const body  = $('.help__body', win);
  const toc   = $('#lrToc', win);
  const back  = $('#lrBack', win);
  const marks = $$('h3', body);
  const history = [];

  marks.forEach((h, i) => { h.id = h.id || 'lore-' + i; });

  /* The element that actually scrolls is not always the one holding the text,
     so find it rather than assume it -- scrollIntoView on the wrong parent
     moves nothing and looks like a dead button. */
  const scroller = (() => {
    let el = body;
    while (el && el !== win && el.scrollHeight <= el.clientHeight + 2) el = el.parentElement;
    return el && el !== win ? el : (win.querySelector('.win__body') || body);
  })();

  function jump(el) {
    history.push(scroller.scrollTop);        // a real Back needs somewhere to go back to
    back.disabled = false;
    const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    scroller.scrollTo({ top: Math.max(0, top - 8), behavior: 'smooth' });
    Sound.blip(760, .04, .03);
  }

  function fill(entries) {
    toc.innerHTML = '';
    entries.forEach(h => {
      const a = document.createElement('button');
      a.type = 'button'; a.className = 'help__tocitem';
      a.textContent = toc.dataset.mode === 'index'
        ? titleOf(h) + '  \u00b7  ' + h.textContent.split('\u2014')[0].trim()
        : h.textContent;                     // textContent, always
      a.addEventListener('click', () => jump(h));
      toc.appendChild(a);
    });
  }

  /* Contents is the order it happened in. Index is by name -- and sorting the
     headings as they stand gives the same list back, because every one of them
     starts with its year. So the index sorts by what comes after the dash,
     which is the part somebody would actually look up. */
  const titleOf = h => h.textContent.split('\u2014').slice(1).join('\u2014').trim() || h.textContent;
  const show = entries => {
    const same = toc.dataset.mode === (entries === marks ? 'contents' : 'index');
    if (!toc.hidden && same) { toc.hidden = true; return; }
    toc.dataset.mode = entries === marks ? 'contents' : 'index';
    fill(entries);                            // mode is set first: fill reads it
    toc.hidden = false;
    Sound.blip(680, .04, .03);
  };

  $('#lrContents', win).addEventListener('click', () => show(marks));
  $('#lrIndex', win).addEventListener('click', () =>
    show([...marks].sort((a, b) => titleOf(a).localeCompare(titleOf(b), undefined, { numeric: true }))));

  back.addEventListener('click', () => {
    const to = history.pop();
    if (to === undefined) return;
    scroller.scrollTo({ top: to, behavior: 'smooth' });
    back.disabled = !history.length;
    Sound.blip(560, .04, .03);
  });

  $('#lrPrint', win).addEventListener('click', () => {
    Sound.blip(880, .05, .03);
    print();                                  // the one thing Print can honestly mean
  });
}

function mountExplorer(win) {
  /* Back, Forward and Go used to be furniture: Back and Forward made a noise
     and Go had no listener at all. A control that looks like it navigates and
     does not is worse than one that is plainly unavailable, so they say what
     they are now.

     This window has one page, so there is nothing behind it and nothing ahead
     -- exactly the state a freshly opened browser window is in, and it showed
     its Back button greyed out for the same reason. */
  $$('.ie__tb[data-nav]', win).forEach(b => {
    b.disabled = true;
    b.title = b.dataset.nav === 'back' ? 'Nothing to go back to — this is the front page'
                                       : 'Nothing to go forward to';
  });

  /* Go reloads the page, which is a real thing to do and visible while it
     happens: the status line changes and the pane returns to the top. */
  const go = $('.ie__go', win), status = win.querySelector('.win__status');
  const pane = $('.ie__body', win) || win.querySelector('.win__body');
  if (go) go.addEventListener('click', () => {
    Sound.blip(600, .04, .03);
    go.disabled = true;
    const was = status ? status.textContent : '';
    if (status) status.textContent = 'Opening http://www.thetoadmeme.os/index.html …';
    win.classList.add('is-loading');
    setTimeout(() => {
      if (pane) pane.scrollTop = 0;
      win.classList.remove('is-loading');
      if (status) status.textContent = was || 'Done — the pond';
      go.disabled = false;
      Sound.blip(880, .05, .03);
    }, 620);
  });
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
