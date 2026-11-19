// Leonida Trophy Guide: checklist tracker for the 55 GTA VI trophies.
// Progress and the spoiler setting live in localStorage; export writes a
// JSON file and import reads one back. No network calls are made at all.
const EARNED_KEY = 'gta6-trophy-earned-v1';
const SPOILER_KEY = 'gta6-trophy-spoiler-v1';

const KIND_LABELS = {
  all: 'All kinds',
  platinum: 'Platinum',
  story: 'Story',
  side: 'Side quests',
  collectibles: 'Collectibles',
  activities: 'Activities',
  robbery: 'Robberies',
  exploration: 'Exploration',
  secrets: 'Secrets',
  misc: 'Misc',
  completion: '100% completion',
};
const KIND_ORDER = ['all', 'story', 'side', 'collectibles', 'activities', 'robbery', 'exploration', 'secrets', 'misc', 'completion', 'platinum'];

const listEl = document.getElementById('list');
const listMetaEl = document.getElementById('listMeta');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const missableOnlyEl = document.getElementById('missableOnly');
const earnedOnlyEl = document.getElementById('earnedOnly');
const spoilerEl = document.getElementById('spoiler');
const statusEl = document.getElementById('status');
const kindButtonsEl = document.getElementById('kindButtons');

let trophies = [];
let earned = new Set(readEarned());
let spoiler = readSpoiler();
let kind = 'all';
let openId = null;

function readEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

function readSpoiler() {
  return localStorage.getItem(SPOILER_KEY) === '1';
}

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
}

function showStatus(message) {
  statusEl.textContent = message;
  window.clearTimeout(showStatus.timer);
  showStatus.timer = window.setTimeout(() => { statusEl.textContent = ''; }, 4000);
}

function isMasked(trophy) {
  return spoiler && trophy.kind === 'story' && !earned.has(trophy.id);
}

function trophyCard(trophy) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(trophy.id) ? ' earned' : '');
  card.dataset.trophyId = String(trophy.id);
  const masked = isMasked(trophy);

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.checked = earned.has(trophy.id);
  check.setAttribute('aria-label', masked ? 'Mark hidden story trophy earned' : `Mark ${trophy.name} earned`);
  check.addEventListener('change', () => {
    if (check.checked) earned.add(trophy.id);
    else earned.delete(trophy.id);
    saveEarned();
    render();
  });

  const body = document.createElement('div');
  body.className = 'card-body';

  const titleRow = document.createElement('div');
  titleRow.className = 'title-row';
  const name = document.createElement('h3');
  name.textContent = masked ? 'Hidden story trophy' : trophy.name;
  const grade = document.createElement('span');
  grade.className = `grade grade-${trophy.grade}`;
  grade.textContent = trophy.grade;
  titleRow.append(name, grade);
  body.append(titleRow);

  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = masked ? 'Spoiler mode hides this story trophy until you earn it. Tick the box when you have it.' : trophy.description;
  body.append(desc);

  const tags = document.createElement('p');
  tags.className = 'tags';
  const kindTag = document.createElement('span');
  kindTag.className = 'tag kind';
  kindTag.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
  tags.append(kindTag);
  if (trophy.hidden) {
    const hiddenTag = document.createElement('span');
    hiddenTag.className = 'tag hidden-tag';
    hiddenTag.textContent = 'Hidden on PSN';
    tags.append(hiddenTag);
  }
  if (trophy.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag missable-tag';
    missTag.textContent = '⚠ Potentially missable';
    tags.append(missTag);
  }
  body.append(tags);

  if (!masked) {
    const details = document.createElement('details');
    if (openId === trophy.id) details.open = true;
    const summary = document.createElement('summary');
    summary.textContent = 'Guide';
    details.append(summary);
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = trophy.guide;
    details.append(guide);
    const sources = document.createElement('p');
    sources.className = 'sources';
    sources.textContent = 'Sources: ';
    (trophy.sources ?? []).forEach((source, i) => {
      if (i > 0) sources.append(document.createTextNode(' · '));
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.name;
      link.target = '_blank';
      link.rel = 'noopener';
      sources.append(link);
    });
    details.append(sources);
    body.append(details);
  }

  card.append(check, body);
  return card;
}

function visibleTrophies() {
  const query = searchEl.value.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (kind !== 'all' && trophy.kind !== kind) return false;
    if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
    if (missableOnlyEl.checked && !trophy.missable) return false;
    if (earnedOnlyEl.checked && !earned.has(trophy.id)) return false;
    if (query && !(trophy.name.toLowerCase().includes(query) || trophy.description.toLowerCase().includes(query))) return false;
    return true;
  });
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('progressBig').textContent = `${done} / ${total}`;
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('progressText').textContent = `${done} of ${total} earned · ${pct}%`;
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] ?? { done: 0, total: 0 };
    byGrade[t.grade].total += 1;
    if (earned.has(t.id)) byGrade[t.grade].done += 1;
  }
  document.getElementById('gradeCounts').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${byGrade[g].done}/${byGrade[g].total} ${g}`)
    .join(' · ');
}

function renderKindButtons() {
  kindButtonsEl.replaceChildren();
  for (const key of KIND_ORDER) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'kind-btn' + (kind === key ? ' active' : '');
    button.textContent = KIND_LABELS[key];
    button.setAttribute('aria-pressed', kind === key ? 'true' : 'false');
    button.addEventListener('click', () => {
      kind = key;
      render();
    });
    kindButtonsEl.append(button);
  }
}

function render() {
  renderProgress();
  renderKindButtons();
  const shown = visibleTrophies();
  listEl.replaceChildren(...shown.map(trophyCard));
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  listMetaEl.textContent = shown.length === total
    ? `Showing all ${total} trophies · ${done} earned`
    : `Showing ${shown.length} of ${total} trophies · ${done} earned`;
}

function exportProgress() {
  const payload = {
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b).map((id) => trophies.find((t) => t.id === id)?.name).filter(Boolean),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  showStatus(`Exported ${payload.earned.length} earned trophies.`);
}

async function importProgress(file) {
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const byName = new Map(trophies.map((t) => [t.name, t.id]));
    const next = new Set();
    let unknown = 0;
    for (const name of names) {
      if (byName.has(name)) next.add(byName.get(name));
      else unknown += 1;
    }
    earned = next;
    saveEarned();
    render();
    showStatus(unknown ? `Imported ${next.size} trophies (${unknown} unknown names skipped).` : `Imported ${next.size} earned trophies.`);
  } catch {
    showStatus('Import failed: that file is not a progress export from this guide.');
  }
}

// Read screenshot / deep-link parameters from the URL. These only change
// what this page shows; they never write to localStorage.
function applyUrlParams() {
  const params = new URLSearchParams(location.search);
  if (params.get('spoiler') === '1') {
    spoiler = true;
    spoilerEl.checked = true;
  }
  if (params.get('kind') && KIND_LABELS[params.get('kind')]) kind = params.get('kind');
  if (params.get('grade') && ['platinum', 'gold', 'silver', 'bronze'].includes(params.get('grade'))) gradeEl.value = params.get('grade');
  if (params.get('missable') === '1') missableOnlyEl.checked = true;
  if (params.get('demo') === '1') {
    for (const id of [2, 3, 4, 8, 15, 21]) earned.add(id);
    openId = 28;
  }
  if (params.get('open')) {
    const id = Number(params.get('open'));
    if (Number.isInteger(id)) openId = id;
  }
  if (params.get('roadmap') === '1') {
    document.getElementById('roadmap').scrollIntoView();
  }
}

document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) importProgress(file);
  event.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (window.confirm('Clear all earned trophies?')) {
    earned = new Set();
    saveEarned();
    render();
    showStatus('Progress cleared.');
  }
});
spoilerEl.addEventListener('change', () => {
  spoiler = spoilerEl.checked;
  saveSpoiler();
  render();
});
for (const el of [searchEl, gradeEl, missableOnlyEl, earnedOnlyEl]) {
  el.addEventListener('input', render);
  el.addEventListener('change', render);
}

const doc = await (await fetch('data/trophies.json')).json();
trophies = doc.trophies;
spoilerEl.checked = spoiler;
applyUrlParams();
render();
