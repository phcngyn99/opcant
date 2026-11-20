const state = {
  loading: true,
  theme: "system",
  tab: null,
  claim: null,
  activity: null,
  activityClaim: null,
  activityFresh: false,
  activityFreshTimer: null,
  lastSignature: null,
  queue: [],
  history: [],
  selection: null,
  sessions: null,
  sessionsContext: null,
  fetchingSessions: false,
  fetchingSessionsStarted: false,
  activeProject: "",
  searchQuery: "",
  showAllProjects: false,
  chipFit: null,
  animateChips: false,
  animateChipsTimer: null,
  animateList: false,
  animateListTimer: null,
  selectMode: false,
  selectedSessionIds: new Set(),
  selectionAnchorId: null,
  confirmBulkClose: false,
  confirmBulkTimer: null,
  lastView: null,
  draft: "",
  pending: false,
  connectingId: null,
  sendFailed: null,
  copying: false,
  toast: null,
  toastTimer: null,
  addedTick: false,
  tickTimer: null,
  focusTextarea: false
};

const app = document.body;

function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  if (props.text !== undefined)
    node.textContent = props.text;
  if (props.className)
    node.className = props.className;
  if (props.disabled)
    node.disabled = true;
  if (props.checked !== undefined)
    node.checked = Boolean(props.checked);
  if (props.attrs) {
    for (const [key, value] of Object.entries(props.attrs))
      node.setAttribute(key, String(value));
  }
  if (props.on) {
    for (const [event, handler] of Object.entries(props.on))
      node.addEventListener(event, handler);
  }
  for (const child of children) {
    if (child)
      node.appendChild(child);
  }
  return node;
}

const BRAND_ICONS = {
  opencode: { viewBox: "194 194 636 706", path: "m316.5 874.49c-9.43 7.73-16.5 12.57-16.5 11.29.01-1.49 12.34-75.52 14.52-87.14.82-4.32 1.48-8.04 1.48-8.25s-6.86-.41-15.25-.42c-24.64-.06-37.92-3.58-54.07-14.32-16.6-11.05-28.23-27.03-34.32-47.15-1.72-5.7-1.83-16.8-2.14-222-.25-160.11-.03-217.94.82-223.5 3.51-22.69 15.91-42.88 35.06-57.07 7.73-5.74 16.11-9.73 27.4-13.07l8-2.36h231c220.59 0 231.29.08 237.5 1.83 8.34 2.34 17.06 6.16 23.94 10.47 18.01 11.31 30.94 28.97 37.33 51.01l2.23 7.69v439l-2.24 8.41c-6.05 22.68-21.47 41.27-43.47 52.4-2.89 1.46-4.85 2.66-6.92 3.65-10.51 5.03-23.65 4.55-174.91 5.03l-160.55.51-6.45 5.08c-3.55 2.8-9.38 7.33-12.96 10.06-3.58 2.74-17.3 13.3-30.5 23.47s-30.75 23.61-39 29.88-17.25 13.24-20 15.5zm58.5-541.49v358h274v-358zm213 61v236h-152v-236z" }
};

const ICON_PATHS = {
  refresh: '<path d="M10 6a4 4 0 1 1-1.17-2.83M10 1.5V3.5H8"/>',
  crosshair: '<circle cx="6" cy="6" r="3.2"/><path d="M6 .8v2.4M6 8.8v2.4M.8 6h2.4M8.8 6h2.4"/>',
  send: '<path d="M11 1L1 5.5l3.5 2L6 11l5-10z"/><path d="M4.5 7.5L11 1"/>',
  check: '<path d="M2 6.4l2.6 2.6L10 3.4"/>',
  trash: '<path d="M1.8 3.2h8.4M4.4 3.2V2.2h3.2v1M2.8 3.2l.5 6.8h5.4l.5-6.8M4.9 5.4v2.8M7.1 5.4v2.8"/>',
  plug: '<path d="M4.2 1.2v2.6M7.8 1.2v2.6M2.6 3.8h6.8v1.8a3.4 3.4 0 0 1-6.8 0V3.8zM6 9v1.8"/>',
  sun: '<circle cx="6" cy="6" r="2.4"/><path d="M6 .6v1.6M6 9.8v1.6M.6 6h1.6M9.8 6h1.6M2.2 2.2l1.1 1.1M8.7 8.7l1.1 1.1M9.8 2.2L8.7 3.3M3.3 8.7L2.2 9.8"/>',
  moon: '<path d="M9.6 7.4A4.2 4.2 0 0 1 4.6 2.4a4.6 4.6 0 1 0 5 5z"/>',
  auto: '<circle cx="6" cy="6" r="4.6"/><path d="M6 1.4v9.2" /><path d="M6 1.4a4.6 4.6 0 0 1 0 9.2z" fill="currentColor" stroke="none"/>',
  copy: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><path d="M8.5 3.5v-1a1 1 0 0 0-1-1h-5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1"/>'
};

function icon(name, size = 14) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 12 12");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", "ic");
  svg.innerHTML = ICON_PATHS[name] || "";
  return svg;
}


function brandIcon(name, size = 13) {
  const brand = BRAND_ICONS[name];
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", brand.viewBox);
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", "brand-ic");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", brand.path);
  path.setAttribute("fill", "currentColor");
  svg.appendChild(path);
  return svg;
}

const AGENTS = {
  opencode: { label: "OpenCode", icon: "opencode", closable: true }
};

function agentOf(agent) {
  return AGENTS[agent] || AGENTS.opencode;
}

function agentLabel(agent) {
  return agentOf(agent).label;
}

function agentGlyph(agent, size = 14) {
  return h("span", {
    className: "agent-glyph",
    attrs: { "aria-hidden": "true" }
  }, [brandIcon(agentOf(agent).icon, size)]);
}

function addedTickNode() {
  return h("span", { className: "added-tick" }, [
    icon("check", 10),
    h("span", { text: "Added" })
  ]);
}

function toast(kind, text, ttl = 4500) {
  state.toast = { kind, text };
  render();
  if (state.toastTimer)
    clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => {
    state.toast = null;
    render();
  }, ttl);
}

async function currentTab() {
  const win = await chrome.windows.getCurrent();
  const [tab] = await chrome.tabs.query({ active: true, windowId: win.id });
  return tab || null;
}

async function sendPanelMessage(payload) {
  const tab = await currentTab();
  return chrome.runtime.sendMessage({ ...payload, tabId: tab?.id });
}

async function ensureOriginAccess() {
  const granted = await chrome.permissions.contains({ origins: ["<all_urls>"] });
  if (granted)
    return;
  const requested = await chrome.permissions.request({ origins: ["<all_urls>"] });
  if (!requested)
    throw new Error("Site access was denied. The extension needs access to pages to select elements and capture screenshots.");
}

async function refreshState() {
  try {
    const tab = await currentTab();
    if (tab?.id) {
      const response = await chrome.runtime.sendMessage({ type: "panel_get_state", tabId: tab.id });
      if (response?.ok) {
        const previousPhase = state.selection?.phase;
        const previousActivityState = state.activity?.state || null;
        state.tab = response.tab;
        state.claim = response.claim;
        state.activity = response.activity || null;
        state.queue = Array.isArray(response.queue) ? response.queue : [];
        state.history = Array.isArray(response.history) ? response.history : [];
        if (!state.queue.length)
          state.sendFailed = null;
        state.selection = response.selection;
        if (!response.selection)
          state.draft = "";
        if (previousPhase !== "locked" && response.selection?.phase === "locked")
          state.focusTextarea = true;
        applyActivityChange(previousActivityState);
      }
    }
  } catch {}
  state.loading = false;
  syncActivityTitle();
  const signature = stateSignature();
  if (signature === state.lastSignature) {
    updateActivityClock();
  } else {
    state.lastSignature = signature;
    render();
  }
}

function stateSignature() {
  const claim = state.claim;
  return JSON.stringify({
    tab: state.tab?.id ?? null,
    claim: claim ? [claim.sessionId, claim.sessionLabel, claim.agent, claim.projectDirectory] : null,
    activity: state.activity
      ? [state.activity.state, state.activity.since, state.activity.detail]
      : null,
    queue: state.queue,
    history: state.history,
    selection: state.selection,
    sendFailed: state.sendFailed
  });
}

function applyActivityChange(previousState) {
  const nextState = state.activity?.state || null;
  const claimKey = state.claim?.sessionId || null;
  const firstRead = claimKey !== state.activityClaim;
  state.activityClaim = claimKey;
  if (firstRead || nextState === previousState)
    return;
  const noteworthy = nextState === "done" || nextState === "failed";
  if (!noteworthy)
    return;
  if (state.activityFreshTimer)
    clearTimeout(state.activityFreshTimer);
  state.activityFresh = true;
  state.activityFreshTimer = setTimeout(() => {
    state.activityFresh = false;
  }, 400);
  if (!state.claim || document.hidden)
    return;
  if (nextState === "done")
    toast("success", `${agentLabel(state.claim.agent)} finished`, 3000);
  else
    toast("error", `${agentLabel(state.claim.agent)} reported a failure`, 5000);
}

async function disconnectTab() {
  try {
    const response = await sendPanelMessage({ type: "disconnect_tab" });
    if (!response?.ok) {
      toast("error", response?.error || "Failed to disconnect");
      return;
    }
    render();
  } catch (error) {
    toast("error", error?.message || String(error));
  }
}

async function startAnnotation() {
  try {
    const tab = await currentTab();
    await ensureOriginAccess();
    const response = await chrome.runtime.sendMessage({ type: "panel_start_annotation", tabId: tab?.id });
    if (!response?.ok)
      toast("error", response?.error || "Failed to start selection");
  } catch (error) {
    toast("error", error?.message || String(error));
  }
  render();
}

async function cancelSelection() {
  try {
    const response = await sendPanelMessage({ type: "panel_cancel_selection" });
    if (!response?.ok) {
      toast("error", response?.error || "Failed to cancel selection");
      return;
    }
    state.selection = null;
    state.draft = "";
    render();
  } catch (error) {
    toast("error", error?.message || String(error));
  }
}

async function reselectElement() {
  if (state.pending)
    return;
  try {
    const response = await sendPanelMessage({ type: "panel_reselect_element" });
    if (!response?.ok) {
      toast("error", response?.error || "Failed to reselect");
      return;
    }
    if (state.selection)
      state.selection = { phase: "hover", element: null, viewport: null };
    render();
  } catch (error) {
    toast("error", error?.message || String(error));
  }
}

async function submitSelection(finish) {
  if (state.pending)
    return;
  state.pending = true;
  render();
  try {
    const response = await sendPanelMessage({
      type: "panel_submit_annotation",
      comment: state.draft,
      finish
    });
    if (response?.ok) {
      state.draft = "";
      if (finish !== true)
        state.selection = { phase: "hover", element: null, viewport: null };
      state.addedTick = true;
      if (state.tickTimer)
        clearTimeout(state.tickTimer);
      state.tickTimer = setTimeout(() => {
        state.addedTick = false;
        render();
      }, 1600);
    } else {
      toast("error", response?.error || "Failed to add annotation");
    }
  } catch (error) {
    toast("error", error?.message || String(error));
  }
  state.pending = false;
  render();
}

async function sendQueue() {
  if (state.pending)
    return;
  if (!state.queue.length) {
    toast("error", "No queued annotations to send");
    return;
  }
  state.pending = true;
  render();
  try {
    const response = await sendPanelMessage({ type: "send_queued_annotations" });
    if (response?.ok) {
      const sent = response.sent || 0;
      state.sendFailed = null;
      const agent = agentLabel(state.claim?.agent);
      toast("success", sent === 1 ? `Sent 1 annotation to ${agent}` : `Sent ${sent} annotations to ${agent}`);
    } else {
      state.sendFailed = {
        sent: response?.sent || 0,
        failed: response?.failed || state.queue.length,
        error: response?.error || "Failed to send annotations"
      };
      toast("error", response?.error || "Failed to send annotations. Copy unsent to paste them manually.");
    }
  } catch (error) {
    state.sendFailed = { sent: 0, failed: state.queue.length, error: error?.message || String(error) };
    toast("error", error?.message || String(error));
  }
  state.pending = false;
  render();
  refreshState();
}

async function clearQueue() {
  try {
    const response = await sendPanelMessage({ type: "clear_queue" });
    if (!response?.ok) {
      toast("error", response?.error || "Failed to clear queue");
      return;
    }
    state.sendFailed = null;
    render();
  } catch (error) {
    toast("error", error?.message || String(error));
  }
}

async function removeQueued(id) {
  try {
    const response = await sendPanelMessage({ type: "remove_queued_annotation", id });
    if (!response?.ok)
      toast("error", response?.error || "Failed to remove annotation");
  } catch (error) {
    toast("error", error?.message || String(error));
  }
}

function asText(value, fallback = "") {
  if (typeof value === "string")
    return value;
  if (value === null || value === undefined)
    return fallback;
  return String(value);
}

function formatRect(rect) {
  if (!rect || typeof rect !== "object")
    return "";
  const x = rect.x ?? rect.left ?? "";
  const y = rect.y ?? rect.top ?? "";
  const width = rect.width ?? "";
  const height = rect.height ?? "";
  if (x === "" && y === "" && width === "" && height === "")
    return "";
  return `x=${x}, y=${y}, width=${width}, height=${height}`;
}

function formatAnnotationBlock(entry, index, total) {
  const element = entry?.element || {};
  const page = entry?.page || {};
  const comment = asText(entry?.comment, "");
  const lines = [];
  lines.push(`## Annotation ${index + 1}/${total}`);
  lines.push("");
  lines.push(`Comment: ${comment || "(no comment)"}`);
  lines.push(`Page: ${asText(page.title, "(untitled)")}`);
  lines.push(`URL: ${asText(page.url, "")}`);
  lines.push(`Selector: ${asText(element.selector, "")}`);
  lines.push(`Tag: ${asText(element.tag, "")}`);
  lines.push(`Role: ${asText(element.role, "")}`);
  lines.push(`Text: ${asText(element.text, "")}`);
  lines.push(`Aria-label: ${element.ariaLabel ?? ""}`);
  lines.push(`Id: ${element.id ?? ""}`);
  const rect = formatRect(element.rect);
  if (rect)
    lines.push(`Rect: ${rect}`);
  lines.push(`Class: ${asText(element.className, "")}`);
  lines.push(`Screenshot: ${entry?.hasScreenshot ? "retained in queue for retry (not embedded in clipboard)" : "none"}`);
  return lines.join("\n");
}

function formatUnsentMarkdown(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const screenshotsRetained = list.filter((entry) => entry?.hasScreenshot).length;
  const header = [
    `# Unsent annotations (${list.length}), paste into your chat`,
    screenshotsRetained
      ? `${screenshotsRetained} screenshot(s) retained in queue for retry (screenshots are not embedded in clipboard).`
      : "No screenshots retained for these annotations.",
    ""
  ].join("\n");
  const blocks = list.map((entry, index) => formatAnnotationBlock(entry, index, list.length));
  return `${header}\n${blocks.join("\n\n---\n\n")}\n`;
}

async function copyTextToClipboard(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {}
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    const ok = document.execCommand("copy");
    if (!ok)
      throw new Error("Copy command failed");
  } finally {
    textarea.remove();
  }
}

async function getCopyEntries() {
  try {
    const response = await sendPanelMessage({ type: "get_queue_for_copy" });
    if (response?.ok && Array.isArray(response.annotations) && response.annotations.length)
      return response.annotations;
  } catch {}
  return Array.isArray(state.queue) ? state.queue : [];
}

async function copyUnsent() {
  if (state.copying)
    return;
  const entries = await getCopyEntries();
  if (!entries.length) {
    toast("error", "No queued annotations to copy");
    return;
  }
  state.copying = true;
  render();
  try {
    await copyTextToClipboard(formatUnsentMarkdown(entries));
    toast("success", entries.length === 1 ? "Copied 1 annotation" : `Copied ${entries.length} annotations`);
  } catch (error) {
    toast("error", error?.message ? `Copy failed: ${error.message}` : "Copy failed. Select and copy manually.");
  }
  state.copying = false;
  render();
}

async function copySingle(id) {
  if (state.copying)
    return;
  const entries = await getCopyEntries();
  const entry = entries.find((item) => item?.id === id) || entries[0];
  if (!entry) {
    toast("error", "No queued annotations to copy");
    return;
  }
  state.copying = true;
  render();
  try {
    await copyTextToClipboard(formatUnsentMarkdown([entry]));
    toast("success", "Copied 1 annotation");
  } catch (error) {
    toast("error", error?.message ? `Copy failed: ${error.message}` : "Copy failed. Select and copy manually.");
  }
  state.copying = false;
  render();
}

function formatHistoryMarkdown(attempt) {
  const snapshots = Array.isArray(attempt?.snapshots) ? attempt.snapshots : [];
  const status = attempt?.status === "sent" ? "sent" : attempt?.status === "partial" ? "partial" : "failed";
  const header = status === "sent"
    ? [`# Sent annotations (${snapshots.length}), paste into your chat`, ""].join("\n")
    : [`# Annotation attempt ${status} (${snapshots.length}), paste into your chat`, ""].join("\n");
  const blocks = snapshots.map((entry, index) => formatAnnotationBlock(entry, index, snapshots.length));
  return `${header}\n${blocks.join("\n\n---\n\n")}\n`;
}

async function copyHistoryAttempt(attempt) {
  if (state.copying)
    return;
  const snapshots = Array.isArray(attempt?.snapshots) ? attempt.snapshots : [];
  if (!snapshots.length) {
    toast("error", "No snapshot for this attempt");
    return;
  }
  state.copying = true;
  render();
  try {
    await copyTextToClipboard(formatHistoryMarkdown(attempt));
    toast("success", snapshots.length === 1 ? "Copied 1 annotation" : `Copied ${snapshots.length} annotations`);
  } catch (error) {
    toast("error", error?.message ? `Copy failed: ${error.message}` : "Copy failed. Select and copy manually.");
  }
  state.copying = false;
  render();
}

function projectNameFor(directory) {
  const segments = (directory || "").split("/").filter(Boolean);
  return segments.length ? segments[segments.length - 1] : directory || "Unknown project";
}

function projectHue(directory) {
  let hash = 2166136261;
  for (const ch of directory || "")
    hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619);
  return Math.round(((hash >>> 0) * 137.508) % 360);
}

function formatRelative(ts) {
  const value = Number(ts);
  if (!Number.isFinite(value) || value <= 0)
    return "";
  const diff = Date.now() - value;
  if (diff < 0)
    return "now";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)
    return "now";
  if (minutes < 60)
    return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7)
    return `${days}d`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function toastNode() {
  return h("div", {
    className: `toast ${state.toast.kind}`,
    text: state.toast.text,
    attrs: { role: state.toast.kind === "error" ? "alert" : "status" }
  });
}

function actionNode() {
  const selection = state.selection;
  if (selection?.phase === "hover") {
    return h("div", { className: "picking" }, [
      icon("crosshair"),
      h("div", { className: "grow", text: "Click an element on the page…" }),
      state.addedTick ? addedTickNode() : null,
      h("button", {
        className: "btn small ghost",
        text: "Cancel",
        attrs: { type: "button" },
        on: { click: cancelSelection }
      })
    ]);
  }
  if (selection)
    return null;
  const hasQueue = state.queue.length > 0;
  return h("div", { className: "row" }, [
    h("button", {
      className: `btn grow${hasQueue ? "" : " primary"}`,
      attrs: { type: "button" },
      on: { click: startAnnotation }
    }, [icon("crosshair"), h("span", { text: hasQueue ? "Select another element" : "Select element" })]),
    state.addedTick ? addedTickNode() : null
  ]);
}

function sendBarNode() {
  const count = state.queue.length;
  if (!count)
    return null;
  const composing = state.selection?.phase === "locked";
  let label = `Send ${count} to ${agentLabel(state.claim?.agent)}`;
  if (state.pending)
    label = "Sending…";
  return h("div", { className: "send-bar" }, [
    h("button", {
      className: `btn full${composing ? "" : " primary"}`,
      attrs: { type: "button" },
      disabled: state.pending,
      on: { click: sendQueue }
    }, [icon("send"), h("span", { text: label })])
  ]);
}

function selectionNode() {
  const selection = state.selection;
  if (!selection)
    return null;
  if (selection.phase !== "locked")
    return null;
  const root = h("div", { className: "card" });
  const info = selection.element || {};
  root.appendChild(h("div", { className: "element-row" }, [
    h("div", {
      className: "element-info grow",
      text: `${info.tag || ""} ${info.selector || ""}`.trim() || "Selected element"
    }),
    h("button", {
      className: "btn small",
      text: "Reselect",
      attrs: { type: "button" },
      disabled: state.pending,
      on: { click: reselectElement }
    })
  ]));
  const agent = agentLabel(state.claim?.agent);
  const textarea = h("textarea", {
    className: "textarea",
    attrs: { placeholder: `What should ${agent} change here?`, "aria-label": `Instruction for ${agent}` }
  });
  textarea.value = state.draft;
  textarea.addEventListener("input", () => {
    state.draft = textarea.value;
  });
  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      submitSelection(false);
    }
  });
  root.appendChild(textarea);
  root.appendChild(h("div", { className: "hint", text: "Enter adds to the queue. Shift+Enter for a new line. Esc cancels." }));
  root.appendChild(h("div", { className: "row" }, [
    h("button", {
      className: "btn primary grow",
      text: state.pending ? "Adding…" : "Add to queue",
      attrs: { type: "button" },
      disabled: state.pending,
      on: { click: () => submitSelection(false) }
    }),
    h("button", {
      className: "btn",
      text: "Add & finish",
      attrs: { type: "button" },
      disabled: state.pending,
      on: { click: () => submitSelection(true) }
    }),
    h("button", {
      className: "btn ghost",
      text: "Cancel",
      attrs: { type: "button" },
      on: { click: cancelSelection }
    })
  ]));
  return root;
}

function queueNode() {
  if (!state.queue.length)
    return null;
  const root = h("div", { className: "section" });
  root.appendChild(h("div", { className: "section-head" }, [
    h("div", { className: "title grow" }, [
      h("span", { text: "Queue" }),
      h("span", { className: "count", text: String(state.queue.length) })
    ]),
    h("button", {
      className: "btn small ghost",
      attrs: { type: "button", "aria-label": `Copy ${state.queue.length} unsent annotations to clipboard`, title: "Copy unsent annotations to clipboard" },
      disabled: state.copying || state.pending,
      on: { click: copyUnsent }
    }, [icon("copy"), h("span", { text: "Copy all" })]),
    h("button", {
      className: "btn small ghost",
      attrs: { type: "button", "aria-label": "Clear the queue", title: "Clear the queue" },
      disabled: state.pending,
      on: { click: clearQueue }
    }, [icon("trash"), h("span", { text: "Clear" })])
  ]));
  if (state.sendFailed) {
    const delivered = state.sendFailed.sent || 0;
    const failed = state.sendFailed.failed || state.queue.length;
    const total = delivered + failed;
    root.appendChild(h("div", { className: "send-failure", attrs: { role: "alert" } }, [
      h("div", {
        className: "send-failure-text",
        text: total > 0
          ? `Send failed (${delivered} of ${total} delivered): ${state.sendFailed.error}. Copy unsent to paste them manually.`
          : `Send failed: ${state.sendFailed.error}. Copy unsent to paste them manually.`
      }),
      h("button", {
        className: "btn small",
        attrs: { type: "button" },
        disabled: state.copying || state.pending,
        on: { click: copyUnsent }
      }, [icon("copy"), h("span", { text: state.queue.length === 1 ? "Copy unsent annotation" : `Copy ${state.queue.length} unsent` })])
    ]));
  }
  const listContainer = h("div", { className: "list cards" });
  state.queue.forEach((entry, index) => {
    const rawComment = typeof entry.comment === "string" ? entry.comment.trim() : "";
    const label = `${entry.tag || ""} ${entry.selector || ""}`.trim() || "element";
    listContainer.appendChild(h("div", { className: "queue-item" }, [
      h("span", { className: "queue-num", text: String(index + 1), attrs: { "aria-hidden": "true" } }),
      h("div", { className: "grow" }, [
        h("div", { className: `queue-comment${rawComment ? "" : " empty"}`, text: rawComment || "No comment" }),
        h("div", { className: "queue-selector", text: label, attrs: { title: label } })
      ]),
      h("div", { className: "queue-item-actions" }, [
        h("button", {
          className: "icon-btn",
          attrs: { type: "button", "aria-label": `Copy queued annotation ${index + 1} to clipboard`, title: "Copy this annotation" },
          disabled: state.copying,
          on: { click: () => copySingle(entry.id) }
        }, [icon("copy")]),
        h("button", {
          className: "icon-btn",
          text: "×",
          attrs: { type: "button", "aria-label": `Remove queued annotation ${index + 1}`, title: "Remove" },
          disabled: state.pending,
          on: { click: () => removeQueued(entry.id) }
        })
      ])
    ]));
  });
  root.appendChild(listContainer);
  return root;
}

function historyStatus(attempt) {
  if (attempt?.status === "sent" || attempt?.status === "partial")
    return attempt.status;
  return "failed";
}

const HISTORY_BADGES = {
  sent: { label: "Sent", mark: "✓" },
  partial: { label: "Partly sent", mark: "~" },
  failed: { label: "Failed", mark: "!" }
};

function historySummary(snapshots, totalCount) {
  const first = snapshots.find((entry) => typeof entry?.comment === "string" && entry.comment.trim());
  const count = snapshots.length || totalCount;
  if (!first)
    return count === 1 ? "1 annotation" : `${count} annotations`;
  const text = first.comment.trim();
  if (count > 1)
    return `${text} (+${count - 1} more)`;
  return text;
}

function historyItemNode(attempt) {
  const status = historyStatus(attempt);
  const badge = HISTORY_BADGES[status];
  const sentCount = Number(attempt?.sentCount) || 0;
  const totalCount = Number(attempt?.totalCount) || 0;
  const when = formatRelative(attempt?.timestamp);
  const stamp = Number(attempt?.timestamp) ? new Date(attempt.timestamp).toLocaleString() : "";
  const snapshots = Array.isArray(attempt?.snapshots) ? attempt.snapshots : [];
  let meta = `${badge.label} · ${sentCount} of ${totalCount}`;
  if (when)
    meta += ` · ${when}`;
  let error = null;
  if (status !== "sent" && attempt?.error) {
    const message = String(attempt.error);
    error = h("div", {
      className: "history-error",
      text: message.length > 160 ? `${message.slice(0, 160)}…` : message,
      attrs: { title: message }
    });
  }
  let retry = null;
  if (status !== "sent") {
    retry = h("button", {
      className: "btn small",
      attrs: { type: "button", title: "Re-send the still-queued entries" },
      disabled: state.pending || state.copying || !state.queue.length,
      on: { click: sendQueue }
    }, [icon("send"), h("span", { text: "Retry" })]);
  }
  return h("div", { className: `history-item ${status}` }, [
    h("span", { className: `history-mark ${status}`, text: badge.mark, attrs: { "aria-hidden": "true" } }),
    h("div", { className: "grow" }, [
      h("div", { className: "history-summary", text: historySummary(snapshots, totalCount) }),
      h("div", { className: "queue-selector", text: meta, attrs: stamp ? { title: stamp } : {} }),
      error
    ]),
    h("div", { className: "queue-item-actions" }, [
      retry,
      h("button", {
        className: "icon-btn",
        attrs: {
          type: "button",
          "aria-label": "Copy this attempt's annotations to clipboard",
          title: snapshots.length ? "Copy this attempt's annotations" : "No snapshot for this attempt"
        },
        disabled: state.copying || state.pending || !snapshots.length,
        on: { click: () => copyHistoryAttempt(attempt) }
      }, [icon("copy")])
    ])
  ]);
}

function historyNode() {
  if (!Array.isArray(state.history) || !state.history.length)
    return null;
  const root = h("div", { className: "section" });
  root.appendChild(h("div", { className: "section-head" }, [
    h("div", { className: "title grow" }, [
      h("span", { text: "Sent" }),
      h("span", { className: "count quiet", text: String(state.history.length) })
    ])
  ]));
  const listContainer = h("div", { className: "list cards" });
  for (const attempt of state.history)
    listContainer.appendChild(historyItemNode(attempt));
  root.appendChild(listContainer);
  return root;
}

const ACTIVITY_LABELS = {
  queued: "Queued",
  working: "Working",
  done: "Finished",
  failed: "Failed",
  cancelled: "Stopped"
};

function formatActivityTime(activity, now = Date.now()) {
  const since = activity?.since ? Date.parse(activity.since) : NaN;
  if (!Number.isFinite(since))
    return "";
  if (activity.state !== "working")
    return "";
  const seconds = Math.max(0, Math.round((now - since) / 1000));
  const elapsed = seconds < 60
    ? `${seconds}s`
    : seconds < 3600
      ? `${Math.round(seconds / 60)}m`
      : `${Math.round(seconds / 3600)}h`;
  return seconds > 1 ? elapsed : "";
}

function activityStale(activity) {
  if (!activity?.state)
    return true;
  if (activity.state !== "done" && activity.state !== "failed" && activity.state !== "cancelled")
    return false;
  const since = activity.since ? Date.parse(activity.since) : NaN;
  return Number.isFinite(since) && Date.now() - since > 600000;
}

function activityNode() {
  const activity = state.activity;
  if (activityStale(activity))
    return null;
  const label = ACTIVITY_LABELS[activity.state] || activity.state;
  const time = formatActivityTime(activity);
  const attrs = {
    "data-state": activity.state,
    role: "status",
    "aria-live": "polite",
    "aria-atomic": "false",
    title: activity.detail || label
  };
  if (state.activityFresh)
    attrs["data-fresh"] = "true";
  const chip = h("span", { className: "activity", attrs }, [
    h("span", { className: "dot", attrs: { "aria-hidden": "true" } }),
    h("span", { className: "activity-label", text: label }),
    time ? h("span", { className: "activity-time", attrs: { "aria-live": "off" }, text: time }) : null
  ]);
  if (activity.state !== "done")
    return chip;
  return h("div", { className: "activity-row" }, [
    chip,
    h("button", {
      className: "btn small activity-reload",
      text: "Reload page",
      attrs: { type: "button", title: "Reload this page to see the agent's changes" },
      on: { click: reloadPage }
    })
  ]);
}

async function reloadPage() {
  const tabId = state.tab?.id;
  if (!tabId) {
    toast("error", "No tab to reload");
    return;
  }
  try {
    await chrome.tabs.reload(tabId, { bypassCache: true });
    toast("success", "Reloaded");
  } catch (error) {
    toast("error", error instanceof Error ? error.message : "Reload failed");
  }
}

function syncActivityTitle() {
  const base = "OpenCode Annotation";
  const stateName = state.claim ? state.activity?.state : null;
  const suffix = stateName === "working"
    ? " · working"
    : stateName === "done"
      ? " · finished"
      : stateName === "failed"
        ? " · failed"
        : "";
  const next = `${base}${suffix}`;
  if (document.title !== next)
    document.title = next;
}

function updateActivityClock() {
  const time = document.querySelector(".activity-time");
  if (!time)
    return;
  if (activityStale(state.activity)) {
    time.closest(".activity")?.remove();
    return;
  }
  const next = formatActivityTime(state.activity);
  if (time.textContent !== next)
    time.textContent = next;
}

function linkedChatNode() {
  const claim = state.claim;
  const label = claim?.sessionLabel || claim?.sessionId || "Connected";
  let project = null;
  if (claim?.projectDirectory) {
    project = h("span", { className: "linked-project" }, [
      h("span", {
        className: "project-dot",
        attrs: { style: `--dot:${projectHue(claim.projectDirectory)}`, "aria-hidden": "true" }
      }),
      h("span", { className: "project-name", text: projectNameFor(claim.projectDirectory), attrs: { title: claim.projectDirectory } })
    ]);
  }
  return h("div", { className: "linked" }, [
    agentGlyph(claim?.agent, 14),
    h("div", { className: "grow" }, [
      h("div", { className: "linked-label", text: label, attrs: { title: label } }),
      h("div", { className: "linked-meta" }, [
        h("span", { text: agentLabel(claim?.agent) }),
        project
      ]),
      activityNode()
    ]),
    themeButtonNode(),
    h("button", {
      className: "btn small",
      text: "Switch",
      attrs: { type: "button", title: "Disconnect and pick another chat", "aria-label": "Disconnect and pick another chat" },
      on: { click: disconnectTab }
    })
  ]);
}

function connectedNode() {
  const root = h("div", { className: "contents" });
  root.appendChild(h("div", { className: "chat-header" }, [linkedChatNode()]));
  const action = actionNode();
  if (action)
    root.appendChild(action);
  const selection = selectionNode();
  if (selection)
    root.appendChild(selection);
  const queue = queueNode();
  if (queue)
    root.appendChild(queue);
  const history = historyNode();
  if (history)
    root.appendChild(history);
  const sendBar = sendBarNode();
  if (sendBar)
    root.appendChild(sendBar);
  return root;
}

function buildUI() {
  const root = h("div", { className: "root" });
  if (state.loading) {
    root.appendChild(h("div", { className: "hint", text: "Loading…", attrs: { role: "status" } }));
    return root;
  }
  if (state.claim)
    root.appendChild(connectedNode());
  else
    root.appendChild(sessionsNode());
  if (state.toast)
    root.appendChild(toastNode());
  return root;
}

const FOCUSABLE = "button, input, textarea";

function render() {
  const active = document.activeElement;
  let focusIndex = -1;
  let selStart = null;
  let selEnd = null;
  if (active && active !== document.body && app.contains(active)) {
    focusIndex = Array.from(app.querySelectorAll(FOCUSABLE)).indexOf(active);
    if (active.tagName === "TEXTAREA" || active.tagName === "INPUT") {
      selStart = active.selectionStart;
      selEnd = active.selectionEnd;
    }
  }
  const activeTag = active?.tagName;
  const view = state.claim ? "chat" : "picker";
  const viewChanged = state.lastView != null && state.lastView !== view;
  state.lastView = view;
  const ui = buildUI();
  if (viewChanged) {
    const direction = view === "chat" ? "view-chat" : "view-picker";
    ui.classList.add("view-anim", direction);
    setTimeout(() => {
      if (ui.isConnected)
        ui.classList.remove("view-anim", direction);
    }, 260);
  }
  app.replaceChildren(ui);
  if (focusIndex >= 0 && !state.focusTextarea) {
    const next = ui.querySelectorAll(FOCUSABLE)[focusIndex];
    if (next && next.tagName === activeTag && !next.disabled) {
      next.focus({ preventScroll: true });
      if (selStart !== null && next.setSelectionRange)
        next.setSelectionRange(selStart, selEnd);
    }
  }
  if (state.focusTextarea) {
    state.focusTextarea = false;
    const textarea = ui.querySelector("textarea");
    if (textarea)
      textarea.focus();
  }
  fitProjectChips();
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "panel_state_changed")
    refreshState();
});

chrome.tabs.onActivated.addListener(() => {
  refreshState();
});

let resizeFrame = 0;
window.addEventListener("resize", () => {
  if (resizeFrame)
    return;
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0;
    state.chipFit = null;
    render();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape")
    return;
  if (!state.selection)
    return;
  event.preventDefault();
  cancelSelection();
});

const THEME_ORDER = ["system", "light", "dark"];
const THEME_LABEL = { system: "Auto", light: "Light", dark: "Dark" };

function applyTheme(theme) {
  state.theme = THEME_ORDER.includes(theme) ? theme : "system";
  const root = document.documentElement;
  if (state.theme === "system")
    delete root.dataset.theme;
  else
    root.dataset.theme = state.theme;
}

async function readTheme() {
  try {
    const stored = await chrome.storage?.local?.get?.("theme");
    return stored?.theme || "system";
  } catch {
    return "system";
  }
}

function themeButtonNode() {
  const next = THEME_ORDER[(THEME_ORDER.indexOf(state.theme) + 1) % THEME_ORDER.length];
  return h("button", {
    className: "icon-btn theme-btn",
    attrs: {
      type: "button",
      title: `Theme: ${THEME_LABEL[state.theme]} — click for ${THEME_LABEL[next]}`,
      "aria-label": `Theme: ${THEME_LABEL[state.theme]}. Change theme to ${THEME_LABEL[next]}`
    },
    on: { click: cycleTheme }
  }, [icon(state.theme === "light" ? "sun" : state.theme === "dark" ? "moon" : "auto", 14)]);
}

function cycleTheme() {
  const next = THEME_ORDER[(THEME_ORDER.indexOf(state.theme) + 1) % THEME_ORDER.length];
  applyTheme(next);
  try {
    chrome.storage?.local?.set?.({ theme: next });
  } catch {}
  render();
}

(async () => {
  applyTheme(await readTheme());
  await refreshState();
  fetchSessions();
})();

async function reportVisibility() {
  try {
    await sendPanelMessage({ type: "panel_visibility", visible: !document.hidden });
  } catch {}
}
document.addEventListener("visibilitychange", reportVisibility);
reportVisibility();

setInterval(() => {
  if (!state.claim || state.loading || state.pending || document.hidden)
    return;
  const active = document.activeElement;
  if (active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT"))
    return;
  refreshState();
}, 10000);

setInterval(() => {
  if (!state.claim || !state.activity || document.hidden)
    return;
  updateActivityClock();
}, 1000);
