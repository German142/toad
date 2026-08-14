/* ══════════════════════════════════════════════════════════════
   HOPPY TOAD
   A one-button jumping game. He does not flap — he jumps, and
   gravity does the rest.

   Everything is scoped inside this IIFE and inside #ht, so the
   game can be dropped into any page or iframe without touching
   the host document.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Assets are resolved against this file's own URL rather than the
     document's, so the folder still works when it is dropped in at a
     different depth — and on file:// too. */
  const BASE = (function () {
    const s = document.currentScript ||
              document.querySelector('script[src$="game.js"]');
    return s && s.src ? s.src.replace(/[^/]*$/, '') : '';
  })();

  /* ─────────── the canvas is a fixed logical grid ─────────── */
  const W = 400;                 // logical width
  const H = 600;                 // logical height
  const GROUND_H = 96;           // swamp band along the bottom
  const PLAY_H = H - GROUND_H;   // 504 — playable column

  /* ─────────── sprite sheet ─────────── */
  const CELL_W = 240, CELL_H = 384, CELLS = 5;
  const FRAME = { IDLE: 0, LAUNCH: 1, APEX: 2, FALL: 3, HIT: 4 };

  /* ─────────── the toad ─────────── */
  const TOAD_W = 56;
  const TOAD_H = Math.round(TOAD_W * CELL_H / CELL_W);   // 90, keeps the cell ratio
  const TOAD_X = 96;
  /* The drawn cell is mostly padding. The hitbox is deliberately
     much tighter than the sprite — roughly 60% of the visible
     toad — or every near miss would read as a cheat. */
  /* In the idle cell the toad's feet sit at 311/384 of the cell height. The
     hitbox hangs off that foot line rather than the sprite centre, so
     standing on the bank lines up with the ground exactly. */
  const FEET   = Math.round(TOAD_H * (311 / CELL_H - 0.5));   // 28
  const HIT_W  = Math.round(TOAD_W * 0.45);                   // 25
  const HIT_H  = 34;                                          // ~60% of the visible body
  const SIT_Y  = PLAY_H - FEET;                               // centre-y when grounded

  /* ─────────── physics, in units per 1/60 s tick ─────────── */
  const GRAVITY   = 0.42;
  const JUMP      = -10.0;       // measured: ~119 px of rise
  const JUMP2     = -10.0;       // identical, so a double really is double height
  const TERMINAL  = 13.0;
  const DEATH_POP = -6.0;
  const CEILING   = 56;          // he cannot leave the top of the screen
  /* Mashing both hops in the same instant used to waste the second one — it
     fired before the first arc had gained any height. Holding it back a few
     ticks means a double is always worth roughly double. */
  const JUMP_LOCK = 5;           // ticks

  /* ─────────── the reeds ─────────── */
  /* Reeds are thin on purpose. Clearing one is not about peak height but
     about staying above it for the whole crossing — hitbox width plus reed
     width — so a fat obstacle is far harder than a tall one. */
  const OB_W      = 26;
  /* Derived from the measured arcs, not guessed:
       single hop      ~119 px
       double at apex  ~238 px
       double mashed   ~165 px  (second hop fired as early as the lock allows)
     Low reeds stop at 64, well inside a single hop. Tall reeds start at 134,
     above what a single hop can reach, and stop at 158 — under even the
     worst-timed double. Every reed is always clearable; the variety is in
     which hop it takes. */
  const H_LOW     = [28, 40, 52, 64];
  const H_TALL    = [134, 142, 150, 158];
  const SPACING_MIN = 210;
  const SPACING_MAX = 330;
  const SPEED_BASE = 2.1;
  const SPEED_MAX  = 3.6;
  const SPEED_STEP = 0.035;      // per point scored

  /* ─────────── fixed timestep ─────────── */
  const STEP = 1 / 60;
  const MAX_FRAME = 0.25;        // never simulate more than this in one frame

  const STATE = { LOAD: 0, MENU: 1, PLAY: 2, DYING: 3, OVER: 4 };

  /* ══════════════════════════════════════════════════════════
     DOM
     ══════════════════════════════════════════════════════════ */
  const root    = document.getElementById('ht');
  const canvas  = document.getElementById('htCanvas');
  const elMenu  = document.getElementById('htMenu');
  const elOver  = document.getElementById('htOver');
  const elLoad  = document.getElementById('htLoad');
  const elScore = document.getElementById('htScore');
  const elBest  = document.getElementById('htBest');
  const elMenuBest = document.getElementById('htMenuBest');
  const elNew   = document.getElementById('htNew');
  const elMsg   = document.getElementById('htMsg');
  const btnStart = document.getElementById('htStart');
  const btnRetry = document.getElementById('htRetry');
  const btnMenu  = document.getElementById('htMenuBtn');
  const btnSnd   = document.getElementById('htSnd');

  const stage = document.getElementById('htStage');
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;

  /* ══════════════════════════════════════════════════════════
     FIT — letterbox the fixed 400x600 board into whatever space
     the host gives us, on both axes, without ever overflowing.
     ══════════════════════════════════════════════════════════ */
  function fit() {
    const r = root.getBoundingClientRect();
    const aw = r.width || W, ah = r.height || H;
    const s = Math.min(aw / W, ah / H);
    stage.style.width  = Math.max(1, Math.floor(W * s)) + 'px';
    stage.style.height = Math.max(1, Math.floor(H * s)) + 'px';
  }
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(fit).observe(root);
  }
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  fit();

  /* ══════════════════════════════════════════════════════════
     STORAGE — file:// and private mode both throw, so guard it
     ══════════════════════════════════════════════════════════ */
  const KEY = 'hoppytoad.best';
  function loadBest() {
    try { return parseInt(localStorage.getItem(KEY), 10) || 0; } catch (e) { return 0; }
  }
  function saveBest(v) {
    try { localStorage.setItem(KEY, String(v)); } catch (e) { /* nothing we can do */ }
  }

  /* ══════════════════════════════════════════════════════════
     SOUND — synthesised, so nothing extra has to load
     ══════════════════════════════════════════════════════════ */
  const Sound = (function () {
    let actx = null, muted = false;
    function wake() {
      if (!actx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        try { actx = new AC(); } catch (e) { return null; }
      }
      if (actx.state === 'suspended') actx.resume();
      return actx;
    }
    function tone(freq, dur, vol, type, slideTo) {
      const c = wake();
      if (!c || muted) return;
      const t = c.currentTime;
      const o = c.createOscillator(), g = c.createGain();
      o.type = type || 'square';
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination);
      o.start(t); o.stop(t + dur + 0.02);
    }
    return {
      jump:  function () { tone(300, 0.12, 0.05, 'square', 620); },
      score: function () { tone(880, 0.09, 0.04, 'triangle'); setTimeout(function () { tone(1320, 0.09, 0.035, 'triangle'); }, 70); },
      hit:   function () { tone(220, 0.22, 0.07, 'sawtooth', 60); },
      drop:  function () { tone(120, 0.3, 0.05, 'sawtooth', 45); },
      wake:  wake,
      toggle: function () { muted = !muted; return muted; },
      get muted() { return muted; }
    };
  })();

  /* ══════════════════════════════════════════════════════════
     WORLD STATE
     ══════════════════════════════════════════════════════════ */
  let state = STATE.LOAD;
  let sheet = null;

  const toad = { y: 0, vy: 0, angle: 0, grounded: true, jumps: 2, since: 99 };
  let score = 0, best = loadBest(), speed = SPEED_BASE;
  let lastTall = false;          // never stack two tall reeds back to back
  let scrollX = 0;                 // distance travelled, drives every parallax layer
  let spawnX = 0;                  // world x of the next reed pair
  let flash = 0;                   // white hit flash, in ticks

  /* Obstacles are pooled. The array never grows past POOL, so a long
     session cannot leak. */
  const POOL = 8;
  const obstacles = [];
  for (let i = 0; i < POOL; i++) obstacles.push({ x: 0, h: 0, scored: false, live: false });

  /* ══════════════════════════════════════════════════════════
     PRE-RENDERED SCENERY
     Drawn once into offscreen canvases and blitted, rather than
     rebuilt every frame.
     ══════════════════════════════════════════════════════════ */
  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    return { canvas: c, ctx: x };
  }

  /* deterministic noise so the scenery is identical every run */
  let seed = 1337;
  function rnd() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }

  let skyLayer, cloudLayer, hillLayer, groundLayer, stalkTex;

  function buildScenery() {
    /* ── sky ── */
    skyLayer = makeCanvas(W, PLAY_H);
    const sg = skyLayer.ctx.createLinearGradient(0, 0, 0, PLAY_H);
    sg.addColorStop(0, '#2f7fd6');
    sg.addColorStop(0.45, '#66b3ef');
    sg.addColorStop(0.8, '#a5d8f5');
    sg.addColorStop(1, '#d8eefb');
    skyLayer.ctx.fillStyle = sg;
    skyLayer.ctx.fillRect(0, 0, W, PLAY_H);

    /* ── clouds: chunky pixel blobs ── */
    seed = 4242;
    cloudLayer = makeCanvas(W, 210);
    const cc = cloudLayer.ctx;
    for (let i = 0; i < 7; i++) {
      const cx = Math.round(rnd() * W);
      const cy = Math.round(20 + rnd() * 140);
      const sc = 0.7 + rnd() * 0.8;
      drawCloud(cc, cx, cy, sc);
      if (cx > W - 90) drawCloud(cc, cx - W, cy, sc);   // wrap seam
      if (cx < 90)     drawCloud(cc, cx + W, cy, sc);
    }

    /* ── far reed silhouette ──
       Deliberately hazy and desaturated. It used to be the same green as the
       obstacles, which made a short reed almost invisible against it. */
    seed = 99;
    hillLayer = makeCanvas(W, 120);
    const hc = hillLayer.ctx;
    hc.fillStyle = '#6d9fae';
    for (let x = 0; x < W; x += 4) {
      const h = 26 + Math.sin(x * 0.045) * 12 + rnd() * 10;
      hc.fillRect(x, 120 - h, 4, h);
    }
    hc.fillStyle = '#5c8e9e';
    for (let i = 0; i < 46; i++) {
      const x = Math.round(rnd() * W);
      const h = 30 + rnd() * 46;
      hc.fillRect(x, 120 - h, 3, h);
      hc.fillRect(x - 1, 120 - h - 6, 5, 7);            // the seed head
    }

    /* ── swamp band ── */
    seed = 7;
    groundLayer = makeCanvas(W, GROUND_H);
    const gc = groundLayer.ctx;
    const wg = gc.createLinearGradient(0, 0, 0, GROUND_H);
    wg.addColorStop(0, '#1d6b34');
    wg.addColorStop(0.22, '#14512a');
    wg.addColorStop(1, '#0a2f18');
    gc.fillStyle = wg;
    gc.fillRect(0, 0, W, GROUND_H);
    gc.fillStyle = '#3f8a18';
    gc.fillRect(0, 0, W, 5);
    gc.fillStyle = '#5cb62a';
    for (let x = 0; x < W; x += 8) gc.fillRect(x, 0, 4, 3);
    /* water glints */
    gc.fillStyle = 'rgba(140,220,255,.22)';
    for (let i = 0; i < 40; i++) {
      gc.fillRect(Math.round(rnd() * W), Math.round(14 + rnd() * (GROUND_H - 20)), 2 + Math.round(rnd() * 8), 2);
    }
    /* reed stubs poking out of the water */
    gc.fillStyle = '#1a4d12';
    for (let i = 0; i < 26; i++) {
      const x = Math.round(rnd() * W);
      const h = 8 + Math.round(rnd() * 16);
      gc.fillRect(x, 6, 3, h);
    }

    /* ── the reed bundle every obstacle is sliced out of ──
       Separate stalks with daylight between them, jointed and leafy: the
       point is that it must never read as a pipe. */
    seed = 31337;
    stalkTex = makeCanvas(OB_W, PLAY_H);
    const st = stalkTex.ctx;
    const stalks = [
      { x: 0,  w: 7,  dark: '#123c08', mid: '#276e12', lite: '#3d941b', node: 30, off: 0  },
      { x: 9,  w: 9,  dark: '#164509', mid: '#348a18', lite: '#57bd28', node: 26, off: 9  },
      { x: 20, w: 6,  dark: '#1b5310', mid: '#2f7d16', lite: '#46a11f', node: 34, off: 4  }
    ];
    for (let s = 0; s < stalks.length; s++) {
      const k = stalks[s];
      st.fillStyle = k.mid;  st.fillRect(k.x, 0, k.w, PLAY_H);
      st.fillStyle = k.lite; st.fillRect(k.x + 1, 0, Math.max(2, Math.round(k.w * 0.3)), PLAY_H);
      st.fillStyle = k.dark; st.fillRect(k.x + k.w - 2, 0, 2, PLAY_H);
      st.fillStyle = k.dark;
      for (let y = k.off; y < PLAY_H; y += k.node) st.fillRect(k.x, y, k.w, 2);
    }
    /* leaf blades sprouting out of the bundle */
    const leafShape = [[0, 0, 3], [2, 3, 6], [3, 6, 8], [3, 9, 7], [2, 12, 5], [1, 15, 3]];
    for (let y = 22; y < PLAY_H - 30; y += 46) {
      const left = rnd() > 0.5;
      const baseX = left ? 6 : 20;
      const dir = left ? -1 : 1;
      st.fillStyle = rnd() > 0.5 ? '#43a01c' : '#2f7d16';
      for (let i = 0; i < leafShape.length; i++) {
        const seg = leafShape[i];
        const lx = baseX + dir * seg[0] * 3;
        const w = seg[2];
        st.fillRect(Math.round(dir < 0 ? lx - w : lx), y + seg[1], w, 3);
      }
    }
  }

  function drawCloud(c, x, y, s) {
    const p = Math.max(3, Math.round(4 * s));
    const blocks = [
      [0, 2, 7, 2], [1, 1, 5, 1], [2, 0, 3, 1], [0, 3, 8, 1], [-1, 2, 1, 1], [7, 2, 2, 1]
    ];
    c.fillStyle = 'rgba(255,255,255,.92)';
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      c.fillRect(Math.round(x + b[0] * p), Math.round(y + b[1] * p), b[2] * p, b[3] * p);
    }
    c.fillStyle = 'rgba(196,226,246,.85)';
    c.fillRect(Math.round(x), Math.round(y + 3 * p), 8 * p, p);
  }

  /* ══════════════════════════════════════════════════════════
     DRAWING
     ══════════════════════════════════════════════════════════ */
  function blitWrapped(layer, y, offset) {
    const lw = layer.canvas.width;
    let x = -(offset % lw);
    if (x > 0) x -= lw;
    while (x < W) {
      ctx.drawImage(layer.canvas, Math.round(x), y);
      x += lw;
    }
  }

  /* A lily pad caps each bundle at the gap edge: it marks the hitbox line
     clearly and is unmistakably not a pipe lip.
     `facing` is +1 when the pad sits below the gap edge (upper bundle) and
     -1 when it sits above it (lower bundle). */
  function drawLilyPad(cx, edgeY, facing) {
    const rows = [
      [20, 0, '#7ade46'], [30, 4, '#63c934'], [38, 8, '#4fb223'],
      [38, 12, '#3f9a1b'], [30, 16, '#2f7d16'], [18, 20, '#22600f']
    ];
    for (let i = 0; i < rows.length; i++) {
      const w = rows[i][0];
      const yy = facing === 1 ? edgeY - 24 + rows[i][1] : edgeY + 4 - rows[i][1];
      ctx.fillStyle = rows[i][2];
      ctx.fillRect(Math.round(cx - w / 2), Math.round(yy), w, 4);
    }
    /* the wedge notch every lily pad has */
    ctx.clearRect(0, 0, 0, 0);
    const notchY = facing === 1 ? edgeY - 16 : edgeY - 8;
    ctx.fillStyle = '#2f7d16';
    ctx.fillRect(Math.round(cx + 5), Math.round(notchY), 10, 4);
    ctx.fillRect(Math.round(cx + 8), Math.round(notchY + (facing === 1 ? 4 : -4)), 7, 4);
  }

  function drawObstacle(ob) {
    const x = Math.round(ob.x);
    if (x > W || x + OB_W < 0) return;

    /* a clump of reeds standing in the bank, capped with a lily pad */
    const top = PLAY_H - ob.h;
    /* Thin dark edges only — filling the whole box would close the daylight
       between the stalks and turn the clump back into a pipe. */
    ctx.fillStyle = '#0d3a06';
    ctx.fillRect(x - 1, top, 2, ob.h);
    ctx.fillRect(x + OB_W - 1, top, 2, ob.h);
    ctx.drawImage(stalkTex.canvas, 0, 0, OB_W, ob.h, x, top, OB_W, ob.h);
    drawLilyPad(x + OB_W / 2, top, -1);
  }

  function drawToad() {
    let frame;
    if (state === STATE.DYING || state === STATE.OVER) frame = FRAME.HIT;
    else if (state === STATE.MENU) frame = FRAME.IDLE;
    else if (toad.grounded) frame = FRAME.IDLE;      // squatting, ready to spring
    else if (toad.vy < -3) frame = FRAME.LAUNCH;
    else if (toad.vy > 3)  frame = FRAME.FALL;
    else frame = FRAME.APEX;

    const cx = TOAD_X + TOAD_W / 2;
    const cy = toad.y;

    ctx.save();
    ctx.translate(Math.round(cx), Math.round(cy));
    ctx.rotate(toad.angle * Math.PI / 180);
    /* imageSmoothingEnabled is off, so the rotation stays pixellated
       rather than turning to mush */
    ctx.drawImage(
      sheet,
      frame * CELL_W, 0, CELL_W, CELL_H,
      Math.round(-TOAD_W / 2), Math.round(-TOAD_H / 2), TOAD_W, TOAD_H
    );
    ctx.restore();
  }

  function drawScore() {
    if (state !== STATE.PLAY && state !== STATE.DYING) return;
    const txt = String(score);
    ctx.font = '700 40px Tahoma, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#0b2a14';
    ctx.strokeText(txt, W / 2, 34);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(txt, W / 2, 34);
  }

  function render() {
    /* sky sits still, everything else slides past it */
    ctx.drawImage(skyLayer.canvas, 0, 0);
    blitWrapped(cloudLayer, 26, scrollX * 0.18);
    blitWrapped(hillLayer, PLAY_H - 120, scrollX * 0.45);

    for (let i = 0; i < obstacles.length; i++) {
      if (obstacles[i].live) drawObstacle(obstacles[i]);
    }

    blitWrapped(groundLayer, PLAY_H, scrollX);

    drawToad();
    drawScore();

    if (flash > 0) {
      ctx.fillStyle = 'rgba(255,255,255,' + (flash / 8 * 0.55).toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);
    }
  }

  /* ══════════════════════════════════════════════════════════
     SIMULATION — one fixed 1/60 s tick
     ══════════════════════════════════════════════════════════ */
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  function spawnObstacle() {
    let ob = null;
    for (let i = 0; i < obstacles.length; i++) {
      if (!obstacles[i].live) { ob = obstacles[i]; break; }
    }
    if (!ob) return;                                   // pool full: skip, never grow

    /* Two tall reeds in a row would demand a double jump with no room to
       land in between, so a tall one is always followed by a short one. */
    const tall = !lastTall && Math.random() < 0.42;
    lastTall = tall;
    ob.h = tall ? pick(H_TALL) : pick(H_LOW);

    /* A tall reed needs a longer approach — the player has to land from the
       previous hop and then set up a double. That room goes IN FRONT of it,
       which is the mistake worth not repeating: putting it behind meant the
       run-up depended on whatever came before. */
    if (tall) spawnX += 90;

    ob.x = spawnX;
    ob.scored = false;
    ob.live = true;
    spawnX += SPACING_MIN + Math.random() * (SPACING_MAX - SPACING_MIN);
  }

  /* Foot-anchored box, deliberately much tighter than the drawn sprite. */
  function hits(ob) {
    const l = TOAD_X + (TOAD_W - HIT_W) / 2;
    const r = l + HIT_W;
    const feet = toad.y + FEET;
    const head = feet - HIT_H;
    if (r < ob.x || l > ob.x + OB_W) return false;
    return feet > PLAY_H - ob.h && head < PLAY_H;
  }

  function die() {
    if (state !== STATE.PLAY) return;
    state = STATE.DYING;
    flash = 8;
    Sound.hit();
    toad.vy = DEATH_POP;                               // a short pop, then he drops
    toad.grounded = false;
  }

  function tick() {
    if (flash > 0) flash--;

    if (state === STATE.MENU) {
      /* He waits on the bank, not in mid-air. Just a breathing squat while
         the scenery drifts past. */
      scrollX += 0.6;
      toad.y = SIT_Y + Math.sin(scrollX * 0.04) * 1.5;
      toad.angle = 0;
      return;
    }

    if (state === STATE.PLAY) {
      speed = Math.min(SPEED_MAX, SPEED_BASE + score * SPEED_STEP);
      scrollX += speed;

      for (let i = 0; i < obstacles.length; i++) {
        const ob = obstacles[i];
        if (!ob.live) continue;
        ob.x -= speed;
        if (ob.x + OB_W < -20) { ob.live = false; continue; }
        if (!ob.scored && ob.x + OB_W < TOAD_X) {
          ob.scored = true;
          score++;
          Sound.score();
        }
      }
      /* spawnX is where the next clump goes; once that slot reaches the
         right edge, place it and book the following one */
      spawnX -= speed;
      if (spawnX <= W + 8) spawnObstacle();
    }

    if (state === STATE.PLAY || state === STATE.DYING) {
      if (toad.since < 99) toad.since++;
      toad.vy = Math.min(TERMINAL, toad.vy + GRAVITY);
      toad.y += toad.vy;

      /* tilt: nose up out of a jump, pitch over on the way down, level on
         the ground */
      let target;
      if (state === STATE.PLAY && toad.grounded) target = 0;
      else target = toad.vy < 0
        ? -20 * Math.min(1, -toad.vy / 7)
        : 70 * Math.min(1, toad.vy / TERMINAL);
      toad.angle += (target - toad.angle) * 0.18;
    }

    if (state === STATE.PLAY) {
      if (toad.y < CEILING) { toad.y = CEILING; if (toad.vy < 0) toad.vy = 0; }

      /* The bank is solid ground, not a hazard: he lands and runs on. */
      if (toad.y >= SIT_Y) {
        toad.y = SIT_Y;
        toad.vy = 0;
        if (!toad.grounded) { toad.grounded = true; toad.jumps = 2; }
      } else {
        toad.grounded = false;
      }

      /* only the reeds can end a run */
      for (let i = 0; i < obstacles.length; i++) {
        if (obstacles[i].live && hits(obstacles[i])) { die(); break; }
      }
    }

    if (state === STATE.DYING) {
      if (toad.y >= SIT_Y) { toad.y = SIT_Y; toad.vy = 0; gameOver(); }
    }
  }

  /* ══════════════════════════════════════════════════════════
     LOOP — fixed timestep with an accumulator, so the physics
     is identical on a 60 Hz panel and a 144 Hz one
     ══════════════════════════════════════════════════════════ */
  let last = 0, acc = 0, raf = 0, running = false;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!running) { last = now; return; }

    let dt = (now - last) / 1000;
    last = now;
    /* A tab that was in the background hands back a huge delta.
       Clamping stops the toad teleporting through three reeds. */
    if (dt > MAX_FRAME) dt = MAX_FRAME;
    acc += dt;

    let guard = 0;
    while (acc >= STEP && guard < 8) { tick(); acc -= STEP; guard++; }
    if (guard >= 8) acc = 0;

    render();
  }

  function startLoop() {
    if (raf) return;
    last = performance.now();
    acc = 0;
    running = true;
    raf = requestAnimationFrame(frame);
  }

  /* ══════════════════════════════════════════════════════════
     SCREENS
     ══════════════════════════════════════════════════════════ */
  function showMenu() {
    state = STATE.MENU;
    elMenu.hidden = false;
    elOver.hidden = true;
    elMenuBest.textContent = best;
    resetWorld();
  }

  function resetWorld() {
    score = 0;
    speed = SPEED_BASE;
    scrollX = 0;
    toad.y = SIT_Y;                 // he starts standing on the bank
    toad.vy = 0;
    toad.angle = 0;
    toad.grounded = true;
    toad.jumps = 2;
    toad.since = 99;
    lastTall = false;
    for (let i = 0; i < obstacles.length; i++) obstacles[i].live = false;
    spawnX = W + 190;               // a run-up before the first reed
  }

  function startGame() {
    resetWorld();
    elMenu.hidden = true;
    elOver.hidden = true;
    state = STATE.PLAY;
    Sound.wake();
  }

  function gameOver() {
    state = STATE.OVER;
    Sound.drop();
    const beat = score > best;
    if (beat) { best = score; saveBest(best); }
    elScore.textContent = score;
    elBest.textContent = best;
    elNew.hidden = !beat;
    elMsg.textContent = score === 0
      ? 'Not one reed. Brutal.'
      : (score < 5 ? 'The toad has stopped hopping.'
      : (score < 15 ? 'Respectable hopping.' : 'Certified pond royalty.'));
    elOver.hidden = false;
    elMenuBest.textContent = best;
  }

  /* One hop off the ground, one more in mid-air. The second is weaker, so a
     tall reed needs the double timed near the top of the first arc. */
  function jump() {
    if (toad.jumps <= 0) return;
    const first = toad.grounded || toad.jumps === 2;
    /* the mid-air hop refuses to fire on top of the launch */
    if (!first && toad.since < JUMP_LOCK) return;
    toad.vy = first ? JUMP : JUMP2;
    toad.jumps--;
    toad.since = 0;
    toad.grounded = false;
    Sound.jump();
  }

  /* ══════════════════════════════════════════════════════════
     INPUT
     The game only claims SPACE while it actually holds focus, so
     embedding it never breaks the host page's scrolling.
     ══════════════════════════════════════════════════════════ */
  let pointerInside = false;

  function primaryAction() {
    if (state === STATE.MENU) { startGame(); return; }
    if (state === STATE.PLAY) { jump(); return; }
    if (state === STATE.OVER) { startGame(); return; }
    /* DYING and LOAD deliberately ignore input */
  }

  canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    root.focus({ preventScroll: true });
    primaryAction();
  });

  root.addEventListener('pointerdown', function () { pointerInside = true; });
  document.addEventListener('pointerdown', function (e) {
    if (!root.contains(e.target)) pointerInside = false;
  }, true);

  function ownsKeyboard() {
    return pointerInside || root.contains(document.activeElement);
  }

  window.addEventListener('keydown', function (e) {
    const k = e.key;
    const isJump = k === ' ' || k === 'Spacebar' || k === 'ArrowUp' || k === 'w' || k === 'W';
    const isGo   = k === 'Enter';
    if (!isJump && !isGo) return;
    if (!ownsKeyboard()) return;
    e.preventDefault();
    if (e.repeat) return;
    primaryAction();
  });

  btnStart.addEventListener('click', function (e) { e.stopPropagation(); root.focus({ preventScroll: true }); startGame(); });
  btnRetry.addEventListener('click', function (e) { e.stopPropagation(); root.focus({ preventScroll: true }); startGame(); });
  btnMenu.addEventListener('click', function (e) { e.stopPropagation(); showMenu(); });
  btnSnd.addEventListener('click', function (e) {
    e.stopPropagation();
    btnSnd.textContent = Sound.toggle() ? '🔇' : '🔊';
  });

  /* ══════════════════════════════════════════════════════════
     FOCUS / VISIBILITY
     Coming back to the tab must not fast-forward the simulation.
     ══════════════════════════════════════════════════════════ */
  function pause() { running = false; }
  function resume() { last = performance.now(); acc = 0; running = true; }

  /* Only an actually hidden tab pauses us. Window blur must NOT: embedded in
     a page — or in a desktop window — focus moves away constantly, and
     freezing on every blur would leave the game stuck mid-frame. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pause(); else resume();
  });
  window.addEventListener('pagehide', function () {
    pause();
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  });

  /* ══════════════════════════════════════════════════════════
     BOOT
     ══════════════════════════════════════════════════════════ */
  function fail(msg) {
    elLoad.hidden = false;
    elLoad.innerHTML = '<span>' + msg + '</span>';
  }

  /* A read-only window into the simulation, for automated play-testing.
     Only wired up behind ?debug=1 so normal players get a clean global scope. */
  if (/[?&]debug=1/.test(location.search)) {
    window.HoppyDebug = {
      get state() { return state; },
      get score() { return score; },
      get best() { return best; },
      get toad() { return { y: toad.y, vy: toad.vy, grounded: toad.grounded, jumps: toad.jumps }; },
      get obstacles() {
        return obstacles.filter(function (o) { return o.live; })
                        .map(function (o) { return { x: o.x, h: o.h, scored: o.scored }; })
                        .sort(function (a, b) { return a.x - b.x; });
      },
      get spawnX() { return spawnX; },
      get speed() { return speed; },
      consts: { W: W, PLAY_H: PLAY_H, TOAD_X: TOAD_X, OB_W: OB_W, SIT_Y: SIT_Y, FEET: FEET, HIT_W: HIT_W },
      hop: function () { primaryAction(); },
      STATE: STATE
    };
  }

  sheet = new Image();
  sheet.onload = function () {
    if (sheet.naturalWidth !== CELL_W * CELLS) {
      /* not fatal — the sheet is still drawn by cell index — but worth knowing */
      console.warn('Hoppy Toad: sprite sheet is ' + sheet.naturalWidth + 'px wide, expected ' + CELL_W * CELLS);
    }
    buildScenery();
    elLoad.hidden = true;
    showMenu();
    startLoop();
  };
  sheet.onerror = function () {
    fail('Could not load ' + BASE + 'assets/toad_spritesheet.png');
  };
  sheet.src = BASE + 'assets/toad_spritesheet.png';
})();
