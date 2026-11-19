// main.js — boot, routing and wiring for Leonida Platinum.
//
// The page is one static file plus its own data: it fetches only
// ./data/trophies.json, its own file, and makes no other network request.
// Views switch on ?view= (checklist | roadmap | missables | nextup | guide),
// a guide opens on ?view=guide&id=N, and ?demo=1 seeds a fixed 13 earned
// trophies in memory only, for screenshots.

import {
  loadState,
  saveState,
  hasSavedState,
  toggleEarned,
  setNote,
  exportState,
  parseImported,
  resetState,
  DEMO_EARNED_IDS,
} from './store.js';
import { gradeCounts } from './filters.js';
import { renderChecklist, renderRoadmap, renderMissables, renderNextUp, renderDetail } from './views.js';

const params = new URLSearchParams(location.search);
const demoMode = params.get('demo') === '1';

let trophies = [];
let state = loadState();
let selectedId = null;

// Demo mode seeds 13 earned trophies in memory only, and only when the
// player has no saved progress. Real progress is never overwritten.
if (demoMode && !hasSavedState()) {
  state.earned = [...DEMO_EARNED_IDS];
}

const viewEl = document.getElementById('view');
const detailEl = document.getElementById('detail');
const layoutEl = document.querySelector('.layout');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind-filter');
const gradeEl = document.getElementById('grade-filter');
const spoilerEl = document.getElementById('spoiler-toggle');
const earnedOnlyEl = document.getElementById('earned-only');
const themeEl = document.getElementById('theme-toggle');
const importFileEl = document.getElementById('import-file');

function currentView() {
  const view = params.get('view') || 'checklist';
  return ['checklist', 'roadmap', 'missables', 'nextup', 'guide'].includes(view) ? view : 'checklist';
}

function findTrophy(id) {
  return trophies.find((t) => t.id === id) || null;
}

function applyTheme() {
  document.documentElement.dataset.theme = state.settings.night ? 'night' : 'paper';
  themeEl.checked = state.settings.night;
}

function renderHeader() {
  const counts = gradeCounts(trophies, state);
  const earned = state.earned.length;
  document.getElementById('earned-count').textContent = String(earned);
  document.getElementById('progress-fill').style.width = `${Math.round((earned / 55) * 100)}%`;
  document.getElementById('grade-counts').textContent =
    `Platinum ${counts.platinum[0]}/${counts.platinum[1]} · Gold ${counts.gold[0]}/${counts.gold[1]} · Silver ${counts.silver[0]}/${counts.silver[1]} · Bronze ${counts.bronze[0]}/${counts.bronze[1]}`;
}

function renderTabs() {
  const view = currentView();
  document.querySelectorAll('#tabs .tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === view || (view === 'guide' && tab.dataset.view === 'checklist'));
  });
  document.getElementById('toolbar').style.display = view === 'checklist' ? '' : 'none';
}

function renderAll() {
  renderHeader();
  renderTabs();
  applyTheme();
  const view = currentView();
  if (view === 'roadmap') viewEl.innerHTML = renderRoadmap(trophies, state);
  else if (view === 'missables') viewEl.innerHTML = renderMissables(trophies, state);
  else if (view === 'nextup') viewEl.innerHTML = renderNextUp(trophies, state);
  else viewEl.innerHTML = renderChecklist(trophies, state);
  const selected = selectedId ? findTrophy(selectedId) : null;
  detailEl.innerHTML = selected ? renderDetail(selected, state) : '';
  layoutEl.classList.toggle('detail-hidden', !selected);
  // Keep the toolbar in sync with stored settings.
  searchEl.value = state.settings.search;
  kindEl.value = state.settings.kind;
  gradeEl.value = state.settings.grade;
  spoilerEl.checked = state.settings.spoilers;
  earnedOnlyEl.checked = state.settings.earnedOnly;
}

function goTo(view, id) {
  const next = new URLSearchParams(location.search);
  next.set('view', view);
  if (id) next.set('id', String(id));
  else next.delete('id');
  history.replaceState(null, '', `${location.pathname}?${next.toString()}`);
  params.set('view', view);
  if (id) params.set('id', String(id));
  else params.delete('id');
  selectedId = id || null;
  renderAll();
  window.scrollTo(0, 0);
}

function selectTrophy(id) {
  selectedId = id;
  const view = currentView();
  if (view !== 'checklist' && view !== 'guide') {
    goTo('guide', id);
    return;
  }
  params.set('view', 'guide');
  params.set('id', String(id));
  history.replaceState(null, '', `${location.pathname}?${params.toString()}`);
  renderAll();
}

function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function boot() {
  const response = await fetch('./data/trophies.json');
  const data = await response.json();
  trophies = data.trophies;
  const startId = Number(params.get('id'));
  if (currentView() === 'guide' && Number.isInteger(startId) && findTrophy(startId)) {
    selectedId = startId;
  }
  renderAll();
}

document.querySelectorAll('#tabs .tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    selectedId = null;
    goTo(tab.dataset.view, null);
  });
});

searchEl.addEventListener('input', () => {
  state.settings.search = searchEl.value;
  saveState(state);
  viewEl.innerHTML = renderChecklist(trophies, state);
});

kindEl.addEventListener('change', () => {
  state.settings.kind = kindEl.value;
  saveState(state);
  viewEl.innerHTML = renderChecklist(trophies, state);
});

gradeEl.addEventListener('change', () => {
  state.settings.grade = gradeEl.value;
  saveState(state);
  viewEl.innerHTML = renderChecklist(trophies, state);
});

spoilerEl.addEventListener('change', () => {
  state.settings.spoilers = spoilerEl.checked;
  saveState(state);
  renderAll();
});

earnedOnlyEl.addEventListener('change', () => {
  state.settings.earnedOnly = earnedOnlyEl.checked;
  saveState(state);
  viewEl.innerHTML = renderChecklist(trophies, state);
});

themeEl.addEventListener('change', () => {
  state.settings.night = themeEl.checked;
  saveState(state);
  applyTheme();
});

// One delegated click handler for the whole page: rows open their guide,
// checkboxes toggle earned, chips and buttons jump to a trophy.
document.addEventListener('click', (event) => {
  const earnBox = event.target.closest('[data-earn]');
  if (earnBox) {
    event.stopPropagation();
    toggleEarned(state, Number(earnBox.dataset.earn));
    renderAll();
    return;
  }
  const closer = event.target.closest('#detail-close');
  if (closer) {
    selectedId = null;
    const view = currentView();
    if (view === 'guide') goTo('checklist', null);
    else renderAll();
    return;
  }
  const saver = event.target.closest('#note-save');
  if (saver) {
    const area = document.getElementById('trophy-note');
    if (area) {
      setNote(state, Number(area.dataset.note), area.value);
      renderAll();
    }
    return;
  }
  const row = event.target.closest('[data-id]');
  if (row) selectTrophy(Number(row.dataset.id));
});

document.getElementById('export-btn').addEventListener('click', () => {
  download('leonida-platinum-progress.json', exportState(state));
});

document.getElementById('import-btn').addEventListener('click', () => importFileEl.click());

importFileEl.addEventListener('change', async () => {
  const file = importFileEl.files[0];
  if (!file) return;
  try {
    state = parseImported(await file.text());
    saveState(state);
    renderAll();
    alert('Progress imported.');
  } catch (err) {
    alert(`Could not import that file: ${err.message}`);
  }
  importFileEl.value = '';
});

document.getElementById('reset-btn').addEventListener('click', () => {
  if (!confirm('Reset all earned trophies, notes and settings?')) return;
  state = resetState();
  selectedId = null;
  renderAll();
});

boot();
