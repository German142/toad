#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════
   genimage — asset generation for TOAD RUN
   Reads OPENAI_API_KEY from .env (never committed, never shipped).
   Calls gpt-image-1 and writes finished PNGs into the repo.

   Usage:
     node _tools/genimage.mjs --out path.png --prompt "..." \
       [--ref img1 --ref img2]        edits endpoint, with references
       [--size 1024x1024|1536x1024|1024x1536]
       [--quality low|medium|high]    default high
       [--transparent]                transparent background
   ══════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* ── parse .env by hand: no dependencies ── */
const env = Object.fromEntries(
  readFileSync(resolve(ROOT, '.env'), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);
const KEY = env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing from .env'); process.exit(1); }

/* ── args ── */
const args = process.argv.slice(2);
const get = (flag, def) => {
  const i = args.indexOf(flag);
  return i === -1 ? def : args[i + 1];
};
const refs = [];
for (let i = 0; i < args.length; i++) if (args[i] === '--ref') refs.push(args[i + 1]);

const out = get('--out');
const prompt = get('--prompt');
const size = get('--size', '1024x1024');
const quality = get('--quality', 'high');
const transparent = args.includes('--transparent');
if (!out || !prompt) { console.error('need --out and --prompt'); process.exit(1); }

const body = { model: 'gpt-image-1', prompt, size, quality, n: 1 };
if (transparent) body.background = 'transparent';

let res;
if (refs.length) {
  /* edits endpoint: multipart with reference image(s) */
  const form = new FormData();
  form.append('model', 'gpt-image-1');
  form.append('prompt', prompt);
  form.append('size', size);
  form.append('quality', quality);
  if (transparent) form.append('background', 'transparent');
  for (const r of refs) {
    const p = resolve(ROOT, r);
    const mime = p.endsWith('.png') ? 'image/png' : p.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
    form.append('image[]', new Blob([readFileSync(p)], { type: mime }), basename(p));
  }
  res = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}` },
    body: form,
  });
} else {
  res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const json = await res.json();
if (!res.ok) {
  console.error('API error', res.status, JSON.stringify(json.error || json, null, 2));
  process.exit(1);
}
const b64 = json.data?.[0]?.b64_json;
if (!b64) { console.error('no image in response', JSON.stringify(json).slice(0, 400)); process.exit(1); }

const outPath = resolve(ROOT, out);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, Buffer.from(b64, 'base64'));
console.log(`wrote ${out} (${Math.round(Buffer.from(b64, 'base64').length / 1024)} KB)` +
  (json.usage ? ` — tokens: ${JSON.stringify(json.usage)}` : ''));
