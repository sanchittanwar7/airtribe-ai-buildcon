# Workshop slides — Evals for AI Agents

Self-contained HTML slide deck. No build step. No CDN. No internet required at the conference.

## Files

```
slides/
├── index.html         — audience view (the deck)
├── presenter.html     — speaker view (notes + next-slide preview + timer)
├── styles.css         — shared theme
├── slides.js          — navigation + cross-window sync
├── photo.jpg          — your headshot (intro + closing slide)
├── linkedin-qr.png    — LinkedIn QR code (closing slide)
└── README.md
```

## Run it

```bash
# From this directory (REQUIRED for cross-window sync to work reliably):
python3 -m http.server 8000
# Then visit http://localhost:8000/
```

**Don't double-click the HTML files.** Chrome treats each `file://` URL as a separate origin, which silently breaks `BroadcastChannel` sync between the audience window and presenter window. Always serve via `http://localhost`.

---

## Presenter mode (use this on stage — IMPORTANT)

**Never press "show notes" while screen-sharing** — that's how speakers leak their notes to the audience. This deck doesn't have an in-window notes overlay at all. Instead, notes live in a separate window:

### Recommended workflow

1. Open the deck: `http://localhost:8000/`
2. Press **`P`** — a presenter window pops up (1200×780). It shows:
   - Current slide preview (left)
   - Next slide preview (top right)
   - Speaker notes for the current slide (bottom right)
   - Elapsed-time timer (top, turns orange at 50 min, red at 60 min)
   - Prev / Next buttons + "Up next: [title]"
3. **Drag the presenter window to your laptop screen.** Move the audience deck to the projector (or your screen-share window).
4. Go fullscreen on the audience window: press **`F`** in that window.
5. In your video-call / screen-share software, share **only the audience window** — pick "Application Window" or "Window" mode, never "Entire Screen". Pick the audience deck.
6. Drive the deck from either window. The two stay synced via `BroadcastChannel`. Pressing `→` in either advances both.

### Verify before going live

- Open both windows. Press `→` in the audience window. The presenter window should advance too.
- Open `chrome://settings/content/popups` (or your browser's equivalent) and allow popups for the slides URL — otherwise pressing `P` is silently blocked.
- Test the screen-share before the real session: share the audience window, glance at the projector, confirm your notes are *not* visible.

---

## Keyboard shortcuts

### Audience window (`index.html`)

| Key | Action |
|---|---|
| `→` `Space` `PgDn` | Next slide |
| `←` `PgUp` | Previous slide |
| `Home` `End` | First / last slide |
| **`P`** | **Open presenter window** |
| `N` | Same as P (muscle-memory alias) |
| `F` | Fullscreen |
| `23` then `Enter` | Jump to slide 23 |
| `?` | Show keyboard shortcuts |
| `Esc` | Close help overlay / exit fullscreen |
| Swipe (touch) | Next / previous |

### Presenter window (`presenter.html`)

| Key | Action |
|---|---|
| `→` `Space` `PgDn` | Next slide (advances both windows) |
| `←` `PgUp` | Previous slide |
| `Home` `End` | First / last slide |
| `T` | Reset timer |
| Click `pause` | Pause/resume timer |
| Click `reset` | Reset timer |

URL hash always reflects the current slide (`#23`), so you can deep-link from a script doc straight to a slide.

---

## Editing slides

Each slide is a `<section class="slide">` block in `index.html`. Add / remove / reorder them — `slides.js` picks them up automatically; nothing else to update.

**Speaker notes** go inline inside each slide:

```html
<section class="slide" data-section="...">
  <div class="slide-inner">
    ...visible content...
  </div>
  <div class="speaker-note">
    <h4>What to do here</h4>
    <p>Your notes for this slide.</p>
  </div>
</section>
```

CSS hides `.speaker-note` from the audience-facing slide. The presenter window reads them from the iframe and shows them in its notes panel.

### Useful slide classes

- `thesis` — big quote / one-line statement (centered, large text)
- `title-slide` — hero / closing style
- `divider` — section divider (available but not currently used in the deck)

### Progress reel stops

The left-side navigation reel auto-detects slide 1, the `data-section="Intro"` slide, and the last slide. To make any other slide a reel stop, add `data-reel-stop="Label"`:

```html
<section class="slide" data-section="..." data-reel-stop="My stop">
```

### Useful inline classes

- `.accent` `.good` `.bad` `.warn` `.muted` — color emphasis
- `.code .terminal` — code block styled as terminal output
- `.demo-callout` `.audience-callout` — pill label above a slide title
- `.pillar-grid` `.cols-2` `.hot-takes` `.stages` `.checklist` — pre-styled layouts

---

## Print to PDF (for backup)

`Cmd+P` from the audience window. The print stylesheet stacks every slide on its own page — clean PDF backup in case the laptop dies on stage.

Speaker notes are **not** included in the printed PDF (by design — same reason they're hidden in the audience window). If you want a paper copy of your notes, copy them out of the source.

---

## Customize before the talk

- `linkedin-qr.png` and `photo.jpg` are already in the directory and referenced by the closing and intro slides. Replace them at any time.
- The model-upgrade comparison table (slide 16) uses illustrative numbers — replace with your own real eval run if you have one. Much more compelling on stage.
- Optional: `index.html` `<title>` tag near the top of the file.

---

## How the cross-window sync works

`BroadcastChannel('deck-sync')` is a same-origin pubsub bus that any open tab/window on the same origin can post to and listen on. Both windows open the channel; whoever navigates posts a `goto`; everyone else updates.

| `type` | Direction | Effect |
|---|---|---|
| `goto` | both → both | Set current slide to `slide` (1-indexed) |
| `ping` | both → both | Heartbeat (every 2s). Used by the presenter's "linked / standalone" indicator. |
| `request-state` | presenter → audience | Audience replies with current state on first open |
| `state` | audience → presenter | Sync presenter to audience's current slide |

You can verify sync at a glance: the presenter header shows **● linked** (green) when it's receiving heartbeats from another window, **○ standalone** (gray) otherwise. If it stays standalone after both windows are open, you're hitting an origin mismatch (see Troubleshooting).

The presenter's two iframes load with `?passive=1` — that flag tells `slides.js` to skip the keyboard listener and skip channel broadcasting, so the iframes don't fight the parent window for control. The presenter drives them directly via `iframe.contentWindow.deckGo(N)`. The iframes also have `pointer-events: none` so clicking on them can't move keyboard focus into them — that was a real bug; it would silently break arrow-key navigation.

If `BroadcastChannel` isn't available (very old browsers), each window still works independently but won't sync. Any browser from the last 5 years supports it.

---

## Troubleshooting

**Arrow keys don't navigate in presenter.html.**
You probably clicked into one of the iframe previews and focus is now there. Click anywhere on the presenter window's header, footer, or notes panel — focus returns to the body and arrows work again. (The iframes have `pointer-events: none` so this shouldn't happen, but some browsers still allow Tab-focus into iframes.)

**Indicator stays "○ standalone" even with both windows open.**
Origin mismatch. You're almost certainly running over `file://`. Solution: `python3 -m http.server 8000` then open both windows from `http://localhost:8000/`. Same-origin requirement is strict.

**Pressing P doesn't open the presenter window.**
Browser popup blocker. Allow popups for this URL — Chrome will show a small icon in the address bar after the first P press; click it and choose "always allow popups for this site."

**Presenter is on slide N but audience is on slide M.**
They drifted because sync was broken (origin mismatch) or because one window was closed and reopened. Press a navigation key in either window and they'll re-sync on the next `goto`.

**Iframes in presenter look blurry/cropped.**
The iframes render the deck at 1600×1000 then scale down to fit. On a small presenter window the scale is large (looks fine); if the window is unusually narrow it can crop. Resize the presenter window — `fitAll()` re-scales on resize.
