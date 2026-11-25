import './styles.css';
import { Stage, webglAvailable } from './scene/stage';
import { ecgValue } from './scene/ecg';
import { ORGAN_ORDER, type OrganKey } from './content/groups';
import { ORGANS } from './content/organs';
import { renderNav, renderPanel, renderAbout, renderLegend, organName } from './ui/render';

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;

const canvas = $<HTMLCanvasElement>('#stage');
const nav = $<HTMLElement>('#organ-nav');
const panel = $<HTMLElement>('#panel');
const panelBody = $<HTMLElement>('#panel-body');
const grip = panel.querySelector('.panel-grip') as HTMLElement;
const hero = $<HTMLElement>('#hero');
const tooltip = $<HTMLElement>('#tooltip');
const live = $<HTMLElement>('#live');
const about = $<HTMLDialogElement>('#about');
const legend = $<HTMLDialogElement>('#legend');

renderNav(nav);
about.innerHTML = renderAbout();
legend.innerHTML = renderLegend();

const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
const mobileQuery = matchMedia('(max-width: 900px)');

let current: OrganKey | null = null;
let lastTrigger: HTMLElement | null = null;
let stage: Stage | null = null;

if (webglAvailable()) {
  stage = new Stage({
    canvas,
    reducedMotion: reduceQuery.matches,
    onHover: (organ, x, y) => {
      if (!organ) { tooltip.hidden = true; return; }
      tooltip.hidden = false;
      tooltip.textContent = organName(organ);
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    },
    onPick: (organ) => { if (organ) open(organ, null); },
  });
  reduceQuery.addEventListener('change', (e) => stage?.setReducedMotion(e.matches));
} else {
  canvas.remove();
  const p = document.createElement('p');
  p.className = 'fallback';
  p.textContent = 'Your browser cannot display the 3D body, but every organ is available from the list below.';
  document.querySelector('main')!.append(p);
}

function syncInset() {
  if (!stage) return;
  if (!current) {
    // On phones the headline sits above the figure, so frame the body below it.
    const top = mobileQuery.matches ? Math.min(0.42, (hero.getBoundingClientRect().bottom + 8) / innerHeight) : 0;
    const bottom = mobileQuery.matches ? (innerHeight - nav.getBoundingClientRect().top + 4) / innerHeight : 0.02;
    stage.setInset(0, bottom, top);
    return;
  }
  if (mobileQuery.matches) {
    const bar = document.querySelector('.topbar')!.getBoundingClientRect().bottom;
    stage.setInset(0, panel.getBoundingClientRect().height / innerHeight, bar / innerHeight);
  } else {
    const r = panel.getBoundingClientRect();
    stage.setInset((innerWidth - r.left) / innerWidth, 0);
  }
}

function open(organ: OrganKey, trigger: HTMLElement | null) {
  const wasOpen = !!current;
  current = organ;
  if (trigger) lastTrigger = trigger;
  panelBody.innerHTML = renderPanel(ORGANS[organ]);
  panelBody.scrollTop = 0;
  panel.hidden = false;
  panel.classList.remove('is-expanded');
  requestAnimationFrame(() => panel.classList.add('is-open'));
  document.body.classList.add('has-panel');
  hero.classList.add('is-hidden');
  nav.querySelectorAll<HTMLButtonElement>('.organ-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.organ === organ)));
  syncInset();
  stage?.focusOn(organ);
  history.replaceState(null, '', `#${organ}`);
  live.textContent = `${ORGANS[organ].name} selected.`;
  // Move focus into the panel for keyboard and screen-reader users, without scrolling the page.
  if (!wasOpen || trigger) (panelBody.querySelector('#panel-title') as HTMLElement | null)?.setAttribute('tabindex', '-1');
  if (trigger) (panelBody.querySelector('#panel-title') as HTMLElement | null)?.focus({ preventScroll: true });
}

function close() {
  if (!current) return;
  current = null;
  panel.classList.remove('is-open', 'is-expanded');
  document.body.classList.remove('has-panel');
  hero.classList.remove('is-hidden');
  nav.querySelectorAll('.organ-btn').forEach((b) => b.setAttribute('aria-pressed', 'false'));
  setTimeout(() => { if (!current) panel.hidden = true; }, 550);
  syncInset();
  stage?.focusOn(null);
  history.replaceState(null, '', location.pathname + location.search);
  live.textContent = 'Returned to the full body.';
  lastTrigger?.focus({ preventScroll: true });
}

nav.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-organ]');
  if (!b) return;
  const k = b.dataset.organ as OrganKey;
  if (k === current) close(); else open(k, b);
});

panelBody.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  if (t.closest('[data-close]')) { close(); return; }
  const n = t.closest<HTMLButtonElement>('[data-organ]');
  if (n) open(n.dataset.organ as OrganKey, n);
});

// Mobile sheet: tap or drag the grip to expand or collapse.
let dragStartY = 0;
let dragging = false;
grip.addEventListener('pointerdown', (e) => { dragging = true; dragStartY = e.clientY; grip.setPointerCapture(e.pointerId); });
grip.addEventListener('pointerup', (e) => {
  if (!dragging) return;
  dragging = false;
  const dy = e.clientY - dragStartY;
  if (Math.abs(dy) < 6) panel.classList.toggle('is-expanded');
  else if (dy < -30) panel.classList.add('is-expanded');
  else if (dy > 30) {
    if (panel.classList.contains('is-expanded')) panel.classList.remove('is-expanded');
    else close();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && current && !about.open && !legend.open) close();
  if (!current || about.open || legend.open) return;
  if (e.target instanceof HTMLElement && e.target.closest('input, textarea')) return;
  const i = ORGAN_ORDER.indexOf(current);
  if (e.key === 'ArrowRight') open(ORGAN_ORDER[(i + 1) % ORGAN_ORDER.length], null);
  if (e.key === 'ArrowLeft') open(ORGAN_ORDER[(i + ORGAN_ORDER.length - 1) % ORGAN_ORDER.length], null);
});

// Dialogs
document.querySelectorAll<HTMLButtonElement>('[data-open]').forEach((b) => {
  b.addEventListener('click', () => ($<HTMLDialogElement>(`#${b.dataset.open}`)).showModal());
});
for (const d of [about, legend]) {
  d.addEventListener('click', (e) => {
    if (e.target === d || (e.target as HTMLElement).closest('[data-close-dialog]')) d.close();
  });
}

window.addEventListener('resize', () => syncInset());
syncInset();

// Heart trace in the heart panel: a bone-coloured line whose leading edge carries the signal colour.
function drawEcg(c: HTMLCanvasElement, t: number) {
  const dpr = Math.min(devicePixelRatio, 2);
  const w = c.clientWidth, h = c.clientHeight;
  if (!w || !h) return;
  if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
  const g = c.getContext('2d')!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);
  g.strokeStyle = 'rgba(236,233,226,0.09)';
  g.lineWidth = 1;
  g.beginPath(); g.moveTo(0, h * 0.62 + 0.5); g.lineTo(w, h * 0.62 + 0.5); g.stroke();
  const windowS = 3.6;
  const grad = g.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, 'rgba(236,233,226,0)');
  grad.addColorStop(0.55, 'rgba(236,233,226,0.55)');
  grad.addColorStop(0.97, 'rgba(226,88,74,1)');
  g.strokeStyle = grad;
  g.lineWidth = 1.25;
  g.lineJoin = 'round';
  g.beginPath();
  let lastY = 0;
  for (let x = 0; x <= w; x += 1) {
    const ts = t - windowS + (x / w) * windowS;
    lastY = h * 0.62 - ecgValue(ts) * h * 0.52;
    if (x === 0) g.moveTo(x, lastY); else g.lineTo(x, lastY);
  }
  g.stroke();
  g.fillStyle = '#e2584a';
  g.beginPath(); g.arc(w - 1.5, lastY, 2, 0, Math.PI * 2); g.fill();
}

const t0 = performance.now();
function ecgLoop() {
  const c = panelBody.querySelector<HTMLCanvasElement>('[data-ecg]');
  if (c) drawEcg(c, reduceQuery.matches ? 2.6 : (performance.now() - t0) / 1000);
  requestAnimationFrame(ecgLoop);
}
requestAnimationFrame(ecgLoop);

// Deep links: /#heart opens the heart.
const initial = location.hash.slice(1) as OrganKey;
if (ORGAN_ORDER.includes(initial)) setTimeout(() => open(initial, null), reduceQuery.matches ? 0 : 900);

// Expose for automated visual checks.
(window as unknown as { __hudap: unknown }).__hudap = { stage, open, close };
