// store.js — saved progress for Leonida Platinum.
//
// Everything lives in one localStorage key so the whole state can be exported
// and imported as a single JSON file. Nothing leaves the browser.

export const STORAGE_KEY = 'leonida-platinum-v1';

// The demo seed: a fixed set of 13 trophies used only when the page is opened
// with ?demo=1 and no saved progress exists. It is never written to storage,
// so real players always start at zero.
export const DEMO_EARNED_IDS = [2, 3, 8, 20, 21, 33, 36, 37, 44, 45, 46, 51, 55];

export function blankState() {
  return {
    earned: [],
    notes: {},
    settings: { spoilers: true, earnedOnly: false, night: false, kind: 'all', grade: 'all', search: '' },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.earned)) return blankState();
    const state = blankState();
    state.earned = parsed.earned.filter((id) => Number.isInteger(id));
    state.notes = parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {};
    state.settings = { ...state.settings, ...(parsed.settings || {}) };
    return state;
  } catch {
    return blankState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function hasSavedState() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function isEarned(state, id) {
  return state.earned.includes(id);
}

export function toggleEarned(state, id) {
  const at = state.earned.indexOf(id);
  if (at === -1) state.earned.push(id);
  else state.earned.splice(at, 1);
  state.earned.sort((a, b) => a - b);
  saveState(state);
  return state;
}

export function setNote(state, id, text) {
  const clean = String(text || '').trim();
  if (clean) state.notes[id] = clean;
  else delete state.notes[id];
  saveState(state);
  return state;
}

export function exportState(state) {
  return JSON.stringify(
    { app: 'leonida-platinum', version: 1, exportedAt: new Date().toISOString(), ...state },
    null,
    2,
  );
}

export function parseImported(text) {
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.earned)) throw new Error('Not a Leonida Platinum export: no earned list.');
  const state = blankState();
  state.earned = parsed.earned.filter((id) => Number.isInteger(id));
  state.notes = parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {};
  state.settings = { ...state.settings, ...(parsed.settings || {}) };
  return state;
}

export function resetState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: the in-memory state is reset by the caller.
  }
  return blankState();
}
