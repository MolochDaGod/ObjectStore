/**
 * Fleet cursor SSOT — Kenney Cursor Pack 1.1 (CC0)
 *
 * Source (author machine):
 *   Desktop/grudgeproduction/icons/sloticons/kenney_cursor-pack (1)/PNG/Basic/Default
 * Shipped:
 *   /ui/cursors/basic/   ← Basic/Default PNGs
 *   /ui/cursors/outline/ ← Outline/Default (prefer on dark panels)
 *
 * Pick **one file per intent for a reason** — do not randomize cursors.
 *
 * @see /ui/cursors/manifest.json · docs/KENNEY_CURSORS_SSOT.md
 */

export const CURSOR_BASE_LOCAL = '/ui/cursors';
export const CURSOR_BASE_CDN = 'https://assets.grudge-studio.com/ui/cursors';

/**
 * Intent → Kenney Basic/Default basename (no path / .png)
 * Reason column is product intent — keep stable for agents.
 */
export const CURSOR_INTENTS = Object.freeze({
  // —— Core pointer ——
  /** Ready / pan UI — classic arrow tip */
  default: 'pointer_b',
  /** Generic clickable control (button, chip) */
  pointer: 'pointer_b',
  /** Emphasized click (primary CTA) */
  pointer_strong: 'pointer_b_shaded',
  /** Soft/party selection */
  pointer_soft: 'pointer_c',
  /** Toon / casual UI */
  pointer_toon: 'pointer_toon_a',
  /** Sci-fi lab surfaces */
  pointer_scifi: 'pointer_scifi_a',

  // —— Hands / paperdoll / inventory ——
  /** Hover empty bag / open slot — can pick */
  hand_open: 'hand_open',
  /** Dragging item / grabbing orbit */
  hand_closed: 'hand_closed',
  /** Point at filled bag cell / list row */
  hand_point: 'hand_point',
  /** Equip / armor paperdoll — martial feel */
  gauntlet: 'gauntlet_default',
  /** Point at equipped gear */
  gauntlet_point: 'gauntlet_point',
  /** Open gauntlet over empty equip */
  gauntlet_open: 'gauntlet_open',

  // —— Status ——
  /** Loading catalogs / network */
  busy: 'busy_hourglass',
  /** Spinning wait */
  busy_spin: 'busy_circle',
  /** Cannot interact */
  disabled: 'cursor_disabled',
  /** Hard deny */
  forbidden: 'disabled',
  /** Help / ? tooltips */
  help: 'cursor_help',
  /** Tab strip / overflow menus */
  menu: 'cursor_menu',
  /** Alert */
  alert: 'cursor_exclamation',
  /** Settings / systems */
  cogs: 'cursor_cogs',

  // —— Targeting / combat (world + skill UI) ——
  target: 'target_a',
  target_round: 'target_round_a',
  crosshair: 'cross_small',
  attack: 'tool_sword_a',
  magic: 'tool_wand',
  bow: 'tool_bow',

  // —— Profession / tools ——
  harvest: 'tool_axe',
  mine: 'tool_pickaxe',
  build: 'tool_hammer',
  craft: 'tool_wrench',
  dig: 'tool_shovel',
  farm: 'tool_hoe',
  torch: 'tool_torch',

  // —— Social / doors ——
  look: 'look_a',
  inspect: 'zoom',
  zoom_in: 'zoom_in',
  zoom_out: 'zoom_out',
  talk: 'message_round',
  chat: 'message_dots_round',
  door: 'door_enter',
  door_exit: 'door_exit',
  door_locked: 'door_disabled',
  lock: 'lock',
  unlock: 'lock_unlocked',

  // —— Clipboard / links ——
  copy: 'cursor_copy',
  /** External / deep link */
  alias: 'cursor_alias',

  // —— Layout ——
  resize_h: 'resize_horizontal',
  resize_v: 'resize_vertical',
  resize_diag: 'resize_a_diagonal',
  rotate: 'rotate_cw',
  move: 'navigation_n',
  pan: 'hand_open',

  // —— Party / command ——
  party_select: 'pointer_c',
  command: 'cursor_menu',

  // —— Main Panel product aliases (same files, clear names) ——
  /** Inventory filled cell */
  bag_item: 'hand_point',
  /** Inventory empty cell */
  bag_empty: 'hand_open',
  /** Dragging bag/equip item */
  bag_drag: 'hand_closed',
  /** Equipped paperdoll slot */
  equip_filled: 'gauntlet_point',
  /** Empty paperdoll slot */
  equip_empty: 'gauntlet_open',
  /** Tab buttons */
  tab: 'cursor_menu',
  /** Craft tab / recipes */
  recipe: 'tool_wrench',
  /** Deposit / transfer */
  deposit: 'cursor_copy',
  /** Hero viewport orbit */
  orbit: 'hand_open',
  /** Orbit drag */
  orbit_drag: 'hand_closed',

  none: 'cursor_none',
});

/**
 * Product context → intent (why this file is used).
 * Agents: prefer this map over inventing new cursors.
 */
export const CURSOR_REASONS = Object.freeze({
  default: 'pointer_b — standard OS-like tip for idle UI',
  bag_item: 'hand_point — LMB pick / RMB menu on stack',
  bag_empty: 'hand_open — ready to receive drop',
  bag_drag: 'hand_closed — item is grabbed',
  equip_filled: 'gauntlet_point — gear is worn; click to manage',
  equip_empty: 'gauntlet_open — empty slot, ready to equip',
  tab: 'cursor_menu — panel navigation',
  busy: 'busy_hourglass — wait for network/catalog',
  disabled: 'cursor_disabled — action not allowed',
  craft: 'tool_wrench — crafting / engineer',
  mine: 'tool_pickaxe — ore / stone profession',
  harvest: 'tool_axe — wood / plant gather',
  magic: 'tool_wand — staff / spell UI',
  attack: 'tool_sword_a — hostile / combat skill',
  talk: 'message_round — dialogue / social',
  inspect: 'zoom — examine stats / tooltip detail',
  orbit: 'hand_open — free look on hero viewport',
  orbit_drag: 'hand_closed — rotating camera on hero',
  party_select: 'pointer_c — ally / unit strip',
  deposit: 'cursor_copy — move stack to account bag',
  alias: 'cursor_alias — external fleet link',
  help: 'cursor_help — help / docs affordance',
});

/** Hotspot [x,y] for ~32px Kenney pointers (tip of arrow / center of reticle) */
const HOTSPOT = Object.freeze({
  default: [4, 2],
  pointer: [4, 2],
  pointer_strong: [4, 2],
  pointer_soft: [4, 2],
  pointer_toon: [4, 2],
  pointer_scifi: [4, 2],
  hand_open: [12, 4],
  hand_closed: [12, 4],
  hand_point: [8, 2],
  bag_item: [8, 2],
  bag_empty: [12, 4],
  bag_drag: [12, 4],
  gauntlet: [8, 2],
  gauntlet_point: [8, 2],
  gauntlet_open: [8, 2],
  equip_filled: [8, 2],
  equip_empty: [8, 2],
  busy: [16, 16],
  busy_spin: [16, 16],
  disabled: [4, 2],
  forbidden: [4, 2],
  target: [16, 16],
  target_round: [16, 16],
  crosshair: [16, 16],
  attack: [8, 8],
  harvest: [8, 8],
  mine: [8, 8],
  magic: [8, 8],
  bow: [8, 8],
  craft: [8, 8],
  build: [8, 8],
  recipe: [8, 8],
  dig: [8, 8],
  farm: [8, 8],
  tab: [4, 2],
  menu: [4, 2],
  help: [4, 2],
  inspect: [8, 8],
  zoom_in: [8, 8],
  zoom_out: [8, 8],
  orbit: [12, 4],
  orbit_drag: [12, 4],
  party_select: [4, 2],
  command: [4, 2],
  deposit: [4, 2],
  copy: [4, 2],
  alias: [4, 2],
  none: [0, 0],
});

let _base = CURSOR_BASE_LOCAL;
/** outline = dark Main Panel; basic = light parchment (Kenney Basic/Default) */
let _variant = 'outline';
let _current = 'default';

export function resolveCursorBase(preferred) {
  if (preferred) return preferred.replace(/\/$/, '');
  return CURSOR_BASE_LOCAL;
}

/**
 * @param {{ base?: string, variant?: 'basic'|'outline' }} [opts]
 * basic  = PNG/Basic/Default (light UI)
 * outline = PNG/Outline/Default (dark Grudge panels — default)
 */
export function configureCursors(opts = {}) {
  if (opts.base) _base = resolveCursorBase(opts.base);
  else _base = resolveCursorBase();
  if (opts.variant === 'basic' || opts.variant === 'outline') _variant = opts.variant;
}

export function getCursorVariant() {
  return _variant;
}

export function cursorUrl(intent = 'default') {
  const file = CURSOR_INTENTS[intent] || CURSOR_INTENTS.default;
  return `${_base}/${_variant}/${file}.png`;
}

export function cursorCssValue(intent = 'default') {
  const key = CURSOR_INTENTS[intent] ? intent : 'default';
  const [hx, hy] = HOTSPOT[key] || HOTSPOT.default;
  const url = cursorUrl(key);
  const system =
    key === 'busy' || key === 'busy_spin'
      ? 'wait'
      : key === 'disabled' || key === 'forbidden'
        ? 'not-allowed'
        : key === 'resize_h'
          ? 'ew-resize'
          : key === 'resize_v'
            ? 'ns-resize'
            : key === 'hand_closed' || key === 'bag_drag' || key === 'orbit_drag'
              ? 'grabbing'
              : key === 'hand_open' || key === 'bag_empty' || key === 'orbit'
                ? 'grab'
                : key === 'none'
                  ? 'none'
                  : key === 'alias'
                    ? 'alias'
                    : key === 'copy' || key === 'deposit'
                      ? 'copy'
                      : key === 'help'
                        ? 'help'
                        : 'auto';
  return `url("${url}") ${hx} ${hy}, ${system}`;
}

/**
 * @param {string} intent
 * @param {HTMLElement} [el=document.documentElement]
 */
export function setCursorIntent(intent, el) {
  const target = el || document.documentElement;
  _current = intent && CURSOR_INTENTS[intent] ? intent : intent || 'default';
  if (!CURSOR_INTENTS[_current]) _current = 'default';
  target.style.cursor = cursorCssValue(_current);
  target.dataset.cursorIntent = _current;
  return _current;
}

export function getCursorIntent() {
  return _current;
}

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
 * Resolve Kenney intent from Main Panel DOM (class / data-cursor).
 * @param {HTMLElement|null} el
 */
export function resolveMainPanelCursor(el) {
  if (!el || !(el instanceof Element)) return 'default';

  const hit = el.closest?.('[data-cursor]');
  if (hit) {
    const d = hit.getAttribute('data-cursor');
    if (d && CURSOR_INTENTS[d]) return d;
  }

  if (el.closest?.('button:disabled, [disabled], .is-disabled, .disabled')) return 'disabled';
  if (el.closest?.('.is-loading, [aria-busy="true"]')) return 'busy';

  // Tabs / nav
  if (el.closest?.('.tab-btn, [role="tab"]')) return 'tab';
  if (el.closest?.('.mp2d-lang select, select')) return 'pointer';

  // Inventory
  if (el.closest?.('.inv-cell.has-item, .inv-cell[data-uuid]')) return 'bag_item';
  if (el.closest?.('.inv-cell')) return 'bag_empty';
  if (el.closest?.('.hb-slot.skill, .hb-slot[data-skill]')) return 'magic';
  if (el.closest?.('.hb-slot')) return 'hand_point';

  // Equipment paperdoll
  if (el.closest?.('.eq-slot.equipped, .eq-slot.has-item, .eq-slot[data-equipped]'))
    return 'equip_filled';
  if (el.closest?.('.eq-slot')) return 'equip_empty';

  // Hero 3D
  if (el.closest?.('.hero-viewport, #hero-viewport')) return 'orbit';

  // Craft / professions
  if (el.closest?.('[data-panel="Crafting"], #tab-craft, .craft-embed, .recipe-card'))
    return 'craft';
  if (el.closest?.('.mp-prof, [data-prof], .prof-row')) return 'build';

  // Links
  if (el.closest?.('a[href^="http"], a[target="_blank"]')) return 'alias';
  if (el.closest?.('a[href]')) return 'pointer';

  // Buttons
  if (el.closest?.('button, .inv-btn, .admin-btn, .uc-clear, [role="button"]')) return 'pointer';

  // Help
  if (el.closest?.('[data-help], .help, [title*="help" i]')) return 'help';

  // Party
  if (el.closest?.('#partyStrip, .party-unit, .party-radial')) return 'party_select';

  return 'default';
}

/**
 * @param {HTMLElement} root
 * @param {(el: HTMLElement|null) => string} [resolveIntent]
 */
export function bindCursorContext(root, resolveIntent) {
  if (!root) return () => {};
  const resolve =
    resolveIntent ||
    ((el) => {
      if (!el) return 'default';
      // Prefer Main Panel semantic resolver when on that page
      if (document.getElementById('mainScroll')) return resolveMainPanelCursor(el);
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
  // pointerdown on drag sources → grabbing
  root.addEventListener(
    'pointerdown',
    (e) => {
      const t = e.target instanceof HTMLElement ? e.target : null;
      if (!t) return;
      if (t.closest?.('.inv-cell.has-item, .eq-slot.equipped, .hero-viewport')) {
        const dragIntent = t.closest?.('.hero-viewport') ? 'orbit_drag' : 'bag_drag';
        setCursorIntent(dragIntent, root);
      }
    },
    { passive: true },
  );
  root.addEventListener(
    'pointerup',
    (e) => {
      const t = e.target instanceof HTMLElement ? e.target : null;
      setCursorIntent(resolve(t), root);
    },
    { passive: true },
  );

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
  getCursorVariant,
  cursorCssValue,
  cursorUrl,
  preloadCursors,
  bindCursorContext,
  resolveMainPanelCursor,
  CURSOR_INTENTS,
  CURSOR_REASONS,
  CURSOR_BASE_LOCAL,
  CURSOR_BASE_CDN,
};
