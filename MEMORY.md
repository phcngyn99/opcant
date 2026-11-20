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
