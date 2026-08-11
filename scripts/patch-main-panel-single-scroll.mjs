#!/usr/bin/env node
/**
 * main-panel: one World Map scroll for full canvas + animated tabs + UUID bag/craft wiring.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = path.join(ROOT, 'main-panel.html');
let s = fs.readFileSync(p, 'utf8');

// ── 1) CSS: single canvas + tabs ──────────────────────────────────────
const cssOld = `    .app { display: flex; height: 100vh; flex-direction: column; overflow: hidden; }
    /* Scroll shells fill flex children */
    .center-col .scroll-shell { flex: 1; min-height: 0; display: flex; flex-direction: column; }
    .right-col.scroll-shell { flex: 1; min-height: 0; }
    .right-col .scroll-content { display: flex; flex-direction: column; min-height: 0; }
    .right-col .inv-grid { flex: 1; min-height: 0; }`;

const cssNew = `    .app { display: flex; height: 100vh; flex-direction: column; overflow: hidden; }
    /* ONE World Map scroll = entire main canvas (not dual center+inv shells) */
    #mainScroll.scroll-shell,
    #mainScroll.main-canvas-host {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    #mainScroll > .scroll-content {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    #mainScroll .main-body {
      flex: 1;
      min-height: 0;
      height: 100%;
    }
    #mainScroll .right-col {
      background: transparent;
      border-left: 1px solid rgba(90, 64, 40, 0.25);
    }
    #mainScroll .left-col {
      background: transparent;
      border-right: 1px solid rgba(90, 64, 40, 0.25);
    }
    #mainScroll .tab-strip {
      background: rgba(20, 16, 10, 0.45);
      border-bottom: 2px solid rgba(212, 168, 67, 0.55);
      position: relative;
    }
    #mainScroll .tab-btn {
      position: relative;
      transition: color 0.22s ease, background 0.22s ease, transform 0.18s ease;
    }
    #mainScroll .tab-btn:hover { transform: translateY(-1px); }
    #mainScroll .tab-btn.active {
      color: var(--gold);
      background: rgba(255, 215, 0, 0.1);
    }
    #mainScroll .tab-indicator {
      position: absolute;
      bottom: 0;
      height: 3px;
      border-radius: 2px 2px 0 0;
      background: linear-gradient(90deg, transparent, var(--gold), transparent);
      box-shadow: 0 0 10px rgba(212, 175, 55, 0.55);
      transition: left 0.28s cubic-bezier(0.22, 1, 0.36, 1), width 0.28s cubic-bezier(0.22, 1, 0.36, 1);
      pointer-events: none;
    }
    #contentArea.is-tab-enter {
      animation: mpTabEnter 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes mpTabEnter {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      #contentArea.is-tab-enter { animation: none; }
      #mainScroll .tab-indicator { transition: none; }
      #mainScroll .tab-btn { transition: none; }
    }
    .right-col .inv-grid { flex: 1; min-height: 0; }
    .inv-uuid-chip {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 8px;
      color: var(--dim);
      letter-spacing: 0.02em;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .inv-header .bag-scope {
      font-size: 9px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }`;

if (s.includes(cssOld)) {
  s = s.replace(cssOld, cssNew);
  console.log('CSS dual-scroll → single canvas');
} else if (s.includes('#mainScroll.scroll-shell')) {
  console.log('CSS already single canvas');
} else {
  // softer insert after .app rule
  s = s.replace(
    '.app { display: flex; height: 100vh; flex-direction: column; overflow: hidden; }',
    '.app { display: flex; height: 100vh; flex-direction: column; overflow: hidden; }\n' +
      cssNew.replace(/^    /gm, '    '),
  );
  console.log('CSS inserted after .app');
}

// Improve tab-btn base transition
s = s.replace(
  '.tab-btn { border: 0; background: transparent; color: var(--muted); cursor: pointer; padding: 10px 14px; font-family: var(--font-display); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; border-bottom: 2px solid transparent; white-space: nowrap; transition: all 0.15s; }',
  '.tab-btn { border: 0; background: transparent; color: var(--muted); cursor: pointer; padding: 10px 14px; font-family: var(--font-display); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; border-bottom: 2px solid transparent; white-space: nowrap; transition: color 0.22s ease, background 0.22s ease, border-color 0.22s ease, transform 0.18s ease; }',
);

// ── 2) HTML structure: one mainScroll wrapping main-body ─────────────
const htmlDual = `  <div class="main-body">
    <aside class="left-col" id="leftCol"></aside>
    <main class="center-col">
      <div class="unit-context-banner" id="unitContextBanner" aria-live="polite">
        <span class="uc-kind" id="ucKind">Unit</span>
        <span id="ucName">—</span>
        <button type="button" class="uc-clear" id="ucClear">Clear · Self</button>
      </div>
      <div class="mp-status" id="mpStatus" role="status" aria-live="polite"></div>
      <div class="error-banner" id="errorBanner"></div>
      <nav class="tab-strip" id="tabStrip"></nav>
      <!-- World Map Scroll shell — Appear/Disappear UX (ui-scroll-container) -->
      <div id="contentScroll" class="content-scroll-host" style="flex:1;min-height:0;display:flex;flex-direction:column;">
        <div class="content-area" id="contentArea"></div>
      </div>
    </main>
    <aside class="right-col" id="invScroll">
      <div class="inv-header">
        <h3 data-i18n="app.inventory">Inventory</h3>
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="inv-count" id="invCount">0/42</span>
          <span style="font-family:var(--font-mono);font-size:12px;color:var(--gold)" id="goldDisplay">250 Gold</span>
        </div>
      </div>
      <div class="inv-grid" id="invGrid"></div>
    </aside>
  </div>`;

const htmlSingle = `  <!-- ONE World Map scroll = full main panel canvas (left · tabs/content · inventory) -->
  <div id="mainScroll" class="main-canvas-host" aria-label="Main panel canvas">
  <div class="main-body">
    <aside class="left-col" id="leftCol"></aside>
    <main class="center-col">
      <div class="unit-context-banner" id="unitContextBanner" aria-live="polite">
        <span class="uc-kind" id="ucKind">Unit</span>
        <span id="ucName">—</span>
        <button type="button" class="uc-clear" id="ucClear">Clear · Self</button>
      </div>
      <div class="mp-status" id="mpStatus" role="status" aria-live="polite"></div>
      <div class="error-banner" id="errorBanner"></div>
      <nav class="tab-strip" id="tabStrip" role="tablist" aria-label="Main panel tabs">
        <span class="tab-indicator" id="tabIndicator" aria-hidden="true"></span>
      </nav>
      <div class="content-area" id="contentArea" role="tabpanel"></div>
    </main>
    <aside class="right-col" id="invPanel">
      <div class="inv-header">
        <div>
          <h3 data-i18n="app.inventory">Inventory</h3>
          <div class="bag-scope" id="bagScope">Account bag · UUID stacks</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="inv-count" id="invCount">0/42</span>
          <span style="font-family:var(--font-mono);font-size:12px;color:var(--gold)" id="goldDisplay">250 Gold</span>
        </div>
      </div>
      <div class="inv-grid" id="invGrid"></div>
    </aside>
  </div>
  </div>`;

if (s.includes('id="mainScroll"')) {
  console.log('HTML already has mainScroll');
} else if (s.includes('id="contentScroll"')) {
  // flexible replace of main-body block
  const start = s.indexOf('<div class="main-body">');
  const endMarker = '<footer class="hotbar"';
  const end = s.indexOf(endMarker);
  if (start < 0 || end < 0) {
    console.error('Could not find main-body / hotbar');
    process.exit(1);
  }
  s = s.slice(0, start) + htmlSingle + '\n  ' + s.slice(end);
  console.log('HTML → single mainScroll canvas');
} else {
  console.error('Unexpected HTML structure');
  process.exit(1);
}

// ── 3) UUID + bag helpers (inject after inventoryItems declaration) ──
const invDecl = 'let inventoryItems = [];';
const uuidHelpers = `let inventoryItems = [];
  /** Bag slot: { uuid, stack, source? } — GRUDGE UUID is SSOT key (never name-only). */
  const BAG_SLOTS = 42;
  function isGrudgeUuid(v) {
    return typeof v === 'string' && /^(ITEM|MAT|RELC|SKIL|ICON|HERO|ATTR)-/i.test(v);
  }
  function normalizeItemUuid(itemOrUuid) {
    if (!itemOrUuid) return null;
    if (typeof itemOrUuid === 'string') return itemOrUuid;
    return itemOrUuid.uuid || itemOrUuid.grudgeUuid || itemOrUuid.id || null;
  }
  function bagStackByUuid(uuid) {
    if (!uuid) return 0;
    let n = 0;
    for (const inv of inventoryItems) {
      if (inv && inv.uuid === uuid) n += inv.stack || 1;
    }
    return n;
  }
  function bagStackByNameOrId(nameOrId) {
    const key = String(nameOrId || '').toLowerCase().replace(/_/g, ' ').trim();
    if (!key) return 0;
    let n = 0;
    for (const inv of inventoryItems) {
      if (!inv?.uuid) continue;
      const item = findAnyItem(inv.uuid);
      if (!item) continue;
      const id = String(item.id || item.uuid || '').toLowerCase();
      const name = String(item.name || '').toLowerCase();
      if (id === key || name === key || id.includes(key) || name.includes(key) || key.includes(name)) {
        n += inv.stack || 1;
      }
    }
    return n;
  }
  /** Craft / spend check: prefer UUID, fall back to catalog name match against bag. */
  function bagQty(idOrUuidOrName) {
    const raw = String(idOrUuidOrName || '');
    if (isGrudgeUuid(raw) || raw.startsWith('ITEM-') || raw.startsWith('MAT-')) return bagStackByUuid(raw);
    // resolve catalog id → uuid then stack
    const hit =
      allItems.find((i) => String(i.id) === raw || String(i.uuid) === raw) ||
      allMaterials.find((m) => String(m.id) === raw || String(m.uuid) === raw || String(m.name) === raw);
    if (hit?.uuid) return bagStackByUuid(hit.uuid);
    return bagStackByNameOrId(raw);
  }
  function shortUuid(uuid) {
    if (!uuid) return '—';
    const s = String(uuid);
    if (s.length <= 18) return s;
    return s.slice(0, 10) + '…' + s.slice(-6);
  }
  function pushBag(uuid, stack = 1, source = 'bag') {
    const u = normalizeItemUuid(uuid);
    if (!u) return false;
    const existing = inventoryItems.find((x) => x.uuid === u);
    if (existing) {
      existing.stack = (existing.stack || 1) + stack;
      return true;
    }
    if (inventoryItems.length >= BAG_SLOTS) return false;
    inventoryItems.push({ uuid: u, stack, source });
    return true;
  }
`;

if (!s.includes('function bagStackByUuid')) {
  if (s.includes(invDecl)) {
    s = s.replace(invDecl, uuidHelpers);
    console.log('UUID bag helpers added');
  } else {
    console.warn('inventoryItems decl not found for helpers');
  }
}

// ── 4) initScrollShells → single mainScroll ──────────────────────────
const scrollOldStart = s.indexOf('/** Mount parchment scroll containers');
const scrollNew = `/** Mount ONE World Map scroll for the entire main panel canvas. */
  let _mainScrollApi = null;
  async function initScrollShells() {
    const mod = await import('./js/ui-scroll-container.js');
    await mod.preloadScrollFrames();
    const host = document.getElementById('mainScroll');
    if (!host) {
      console.warn('[main-panel] #mainScroll missing');
      return;
    }
    if (host.dataset.scrollMounted !== '1') {
      _mainScrollApi = mod.mountScrollContainer(host, {
        autoOpen: true,
        fps: 14,
        contentRevealAt: 0.62,
        className: 'main-canvas-scroll',
      });
    } else {
      _mainScrollApi = host._scrollApi;
      _mainScrollApi?.snapOpen?.();
    }
    // legacy aliases (party/unit code)
    window._contentScrollApi = _mainScrollApi;
    window._mainScrollApi = _mainScrollApi;
    requestAnimationFrame(() => updateTabIndicator());
  }

  function updateTabIndicator() {
    const strip = document.getElementById('tabStrip');
    const ind = document.getElementById('tabIndicator');
    if (!strip || !ind) return;
    const active = strip.querySelector('.tab-btn.active');
    if (!active) {
      ind.style.width = '0';
      return;
    }
    const sr = strip.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    ind.style.left = Math.max(0, ar.left - sr.left + strip.scrollLeft) + 'px';
    ind.style.width = ar.width + 'px';
  }

`;

if (scrollOldStart >= 0) {
  const scrollEnd = s.indexOf('function showError', scrollOldStart);
  if (scrollEnd > scrollOldStart) {
    s = s.slice(0, scrollOldStart) + scrollNew + s.slice(scrollEnd);
    console.log('initScrollShells → single mainScroll');
  }
} else if (s.includes('_mainScrollApi')) {
  console.log('scroll init already single');
} else {
  console.warn('could not patch initScrollShells');
}

// Remove leftover dual API vars if any remain after partial patches
s = s.replace(/let _contentScrollApi = null;\s*let _invScrollApi = null;\s*/g, '');

// ── 5) switchTab: animate + indicator + snap single scroll ───────────
const switchOld = `  function switchTab(t) {
    activeTab = t;
    document.querySelectorAll('.tab-btn').forEach(b =>
      b.classList.toggle('active', (b.getAttribute('data-tab') || b.textContent) === t),
    );
    // Keep scroll open without replaying Appear every tab
    _contentScrollApi?.snapOpen?.();
    renderTab();
    try {
      window.MainPanel2D?.animateContentEnter?.();
    } catch { /* */ }
  }`;

const switchNew = `  function switchTab(t) {
    activeTab = t;
    document.querySelectorAll('.tab-btn').forEach((b) => {
      const on = (b.getAttribute('data-tab') || b.textContent) === t;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    // One canvas scroll stays open — never re-play Appear on tab change
    _mainScrollApi?.snapOpen?.();
    _contentScrollApi?.snapOpen?.();
    renderTab();
    const area = document.getElementById('contentArea');
    if (area) {
      area.classList.remove('is-tab-enter');
      void area.offsetWidth;
      area.classList.add('is-tab-enter');
    }
    requestAnimationFrame(() => updateTabIndicator());
    try {
      window.MainPanel2D?.animateContentEnter?.();
    } catch { /* */ }
  }`;

if (s.includes('_contentScrollApi?.snapOpen') && s.includes('function switchTab')) {
  s = s.replace(switchOld, switchNew);
  if (!s.includes('updateTabIndicator()')) {
    // looser: just fix snap lines
    s = s.replace(
      /_contentScrollApi\?\.snapOpen\?\.\(\);\s*renderTab\(\);/,
      `_mainScrollApi?.snapOpen?.();\n    _contentScrollApi?.snapOpen?.();\n    renderTab();\n    const area = document.getElementById('contentArea');\n    if (area) {\n      area.classList.remove('is-tab-enter');\n      void area.offsetWidth;\n      area.classList.add('is-tab-enter');\n    }\n    requestAnimationFrame(() => updateTabIndicator());`,
    );
  }
  console.log('switchTab animated');
} else if (s.includes('updateTabIndicator')) {
  console.log('switchTab already updated');
}

// rebuildTabStrip: include indicator + aria
s = s.replace(
  `document.getElementById('tabStrip').innerHTML = TABS.map(t => {
        const label = i18n?.tabLabel?.(t) || t;
        return \`<button type="button" class="tab-btn \${t===activeTab?'active':''}" data-tab="\${t}" onclick="switchTab('\${t}')">\${label}</button>\`;
      }).join('');`,
  `const strip = document.getElementById('tabStrip');
      const indHtml = '<span class="tab-indicator" id="tabIndicator" aria-hidden="true"></span>';
      strip.innerHTML = indHtml + TABS.map(t => {
        const label = i18n?.tabLabel?.(t) || t;
        const on = t === activeTab;
        return \`<button type="button" role="tab" class="tab-btn \${on?'active':''}" data-tab="\${t}" aria-selected="\${on?'true':'false'}" onclick="switchTab('\${t}')">\${label}</button>\`;
      }).join('');
      requestAnimationFrame(() => updateTabIndicator());`,
);

// ── 6) populateInventoryDemo: materials with UUID stacks ─────────────
const popOld = `  function populateInventoryDemo() {
    inventoryItems = [];
    const allowedWpns = getClassWeapons();

    // Add class-appropriate weapons (T1 and T2 samples)
    allowedWpns.slice(0, 4).forEach(cat => {
      const wpns = allItems.filter(i => i.type === 'weapon' && i.category === cat && i.tier <= 2);
      wpns.slice(0, 2).forEach(w => inventoryItems.push({ uuid: w.uuid, stack: 1 }));
    });

    // Add some armor from a different set (for swapping)
    const mat = getClassArmorMaterial();
    const altArmor = allArmor.filter(i => i.material === mat && i.tier === 2);
    altArmor.slice(0, 4).forEach(a => inventoryItems.push({ uuid: a.uuid, stack: 1 }));

    // Food and potions — fixed stacks (deterministic; not random demo noise)
    allItems.filter(i => i.type === 'food').slice(0, 4).forEach((i, n) =>
      inventoryItems.push({ uuid: i.uuid, stack: 3 + (n % 4) }));
    allItems.filter(i => i.type === 'potion').slice(0, 3).forEach((i, n) =>
      inventoryItems.push({ uuid: i.uuid, stack: 2 + (n % 3) }));
  }`;

const popNew = `  function populateInventoryDemo() {
    inventoryItems = [];
    const allowedWpns = getClassWeapons();

    // Weapons / armor by GRUDGE UUID only
    allowedWpns.slice(0, 4).forEach((cat) => {
      const wpns = allItems.filter((i) => i.type === 'weapon' && i.category === cat && i.tier <= 2 && i.uuid);
      wpns.slice(0, 2).forEach((w) => pushBag(w.uuid, 1, 'demo-weapon'));
    });

    const mat = getClassArmorMaterial();
    const altArmor = allArmor.filter((i) => i.material === mat && i.tier === 2 && i.uuid);
    altArmor.slice(0, 4).forEach((a) => pushBag(a.uuid, 1, 'demo-armor'));

    allItems.filter((i) => i.type === 'food' && i.uuid).slice(0, 4).forEach((i, n) =>
      pushBag(i.uuid, 3 + (n % 4), 'demo-food'));
    allItems.filter((i) => i.type === 'potion' && i.uuid).slice(0, 3).forEach((i, n) =>
      pushBag(i.uuid, 2 + (n % 3), 'demo-potion'));

    // Crafting materials (UUID stacks) — wires craft grid to real bag
    const mats = (allMaterials || []).filter((m) => m.uuid);
    mats.slice(0, 10).forEach((m, n) => pushBag(m.uuid, 6 + (n % 5), 'demo-mat'));
    // Fallback name-matched mats from items if materials empty
    if (!mats.length) {
      allItems
        .filter((i) => /ore|wood|leather|cloth|ingot|plank|herb/i.test(String(i.name || i.category || '')) && i.uuid)
        .slice(0, 8)
        .forEach((i, n) => pushBag(i.uuid, 5 + (n % 4), 'demo-mat-item'));
    }
  }`;

if (s.includes('function populateInventoryDemo()')) {
  if (s.includes(popOld)) {
    s = s.replace(popOld, popNew);
    console.log('populateInventoryDemo UUID mats');
  } else if (!s.includes('demo-mat')) {
    // replace function body loosely
    s = s.replace(
      /function populateInventoryDemo\(\) \{[\s\S]*?\n  \}\n\n  \/\/ ── Left Column/,
      popNew + '\n\n  // ── Left Column',
    );
    console.log('populateInventoryDemo replaced loosely');
  }
}

// ── 7) renderInventory: show short UUID ──────────────────────────────
s = s.replace(
  `html += \`<span class="inv-tier" style="background:\${tc};color:#000;">T\${tier}</span>\`;
          if (inv.stack > 1) html += \`<span class="inv-stack">\${inv.stack}</span>\`;
          html += \`</div>\`;`,
  `html += \`<span class="inv-tier" style="background:\${tc};color:#000;">T\${tier}</span>\`;
          if (inv.stack > 1) html += \`<span class="inv-stack">\${inv.stack}</span>\`;
          html += \`<span class="inv-uuid-chip" title="\${esc(inv.uuid)}">\${esc(shortUuid(inv.uuid))}</span>\`;
          html += \`</div>\`;`,
);

// inv count uses BAG_SLOTS
s = s.replace(
  "document.getElementById('invCount').textContent = `${inventoryItems.length}/${totalSlots}`;",
  "document.getElementById('invCount').textContent = `${inventoryItems.filter(Boolean).length}/${BAG_SLOTS || totalSlots}`;",
);

// ── 8) Craft: bagQty from UUID inventory; remove iframe ──────────────
s = s.replace(
  /function bagQtyDemo\(idOrName\) \{[\s\S]*?return 2;\n  \}/,
  `function bagQtyDemo(idOrName) {
    // Prefer real bag UUID stacks; soft demo floor only when bag empty for that key
    const q = typeof bagQty === 'function' ? bagQty(idOrName) : 0;
    if (q > 0) return q;
    const key = String(idOrName || '').toLowerCase();
    if (!inventoryItems.length && /iron|ore|wood|plank|leather|cloth|herb|water|copper|pine/.test(key)) return 4;
    return 0;
  }`,
);

// Strip iframe embed from craft tab output if present
if (s.includes('craft-suite-frame') || s.includes('suite embed')) {
  s = s.replace(
    /const suiteEmbed = craftSuiteAuthedUrl\(true\);\s*const suitePop = craftSuiteAuthedUrl\(false\);/,
    'const suitePop = craftSuiteAuthedUrl(false);',
  );
  s = s.replace(
    /' · suite embed'/,
    "' · bag UUID wiring'",
  );
  s = s.replace(
    /'<div class="craft-frame-wrap"[\s\S]*?<\/div>' \+\s*'/,
    "'",
  );
  s = s.replace(
    /Railway <strong>account bag<\/strong> · XP on active character · suite is SSOT/,
    'Shared <strong>account bag</strong> (UUID stacks) · XP on active character · native craft · suite pop-out',
  );
  s = s.replace(
    /Wired craft/,
    'Native craft',
  );
  // fix craftSuiteAuthedUrl to not force embed for popout
  s = s.replace(
    /function craftSuiteAuthedUrl\(embed\) \{[\s\S]*?if \(embed !== false\) u\.searchParams\.set\('embed', '1'\);/,
    `function craftSuiteAuthedUrl(embed) {
    const u = new URL(CRAFTING_SUITE_URL);
    u.searchParams.set('era', 'warlords');
    u.searchParams.set('from', 'info-main-panel');
    if (embed === true) u.searchParams.set('embed', '1'); // optional; suite may block iframe`,
  );
  console.log('craft iframe stripped / bag wiring');
}

// Mat preview from real bag UUIDs
s = s.replace(
  /const matPreview = \['Iron Ore', 'Pine Wood', 'Leather Scraps', 'Cloth Scraps', 'Copper Ore'\][\s\S]*?\.join\(''\);/,
  `const bagMats = inventoryItems
      .map((inv) => {
        const it = findAnyItem(inv.uuid);
        return it ? { uuid: inv.uuid, name: it.name || inv.uuid, qty: inv.stack || 1, icon: it.iconUrl } : null;
      })
      .filter(Boolean)
      .slice(0, 12);
    const matPreview = (bagMats.length
      ? bagMats
      : ['Iron Ore', 'Pine Wood', 'Leather Scraps'].map((n) => ({ uuid: null, name: n, qty: bagQty(n) }))
    )
      .map(
        (m) =>
          '<div class="craft-mat" data-uuid="' +
          esc(m.uuid || '') +
          '" title="' +
          esc(m.uuid || m.name) +
          '"><span class="mat-name">' +
          esc(m.name) +
          '</span><span class="mat-qty">×' +
          (m.qty || 0) +
          '</span></div>',
      )
      .join('');`,
);

// craft cards: add data-recipe-uuid attribute after data-craft-id
s = s.replace(
  /'" data-craft-id="' \+\s*esc\(r\.id\) \+\s*'" title="'/g,
  `'" data-craft-id="' +\n            esc(r.id) +\n            '" data-recipe-key="' +\n            esc(r.id) +\n            '" title="'`,
);

// invScroll references → invPanel
s = s.replace(/getElementById\('invScroll'\)/g, "getElementById('invPanel')");
s = s.replace(/#invScroll/g, '#invPanel');

// scrollIntoView for inv
s = s.replace(
  "document.getElementById('invScroll')?.scrollIntoView",
  "document.getElementById('invPanel')?.scrollIntoView",
);

fs.writeFileSync(p, s, 'utf8');

// verify
const checks = {
  mainScroll: s.includes('id="mainScroll"'),
  noContentScroll: !s.includes('id="contentScroll"'),
  noInvScrollShell: !s.includes('id="invScroll"'),
  bagQty: s.includes('function bagQty('),
  tabIndicator: s.includes('tab-indicator'),
  noCraftIframe: !s.includes('craft-suite-frame'),
};
console.log('checks', checks);
if (!checks.mainScroll || !checks.bagQty) process.exit(1);
console.log('OK', p, 'bytes', s.length);
