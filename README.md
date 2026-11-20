# opcant — OpenCode Annotate (custom)

Point at a UI element in Chrome, write an instruction, and your OpenCode agent
receives a cropped screenshot plus the element's selector and metadata.

This repo is a GPL-3.0 fork of
[eagleeyejack/opencode-chrome-annotation-extension](https://github.com/eagleeyejack/opencode-chrome-annotation-extension).
OpenCode / AshleyCode only — Claude Code support is removed.

## What is in here

| Path | What |
|---|---|
| `manifest.json`, `background.js`, `sidepanel.*`, `injected/`, `icons/` | Chrome MV3 extension (side panel) |
| `plugin/` | Forked `opencode-annotate` plugin: local HTTP server + `/activity` endpoint |
| `CUSTOM.md` | Every change against upstream, with the reasoning |
| `scripts/verify-send-loss-proof.mjs` | Queue/send regression proofs, 9 cases |

## Features beyond upstream

- **Agent status in the panel** — `Queued` / `Working · 4s` / `Finished` / `Failed` /
  `Cancelled`, driven by OpenCode `session.execution.*` events.
- **Toolbar badge and completion notification** — `●` working, `✓` done, `!`
  failed, per annotated tab.
- **Reload pill** — appears when the agent finishes, reloads the tab on click.
- **Black theme** — follows `prefers-color-scheme`.
- **Keyboard shortcuts** — `Alt+Shift+A` opens the panel, `Alt+Shift+S` opens it
  and starts element selection.
- **Shadows instead of borders** — all edges are `box-shadow` rings.

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
pin "OpenCode Annotate (custom)"
```

### 3. Use

```
open project in OpenCode
open page in Chrome
Alt+Shift+A        panel
pick chat          link tab
Select element     click element
write instruction
Add & finish       Send
```

Done = chip `Finished` + `Reload page` button. Tab badge flips `●` to `✓`.

First send asks site access. Allow it. Screenshot needs `<all_urls>`; `activeTab` drops on navigation.

### 4. Theme

Header icon cycles `Auto -> Light -> Dark`. Saves in `chrome.storage.local`.

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

Diff against this repo, keep the fork changes described in `CUSTOM.md`, then bump
`version_name` in `manifest.json`.

## Licence

GPL-3.0. Original work © the upstream authors; see `LICENSE` and `CUSTOM.md` for
the fork's changes.
