# ToadOS — Original Edition

The site for **El Toad Pepe** ($TOAD) — the first Pepe, on air since 1988, now on Solana.

It is not a scrolling page. It is a Windows XP desktop: BIOS POST → boot splash → welcome
screen → a desktop with icons, draggable windows, a taskbar and a start menu. Every piece of
content is an application.

Zero build step. Zero dependencies. Static HTML, CSS and vanilla JS, deployed straight to Vercel.

---

## What's in here

```
index.html            markup + every app's content, as <template> blocks
css/xp.css            the Luna design system — window chrome, taskbar, start menu, apps
js/main.js            boot sequence, window manager, app logic. CONFIG lives at the top
toadrun/              TOAD RUN, the full-screen 3D endless runner (see below)
assets/video/         14 tapes; the player streams them on demand
assets/posters/       a still frame per tape
assets/memes/         36 memes, web-optimised · thumb/ holds the small copies
assets/brand/         logo, favicons, cursors, link-preview cover
_tools/               local asset pipeline (image generation) — needs .env, never deployed
vercel.json           caching + security headers
```

## The applications

| App | What it is | Holds |
|---|---|---|
| **Toad Explorer** | Internet Explorer 6 | The origin story, the facts table, every outbound link |
| **Canal 88 Player** | Windows Media Player | 14 tapes with a playlist, seek bar and channel switching |
| **Toad Run** | Full-screen 3D game | A 3-lane endless runner; launches over the whole desktop |
| **Live Chart** | Embedded browser | Dexscreener's own embed, framed in a window instead of a new tab |
| **Evidence** | Explorer folder | 36 memes as files; double-click opens **Toad Viewer** |
| **Tokenomics.xls** | Spreadsheet | Supply, tax, revoked authorities |
| **HowToBuy.txt** | Notepad | Three steps, the contract, a copy button |
| **Lore.hlp** | Windows Help | The 1988 → 2026 timeline |
| **Contract** | Dialog | The address, a copy button, a link to Solscan |
| **ReadMe.txt** | Notepad | Disclaimer, safety notes, credits |
| **Recycle Bin** | Folder | Three deleted files. One of them is the other frog |

Each opens from a desktop icon (double-click), the start menu, or a link inside another app.
Windows drag by the title bar, resize from the corner, minimise to the taskbar, and maximise
on double-click.

## Configuration

Everything token-specific lives in one object at the top of [`js/main.js`](js/main.js):

```js
const CONFIG = {
  ca:        'A13oRB9FFaiUjfi6LdCg6p9ka1u8SfGkUFs4SKvPpump',
  x:         'https://x.com/thetoadmeme_',
  community: 'https://x.com/i/communities/1991148242780967304',
};
```

pump.fun, Dexscreener and Solscan URLs are derived from `ca` automatically. Leave `ca` empty
and the desktop switches to a "not announced yet" state.

> **⚠ Verify the contract address before every deploy.** It is displayed and copied to
> visitors' clipboards — a wrong value here costs people real money.
>
> The address above is confirmed current: the socials moved from `@eltoadpepe` to
> `@thetoadmeme_`, but the token did not change. Re-check it against the official X account
> and Solscan anyway whenever anything else about the project moves.

### Adding a channel

Drop an `.mp4` in `assets/video/` and a still in `assets/posters/`, then add a line to
`CHANNELS`:

```js
{ ch:'94', name:'CHANNEL NAME', tag:'Subtitle', file:'clip', poster:'poster-clip.jpg' },
```

The playlist, the on-screen display and the auto-advance all read from that array.

### Adding a meme

Put a web-sized JPG in `assets/memes/` and a small copy in `assets/memes/thumb/`, then add a
line to `MEMES`. The folder, the viewer and the shuffle update themselves.

### Adding an app

Add a `<template id="app-yourapp">` to `index.html`, then register it:

```js
yourapp: { title:'Yourapp.exe', icon:'🧩', tpl:'app-yourapp', w:520, h:400, status:'', mount: fn },
```

Add it to `DESKTOP_ICONS` for a desktop icon, and to `buildStartMenu()` for a menu entry.
`mount` is optional and receives the window element.

### Swapping the logo

`assets/brand/logo2.jpg` is the source of truth. `logo.png` and `icon-32/180/512.png` are
square exports of it. Replace those and the login screen, taskbar, windows, browser tab and
every app icon follow — the icons pull the head straight out of `logo.png`.

### Swapping the wallpaper

`assets/brand/backround.png` is the original; `wallpaper.jpg` is the 1920px export the page
actually loads (198 KB instead of 1.2 MB). Replace both, keeping the names.

## Details worth knowing

- **The boot sequence** is skippable — any key or click advances the POST screen, and it
  auto-advances after five seconds so nobody gets stuck.
- **The static burst is the loading state.** When you switch channels the noise holds until
  the tape can actually play through, rather than handing over to an empty buffer. A set
  tuning itself in is what the app is pretending to be anyway.
- **The cursor is the old Windows arrow**, drawn as an inline SVG rather than borrowed from
  the visitor's OS, so everyone gets the same pointer. The rules live at the *end* of
  `xp.css` on purpose — plenty of components set `cursor:pointer` and these have to win.
  (A toad-head cursor is still in `assets/brand/cursor-toad*.png` if you ever want it back.)
- **The icons are drawn, not emoji.** `index.html` opens with an SVG sprite where each app
  icon is built from shapes plus the character's head pulled out of the logo with a circular
  clip. Emoji would have rendered differently on every platform, and half of them monochrome.
- **Sound is synthesised** with the Web Audio API — the startup chime, the croak, the clicks.
  No audio files ship. Mute from the tray.
- **The live chart stays on the site.** Every Dexscreener entry point opens the **Live Chart**
  app, which frames Dexscreener's own `?embed=1` view rather than throwing the visitor into a
  new tab. If they ever refuse to be framed, the panel underneath says so and points at an
  "Open in browser" button, so the link never silently dies.
- **Type `TOAD`** anywhere.
- On phones every window opens full-bleed and the taskbar collapses to icons; the desktop
  metaphor still holds but nothing needs dragging.

## Toad Run

A full-screen 3D endless runner in [`toadrun/`](toadrun/) — Three.js (vendored into
`toadrun/lib/`, no CDN, per the CSP), one `game.js`, and HTML overlays styled as Windows XP
dialogs. It replaces the old Hoppy Toad window: double-clicking the desktop icon does **not**
open a window — the desktop hands the whole screen over (black launch frame → browser
fullscreen → the game's own XP-style boot screen), the way a PC game took over the machine.
The game quits itself back to the desktop with a `postMessage` (`toadrun:quit`); served
standalone at `/toadrun/` the quit button navigates to `/` instead.

The design is a Subway-Surfers-style 3-lane runner: swipe/arrows to change lane, jump, roll.
The toad is not a 3D model — it is a **billboarded sprite**, nine plush-render frames
generated with gpt-image-1 from `assets/brand/logo2.jpg` (the originals live in
`_source/toadrun_char/`, the game ships 512×768 WebP). The 2005 internet frog runs in the
foreground, forever chasing the original; when you crash, he finally catches up. That's the
whole lore, on screen at all times.

The world is the wallpaper's pond country — pastel low-poly hills, reeds, mushrooms, lily
ponds — with pump.fun engraved into it: pill collectibles, green-candle obstacles (a green
candle only goes up; you change lanes), a striped pump.fun arch, "FUD" banners you roll
under, and roadside billboards textured with the site's own memes from `assets/memes/`.
Every decal that isn't a meme is drawn on a canvas at boot — no texture downloads.

Mechanics carried over from the old game because they were right: fixed 1/60 s timestep with
an accumulator, clamped frame deltas so a backgrounded tab can't teleport the toad, pooled
obstacles/pills (nothing allocates during play), hard patterns get their extra run-up **in
front** of them, and localStorage behind try/catch. Pills are a persistent currency: the
shop sells power-up levels (magnet / ×2 / invincibility) and skins — skins recolor only the
green-dominant pixels of the sprite, so the red shirt and yellow overalls survive. Three
daily quests pay out pills. A "Holder Perks" slot in the shop is reserved for future wallet
verification.

`?debug=1` exposes a read-only `window.RunDebug` for automated play-testing.

### Regenerating the art

`_tools/genimage.mjs` calls gpt-image-1 with `OPENAI_API_KEY` from `.env` (gitignored — the
key never ships; `_tools/` is local pipeline only). Character frames were generated with the
logo as identity reference plus the first accepted frame as style reference, then exported to
WebP via sharp. See the git history of this section for the exact prompts.

## The link preview

`assets/brand/og-cover.jpg` (1200×630) is the card X, Telegram and Discord show. It's the
desktop composed as a still: the wallpaper, a Toad Explorer window, the wordmark and the
taskbar with its green start button — so the preview looks like the thing it links to.

Those tags use **absolute** URLs, and the domain has to be one that actually serves the file —
scrapers fetch it over the network, and a domain that 404s gives a card with a title and no
picture. They point at `https://toad-new-web.vercel.app`. **If the site moves, replace that
host in the tags at the top of `index.html`.**

Both X and Telegram cache previews hard. Force a re-scrape:

- **X** — Card Validator at `cards-dev.twitter.com/validator`
- **Telegram** — message `@WebpageBot` with the link
- **Discord** — append a throwaway query string (`?v=2`)

## The video files are still too big

Several clips run at **28–36 Mbps** — an eight-second clip weighing 36 MB. The player only
fetches a tape when you select it, and holds static until it can play through, so this never
shows as stutter. But it is a lot of bandwidth. Re-encode them:

```bash
ffmpeg -i in.mp4 -c:v libx264 -crf 26 -preset slow -vf scale=1280:-2 -c:a aac -b:a 96k -movflags +faststart out.mp4
```

`-movflags +faststart` matters as much as the bitrate — it moves the index to the front so
playback can begin before the download finishes. Overwrite the files keeping the same names;
no code changes needed.

> Transcoding in-browser via canvas + `MediaRecorder` was tried and rejected: small enough to
> help meant the picture visibly blocked up, and MediaRecorder writes no duration into the
> WebM header, which breaks seeking and looping. Use a real encoder.

## Running it locally

No build, no install. Any static server works:

```bash
npx serve .
```

## Deploying

Vercel picks this up as a static site with no configuration. Framework preset **Other**, leave
build command and output directory empty.

### Security headers

`vercel.json` sets a CSP plus the usual companions. The parts that matter here:

- **`frame-ancestors 'self'` and `X-Frame-Options: SAMEORIGIN`** — the site cannot be framed
  by anyone else. On a page whose job is handing out a contract address, clickjacking is the
  realistic attack: iframe the real site, overlay a fake address, let the victim copy it.
  `'self'` rather than `'none'` because the desktop frames its own `/toadrun/`.
- **`frame-src` allowlists only Dexscreener**, so no other embed can be introduced.
- **`connect-src 'self'`** — nothing here talks to a third-party API, and now nothing can.
- **`object-src 'none'`, `base-uri 'self'`, `form-action 'none'`** — no plugins, no base
  hijacking, no form posting anywhere.

`script-src` keeps `'unsafe-inline'` deliberately. The base-URL guard in
`toadrun/index.html` has to be inline — it runs before the stylesheet, and an external file
could not be fetched when the base is exactly what is broken. A hash would work but silently
breaks the guard whenever line endings change on checkout, and this site has no user input,
no query parameters read into the DOM and no dynamic data, so there is no injection path for
`'unsafe-inline'` to widen.

The Dexscreener frame is sandboxed and, deliberately, **not** granted `clipboard-write`. A
third-party frame that can rewrite the clipboard on a page built around copying a contract
address is exactly the wrong permission to hand out.

Two things about `vercel.json` worth knowing before editing it:

- **It is validated against a schema, and unknown top-level keys fail the build.** JSON has no
  comments, and a `"//"` key is not a valid escape hatch — it will be rejected outright.
  Explanations go here in the README instead.
- **Do not add `cleanUrls` or `trailingSlash`.** Together they redirect `/toadrun/` down to
  `/toadrun`, and at that URL every relative path inside the game resolves against the site
  root: `style.css` becomes `/style.css` and 404s. The game now defends itself against this
  with a base-URL guard in its `<head>`, but there is no reason to reintroduce the problem —
  nothing here wants pretty URLs.

## Disclaimer

$TOAD is a meme with no intrinsic value and no promise of returns — a lily pad, not a lifeboat.
Nothing on this site is financial advice.
