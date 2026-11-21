
async function fetchSessions() {
  state.fetchingSessions = true;
  state.fetchingSessionsStarted = true;
  render();
  try {
    const response = await sendPanelMessage({ type: "refresh_sessions" });
    if (response?.ok) {
      state.sessions = Array.isArray(response.sessions) ? response.sessions : [];
      state.sessionsContext = response.context || null;
      state.activeProject = "";
    } else {
      toast("error", response?.error || "Failed to fetch sessions");
    }
  } catch (error) {
    toast("error", error?.message || String(error));
  }
  state.fetchingSessions = false;
  state.chipFit = null;
  animateListOnce();
}

async function connectSession(session) {
  if (state.connectingId)
    return;
  state.connectingId = session.id;
  render();
  try {
    const response = await sendPanelMessage({ type: "connect_tab_to_session", session });
    if (!response?.ok)
      toast("error", response?.error || "Failed to connect");
  } catch (error) {
    toast("error", error?.message || String(error));
  }
  state.connectingId = null;
  render();
}

function sortedSessionGroups(sessionList) {
  const groups = [];
  const byDirectory = new Map();
  const sorted = [...(sessionList || [])].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  for (const item of sorted) {
    const dir = item.directory || "";
    let group = byDirectory.get(dir);
    if (!group) {
      group = { directory: dir, items: [] };
      byDirectory.set(dir, group);
      groups.push(group);
    }
    group.items.push(item);
  }
  groups.sort((a, b) => (b.items[0]?.updatedAt || 0) - (a.items[0]?.updatedAt || 0));
  return groups;
}

function animateListOnce() {
  state.animateList = true;
  render();
  if (state.animateListTimer)
    clearTimeout(state.animateListTimer);
  state.animateListTimer = setTimeout(() => {
    state.animateList = false;
  }, 400);
}

function sessionRowClass(item) {
  let className = "session-row";
  if (state.animateList)
    className += " anim";
  return className;
}

function sessionRowNode(item, index, linkedId) {
  const isLinked = Boolean(linkedId) && item.id === linkedId;
  return h("div", {
    className: sessionRowClass(item),
    attrs: { style: `--i:${Math.min(index, 12)}` }
  }, [
    h("button", {
      className: "session-item",
      attrs: { type: "button", title: "Connect this tab to this chat" },
      disabled: Boolean(state.connectingId),
      on: { click: () => connectSession(item) }
    }, [
      h("div", { className: "row" }, [
        h("span", { className: "session-icon", text: sessionIcon(item.id), attrs: { "aria-hidden": "true" } }),
        h("div", { className: "session-name grow", text: item.title || item.id }),
        isLinked ? h("span", { className: "linked-chip", text: "Linked" }) : null,
        state.connectingId === item.id ? h("span", { className: "session-date", text: "Connecting…" }) : null,
        h("span", { className: "session-date", text: formatRelative(item.updatedAt) })
      ])
    ]),
    item.baseUrl ? h("button", {
      className: "icon-btn session-close",
      text: "×",
      attrs: { type: "button", "aria-label": `Close session ${item.title || item.id}`, title: "Close" },
      disabled: Boolean(state.connectingId),
      on: { click: () => closeSession(item) }
    }) : null
  ]);
}

async function closeSession(session) {
  if (!session?.baseUrl || !session.id)
    return;
  try {
    const response = await sendPanelMessage({
      type: "close_session",
      sessionId: session.id,
      baseUrl: session.baseUrl
    });
    if (!response?.ok)
      toast("error", response?.error || "Failed to close session");
  } catch (error) {
    toast("error", error?.message || String(error));
  }
  await fetchSessions();
}

function sessionsNode() {
  const root = h("div", { className: "section" });
  root.appendChild(h("div", { className: "header" }, [
    h("div", { className: "row" }, [
      h("div", { className: "title", text: "Connect to a chat" })
    ]),
    h("div", { className: "row" }, [
      themeButtonNode(),
      h("button", {
        className: "icon-btn",
        attrs: { type: "button", "aria-label": "Refresh chat list", title: "Refresh chat list" },
        on: { click: fetchSessions }
      }, [icon("refresh")])
    ])
  ]));
  if (!state.fetchingSessionsStarted || state.fetchingSessions) {
    root.appendChild(h("div", { className: "hint", text: "Looking for chats…", attrs: { role: "status" } }));
    return root;
  }
  if (!Array.isArray(state.sessions) || !state.sessions.length) {
    root.appendChild(emptyStateNode());
    return root;
  }
  const sessions = state.sessions || [];
  const groups = sortedSessionGroups(sessions);
  const query = state.searchQuery.trim().toLowerCase();
  const searching = query.length > 0;
  const matches = (item) => !query
    || `${item.title || ""} ${item.directory || ""}`.toLowerCase().includes(query);
  const rows = sessions
    .filter((item) => !state.activeProject || (item.directory || "") === state.activeProject)
    .filter(matches)
    .sort((a, b) => Number(b.running === true) - Number(a.running === true) || (b.updatedAt || 0) - (a.updatedAt || 0));

  const searchRow = h("div", { className: "row" }, [
    (() => {
      const searchInput = h("input", {
        className: "search grow",
        attrs: { type: "text", placeholder: "Search chats…", "aria-label": "Search chats", spellcheck: "false", autocomplete: "off" }
      });
      searchInput.value = state.searchQuery;
      searchInput.addEventListener("input", () => {
        state.searchQuery = searchInput.value;
        render();
      });
      return searchInput;
    })()
  ]);
  root.appendChild(searchRow);
  let projectsToggle = null;
  if (false) {
    const showAllChips = state.showAllProjects || searching;
    const chipDefs = groups.map((group) => ({
      label: `${projectNameFor(group.directory)} (${group.items.length})`,
      value: group.directory
    }));
    const maxProjects = state.chipFit == null ? 3 : state.chipFit;
    let headDefs = chipDefs.slice(0, Math.min(3, groups.length));
    if (!showAllChips && groups.length > maxProjects)
      headDefs = chipDefs.slice(0, maxProjects);
    if (state.activeProject && !headDefs.some((def) => def.value === state.activeProject)) {
      const activeDef = chipDefs.find((def) => def.value === state.activeProject);
      if (activeDef)
        headDefs.push(activeDef);
    }
    const tailDefs = chipDefs.filter((def) => def.value && !headDefs.includes(def));
    const chipFor = (def) => h("button", {
      className: `chip${state.activeProject === def.value ? " active" : ""}`,
      attrs: { type: "button", "aria-pressed": state.activeProject === def.value },
      on: {
        click: () => {
          state.activeProject = state.activeProject === def.value ? "" : def.value;
          state.chipFit = null;
          render();
        }
      }
    }, [
      def.value
        ? h("span", { className: "project-dot", attrs: { style: `--dot:${projectHue(def.value)}`, "aria-hidden": "true" } })
        : null,
      h("span", { text: def.label })
    ]);
    const chipsWrap = h("div", { className: "chips-wrap" });
    let chipsClass = "chips";
    if (showAllChips)
      chipsClass += " expanded";
    else if (maxProjects === 1)
      chipsClass += " single";
    const chipsRow = h("div", { className: chipsClass });
    for (const def of headDefs)
      chipsRow.appendChild(chipFor(def));
    chipsWrap.appendChild(chipsRow);
    root.appendChild(chipsWrap);
    if (tailDefs.length || showAllChips) {
      projectsToggle = h("button", {
        className: "chip toggle",
        text: showAllChips ? "Fewer projects" : `+${tailDefs.length} project${tailDefs.length === 1 ? "" : "s"}`,
        attrs: { type: "button", "aria-expanded": String(showAllChips), "aria-label": showAllChips ? "Show recent projects only" : "Show all projects" },
        on: {
          click: () => {
            state.showAllProjects = !state.showAllProjects;
            state.chipFit = null;
            animateChipsOnce();
          }
        }
      });
    }
    if (showAllChips && tailDefs.length) {
      const moreRow = h("div", { className: `chips-more${state.animateChips ? " anim" : ""}` });
      for (const def of tailDefs)
        moreRow.appendChild(chipFor(def));
      root.appendChild(moreRow);
    }
  }
  const linkedId = state.claim?.sessionId || null;
  const listContainer = h("div", { className: "list" });
  if (searching) {
    root.appendChild(h("div", { className: "results-row" }, [
      h("span", { className: "results-label", text: "Results" }),
      h("span", { className: "results-count" }, [
        h("span", { text: rows.length ? `${rows.length} of ${sessions.length}` : "No matches" }),
        h("button", {
          className: "icon-btn search-clear",
          text: "×",
          attrs: { type: "button", "aria-label": "Clear search" },
          on: {
            click: () => {
              state.searchQuery = "";
              render();
              document.querySelector(".search")?.focus();
            }
          }
        })
      ])
    ]));
  }
  rows.forEach((item, index) => listContainer.appendChild(sessionRowNode(item, index, linkedId)));
  root.appendChild(listContainer);
  if (projectsToggle)
    root.appendChild(h("div", { className: "chips-foot" }, [projectsToggle]));
  return root;
}

function emptyStateNode() {
  const reason = state.sessionsContext?.reason;
  const content = reason === "no-sessions"
    ? {
      title: "No open chats",
      text: "An annotation server is running, but it has no open chat to connect to.",
      steps: [
        "Open OpenCode or AshleyCode in the project you want to edit",
        "Check the annotation plugin is enabled in that config",
        "Come back here and press Try again"
      ]
    }
    : {
      title: "No annotation server found",
      text: "Nothing is answering on ports 39240–39260. OpenCode starts a server through the opencode-annotate plugin.",
      steps: [
        "Add \"./plugins/opencode-annotate-repo/v2/index.js\" to \"plugins\" in your config",
        "Restart OpenCode",
        "Come back here and press Try again"
      ]
    };
  return h("div", {}, [
    h("div", { className: "empty-icon" }, [icon("plug", 16)]),
    h("div", { className: "empty-title", text: content.title }),
    h("p", { className: "empty-text", text: content.text }),
    h("ol", { className: "empty-list" }, content.steps.map((step) => h("li", { text: step }))),
    h("div", { className: "row end" }, [
      h("button", {
        className: "btn",
        text: "Try again",
        attrs: { type: "button" },
        on: { click: fetchSessions }
      })
    ])
  ]);
}

function animateChipsOnce() {
  state.animateChips = true;
  render();
  if (state.animateChipsTimer)
    clearTimeout(state.animateChipsTimer);
  state.animateChipsTimer = setTimeout(() => {
    state.animateChips = false;
  }, 400);
}

function fitProjectChips() {
  if (state.chipFit != null)
    return;
  const row = document.querySelector(".chips:not(.expanded)");
  if (!row)
    return;
  state.chipFit = 3;
  if (row.scrollWidth <= row.clientWidth + 1)
    return;
  const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
  const [allChip, ...projectChips] = row.children;
  let used = allChip.offsetWidth;
  let fit = 0;
  for (const chip of projectChips) {
    used += gap + chip.offsetWidth;
    if (used > row.clientWidth)
      break;
    fit++;
  }
  state.chipFit = Math.max(1, fit);
  render();
}
