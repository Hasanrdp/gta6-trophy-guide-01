// Main — one job: start the app, wire the toolbar and tabs, and re-render on every change.
// The app fetches only its own data/trophies.json and keeps progress in localStorage.

import { loadProgress, saveProgress, toggleEarned, setNote, seedDemoProgress, resetProgress, exportProgressFile, parseImportedProgress } from './store.js';
import { renderChecklist, renderRoadmap, renderMissables, renderNextUp, renderGuide } from './views.js';

const viewEl = document.getElementById('view');
const searchBox = document.getElementById('searchBox');
const kindFilter = document.getElementById('kindFilter');
const gradeFilter = document.getElementById('gradeFilter');
const spoilerToggle = document.getElementById('spoilerToggle');
const earnedOnlyToggle = document.getElementById('earnedOnlyToggle');
const themeToggle = document.getElementById('themeToggle');

let trophies = [];
let progress = loadProgress();
let currentView = 'checklist';
let openGuideId = null;
let demoMode = false;

function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  if (['checklist', 'roadmap', 'missables', 'nextup', 'guide'].includes(view)) currentView = view;
  const id = Number(params.get('id'));
  if (Number.isInteger(id) && id >= 1 && id <= 55) openGuideId = id;
  demoMode = params.get('demo') === '1';
}

function gradeCounts(list) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of list) counts[t.grade] = (counts[t.grade] || 0) + 1;
  return counts;
}

function updateHeader() {
  const counts = gradeCounts(trophies);
  const hiddenCount = trophies.filter((t) => t.hidden).length;
  const earned = progress.earned.length;
  document.getElementById('counts').innerHTML =
    `<span class="count-chip"><b>${trophies.length}</b> trophies</span>` +
    `<span class="count-chip"><b>${counts.platinum}</b> platinum</span>` +
    `<span class="count-chip"><b>${counts.gold}</b> gold</span>` +
    `<span class="count-chip"><b>${counts.silver}</b> silver</span>` +
    `<span class="count-chip"><b>${counts.bronze}</b> bronze</span>` +
    `<span class="count-chip"><b>${hiddenCount}</b> hidden</span>`;
  document.getElementById('progressFill').style.width = `${Math.round((earned / trophies.length) * 100)}%`;
  document.getElementById('progressText').textContent = `${earned} of ${trophies.length} earned`;
}

function currentFilters() {
  return {
    query: searchBox.value,
    kind: kindFilter.value,
    grade: gradeFilter.value,
    spoilerOn: spoilerToggle.checked,
    earnedOnly: earnedOnlyToggle.checked,
  };
}

function render() {
  updateHeader();
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === currentView);
  });
  const filters = currentFilters();
  if (currentView === 'checklist') renderChecklist(viewEl, trophies, progress, filters, openGuideId);
  else if (currentView === 'roadmap') renderRoadmap(viewEl, trophies, progress);
  else if (currentView === 'missables') renderMissables(viewEl, trophies, progress);
  else if (currentView === 'nextup') renderNextUp(viewEl, trophies, progress);
  else if (currentView === 'guide') renderGuide(viewEl, trophies, progress, openGuideId);
}

function switchView(view) {
  currentView = view;
  if (view !== 'checklist' && view !== 'guide') openGuideId = null;
  render();
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === 'night' ? 'Paper theme' : 'Night theme';
  try {
    localStorage.setItem('leonida-platinum-theme', theme);
  } catch {
    // Theme is a nicety; a blocked store must not break the app.
  }
}

// Checkbox ticks and guide toggles are rendered fresh on every render, so one
// delegated listener on the view covers all of them.
viewEl.addEventListener('change', (event) => {
  const earnBox = event.target.closest('[data-earn]');
  if (earnBox) {
    progress = toggleEarned(progress, Number(earnBox.dataset.earn));
    render();
    return;
  }
});

viewEl.addEventListener('input', (event) => {
  const noteBox = event.target.closest('[data-note]');
  if (noteBox) {
    progress = setNote(progress, Number(noteBox.dataset.note), noteBox.value);
    updateHeader();
  }
});

viewEl.addEventListener('click', (event) => {
  const guideBtn = event.target.closest('[data-guide]');
  if (guideBtn) {
    const id = Number(guideBtn.dataset.guide);
    openGuideId = openGuideId === id ? null : id;
    if (currentView === 'guide') currentView = 'checklist';
    render();
  }
});

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => switchView(tab.dataset.view));
});

for (const control of [searchBox, kindFilter, gradeFilter, spoilerToggle, earnedOnlyToggle]) {
  control.addEventListener('input', () => {
    if (currentView !== 'checklist') currentView = 'checklist';
    render();
  });
}

themeToggle.addEventListener('click', () => {
  applyTheme(document.body.dataset.theme === 'night' ? 'paper' : 'night');
});

document.getElementById('exportBtn').addEventListener('click', () => {
  exportProgressFile(progress);
});

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const imported = parseImportedProgress(await file.text());
    progress = saveProgress(imported);
    render();
  } catch {
    alert('That file is not a Leonida Platinum progress export.');
  }
  event.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Reset all earned ticks and notes?')) {
    progress = resetProgress();
    render();
  }
});

async function startApp() {
  readUrlParams();
  const savedTheme = (() => {
    try {
      return localStorage.getItem('leonida-platinum-theme');
    } catch {
      return null;
    }
  })();
  if (savedTheme === 'night' || savedTheme === 'paper') applyTheme(savedTheme);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('night');

  const response = await fetch('./data/trophies.json');
  const data = await response.json();
  trophies = data.trophies;

  // Demo mode seeds the fixed 13 earned trophies, but only when nothing is saved yet.
  if (demoMode && progress.earned.length === 0 && Object.keys(progress.notes).length === 0) {
    progress = seedDemoProgress();
  }
  if (currentView === 'guide' && !openGuideId) openGuideId = 17;
  render();
}

startApp().catch((error) => {
  viewEl.innerHTML = `<h2>Could not load the trophy list</h2><p class="intro">The guide needs data/trophies.json beside this page. (${String(error)})</p>`;
});
