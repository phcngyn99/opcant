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

## Install the plugin

Copy or symlink `plugin/` somewhere stable, then add it to
`~/.config/opencode/opencode.jsonc`:

```jsonc
"plugins": [
  "/Users/<you>/Work/not-finn/opcant/plugin/v2/index.js"
]
```

Restart OpenCode. Verify:

```bash
curl -s http://127.0.0.1:39240/activity | head -c 200
```

`{"activities":[...]}` means the forked plugin is live. `Not found` means the
stock plugin came back — check the config path.

## Install the extension

1. `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → this repo root
4. Pin the icon

Version shows as `1.6.1-custom.1`.

## Use

1. Start OpenCode in the project you are editing.
2. Open the page in Chrome, press `Alt+Shift+A`.
3. Pick a chat to link the tab.
4. **Select element** → click the element → write the instruction.
5. **Add & finish** → **Send**.

When the run ends the panel shows `Finished` plus a **Reload page** button, and
the toolbar icon on that tab switches from `●` to `✓`.

Chrome asks for site access the first time. It uses `<all_urls>` because
`chrome.tabs.captureVisibleTab` accepts only that or `activeTab`, and
`activeTab` is dropped on navigation.

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
