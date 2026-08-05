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

/** Default radial commands → main-panel tab / intent */
export const PARTY_COMMANDS = [
  { id: 'inspect', label: 'Inspect', panel: 'Attributes', cursor: 'inspect', icon: '20.png' },
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
        <img class="party-portrait" src="${u.portraitUrl || `${PARTY_BASE}/smart/holders/20.png`}" alt="" />
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

/** Default: switch main-panel tab when possible */
export function defaultPanelRouter({ unit, command }) {
  setActiveUnit(unit);
  if (command.panel && typeof window.switchTab === 'function') {
    window.switchTab(command.panel);
  } else if (command.panel) {
    // Deep-link fallback
    const url = new URL(location.href);
    url.searchParams.set('tab', String(command.panel).toLowerCase());
    url.searchParams.set('unit', unit.id);
    // Soft navigate if already on main-panel
    if (/main-panel/i.test(location.pathname)) {
      history.replaceState({}, '', url);
      window.dispatchEvent(new CustomEvent('party:panel', { detail: { unit, command } }));
    } else {
      location.href = `/main-panel.html?tab=${encodeURIComponent(command.panel)}&unit=${encodeURIComponent(unit.id)}`;
    }
  }
  window.dispatchEvent(new CustomEvent('party:command', { detail: { unit, command } }));
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Demo / bootstrap units if none provided
 */
export function demoPartyUnits() {
  return [
    { id: 'self', name: 'Warlord', kind: 'self', level: 12, className: 'Warrior', race: 'human', hp: 0.82, hpMax: 1 },
    { id: 'crew-1', name: 'Brakka', kind: 'crew', level: 10, className: 'Ranger', race: 'orc', hp: 0.7, hpMax: 1 },
    { id: 'ally-1', name: 'Sylwen', kind: 'ally', level: 11, className: 'Mage', race: 'elf', hp: 0.55, hpMax: 1 },
    { id: 'camp-1', name: 'Camp A', kind: 'camp', level: 1, className: 'Outpost', race: 'human', hp: 1, hpMax: 1 },
  ];
}

export default {
  mountPartyStrip,
  openPartyRadial,
  getActiveUnit,
  setActiveUnit,
  defaultPanelRouter,
  demoPartyUnits,
  PARTY_COMMANDS,
};
