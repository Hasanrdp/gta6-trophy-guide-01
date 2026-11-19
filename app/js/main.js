// Leonida Platinum — GTA VI trophy guide and tracker.
// Loads app/data/trophies.json, keeps progress in localStorage, renders
// checklist / roadmap / missables / detail / settings from the hash route.
// No network at runtime: everything it fetches lives under app/.

const KEY = "leonida-platinum-v1";
const SEED_IDS = [2, 3, 4, 8, 9, 10, 15, 16, 21, 28, 31, 35, 42];

const KIND_LABELS = {
  story: "Story",
  side: "Side",
  collectible: "Collectible",
  activity: "Activity",
  challenge: "Challenge",
};

const STAGES = [
  {
    n: 1,
    title: "Stage 1 — Play the story",
    text: "Chapters 1 to 4, the final mission, and every story mission trophy. While you play, grab the missables that only happen during the story — the partner trophies, the VCIA departure, the showroom smash. You cannot replay the story beats, so do them when they come.",
  },
  {
    n: 2,
    title: "Stage 2 — Strangers and side stories",
    text: "The stranger strands and the open-world jobs: vaults, armored trucks, gang operations, the hunts. Finish all 8 stranger strands here, plus the final missions for Andy, Kenton, Billy, Randy and Tyrone.",
  },
  {
    n: 3,
    title: "Stage 3 — Activities and challenges",
    text: "The repeatable content: races, drone races, the shooting range, stunts, meditation, WAiNK It, challenges, and the money trophies. None of this can be missed — grind it at your own pace.",
  },
  {
    n: 4,
    title: "Stage 4 — Cleanup and the platinum",
    text: "The last collectibles and the 100% completion push: card sets, vehicles, the 52 areas of Leonida, the garage properties and the Scooter Bros registrations. When the last one pops, so does the platinum.",
  },
];

let DATA = null;

function loadStore() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && typeof s === "object") {
        return {
          earned: s.earned || {},
          spoilers: s.spoilers === true,
          theme: s.theme === "night" ? "night" : "paper",
        };
      }
    }
  } catch (e) { /* corrupt store: start fresh */ }
  return { earned: {}, spoilers: false, theme: "paper" };
}

function saveStore() {
  localStorage.setItem(KEY, JSON.stringify(store));
}

let store = loadStore();

// Screenshot seeding: ?seed=13 earns a fixed set of 13 trophies, but only
// when the tracker has never been used. Real use never has the parameter.
(function seed() {
  const params = new URLSearchParams(location.search);
  const n = parseInt(params.get("seed") || "", 10);
  if (!n || n <= 0) return;
  if (Object.keys(store.earned).length > 0) return;
  SEED_IDS.slice(0, n).forEach((id) => { store.earned[id] = true; });
  saveStore();
})();

function applyTheme() {
  document.documentElement.setAttribute("data-theme", store.theme);
}

function earnedCount() {
  return Object.values(store.earned).filter(Boolean).length;
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function medal(t) {
  const letter = { platinum: "P", gold: "G", silver: "S", bronze: "B" }[t.grade];
  return `<span class="medal ${t.grade}" title="${esc(t.grade)}">${letter}</span>`;
}

function isHiddenFromSpoilers(t) {
  return store.spoilers && t.kind === "story" && !store.earned[t.id];
}

function displayName(t) {
  return isHiddenFromSpoilers(t) ? "Story trophy — hidden" : t.name;
}

function displayDesc(t) {
  return isHiddenFromSpoilers(t)
    ? "Hidden until earned. Earn it in the game to reveal it here."
    : t.description;
}

function renderProgress() {
  const n = earnedCount();
  const total = DATA.trophies.length;
  const pct = Math.round((n / total) * 100);
  document.getElementById("progress").innerHTML =
    `<div class="bar"><div class="fill" style="width:${pct}%"></div></div>` +
    `<div class="label">${n} of ${total} trophies earned — ${pct}%${n === total ? " — Leonida Legend!" : ""}</div>`;
}

function setActiveTab(route) {
  document.querySelectorAll("#tabs a").forEach((a) => {
    a.classList.toggle("active", a.dataset.route === route);
  });
}

// ---- Checklist ----

let filter = { kind: "all", grade: "all", q: "" };

function checklistView() {
  setActiveTab("checklist");
  const view = document.getElementById("view");
  const chips = ["all", "story", "missable", "collectible", "activity", "side", "challenge"]
    .map((k) => {
      const label = k === "all" ? "All" : k === "missable" ? "Missable" : KIND_LABELS[k];
      return `<button class="chip" data-kind="${k}" aria-pressed="${filter.kind === k}">${label}</button>`;
    })
    .join("");
  const grades = ["all", "platinum", "gold", "silver", "bronze"]
    .map((g) => `<option value="${g}"${filter.grade === g ? " selected" : ""}>${g === "all" ? "All grades" : g[0].toUpperCase() + g.slice(1)}</option>`)
    .join("");
  view.innerHTML =
    `<div class="toolbar">` +
    `<input type="search" id="q" placeholder="Search trophies…" value="${esc(filter.q)}" aria-label="Search trophies">` +
    `<select id="grade" aria-label="Filter by grade">${grades}</select>` +
    `</div><div class="chips" style="margin-bottom:14px">${chips}</div>` +
    `<div class="trophy-list" id="list"></div>`;
  document.getElementById("q").addEventListener("input", (e) => {
    filter.q = e.target.value;
    renderList();
  });
  document.getElementById("grade").addEventListener("change", (e) => {
    filter.grade = e.target.value;
    renderList();
  });
  view.querySelectorAll("[data-kind]").forEach((b) => {
    b.addEventListener("click", () => {
      filter.kind = b.dataset.kind;
      view.querySelectorAll("[data-kind]").forEach((x) =>
        x.setAttribute("aria-pressed", String(x.dataset.kind === filter.kind)));
      renderList();
    });
  });
  renderList();
}

function renderList() {
  const list = document.getElementById("list");
  const q = filter.q.trim().toLowerCase();
  const rows = DATA.trophies.filter((t) => {
    if (filter.kind === "missable") { if (!t.missable) return false; }
    else if (filter.kind !== "all" && t.kind !== filter.kind) return false;
    if (filter.grade !== "all" && t.grade !== filter.grade) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
  if (rows.length === 0) {
    list.innerHTML = `<p class="empty">No trophies match that filter.</p>`;
    return;
  }
  const earnedHere = rows.filter((t) => store.earned[t.id]).length;
  list.innerHTML = `<p style="color:var(--muted);font-size:14px;margin:0 0 10px">Showing ${rows.length} of ${DATA.trophies.length} trophies — ${earnedHere} earned here.</p>` + rows.map((t) => {
    const earned = !!store.earned[t.id];
    const tags = [];
    tags.push(`<span class="tag">${KIND_LABELS[t.kind]}</span>`);
    if (t.hidden) tags.push(`<span class="tag hidden">Hidden on PSN</span>`);
    if (t.missable) tags.push(`<span class="tag missable">Missable</span>`);
    if (t.targetLabel) tags.push(`<span class="tag">${esc(t.targetLabel)}</span>`);
    if (t.chapter) tags.push(`<span class="tag">${esc(t.chapter)}</span>`);
    return `<div class="trophy${earned ? " earned" : ""}" data-nav="#/trophy/${t.id}" role="link" tabindex="0">` +
      medal(t) +
      `<div class="t-body"><div class="t-name">${esc(displayName(t))}</div>` +
      `<div class="t-desc">${esc(displayDesc(t))}</div>` +
      `<div class="t-meta">${tags.join("")}</div></div>` +
      `<button class="t-check" data-toggle="${t.id}" aria-label="${earned ? "Mark as not earned" : "Mark as earned"}" title="${earned ? "Earned — click to uncheck" : "Click to mark earned"}">${earned ? "✓" : "○"}</button>` +
      `</div>`;
  }).join("");
}

// ---- Detail ----

function detailView(id) {
  setActiveTab("checklist");
  const view = document.getElementById("view");
  const t = DATA.trophies.find((x) => x.id === id);
  if (!t) {
    view.innerHTML = `<p class="empty">No trophy with that number. <a href="#/">Back to the checklist</a>.</p>`;
    return;
  }
  const earned = !!store.earned[t.id];
  const hidden = isHiddenFromSpoilers(t);
  const idx = DATA.trophies.findIndex((x) => x.id === id);
  const prev = DATA.trophies[idx - 1];
  const next = DATA.trophies[idx + 1];
  const sourceItems = t.sources.map((s) => {
    if (s === "exophase") return `<li><a href="${DATA.sourceUrls.exophase}" target="_blank" rel="noopener">Official list — Exophase</a> (name, description, grade)</li>`;
    if (s === "psnprofiles") return `<li><a href="${DATA.sourceUrls.psnprofiles}" target="_blank" rel="noopener">PSN progress targets — PSNProfiles</a></li>`;
    return "";
  }).join("");
  view.innerHTML =
    `<article class="detail"><div class="head">${medal(t)}<div>` +
    `<h2>${esc(displayName(t))}</h2><div class="desc">${esc(displayDesc(t))}</div></div></div>` +
    `<div class="t-meta" style="margin-top:14px">` +
    `<span class="tag">${t.grade[0].toUpperCase() + t.grade.slice(1)}</span>` +
    `<span class="tag">${KIND_LABELS[t.kind]}</span>` +
    (t.hidden ? `<span class="tag hidden">Hidden on PSN</span>` : "") +
    (t.missable ? `<span class="tag missable">Missable</span>` : "") +
    (t.targetLabel ? `<span class="tag">${esc(t.targetLabel)}</span>` : "") +
    (t.chapter ? `<span class="tag">${esc(t.chapter)}</span>` : "") +
    `<span class="tag">Roadmap stage ${t.stage}</span>` +
    `</div>` +
    (t.missable ? `<div class="warn"><strong>Missable.</strong> This trophy is tied to a one-time moment or a partner. The flag is built from the official description and is not yet verified in the game — do it when the moment comes, do not assume it repeats.</div>` : "") +
    (hidden
      ? `<div class="note">This story trophy is hidden by your spoiler setting. Earn it in the game to reveal the guide here.</div>`
      : `<h3>How to earn it</h3><p>${esc(t.guide)}</p><ol>${t.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>`) +
    `<h3>Sources</h3><ul class="sources">${sourceItems}` +
    `<li>Guide: our own words from the official description, not yet checked in the game.</li></ul>` +
    `<div class="btnrow">` +
    `<button class="btn" data-toggle="${t.id}">${earned ? "✓ Earned — mark as not earned" : "Mark as earned"}</button>` +
    `<a class="btn ghost" href="#/">Back to checklist</a>` +
    (prev ? `<a class="btn ghost" href="#/trophy/${prev.id}">← ${esc(prev.name)}</a>` : "") +
    (next ? `<a class="btn ghost" href="#/trophy/${next.id}">${esc(next.name)} →</a>` : "") +
    `</div></article>`;
}

// ---- Roadmap ----

function roadmapView() {
  setActiveTab("roadmap");
  const view = document.getElementById("view");
  view.innerHTML = `<h2 style="margin-top:0">Roadmap to the platinum</h2>` +
    `<p style="color:var(--muted)">Four stages, in the order to play them. Story first — the missables only happen there — then strangers, then the repeatable grind, then cleanup.</p>` +
    STAGES.map((s) => {
      const items = DATA.trophies.filter((t) => t.stage === s.n);
      const done = items.filter((t) => store.earned[t.id]).length;
      return `<section class="stage"><h2>${esc(s.title)} — ${done}/${items.length}</h2><p>${esc(s.text)}</p><ul>` +
        items.map((t) =>
          `<li class="${store.earned[t.id] ? "done" : ""}"><a href="#/trophy/${t.id}">${esc(displayName(t))}</a>${t.missable ? " — <strong>missable</strong>" : ""}</li>`).join("") +
        `</ul></section>`;
    }).join("");
}

// ---- Missables ----

function missablesView() {
  setActiveTab("missables");
  const view = document.getElementById("view");
  const miss = DATA.trophies.filter((t) => t.missable);
  view.innerHTML = `<h2 style="margin-top:0">Missable trophies — ${miss.length}</h2>` +
    `<p style="color:var(--muted)">These are the trophies tied to a one-time moment, a story scene, or a partner. The flags are built from the official descriptions and are labelled as not yet verified in the game — the safe rule is to do each one the first time the moment comes. Everything else in the game can be done after the story.</p>` +
    `<div class="trophy-list">` +
    miss.map((t) => {
      const earned = !!store.earned[t.id];
      return `<div class="trophy${earned ? " earned" : ""}" data-nav="#/trophy/${t.id}" role="link" tabindex="0">` +
        medal(t) +
        `<div class="t-body"><div class="t-name">${esc(displayName(t))}</div>` +
        `<div class="t-desc">${esc(displayDesc(t))}</div>` +
        `<div class="t-desc" style="margin-top:6px">${esc(t.guide)}</div>` +
        `<div class="t-meta"><span class="tag missable">Missable</span><span class="tag">Roadmap stage ${t.stage}</span></div></div>` +
        `<button class="t-check" data-toggle="${t.id}" aria-label="${earned ? "Mark as not earned" : "Mark as earned"}">${earned ? "✓" : "○"}</button></div>`;
    }).join("") + `</div>`;
}

// ---- Settings ----

function settingsView() {
  setActiveTab("settings");
  const view = document.getElementById("view");
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  DATA.trophies.forEach((t) => { if (store.earned[t.id]) counts[t.grade]++; });
  const totals = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
  view.innerHTML =
    `<div class="settings"><h2 style="margin-top:0">Settings</h2>` +
    `<div class="counts">` +
    Object.keys(counts).map((g) =>
      `<div class="c"><div class="n">${counts[g]} / ${totals[g]}</div><div class="l">${g}</div></div>`).join("") +
    `</div>` +
    `<label class="row"><input type="checkbox" id="spoilers"${store.spoilers ? " checked" : ""}> Hide story trophies until earned (spoiler setting)</label>` +
    `<label class="row"><input type="checkbox" id="night"${store.theme === "night" ? " checked" : ""}> Night theme</label>` +
    `<div class="btnrow">` +
    `<button class="btn" id="export">Export progress (.json)</button>` +
    `<button class="btn ghost" id="importBtn">Import progress…</button>` +
    `<input type="file" id="importFile" accept="application/json" hidden>` +
    `<button class="btn ghost" id="reset">Reset progress</button>` +
    `</div>` +
    `<p style="color:var(--muted);font-size:14px">Progress is saved in this browser only (localStorage). Export it to keep a copy, or to move it to another device.</p>` +
    `</div>`;
  document.getElementById("spoilers").addEventListener("change", (e) => {
    store.spoilers = e.target.checked;
    saveStore();
  });
  document.getElementById("night").addEventListener("change", (e) => {
    store.theme = e.target.checked ? "night" : "paper";
    applyTheme();
    saveStore();
  });
  document.getElementById("export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "leonida-platinum-progress.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });
  document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importFile").click();
  });
  document.getElementById("importFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const s = JSON.parse(reader.result);
        if (s && typeof s.earned === "object") {
          store = {
            earned: s.earned,
            spoilers: s.spoilers === true,
            theme: s.theme === "night" ? "night" : "paper",
          };
          saveStore();
          applyTheme();
          renderProgress();
          settingsView();
        } else {
          alert("That file does not look like a Leonida Platinum export.");
        }
      } catch (err) {
        alert("Could not read that file.");
      }
    };
    reader.readAsText(file);
  });
  document.getElementById("reset").addEventListener("click", () => {
    if (confirm("Clear all earned trophies?")) {
      store.earned = {};
      saveStore();
      renderProgress();
      settingsView();
    }
  });
}

// ---- Router ----

function render() {
  const hash = location.hash.replace(/^#/, "");
  if (hash.startsWith("/trophy/")) {
    detailView(parseInt(hash.slice(8), 10));
  } else if (hash === "/roadmap") {
    roadmapView();
  } else if (hash === "/missables") {
    missablesView();
  } else if (hash === "/settings") {
    settingsView();
  } else {
    checklistView();
  }
  renderProgress();
  window.scrollTo(0, 0);
}

document.getElementById("view").addEventListener("click", (e) => {
  const toggle = e.target.closest("[data-toggle]");
  if (toggle) {
    const id = parseInt(toggle.dataset.toggle, 10);
    store.earned[id] = !store.earned[id];
    if (!store.earned[id]) delete store.earned[id];
    saveStore();
    render();
    return;
  }
  const nav = e.target.closest("[data-nav]");
  if (nav) location.hash = nav.dataset.nav;
});
document.getElementById("view").addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    const nav = e.target.closest("[data-nav]");
    if (nav) { e.preventDefault(); location.hash = nav.dataset.nav; }
  }
});
window.addEventListener("hashchange", render);

fetch("data/trophies.json")
  .then((r) => { if (!r.ok) throw new Error("trophies.json not found"); return r.json(); })
  .then((d) => { DATA = d; applyTheme(); render(); })
  .catch(() => {
    document.getElementById("view").innerHTML =
      `<p class="empty">Could not load the trophy data. Serve the app/ directory with a static server and try again.</p>`;
  });
