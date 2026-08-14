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
  canal88:    { title:'Canal 88 Player',       icon:'ic-canal88',    tpl:'app-canal88',    w:660,  h:620, status:'6 tapes in the playlist', mount:mountPlayer },
  hoppytoad:  { title:'Hoppy Toad',            icon:'/hoppytoad/assets/icon-192.png', tpl:'app-hoppytoad', w:430, h:700, status:'One button. He jumps.', mount:mountHoppy },
  /* title and status count the array rather than hardcoding it, so adding a
     meme is still a one-line change */
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
  { app:'hoppytoad',  label:'Hoppy Toad' },
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
  buildIcons();
  buildStartMenu();
  clock();
  WM.launch('explorer');
  setTimeout(() => assistant("Welcome, fren. Everything lives behind the start button — or double-click an icon. Canal 88 has six tapes."), 1400);
}

function buildIcons() {
  const host = $('#icons');
  host.innerHTML = '';
  DESKTOP_ICONS.forEach(({ app, label }) => {
    const a = APPS[app];
    const el = document.createElement('button');
    el.className = 'icon';
    el.innerHTML = `<span class="icon__img">${iconHTML(a.icon)}</span><span>${label}</span>`;
    // single click selects, double click opens — as it should be
    el.addEventListener('click', () => {
      $$('.icon', host).forEach(i => i.classList.remove('is-sel'));
      el.classList.add('is-sel');
    });
    el.addEventListener('dblclick', () => WM.launch(app));
    // touch has no dblclick worth relying on
    if (matchMedia('(pointer: coarse)').matches) {
      el.addEventListener('click', () => WM.launch(app));
    }
    host.appendChild(el);
  });
  $('#desktop').addEventListener('pointerdown', e => {
    if (!e.target.closest('.icon')) $$('.icon', host).forEach(i => i.classList.remove('is-sel'));
    if (!e.target.closest('#startMenu') && !e.target.closest('#startBtn')) closeStart();
  });
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
    item('ic-canal88',  'Canal 88 Player', '6 tapes', () => WM.launch('canal88')),
    item('/hoppytoad/assets/icon-192.png', 'Hoppy Toad', 'One button. He jumps.', () => WM.launch('hoppytoad')),
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

/* a toast that looks like a tooltip */
function toast(msg) {
  assistant(msg);
}

/* ══════════════════════════════════════════════════════════════
   7 · APP MOUNTS
   ══════════════════════════════════════════════════════════════ */
/* The game is its own self-contained page, so it drops in as a frame. Loading
   it only on open means the desktop never pays for it until asked, and closing
   the window tears the whole thing down — no stray loop left running. */
function mountHoppy(win) {
  const frame = $('#hoppyFrame', win);
  /* trailing slash matters: the game's assets are relative to its folder */
  if (!frame.src) frame.src = '/hoppytoad/';
  /* hand it the keyboard so SPACE works without hunting for a click */
  setTimeout(() => { try { frame.contentWindow.focus(); } catch (e) {} }, 220);
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
