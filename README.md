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
js/main.js            all behaviour — CONFIG, CHANNELS and MEMES live at the top
assets/video/         5 tapes; intro.mp4 also runs behind the hero
assets/posters/       still frame for each tape, used as the video poster
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

The source of truth is `assets/brand/logo2.jpg`. `logo.png`, `icon-32.png`, `icon-180.png`
and `icon-512.png` are square exports of it. Replace those four and the nav, footer, boot
screen and browser tab all follow — no code changes needed.

### Adding memes

1. Put a web-sized JPG in `assets/memes/` and a smaller copy in `assets/memes/thumb/`.
2. Add one line to the `MEMES` array in `js/main.js`:

```js
{ f: 'filename-without-extension', cap: 'CAPTION IN CAPS', tall: true },
```

`tall: true` switches that tile to a 3:4 portrait crop. Everything else — the strips,
the lightbox, the counter, the shuffle — updates itself.

### Adding a channel

Drop an `.mp4` in `assets/video/` and a still frame in `assets/posters/`, then add a line
to the `CHANNELS` array in `js/main.js`:

```js
{ ch: '93', name: 'CHANNEL NAME', tag: 'SUBTITLE', file: 'clip.mp4', poster: 'poster-clip.jpg' },
```

The dial, the on-screen display and the auto-advance all read from that array. Videos use
`preload="none"` and only load when their channel is selected, so extra tapes cost nothing
until someone asks for them.

## Features

- **CRT boot sequence** — animated static, colour bars, channel tuning, power-off collapse
- **Video hero** — `intro.mp4` full-bleed behind the wordmark, with scanlines, chromatic
  drift, live timecode and a REC indicator
- **The tapes** — a CSS-built television set with working volume and fullscreen knobs.
  Five channels on a dial below it; switching one runs a real static burst before the
  picture locks, and a finished tape rolls straight into the next channel. The hero
  video pauses automatically so only one soundtrack plays at a time
- **Lore rail** — a horizontal timeline you can drag, swipe, arrow through, or scroll with
  the mouse wheel while hovering; a VHS-style scrubber underneath tracks the position and
  hands the wheel back to the page once you reach either end
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
