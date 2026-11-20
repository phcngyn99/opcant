# OpenCode Annotate — custom fork

Fork of [eagleeyejack/opencode-chrome-annotation-extension](https://github.com/eagleeyejack/opencode-chrome-annotation-extension)
(`1.6.1`, GPL-3.0). Adds agent status, cropped previews, an editable queue, a
simplified UI and Astryx styling. Upstream licence and attribution are kept.

## What changed

| File | Change |
|---|---|
| `manifest.json` | `name` → "OpenCode Annotate (custom)", `version_name` → `1.6.1-custom.1`, `commands` block, `notifications` permission; `icons` and `action.default_icon` removed so no OpenCode mark ships — Chrome shows its default tile |
| `background.js` | `chrome.commands.onCommand`, `fetchClaimActivity()`, toolbar badge + completion notification, `selection_pick` preview capture, `queue_shots`, `update_queue`, `clear_history`, activity in `panel_get_state` |
| `plugin/v2/index.js` | `/activity` endpoint, `activities` in `/status`, `running` flag in `/sessions` |
| `sidepanel.js` | activity badge, light/dark toggle, animal avatars, queue editing with autosave, plain verbs, back-icon button, session sorting, boolean-attr-safe `h()` helper |
| `sidepanel-picker.js` | no agent filter, no `All` chip, running-first sort, project toggle in the footer, `…` menu with single-click close-inactive, no header logo |
| `sidepanel.html` | Astryx tokens, shadow rings, preview and thumbnail styles, menu styles, typographic hierarchy (2xl balanced title, uppercase micro-cap section labels), full-width blue `Send`, hover lift on queue rows |

The badge reads the plugin's `GET /activity?sessionId=...` endpoint, which only
exists in the forked plugin at
`~/.config/opencode/plugins/opencode-annotate-custom/`.

## Install

Plugin (wired in `~/.config/opencode/opencode.jsonc`):

```jsonc
"plugins": [
  "./plugins/opencode-annotate-repo/v2/index.js"
]
```

where `~/.config/opencode/plugins/opencode-annotate-repo` is a symlink to
`<repo>/plugin`.

Restart OpenCode after changing it.

Extension:

1. `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select this folder

The Chrome Web Store build does not have these changes. Both builds can talk to
the same plugin; only this one shows the status badge.

## Use

| Action | How |
|---|---|
| Open panel | toolbar icon, or `Alt+Shift+A` |
| Open panel and start selecting | `Alt+Shift+S` |
| Annotate | Select element → type → Add → Send |
| Edit a queued item | click its text, type, it autosaves |
| Close idle chats | picker `…` → `Close N inactive` |

Shortcut bindings can be changed at `chrome://extensions/shortcuts`.

## Agent status badge

| State | Badge |
|---|---|
| queued | grey, `Queued` |
| working | blue pulsing dot, `Agent working… · 12s` |
| done | green, `Agent finished · 2m ago` |
| failed | red, `Agent failed` |
| cancelled | amber, `Agent cancelled` |

Source of truth is the plugin event stream:
`session.execution.started` → working,
`session.execution.succeeded` → done,
`session.execution.failed` → failed,
`session.execution.cancelled` / `.aborted` → cancelled.

Poll interval is 2500 ms while a tab is claimed. The poll skips while focus is
in a text field, so typing an instruction is never interrupted.

## Toolbar badge and completion notification

Even with the panel closed, the service worker polls activity every 2500 ms per
claimed tab and reflects it on the toolbar icon of that tab:

| State | Badge | Title |
|---|---|---|
| working | `●` blue | Agent is working |
| done | `✓` green | Agent finished |
| failed | `!` red | Agent failed |
| cancelled | `–` amber | Agent cancelled |
| queued | `…` grey | Annotation queued |

When a state flips from `working` to `done` or `failed`, the extension also
raises a `chrome.notifications` basic notification naming the chat. Requires the
`notifications` permission in `manifest.json`.

Verified on Chrome 158: badge moved `● Agent is working` → `✓ Agent finished`
during a live turn.

## Test the activity endpoint

```bash
# all recent activity on a plugin instance
curl -s http://127.0.0.1:39240/activity | head -c 400

# one session
curl -s "http://127.0.0.1:39240/activity?sessionId=ses_xxx"
```

Expected:

```json
{"sessionId":"ses_xxx","activity":{"state":"done","since":"2026-11-20T06:15:38.684Z"},"claimed":true}
```

## Theme toggle

Sun/moon button in the panel and picker headers, cycling `Light ⇄ Dark`. First
run seeds from `prefers-color-scheme`; after that the choice persists in
`chrome.storage.local` under `theme` and is written to `data-theme` on `<html>`,
which Astryx's theme CSS already scopes (`html[data-theme="light"|"dark"]`).

## Simplified UI

The panel is deliberately terse:

- `Add` and `Send`, no `Add & finish`, no `Send 3 to OpenCode`
- `Send` spans the full composer width with the accent-blue fill, so it reads as
  the one primary action
- no helper line under the composer
- back arrow instead of a `Switch` button
- `Copy all` / `Clear queue` behind one `…` menu, per-row copy/remove on hover;
  `Clear queue` drains the queue and refreshes the panel state itself
- no agent filter tabs, no `All` chip; clicking the active project chip clears it
- queue rows show the cropped screenshot, edited inline with autosave
- picker `…` → `Close N inactive` closes in one click, no confirm step

## Visual hierarchy

- Header title is the focal point: `--font-size-2xl`, `-0.02em` tracking,
  `text-wrap: balance`; avatar 18px.
- Section labels (`QUEUE`, `SENT`) are uppercase micro-caps at
  `--font-size-xs` with `0.08em` tracking.
- Composer card sits at `--shadow-med`; queue rows lift to `--shadow-med` and
  translate up 1px on hover.
- Text caret uses `--color-accent`; sections carry extra air above their heading
  than below it.
- The picker header logo was removed and the manifest no longer declares
  `icons` / `action.default_icon`, so the extension ships no image mark at all.

## The `h()` boolean-attr contract

`h()` in `sidepanel.js` used to stringify attributes, so `disabled: false`
produced `disabled="false"` — a present attribute, which disables the element.
That silently killed `Clear queue`, `Copy all` and every other control passing
a false flag. The helper now removes an attribute whose value is `false`,
`null` or `undefined`, sets `true` to the empty string, and stringifies
everything else. Any new control can pass `disabled: someFalsey` safely.

## Cropped preview and queue thumbnails

`selection_pick` captures the visible tab and crops to the element rect, storing
it as `session.previewUrl`. The composer shows it, and submitting reuses it so a
single capture happens per annotation. Queued items fetch their stored data URL
through `queue_shots`, cached in `state.queueShots` and cleared when the queue
drains.

## Session avatars and ordering

Each chat gets an animal emoji derived from a hash of its session id: stable per
chat, different between chats. No network assets, no icon package. Sessions with
`running: true` sort first; `running` comes from the plugin's activity map, and
the close-inactive menu stays hidden when the plugin does not report it.

## Astryx tokens

`vendor/astryx/theme.css` is the Astryx neutral theme (`@astryxdesign/theme-neutral@0.4.1`,
MIT), copied verbatim. The panel declares `data-astryx-theme="neutral"` and maps
its old palette aliases onto Astryx tokens:

| Alias | Token |
|---|---|
| `--paper`, `--surface`, `--field` | `--color-background-body` / `-card` / `-surface` |
| `--ink`, `--ink-2` | `--color-text-primary` / `-secondary` |
| `--line`, `--line-strong` | `--color-border` / `-emphasized` |
| `--peri*` | `--color-accent`, `--color-accent-muted`, `--color-on-accent` |
| `--green*`, `--red*`, `--amber*` | `--color-success|error|warning` and their `-muted` fills |
| `--r-sm`, `--r`, `--r-lg` | `--radius-inner` / `-element` / `-container` |
| `--sans`, `--mono` | `--font-family-body` / `-code` |

Astryx resolves light and dark through CSS `light-dark()`, so the hand-written
dark palette block is gone. Component CSS from `@astryxdesign/core` is not
vendored: the panel is vanilla JS with no build step, and React/StyleX cannot be
loaded into an MV3 extension from a CDN. Only the token layer is used; panel
component styles follow Astryx conventions — soft elevation (`--shadow-low/-med`),
hairline rings, the radius scale, and the `--font-size-*` ramp.

## OpenCode only

Claude Code support is removed in this fork: no agent tab, no Claude glyph, no
bridge instructions, and `background.js` always labels sessions `opencode`.
Upstream's Claude Code path can be restored by reverting that file if needed.

## Why the panel still asks for site access

The extension requests `<all_urls>` before it can read the page DOM and capture
a screenshot. Narrowing that request to the current origin looked attractive,
but `chrome.tabs.captureVisibleTab` accepts only `<all_urls>` or `activeTab`,
and `activeTab` access is dropped when the page navigates. A per-origin grant
would allow element selection and then fail at screenshot time, which is a worse
failure than one permission prompt.

## Updating from upstream

```bash
git clone --depth 1 https://github.com/eagleeyejack/opencode-chrome-annotation-extension upstream
diff -ru upstream sidepanel.js   # review, then re-apply this fork's changes
```

Keep `LICENSE` intact. GPL-3.0 applies to redistributed modifications.
