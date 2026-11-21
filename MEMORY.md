# MEMORY.md — append-only decision log

Newest last. Do not edit or delete entries; correct mistakes with a new entry.

## 2026-11-20 — fork baseline

- Forked upstream `1.6.1` into this repo. GPL-3.0 kept, attribution kept.
- Extension loads unpacked from the repo root; no build step, no React, no
  bundler. MV3 blocks remote scripts and fonts, so every asset is local.

## 2026-11-20 — plugin fork

- Plugin vendored under `plugin/` and symlinked as
  `~/.config/opencode/plugins/opencode-annotate-repo`.
- Absolute paths in `opencode.jsonc` are ignored silently; only the relative
  symlink form loads.
- Added `/activity` (per-session state) and `running` on `/sessions`, both fed by
  `session.execution.*` events.

## 2026-11-20 — Astryx tokens

- Adopted `@astryxdesign/theme-neutral@0.4.1` CSS tokens, vendored verbatim.
- Deliberately did not adopt Astryx React components: no bundler, and CDN
  imports are blocked by the extension CSP.
- One palette via `light-dark()`; the hand-written dark block was deleted.

## 2026-11-20 — theme

- Theme is two-state, `Light ⇄ Dark`, persisted in `chrome.storage.local`.
- `system`/Auto was removed on request; first run seeds from
  `prefers-color-scheme`, afterwards the user's choice wins.

## 2026-11-20 — simplification

- Verbs: `Add`, `Send`. Removed `Add to queue`, `Add & finish`,
  `Send N to OpenCode`, and the composer hint line.
- `Switch` became a back-arrow icon.
- Queue header actions moved into `…`; per-row copy/remove reveal on hover.
- Agent filter tabs and the `All` project chip were removed: only OpenCode
  sessions exist in this fork.

## 2026-11-20 — queue

- Queue rows show the cropped screenshot, fetched lazily via `queue_shots` and
  cached in `state.queueShots`.
- Editing is inline with autosave: 700 ms debounce, blur saves, `Esc` discards,
  `Cmd+Enter` saves immediately. No Save/Cancel buttons.
## 2026-11-20 — picker

- Sessions sort running first, then by recency.
- `…` menu holds `Close N inactive` (confirm once) and `Select chats to close`.
- Close-inactive stays hidden when the plugin does not report `running`, so an
  older plugin cannot offer to close everything.
- Each chat shows a deterministic animal emoji hashed from its session id.

## 2026-11-20 — preview capture

- `selection_pick` captures the visible tab once, crops to the element, stores it
  as `session.previewUrl`. Submit reuses it instead of capturing again.
- `captureVisibleTab` is rate-limited to ~2 calls/sec per window.

## 2026-11-20 — convention

- Comments were stripped from the panel code on request. New code stays
  comment-free unless a line is genuinely non-obvious.
- Docs to keep in sync on behaviour changes: `README.md`, `CUSTOM.md`,
  `docs/install-guide.md`.
- Finalize script lives outside the repo, in `$TMPDIR/finalize-opcant.sh`.

## 2026-11-20 — alignment pass

- Reload moved from a text button into the header icon row (refresh icon), so
  the header is one line: avatar + title, reload, theme, back.
- Header grid is `minmax(0,1fr) auto auto auto`; adding any header control means
  bumping the track count or it wraps.
- Queue thumbnails use `object-fit: contain` at 52x34: whole element visible,
  no crop, no layout shift.

## 2026-11-20 — lightbox + button scale

- Clicking a queue thumbnail opens a modal lightbox; click or Esc closes it.
  Image caps at 420px so small crops do not blur into a wall.
- Text buttons share one height (34px) so rows align: Reselect, Add, Cancel,
  history Clear. Icon buttons stay 28px by design.

## 2026-11-20 — boolean-attr bug

- `h()` stringified attributes, so `disabled: false` became
  `disabled="false"`, which is present and disables the element.
- `Clear queue` and `Copy all` were both dead controls; the menu opened but
  clicks did nothing.
- Root cause found by probe: handler never fired, `disabled: true`,
  `state.pending: false`.
- Fix: `h()` removes `false`/`null`/`undefined` attrs, sets `true` to empty
  string. Verified `clear` handler hits once, queue drains, menu closes.

## 2026-11-20 — bolder + polish pass

- `Send` is a full-width button with the `--color-background-blue` fill, the
  one primary action in the composer.
- Header title `--font-size-2xl`, `-0.02em` tracking, `text-wrap: balance`;
  avatar 18px; section labels uppercase micro-caps at 0.08em tracking.
- Composer at `--shadow-med`; queue rows lift 1px to `--shadow-med` on hover.
- Caret uses `--color-accent`; extra space above section headings.
- Picker logo removed; manifest `icons` and `action.default_icon` removed. The
  unused `icons/` directory remains on disk but ships nothing.

## 2026-11-20 — close-inactive single click

- `Close N inactive` no longer shows a confirm step. One click closes the
  inactive chats.

## 2026-11-20 — queue edit layout

- `.queue-edit` matches the row's `line-height: 1.5`, so editing adds no jump.
- The row's captured height is kept as a min-height while editing, and the
  selector chip stays visible during the edit.

## 2026-11-20 — block-scope ReferenceErrors in submitPanelAnnotation

- `submitPanelAnnotation` had two same-class bugs: `cropped` and `tab` were
  both `const`-declared inside `if (!dataUrl)` but read outside it, so every
  panel submit threw `cropped is not defined` (log line) or, with a preview
  captured, `tab is not defined` (queue payload). Fix: hoist both above the
  `if`. Both bugs surfaced only in a full live run, not by `node --check`;
  the verify-send-loss-proof harness does not cover the panel submit path.
- Live-test setup that worked: install the extension in the chrome-devtools
  MCP profile with `<all_urls>` added to `host_permissions` (CDP-synthesized
  clicks never grant `activeTab`, and `captureVisibleTab` errors otherwise);
  open `sidepanel.html` as a normal tab and send the panel messages with an
  explicit `tabId` from that page; the visible tab must be the content page,
  not the panel tab, or capture captures the wrong surface.

## 2026-11-20 — picker `…` menu removed

- The picker's session list is live from OpenCode: panel `fetchSessions` →
  background `refresh_sessions` → `GET <plugin>/sessions` (ports 39240+).
  User decision: with a live list, the `…` Chat actions menu (Close N inactive
  + select-to-close mode) is redundant. Removed `closeInactiveNode`,
  `selectToggleNode`, `bulkBarNode`, `closeInactiveSessions`,
  `postCloseSession`, the select-mode machinery and its CSS
  (`.session-select`, `.bulk-bar`, `.session-row.selected/.unselectable`).
  Picker header now has only Theme + Refresh. Per-row connect unchanged.
- Background `close_session` message type stays (still in MESSAGE_TYPE).

## 2026-11-20 — Send button silently dead: `const label` reassigned in sendBarNode

- `sendBarNode` did `const label = "Send"; if (state.pending) label = "Sending…"`.
  Assigning to a `const` throws. First Send/Add click set `state.pending = true`,
  the following `render()` threw inside `sendBarNode`, and the throw escaped
  before `state.pending = false` — so `pending` stayed true forever and every
  later render threw, freezing the whole panel DOM. Send, Add, even the theme
  toggle went silently dead; `node --check` and the send-loss harness never
  cover it because it is a runtime TypeError. Fix: `let label`.
- Debugging trail that found it: CDP logpoint at the guard printed
  `guard pending= true` and the console carried
  `Uncaught (in promise) TypeError: Assignment to constant variable` with the
  `sendBarNode` stack. Event-level instrumentation alone looked like "handler
  not attached" — the stuck `pending` guard was the real early-return.

## 2026-11-21 — CUSTOM.md removed; picker refreshes on return

- CUSTOM.md removed at the user's request; the fork-change list now lives only
  in README.md ("Features beyond upstream"). References updated in AGENTS.md
  and README.md (layout table, update-flow step, licence note).
- Picker session refresh on return: "Back to chats" only disconnected and
  re-rendered, so the picker showed a stale list. `refreshState` now calls
  `fetchSessions()` whenever a claim transitions to none (and
  `fetchingSessions` is not already in flight).
- The picker's gray-out of `running === false` rows was removed at the user's
  request: the plugin's `running` flag comes from the activity map and can be
  stale or wrong; dimming a live chat is worse than uniform rows.
  Running-first sort stays.

## 2026-11-21 — per-session close in the picker

- Each picker row carries an × (hover-revealed, same pattern as queue rows)
  that closes that OpenCode session: close_session → POST /session/close on
  the owning plugin instance, list re-fetched after. Rows without baseUrl
  (preview stubs) render no button. Background already disconnects tabs
  claimed by a closed session, so no extra handling was needed.
- The user's plugin server port moves between OpenCode launches (39241 →
  39240); discovery handles it, but a hardcoded baseUrl in test scripts goes
  stale between days.
