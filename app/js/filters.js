// Trophy filters — one job: decide which trophies a view shows, from the toolbar state.
// Kind names match the kinds carried in data/trophies.json; "exploration" groups the
// collectible and exploration-flavoured kinds, and "missable" is a flag, not a kind.

export const KIND_LABELS = {
  story: 'Story',
  combat: 'Combat',
  collectibles: 'Collectibles',
  activities: 'Activities',
  money: 'Money',
  social: 'Social',
  platinum: 'Platinum',
  completion: 'Completion',
};

export function kindLabel(kind) {
  return KIND_LABELS[kind] || kind;
}

export function gradeLetter(grade) {
  return { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' }[grade] || '?';
}

// A trophy counts as "exploration" when it is about finding places or things.
export function matchesKindFilter(trophy, kindFilter) {
  if (kindFilter === 'all') return true;
  if (kindFilter === 'missable') return trophy.missable && trophy.missable !== 'no';
  if (kindFilter === 'exploration') {
    return trophy.kind === 'collectibles' || trophy.id === 42;
  }
  return trophy.kind === kindFilter;
}

export function matchesGradeFilter(trophy, gradeFilter) {
  return gradeFilter === 'all' || trophy.grade === gradeFilter;
}

export function matchesSearch(trophy, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return trophy.name.toLowerCase().includes(q) || trophy.description.toLowerCase().includes(q);
}

export function matchesEarnedOnly(trophy, earnedOnly, progress) {
  if (!earnedOnly) return true;
  return progress.earned.includes(trophy.id);
}

export function applyChecklistFilters(trophies, filters, progress) {
  return trophies.filter(
    (t) =>
      matchesKindFilter(t, filters.kind) &&
      matchesGradeFilter(t, filters.grade) &&
      matchesSearch(t, filters.query) &&
      matchesEarnedOnly(t, filters.earnedOnly, progress),
  );
}

// Roadmap order: stage first, then the trophy's id inside its stage.
export function sortByRoadmap(trophies) {
  return [...trophies].sort((a, b) => a.stage - b.stage || a.id - b.id);
}

// The next-up planner: the earliest unearned trophies in roadmap order.
export function nextUpTrophies(trophies, progress, count = 8) {
  return sortByRoadmap(trophies)
    .filter((t) => !progress.earned.includes(t.id))
    .slice(0, count);
}
