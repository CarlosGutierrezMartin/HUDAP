import { ORGAN_ORDER, type OrganKey } from '../content/groups';
import { ORGANS, ORIGIN_HELP, ORIGIN_LABEL, LAST_REVIEWED, type Organ, type Origin } from '../content/organs';
import { FRAMEWORK, CONTEXT_SOURCES } from '../content/framework';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const ICON = {
  close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
};

export function renderNav(nav: HTMLElement) {
  nav.innerHTML = ORGAN_ORDER.map((k, i) => {
    const o = ORGANS[k];
    return `<button class="organ-btn" type="button" data-organ="${k}" aria-pressed="false" aria-controls="panel"><span aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>${esc(o.name)}</button>`;
  }).join('');
}

const ORIGIN_LEVEL: Record<Origin, number> = { consumer: 1, 'authorised-wearable': 2, clinical: 3 };
function originMark(o: Origin): string {
  const n = ORIGIN_LEVEL[o];
  const dots = [1, 2, 3].map((i) => `<b class="${i <= n ? 'on' : ''}"></b>`).join('');
  return `<span class="origin" title="${esc(ORIGIN_HELP[o])}"><i aria-hidden="true">${dots}</i>${esc(ORIGIN_LABEL[o])}</span>`;
}

export function renderPanel(organ: Organ): string {
  const sourceIndex = new Map(organ.sources.map((s, i) => [s.id, i + 1]));
  const cite = (id?: string) => {
    if (!id) return '';
    const n = sourceIndex.get(id);
    if (!n) throw new Error(`Unknown source ${id} in ${organ.key}`);
    return `<a class="cite" href="#src-${organ.key}-${n}" aria-label="Source ${n}">[${n}]</a>`;
  };
  const idx = ORGAN_ORDER.indexOf(organ.key);
  const prev = ORGANS[ORGAN_ORDER[(idx + ORGAN_ORDER.length - 1) % ORGAN_ORDER.length]];
  const next = ORGANS[ORGAN_ORDER[(idx + 1) % ORGAN_ORDER.length]];

  return `
  <div>
    <div class="p-head">
      <h2 class="p-title" id="panel-title">${esc(organ.name)}</h2>
      <button class="close" type="button" data-close aria-label="Close ${esc(organ.name)} and return to the full body">${ICON.close}</button>
    </div>
    <p class="p-lede">${esc(organ.lede)}</p>
    ${organ.key === 'heart' ? `<div class="p-ecg"><canvas data-ecg width="400" height="64" aria-hidden="true"></canvas></div>` : ''}

    <section class="p-section" aria-labelledby="h-sig">
      <h3 class="p-h" id="h-sig">Signals <span>${esc(organ.kicker.replace(/ · /g, ', ').toLowerCase())}</span></h3>
      <ul class="signals">
        ${organ.signals.map((s) => `
          <li>
            <span class="sig-name">${esc(s.name)}</span>
            <span class="sig-detail">${esc(s.detail)}</span>
            ${originMark(s.origin)}
          </li>`).join('')}
      </ul>
    </section>

    <section class="p-section" aria-labelledby="h-ai">
      <h3 class="p-h" id="h-ai">What AI does with it</h3>
      ${organ.uses.map((u) => `
        <article class="use">
          <h4>${esc(u.title)}</h4>
          <p class="use-meta"><b>${esc(u.product)}</b> · ${esc(u.status)}</p>
          <p class="use-body">${esc(u.body)}</p>
          ${u.stats.length ? `<div class="stats">${u.stats.map((s) => `
            <div class="stat"><span class="stat-v"><span class="num" data-value="${esc(s.value)}">${esc(s.value)}</span>${cite(s.source)}</span><span class="stat-l">${esc(s.label)}</span></div>`).join('')}</div>` : ''}
        </article>`).join('')}
    </section>

    <section class="p-section" aria-labelledby="h-lim">
      <h3 class="p-h" id="h-lim">Limits</h3>
      <ul class="limits">
        ${organ.limits.map((l) => `<li>${esc(l.text)}${cite(l.source)}</li>`).join('')}
      </ul>
    </section>

    <section class="p-section" aria-labelledby="h-src">
      <h3 class="p-h" id="h-src">Sources</h3>
      <ol class="sources">
        ${organ.sources.map((s, i) => `
          <li id="src-${organ.key}-${i + 1}">
            <span><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>
            <span class="src-meta">${esc(s.publisher)} · ${esc(s.kind)}</span></span>
          </li>`).join('')}
      </ol>
    </section>

    <div class="p-foot">
      <button class="p-nav" type="button" data-organ="${prev.key}"><small>Previous</small>${esc(prev.name)}</button>
      <button class="p-nav next" type="button" data-organ="${next.key}"><small>Next</small>${esc(next.name)}</button>
    </div>
  </div>`;
}

export function renderAbout(): string {
  const regions = ['European Union', 'United States'] as const;
  return `
  <div class="sheet-inner">
    <button class="close" type="button" data-close-dialog aria-label="Close">${ICON.close}</button>
    <h2 id="about-title">Method</h2>
    <p>At Medica 2026 the argument was put plainly: as AI becomes entwined with physiological data, people become “data platforms”
      (<a href="${CONTEXT_SOURCES.medica.url}" target="_blank" rel="noopener noreferrer">${CONTEXT_SOURCES.medica.publisher}</a>).
      This site maps what that means organ by organ, and where regulators on both sides of the Atlantic draw the lines.</p>
    ${regions.map((r) => `
      <h3>${r}</h3>
      <div class="fw">
        ${FRAMEWORK.filter((f) => f.region === r).map((f) => `
          <div class="fw-item">
            <h4>${esc(f.name)}</h4>
            <p>${esc(f.body)}</p>
            <a href="${esc(f.source.url)}" target="_blank" rel="noopener noreferrer">${esc(f.source.publisher)}</a>
          </div>`).join('')}
      </div>`).join('')}
    <h3>Editorial standard</h3>
    <p>Every figure links to the page it came from, preferring peer-reviewed papers, regulators and medical societies; manufacturer figures are marked as such.
      Notification, screening and triage are never presented as diagnosis. On generative AI, the World Health Organization’s guidance applies
      (<a href="${CONTEXT_SOURCES.who.url}" target="_blank" rel="noopener noreferrer">WHO, 2024</a>).</p>
    <h3>About this site</h3>
    <p>The figure is generic and generated in code; organ shapes and the heart trace are illustrative. Educational content, not medical advice. No personal data is collected. Last reviewed ${formatDate(LAST_REVIEWED)}.</p>
  </div>`;
}

export function renderLegend(): string {
  const origins: Origin[] = ['consumer', 'authorised-wearable', 'clinical'];
  return `
  <div class="sheet-inner">
    <button class="close" type="button" data-close-dialog aria-label="Close">${ICON.close}</button>
    <h2 id="legend-title">Data origin</h2>
    <p>Wearables are the widest door into health data, yet most of what they measure is wellness information. Every signal is marked on a three-step scale.</p>
    <ul class="legend-list">
      ${origins.map((o) => `<li>${originMark(o)}<p>${ORIGIN_HELP[o]}</p></li>`).join('')}
    </ul>
  </div>`;
}

export function organName(k: OrganKey) {
  return ORGANS[k].name;
}
