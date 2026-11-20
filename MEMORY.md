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
