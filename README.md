# opcant — Codex Annotate

Point at a UI element in Chrome, write an instruction, and your OpenCode agent
receives a cropped screenshot plus the element's selector and metadata.

This repo is a GPL-3.0 fork of
[eagleeyejack/opencode-chrome-annotation-extension](https://github.com/eagleeyejack/opencode-chrome-annotation-extension).
OpenCode / AshleyCode only — Claude Code support is removed.

## What is in here

| Path | What |
|---|---|
| `manifest.json`, `background.js`, `sidepanel.*`, `injected/` | Chrome MV3 extension (side panel) — bullseye icons in `icons/`, declared in the manifest |
| `plugin/` | Forked `opencode-annotate` plugin: local HTTP server + `/activity` endpoint |
| `scripts/verify-send-loss-proof.mjs` | Queue/send regression proofs, 9 cases |

## Features beyond upstream

- **Agent status in the panel** — `Queued` / `Working · 4s` / `Finished` / `Failed` /
  `Cancelled`, driven by OpenCode `session.execution.*` events.
- **Toolbar badge and completion notification** — `●` working, `✓` done, `!`
  failed, per annotated tab.
- **Reload pill** — appears when the agent finishes, reloads the tab on click.
- **Cropped preview** — the selected element's screenshot shows in the composer
  before you send, and again as a thumbnail on every queued item.
- **Editable queue** — click a queued comment, type, and it saves itself. Click
  the thumbnail for a full-size lightbox.
- **Plain actions** — `Add`, `Send`, back arrow. `Send` spans the composer in
  the accent-blue fill as the single primary action. No `Add & finish`, no
  `Send 3 to OpenCode`, no helper text, no logo.
- **Animal avatar per chat** — deterministic emoji from the session id, so a
  conversation keeps the same animal across reloads.
- **Running chats first** — the picker sorts active sessions above idle ones;
  rows are never grayed out, because the plugin's `running` flag can be stale.
- **Light and dark** — header toggle, remembered in `chrome.storage.local`.
- **Keyboard shortcuts** — `Alt+Shift+A` opens the panel, `Alt+Shift+S` opens it
  and starts element selection.
- **Shadows instead of borders** — all edges are `box-shadow` rings.
- **Astryx tokens** — the panel styles itself from Meta's Astryx neutral theme,
  vendored under `vendor/astryx/`.

## Install

Full detail: [docs/install-guide.md](docs/install-guide.md) — the same guide originally written to `~/Downloads/opencode-annotate-guide/`, now kept in the repo so cloners get it.

### 1. Plugin

Symlink repo plugin into OpenCode config dir. Absolute path in config fails silently.

```bash
ln -sfn "$PWD/plugin" ~/.config/opencode/plugins/opencode-annotate-repo
```

Add to `~/.config/opencode/opencode.jsonc`:

```jsonc
"plugins": [
  "./plugins/opencode-annotate-repo/v2/index.js"
]
```

Restart OpenCode. Check:

```bash
curl -s http://127.0.0.1:39240/status | grep -o '"activities"'
```

`"activities"` printed = fork plugin live. Empty = stock plugin loaded.

### 2. Extension

```
chrome://extensions
Developer mode ON
Load unpacked
pick this repo folder
pin "Codex Annotate"
```

### 3. Use

```
open project in OpenCode
open page in Chrome
Alt+Shift+A        panel
pick chat          link tab
Select element     click element
write instruction
Add                queue it
Send               deliver
```

Done = chip `Finished` + `Reload page` button. Tab badge flips `●` to `✓`.

Click a queued comment to edit it: typing saves after 700 ms, blurring saves at
once, `Esc` discards. Hover a row for copy and remove; the `…` menu holds
`Copy all` and `Clear queue` (drains the queue and refreshes the panel).

First send asks site access. Allow it. Screenshot needs `<all_urls>`; `activeTab` drops on navigation.

### 4. Theme

Header icon cycles `Light ⇄ Dark`. First run follows the OS preference, then the
choice is remembered in `chrome.storage.local`.

### 5. Shortcuts

```
Alt+Shift+A   open panel
Alt+Shift+S   open panel + start selection
```

Rebind: `chrome://extensions/shortcuts`.

## Development

```bash
node --check background.js sidepanel.js sidepanel-picker.js sidepanel-dev.js
node scripts/verify-send-loss-proof.mjs
```

After editing: reload the extension card in `chrome://extensions`, then reopen
the panel and reload the annotated tab.

### Preview the panel without Chrome extension context

`sidepanel.html` runs standalone with fake data:

```
http://127.0.0.1:4180/sidepanel.html?activity=done&activityAge=120
```

Serve the repo root with any static server. `sidepanel-dev.js` also exposes
`window.__panelActivity("working")` for live state switching.

## Upstream

```bash
git clone --depth 1 https://github.com/eagleeyejack/opencode-chrome-annotation-extension upstream
```

Diff against this repo, keep the fork changes described in this README's
"Features beyond upstream" section, then bump `version_name` in `manifest.json`.

## Licence

GPL-3.0. Original work © the upstream authors; see `LICENSE` and the "Features
beyond upstream" section for the fork's changes.
