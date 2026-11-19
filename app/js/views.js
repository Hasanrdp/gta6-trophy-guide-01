// Views — one job: turn the trophy list and the saved progress into HTML for each tab.
// Every view is a pure render from (trophies, progress, filters); events are wired by main.js.

import { gradeLetter, kindLabel, applyChecklistFilters, sortByRoadmap, nextUpTrophies } from './filters.js';

// The five roadmap stages, with the hours PowerPyx's guide implies for each.
export const ROADMAP_STAGES = [
  {
    stage: 1,
    name: 'Stage 1 — Story first',
    hours: '60–80 hours',
    blurb:
      'Play the story straight through: Chapters 1–4 and the final mission. Keep a manual save at the end of every chapter — there is no mission replay. Do the Chapter 1 meditation at Jason’s house before that chapter ends, or Positive Mental Attitude is lost for this playthrough. Cheats disable trophies AND saving, so leave them alone.',
  },
  {
    stage: 2,
    name: 'Stage 2 — Side stories',
    hours: '10–15 hours',
    blurb:
      'Finish the side-character strands — Andy, Kenton, Billy, Randy and Tyrone — plus 8 Strangers & Freaks strands and Bret’s hunt. All of it stays open in free roam after the story.',
  },
  {
    stage: 3,
    name: 'Stage 3 — Activities & challenges',
    hours: '25–35 hours',
    blurb:
      'The grind stage: 42 Shooting Range golds, drone races at all 14 locations, 250 stunts, 20 race wins, 50 challenges, arcade, fishing against Cal, bowling, and all 18 meditation spots.',
  },
  {
    stage: 4,
    name: 'Stage 4 — Collectibles & exploration',
    hours: '20–30 hours',
    blurb:
      'Sweep Leonida properly: 3 card sets, WAiNK at 100 locations, 100 vehicles, all 52 areas, 8 garages and 10 Scooter Bros registrations. One road trip can feed three trophies at once.',
  },
  {
    stage: 5,
    name: 'Stage 5 — Money, robberies & cleanup',
    hours: '15–25 hours',
    blurb:
      'Launder $250,000 of marked bills, spend $100,000, rob 5 bank vaults, an armored truck and a jewelry store undetected, hit one illegal operation per gang, then run the 100% checklist. A Long Road (gold) pops, and the platinum follows.',
  },
];

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function trophyTags(trophy) {
  const tags = [`<span class="tag">${escapeHtml(trophy.grade)}</span>`, `<span class="tag">${escapeHtml(kindLabel(trophy.kind))}</span>`];
  if (trophy.hidden) tags.push('<span class="tag hidden-tag">Hidden on PSN</span>');
  if (trophy.missable && trophy.missable !== 'no') tags.push('<span class="tag missable">Missable</span>');
  if (trophy.targetLabel) tags.push(`<span class="tag">Target: ${escapeHtml(trophy.targetLabel)}</span>`);
  return tags.join('');
}

function guideHtml(trophy) {
  const steps = (trophy.steps || []).map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  const sources = (trophy.sources || [])
    .map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a>`)
    .join('');
  const missableNote =
    trophy.missable && trophy.missable !== 'no'
      ? `<p><strong>When it can be missed:</strong> the first meditation spot, at Jason’s house in Chapter 1, is permanently unavailable after that chapter ends. Meditate there first.</p>`
      : `<p><strong>When it can be missed:</strong> it cannot — no other trophy is confirmed missable yet.</p>`;
  return `<div class="guide-body">
    <p>${escapeHtml(trophy.guide)}</p>
    ${steps ? `<ol>${steps}</ol>` : ''}
    ${missableNote}
    <p class="sources"><strong>Sources:</strong> ${sources}</p>
  </div>`;
}

export function trophyCardHtml(trophy, progress, options = {}) {
  const earned = progress.earned.includes(trophy.id);
  const spoilerOn = options.spoilerOn && trophy.hidden && !earned;
  const name = spoilerOn ? 'Hidden trophy — earn it to reveal' : escapeHtml(trophy.name);
  const desc = spoilerOn ? 'Its name and description stay secret until you earn it.' : escapeHtml(trophy.description);
  const note = progress.notes[trophy.id] || '';
  const open = options.openGuideId === trophy.id;
  return `<article class="trophy-card${earned ? ' earned' : ''}" data-id="${trophy.id}">
    <div class="trophy-head">
      <span class="medal ${escapeHtml(trophy.grade)}" title="${escapeHtml(trophy.grade)}">${gradeLetter(trophy.grade)}</span>
      <div class="trophy-title">
        <h3>${name}</h3>
        <p class="desc">${desc}</p>
        <div class="tags">${trophyTags(trophy)}</div>
      </div>
      <span class="earn-box">
        <input type="checkbox" id="earn-${trophy.id}" data-earn="${trophy.id}" ${earned ? 'checked' : ''}>
        <label for="earn-${trophy.id}">${earned ? 'Earned' : 'Earn it'}</label>
      </span>
    </div>
    <button type="button" class="guide-toggle" data-guide="${trophy.id}">${open ? 'Hide guide ▲' : 'Read the guide ▼'}</button>
    ${open ? guideHtml(trophy) : ''}
    <label class="note-label" for="note-${trophy.id}">Your note</label>
    <input type="text" class="note-input" id="note-${trophy.id}" data-note="${trophy.id}" placeholder="e.g. 31/42 range golds — retry the shotgun one" value="${escapeHtml(note)}">
  </article>`;
}

export function renderChecklist(viewEl, trophies, progress, filters, openGuideId) {
  const shown = applyChecklistFilters(trophies, filters, progress);
  const earnedCount = progress.earned.length;
  let html = `<h2>Checklist</h2>
  <p class="intro">All 55 official trophies with their PlayStation name, description and grade. Tick one off when you earn it — it is saved in your browser. Open a guide for the steps, the missable warning and the sources behind it.</p>`;
  html += shown.map((t) => trophyCardHtml(t, progress, { spoilerOn: filters.spoilerOn, openGuideId })).join('');
  if (shown.length === 0) html += '<p class="empty">No trophies match those filters. Clear the search or widen the kind and grade.</p>';
  else html += `<p class="intro">Showing ${shown.length} of 55 trophies · ${earnedCount} earned.</p>`;
  viewEl.innerHTML = html;
}

export function renderRoadmap(viewEl, trophies, progress) {
  let html = `<h2>Roadmap to the platinum</h2>
  <p class="intro">Five stages, in order. PowerPyx rates the platinum 4/10 difficulty and about 200 hours — 55 offline trophies, none online.</p>
  <div class="callout"><h3>Before you start</h3>
  <p><strong>No mission replay:</strong> keep a manual save at the end of every chapter. <strong>Cheats disable trophies and saving.</strong> <strong>One missable trophy:</strong> Positive Mental Attitude — meditate at Jason’s house in Chapter 1 before the chapter ends.</p></div>`;
  for (const stage of ROADMAP_STAGES) {
    const members = trophies.filter((t) => t.stage === stage.stage);
    const done = members.filter((t) => progress.earned.includes(t.id)).length;
    const items = sortByRoadmap(members)
      .map(
        (t) =>
          `<li class="${progress.earned.includes(t.id) ? 'done' : ''}">${escapeHtml(t.name)} <span class="tag">${escapeHtml(t.grade)}</span></li>`,
      )
      .join('');
    html += `<section class="stage-card"><h3>${escapeHtml(stage.name)} <span class="hours">· ${escapeHtml(stage.hours)} · ${done}/${members.length} earned</span></h3>
    <p>${escapeHtml(stage.blurb)}</p><ol class="stage-list">${items}</ol></section>`;
  }
  viewEl.innerHTML = html;
}

export function renderMissables(viewEl, trophies, progress) {
  const missable = trophies.filter((t) => t.missable && t.missable !== 'no');
  const story = trophies.filter((t) => t.kind === 'story');
  let html = `<h2>Missables</h2>
  <p class="intro">Only one trophy can be missed. Everything else is safe to clean up in free roam after the story.</p>
  <div class="warning"><h3>⚠ The one missable trophy</h3>
  <p><strong>Positive Mental Attitude</strong> — meditate at every spot across Leonida (18 spots).</p>
  <p>The first spot, at Jason’s house in Chapter 1, becomes permanently unavailable once Chapter 1 ends. Meditate there before the chapter closes, then find the other 17 spots in free roam.</p></div>`;
  html += missable.map((t) => trophyCardHtml(t, progress, {})).join('');
  html += `<h2>Story trophies — cannot be missed</h2>
  <p class="intro">These unlock by playing the story and its side strands. Free roam after the story keeps every side strand open, so none of them can be missed.</p>`;
  html += story.map((t) => trophyCardHtml(t, progress, {})).join('');
  viewEl.innerHTML = html;
}

export function renderNextUp(viewEl, trophies, progress) {
  const next = nextUpTrophies(trophies, progress, 8);
  let html = `<h2>Next up</h2>
  <p class="intro">The next unearned trophies in roadmap order — start at the top and work down. ${progress.earned.length} of 55 earned so far.</p>`;
  if (next.length === 0) {
    html += '<p class="empty">That is the platinum — every trophy earned. Vice got a price, and you paid it.</p>';
  } else {
    html += next.map((t) => trophyCardHtml(t, progress, {})).join('');
  }
  viewEl.innerHTML = html;
}

export function renderGuide(viewEl, trophies, progress, guideId) {
  const trophy = trophies.find((t) => t.id === guideId) || trophies[0];
  const earned = progress.earned.includes(trophy.id);
  let html = `<h2>Guide — ${escapeHtml(trophy.name)}</h2>
  <p class="intro">One trophy, in full: the official description, the guide, the steps, when it can be missed, and the sources behind every fact.</p>`;
  html += trophyCardHtml(trophy, progress, { openGuideId: trophy.id });
  html += `<p class="intro">Earned: ${earned ? 'yes' : 'not yet'}. ${trophy.targetLabel ? `PSN tracks this to ${escapeHtml(trophy.targetLabel)}.` : ''}</p>`;
  viewEl.innerHTML = html;
}
