/**
 * Fleet scroll container — Humble World Map Scroll Appear/Disappear
 *
 * Usage (any game deploy):
 *   import { mountScrollContainer, openScroll, closeScroll, SCROLL_BASE } from './ui-scroll-container.js';
 *   const api = mountScrollContainer(hostEl, { autoOpen: true });
 *   await api.close(); // plays disappear
 *
 * SSOT: /ui/scroll/manifest.json · css/ui-scroll-container.css
 * Do not invent a second open/close chrome pack.
 */

export const SCROLL_BASE_LOCAL = '/ui/scroll';
export const SCROLL_BASE_CDN = 'https://assets.grudge-studio.com/ui/scroll';

/** Prefer same-origin Pages assets; CDN when cross-app. */
export function resolveScrollBase(preferred) {
  if (preferred) return preferred.replace(/\/$/, '');
  // info.grudge-studio.com ships /ui/scroll with the site
  if (typeof location !== 'undefined' && /grudge-studio\.com|localhost|127\.0\.0\.1/.test(location.host)) {
    return SCROLL_BASE_LOCAL;
  }
  return SCROLL_BASE_CDN;
}

const APPEAR_FRAMES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const DISAPPEAR_FRAMES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

function frameUrl(base, dir, i) {
  return `${base}/${dir}/${i}.png`;
}

/**
 * Preload sequence images (call once per page).
 * @returns {Promise<HTMLImageElement[]>}
 */
export function preloadScrollFrames(base = resolveScrollBase(), dirs = ['appear', 'disappear']) {
  const urls = [];
  for (const dir of dirs) {
    const frames = dir === 'disappear' ? DISAPPEAR_FRAMES : APPEAR_FRAMES;
    for (const i of frames) urls.push(frameUrl(base, dir, i));
  }
  urls.push(`${base}/open.png`, `${base}/closed.png`);
  return Promise.all(
    urls.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(img);
          img.src = src;
        }),
    ),
  );
}

/**
 * Play a numbered PNG sequence into an <img>.
 * @param {HTMLImageElement} imgEl
 * @param {string} base
 * @param {'appear'|'disappear'} dir
 * @param {{ fps?: number, onFrame?: (i:number)=>void }} opts
 */
export async function playScrollSequence(imgEl, base, dir, opts = {}) {
  const fps = opts.fps ?? 14;
  const frames = dir === 'disappear' ? DISAPPEAR_FRAMES : APPEAR_FRAMES;
  const dt = 1000 / fps;
  for (const i of frames) {
    imgEl.src = frameUrl(base, dir, i);
    opts.onFrame?.(i);
    await sleep(dt);
  }
}

/**
 * Upgrade a host element into a scroll shell.
 * Host keeps existing children → moved into .scroll-content.
 *
 * @param {HTMLElement} host
 * @param {{
 *   base?: string,
 *   autoOpen?: boolean,
 *   compact?: boolean,
 *   fps?: number,
 *   contentRevealAt?: number,  // 0–1 fraction of appear before content fades in
 *   className?: string,
 * }} opts
 */
export function mountScrollContainer(host, opts = {}) {
  if (!host) throw new Error('mountScrollContainer: host required');
  if (host.dataset.scrollMounted === '1') {
    return host._scrollApi;
  }

  const base = resolveScrollBase(opts.base);
  const fps = opts.fps ?? 14;
  const contentRevealAt = opts.contentRevealAt ?? 0.72;

  host.classList.add('scroll-shell');
  if (opts.compact) host.classList.add('scroll-compact');
  if (opts.className) host.classList.add(...String(opts.className).split(/\s+/).filter(Boolean));
  host.style.setProperty('--scroll-open-url', `url('${base}/open.png')`);
  host.style.setProperty('--scroll-closed-url', `url('${base}/closed.png')`);
  host.dataset.scrollMounted = '1';
  host.dataset.scrollState = 'closed';

  // Move existing children into content well
  const content = document.createElement('div');
  content.className = 'scroll-content';
  while (host.firstChild) content.appendChild(host.firstChild);

  const fx = document.createElement('div');
  fx.className = 'scroll-fx';
  fx.setAttribute('aria-hidden', 'true');
  const fxImg = document.createElement('img');
  fxImg.alt = '';
  fxImg.decoding = 'async';
  fx.appendChild(fxImg);

  host.appendChild(fx);
  host.appendChild(content);

  let busy = false;
  let open = false;

  async function openScroll(force = false) {
    if (busy && !force) return;
    if (open && !force) return;
    busy = true;
    host.classList.add('is-animating');
    host.classList.remove('is-open', 'is-closed');
    host.dataset.scrollState = 'opening';

    if (prefersReducedMotion()) {
      host.classList.remove('is-animating');
      host.classList.add('is-open');
      host.dataset.scrollState = 'open';
      open = true;
      busy = false;
      host.dispatchEvent(new CustomEvent('scroll:open', { bubbles: true }));
      return;
    }

    const total = APPEAR_FRAMES.length;
    const revealFrame = Math.floor(total * contentRevealAt);
    try {
      await playScrollSequence(fxImg, base, 'appear', {
        fps,
        onFrame(i) {
          if (i >= revealFrame) {
            host.classList.add('is-open');
          }
        },
      });
    } catch (e) {
      console.warn('[scroll-container] appear failed', e);
    }
    host.classList.remove('is-animating');
    host.classList.add('is-open');
    host.classList.remove('is-closed');
    host.dataset.scrollState = 'open';
    open = true;
    busy = false;
    host.dispatchEvent(new CustomEvent('scroll:open', { bubbles: true }));
  }

  async function closeScroll(force = false) {
    if (busy && !force) return;
    if (!open && !force) return;
    busy = true;
    host.classList.add('is-animating');
    host.classList.remove('is-open');
    host.dataset.scrollState = 'closing';

    if (prefersReducedMotion()) {
      host.classList.remove('is-animating');
      host.classList.add('is-closed');
      host.dataset.scrollState = 'closed';
      open = false;
      busy = false;
      host.dispatchEvent(new CustomEvent('scroll:close', { bubbles: true }));
      return;
    }

    try {
      await playScrollSequence(fxImg, base, 'disappear', { fps });
    } catch (e) {
      console.warn('[scroll-container] disappear failed', e);
    }
    host.classList.remove('is-animating', 'is-open');
    host.classList.add('is-closed');
    host.dataset.scrollState = 'closed';
    open = false;
    busy = false;
    host.dispatchEvent(new CustomEvent('scroll:close', { bubbles: true }));
  }

  /** Instant open (no anim) — for tab re-renders that already showed open chrome */
  function snapOpen() {
    host.classList.remove('is-animating', 'is-closed');
    host.classList.add('is-open');
    host.dataset.scrollState = 'open';
    open = true;
  }

  const api = {
    el: host,
    content,
    base,
    open: openScroll,
    close: closeScroll,
    snapOpen,
    isOpen: () => open,
    isBusy: () => busy,
    preload: () => preloadScrollFrames(base),
  };
  host._scrollApi = api;

  if (opts.autoOpen !== false) {
    // Start closed visually, then open
    host.classList.add('is-closed');
    queueMicrotask(() => openScroll());
  }

  return api;
}

/**
 * Tab-friendly: if already mounted, re-open (or snap) without rebuilding DOM.
 * @param {HTMLElement} host
 * @param {{ animate?: boolean }} opts
 */
export async function ensureScrollOpen(host, opts = {}) {
  if (!host) return null;
  if (host.dataset.scrollMounted !== '1') {
    return mountScrollContainer(host, { autoOpen: true });
  }
  const api = host._scrollApi;
  if (!api) return mountScrollContainer(host, { autoOpen: true });
  if (opts.animate === false) api.snapOpen();
  else if (!api.isOpen()) await api.open();
  return api;
}

export default {
  mountScrollContainer,
  ensureScrollOpen,
  preloadScrollFrames,
  playScrollSequence,
  resolveScrollBase,
  SCROLL_BASE_LOCAL,
  SCROLL_BASE_CDN,
};
