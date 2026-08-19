/* ══════════════════════════════════════════════════════════════
   TOAD RUN
   A full-screen 3-lane endless hopper in Three.js. The plush toad
   (the original, 1988) hops three trails of stepping stones across
   the pond; the internet frog (2005, seventeen years late) chases
   and never quite catches up — until he does.

   Everything lives in this one module: scene, world recycling,
   obstacles, pills, power-ups, sound, quests, shop and UI. The
   world scrolls toward a fixed camera; nothing ever allocates
   during play — every prop, obstacle and pill is pooled.
   ══════════════════════════════════════════════════════════════ */
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────────
   TUNING — the numbers that make it feel right
   ───────────────────────────────────────────────────────────── */
const LANE_X = [-2.2, 0, 2.2];
const SPAN = 150;               // world depth before things recycle
const SPAWN_Z = -140;           // where new obstacles appear
const KILL_Z = 14;              // where they get recycled

const SPEED_BASE = 10;          // units/s
const SPEED_MAX = 23;
const SPEED_GAIN = 0.055;       // per metre travelled

/* real-toad ballistics: stronger gravity, faster launch, same apex —
   the arc reads as weight instead of a balloon */
const JUMP_VY = 10.3;           // the big leap (input) — apex ≈ 1.56
const HOP_VY = 4.2;             // the idle hop — a toad never walks
const GRAVITY = -34;
const SLAM_VY = -21;            // roll in mid-air = slam down
const GATHER = .09;             // ground dwell between hops — the coil.
                                // A real toad is land → compress → EXPLODE;
                                // the pause is what sells the explosion.
const LANE_SNAP = 11;           // lane-change speed, units/s
const ROLL_TIME = 0.62;

const TOAD_H = 1.9;             // sprite height, units
const STAND_HIT_H = 1.5;        // collision height standing
const ROLL_HIT_H = 0.7;         //                  rolling

const STEP = 1 / 60;
const MAX_FRAME = 0.25;

const STATE = { LOAD: 0, MENU: 1, PLAY: 2, DYING: 3, OVER: 4, PAUSE: 5 };

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────────────────────────────────────────────────────────
   STORAGE — file:// and private mode both throw, so guard it
   ───────────────────────────────────────────────────────────── */
const store = {
  get(k, d) { try { const v = localStorage.getItem('toadrun.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('toadrun.' + k, JSON.stringify(v)); } catch { } },
};

/* ─────────────────────────────────────────────────────────────
   SOUND — synthesised, nothing to download
   ───────────────────────────────────────────────────────────── */
const Sound = (() => {
  let ctx = null;
  let sfxOn = store.get('sfx', true);
  let musicOn = store.get('music', true);
  let musicTimer = null, musicBeat = 0;

  const wake = () => {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  const tone = (f, dur, vol, type = 'square', slideTo = 0, at = 0) => {
    const c = wake(); if (!c || !sfxOn) return;
    const t = c.currentTime + at;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur + .02);
  };

  /* one quiet chip-tune bar, scheduled ahead — the whole soundtrack */
  const BASS = [98, 98, 131, 98, 87, 87, 131, 110];
  const LEAD = [392, 0, 494, 523, 0, 494, 392, 330];
  const musicTick = () => {
    if (!ctx || !musicOn) return;
    const t = ctx.currentTime;
    const b = musicBeat % 8;
    const bass = BASS[b], lead = LEAD[b];
    const g1 = ctx.createGain(), o1 = ctx.createOscillator();
    o1.type = 'triangle'; o1.frequency.value = bass;
    g1.gain.setValueAtTime(.05, t); g1.gain.exponentialRampToValueAtTime(.0001, t + .26);
    o1.connect(g1).connect(ctx.destination); o1.start(t); o1.stop(t + .3);
    if (lead) {
      const g2 = ctx.createGain(), o2 = ctx.createOscillator();
      o2.type = 'square'; o2.frequency.value = lead;
      g2.gain.setValueAtTime(.022, t); g2.gain.exponentialRampToValueAtTime(.0001, t + .2);
      o2.connect(g2).connect(ctx.destination); o2.start(t); o2.stop(t + .24);
    }
    musicBeat++;
  };
  const music = (on) => {
    musicOn = on; store.set('music', on);
    clearInterval(musicTimer); musicTimer = null;
    if (on && wake()) musicTimer = setInterval(musicTick, 280);
  };

  return {
    wake,
    jump: () => tone(300, .13, .05, 'square', 640),
    slam: () => tone(500, .12, .05, 'square', 140),
    lane: () => tone(880, .05, .03, 'triangle'),
    pill: () => { tone(920, .07, .04, 'triangle'); tone(1380, .08, .035, 'triangle', 0, .06); },
    power: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, .12, .05, 'triangle', 0, i * .07)); },
    hit: () => { tone(220, .25, .08, 'sawtooth', 55); tone(110, .3, .06, 'sawtooth', 40, .05); },
    buy: () => { tone(660, .08, .05, 'triangle'); tone(990, .1, .05, 'triangle', 0, .08); },
    deny: () => tone(160, .16, .05, 'sawtooth', 110),
    quest: () => { [784, 988, 1175].forEach((f, i) => tone(f, .12, .05, 'triangle', 0, i * .08)); },
    startMusic: () => music(musicOn),
    toggleMusic: () => { music(!musicOn); return musicOn; },
    toggleSfx: () => { sfxOn = !sfxOn; store.set('sfx', sfxOn); return sfxOn; },
    get sfxOn() { return sfxOn; },
    get musicOn() { return musicOn; },
  };
})();

/* ─────────────────────────────────────────────────────────────
   DOM
   ───────────────────────────────────────────────────────────── */
const $ = (s) => document.querySelector(s);
const el = {
  stage: $('#trStage'), hud: $('#hud'),
  score: $('#hudScore'), dist: $('#hudDist'), pills: $('#hudPills'),
  power: $('#hudPower'), powerIco: $('#hudPowerIco'), powerFill: $('#hudPowerFill'),
  load: $('#scrLoad'), loadHint: $('#loadHint'),
  menu: $('#scrMenu'), menuBest: $('#menuBest'), menuPills: $('#menuPills'), quests: $('#quests'),
  shop: $('#scrShop'), shopPills: $('#shopPills'), shopPowers: $('#shopPowers'), shopSkins: $('#shopSkins'),
  pause: $('#scrPause'), over: $('#scrOver'),
  overScore: $('#overScore'), overBest: $('#overBest'), overNew: $('#overNew'),
  overDist: $('#overDist'), overPills: $('#overPills'), overClose: $('#overClose'),
  share: $('#btnShare'), toast: $('#toast'),
};

let toastTimer;
function toast(msg) {
  el.toast.textContent = msg;
  el.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.toast.hidden = true), 3200);
}

/* ─────────────────────────────────────────────────────────────
   RENDERER / SCENE / CAMERA
   ───────────────────────────────────────────────────────────── */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  el.loadHint.textContent = 'WebGL is not available in this browser.';
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
el.stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcfe6f5, 26, 118);

/* low and close, over the toad's shoulder — the chase reads, the
   horizon sits in the upper third, the character fills the frame */
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
const CAM_POS = new THREE.Vector3(0, 3.05, 5.8);
const CAM_LOOK = new THREE.Vector3(0, 1.35, -11);
camera.position.copy(CAM_POS);
camera.lookAt(CAM_LOOK);

function resize() {
  const w = el.stage.clientWidth || innerWidth, h = el.stage.clientHeight || innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
addEventListener('orientationchange', resize);
resize();

/* lights — bright hemisphere + one shadow-casting sun over the track */
scene.add(new THREE.HemisphereLight(0xd9ecff, 0x51829b, 1.1));   // blue sky above, water bounce below
const sun = new THREE.DirectionalLight(0xffd9a8, 1.45);          // warm late-afternoon sun
sun.position.set(14, 24, -10);
sun.castShadow = true;
/* phones get a lighter shadow map — the softness hides the difference */
const SHADOW_RES = matchMedia('(pointer: coarse)').matches ? 1024 : 2048;
sun.shadow.mapSize.set(SHADOW_RES, SHADOW_RES);
sun.shadow.camera.left = -16; sun.shadow.camera.right = 16;
sun.shadow.camera.top = 24; sun.shadow.camera.bottom = -16;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 70;
sun.shadow.bias = -0.0004;
scene.add(sun, sun.target);

/* ─────────────────────────────────────────────────────────────
   CANVAS TEXTURE HELPERS — all decals are drawn, not downloaded
   ───────────────────────────────────────────────────────────── */
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const skyTex = canvasTex(64, 512, (x, w, h) => {
  const g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#1d6fd0');     // zenith blue
  g.addColorStop(.45, '#57a4e6');
  g.addColorStop(.78, '#b2d8f4');
  g.addColorStop(1, '#e6f2fa');     // horizon haze
  x.fillStyle = g; x.fillRect(0, 0, w, h);
});

const cloudTex = canvasTex(256, 128, (x) => {
  x.fillStyle = 'rgba(255,255,255,.95)';
  const blob = (cx, cy, r) => { x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); };
  blob(70, 78, 34); blob(120, 62, 44); blob(175, 76, 36); blob(120, 88, 40);
  x.fillStyle = 'rgba(230,240,250,.92)';   // flat shaded cloud base
  x.fillRect(36, 96, 184, 14);
});

/* tileable ripple noise for the water — every blob is drawn 9× on a
   3×3 grid of offsets so the texture repeats without seams */
const waterBump = canvasTex(256, 256, (x, w, h) => {
  x.fillStyle = '#808080'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 240; i++) {
    const px = Math.random() * w, py = Math.random() * h;
    const r = 7 + Math.random() * 20;
    const lum = Math.random() > .5 ? 255 : 0;
    const a = .14 + Math.random() * .18;
    const sx = 1.2 + Math.random() * 2;      // stretched — wind ripples, not bubbles
    for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) {
      const g = x.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, `rgba(${lum},${lum},${lum},${a})`);
      g.addColorStop(1, 'rgba(128,128,128,0)');
      x.save();
      x.translate(px + dx, py + dy);
      x.scale(sx, 1);
      x.fillStyle = g;
      x.beginPath(); x.arc(0, 0, r, 0, 7); x.fill();
      x.restore();
    }
  }
});
waterBump.colorSpace = THREE.NoColorSpace;
waterBump.wrapS = waterBump.wrapT = THREE.RepeatWrapping;
waterBump.repeat.set(48, 48);                 // over the 400-unit pond: one tile ≈ 8.3 units
const waterBumpNear = waterBump.clone();      // the shoal strip needs its own UV transform
waterBumpNear.repeat.set(1, 38);              // 8.6 × 320 units — same tile size as the pond
waterBumpNear.needsUpdate = true;

const glowTex = canvasTex(128, 128, (x, w, h) => {
  const g = x.createRadialGradient(64, 64, 2, 64, 64, 62);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(.4, 'rgba(255,255,255,.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, w, h);
});

const shadowTex = canvasTex(128, 128, (x) => {
  const g = x.createRadialGradient(64, 64, 4, 64, 64, 60);
  g.addColorStop(0, 'rgba(6,20,10,.5)');
  g.addColorStop(1, 'rgba(6,20,10,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
});

const stripeTex = canvasTex(64, 256, (x, w, h) => {
  x.fillStyle = '#f2fff4'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#2f9e57';
  for (let y = -w; y < h + w; y += 42) {
    x.save(); x.translate(0, y); x.rotate(-0.5);
    x.fillRect(-20, 0, w + 60, 20); x.restore();
  }
});
stripeTex.wrapS = stripeTex.wrapT = THREE.RepeatWrapping;

const pumpSignTex = canvasTex(512, 160, (x, w, h) => {
  x.fillStyle = '#12271c'; x.beginPath(); x.roundRect(0, 0, w, h, 26); x.fill();
  x.strokeStyle = '#2f9e57'; x.lineWidth = 6; x.beginPath(); x.roundRect(4, 4, w - 8, h - 8, 22); x.stroke();
  x.font = '700 74px Tahoma, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = '#fff'; x.fillText('💊 pump.fun', w / 2, h / 2 + 4);
});

const fudTex = canvasTex(256, 96, (x, w, h) => {
  x.fillStyle = '#c22c1f'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#9e1f14';
  for (let i = 0; i < w; i += 32) x.fillRect(i, h - 10, 16, 10);
  x.font = '700 56px Tahoma, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = '#fff'; x.fillText('F U D', w / 2, h / 2 - 4);
});

const canalTex = canvasTex(512, 384, (x, w, h) => {
  x.fillStyle = '#101d2a'; x.fillRect(0, 0, w, h);
  x.strokeStyle = '#3a5068'; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10);
  x.font = '700 92px Tahoma, sans-serif'; x.textAlign = 'center';
  x.fillStyle = '#a8ff1a'; x.fillText('CANAL', w / 2, 150);
  x.fillStyle = '#fff'; x.fillText('88', w / 2, 260);
  x.font = '400 34px Tahoma, sans-serif'; x.fillStyle = '#7d95ab';
  x.fillText('ON AIR SINCE 1988', w / 2, 330);
});

/* power-up cube faces */
const powerTex = {
  magnet: canvasTex(128, 128, (x) => { x.fillStyle = '#d8453a'; x.beginPath(); x.roundRect(0, 0, 128, 128, 26); x.fill(); x.font = '72px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('🧲', 64, 68); }),
  star: canvasTex(128, 128, (x) => { x.fillStyle = '#e9b62a'; x.beginPath(); x.roundRect(0, 0, 128, 128, 26); x.fill(); x.font = '72px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('⭐', 64, 68); }),
  x2: canvasTex(128, 128, (x) => { x.fillStyle = '#2f7fd6'; x.beginPath(); x.roundRect(0, 0, 128, 128, 26); x.fill(); x.font = '700 64px Tahoma'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.fillText('×2', 64, 68); }),
};

/* ─────────────────────────────────────────────────────────────
   MATERIALS — one shared set, flat pastel
   ───────────────────────────────────────────────────────────── */
const M = {
  /* phong + animated bump = moving sun glints on the surface */
  water: new THREE.MeshPhongMaterial({ color: 0x2e6f9e, specular: 0x9fcce8, shininess: 90, bumpMap: waterBump, bumpScale: .11 }),
  shallow: new THREE.MeshPhongMaterial({ color: 0x54a4ba, specular: 0xaad8e4, shininess: 70, bumpMap: waterBumpNear, bumpScale: .08 }),
  /* flat shading = faceted rock faces that catch the light */
  stone: new THREE.MeshStandardMaterial({ color: 0xa8a89a, roughness: .88, metalness: 0, flatShading: true }),
  stoneDark: new THREE.MeshStandardMaterial({ color: 0x7e8676, roughness: .92, metalness: 0, flatShading: true }),
  lily: new THREE.MeshLambertMaterial({ color: 0x4fb223 }),
  lilyDark: new THREE.MeshLambertMaterial({ color: 0x3d9a1a }),
  lotus: new THREE.MeshLambertMaterial({ color: 0xe88ab8 }),
  lotusCore: new THREE.MeshLambertMaterial({ color: 0xf2d25c }),
  foam: new THREE.MeshBasicMaterial({ color: 0xeafcff, transparent: true, opacity: .55 }),
  trunk: new THREE.MeshLambertMaterial({ color: 0x8a6b4a }),
  leaf: new THREE.MeshLambertMaterial({ color: 0x5aa864 }),
  leafDark: new THREE.MeshLambertMaterial({ color: 0x458c52 }),
  reed: new THREE.MeshLambertMaterial({ color: 0x2f7d16 }),
  reedHead: new THREE.MeshLambertMaterial({ color: 0x6b4a2f }),
  hill: new THREE.MeshLambertMaterial({ color: 0x7fbe6a }),
  skyline: new THREE.MeshLambertMaterial({ color: 0xaac6dc, transparent: true, opacity: .8 }),
  log: new THREE.MeshLambertMaterial({ color: 0x9c7448 }),
  logEnd: new THREE.MeshLambertMaterial({ color: 0xc9a06c }),
  candle: new THREE.MeshLambertMaterial({ color: 0x21c95e, emissive: 0x0a4d22 }),
  candleDark: new THREE.MeshLambertMaterial({ color: 0x158741 }),
  pole: new THREE.MeshLambertMaterial({ color: 0xb8b2a0 }),
  wood: new THREE.MeshLambertMaterial({ color: 0x7d5f3f }),
  pillWhite: new THREE.MeshLambertMaterial({ color: 0xf5f8f2, emissive: 0x333328 }),
  pillGreen: new THREE.MeshLambertMaterial({ color: 0x35b55a, emissive: 0x0d4d20 }),
  stripe: new THREE.MeshLambertMaterial({ map: stripeTex }),
  sign: new THREE.MeshBasicMaterial({ map: pumpSignTex, transparent: true }),
  fud: new THREE.MeshLambertMaterial({ map: fudTex, side: THREE.DoubleSide }),
  canal: new THREE.MeshBasicMaterial({ map: canalTex }),
};

/* ─────────────────────────────────────────────────────────────
   STATIC WORLD — sky, ground, path, edges
   ───────────────────────────────────────────────────────────── */
scene.background = new THREE.Color(0xe6f2fa);   // horizon tone behind the dome
{
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(320, 24, 12),
    new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })
  );
  dome.position.y = -30;
  scene.add(dome);

  /* the sun — a real orange disc (normal blending: additive over a
     bright sky just bleaches to white) plus a soft warm halo */
  const sunTex = canvasTex(128, 128, (x) => {
    const g = x.createRadialGradient(64, 64, 8, 64, 64, 62);
    g.addColorStop(0, '#ffc648');
    g.addColorStop(.5, '#ff9a27');
    g.addColorStop(.72, '#ff7d1e');
    g.addColorStop(.8, 'rgba(255,118,26,.5)');
    g.addColorStop(1, 'rgba(255,118,26,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  });
  const sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTex, transparent: true, fog: false }));
  sunDisc.scale.set(34, 34, 1);
  sunDisc.position.set(40, 78, -259);
  scene.add(sunDisc);
  const sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff8c1a, transparent: true, opacity: .45, fog: false, blending: THREE.AdditiveBlending }));
  sunHalo.scale.set(85, 85, 1);
  sunHalo.position.set(40, 78, -260);
  scene.add(sunHalo);

  /* the pond — open water to every horizon */
  const g = new THREE.PlaneGeometry(400, 400);
  const ground = new THREE.Mesh(g, M.water);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.02, -120);
  ground.receiveShadow = true;
  scene.add(ground);

  /* the shoal — a paler shallow strip under the three stone trails */
  const shoal = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 320), M.shallow);
  shoal.rotation.x = -Math.PI / 2;
  shoal.position.set(0, -0.005, -140);
  shoal.receiveShadow = true;
  scene.add(shoal);

  /* foam lines where the shoal drops into deep water */
  for (const sx of [-4.35, 4.35]) {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 320), M.foam);
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(sx, 0.012, -140);
    scene.add(edge);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 320),
      new THREE.MeshBasicMaterial({ map: glowTex, color: 0xcaf0ff, transparent: true, opacity: .3, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(sx, 0.014, -140);
    scene.add(glow);
  }
}

/* flag every solid mesh in a group as a shadow caster (sprites and
   glows excluded — a glow with a shadow is nonsense) */
function castShadows(obj) {
  obj.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return obj;
}

/* everything that scrolls registers here: { obj, span, onRecycle } */
const scrollers = [];
function scrolling(obj, span = SPAN, onRecycle = null) {
  scrollers.push({ obj, span, onRecycle });
  return obj;
}

/* ─────────────────────────────────────────────────────────────
   STEPPING STONES — the lanes themselves. One InstancedMesh, one
   draw call. The layout repeats every STONE_PERIOD so the field
   scrolls with a plain modulo instead of the scroller wrap (a
   single long object can't wrap at KILL_Z without a visible gap).
   ───────────────────────────────────────────────────────────── */
const STONE_GAP = 2.5;
const STONE_PERIOD = 150;                       // must be a multiple of STONE_GAP
let stoneField;
{
  const perLane = Math.ceil((STONE_PERIOD * 2 + 36) / STONE_GAP);
  const geo = new THREE.CylinderGeometry(.78, .98, .3, 7);
  stoneField = new THREE.InstancedMesh(geo, M.stone, perLane * 3);
  stoneField.castShadow = true;
  stoneField.receiveShadow = true;
  /* deterministic per-slot jitter, keyed mod one period, so the
     wrap-around is invisible */
  const jig = (i, s) => (Math.sin((i % (STONE_PERIOD / STONE_GAP)) * 12.9898 + s) * 43758.5453) % 1;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  let n = 0;
  for (let l = 0; l < 3; l++) {
    for (let i = 0; i < perLane; i++) {
      v.set(LANE_X[l] + jig(i, l * 7 + 1) * .3, -0.13, 16 - i * STONE_GAP);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), jig(i, l * 7 + 2) * Math.PI);
      const s = .85 + Math.abs(jig(i, l * 7 + 3)) * .3;
      sc.set(s, 1, s * (0.9 + Math.abs(jig(i, l * 7 + 4)) * .25));
      m.compose(v, q, sc);
      stoneField.setMatrixAt(n++, m);
    }
  }
  scene.add(stoneField);
}

/* ─────────────────────────────────────────────────────────────
   SCENERY — pooled pastel props, recycled forever
   ───────────────────────────────────────────────────────────── */
function makeDome(scale = 1, mat = M.leafDark) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1.4, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2), mat);
  m.scale.set(scale, scale * .8, scale);
  return m;
}
function makeReeds() {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const h = 1 + Math.random() * 1.2;
    const r = new THREE.Mesh(new THREE.CylinderGeometry(.05, .07, h, 5), M.reed);
    r.position.set((Math.random() - .5) * 1.1, h / 2, (Math.random() - .5) * .8);
    r.rotation.z = (Math.random() - .5) * .2;
    const head = new THREE.Mesh(new THREE.CapsuleGeometry(.09, .3, 3, 6), M.reedHead);
    head.position.set(r.position.x, h + .18, r.position.z);
    g.add(r, head);
  }
  return g;
}
function makeLilyCluster() {
  const g = new THREE.Group();
  const n = 3 + (Math.random() * 3 | 0);
  for (let i = 0; i < n; i++) {
    const pad = new THREE.Mesh(new THREE.CircleGeometry(.4 + Math.random() * .35, 9, .5, 5.6),
      Math.random() > .5 ? M.lily : M.lilyDark);
    pad.rotation.x = -Math.PI / 2;
    pad.rotation.z = Math.random() * Math.PI * 2;
    pad.position.set((Math.random() - .5) * 3.5, .03, (Math.random() - .5) * 2.5);
    g.add(pad);
  }
  return g;
}
function makeLotus() {
  const g = makeLilyCluster();
  const cx = (Math.random() - .5) * 2, cz = (Math.random() - .5) * 1.5;
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2;
    const petal = new THREE.Mesh(new THREE.ConeGeometry(.16, .55, 5), M.lotus);
    petal.position.set(cx + Math.cos(a) * .2, .3, cz + Math.sin(a) * .2);
    petal.rotation.set(Math.sin(a) * .55, 0, -Math.cos(a) * .55);
    g.add(petal);
  }
  const core = new THREE.Mesh(new THREE.SphereGeometry(.15, 8, 6), M.lotusCore);
  core.position.set(cx, .38, cz);
  g.add(core);
  return g;
}
function makeDriftwood() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.26, .34, 3.4, 8), M.log);
  body.rotation.z = Math.PI / 2 + .12;
  body.rotation.y = Math.random() * Math.PI;
  body.position.y = .12;                      // half-sunk
  const stub = new THREE.Mesh(new THREE.CylinderGeometry(.09, .13, .7, 5), M.trunk);
  stub.position.set(.6, .45, 0);
  stub.rotation.z = -.5;
  const moss = new THREE.Mesh(new THREE.SphereGeometry(.2, 6, 4), M.leafDark);
  moss.position.set(-.7, .32, 0);
  g.add(body, stub, moss);
  return g;
}
function makeIslet(scale = 1) {
  const g = new THREE.Group();
  const mud = new THREE.Mesh(new THREE.SphereGeometry(1.4, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2), M.hill);
  mud.scale.set(scale, scale * .35, scale);
  g.add(mud);
  const tuft = makeReeds();
  tuft.scale.setScalar(Math.max(.7, scale * .6));
  tuft.position.y = scale * .3;
  g.add(tuft);
  return g;
}
function makeBillboard(tex) {
  const g = new THREE.Group();
  for (const px of [-1.7, 1.7]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.11, .13, 3.2, 6), M.wood);
    post.position.set(px, 1.6, 0);
    g.add(post);
  }
  const frame = new THREE.Mesh(new THREE.BoxGeometry(4.1, 3.05, .12), M.wood);
  frame.position.y = 3.1;
  g.add(frame);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 2.75),
    new THREE.MeshBasicMaterial({ map: tex }));
  face.position.set(0, 3.1, .08);
  g.add(face);
  g.userData.face = face;
  return g;
}
function makeArch() {
  const g = new THREE.Group();
  for (const px of [-4.9, 4.9]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(.34, .4, 5.4, 10), M.stripe);
    col.position.set(px, 2.7, 0);
    g.add(col);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(.42, 8, 6), M.candleDark);
    cap.position.set(px, 5.45, 0);
    g.add(cap);
  }
  const arc = new THREE.Mesh(new THREE.TorusGeometry(4.9, .3, 8, 24, Math.PI), M.stripe);
  arc.position.y = 5.4;
  g.add(arc);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.06), M.sign);
  sign.position.y = 6.2;
  g.add(sign);
  return g;
}
function makeTVMast() {
  const g = new THREE.Group();
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(.14, .5, 26, 6), M.pole);
  mast.position.y = 13;
  g.add(mast);
  const dish = new THREE.Mesh(new THREE.BoxGeometry(2.6, .18, .18), M.pole);
  dish.position.y = 23; dish.rotation.y = .7;
  g.add(dish);
  const beacon = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff4030, transparent: true, blending: THREE.AdditiveBlending }));
  beacon.scale.set(3, 3, 1);
  beacon.position.y = 26.2;
  g.add(beacon);
  g.userData.beacon = beacon;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 5), M.canal);
  board.position.y = 16;
  g.add(board);
  return g;
}

/* the giant landmark — the wallpaper hill with the toad on it */
let landmarkToad = null;
function makeLandmark() {
  const g = new THREE.Group();
  const hill = new THREE.Mesh(new THREE.SphereGeometry(16, 16, 10), M.hill);
  hill.scale.y = .42;
  hill.position.y = -2.5;
  g.add(hill);
  return g;   // the toad sprite is attached after textures load
}

/* place all scenery */
const SIDE_PROPS = [];
{
  const rand = (a, b) => a + Math.random() * (b - a);
  const makers = [
    makeReeds,
    makeLilyCluster,
    () => makeIslet(rand(.9, 1.8)),
    makeLotus,
    makeDriftwood,
    makeLilyCluster,
    makeReeds,
    makeLotus,
    () => makeIslet(rand(.7, 1.2)),
  ];
  for (let i = 0; i < 34; i++) {
    const gm = castShadows(makers[i % makers.length]());
    const side = (i % 2) ? 1 : -1;
    gm.position.set(side * rand(6.5, 16), 0, -i * (SPAN / 34) - Math.random() * 3);
    gm.rotation.y = Math.random() * Math.PI * 2;
    scene.add(scrolling(gm, SPAN, (o) => {
      const s = Math.random() > .5 ? 1 : -1;
      o.position.x = s * rand(6.5, 16);
      o.rotation.y = Math.random() * Math.PI * 2;
    }));
    SIDE_PROPS.push(gm);
  }

  /* skyline silhouettes — static far rows */
  for (let i = 0; i < 16; i++) {
    const h = rand(6, 20), w = rand(4, 9);
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 3), M.skyline);
    const side = (i % 2) ? 1 : -1;
    b.position.set(side * rand(14, 60), h / 2 - .5, -95 - rand(0, 40));
    scene.add(b);
  }

  /* clouds */
  for (let i = 0; i < 8; i++) {
    const c = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: .85, fog: false }));
    c.scale.set(rand(18, 34), rand(8, 14), 1);
    c.position.set(rand(-90, 90), rand(26, 52), -rand(120, 200));
    c.userData.drift = rand(.2, .7);
    scene.add(c);
    SIDE_PROPS.push(c);
    c.userData.cloud = true;
  }

  /* drifting spark particles */
  const N = REDUCED ? 60 : 220;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = rand(-14, 14);
    pos[i * 3 + 1] = rand(.3, 9);
    pos[i * 3 + 2] = rand(-90, 8);
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const sparks = new THREE.Points(pg, new THREE.PointsMaterial({
    map: glowTex, color: 0xeaf6ff, size: .24, transparent: true, opacity: .28,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  }));
  scene.add(sparks);
  sparks.userData.n = N;
  SIDE_PROPS.sparks = sparks;

  /* bunting between two poles, twice per span */
  for (let k = 0; k < 2; k++) {
    const g = new THREE.Group();
    for (const px of [-5.4, 5.4]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.09, .11, 4.4, 6), M.pole);
      pole.position.set(px, 2.2, 0);
      g.add(pole);
    }
    const cols = [0xe66a5a, 0xf2d25c, 0x6ab7e6, 0x8cd456, 0xd88ac2];
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const x = -5.4 + t * 10.8;
      const y = 4.25 - Math.sin(t * Math.PI) * .7;
      const flag = new THREE.Mesh(new THREE.ConeGeometry(.17, .5, 4),
        new THREE.MeshLambertMaterial({ color: cols[i % cols.length] }));
      flag.rotation.x = Math.PI;
      flag.position.set(x, y - .22, 0);
      g.add(flag);
    }
    g.position.z = -40 - k * 75;
    scene.add(scrolling(g, SPAN));
  }

  /* pump.fun arch */
  const arch = castShadows(makeArch());
  arch.position.z = -110;
  scene.add(scrolling(arch, SPAN));

  /* Canal 88 mast, far off-path */
  const mast = makeTVMast();
  mast.position.set(26, 0, -130);
  scene.add(scrolling(mast, SPAN * 2, (o) => { o.position.x = (Math.random() > .5 ? 1 : -1) * rand(22, 40); }));
  SIDE_PROPS.mast = mast;

  /* landmark hill with giant toad */
  const lm = makeLandmark();
  lm.position.set(-42, 0, -120);
  scene.add(scrolling(lm, SPAN * 2, (o) => { o.position.x = (Math.random() > .5 ? 1 : -1) * rand(34, 52); }));
  SIDE_PROPS.landmark = lm;
}

/* ─────────────────────────────────────────────────────────────
   BILLBOARDS — the evidence folder leaks into the world
   ───────────────────────────────────────────────────────────── */
const MEME_FILES = [
  'greenwall', 'torch', 'matrix', 'king_of_the_pond', 'climbing_the_chart',
  'diamond_hands', 'astronaut', 'riding_the_bull', 'it_rains_green', 'toadmart',
];
const memeTextures = [];
{
  const loader = new THREE.TextureLoader();
  /* site-absolute: the game is served from /toadrun/ on the same origin */
  for (const f of MEME_FILES) {
    loader.load('/assets/memes/' + f + '.jpg', (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      memeTextures.push(t);
    }, undefined, () => { /* standalone file:// run — boards stay CANAL 88 */ });
  }
  for (let k = 0; k < 3; k++) {
    const b = castShadows(makeBillboard(canalTex));
    const side = (k % 2) ? 1 : -1;
    b.position.set(side * 7.6, 0, -30 - k * 48);
    b.rotation.y = side * -.28;
    scene.add(scrolling(b, SPAN, (o) => {
      const s = Math.random() > .5 ? 1 : -1;
      o.position.x = s * (7.2 + Math.random() * 2);
      o.rotation.y = s * -.28;
      if (memeTextures.length) {
        o.userData.face.material.map = memeTextures[(Math.random() * memeTextures.length) | 0];
        o.userData.face.material.needsUpdate = true;
      }
    }));
  }
}

/* ─────────────────────────────────────────────────────────────
   CHARACTER SPRITES
   ───────────────────────────────────────────────────────────── */
const FRAMES = ['run1', 'run2', 'run3', 'jump', 'fall', 'roll', 'hit', 'idle_front'];
const CHASER_FRAMES = ['alon_run1', 'alon_run2', 'alon_run3'];
const CHASER_CYCLE = [0, 1, 2, 1];
const baseBitmaps = {};       // name → ImageBitmap (for skin recolors)
const tex = {};               // active texture set (current skin)

const SKINS = {
  classic: { label: 'Classic', hue: null, price: 0, swatch: '#5abf3c' },
  cherry: { label: 'Cherry', hue: 115, price: 400, swatch: '#d8453a' },
  blueberry: { label: 'Blueberry', hue: -125, price: 400, swatch: '#4f74d8' },
  golden: { label: 'Golden', hue: 62, price: 1500, swatch: '#e9b62a' },
};

/* selective recolor: rotate hue ONLY for green-dominant pixels, so the
   red shirt and yellow overalls survive every skin */
function recolor(bitmap, hueShift) {
  const c = document.createElement('canvas');
  c.width = bitmap.width; c.height = bitmap.height;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(bitmap, 0, 0);
  const img = x.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    if (d[i + 3] < 8) continue;
    if (g > r * 1.06 && g > b * 1.06) {          // green-dominant → this is toad skin
      /* rgb→hsl, shift hue, back */
      const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255;
      const l = (mx + mn) / 2, dl = mx - mn;
      let h = 0;
      const s = dl === 0 ? 0 : dl / (1 - Math.abs(2 * l - 1));
      if (dl > 0) {
        if (mx === g / 255) h = ((b / 255 - r / 255) / dl + 2) * 60;
        else if (mx === r / 255) h = (((g / 255 - b / 255) / dl) % 6) * 60;
        else h = ((r / 255 - g / 255) / dl + 4) * 60;
      }
      h = (h - hueShift + 360) % 360;
      const cc = (1 - Math.abs(2 * l - 1)) * s, xx = cc * (1 - Math.abs((h / 60) % 2 - 1)), m = l - cc / 2;
      let rr = 0, gg = 0, bb = 0;
      if (h < 60) { rr = cc; gg = xx; } else if (h < 120) { rr = xx; gg = cc; }
      else if (h < 180) { gg = cc; bb = xx; } else if (h < 240) { gg = xx; bb = cc; }
      else if (h < 300) { rr = xx; bb = cc; } else { rr = cc; bb = xx; }
      d[i] = (rr + m) * 255; d[i + 1] = (gg + m) * 255; d[i + 2] = (bb + m) * 255;
    }
  }
  x.putImageData(img, 0, 0);
  return c;
}

const skinCache = {};   // skin → { frame → texture }
function texturesFor(skin) {
  if (skin === 'classic' || !SKINS[skin] || SKINS[skin].hue === null) {
    return Object.fromEntries(FRAMES.map(f => [f, baseTex(f)]));
  }
  if (!skinCache[skin]) {
    skinCache[skin] = {};
    for (const f of FRAMES) {
      const t = new THREE.CanvasTexture(recolor(baseBitmaps[f], SKINS[skin].hue));
      t.colorSpace = THREE.SRGBColorSpace;
      skinCache[skin][f] = t;
    }
  }
  return skinCache[skin];
}
const baseTexCache = {};
function baseTex(f) {
  if (!baseTexCache[f]) {
    const t = new THREE.CanvasTexture(baseBitmaps[f]);
    t.colorSpace = THREE.SRGBColorSpace;
    baseTexCache[f] = t;
  }
  return baseTexCache[f];
}

function applySkin(skin) {
  const set = texturesFor(skin);
  for (const f of FRAMES) tex[f] = set[f];
  if (toad) setToadFrame(currentFrame, true);
  if (landmarkToad) { landmarkToad.material.map = tex.idle_front; landmarkToad.material.needsUpdate = true; }
}

/* sprite plane helper — feet anchored at group origin. The custom depth
   material lets a flat cut-out cast a correctly-shaped shadow. */
function spritePlane(t, h) {
  const w = h * (512 / 768);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: .28, side: THREE.DoubleSide })
  );
  m.customDepthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: .28,
  });
  m.castShadow = true;
  m.position.y = h / 2;
  return m;
}

let toad = null, toadSprite = null, toadShadow = null;
let frog = null, frogSprite = null, frogShadow = null;
let currentFrame = 'run1';

function setToadFrame(f, force = false) {
  if (!force && currentFrame === f) return;
  currentFrame = f;
  toadSprite.material.map = tex[f];
  toadSprite.material.needsUpdate = true;
  /* the depth material is what the shadow map sees — keep it in step,
     or the shadow stays stuck in the first pose */
  if (toadSprite.customDepthMaterial) {
    toadSprite.customDepthMaterial.map = tex[f];
    toadSprite.customDepthMaterial.needsUpdate = true;
  }
}
let frogFrame = 0;
const frogTex = {};
function setFrogFrame(i) {
  frogSprite.material.map = frogTex[CHASER_FRAMES[i]];
  frogSprite.material.needsUpdate = true;
  if (frogSprite.customDepthMaterial) {
    frogSprite.customDepthMaterial.map = frogTex[CHASER_FRAMES[i]];
    frogSprite.customDepthMaterial.needsUpdate = true;
  }
}

function buildCharacters() {
  toad = new THREE.Group();
  toadSprite = spritePlane(tex.run1, TOAD_H);
  toad.add(toadSprite);
  /* faint contact blob under the real shadow — grounds the feet */
  toadShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .9),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: .5 }));
  toadShadow.rotation.x = -Math.PI / 2;
  toadShadow.position.y = .02;
  toad.add(toadShadow);
  toad.position.set(0, 0, 0);
  scene.add(toad);

  frog = new THREE.Group();
  frogSprite = spritePlane(frogTex[CHASER_FRAMES[0]], 1.58);
  frog.add(frogSprite);
  frogShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .75),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: .45 }));
  frogShadow.rotation.x = -Math.PI / 2;
  frogShadow.position.y = .02;
  frog.add(frogShadow);
  frog.position.set(0, 0, 3.35);
  scene.add(frog);

  /* the giant on the hill — no shadow: he lives outside the shadow
     camera and a 13-unit blob sweeping the track would be chaos */
  landmarkToad = spritePlane(tex.idle_front, 13);
  landmarkToad.castShadow = false;
  landmarkToad.position.y = 3.6;
  SIDE_PROPS.landmark.add(landmarkToad);
}

/* ─────────────────────────────────────────────────────────────
   OBSTACLES — pooled; four kinds
   log     h .55  driftwood — leap it
   crate   h .95  mossy boulder — leap it (kind kept for the pools)
   candle  tall   change lane (a green candle only goes up)
   banner  high   roll under it
   ───────────────────────────────────────────────────────────── */
function makeLog() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.28, .28, 1.9, 10), M.log);
  body.rotation.z = Math.PI / 2;
  body.position.y = .28;
  const end = new THREE.Mesh(new THREE.CylinderGeometry(.29, .29, .06, 10), M.logEnd);
  end.rotation.z = Math.PI / 2;
  end.position.set(.95, .28, 0);
  const moss = new THREE.Mesh(new THREE.SphereGeometry(.18, 6, 4), M.leafDark);
  moss.position.set(-.4, .5, 0);
  g.add(body, end, moss);
  g.userData.kind = 'log'; g.userData.clearH = .55; g.userData.halfD = .35;
  return g;
}
function makeCrate() {
  const g = new THREE.Group();
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.78), M.stoneDark);
  rock.scale.set(1.05, .62, .58);
  rock.position.y = .47;
  rock.rotation.y = .5;
  const cap = new THREE.Mesh(new THREE.DodecahedronGeometry(.4), M.stone);
  cap.scale.set(1, .6, .8);
  cap.position.set(.35, .8, .1);
  const moss = new THREE.Mesh(new THREE.SphereGeometry(.32, 7, 5), M.leafDark);
  moss.scale.y = .5;
  moss.position.set(-.35, .88, 0);
  g.add(rock, cap, moss);
  g.userData.kind = 'crate'; g.userData.clearH = .95; g.userData.halfD = .45;
  return g;
}
function makeCandle() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(.95, 2.5, .7), M.candle);
  body.position.y = 1.25;
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, .3, .9), M.candleDark);
  base.position.y = .15;
  const wick = new THREE.Mesh(new THREE.BoxGeometry(.1, .55, .1), M.candleDark);
  wick.position.y = 2.75;
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xaef06a, transparent: true, blending: THREE.AdditiveBlending }));
  flame.scale.set(1.4, 1.4, 1);
  flame.position.y = 3.05;
  g.add(body, base, wick, flame);
  g.userData.kind = 'candle'; g.userData.clearH = 99; g.userData.halfD = .4;
  return g;
}
function makeBanner() {
  const g = new THREE.Group();
  for (const px of [-1.05, 1.05]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, 2.3, 6), M.pole);
    pole.position.set(px, 1.15, 0);
    g.add(pole);
  }
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(2, .95), M.fud);
  cloth.position.y = 1.68;
  g.add(cloth);
  g.userData.kind = 'banner'; g.userData.clearH = 0; g.userData.lowH = 1.15; g.userData.halfD = .3;
  return g;
}

const obstaclePool = [];
{
  const makers = [makeLog, makeLog, makeCrate, makeCrate, makeCandle, makeCandle, makeCandle, makeBanner, makeBanner, makeLog, makeCrate, makeCandle, makeBanner, makeLog];
  for (const mk of makers) {
    const o = castShadows(mk());
    o.visible = false;
    o.userData.live = false;
    scene.add(o);
    obstaclePool.push(o);
  }
}
function obstacleOfKind(kind) {
  return obstaclePool.find(o => !o.userData.live && o.userData.kind === kind) || null;
}

/* ─────────────────────────────────────────────────────────────
   PILLS + POWER-UPS — pooled
   ───────────────────────────────────────────────────────────── */
function makePill() {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CapsuleGeometry(.16, .18, 4, 10), M.pillWhite);
  const bot = new THREE.Mesh(new THREE.CapsuleGeometry(.163, .02, 4, 10), M.pillGreen);
  bot.position.y = -.1;
  bot.scale.y = 1.7;
  g.add(top, bot);
  g.rotation.z = .5;
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xbaffc4, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.scale.set(1.1, 1.1, 1);
  g.add(glow);
  return g;
}
const pillPool = [];
for (let i = 0; i < 42; i++) {
  const p = makePill();
  p.visible = false;
  p.userData.live = false;
  scene.add(p);
  pillPool.push(p);
}
const powerPool = [];
for (const kind of ['magnet', 'star', 'x2']) {
  for (let i = 0; i < 2; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(.72, .72, .72),
      new THREE.MeshBasicMaterial({ map: powerTex[kind] }));
    m.userData.kind = kind;
    m.userData.live = false;
    m.visible = false;
    scene.add(m);
    powerPool.push(m);
  }
}

/* pickup burst */
const burst = new THREE.Points(
  (() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12 * 3), 3));
    return g;
  })(),
  new THREE.PointsMaterial({ map: glowTex, color: 0xdfffb0, size: .5, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
);
scene.add(burst);
let burstT = 1;
const burstVel = Array.from({ length: 12 }, () => new THREE.Vector3());
function doBurst(x, y, z) {
  const pos = burst.geometry.attributes.position.array;
  for (let i = 0; i < 12; i++) {
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    burstVel[i].set((Math.random() - .5) * 5, Math.random() * 5, (Math.random() - .5) * 5);
  }
  burst.geometry.attributes.position.needsUpdate = true;
  burstT = 0;
  burst.material.opacity = .9;
}

/* landing ripples — a ring of pond water pushed out by each hop */
const ripplePool = [];
for (let i = 0; i < 6; i++) {
  const r = new THREE.Mesh(new THREE.RingGeometry(.55, .78, 20),
    new THREE.MeshBasicMaterial({ color: 0xdff6ff, transparent: true, opacity: 0, depthWrite: false }));
  r.rotation.x = -Math.PI / 2;
  r.position.y = .025;
  r.visible = false;
  r.userData.t = 1;
  scene.add(r);
  ripplePool.push(r);
}
function ripple(x, z, big = false) {
  const r = ripplePool.find(q => q.userData.t >= 1);
  if (!r) return;
  r.position.x = x; r.position.z = z;
  r.userData.t = 0;
  r.userData.big = big;
  r.visible = true;
}

/* ─────────────────────────────────────────────────────────────
   GAME STATE
   ───────────────────────────────────────────────────────────── */
let state = STATE.LOAD;
let best = store.get('best', 0);
let bank = store.get('pills', 0);          // persistent pill balance
let upgrades = store.get('up', { magnet: 0, star: 0, x2: 0 });
let ownedSkins = store.get('skins', ['classic']);
let skin = store.get('skin', 'classic');

/* per-run */
let dist = 0, score = 0, runPills = 0, closeCalls = 0, speed = SPEED_BASE;
let lane = 1, laneX = 0, targetLane = 1, queuedLane = 0;
let toadY = 0, vy = 0, grounded = true, bigAir = false, rolling = 0, animT = 0;
let hopPhase = 0;               // >0: coiled on the ground, counting down to launch
let jumpBuf = 0;                // leap pressed a hair early — honour it on landing
let dieT = 0, shakeT = 0, squash = 1, squashV = 0, invulnBlink = 0;
let power = null, powerT = 0, powerMax = 1;   // active power-up
let spawnGap = 24, spawnAcc = 0, sincePower = 0, lastKind = '';

function resetRun() {
  dist = 0; score = 0; runPills = 0; closeCalls = 0;
  speed = SPEED_BASE;
  lane = 1; targetLane = 1; queuedLane = 0; laneX = 0;
  toadY = 0; vy = 0; grounded = true; bigAir = false; rolling = 0;
  hopPhase = 0; jumpBuf = 0; squash = 1; squashV = 0;
  dieT = 0; shakeT = 0; squash = 1;
  power = null; powerT = 0; sincePower = 0;
  spawnGap = 24; spawnAcc = 12;
  for (const o of obstaclePool) { o.userData.live = false; o.visible = false; }
  for (const p of pillPool) { p.userData.live = false; p.visible = false; }
  for (const p of powerPool) { p.userData.live = false; p.visible = false; }
  toad.position.set(0, 0, 0);
  toad.rotation.z = 0;
  frog.position.set(0, 0, 3.35);
  setToadFrame('run1', true);
  el.power.hidden = true;
  /* prime the runway — the first reeds shouldn't be 13 seconds away */
  spawnPattern(-60);
  spawnPattern(-95);
  spawnPattern(-130);
}

/* ─────────────────────────────────────────────────────────────
   SPAWNING — patterns that are always survivable
   ───────────────────────────────────────────────────────────── */
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

function placeObstacle(kind, laneIdx, z) {
  const o = obstacleOfKind(kind);
  if (!o) return null;
  o.position.set(LANE_X[laneIdx], 0, z);
  o.userData.live = true;
  o.userData.lane = laneIdx;
  o.userData.counted = false;
  o.userData.smashed = 0;
  o.visible = true;
  o.rotation.y = 0;
  o.scale.setScalar(1);
  return o;
}
function placePillLine(laneIdx, z0, n, arc = false) {
  for (let i = 0; i < n; i++) {
    const p = pillPool.find(q => !q.userData.live);
    if (!p) return;
    const z = z0 - i * 1.7;
    const y = arc ? .7 + Math.sin((i / (n - 1)) * Math.PI) * 1.35 : .75;
    p.position.set(LANE_X[laneIdx], y, z);
    p.userData.live = true;
    p.visible = true;
  }
}

function spawnPattern(zBase = SPAWN_Z) {
  const d = dist;
  /* which patterns are on the table grows with distance */
  const table = ['single', 'single', 'pillrow'];
  if (d > 60) table.push('double', 'candle');
  if (d > 160) table.push('candle', 'banner', 'double');
  if (d > 320) table.push('candlePair', 'bannerCandle', 'gauntlet');
  let kind = pick(table);
  if (kind === lastKind && Math.random() < .6) kind = pick(table);
  lastKind = kind;

  const lanes = [0, 1, 2];
  const l1 = pick(lanes);
  const others = lanes.filter(l => l !== l1);
  const l2 = pick(others);

  switch (kind) {
    case 'single': {
      const o = placeObstacle(pick(['log', 'crate']), l1, zBase);
      if (o && Math.random() < .5) placePillLine(l1, zBase + 3.2, 5, true);
      break;
    }
    case 'double': {
      placeObstacle(pick(['log', 'crate']), l1, zBase);
      placeObstacle(pick(['log', 'crate']), l2, zBase - rnd(0, 3));
      placePillLine(others.find(l => l !== l2) ?? l1, zBase + 2, 5, false);
      break;
    }
    case 'candle': {
      placeObstacle('candle', l1, zBase);
      placePillLine(pick(others), zBase + 1, 5, false);
      break;
    }
    case 'candlePair': {
      placeObstacle('candle', l1, zBase);
      placeObstacle('candle', l2, zBase - 1.2);
      placePillLine(others.find(l => l !== l2), zBase + 1, 6, false);
      break;
    }
    case 'banner': {
      placeObstacle('banner', l1, zBase);
      placePillLine(l1, zBase + 2.6, 4, false);
      break;
    }
    case 'bannerCandle': {
      placeObstacle('banner', l1, zBase);
      placeObstacle('candle', l2, zBase - rnd(0, 2));
      break;
    }
    case 'gauntlet': {
      /* low, then candle two lanes over, then low — a little slalom */
      placeObstacle(pick(['log', 'crate']), l1, zBase);
      placeObstacle('candle', l2, zBase - 9);
      placeObstacle(pick(['log', 'crate']), l1, zBase - 18);
      break;
    }
    case 'pillrow': {
      placePillLine(l1, zBase, 7, false);
      break;
    }
  }

  /* harder patterns get more run-up IN FRONT of them — the old game's
     hardest-won lesson */
  const heavy = kind === 'candlePair' || kind === 'bannerCandle' || kind === 'gauntlet';
  spawnGap = rnd(24, 36) + (heavy ? 12 : 0) + speed * .45;

  /* the occasional power-up cube, in a lane clear of this pattern */
  sincePower += 1;
  if (sincePower >= 9 && Math.random() < .5) {
    sincePower = 0;
    const p = powerPool.find(q => !q.userData.live);
    if (p) {
      p.position.set(LANE_X[pick(lanes)], .85, zBase + spawnGap * .5);
      p.userData.live = true;
      p.visible = true;
    }
  }
}

/* ─────────────────────────────────────────────────────────────
   INPUT
   ───────────────────────────────────────────────────────────── */
function goLane(dir) {
  if (state !== STATE.PLAY) return;
  const next = targetLane + dir;
  if (next < 0 || next > 2) return;
  if (Math.abs(laneX - LANE_X[targetLane]) > .6) { queuedLane = dir; return; }
  targetLane = next;
  Sound.lane();
}
/* the actual push-off — from the ground it fires out of the coil,
   mid-small-hop it converts the hop into the leap */
function launchLeap() {
  vy = JUMP_VY;
  grounded = false;
  bigAir = true;
  rolling = 0;
  hopPhase = 0;
  squashV = 6.5;              // explosive extension out of the crouch
  ripple(laneX, .3, false);   // the shove-off kicks the water behind him
  Sound.jump();
}
function doJump() {
  if (state !== STATE.PLAY) return;
  /* mid-big-leap: buffer it — a press a hair early should still fire
     the instant he touches down, not be eaten */
  if (!grounded && bigAir) { jumpBuf = .14; return; }
  launchLeap();
}
function doRoll() {
  if (state !== STATE.PLAY) return;
  if (!grounded) {
    vy = SLAM_VY;
    /* from a small hop, tuck straight into the roll so the input
       does what the player meant; from a big leap it's the slam */
    if (!bigAir) rolling = ROLL_TIME;
    Sound.slam();
    return;
  }
  rolling = ROLL_TIME;
  Sound.slam();
}

addEventListener('keydown', (e) => {
  const k = e.key;
  if (state === STATE.PLAY || state === STATE.MENU || state === STATE.OVER) {
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') { goLane(-1); e.preventDefault(); }
    if (k === 'ArrowRight' || k === 'd' || k === 'D') { goLane(1); e.preventDefault(); }
    if (k === 'ArrowUp' || k === 'w' || k === 'W' || k === ' ') {
      e.preventDefault();
      if (e.repeat) return;
      if (state === STATE.MENU) startRun();
      else if (state === STATE.OVER) { if (overCooldown <= 0) startRun(); }
      else doJump();
    }
    if (k === 'ArrowDown' || k === 's' || k === 'S') { doRoll(); e.preventDefault(); }
  }
  if (k === 'Escape') {
    if (state === STATE.PLAY) pauseGame();
    else if (state === STATE.PAUSE) resumeGame();
  }
  if ((k === 'p' || k === 'P') && state === STATE.PLAY) pauseGame();
});

/* touch: swipe to steer, tap to jump */
let tx = 0, ty = 0, tt = 0;
addEventListener('touchstart', (e) => {
  if (!e.touches.length) return;
  tx = e.touches[0].clientX; ty = e.touches[0].clientY; tt = performance.now();
}, { passive: true });
addEventListener('touchend', (e) => {
  if (state !== STATE.PLAY) return;
  const t = e.changedTouches[0];
  if (!t) return;
  const dx = t.clientX - tx, dy = t.clientY - ty;
  const adx = Math.abs(dx), ady = Math.abs(dy);
  if (Math.max(adx, ady) < 24) {
    if (performance.now() - tt < 350 && !t.target.closest('button')) doJump();
    return;
  }
  if (adx > ady) goLane(dx > 0 ? 1 : -1);
  else if (dy < 0) doJump();
  else doRoll();
}, { passive: true });

/* ─────────────────────────────────────────────────────────────
   QUESTS — three a day, date-keyed
   ───────────────────────────────────────────────────────────── */
function todayKey() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function loadQuests() {
  let q = store.get('quests', null);
  if (!q || q.date !== todayKey()) {
    q = {
      date: todayKey(),
      list: [
        { id: 'pills', label: 'Collect {n} pills', target: 40 + ((Math.random() * 8) | 0) * 10, prog: 0, done: false },
        { id: 'close', label: '{n} close calls', target: 6 + ((Math.random() * 6) | 0) * 2, prog: 0, done: false },
        { id: 'dist', label: 'Run {n}m in one run', target: 300 + ((Math.random() * 6) | 0) * 100, prog: 0, done: false },
      ],
    };
    store.set('quests', q);
  }
  return q;
}
let quests = loadQuests();
function questProgress(id, value, absolute = false) {
  const q = quests.list.find(x => x.id === id);
  if (!q || q.done) return;
  q.prog = absolute ? Math.max(q.prog, value) : q.prog + value;
  if (q.prog >= q.target) {
    q.done = true;
    bank += 100;
    store.set('pills', bank);
    Sound.quest();
    toast('Quest complete: ' + q.label.replace('{n}', q.target) + ' — +100 💊');
  }
  store.set('quests', quests);
}
function renderQuests() {
  quests = loadQuests();
  el.quests.innerHTML = '';
  for (const q of quests.list) {
    const div = document.createElement('div');
    div.className = 'quest' + (q.done ? ' is-done' : '');
    div.innerHTML = q.label.replace('{n}', q.target) +
      ' — <b>' + Math.min(q.prog | 0, q.target) + '/' + q.target + '</b>';
    el.quests.appendChild(div);
  }
}

/* ─────────────────────────────────────────────────────────────
   SHOP
   ───────────────────────────────────────────────────────────── */
const POWER_DEFS = {
  magnet: { ico: '🧲', label: 'Magnet', desc: 'pulls pills in', prices: [250, 400, 600] },
  x2: { ico: '✖️2', label: 'Double Score', desc: 'score ×2 while active', prices: [250, 400, 600] },
  star: { ico: '⭐', label: 'Invincible', desc: 'smash through everything', prices: [300, 450, 650] },
};
function powerDuration(kind) {
  const lvl = upgrades[kind] || 0;
  return kind === 'star' ? 3 + lvl * 1.5 : 5 + lvl * 2;
}
function renderShop() {
  el.shopPills.textContent = bank;
  el.shopPowers.innerHTML = '';
  for (const [kind, def] of Object.entries(POWER_DEFS)) {
    const lvl = upgrades[kind] || 0;
    const row = document.createElement('div');
    row.className = 'shop__item';
    const dots = '●'.repeat(lvl) + '○'.repeat(3 - lvl);
    const price = lvl >= 3 ? null : def.prices[lvl];
    row.innerHTML = `<i>${def.ico}</i>
      <span class="shop__meta"><b>${def.label} <small style="color:#8a4">${dots}</small></b>
      <span>${def.desc} · ${powerDuration(kind).toFixed(1)}s${lvl < 3 ? ' → ' + (kind === 'star' ? 3 + (lvl + 1) * 1.5 : 5 + (lvl + 1) * 2).toFixed(1) + 's' : ''}</span></span>`;
    const btn = document.createElement('button');
    btn.className = 'shop__buy';
    if (price === null) { btn.textContent = 'MAX'; btn.disabled = true; }
    else {
      btn.textContent = price + ' 💊';
      btn.disabled = bank < price;
      btn.addEventListener('click', () => {
        if (bank < price) { Sound.deny(); return; }
        bank -= price;
        upgrades[kind] = lvl + 1;
        store.set('pills', bank);
        store.set('up', upgrades);
        Sound.buy();
        renderShop();
      });
    }
    row.appendChild(btn);
    el.shopPowers.appendChild(row);
  }

  el.shopSkins.innerHTML = '';
  for (const [id, def] of Object.entries(SKINS)) {
    const row = document.createElement('div');
    row.className = 'shop__item';
    row.innerHTML = `<span class="shop__swatch" style="background:${def.swatch}"></span>
      <span class="shop__meta"><b>${def.label}</b></span>`;
    const btn = document.createElement('button');
    btn.className = 'shop__buy';
    const owned = ownedSkins.includes(id);
    if (skin === id) { btn.textContent = 'ON'; btn.classList.add('is-on'); }
    else if (owned) {
      btn.textContent = 'WEAR';
      btn.addEventListener('click', () => { skin = id; store.set('skin', id); applySkin(id); Sound.buy(); renderShop(); });
    } else {
      btn.textContent = def.price + ' 💊';
      btn.disabled = bank < def.price;
      btn.addEventListener('click', () => {
        if (bank < def.price) { Sound.deny(); return; }
        bank -= def.price;
        ownedSkins.push(id);
        skin = id;
        store.set('pills', bank);
        store.set('skins', ownedSkins);
        store.set('skin', id);
        applySkin(id);
        Sound.buy();
        renderShop();
      });
    }
    row.appendChild(btn);
    el.shopSkins.appendChild(row);
  }
}

/* ─────────────────────────────────────────────────────────────
   SCREEN FLOW
   ───────────────────────────────────────────────────────────── */
function show(scr) {
  for (const s of [el.load, el.menu, el.shop, el.pause, el.over]) s.hidden = s !== scr;
  if (!scr) for (const s of [el.load, el.menu, el.shop, el.pause, el.over]) s.hidden = true;
}
function showMenu() {
  state = STATE.MENU;
  resetRun();
  el.hud.hidden = true;
  el.menuBest.textContent = best;
  el.menuPills.textContent = bank;
  renderQuests();
  show(el.menu);
}
function startRun() {
  resetRun();
  state = STATE.PLAY;
  show(null);
  el.hud.hidden = false;
  Sound.wake();
  Sound.startMusic();
}
function pauseGame() {
  if (state !== STATE.PLAY) return;
  state = STATE.PAUSE;
  show(el.pause);
}
function resumeGame() {
  if (state !== STATE.PAUSE) return;
  show(null);
  state = STATE.PLAY;
}
let overCooldown = 0;
function gameOver() {
  state = STATE.OVER;
  overCooldown = .8;
  const s = Math.round(score);
  const beat = s > best;
  if (beat) { best = s; store.set('best', best); }
  bank += runPills;
  store.set('pills', bank);
  el.overScore.textContent = s;
  el.overBest.textContent = best;
  el.overNew.hidden = !beat;
  el.overDist.textContent = Math.round(dist) + 'm';
  el.overPills.textContent = runPills;
  el.overClose.textContent = closeCalls;
  el.share.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(
    `I scored ${s} in TOAD RUN 🐸💨 outrunning the 2005 copy.\nThe first Pepe. Since 1988. $TOAD\n`
  ) + '&url=' + encodeURIComponent('https://thetoadmeme.com');
  el.hud.hidden = true;
  show(el.over);
}

function quitToDesktop() {
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'toadrun:quit' }, location.origin);
  } else {
    location.href = '/';
  }
}

/* UI wiring */
$('#btnPlay').addEventListener('click', startRun);
$('#btnAgain').addEventListener('click', startRun);
$('#btnResume').addEventListener('click', resumeGame);
$('#btnShop').addEventListener('click', () => { renderShop(); show(el.shop); });
$('#shopX').addEventListener('click', showMenu);
$('#btnPauseMenu').addEventListener('click', showMenu);
$('#btnOverMenu').addEventListener('click', showMenu);
$('#hudPause').addEventListener('click', pauseGame);
for (const id of ['#btnQuit1', '#btnQuit2', '#btnQuit3']) $(id).addEventListener('click', quitToDesktop);
$('#btnSfx').addEventListener('click', (e) => { e.target.classList.toggle('is-off', !Sound.toggleSfx()); });
$('#btnMusic').addEventListener('click', (e) => { e.target.classList.toggle('is-off', !Sound.toggleMusic()); });
$('#btnSfx').classList.toggle('is-off', !Sound.sfxOn);
$('#btnMusic').classList.toggle('is-off', !Sound.musicOn);

/* pause when the tab hides; the launcher iframe stays warm */
document.addEventListener('visibilitychange', () => { if (document.hidden && state === STATE.PLAY) pauseGame(); });

/* ─────────────────────────────────────────────────────────────
   SIMULATION — one fixed 1/60 s tick
   ───────────────────────────────────────────────────────────── */
function activatePower(kind) {
  power = kind;
  powerMax = powerDuration(kind);
  powerT = powerMax;
  el.power.hidden = false;
  el.powerIco.textContent = POWER_DEFS[kind].ico;
  Sound.power();
}

function tick(dt) {
  if (state === STATE.OVER && overCooldown > 0) overCooldown -= dt;

  /* menu: world idles by slowly, toad bobs on the spot */
  const idle = state === STATE.MENU || state === STATE.OVER || state === STATE.PAUSE;
  const moving = state === STATE.PLAY || state === STATE.DYING;
  const worldSpeed = moving ? speed : (idle ? 2.2 : 0);

  /* scroll the world */
  for (const s of scrollers) {
    s.obj.position.z += worldSpeed * dt;
    if (s.obj.position.z > KILL_Z) {
      s.obj.position.z -= s.span;
      s.onRecycle && s.onRecycle(s.obj);
    }
  }
  /* the stepping stones are one periodic field — a modulo, not a wrap */
  stoneField.position.z = (stoneField.position.z + worldSpeed * dt) % STONE_PERIOD;
  /* water surface: the ripple pattern scrolls with the world (the pond
     is still — WE move) plus a slow sideways drift from the wind */
  const uvScroll = worldSpeed * dt * .12;
  waterBump.offset.y = (waterBump.offset.y + uvScroll) % 1;
  waterBumpNear.offset.y = (waterBumpNear.offset.y + uvScroll) % 1;
  waterBump.offset.x = (waterBump.offset.x + dt * .012) % 1;
  waterBumpNear.offset.x = (waterBumpNear.offset.x + dt * .012) % 1;
  /* clouds drift on their own clock */
  for (const p of SIDE_PROPS) {
    if (p.userData && p.userData.cloud) {
      p.position.x += p.userData.drift * dt;
      if (p.position.x > 110) p.position.x = -110;
    }
  }
  if (SIDE_PROPS.mast) {
    const b = SIDE_PROPS.mast.userData.beacon;
    b.material.opacity = .4 + Math.sin(performance.now() * .004) * .35;
  }
  if (landmarkToad) {
    /* giant toad always faces the camera around Y */
    const lp = SIDE_PROPS.landmark.position;
    landmarkToad.rotation.y = Math.atan2(camera.position.x - lp.x, camera.position.z - lp.z);
  }
  const sparks = SIDE_PROPS.sparks;
  if (sparks) {
    const a = sparks.geometry.attributes.position.array;
    for (let i = 0; i < sparks.userData.n; i++) {
      a[i * 3 + 1] += dt * .25;
      a[i * 3 + 2] += worldSpeed * dt * .35;
      if (a[i * 3 + 1] > 10) a[i * 3 + 1] = .2;
      if (a[i * 3 + 2] > 8) a[i * 3 + 2] = -90;
    }
    sparks.geometry.attributes.position.needsUpdate = true;
  }

  if (state === STATE.PLAY) {
    /* speed & score */
    speed = Math.min(SPEED_MAX, SPEED_BASE + dist * SPEED_GAIN);
    dist += speed * dt;
    score += speed * dt * 3.5 * (power === 'x2' ? 2 : 1);
    questProgress('dist', dist, true);

    /* spawning */
    spawnAcc += speed * dt;
    if (spawnAcc >= spawnGap) { spawnAcc = 0; spawnPattern(); }

    /* lane movement */
    if (queuedLane && Math.abs(laneX - LANE_X[targetLane]) < .6) {
      const next = targetLane + queuedLane;
      if (next >= 0 && next <= 2) { targetLane = next; Sound.lane(); }
      queuedLane = 0;
    }
    const dx = LANE_X[targetLane] - laneX;
    const step = LANE_SNAP * dt;
    if (Math.abs(dx) <= step) laneX = LANE_X[targetLane];
    else laneX += Math.sign(dx) * step;
    lane = targetLane;

    /* vertical — a pure parabola in the air; on the ground, the toad
       cycle: land with a splat → coil for a beat → spring off again */
    if (!grounded) {
      vy += GRAVITY * dt;
      toadY += vy * dt;
      if (toadY <= 0) {
        const hard = bigAir || vy < -12;
        toadY = 0; vy = 0; grounded = true; bigAir = false;
        /* heavier landings need a longer gather; the jitter keeps him
           an animal instead of a metronome */
        hopPhase = GATHER * (hard ? 1.7 : 1) * (.85 + Math.random() * .35);
        squash = hard ? .6 : .74;
        squashV = hard ? -1.6 : -.8;    // momentum carries the splat a touch deeper
        ripple(laneX, 0, hard);
        if (jumpBuf > 0) { jumpBuf = 0; launchLeap(); }
      }
    }
    if (jumpBuf > 0) jumpBuf -= dt;
    if (rolling > 0) rolling -= dt;
    /* the coil counts down only while he's actually crouched */
    if (grounded && rolling <= 0) {
      hopPhase -= dt;
      if (hopPhase <= 0) {
        vy = HOP_VY * (.9 + Math.random() * .2);
        grounded = false;
        squashV = 4.2;                  // spring release
      }
    }

    /* power-up timer */
    if (power) {
      powerT -= dt;
      el.powerFill.style.width = Math.max(0, powerT / powerMax * 100) + '%';
      if (powerT <= 0) { power = null; el.power.hidden = true; }
    }

    /* obstacles: move, collide, near-miss */
    const toadHalfW = .62;
    const hitH = rolling > 0 ? ROLL_HIT_H : STAND_HIT_H;
    for (const o of obstaclePool) {
      if (!o.userData.live) continue;
      o.position.z += speed * dt;
      if (o.userData.smashed > 0) {
        o.userData.smashed -= dt;
        o.rotation.y += dt * 9;
        o.scale.setScalar(Math.max(.01, o.scale.x - dt * 2.4));
        o.position.y += dt * 3;
        if (o.userData.smashed <= 0) { o.userData.live = false; o.visible = false; o.position.y = 0; }
        continue;
      }
      if (o.position.z > KILL_Z) { o.userData.live = false; o.visible = false; continue; }

      const inZ = Math.abs(o.position.z) < o.userData.halfD + .5;
      const inLane = Math.abs(o.position.x - laneX) < toadHalfW + .55;
      if (inZ && inLane) {
        const kind = o.userData.kind;
        let collide;
        if (kind === 'banner') collide = rolling <= 0 && toadY + .1 < 2 && toadY + hitH > o.userData.lowH;
        else collide = toadY < o.userData.clearH;
        if (collide) {
          if (power === 'star') {
            o.userData.smashed = .5;
            score += 15;
            doBurst(o.position.x, 1, o.position.z);
            Sound.slam();
          } else {
            die();
            break;
          }
        }
      }
      /* near miss: it slides past the toad's z untouched but close */
      if (!o.userData.counted && o.position.z > .8) {
        o.userData.counted = true;
        const lateral = Math.abs(o.position.x - laneX);
        const jumped = o.userData.clearH < 90 && lateral < toadHalfW + .55;
        if ((lateral > toadHalfW + .55 && lateral < 2.3) || jumped) {
          closeCalls++;
          questProgress('close', 1);
        }
      }
    }

    /* pills */
    for (const p of pillPool) {
      if (!p.userData.live) continue;
      p.position.z += speed * dt;
      p.rotation.y += dt * 3.4;
      if (p.position.z > KILL_Z) { p.userData.live = false; p.visible = false; continue; }
      if (power === 'magnet' && p.position.z > -8) {
        p.position.x += (laneX - p.position.x) * dt * 7;
        p.position.y += (toadY + .8 - p.position.y) * dt * 7;
      }
      const dz = Math.abs(p.position.z);
      if (dz < .8 && Math.abs(p.position.x - laneX) < .8 && Math.abs(p.position.y - (toadY + .8)) < 1.1) {
        p.userData.live = false; p.visible = false;
        runPills++;
        score += 25;
        el.pills.textContent = runPills;
        questProgress('pills', 1);
        doBurst(p.position.x, p.position.y, p.position.z);
        Sound.pill();
      }
    }

    /* power-up cubes */
    for (const p of powerPool) {
      if (!p.userData.live) continue;
      p.position.z += speed * dt;
      p.rotation.y += dt * 2.4;
      p.rotation.x += dt * 1.1;
      if (p.position.z > KILL_Z) { p.userData.live = false; p.visible = false; continue; }
      if (Math.abs(p.position.z) < .8 && Math.abs(p.position.x - laneX) < .9 && toadY < 1.6) {
        p.userData.live = false; p.visible = false;
        activatePower(p.userData.kind);
        doBurst(p.position.x, 1, p.position.z);
      }
    }

    /* HUD */
    el.score.textContent = Math.round(score);
    el.dist.textContent = Math.round(dist) + 'm';

    /* animation state — the toad is a hopper now: rising shows the
       jump frame, falling shows the fall frame, every single hop */
    animT += dt * (.8 + speed / SPEED_BASE * .55);
    let frame;
    if (rolling > 0) frame = 'roll';
    else if (!grounded) frame = vy > (bigAir ? .5 : 0) ? 'jump' : 'fall';
    else frame = 'fall';   // coiled on the stone, braced for the next spring
    setToadFrame(frame);
  }

  if (state === STATE.DYING) {
    dieT += dt;
    vy += GRAVITY * .6 * dt;
    toadY = Math.max(0, toadY + vy * dt);
    toad.rotation.z += dt * 7;
    /* the copy finally catches up */
    frog.position.z += (0.6 - frog.position.z) * dt * 5;
    frog.position.x += (laneX - frog.position.x) * dt * 8;
    if (dieT > .95) gameOver();
  }

  /* ── toad transform ── */
  let bob = 0;
  if (state === STATE.MENU || state === STATE.OVER) bob = Math.sin(performance.now() * .002) * .05;
  /* no stride bounce any more — the hops ARE the bounce */
  toad.position.x = laneX;
  toad.position.y = toadY + bob;
  /* the body is one underdamped spring. Targets: coiled while on the
     ground, velocity-stretched in flight, neutral otherwise. Launch
     and landing add impulses, and the underdamping settles everything
     with a small organic wobble instead of a dead exponential */
  let scaleTarget = 1;
  if (state === STATE.PLAY && rolling <= 0) {
    if (!grounded) scaleTarget = Math.min(1.26, 1 + Math.abs(vy) * .022);
    else if (hopPhase > 0) scaleTarget = .8;
  }
  squashV += (scaleTarget - squash) * 240 * dt;
  squashV *= Math.exp(-16 * dt);
  squash += squashV * dt;
  const sy = rolling > 0 ? .58 : squash;
  /* width preserves volume — splats go wide, stretches go thin */
  const sx = rolling > 0 ? 1.18 : 1 / Math.sqrt(Math.min(1.35, Math.max(.55, squash)));
  toadSprite.scale.set(sx, sy, 1);
  toadSprite.position.y = TOAD_H / 2 * sy;
  if (state === STATE.PLAY) {
    /* lean into lane changes only — rolling the sprite with vy made
       every jump look like a sideways stumble */
    toad.rotation.z = (laneX - LANE_X[targetLane]) * .12;
  }
  /* pitch eases in and out — tips back climbing, noses over falling */
  const pitchTarget = (state === STATE.PLAY && !grounded && rolling <= 0) ? vy * .011 : 0;
  toadSprite.rotation.x += (pitchTarget - toadSprite.rotation.x) * Math.min(1, dt * 12);
  toadShadow.material.opacity = Math.max(.15, .8 - toadY * .28);
  toadShadow.scale.setScalar(Math.max(.5, 1 - toadY * .16));
  if (power === 'star') {
    invulnBlink += dt;
    toadSprite.material.opacity = .7 + Math.sin(invulnBlink * 18) * .3;
  } else if (toadSprite.material.opacity !== 1) toadSprite.material.opacity = 1;

  /* ── the chaser — half a step behind the toad's cadence ── */
  if (state === STATE.PLAY) {
    frog.position.x += (laneX - frog.position.x) * dt * 3.2;
    const chase = 3.35 + Math.sin(performance.now() * .0011) * .3;
    frog.position.z += (chase - frog.position.z) * dt * 2;
    /* he hops too — same cadence, half a beat behind, higher arc */
    frog.position.y = Math.abs(Math.sin(animT * 9 * Math.PI / 2 + 1.1)) * .3;
    frog.rotation.z = Math.sin(animT * 9 * Math.PI / 2 + 1.1) * .045;
    const ci = CHASER_CYCLE[(animT * 9 | 0) % 4];
    if (ci !== frogFrame) { frogFrame = ci; setFrogFrame(ci); }
  } else if (idle) {
    frog.position.y = Math.abs(Math.sin(performance.now() * .004)) * .1;
  }

  /* ── burst particles ── */
  if (burstT < 1) {
    burstT += dt * 2.4;
    const a = burst.geometry.attributes.position.array;
    for (let i = 0; i < 12; i++) {
      a[i * 3] += burstVel[i].x * dt;
      a[i * 3 + 1] += burstVel[i].y * dt;
      a[i * 3 + 2] += burstVel[i].z * dt;
      burstVel[i].y -= 9 * dt;
    }
    burst.geometry.attributes.position.needsUpdate = true;
    burst.material.opacity = Math.max(0, .9 - burstT);
  }

  /* ── landing ripples — expand, fade, and drift back with the water ── */
  for (const r of ripplePool) {
    if (r.userData.t >= 1) continue;
    r.position.z += worldSpeed * dt;
    r.userData.t += dt * (r.userData.big ? 1.6 : 2.4);
    const t = Math.min(1, r.userData.t);
    const s = (r.userData.big ? .9 : .5) + t * (r.userData.big ? 2.6 : 1.4);
    r.scale.setScalar(s);
    r.material.opacity = (1 - t) * (r.userData.big ? .55 : .4);
    if (t >= 1) r.visible = false;
  }

  /* ── camera ── */
  let shakeX = 0, shakeY = 0;
  if (shakeT > 0) {
    shakeT -= dt;
    if (!REDUCED) {
      shakeX = (Math.random() - .5) * shakeT * .8;
      shakeY = (Math.random() - .5) * shakeT * .6;
    }
  }
  camera.position.x = CAM_POS.x + laneX * .32 + shakeX;
  camera.position.y = CAM_POS.y + toadY * .12 + shakeY;
  camera.lookAt(CAM_LOOK.x + laneX * .5, CAM_LOOK.y, CAM_LOOK.z);
}

function die() {
  if (state !== STATE.PLAY) return;
  state = STATE.DYING;
  dieT = 0;
  vy = 5.5;
  shakeT = .6;
  setToadFrame('hit');
  Sound.hit();
}

/* ─────────────────────────────────────────────────────────────
   LOOP — fixed timestep with an accumulator
   ───────────────────────────────────────────────────────────── */
let last = 0, acc = 0;
function frame(now) {
  requestAnimationFrame(frame);
  if (state === STATE.LOAD) return;
  let dt = (now - last) / 1000;
  last = now;
  if (dt > MAX_FRAME) dt = MAX_FRAME;   // background tab must not teleport the toad
  if (state === STATE.PAUSE) { renderer.render(scene, camera); return; }
  acc += dt;
  let guard = 0;
  while (acc >= STEP && guard < 8) { tick(STEP); acc -= STEP; guard++; }
  if (guard >= 8) acc = 0;
  renderer.render(scene, camera);
}

/* ─────────────────────────────────────────────────────────────
   BOOT — load the nine character frames, then open the menu
   ───────────────────────────────────────────────────────────── */
/* Decode to a plain canvas, not an ImageBitmap: WebGL ignores the flip-Y
   unpack flag for ImageBitmap uploads, which stands every sprite on its head. */
async function loadBitmap(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(url);
  const bmp = await createImageBitmap(await r.blob());
  const c = document.createElement('canvas');
  c.width = bmp.width; c.height = bmp.height;
  c.getContext('2d').drawImage(bmp, 0, 0);
  bmp.close();
  return c;
}

(async () => {
  const t0 = performance.now();
  try {
    el.loadHint.textContent = 'Waking the toad…';
    const jobs = FRAMES.map(async f => { baseBitmaps[f] = await loadBitmap('assets/char/toad_' + f + '.webp'); });
    jobs.push(...CHASER_FRAMES.map(async f => {
      const bmp = await loadBitmap('assets/char/' + f + '.webp');
      const t = new THREE.CanvasTexture(bmp);
      t.colorSpace = THREE.SRGBColorSpace;
      frogTex[f] = t;
    }));
    await Promise.all(jobs);
  } catch (e) {
    el.loadHint.textContent = 'Could not load sprites — check the connection and reload.';
    return;
  }
  applySkin(ownedSkins.includes(skin) ? skin : 'classic');
  buildCharacters();
  applySkin(skin);   // now that the landmark exists too

  el.loadHint.textContent = 'Tuning Canal 88…';
  /* let the splash breathe like a real boot screen */
  const minSplash = 1400;
  const wait = Math.max(0, minSplash - (performance.now() - t0));
  setTimeout(() => {
    showMenu();
    last = performance.now();
  }, wait);
})();
requestAnimationFrame(frame);

/* ─────────────────────────────────────────────────────────────
   DEBUG — read-only window into the sim, behind ?debug=1
   ───────────────────────────────────────────────────────────── */
if (/[?&]debug=1/.test(location.search)) {
  window.RunDebug = {
    get state() { return state; },
    get dist() { return dist; },
    get score() { return score; },
    get speed() { return speed; },
    get lane() { return lane; },
    get toad() { return { x: laneX, y: toadY, vy, grounded, rolling }; },
    get obstacles() {
      return obstaclePool.filter(o => o.userData.live)
        .map(o => ({ kind: o.userData.kind, lane: o.userData.lane, z: +o.position.z.toFixed(1) }))
        .sort((a, b) => b.z - a.z);
    },
    get pills() { return pillPool.filter(p => p.userData.live).length; },
    hop: doJump, roll: doRoll, left: () => goLane(-1), right: () => goLane(1),
    start: startRun,
    STATE,
  };
}

console.log('%c🐸 TOAD RUN ', 'background:#a8ff1a;color:#030603;font:700 14px monospace;padding:6px 12px');
console.log('%cThe first Pepe outruns the copy. Since 1988.', 'color:#74c13b;font:12px monospace');
