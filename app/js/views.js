// views.js — every screen of Leonida Platinum, rendered from the trophy data.
//
// Screens: checklist, roadmap, missables, next-up planner, and the per-trophy
// guide detail pane. All text comes from app/data/trophies.json; the roadmap
// stage blurbs below are this guide's own words, built from the official
// descriptions and the PowerPyx roadmap.

import { KIND_LABELS, GRADE_LABELS, isSpoilerHidden, filterTrophies, gradeCounts, stageTrophies, nextUpTrophies } from './filters.js';

export const STAGES = [
  {
    n: 1,
    title: 'Stage 1 — Story first',
    hours: '60–80 hours',
    blurb:
      'Play Chapters 1–4 and the finale in order. This is where the chapter trophies, the named story missions and the story moments live. Do the Chapter 1 meditation at Jason\u2019s house before the chapter ends — it is the only missable in the game. Keep a manual save at the end of each chapter: the game has no mission replay, and cheats disable trophies and saving, so do not touch them.',
  },
  {
    n: 2,
    title: 'Stage 2 — Side stories',
    hours: '15–25 hours',
    blurb:
      'With the story open, clear the side-story contacts: Andy, Kenton, Billy, Randy and Tyrone, each to their final mission. Add any 8 Strangers & Freaks strands you pass along the way, and take Bret\u2019s hunt when it appears. Strangers & Freaks strands are not needed for 100% completion, so treat them as a trophy of their own, not a checklist item.',
  },
  {
    n: 3,
    title: 'Stage 3 — Activities & challenges',
    hours: '30–40 hours',
    blurb:
      'The long grind stage. Gold all 42 Shooting Range challenges, win a Top Fun drone race at all 14 locations, win 20 different races, finish 50 challenges and 250 stunts, beat Cal at fishing, finish an arcade game, try all 9 activity types, and meditate at the remaining 17 spots. Do the partner trophies here too: lose a 4-star wanted level together and rob 3 shops back-to-back without losing the heat.',
  },
  {
    n: 4,
    title: 'Stage 4 — Collectibles & exploration',
    hours: '25–35 hours',
    blurb:
      'Sweep Leonida region by region: 3 Collectible Card sets, WAiNK It at 100 locations, 100 vehicles discovered, all 52 areas explored, all 8 garage properties bought, and 10 vehicles registered to the Scooter Bros app. Exploration feeds the 100% checklist directly — vehicles and areas especially — so log everything as you go.',
  },
  {
    n: 5,
    title: 'Stage 5 — Money, robberies & cleanup',
    hours: '20–30 hours',
    blurb:
      'Launder $250,000 of marked bills through your contacts, spend $100,000 across all shops, rob 5 bank vaults, an armored truck and a jewelry store undetected, rob one illegal operation per gang of 9, and clear the combat one-offs (Combat Focus, the VCIA departure, the Rhinos). Then run the 100% checklist — 200 of 277 vehicles, 100 of 255 animals, 50 of 66 weapons, 70 of 80 challenges, 300 of 397 stunts — for the A Long Road gold, and the platinum follows.',
  },
];

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function medalDot(grade) {
  return `<span class="medal ${grade}" title="${GRADE_LABELS[grade]}"></span>`;
}

function trophyTags(trophy, state) {
  const tags = [];
  tags.push(`<span class="tag">${KIND_LABELS[trophy.kind] || trophy.kind}</span>`);
  if (trophy.hidden) tags.push('<span class="tag hidden-tag">Hidden</span>');
  if (trophy.missable === 'possible') tags.push('<span class="tag missable">⚠ Missable</span>');
  if (trophy.target) {
    tags.push(`<span class="tag target">PSN target: ${trophy.targetLabel}</span>`);
  }
  if (state.notes[trophy.id]) tags.push('<span class="tag" title="You left a note on this trophy">✎ Note</span>');
  return tags.join('');
}

function trophyRow(trophy, state) {
  const earned = state.earned.includes(trophy.id);
  const hidden = isSpoilerHidden(trophy, state);
  const name = hidden ? 'Hidden trophy' : escapeHtml(trophy.name);
  const desc = hidden
    ? '<span class="spoiler-note">Hidden on PlayStation until earned — tick it off to reveal it.</span>'
    : escapeHtml(trophy.description);
  return `<li class="trophy-row${earned ? ' earned' : ''}" data-id="${trophy.id}">
    <input type="checkbox" data-earn="${trophy.id}" ${earned ? 'checked' : ''} aria-label="Mark ${escapeHtml(trophy.name)} as earned">
    ${medalDot(trophy.grade)}
    <div class="trophy-main">
      <div class="trophy-name">${name}<span class="grade-label">${GRADE_LABELS[trophy.grade]}</span></div>
      <div class="trophy-desc">${desc}</div>
      <div class="trophy-meta">${trophyTags(trophy, state)}</div>
    </div>
  </li>`;
}

export function renderChecklist(trophies, state) {
  const shown = filterTrophies(trophies, state);
  const earnedTotal = state.earned.length;
  const head = `<p class="list-summary">Showing <strong>${shown.length}</strong> of 55 trophies &middot; <strong>${earnedTotal}</strong> earned. Click a trophy to open its guide.</p>`;
  if (shown.length === 0) {
    return `${head}<p class="empty-note">No trophies match these filters. Clear the search or widen the kind and grade filters.</p>`;
  }
  return `${head}<ul class="trophy-list">${shown.map((t) => trophyRow(t, state)).join('')}</ul>`;
}

export function renderRoadmap(trophies, state) {
  const advice = `<div class="info-card">
    <h2>Before you start — read this first</h2>
    <p><strong>No mission replay.</strong> Once a story mission is done it cannot be replayed, so keep a manual save at the end of every chapter. A missed story beat means a new playthrough.</p>
    <p><strong>Cheats disable trophies — and saving.</strong> Do not use cheats on a platinum run at all; the game blocks trophies and saving while they are active.</p>
    <p><strong>One playthrough, about 200 hours, all offline.</strong> The list is 55 offline trophies and 0 online. Free-roam stays open after the story, so almost everything can be cleaned up after the finale — except the Chapter 1 meditation spot.</p>
  </div>`;
  const stages = STAGES.map((stage) => {
    const list = stageTrophies(trophies, stage.n);
    const chips = list
      .map((t) => {
        const earned = state.earned.includes(t.id);
        return `<button type="button" class="stage-chip${earned ? ' earned' : ''}" data-id="${t.id}"><span class="dot ${t.grade}"></span>${escapeHtml(t.name)}</button>`;
      })
      .join('');
    return `<section class="stage-card">
      <h2>${escapeHtml(stage.title)}<span class="hours">${stage.hours}</span></h2>
      <p>${escapeHtml(stage.blurb)}</p>
      <div class="stage-trophies">${chips}</div>
    </section>`;
  }).join('');
  return advice + stages;
}

export function renderMissables(trophies, state) {
  const missable = trophies.filter((t) => t.missable === 'possible');
  const story = trophies.filter((t) => t.kind === 'story' && t.missable !== 'possible');
  const cards = missable
    .map((t) => {
      const earned = state.earned.includes(t.id);
      return `<section class="stage-card warning-card">
      <h2>⚠ ${escapeHtml(t.name)} — the only missable trophy</h2>
      <p><strong>Official description:</strong> ${escapeHtml(t.description)}</p>
      <p>${escapeHtml(t.guide)}</p>
      <p><strong>When it can be missed:</strong> ${escapeHtml(t.missableNote)}</p>
      <p>Status: ${earned ? 'Earned — safe.' : 'Not earned yet — meditate at Jason\u2019s house before Chapter 1 ends.'}</p>
      <p><button type="button" class="btn" data-id="${t.id}">Open its full guide</button></p>
    </section>`;
    })
    .join('');
  const safeRows = story
    .map((t) => `<li class="trophy-row" data-id="${t.id}">${medalDot(t.grade)}<div class="trophy-main"><div class="trophy-name">${escapeHtml(t.name)}<span class="grade-label">${GRADE_LABELS[t.grade]}</span></div><div class="trophy-desc">${escapeHtml(t.description)}</div><div class="trophy-meta"><span class="tag">Story — cannot be missed</span></div></div></li>`)
    .join('');
  return `${cards}
  <div class="info-card">
    <h2>No other trophy is confirmed missable yet</h2>
    <p>Every other trophy on the list can be earned in free-roam after the story, or unlocks automatically as the story plays. That is the position of the guides this page cites as of 19 November 2026; if a second missable is ever confirmed, this page will say so here.</p>
  </div>
  <h2 class="serif">Story trophies — all safe</h2>
  <ul class="trophy-list">${safeRows}</ul>`;
}

export function renderNextUp(trophies, state) {
  const next = nextUpTrophies(trophies, state, 10);
  const counts = gradeCounts(trophies, state);
  const total = state.earned.length;
  const intro = `<div class="info-card">
    <h2>Your next trophies, in roadmap order</h2>
    <p>You have earned <strong>${total} of 55</strong> (Platinum ${counts.platinum[0]}/${counts.platinum[1]} &middot; Gold ${counts.gold[0]}/${counts.gold[1]} &middot; Silver ${counts.silver[0]}/${counts.silver[1]} &middot; Bronze ${counts.bronze[0]}/${counts.bronze[1]}). The planner below lists the next unearned trophies in the order the roadmap takes them, so you always know what to do next.</p>
  </div>`;
  if (next.length === 0) {
    return `${intro}<p class="empty-note">Every trophy is earned. Vice got its price — you are a Leonida Legend.</p>`;
  }
  const rows = next
    .map((t, i) => {
      const stage = STAGES.find((s) => s.n === t.stage);
      return `<li class="trophy-row" data-id="${t.id}">
      <span class="next-num">${i + 1}</span>${medalDot(t.grade)}
      <div class="trophy-main">
        <div class="trophy-name">${escapeHtml(t.name)}<span class="grade-label">${GRADE_LABELS[t.grade]}</span></div>
        <div class="trophy-desc">${escapeHtml(t.description)}</div>
        <div class="trophy-meta"><span class="tag">${escapeHtml(stage ? stage.title : '')}</span>${t.missable === 'possible' ? '<span class="tag missable">⚠ Missable — do it now</span>' : ''}${t.target ? `<span class="tag target">PSN target: ${t.targetLabel}</span>` : ''}</div>
      </div>
    </li>`;
    })
    .join('');
  return `${intro}<ul class="trophy-list">${rows}</ul>`;
}

export function renderDetail(trophy, state) {
  if (!trophy) return '';
  const earned = state.earned.includes(trophy.id);
  const hidden = isSpoilerHidden(trophy, state);
  const name = hidden ? 'Hidden trophy' : escapeHtml(trophy.name);
  const desc = hidden ? 'Hidden on PlayStation until earned.' : escapeHtml(trophy.description);
  const steps = trophy.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  const sources = trophy.sources
    .map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a>`)
    .join('');
  const missableBlock =
    trophy.missable === 'possible'
      ? `<div class="missable-callout"><strong>⚠ Missable.</strong> ${escapeHtml(trophy.missableNote)}</div>`
      : `<div class="safe-callout"><strong>Not missable.</strong> ${escapeHtml(trophy.missableNote)}</div>`;
  const note = state.notes[trophy.id] ? escapeHtml(state.notes[trophy.id]) : '';
  return `<button type="button" class="btn close-btn" id="detail-close">Close ✕</button>
  <p class="eyebrow">${GRADE_LABELS[trophy.grade]} trophy &middot; ${KIND_LABELS[trophy.kind] || trophy.kind}${trophy.hidden ? ' &middot; Hidden' : ''}</p>
  <h2>${name}</h2>
  <p class="official">Official description: “${desc}”</p>
  <p><label class="check"><input type="checkbox" data-earn="${trophy.id}" ${earned ? 'checked' : ''}> Earned</label>
  ${trophy.target ? `<span class="tag target">PSN target: ${trophy.targetLabel}</span>` : ''}</p>
  ${missableBlock}
  <h3>Guide</h3>
  <p>${escapeHtml(trophy.guide)}</p>
  <h3>Sources</h3>
  <p class="sources">Each fact above is cited to: ${sources}. The official name, description and grade come from the official list; the method from PowerPyx where one is published.</p>
  <h3>Steps</h3>
  <ol>${steps}</ol>
  <h3>Your note</h3>
  <textarea id="trophy-note" data-note="${trophy.id}" placeholder="Your own note — where you found it, what worked…">${note}</textarea>
  <p><button type="button" class="btn primary" id="note-save">Save note</button></p>`;
}
