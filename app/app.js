// Leonida Trophy Atlas: loads the trophy data, renders the tracker, and keeps
// progress in the browser. Nothing here talks to the network except the one
// fetch of the app's own data file; source links open only when clicked.
const EARNED_KEY = 'gta6-trophy-atlas-v1';
const SPOILER_KEY = 'gta6-trophy-atlas-spoiler';
const KINDS = [
  ['all', 'All kinds'],
  ['story', 'Story'],
  ['missable', 'Missable'],
  ['quest', 'Side quests'],
  ['activity', 'Activities'],
  ['collectible', 'Collectibles'],
  ['robbery', 'Robbery'],
  ['exploration', 'Exploration'],
  ['combat', 'Combat'],
  ['money', 'Money'],
  ['misc', 'Misc'],
];
const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const DEMO_EARNED = [2, 3, 4, 8, 15, 16, 21, 28, 31, 35, 42, 55];

const listEl = document.getElementById('trophyList');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('gradeFilter');
const statusEl = document.getElementById('statusFilter');
const missableEl = document.getElementById('missableOnly');
const spoilerEl = document.getElementById('spoilerGuard');
const chipsEl = document.getElementById('kindChips');
const showingEl = document.getElementById('showingCount');

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const demoMode = shot !== null;

let doc = null;
let earned = loadEarned();
let spoilerGuard = loadSpoilerGuard();
let activeKind = 'all';

if (shot === 'spoilers') spoilerGuard = true;

function trophyName(id) {
  const found = (doc?.trophies ?? []).find((t) => t.id === id);
  return found ? found.name : '';
}

function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((x) => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

function loadSpoilerGuard() {
  return localStorage.getItem(SPOILER_KEY) === '1';
}

function saveEarned() {
  if (demoMode) return;
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
}

function saveSpoilerGuard() {
  if (demoMode) return;
  localStorage.setItem(SPOILER_KEY, spoilerGuard ? '1' : '0');
}

function sourceUrl(label) {
  const found = (doc?.sources ?? []).find((s) => s.label === label);
  return found ? found.url : null;
}

function renderProgress() {
  const total = doc.trophies.length;
  const done = doc.trophies.filter((t) => earned.has(t.name)).length;
  document.getElementById('earnedCount').textContent = done;
  document.getElementById('progressFill').style.width = `${Math.round((done / total) * 100)}%`;
  const byGrade = {};
  for (const grade of Object.keys(GRADE_LABELS)) {
    const have = doc.trophies.filter((t) => t.grade === grade && earned.has(t.name)).length;
    const all = doc.trophies.filter((t) => t.grade === grade).length;
    byGrade[grade] = `${have}/${all}`;
  }
  document.getElementById('gradeCounts').innerHTML =
    Object.entries(byGrade).map(([g, v]) => `<span><b>${v}</b> ${GRADE_LABELS[g].toLowerCase()}</span>`).join('');
  document.getElementById('progressNote').textContent =
    done === total
      ? 'Platinum earned — you are a Leonida Legend.'
      : done === 0
        ? 'Tick a trophy to save it in this browser.'
        : `${total - done} to go. Progress is saved in this browser; export it to keep a backup.`;
}

function renderRoadmap() {
  const host = document.getElementById('roadmap');
  host.replaceChildren();
  for (const stage of doc.roadmap) {
    const card = document.createElement('article');
    card.className = 'stage';
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = `Stage ${stage.stage}`;
    const title = document.createElement('h3');
    title.textContent = stage.title;
    const hours = document.createElement('p');
    hours.className = 'hours';
    hours.textContent = stage.hours;
    const text = document.createElement('p');
    text.textContent = stage.text;
    const items = document.createElement('ul');
    for (const item of stage.items) {
      const li = document.createElement('li');
      li.textContent = item;
      items.append(li);
    }
    card.append(num, title, hours, text, items);
    host.append(card);
  }
}

function renderSources() {
  const host = document.getElementById('sourceList');
  host.replaceChildren();
  for (const source of doc.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = source.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = source.label;
    li.append(a);
    host.append(li);
  }
  const notes = document.getElementById('notesList');
  notes.replaceChildren();
  for (const note of doc.notes) {
    const li = document.createElement('li');
    li.textContent = note;
    notes.append(li);
  }
}

function trophyVisible(t) {
  if (activeKind === 'missable' && !t.missable) return false;
  if (activeKind !== 'all' && activeKind !== 'missable' && t.kind !== activeKind) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (statusEl.value === 'earned' && !earned.has(t.name)) return false;
  if (statusEl.value === 'remaining' && earned.has(t.name)) return false;
  if (missableEl.checked && !t.missable) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide} ${t.kind}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function buildCard(t) {
  const card = document.createElement('article');
  card.className = 'trophy';
  card.id = `trophy-${t.id}`;
  const isEarned = earned.has(t.name);
  if (isEarned) card.classList.add('earned');
  const hiddenBySpoiler = spoilerGuard && t.story && !isEarned;
  if (hiddenBySpoiler) card.classList.add('spoiler-hidden');

  const top = document.createElement('div');
  top.className = 'trophy-top';
  const checkWrap = document.createElement('label');
  checkWrap.className = 'trophy-check';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned;
  box.setAttribute('aria-label', `Earned: ${t.name}`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    saveEarned();
    renderAll();
  });
  checkWrap.append(box);
  const head = document.createElement('div');
  head.className = 'trophy-head';
  const name = document.createElement('div');
  name.className = 'trophy-name';
  name.textContent = t.name;
  head.append(name);
  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${t.grade}`;
  badge.textContent = GRADE_LABELS[t.grade];
  top.append(checkWrap, head, badge);

  const official = document.createElement('p');
  official.className = 'official';
  const officialLabel = document.createElement('span');
  officialLabel.className = 'label';
  officialLabel.textContent = 'Official description';
  official.append(officialLabel, document.createTextNode(t.description));

  const tags = document.createElement('div');
  tags.className = 'tags';
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = t.kind;
  tags.append(kindTag);
  const stageTag = document.createElement('span');
  stageTag.className = 'tag';
  stageTag.textContent = `Roadmap stage ${t.stage}`;
  tags.append(stageTag);
  if (t.missable) {
    const miss = document.createElement('span');
    miss.className = 'tag missable';
    miss.textContent = '⚠ Missable';
    tags.append(miss);
  }
  if (t.guide.startsWith('UNCONFIRMED')) {
    const unc = document.createElement('span');
    unc.className = 'tag unconfirmed';
    unc.textContent = 'Method unconfirmed';
    tags.append(unc);
  }

  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = t.guide;

  const sources = document.createElement('p');
  sources.className = 'sources';
  sources.append(document.createTextNode('Sources: '));
  t.sources.forEach((label, i) => {
    if (i > 0) sources.append(document.createTextNode(' · '));
    const url = sourceUrl(label);
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = label;
      sources.append(a);
    } else {
      sources.append(document.createTextNode(label));
    }
  });

  const spoilerNote = document.createElement('p');
  spoilerNote.className = 'spoiler-note';
  spoilerNote.textContent = '🔒 Story trophy — hidden by Spoiler Guard until you earn it. Tick the box to reveal it.';

  card.append(top, official, tags, guide, sources, spoilerNote);
  return card;
}

function renderList() {
  listEl.replaceChildren();
  const shown = doc.trophies.filter(trophyVisible);
  for (const t of shown) listEl.append(buildCard(t));
  if (shown.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No trophies match these filters. Clear the search or pick another kind.';
    listEl.append(empty);
  }
  showingEl.textContent = `Showing ${shown.length} of ${doc.trophies.length}`;
}

function renderChips() {
  chipsEl.replaceChildren();
  for (const [value, label] of KINDS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = label;
    chip.setAttribute('aria-pressed', String(activeKind === value));
    chip.addEventListener('click', () => {
      activeKind = value;
      renderChips();
      renderList();
    });
    chipsEl.append(chip);
  }
}

function renderAll() {
  renderProgress();
  renderList();
}

function exportProgress() {
  const payload = {
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('expected a list of trophy names');
    const known = new Set(doc.trophies.map((t) => t.name));
    const kept = names.filter((n) => typeof n === 'string' && known.has(n));
    earned = new Set(kept);
    saveEarned();
    renderAll();
  } catch {
    showingEl.textContent = 'That file could not be imported — it is not a progress export from this guide.';
  }
}

async function boot() {
  try {
    const res = await fetch('data/trophies.json');
    doc = await res.json();
  } catch {
    listEl.innerHTML = '<div class="empty">The trophy data could not be loaded. Reopen the guide from its own files.</div>';
    return;
  }
  spoilerEl.checked = spoilerGuard;
  if (shot === 'checklist') earned = new Set(DEMO_EARNED.map((id) => trophyName(id)));
  renderRoadmap();
  renderSources();
  renderChips();
  renderAll();

  searchEl.addEventListener('input', renderList);
  gradeEl.addEventListener('change', renderList);
  statusEl.addEventListener('change', renderList);
  missableEl.addEventListener('change', renderList);
  spoilerEl.addEventListener('change', () => {
    spoilerGuard = spoilerEl.checked;
    saveSpoilerGuard();
    renderList();
  });
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) importProgress(file);
    e.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies? This cannot be undone.')) {
      earned = new Set();
      saveEarned();
      renderAll();
    }
  });

  if (shot === 'guide') {
    const card = document.getElementById('trophy-28');
    if (card) {
      card.classList.add('highlight');
      window.scrollTo({ top: card.offsetTop - 12, behavior: 'instant' });
    }
  } else if (shot === 'roadmap') {
    const panel = document.getElementById('roadmapPanel');
    window.scrollTo({ top: panel.offsetTop - 12, behavior: 'instant' });
  } else if (shot === 'spoilers') {
    const panel = document.getElementById('controlsPanel');
    window.scrollTo({ top: panel.offsetTop - 12, behavior: 'instant' });
  }
}

boot();
