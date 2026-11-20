# OpenCode Annotate — custom fork

Fork of [eagleeyejack/opencode-chrome-annotation-extension](https://github.com/eagleeyejack/opencode-chrome-annotation-extension)
(`1.6.1`, GPL-3.0). Adds agent activity feedback in the panel and keyboard
shortcuts. Upstream licence and attribution are kept.

## What changed

| File | Change |
|---|---|
| `manifest.json` | `name` → "OpenCode Annotate (custom)", `version_name` → `1.6.1-custom.1`, new `commands` block, `notifications` permission |
| `background.js` | `chrome.commands.onCommand` handler, `fetchClaimActivity()`, `activity` field in `panel_get_state`, toolbar badge + notification on run completion |
| `sidepanel.js` | `state.activity`, `activityNode()` badge, 2.5s activity poll (paused while typing) |
| `sidepanel.html` | `.activity` badge styles, states, reduced-motion guard |

The badge reads the plugin's `GET /activity?sessionId=...` endpoint, which only
exists in the forked plugin at
`~/.config/opencode/plugins/opencode-annotate-custom/`.

## Install

Plugin (already wired in `~/.config/opencode/opencode.jsonc`):

```jsonc
"plugins": [
  "./plugins/opencode-annotate-custom/v2/index.js"
]
```

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
| Annotate | Select element → type → Add & finish → Send |

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

## Black theme

The panel follows `prefers-color-scheme: dark`. Palette inverts to near-black
(`--paper #08090b`, `--surface #121418`, `--ink #eef1f7`), and two semantic tokens
keep filled surfaces readable in both themes:

- `--on-ink` — text colour for anything painted with `background: var(--ink)`
  (primary button, queue badges, count chips, active tabs, element bar)
- `--ink-hover` — hover fill for the primary button

Without those, `color: #ffffff` stayed hard-coded and every inverted surface
turned white-on-white or black-on-black.

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
