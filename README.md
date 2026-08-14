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
- **Toad-head cursor** — cut out of `logo2.jpg` with a cream halo so it stays readable on
  the dark background. It's a native CSS cursor, not a div chasing the pointer, so it never
  lags; it cocks its head over anything clickable
- A fly that can't quite keep up, drifting spore particles, magnetic buttons, tilt cards,
  scroll reveals, animated counters, random VHS glitch bursts

## Performance

The page has three effect tiers and picks one for you.

| tier | what runs | when |
|---|---|---|
| **0 — full** | everything | capable machine holding ~60 fps |
| **1 — lite** | no film grain, no blurs, no text glow, fewer spores at 1× | reduced-motion, Data Saver, slow connection, ≤4 cores, any touch device, **or a measured frame rate under 50** |
| **2 — minimal** | no spores, no scanlines, no chroma drift; hero parks on its poster frame | **measured frame rate under 34** |

Core count is a poor proxy for how a machine feels, so after the boot screen a watchdog
samples the real frame rate for a few seconds and steps down if the numbers are bad. Tiers
only ever go up, never back down, so it can't oscillate. Force one with `?fx=lite`,
`?fx=min` or `?fx=full` to see what a slower machine gets.

The expensive things it avoids, and why they were expensive:

- **`backdrop-filter` over the playing video.** The contract bar sat on top of the hero
  footage; blurring a *moving* backdrop re-runs the blur every frame. Solid panel now.
- **`ctx.shadowBlur` per particle.** Every spore asked for its own gaussian blur, dozens of
  them per frame. Each colour is now baked into a sprite once and stamped.
- **CSS `filter` on the hero video** — a full-screen GPU pass per frame. Baked into the
  gradient above it instead.
- **`mix-blend-mode` scanlines** over the video, forcing a full-screen composite per frame.
- **A 4900×3000 grain layer** sliding three times a second — the biggest repaint on the page.

Everything also stops when it isn't being looked at: the hero video pauses off-screen and on
tab blur, the marquees skip any belt outside the viewport, and the spore canvas halts when
the tab is hidden. Channel tapes are `preload="none"`, and the hero video isn't even fetched
until you're past the boot screen.

### Buffering

Locally the video files sit on disk and start instantly. Over a CDN they are a real download,
and calling `play()` on an empty buffer produces a slideshow — which is what "it stutters on
the deploy but not in preview" actually means. So:

- The hero starts downloading **during the boot screen**, which exists to cover exactly this.
- It refuses to start until `canplaythrough` fires. Until then the poster stands in — a still
  frame of the same footage, so nobody can tell. After 9 seconds it settles for a weaker bar.
- Three stalls mid-playback and it gives up and holds the poster. A still hero beats a
  stuttering one.
- On the television, the static burst **is** the loading state: the noise holds until the tape
  can play through. A set tuning itself in is what the section is pretending to be anyway.

### The files are still too big

This is the one thing the code can't fix. Several clips run at **28–36 Mbps** — an eight-second
clip weighing 36 MB. Re-encode them and everything above gets easier:

```bash
ffmpeg -i in.mp4 -c:v libx264 -crf 26 -preset slow -vf scale=1280:-2 -c:a aac -b:a 96k -movflags +faststart out.mp4
```

`-movflags +faststart` matters as much as the bitrate: it moves the index to the front of the
file so playback can begin before the download finishes.

Overwrite the files in `assets/video/` keeping the same names — no code changes needed. If you
also produce `.webm` versions, set `PREFER_WEBM = true` in `js/main.js` and browsers that read
VP9 will take those instead, with the mp4 as the fallback.

> Transcoding in-browser via canvas + `MediaRecorder` was tried and rejected: at a small enough
> bitrate the picture visibly blocks up, and MediaRecorder's WebM output carries no duration in
> its header, which breaks seeking and looping. Use a real encoder.

### Bandwidth

The video directory is ~186 MB. Every visitor pulls at least the 12.5 MB hero. Worth watching
against your Vercel plan's bandwidth allowance — another reason to re-encode.
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
