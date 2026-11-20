# AGENTS.md — opcant

Chrome MV3 side panel + forked OpenCode plugin. Point at a page element, send a
cropped screenshot and a selector to a local OpenCode session.

Long-lived decisions live in [MEMORY.md](MEMORY.md). Read it before changing
architecture. Append to it; never rewrite history there.

## Layout

| Path | What |
|---|---|
| `manifest.json`, `background.js` | Service worker: discovery, claims, capture, queue, messages |
| `sidepanel.html` | Markup shell and all CSS (inline `<style>`) |
| `sidepanel.js` | Panel render and state |
| `sidepanel-picker.js` | Chat picker |
| `sidepanel-dev.js` | Fake data for the standalone preview |
| `injected/` | Element selection and crop helpers |
| `plugin/v2/index.js` | Forked plugin: HTTP server, `/activity`, `running` flag |
| `vendor/astryx/` | Astryx neutral theme, verbatim, MIT |
| `docs/install-guide.md` | Full install walkthrough |
| `CUSTOM.md` | Every change against upstream |

## Commands

```bash
node --check background.js sidepanel.js sidepanel-picker.js sidepanel-dev.js
node scripts/verify-send-loss-proof.mjs          # must stay 9/9
python3 -m http.server 4180                      # preview, from repo root
```

Preview: `http://127.0.0.1:4180/sidepanel.html?activity=done`
Also `?activity=working`, `?activity=failed`, and no query for the picker.

## Hard constraints

- No React, no bundler, no build step. MV3 blocks remote scripts and fonts.
- No new network assets. Icons are inline SVG; avatars are emoji. The manifest
  declares no `icons`; the extension ships no image mark.
- Styles use Astryx tokens only: `--color-*`, `--spacing-*`, `--radius-*`,
  `--shadow-*`, `--font-*`. No hex literals in `sidepanel.html`.
- One palette. Light and dark resolve through `light-dark()`. Do not add a second
  dark block.
- Edges are `box-shadow` rings, not `border`. Only status dots are fully round.
- `sidepanel.js` owns the DOM. If you rename a class, rename it in the file that
  builds it, in both places.
- Keep text concise: `Add`, `Send`, back arrow. No helper copy that the UI
  already implies.

## Behaviour that must not regress

- Queue survives a failed send; retry and copy-unsent stay possible.
- Queue editing autosaves (700 ms), blur saves, `Esc` discards, `Cmd+Enter` saves.
- Activity chip states: queued, working, done, failed, cancelled. Terminal states
  show no relative time.
- Reload pill appears only when a run finishes.
- Theme toggle is two-state, remembered in `chrome.storage.local`.
- Picker sorts running chats first and hides the close-inactive action when the
  plugin does not report `running`; that action closes in one click.
- `Clear queue` and `Copy all` stay enabled when idle; `Clear queue` refreshes
  panel state after draining.
- Header stays one line at 340px.

## Background messages

`panel_get_state`, `panel_visibility`, `panel_start_annotation`,
`panel_submit_annotation`, `panel_cancel_selection`, `refresh_sessions`,
`connect_tab_to_session`, `disconnect_tab`, `send_queued_annotations`,
`clear_queue`, `remove_queued_annotation`, `queue_shots`, `update_queue`,
`clear_history`, `close_session`, `selection_pick`, `selection_cancel`.

Add a type to `MESSAGE_TYPE` in `background.js` or it is silently ignored.

## Plugin

- Symlinked as `~/.config/opencode/plugins/opencode-annotate-repo` →
  `<repo>/plugin`.
- Config: `"./plugins/opencode-annotate-repo/v2/index.js"`. An absolute path is
  ignored silently.
- Restart OpenCode after plugin edits. Without `/activity`, the panel still works
  but shows no status and hides close-inactive.
- Ports `39240-39260`, first free wins. Browser and OpenCode must share
  `localhost`.

## Traps

- `chrome.tabs.captureVisibleTab` allows ~2 calls/sec per window and needs
  `<all_urls>` or `activeTab`; `activeTab` drops on navigation. That is why the
  extension asks for broad site access.
- Do not capture twice per annotation: reuse `session.previewUrl`.
- Worktrees live in `$TMPDIR`; the finalize script removes clean ones only.
- Never push `main` or `develop` from an agent session; use a feature branch.
- Repo comments were stripped on purpose. Keep new code comment-free unless a
  line is genuinely non-obvious.

## Workflow

1. Branch from `develop`: `git checkout -b feature/<thing>`
2. Change code, run the checks above
3. Update `CUSTOM.md` and `README.md` when behaviour changes
4. Append anything worth remembering to `MEMORY.md`
5. PR into `develop`; promote `develop` → `main`

## When adding a feature

- Panel state lives in `state`, rendering in `build*Node()` functions.
- `h()` removes attributes whose value is `false`, `null` or `undefined`, sets
  `true` to the empty string. Passing `disabled: false` is safe; stringifying it
  would disable the control.
- Prefer progressive disclosure: one primary action, the rest behind `…`.
- Every new control needs an accessible name and a visible focus ring.
- If it adds a background message, add it to `MESSAGE_TYPE` and to the dev stub
  in `sidepanel-dev.js` so the preview keeps working.
