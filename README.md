# $TOAD — Canal 88

The official site for **El Toad Pepe** ($TOAD) — the first Pepe, on air since 1988, now on Solana.

Zero build step. Zero dependencies. Static HTML, CSS and vanilla JS, deployed straight to Vercel.

---

## The concept

The lore is a 1988 Argentine children's television show, so the whole site is built as a
**retro broadcast**: Canal 88. A CRT boot sequence, VHS scanlines, timecode, tracking glitches,
a chunky television set you actually press play on, and an archive of memes running past on
tilted conveyor belts.

## What's in here

```
index.html            the whole page
css/style.css         all styling
js/main.js            all behaviour — CONFIG lives at the top
assets/video/         intro.mp4 (hero background + the tape)
assets/memes/         20 memes, web-optimised
assets/memes/thumb/   smaller versions used by the strips
assets/brand/         logo + favicons
vercel.json           caching + security headers
```

## Configuration

Everything token-specific lives in one object at the top of [`js/main.js`](js/main.js):

```js
const CONFIG = {
  ca:        'A13oRB9FFaiUjfi6LdCg6p9ka1u8SfGkUFs4SKvPpump',
  x:         'https://x.com/eltoadpepe',
  community: 'https://x.com/i/communities/2030839209980989725',
};
```

The pump.fun, Dexscreener and Solscan URLs are derived from `ca` automatically.
Leave `ca` as an empty string and the site gracefully switches to a "dropping soon" state.

> **⚠ Verify the contract address before every deploy.** It is shown on the page and
> copied to visitors' clipboards — a wrong value here costs people real money.

### Swapping the logo

`assets/brand/logo.png` (plus `icon-32`, `icon-180`, `icon-512`) is currently a crop taken
from the meme set. Drop the official logo PNG in at those four sizes to replace it —
no code changes needed.

### Adding memes

1. Put a web-sized JPG in `assets/memes/` and a smaller copy in `assets/memes/thumb/`.
2. Add one line to the `MEMES` array in `js/main.js`:

```js
{ f: 'filename-without-extension', cap: 'CAPTION IN CAPS', tall: true },
```

`tall: true` switches that tile to a 3:4 portrait crop. Everything else — the strips,
the lightbox, the counter, the shuffle — updates itself.

## Features

- **CRT boot sequence** — animated static, colour bars, channel tuning, power-off collapse
- **Video hero** — `intro.mp4` full-bleed behind the wordmark, with scanlines, chromatic
  drift, live timecode and a REC indicator
- **The tape** — a CSS-built television set with working volume and fullscreen knobs;
  the hero video pauses automatically so only one soundtrack plays at a time
- **Lore rail** — drag-to-scrub timeline with a progress line
- **Meme archive** — three tilted conveyor belts, hover-to-slow, click for a keyboard-navigable
  lightbox, plus a shuffle button
- **Synthesised croak** — button clicks make a frog noise built live with the Web Audio API,
  no audio files shipped
- **Easter egg** — type `TOAD` anywhere on the page
- Custom cursor with a fly that can't quite keep up, drifting spore particles, magnetic
  buttons, tilt cards, scroll reveals, animated counters, random VHS glitch bursts
- Fully responsive, and every animation respects `prefers-reduced-motion`

## Running it locally

No build, no install. Any static server works:

```bash
npx serve .
```

Then open <http://localhost:3000>.

## Deploying

Vercel picks this up as a static site with no configuration. Import the repo, framework
preset **Other**, leave build command and output directory empty.

## Disclaimer

$TOAD is a meme with no intrinsic value and no promise of returns — a lily pad, not a lifeboat.
Nothing on this site is financial advice.
