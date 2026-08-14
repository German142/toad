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
assets/video/         6 tapes; the player streams them on demand
assets/posters/       a still frame per tape
assets/memes/         20 memes, web-optimised · thumb/ holds the small copies
assets/brand/         logo, favicons, cursors, link-preview cover
vercel.json           caching + security headers
```

## The applications

| App | What it is | Holds |
|---|---|---|
| **Toad Explorer** | Internet Explorer 6 | The origin story, the facts table, every outbound link |
| **Canal 88 Player** | Windows Media Player | 6 tapes with a playlist, seek bar and channel switching |
| **Evidence** | Explorer folder | 20 memes as files; double-click opens **Toad Viewer** |
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
  x:         'https://x.com/eltoadpepe',
  community: 'https://x.com/i/communities/2030839209980989725',
};
```

pump.fun, Dexscreener and Solscan URLs are derived from `ca` automatically. Leave `ca` empty
and the desktop switches to a "not announced yet" state.

> **⚠ Verify the contract address before every deploy.** It is displayed and copied to
> visitors' clipboards — a wrong value here costs people real money.

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
- **Type `TOAD`** anywhere.
- On phones every window opens full-bleed and the taskbar collapses to icons; the desktop
  metaphor still holds but nothing needs dragging.

## The link preview

`assets/brand/og-cover.jpg` (1200×630) is the card X, Telegram and Discord show.

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

## Disclaimer

$TOAD is a meme with no intrinsic value and no promise of returns — a lily pad, not a lifeboat.
Nothing on this site is financial advice.
