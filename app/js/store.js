// Progress store — one job: remember what the player has earned, in localStorage only.
// Nothing here touches the network. The demo seed is a fixed list, used only when the
// page is opened with ?demo=1 and no saved progress exists yet.

export const STORAGE_KEY = 'leonida-platinum-v1';

// The fixed demo set: 13 trophies, chosen to show every grade and several kinds.
export const DEMO_EARNED_IDS = [2, 3, 8, 20, 21, 33, 36, 37, 44, 45, 46, 51, 55];

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: [], notes: {} };
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n)) : [],
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
    };
  } catch {
    return { earned: [], notes: {} };
  }
}

export function saveProgress(progress) {
  const clean = {
    earned: [...new Set(progress.earned)].sort((a, b) => a - b),
    notes: Object.fromEntries(
      Object.entries(progress.notes || {}).filter(([, v]) => typeof v === 'string' && v.trim() !== ''),
    ),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  return clean;
}

export function isEarned(progress, id) {
  return progress.earned.includes(id);
}

export function toggleEarned(progress, id) {
  const next = { earned: [...progress.earned], notes: { ...progress.notes } };
  const at = next.earned.indexOf(id);
  if (at === -1) next.earned.push(id);
  else next.earned.splice(at, 1);
  return saveProgress(next);
}

export function setNote(progress, id, text) {
  const next = { earned: [...progress.earned], notes: { ...progress.notes } };
  if (text.trim() === '') delete next.notes[id];
  else next.notes[id] = text;
  return saveProgress(next);
}

export function seedDemoProgress() {
  return saveProgress({ earned: [...DEMO_EARNED_IDS], notes: {} });
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return { earned: [], notes: {} };
}

export function exportProgressFile(progress) {
  const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-platinum-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function parseImportedProgress(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('not an object');
  const earned = Array.isArray(parsed.earned) ? parsed.earned : [];
  const notes = parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {};
  return { earned: earned.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55), notes };
}
