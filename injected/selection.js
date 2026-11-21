// injected/selection.js - side-panel selection mode
(() => {
  if (globalThis.__opc_selection) {
    try {
      globalThis.__opc_selection.cleanup();
    } catch {}
  }
  // Reloads orphan older injections (dead extension context, DOM still there);
  // sweep every leftover root so only the fresh one remains.
  document.querySelectorAll('[id="__opc_selection_root"]').forEach((node) => node.remove());
  const root = document.createElement("div");
  root.id = "__opc_selection_root";
  root.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:2147483647",
    "pointer-events:none"
  ].join(";");
  const box = document.createElement("div");
  box.style.cssText = [
    "position:fixed",
    "border:2px solid rgba(24,26,31,0.92)",
    "background:rgba(127,127,127,0.16)",
    "box-shadow:0 0 0 1px rgba(255,255,255,0.55)",
    "pointer-events:none",
    "display:none"
  ].join(";");
  root.appendChild(box);
  const pathLabel = document.createElement("div");
  pathLabel.style.cssText = [
    "position:fixed",
    "z-index:2147483647",
    "pointer-events:none",
    "display:none",
    "max-width:60vw",
    "background:rgba(15,18,24,0.92)",
    "color:#f8fafc",
    "font:500 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace",
    "padding:4px 8px",
    "border-radius:6px",
    "box-shadow:0 2px 8px rgba(0,0,0,0.35)"
  ].join(";");
  const pathLine = document.createElement("div");
  pathLine.style.cssText = "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
  const cssTable = document.createElement("div");
  cssTable.style.cssText = "display:grid;grid-template-columns:max-content max-content;gap:1px 12px;margin-top:3px;";
  pathLabel.appendChild(pathLine);
  pathLabel.appendChild(cssTable);
  root.appendChild(pathLabel);
  document.documentElement.appendChild(root);

  const ROLE_BY_TAG = {
    A: "link",
    BUTTON: "button",
    INPUT: "textbox",
    SELECT: "combobox",
    TEXTAREA: "textbox"
  };
  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function")
      return window.CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }
  function inferRole(el) {
    return el.getAttribute("role") || ROLE_BY_TAG[el.tagName] || "";
  }
  function buildSelector(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE)
      return "";
    if (el.id)
      return `#${cssEscape(el.id)}`;
    const parts = [];
    let current = el;
    while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 5) {
      let part = current.tagName.toLowerCase();
      if (current.classList && current.classList.length) {
        part += "." + Array.from(current.classList).slice(0, 2).map(cssEscape).join(".");
      }
      const parent = current.parentElement;
      if (parent) {
        const currentTag = current.tagName;
        const siblings = Array.from(parent.children).filter((child) => child.tagName === currentTag);
        if (siblings.length > 1) {
          part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
        }
      }
      parts.unshift(part);
      if (current.parentElement?.id) {
        parts.unshift(`#${cssEscape(current.parentElement.id)}`);
        break;
      }
      current = current.parentElement;
    }
    return parts.join(" > ");
  }
  function describeElement(el) {
    const rect = el.getBoundingClientRect();
    return {
      selector: buildSelector(el),
      tag: el.tagName.toLowerCase(),
      role: inferRole(el),
      text: (el.innerText || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 500),
      ariaLabel: el.getAttribute("aria-label"),
      id: el.id || null,
      className: typeof el.className === "string" ? el.className : "",
      rect: {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      }
    };
  }
  function describeViewport() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1
    };
  }

  let locked = false;
  let done = false;
  let lockedRect = null;
  function applyHighlightRect(rect) {
    box.style.display = "block";
    box.style.top = `${rect.top}px`;
    box.style.left = `${rect.left}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
  }
  function send(payload) {
    try {
      chrome.runtime.sendMessage(payload);
    } catch {}
  }
  function updateHighlight(el) {
    if (!el) {
      box.style.display = "none";
      return;
    }
    applyHighlightRect(el.getBoundingClientRect());
  }
  function resetHighlightStyle() {
    box.style.borderColor = "rgba(24,26,31,0.92)";
    box.style.background = "rgba(127,127,127,0.16)";
  }
  function describeCssRows(el) {
    const s = getComputedStyle(el);
    const family = String(s.fontFamily).split(",")[0].replace(/["']/g, "").trim();
    return [
      ["bg", s.backgroundColor],
      ["color", s.color],
      ["font", `${s.fontWeight} ${s.fontSize} ${family}`],
      ["radius", s.borderTopLeftRadius],
      ["pad", s.padding]
    ];
  }
  function updatePathLabel(el, event) {
    if (!el) {
      pathLabel.style.display = "none";
      return;
    }
    pathLine.textContent = `${el.tagName.toLowerCase()} ${buildSelector(el)}`.trim();
    cssTable.textContent = "";
    for (const [key, value] of describeCssRows(el)) {
      const keyCell = document.createElement("span");
      keyCell.textContent = key;
      keyCell.style.cssText = "color:rgba(248,250,252,0.6);";
      const valueCell = document.createElement("span");
      valueCell.textContent = value;
      valueCell.style.cssText = "max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(248,250,252,0.85);";
      cssTable.append(keyCell, valueCell);
    }
    pathLabel.style.display = "block";
    pathLabel.style.left = "0px";
    pathLabel.style.top = "0px";
    const width = pathLabel.offsetWidth;
    const height = pathLabel.offsetHeight;
    let left = event.clientX + 14;
    let top = event.clientY + 18;
    if (left + width > window.innerWidth - 8)
      left = Math.max(8, event.clientX - width - 14);
    if (top + height > window.innerHeight - 8)
      top = Math.max(8, event.clientY - height - 14);
    pathLabel.style.left = `${left}px`;
    pathLabel.style.top = `${top}px`;
  }
  function onMouseMove(event) {
    if (locked || done)
      return;
    const el = document.elementFromPoint(event.clientX, event.clientY);
    if (!el || root.contains(el))
      return;
    updateHighlight(el);
    updatePathLabel(el, event);
  }
  function onClick(event) {
    if (locked || done)
      return;
    const el = document.elementFromPoint(event.clientX, event.clientY);
    if (!el || root.contains(el))
      return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    locked = true;
    updateHighlight(el);
    updatePathLabel(null, event);
    const rect = el.getBoundingClientRect();
    lockedRect = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    };
    box.style.borderColor = "rgba(24,26,31,0.98)";
    box.style.background = "rgba(127,127,127,0.32)";
    send({
      type: "selection_pick",
      element: describeElement(el),
      viewport: describeViewport()
    });
  }
  function onKeyDown(event) {
    if (event.key !== "Escape" || done)
      return;
    event.preventDefault();
    exit("cancel");
  }
  function onMessage(message, sender, sendResponse) {
    if (!message || typeof message !== "object")
      return;
    if (message.type === "opc_selection_reenter" && !done) {
      locked = false;
      resetHighlightStyle();
      updateHighlight(null);
      sendResponse({ ok: true });
      return;
    }
    if (message.type === "opc_selection_hide_highlight" && locked && !done) {
      box.style.display = "none";
      sendResponse({ ok: true });
      return;
    }
    if (message.type === "opc_selection_show_highlight" && locked && !done && lockedRect) {
      applyHighlightRect(lockedRect);
      sendResponse({ ok: true });
      return;
    }
    if (message.type === "opc_selection_exit" && !done) {
      cleanup();
      sendResponse({ ok: true, exited: true });
    }
  }
  function cleanup() {
    if (done)
      return;
    done = true;
    document.removeEventListener("mousemove", onMouseMove, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKeyDown, true);
    try {
      chrome.runtime.onMessage.removeListener(onMessage);
    } catch {}
    root.remove();
    if (globalThis.__opc_selection === api)
      globalThis.__opc_selection = null;
  }
  function exit(reason) {
    cleanup();
    send({ type: reason === "cancel" ? "selection_cancel" : "selection_exited" });
  }

  chrome.runtime.onMessage.addListener(onMessage);
  document.addEventListener("mousemove", onMouseMove, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKeyDown, true);
  const api = { cleanup };
  globalThis.__opc_selection = api;
})();
