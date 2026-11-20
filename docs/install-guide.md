# OpenCode Annotate — install and use

Point at a UI element in Chrome, write a note, and your OpenCode agent gets a
cropped screenshot plus the element's selector and metadata.

Verified on macOS with Chrome 158 and OpenCode 2.3.2.

---

## What you need

| Piece | Role |
|---|---|
| `opencode-annotate` npm plugin | Runs inside OpenCode, opens a local HTTP server on `127.0.0.1:39240-39260` |
| OpenCode Annotate Chrome extension | Side panel in Chrome, captures the element and sends the annotation |
| OpenCode running in a project | Receives the annotation as a normal prompt |

Everything is local. No account, no telemetry, no cloud round trip.

---

## 1. Install the plugin

```bash
opencode plugin add opencode-annotate
```

That writes an entry into your OpenCode config. Check it:

```bash
grep -n -A 6 '"plugins"' ~/.config/opencode/opencode.jsonc
```

Expected shape:

```jsonc
"plugins": [
  "./plugin/ashleycode-auth.ts",
  "opencode-annotate"
]
```

Config key depends on your OpenCode version:

| OpenCode | Key |
|---|---|
| 2.x | `"plugins": ["opencode-annotate"]` (array) |
| 1.x | `"plugin": ["opencode-annotate@1"]` (singular) |

Restart OpenCode after adding the plugin.

Verify the server is listening:

```bash
for p in $(seq 39240 39260); do
  code=$(curl -s -m 1 -o /dev/null -w "%{http_code}" http://127.0.0.1:$p/status)
  [ "$code" = "200" ] && echo "listening on $p"
done
```

---

## 2. Install the Chrome extension

### Option A — Chrome Web Store (normal use)

1. Open <https://chromewebstore.google.com/detail/opencode-annotate/opcdjaoejpnkalealbpjabflbejpcmjh>
2. Click **Add to Chrome** → **Add extension**.
3. Click the puzzle icon in the toolbar and pin **OpenCode Annotate**.

### Option B — unpacked from source (development)

The extension is GPL-3.0. Source:
<https://github.com/eagleeyejack/opencode-chrome-annotation-extension>

```bash
git clone --depth 1 https://github.com/eagleeyejack/opencode-chrome-annotation-extension
```

Then in Chrome: `chrome://extensions` → enable **Developer mode** →
**Load unpacked** → select the cloned folder.

Note: the store build and the source build have different extension IDs. Both
talk to the same plugin, so you do not need both.

---

## 3. Use it

1. Start OpenCode in the project you are editing.
2. Open the page you want to annotate in Chrome.
3. Click the **OpenCode Annotate** icon. A side panel opens on the right.
4. Pick a chat from the list. This links the current tab to that OpenCode
   session.
5. Click **Select element**, then click the element on the page.
   The panel shows something like `button #submit`.
6. Type the instruction, for example
   `Change the button color to orange`.
7. **Add & finish** puts it in the queue, then **Send 1 to OpenCode** delivers
   it.
8. The agent receives a prompt containing the page URL, title, viewport,
   selector, tag, role, visible text, bounding box, and a cropped screenshot.

Queue several annotations before sending if you have a list of changes.

---

## 4. Confirm it worked

From an OpenCode session that loaded the plugin, ask the agent to run
`chrome_status`. Useful fields:

```json
{
  "server": { "status": "listening", "port": 39240 },
  "lastExtensionVersion": "1.6.2",
  "claims": [{ "tabId": 146370969, "sessionId": "ses_...", "lastSeenAt": "..." }],
  "lastAnnotation": { "ok": true, "sessionId": "ses_...", "time": "..." }
}
```

| Field | Meaning |
|---|---|
| `lastExtensionVersion: null` | Extension never reached the plugin |
| `claims: []` | No tab linked, or the claim expired |
| `lastAnnotation.ok: true` | Annotation delivered to the session |

Claims expire after 5 minutes without a heartbeat. Sending an annotation or
touching the panel refreshes them.

---

## 5. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Panel lists no chats | Plugin not loaded in that OpenCode process | Restart OpenCode in that project |
| "Tab is not connected to an OpenCode instance" | Claim expired or panel lost the session | Pick the chat again in the panel |
| Send fails, 403 origin | Extension talking to a port that is not the plugin | Close other OpenCode instances, retry |
| `lastExtensionVersion` stays `null` | Extension cannot reach `127.0.0.1` | Browser and OpenCode must be on the same machine, not separate containers |
| Select element does nothing | Page not injectable (chrome:// page, Web Store, PDF) | Use a normal http(s) page, reload it |
| Button color changes but the page looks old | Browser cached the CSS | Hard reload with `Cmd+Shift+R` |

Ports: plugin scans `39240-39260`, first free one wins. Each OpenCode instance
gets its own port, and the extension discovers all of them.

---

## 6. What the agent receives

```
Browser annotation from Chrome

User comment:
Change the button color to orange

Page:
Title: Annotate Demo
URL: http://127.0.0.1:4173/
Tab ID: 146370969
Viewport: width=998 height=955 devicePixelRatio=1

Selected element:
Selector: #submit
Tag: button
Role: button
Text: Place order
Aria label:
Rect: x=317 y=498 width=364 height=41

Inspect the screenshot and selected-element metadata, then make the appropriate
code change.
```

Plus the cropped screenshot as an attached image file under
`$TMPDIR/opencode-chrome-annotation-v2-<uid>/annotations/`.

---

## 7. Optional: automate the extension with chrome-devtools MCP
Useful only for testing. The MCP server needs the extension category to see
extension pages:

```jsonc
"chrome-devtools": {
  "type": "local",
  "command": ["npx", "-y", "chrome-devtools-mcp@latest", "--categoryExtensions"]
}
```

That exposes `install_extension`, `list_extensions`, `trigger_extension_action`,
`reload_extension`, `uninstall_extension`. Store-installed extensions are not
listed; only unpacked ones are.

Chrome does not allow scripted clicks on browser chrome (toolbar icon, side
panel). Without that flag, opening the panel and picking a chat is a human
step.

---

## 8. Privacy and trust

- Extension permissions: `tabs`, `activeTab`, `scripting`, `storage`,
  `sidePanel`, host access to `127.0.0.1` and `localhost`.
- The Chrome Web Store listing declares handling of page content and web
  history.
- Traffic is HTTP over loopback only, nothing leaves the machine.
- Small community project (one author, GPL-3.0, single-digit user base at the
  time of writing). Read the source before trusting it with sensitive pages.

---

## 9. Custom fork with agent status (this machine)

Stock store build shows only `Sent`. The local fork also shows whether the agent
is still working.

| Layer | Path |
|---|---|
| Plugin fork | `<repo>/plugin/` |
| Extension fork | `<repo>` (repo root is the unpacked extension) |
| Symlink | `~/.config/opencode/plugins/opencode-annotate-repo` -> `<repo>/plugin` |
| Selected in config | `"plugins": ["./plugins/opencode-annotate-repo/v2/index.js"]` |

Plugin adds `GET /activity?sessionId=...`, fed by
`session.execution.started|succeeded|failed|cancelled` events.

Extension adds a badge under the chat name and keyboard shortcuts:

| Shortcut | Action |
|---|---|
| `Alt+Shift+A` | Open the panel |
| `Alt+Shift+S` | Open the panel and start selecting an element |

Badge states: `Agent working… · 12s`, `Agent finished · 2m ago`,
`Agent failed`, `Agent cancelled`, `Queued`.

Load it with `chrome://extensions` → Developer mode → Load unpacked →
the repo folder. Details and upstream diff notes live in `CUSTOM.md`.

Verify after an OpenCode restart:

```bash
curl -s http://127.0.0.1:39240/activity | head -c 400
```

---

## Quick reference
```bash
# install plugin
opencode plugin add opencode-annotate

# find running plugin servers
for p in $(seq 39240 39260); do
  code=$(curl -s -m 1 -o /dev/null -w "%{http_code}" "http://127.0.0.1:$p/status")
  if [ "$code" = "200" ]; then
    echo "port $p"
    curl -s "http://127.0.0.1:$p/status"
    echo
  fi
done

# inspect one server
curl -s http://127.0.0.1:39240/status
curl -s http://127.0.0.1:39240/sessions
```
