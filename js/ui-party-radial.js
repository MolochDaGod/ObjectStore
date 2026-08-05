/**
 * Party / crew / ally / camp strip + command radial
 *
 * Routes to EXISTING panels (main-panel tabs / scroll shells) — does not invent UIs.
 *
 *   import { mountPartyStrip, openPartyRadial } from './ui-party-radial.js';
 *   mountPartyStrip(host, { units, onCommand });
 *
 * SSOT: ui/player/manifest.json · css/ui-party.css · js/ui-cursor.js
 */

import { setCursorIntent } from './ui-cursor.js';

export const PARTY_BASE = '/ui/player';

/** Same-origin portraits shipped with ObjectStore Pages */
export function racePortraitUrl(raceId) {
  const r = String(raceId || 'human').toLowerCase();
  const ok = new Set(['human', 'orc', 'elf', 'dwarf', 'undead', 'barbarian']);
  const id = ok.has(r) ? r : 'human';
  return `/images/portraits/${id}.png`;
}

/** Default radial commands → main-panel tab / intent (tabs must match main-panel TABS) */
export const PARTY_COMMANDS = [
  { id: 'inspect', label: 'Inspect', panel: 'Attributes', cursor: 'inspect', icon: '0.png' },
  { id: 'equipment', label: 'Gear', panel: 'Equipment', cursor: 'gauntlet', icon: '1.png' },
  { id: 'skills', label: 'Skills', panel: 'Skills', cursor: 'magic', icon: '2.png' },
  { id: 'commands', label: 'Orders', panel: null, cursor: 'command', icon: '3.png', action: 'orders' },
  { id: 'follow', label: 'Follow', panel: null, cursor: 'move', icon: '4.png', action: 'follow' },
  { id: 'camp', label: 'Camp', panel: 'Professions', cursor: 'door', icon: '5.png' },
  { id: 'trade', label: 'Bag', panel: null, cursor: 'hand_open', icon: '6.png', action: 'trade' },
];

const KIND_LABEL = {
  self: 'You',
  crew: 'Crew',
  ally: 'Ally',
  camp: 'Camp',
  party: 'Party',
};

function el(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/**
 * Active unit context for main panel (session-level).
 */
export function getActiveUnit() {
  try {
    return JSON.parse(sessionStorage.getItem('grudge_active_unit') || 'null');
  } catch {
    return null;
  }
}

export function setActiveUnit(unit) {
  if (!unit) {
    sessionStorage.removeItem('grudge_active_unit');
    window.dispatchEvent(new CustomEvent('party:unit', { detail: null }));
    return null;
  }
  const payload = {
    id: unit.id,
    name: unit.name,
    kind: unit.kind || 'party',
    className: unit.className || unit.class || '',
    race: unit.race || 'human',
    level: unit.level || 1,
    hp: unit.hp ?? 1,
    hpMax: unit.hpMax ?? 1,
    portraitUrl: unit.portraitUrl || '',
  };
  sessionStorage.setItem('grudge_active_unit', JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent('party:unit', { detail: payload }));
  return payload;
}

/**
 * Place radial wedges in a circle.
 * @param {number} n
 * @param {number} radius
 */
function wedgePositions(n, radius = 82) {
  const out = [];
  const start = -Math.PI / 2; // top
  for (let i = 0; i < n; i++) {
    const a = start + (i * 2 * Math.PI) / n;
    out.push({ x: Math.cos(a) * radius, y: Math.sin(a) * radius, a });
  }
  return out;
}

/**
 * Open command radial at client x/y for a unit.
 * @returns {{ close: () => void }}
 */
export function openPartyRadial(unit, clientX, clientY, opts = {}) {
  const commands = opts.commands || PARTY_COMMANDS;
  const onCommand = opts.onCommand || (() => {});

  // Single radial at a time
  document.querySelectorAll('.party-radial-root').forEach((n) => n.remove());

  const root = el('div', 'party-radial-root');
  const backdrop = el('div', 'party-radial-backdrop');
  const radial = el('div', 'party-radial');
  radial.style.left = `${clientX}px`;
  radial.style.top = `${clientY}px`;

  const center = el('div', 'party-radial-center');
  center.textContent = unit?.name || 'Unit';
  if (unit?.portraitUrl) {
    center.style.backgroundImage = `url('${unit.portraitUrl}')`;
    center.textContent = '';
  }
  radial.appendChild(center);

  const pos = wedgePositions(commands.length);
  const reduce = prefersReducedMotion();

  commands.forEach((cmd, i) => {
    const w = el('button', 'party-wedge');
    w.type = 'button';
    w.setAttribute('data-cursor', cmd.cursor || 'command');
    w.setAttribute('aria-label', cmd.label);
    const iconSrc = `${PARTY_BASE}/smart/buttons/${cmd.icon || '0.png'}`;
    w.innerHTML = `<img class="wedge-icon" src="${iconSrc}" alt="" /><span class="wedge-label">${cmd.label}</span>`;
    const { x, y } = pos[i];
    const t = `translate(${x}px, ${y}px) scale(1)`;
    w.style.setProperty('--wedge-transform', `translate(${x}px, ${y}px)`);
    requestAnimationFrame(() => {
      w.style.transform = reduce ? t : `translate(${x}px, ${y}px) scale(1)`;
      w.style.transitionDelay = reduce ? '0ms' : `${i * 30}ms`;
    });
    w.addEventListener('click', (e) => {
      e.stopPropagation();
      setActiveUnit(unit);
      setCursorIntent(cmd.cursor || 'default');
      onCommand({ unit, command: cmd });
      close();
    });
    radial.appendChild(w);
  });

  function close() {
    root.classList.remove('is-open');
    setCursorIntent('default');
    setTimeout(() => root.remove(), 120);
  }

  backdrop.addEventListener('click', close);
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  root.appendChild(backdrop);
  root.appendChild(radial);
  document.body.appendChild(root);
  setCursorIntent('command');
  requestAnimationFrame(() => root.classList.add('is-open'));

  return { close, root };
}

/**
 * Mount party strip UI.
 * @param {HTMLElement} host
 * @param {{
 *   units: Array<{id,name,kind,level,hp,hpMax,portraitUrl,className,race}>,
 *   onSelect?: (unit)=>void,
 *   onCommand?: ({unit, command})=>void,
 *   activeId?: string,
 *   horizontal?: boolean,
 * }} opts
 */
export function mountPartyStrip(host, opts = {}) {
  if (!host) throw new Error('mountPartyStrip: host required');
  const units = opts.units || [];
  const onSelect = opts.onSelect || (() => {});
  const onCommand = opts.onCommand || defaultPanelRouter;

  host.classList.add('party-strip');
  if (opts.horizontal) host.classList.add('horizontal');
  host.innerHTML = '';

  let activeId = opts.activeId || getActiveUnit()?.id || units[0]?.id;

  function paint() {
    host.innerHTML = '';
    for (const u of units) {
      const slot = el('div', 'party-slot');
      slot.dataset.kind = u.kind || 'party';
      slot.dataset.unitId = u.id;
      slot.dataset.cursor = 'party_select';
      if (u.id === activeId) slot.classList.add('is-active');

      const frame = el('div', 'party-slot-frame');
      frame.innerHTML = `
        <span class="party-kind-tag">${KIND_LABEL[u.kind] || u.kind || 'Unit'}</span>
        <img class="party-portrait" src="${u.portraitUrl || racePortraitUrl(u.race)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${racePortraitUrl('human')}'" />
        <div class="party-name">${escapeHtml(u.name || 'Unknown')}</div>
        <div class="party-meta">Lv ${u.level || 1}${u.className ? ' · ' + escapeHtml(u.className) : ''}</div>
        <div class="party-hp"><div class="party-hp-fill" style="width:${Math.round(((u.hp ?? 1) / (u.hpMax || 1)) * 100)}%"></div></div>
      `;
      slot.appendChild(frame);

      slot.addEventListener('click', () => {
        activeId = u.id;
        setActiveUnit(u);
        paint();
        onSelect(u);
      });

      slot.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openPartyRadial(u, e.clientX, e.clientY, { onCommand });
      });

      // Long-press / Q handled by host page if desired
      host.appendChild(slot);
    }
  }

  paint();

  return {
    el: host,
    setUnits(next) {
      units.length = 0;
      units.push(...(next || []));
      paint();
    },
    setActive(id) {
      activeId = id;
      const u = units.find((x) => x.id === id);
      if (u) setActiveUnit(u);
      paint();
    },
    refresh: paint,
  };
}

/**
 * Route radial command → main-panel tab or action event.
 * Requires host to set window.switchTab (main-panel does).
 */
export function defaultPanelRouter({ unit, command }) {
  setActiveUnit(unit);
  const tab = command.panel;
  if (tab) {
    if (typeof window.switchTab === 'function') {
      window.switchTab(tab);
    } else if (/main-panel/i.test(location.pathname || '')) {
      const url = new URL(location.href);
      url.searchParams.set('tab', String(tab).toLowerCase());
      if (unit?.id) url.searchParams.set('unit', unit.id);
      history.replaceState({}, '', url);
      window.dispatchEvent(new CustomEvent('party:panel', { detail: { unit, command } }));
    } else {
      const q = new URLSearchParams({
        tab: String(tab).toLowerCase(),
        unit: unit?.id || '',
      });
      location.href = `/main-panel.html?${q.toString()}`;
    }
  }
  window.dispatchEvent(
    new CustomEvent('party:command', {
      detail: {
        unit,
        command,
        /** Host should surface this when action has no panel (orders/follow/trade). */
        needsHostAction: !tab && !!command.action,
      },
    }),
  );
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Session party for paperdoll / panel context.
 * Self mirrors the live hero race/class; companions are local session placeholders
 * until Railway crew API is wired (kind tags stay honest — not production roster).
 *
 * @param {{ race?: string, className?: string, level?: number, name?: string }} opts
 */
export function buildSessionParty(opts = {}) {
  const race = opts.race || 'human';
  const className = opts.className || 'Warrior';
  const level = opts.level || 1;
  const name = opts.name || 'You';
  return [
    {
      id: 'self',
      name,
      kind: 'self',
      level,
      className,
      race,
      hp: 1,
      hpMax: 1,
      portraitUrl: racePortraitUrl(race),
      source: 'session',
    },
    {
      id: 'crew-1',
      name: 'Crew slot',
      kind: 'crew',
      level: Math.max(1, level - 1),
      className: 'Ranger',
      race: race === 'orc' ? 'human' : 'orc',
      hp: 0.85,
      hpMax: 1,
      portraitUrl: racePortraitUrl(race === 'orc' ? 'human' : 'orc'),
      source: 'session-placeholder',
    },
    {
      id: 'ally-1',
      name: 'Ally slot',
      kind: 'ally',
      level: Math.max(1, level),
      className: 'Mage Priest',
      race: race === 'elf' ? 'human' : 'elf',
      hp: 0.7,
      hpMax: 1,
      portraitUrl: racePortraitUrl(race === 'elf' ? 'human' : 'elf'),
      source: 'session-placeholder',
    },
    {
      id: 'camp-1',
      name: 'Camp',
      kind: 'camp',
      level: 1,
      className: 'Outpost',
      race,
      hp: 1,
      hpMax: 1,
      portraitUrl: racePortraitUrl(race),
      source: 'session-placeholder',
    },
  ];
}

/** @deprecated use buildSessionParty — kept for older callers */
export function demoPartyUnits(opts) {
  return buildSessionParty(opts);
}

export default {
  mountPartyStrip,
  openPartyRadial,
  getActiveUnit,
  setActiveUnit,
  defaultPanelRouter,
  buildSessionParty,
  demoPartyUnits,
  racePortraitUrl,
  PARTY_COMMANDS,
  PARTY_BASE,
};
