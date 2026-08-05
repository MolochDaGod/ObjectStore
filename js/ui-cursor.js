/**
 * Fleet cursor SSOT — Kenney Cursor Pack (CC0)
 * Manifest: /ui/cursors/manifest.json
 *
 *   import { setCursorIntent, bindCursorContext, CURSOR_BASE } from './ui-cursor.js';
 *   setCursorIntent('attack');
 *   bindCursorContext(document.body, (el) => el.dataset.cursor || 'default');
 */

export const CURSOR_BASE_LOCAL = '/ui/cursors';
export const CURSOR_BASE_CDN = 'https://assets.grudge-studio.com/ui/cursors';

/** Intent → Kenney file basename (no path / extension) */
export const CURSOR_INTENTS = {
  default: 'pointer_b',
  pointer: 'pointer_b',
  pointer_toon: 'pointer_toon_a',
  pointer_scifi: 'pointer_scifi_a',
  hand_open: 'hand_open',
  hand_closed: 'hand_closed',
  hand_point: 'hand_point',
  gauntlet: 'gauntlet_default',
  busy: 'busy_hourglass',
  busy_spin: 'busy_circle',
  disabled: 'cursor_disabled',
  help: 'cursor_help',
  menu: 'cursor_menu',
  target: 'target_a',
  target_round: 'target_round_a',
  look: 'look_a',
  talk: 'message_round',
  attack: 'tool_sword_a',
  harvest: 'tool_axe',
  mine: 'tool_pickaxe',
  build: 'tool_hammer',
  magic: 'tool_wand',
  bow: 'tool_bow',
  inspect: 'zoom',
  zoom_in: 'zoom_in',
  zoom_out: 'zoom_out',
  move: 'navigation_n',
  door: 'door_enter',
  lock: 'lock',
  unlock: 'lock_unlocked',
  copy: 'cursor_copy',
  alias: 'cursor_alias',
  resize_h: 'resize_horizontal',
  resize_v: 'resize_vertical',
  rotate: 'rotate_cw',
  crosshair: 'cross_small',
  party_select: 'pointer_c',
  command: 'cursor_menu',
  none: 'cursor_none',
};

/** Hotspot [x,y] — approximate for 32px Kenney pointers */
const HOTSPOT = {
  default: [4, 2],
  pointer: [4, 2],
  pointer_toon: [4, 2],
  pointer_scifi: [4, 2],
  hand_open: [12, 4],
  hand_closed: [12, 4],
  hand_point: [8, 2],
  gauntlet: [8, 2],
  busy: [16, 16],
  busy_spin: [16, 16],
  target: [16, 16],
  target_round: [16, 16],
  crosshair: [16, 16],
  attack: [8, 8],
  harvest: [8, 8],
  mine: [8, 8],
  magic: [8, 8],
  bow: [8, 8],
  none: [0, 0],
};

let _base = CURSOR_BASE_LOCAL;
let _variant = 'outline'; // better on dark Grudge UIs
let _current = 'default';

export function resolveCursorBase(preferred) {
  if (preferred) return preferred.replace(/\/$/, '');
  if (typeof location !== 'undefined' && /grudge-studio\.com|localhost|127\.0\.0\.1/.test(location.host)) {
    return CURSOR_BASE_LOCAL;
  }
  return CURSOR_BASE_CDN;
}

export function configureCursors(opts = {}) {
  if (opts.base) _base = resolveCursorBase(opts.base);
  if (opts.variant === 'basic' || opts.variant === 'outline') _variant = opts.variant;
}

export function cursorUrl(intent = 'default') {
  const file = CURSOR_INTENTS[intent] || CURSOR_INTENTS.default;
  return `${_base}/${_variant}/${file}.png`;
}

export function cursorCssValue(intent = 'default') {
  const [hx, hy] = HOTSPOT[intent] || HOTSPOT.default;
  const url = cursorUrl(intent);
  // Fallback chain: custom → system
  const system =
    intent === 'busy' || intent === 'busy_spin'
      ? 'wait'
      : intent === 'disabled'
        ? 'not-allowed'
        : intent === 'resize_h'
          ? 'ew-resize'
          : intent === 'resize_v'
            ? 'ns-resize'
            : intent === 'hand_closed'
              ? 'grabbing'
              : intent === 'hand_open'
                ? 'grab'
                : intent === 'none'
                  ? 'none'
                  : 'auto';
  return `url("${url}") ${hx} ${hy}, ${system}`;
}

/**
 * Set document (or element) cursor intent.
 * @param {string} intent
 * @param {HTMLElement} [el=document.documentElement]
 */
export function setCursorIntent(intent, el) {
  const target = el || document.documentElement;
  _current = intent || 'default';
  target.style.cursor = cursorCssValue(_current);
  target.dataset.cursorIntent = _current;
  return _current;
}

export function getCursorIntent() {
  return _current;
}

/**
 * Preload common intents so first hover is not empty.
 */
export function preloadCursors(intents = Object.keys(CURSOR_INTENTS)) {
  const list = intents.map((i) => CURSOR_INTENTS[i] || i);
  return Promise.all(
    [...new Set(list)].map(
      (file) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(file);
          img.onerror = () => resolve(file);
          img.src = `${_base}/${_variant}/${file}.png`;
        }),
    ),
  );
}

/**
 * Hover context: elements with data-cursor="attack" etc.
 * @param {HTMLElement} root
 * @param {(el: HTMLElement|null) => string} [resolveIntent]
 */
export function bindCursorContext(root, resolveIntent) {
  if (!root) return () => {};
  const resolve =
    resolveIntent ||
    ((el) => {
      if (!el) return 'default';
      const hit = el.closest?.('[data-cursor]');
      return hit?.getAttribute('data-cursor') || 'default';
    });

  const onMove = (e) => {
    const intent = resolve(e.target instanceof HTMLElement ? e.target : null);
    if (intent !== _current) setCursorIntent(intent, root);
  };
  const onLeave = () => setCursorIntent('default', root);

  root.addEventListener('pointermove', onMove, { passive: true });
  root.addEventListener('pointerleave', onLeave, { passive: true });
  setCursorIntent('default', root);

  return () => {
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerleave', onLeave);
  };
}

export default {
  configureCursors,
  setCursorIntent,
  getCursorIntent,
  cursorCssValue,
  cursorUrl,
  preloadCursors,
  bindCursorContext,
  CURSOR_INTENTS,
  CURSOR_BASE_LOCAL,
  CURSOR_BASE_CDN,
};
