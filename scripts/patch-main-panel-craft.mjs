#!/usr/bin/env node
/**
 * One-shot: replace Puter iframe craft tab on info main-panel with native consolidated craft.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = path.join(ROOT, 'main-panel.html');
let s = fs.readFileSync(p, 'utf8');
const before = s.length;

// --- CSS ---
const cssStart = s.indexOf('.craft-embed-wrap');
if (cssStart >= 0) {
  // find start of comment or rule line
  let lineStart = s.lastIndexOf('\n', cssStart) + 1;
  const comment = s.lastIndexOf('/* Crafting tab', cssStart);
  if (comment > cssStart - 200 && comment >= 0) lineStart = comment;
  // end after .craft-embed { ... }
  const embedRule = s.indexOf('.craft-embed {', cssStart);
  let end = s.indexOf('}', embedRule);
  // skip nested braces if any - simple: find closing after background line
  end = s.indexOf('\n', end) + 1;
  const cssNew = `/* Crafting tab — native (no iframe; suite = pop-out only) */
    .craft-shell { display:flex; flex-direction:column; gap:10px; min-height:420px; }
    .craft-toolbar { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px; }
    .craft-toolbar h3 { margin:0; font-family:var(--font-display); font-size:13px; color:var(--gold); letter-spacing:1px; text-transform:uppercase; }
    .craft-toolbar-right { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
    .craft-auth-pill { font-size:10px; padding:3px 8px; border-radius:999px; border:1px solid #3a2a1a; color:var(--muted); background:#14100a; }
    .craft-auth-pill.warn { color:#eab308; border-color:rgba(234,179,8,.35); }
    .craft-sub { font-size:11px; color:var(--muted); line-height:1.4; margin:0; }
    .craft-layout { display:grid; grid-template-columns:1fr minmax(160px,220px); gap:12px; align-items:start; }
    @media (max-width:900px) { .craft-layout { grid-template-columns:1fr; } }
    .craft-filter { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px; }
    .craft-filter-btn { border:1px solid #3a2a1a; background:#1a120c; color:var(--muted); padding:5px 10px; border-radius:6px; cursor:pointer; font-size:10px; text-transform:uppercase; }
    .craft-filter-btn.active, .craft-filter-btn:hover { border-color:var(--gold); color:var(--gold); }
    .craft-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(168px,1fr)); gap:8px; }
    .craft-card { text-align:left; border:1px solid #3a2a1a; border-radius:8px; padding:10px; background:#1a120c; cursor:pointer; color:var(--text); min-height:96px; }
    .craft-card:hover { border-color:var(--gold); }
    .craft-card.can-craft { border-color:rgba(34,197,94,.35); }
    .craft-card.no-craft { opacity:.72; }
    .craft-card h4 { margin:0 0 4px; font-size:12px; color:var(--gold); display:flex; align-items:center; gap:6px; }
    .craft-card .craft-icon { width:22px; height:22px; object-fit:contain; image-rendering:pixelated; }
    .craft-card p { margin:2px 0; font-size:10px; color:var(--muted); line-height:1.35; }
    .craft-card .out { color:var(--text); }
    .craft-side { border:1px solid #3a2a1a; border-radius:8px; padding:10px; background:#14100a; }
    .craft-side-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px; }
    .craft-side-head h4 { margin:0; font-size:11px; color:var(--gold); text-transform:uppercase; }
    .craft-bag-meta { font-size:9px; color:var(--dim); }
    .craft-mat-grid { display:grid; gap:4px; max-height:42vh; overflow:auto; }
    .craft-mat { display:flex; align-items:center; gap:6px; font-size:10px; padding:4px 6px; border-radius:4px; background:#1a120c; border:1px solid #2a1e14; }
    .craft-mat .mat-name { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .craft-mat .mat-qty { font-family:monospace; color:var(--gold); }
    .craft-suite-link { display:inline-block; margin-top:10px; font-size:11px; color:var(--gold); }
    .craft-log { font-size:10px; color:var(--muted); min-height:1.2em; }
    .craft-ssot-banner { font-size:10px; padding:8px 10px; border-radius:6px; border:1px solid rgba(212,168,67,.25); background:rgba(212,168,67,.06); color:var(--muted); line-height:1.4; }
    .craft-ssot-banner a { color:var(--gold); }
    .mp-btn { border:1px solid #3a2a1a; background:#221710; color:var(--text); padding:6px 10px; border-radius:6px; cursor:pointer; font-size:11px; text-decoration:none; display:inline-block; }
    .mp-btn.primary { border-color:#a67c12; color:#1a0f00; background:var(--gold); font-weight:700; }
    .mp-btn.ghost:hover { border-color:var(--gold); color:var(--gold); }

`;
  s = s.slice(0, lineStart) + cssNew + s.slice(end);
  console.log('CSS patched');
} else {
  console.log('CSS craft-embed-wrap not found (maybe already patched)');
}

// --- constants ---
if (s.includes("CRAFTING_SUITE_URL = 'https://grudge-crafting.puter.site/'")) {
  s = s.replace(
    /\/\*\* Production Puter crafting suite[\s\S]*?const CRAFTING_SUITE_URL = 'https:\/\/grudge-crafting\.puter\.site\/';/,
    `/**
   * Craft consolidation SSOT (no iframe):
   *  Full suite = grudgewarlords.com/craft/
   *  HUD panel  = ui.grudge-studio.com/main-panel.html?era=warlords&tab=craft
   *  Brand hub  = wcs.grudge-studio.com
   */
  const CRAFTING_SUITE_URL = 'https://grudgewarlords.com/craft/';
  const CRAFTING_PANEL_SSOT = 'https://ui.grudge-studio.com/main-panel.html?era=warlords&tab=craft';
  const WCS_HUB_URL = 'https://wcs.grudge-studio.com/';
  const CRAFTING_LEGACY_PUTER = 'https://grudge-crafting.puter.site/'`,
  );
  // fallback if comment encoding differs
  if (s.includes("grudge-crafting.puter.site/'") && s.includes('Production Puter')) {
    s = s.replace(
      "const CRAFTING_SUITE_URL = 'https://grudge-crafting.puter.site/';",
      `const CRAFTING_SUITE_URL = 'https://grudgewarlords.com/craft/';
  const CRAFTING_PANEL_SSOT = 'https://ui.grudge-studio.com/main-panel.html?era=warlords&tab=craft';
  const WCS_HUB_URL = 'https://wcs.grudge-studio.com/';
  const CRAFTING_LEGACY_PUTER = 'https://grudge-crafting.puter.site/';`,
    );
  }
  console.log('constants patched');
}

if (!s.includes('let craftProfFilter')) {
  s = s.replace(
    "let activeTab = 'Equipment';",
    "let activeTab = 'Equipment';\n  let craftProfFilter = 'all';",
  );
  console.log('craftProfFilter added');
}

// --- function ---
const fnStart = s.indexOf('function renderCraftingTab()');
const fnEnd = s.indexOf('function attachSlotListeners()', fnStart);
if (fnStart < 0 || fnEnd < 0) {
  console.error('Could not find renderCraftingTab / attachSlotListeners');
  process.exit(1);
}
let blockStart = s.lastIndexOf('Crafting Tab', fnStart);
if (blockStart < 0) blockStart = fnStart;
else {
  blockStart = s.lastIndexOf('\n', blockStart);
  // include // line
  const prev = s.lastIndexOf('\n', blockStart - 1);
  blockStart = prev >= 0 ? prev + 1 : blockStart;
}

const newFn = `// Crafting Tab (native — suite pop-out only; no iframe)
  function craftSuiteAuthedUrl() {
    const u = new URL(CRAFTING_SUITE_URL);
    u.searchParams.set('era', 'warlords');
    u.searchParams.set('from', 'info-main-panel');
    try {
      const token =
        localStorage.getItem('grudge_auth_token') ||
        localStorage.getItem('grudge.open.token') ||
        localStorage.getItem('sso_token') ||
        localStorage.getItem('grudge_token');
      if (token) {
        u.searchParams.set('sso_token', token);
        u.searchParams.set('grudge_token', token);
      }
    } catch (_) {}
    const cid = new URLSearchParams(location.search).get('characterId');
    if (cid) u.searchParams.set('characterId', cid);
    return u.toString();
  }

  function craftRecipeList() {
    const list = Array.isArray(allRecipes) ? allRecipes : [];
    const out = [];
    for (const r of list.slice(0, 120)) {
      const id = r.id || r.uuid || r.key || r.name;
      if (!id) continue;
      const mats = r.materials || r.ingredients || r.inputs || r.requires || {};
      let inputs = [];
      if (Array.isArray(mats)) {
        inputs = mats.map((m) => ({
          id: m.id || m.materialId || m.name,
          name: m.name || m.id,
          qty: m.qty || m.quantity || 1,
        }));
      } else if (mats && typeof mats === 'object') {
        inputs = Object.entries(mats).map(([name, qty]) => ({
          id: String(name).toLowerCase().replace(/\\s+/g, '_'),
          name,
          qty: Number(qty) || 1,
        }));
      }
      out.push({
        id: String(id),
        name: r.name || r.title || String(id),
        profession: (r.profession || r.craftedBy || r.station || 'craft').toString().toLowerCase(),
        tier: r.tier ?? r.itemTier ?? null,
        type: r.type || r.category || '',
        inputs,
        output: {
          id: r.resultItemId || r.outputId || id,
          name: r.resultName || r.outputName || r.name || id,
          qty: r.outputQty || 1,
        },
        icon: r.icon || r.iconUrl || null,
        desc: r.description || r.desc || '',
      });
    }
    return out;
  }

  function bagQtyDemo(idOrName) {
    const key = String(idOrName || '').toLowerCase();
    if (!key) return 0;
    if (/iron|ore|wood|plank|leather|cloth|herb|water|copper|pine/.test(key)) return 8;
    return 2;
  }

  function renderCraftingTab() {
    const recipes = craftRecipeList();
    const catalogHint = recipes.length
      ? recipes.length + ' recipes from ObjectStore'
      : 'loading catalog…';
    const suiteUrl = craftSuiteAuthedUrl();
    const panelSsot = typeof CRAFTING_PANEL_SSOT !== 'undefined' ? CRAFTING_PANEL_SSOT : 'https://ui.grudge-studio.com/main-panel.html?era=warlords&tab=craft';
    const wcsHub = typeof WCS_HUB_URL !== 'undefined' ? WCS_HUB_URL : 'https://wcs.grudge-studio.com/';
    const profs = ['all', ...new Set(recipes.map((r) => r.profession).filter(Boolean))].slice(0, 12);
    let filtered = recipes;
    if (craftProfFilter && craftProfFilter !== 'all') {
      filtered = recipes.filter((r) => r.profession === craftProfFilter);
    }
    const cards =
      filtered
        .slice(0, 48)
        .map((r) => {
          const ok =
            !r.inputs.length ||
            r.inputs.every((i) => bagQtyDemo(i.id) >= i.qty || bagQtyDemo(i.name) >= i.qty);
          const matsLine = r.inputs.length
            ? r.inputs
                .map((i) => esc(i.name) + ' ' + (bagQtyDemo(i.id) || bagQtyDemo(i.name)) + '/' + i.qty)
                .join(' · ')
            : esc(r.desc || r.type || '');
          let ic = '⚙';
          if (r.icon) {
            const src = String(r.icon).startsWith('http')
              ? r.icon
              : String(r.icon).startsWith('/')
                ? 'https://assets.grudge-studio.com' + r.icon
                : r.icon;
            ic =
              '<img class="craft-icon" src="' +
              esc(src) +
              '" alt="" loading="lazy" onerror="this.style.display=\\'none\\'"/>';
          }
          return (
            '<button type="button" class="craft-card ' +
            (ok ? 'can-craft' : 'no-craft') +
            '" data-craft-id="' +
            esc(r.id) +
            '" title="' +
            esc(r.name) +
            '"><h4>' +
            ic +
            ' ' +
            esc(r.name) +
            '</h4><p>' +
            esc(r.profession) +
            (r.tier != null ? ' · T' + r.tier : '') +
            '</p><p>' +
            matsLine +
            '</p><p class="out">→ ' +
            esc(r.output?.name || r.name) +
            ' ×' +
            (r.output?.qty || 1) +
            '</p></button>'
          );
        })
        .join('') || '<p class="craft-log">No recipes loaded — open full suite.</p>';

    const matPreview = ['Iron Ore', 'Pine Wood', 'Leather Scraps', 'Cloth Scraps', 'Copper Ore']
      .map(
        (n) =>
          '<div class="craft-mat"><span class="mat-name">' +
          esc(n) +
          '</span><span class="mat-qty">×' +
          bagQtyDemo(n) +
          '</span></div>',
      )
      .join('');

    queueMicrotask(() => wireCraftChromeNative());

    return (
      '<div class="craft-shell">' +
      '<div class="craft-ssot-banner"><strong>Consolidated craft</strong> — HUD recipes here · full stations on ' +
      '<a href="' +
      esc(suiteUrl) +
      '" target="_blank" rel="noopener">grudgewarlords.com/craft</a> · panel SSOT ' +
      '<a href="' +
      esc(panelSsot) +
      '" target="_blank" rel="noopener">ui main-panel</a> · hub ' +
      '<a href="' +
      esc(wcsHub) +
      '" target="_blank" rel="noopener">wcs.grudge-studio.com</a>. Never iframe the suite.</div>' +
      '<div class="craft-toolbar"><div><h3>Warlords Craft</h3>' +
      '<span class="craft-auth-pill warn" id="craft-auth-status">' +
      esc(catalogHint) +
      ' · demo bag on info host</span></div>' +
      '<div class="craft-toolbar-right">' +
      '<button type="button" class="mp-btn ghost" id="btn-craft-reload">↻ Reload</button>' +
      '<button type="button" class="mp-btn ghost" id="btn-craft-popout">↗ Full suite</button>' +
      '<a class="mp-btn primary" href="' +
      esc(suiteUrl) +
      '" target="_blank" rel="noopener">Open suite</a></div></div>' +
      '<p class="craft-sub">Shared <strong>account bag</strong> · profession XP on active character · native panel (no Puter iframe)</p>' +
      '<div class="craft-layout"><div class="craft-main">' +
      '<div class="craft-filter" id="craft-filter">' +
      profs
        .map(
          (p) =>
            '<button type="button" class="craft-filter-btn ' +
            (craftProfFilter === p ? 'active' : '') +
            '" data-cf="' +
            esc(p) +
            '">' +
            esc(p) +
            '</button>',
        )
        .join('') +
      '</div><div class="craft-grid" id="craft-host">' +
      cards +
      '</div><p class="craft-log" id="craft-log">Click a recipe · Full suite for Railway spend/XP</p></div>' +
      '<aside class="craft-side"><div class="craft-side-head"><h4>Materials</h4><span class="craft-bag-meta">demo</span></div>' +
      '<div class="craft-mat-grid">' +
      matPreview +
      '</div><a class="craft-suite-link" href="' +
      esc(suiteUrl) +
      '" target="_blank" rel="noopener">Stations · benches · full WCS ↗</a></aside></div></div>'
    );
  }

  function wireCraftChromeNative() {
    document.getElementById('btn-craft-popout')?.addEventListener('click', () => {
      window.open(craftSuiteAuthedUrl(), '_blank', 'noopener');
    });
    document.getElementById('btn-craft-reload')?.addEventListener('click', () => {
      if (typeof init === 'function') Promise.resolve(init()).finally(() => switchTab('Crafting'));
      else switchTab('Crafting');
    });
    document.querySelectorAll('#craft-filter [data-cf]').forEach((btn) => {
      btn.addEventListener('click', () => {
        craftProfFilter = btn.getAttribute('data-cf') || 'all';
        switchTab('Crafting');
      });
    });
    document.querySelectorAll('#craft-host [data-craft-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-craft-id');
        const log = document.getElementById('craft-log');
        if (log) log.textContent = 'Recipe ' + id + ' — open Full suite for Railway craft + profession XP';
      });
    });
  }

`;

s = s.slice(0, blockStart) + newFn + s.slice(fnEnd);
fs.writeFileSync(p, s, 'utf8');

const stillIframe = /function renderCraftingTab\(\)[\s\S]{0,900}iframe/.test(s);
console.log({
  before,
  after: s.length,
  stillIframe,
  hasShell: s.includes('craft-shell'),
  hasSuite: s.includes('grudgewarlords.com/craft'),
  puterConst: s.includes("CRAFTING_SUITE_URL = 'https://grudge-crafting.puter.site/'"),
});
if (stillIframe || !s.includes('craft-shell')) {
  process.exit(1);
}
console.log('OK patched', p);
