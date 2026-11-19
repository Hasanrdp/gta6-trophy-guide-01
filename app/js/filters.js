// filters.js — how the checklist is narrowed, and the spoiler rule.
//
// Kinds come from the trophy data itself. "Exploration" is a view over the
// collectible trophies (cards, WAiNK spots, vehicles, areas, garages, Scooter
// Bros), since those are the ones earned by exploring Leonida. "Missable" is
// its own filter: only the trophies flagged possible.

export const KIND_LABELS = {
  story: 'Story',
  combat: 'Combat',
  collectibles: 'Collectibles',
  activities: 'Activities',
  money: 'Money',
  social: 'Social',
  platinum: 'Platinum',
  completion: '100% completion',
};

export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

// The 13-trophy demo seed plus the spoiler rule: a hidden trophy keeps its
// name and description masked until it is earned.
export function isSpoilerHidden(trophy, state) {
  return state.settings.spoilers && trophy.hidden && !state.earned.includes(trophy.id);
}

export function filterTrophies(trophies, state) {
  const { kind, grade, search, earnedOnly } = state.settings;
  const needle = search.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (earnedOnly && !state.earned.includes(trophy.id)) return false;
    if (grade !== 'all' && trophy.grade !== grade) return false;
    if (kind === 'missable' && trophy.missable !== 'possible') return false;
    else if (kind === 'exploration' && trophy.kind !== 'collectibles') return false;
    else if (kind !== 'all' && kind !== 'missable' && kind !== 'exploration' && trophy.kind !== kind) return false;
    if (needle) {
      const hay = `${trophy.name} ${trophy.description}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

export function gradeCounts(trophies, state) {
  const out = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const trophy of trophies) {
    out[trophy.grade][1] += 1;
    if (state.earned.includes(trophy.id)) out[trophy.grade][0] += 1;
  }
  return out;
}

export function stageTrophies(trophies, stage) {
  return trophies.filter((trophy) => trophy.stage === stage).sort((a, b) => a.id - b.id);
}

export function nextUpTrophies(trophies, state, limit = 10) {
  const unearned = trophies.filter((trophy) => !state.earned.includes(trophy.id));
  unearned.sort((a, b) => a.stage - b.stage || a.id - b.id);
  return unearned.slice(0, limit);
}
