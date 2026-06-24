/**
 * Build per-weapon skill tiers from ObjectStore master-weapons fields:
 * signature, abilities[], passives[].
 */
(function (global) {
  function parseSkillLine(line) {
    if (!line) return { name: '', desc: '' };
    const n = String(line).split('(')[0].trim();
    const d = String(line).includes('(')
      ? (String(line).match(/\((.+)\)/) || [])[1] || ''
      : '';
    return { name: n, desc: d };
  }

  function buildWeaponSkillTiers(weapon) {
    if (!weapon) return [];

    const abilities = (weapon.abilities || []).map((a) => {
      const p = parseSkillLine(a);
      return { name: p.name, desc: p.desc, type: 'ability' };
    });
    const passives = (weapon.passives || []).map((p) => {
      const parsed = parseSkillLine(p);
      return { name: parsed.name, desc: parsed.desc, type: 'passive' };
    });
    const sig = weapon.signature
      ? (() => {
          const p = parseSkillLine(weapon.signature);
          return { name: p.name, desc: p.desc, type: 'sig' };
        })()
      : null;

    const tiers = [];
    const ab = [...abilities];
    const pa = [...passives];

    const t1 = [];
    if (sig) t1.push(sig);
    if (ab.length) t1.push(ab.shift());
    if (t1.length) tiers.push({ tier: 1, label: 'T1', nodes: t1 });

    const t2 = [];
    if (ab.length) t2.push(ab.shift());
    if (ab.length) t2.push(ab.shift());
    if (t2.length) tiers.push({ tier: 2, label: 'T2', nodes: t2 });

    const t3 = [];
    if (ab.length) t3.push(ab.shift());
    if (pa.length) t3.push(pa.shift());
    if (t3.length) tiers.push({ tier: 3, label: 'T3', nodes: t3 });

    const t4 = [];
    if (ab.length) t4.push(ab.shift());
    if (ab.length) t4.push(ab.shift());
    if (t4.length) tiers.push({ tier: 4, label: 'T4', nodes: t4 });

    let tierNum = 5;
    while (ab.length || pa.length) {
      const tn = [];
      if (ab.length) tn.push(ab.shift());
      if (pa.length) tn.push(pa.shift());
      if (tn.length) tiers.push({ tier: tierNum, label: 'T' + tierNum, nodes: tn });
      tierNum += 1;
      if (tierNum > 8) break;
    }

    return tiers;
  }

  function esc(s) {
    return s
      ? String(s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
      : '';
  }

  /**
   * Render tier rows as HTML. Options:
   *   asset(url) — optional path prefixer for icons
   *   lockedAfterTier — tiers above this are styled locked (default 3)
   *   showHeader — include weapon title block (default true)
   */
  function renderWeaponSkillTreeHTML(weapon, opts) {
    const options = opts || {};
    const asset = options.asset || ((u) => u);
    const lockedAfter = options.lockedAfterTier ?? 3;
    const tiers = buildWeaponSkillTiers(weapon);
    if (!tiers.length) {
      return '<div class="wst-empty">No skill data for this weapon.</div>';
    }

    let html = '';
    if (options.showHeader !== false) {
      const icon = weapon.iconUrl ? asset(weapon.iconUrl) : '';
      const tierColor = options.tierColor || '#d4a84b';
      html += `<div class="wst-header">
        ${icon ? `<img class="wst-icon" src="${esc(icon)}" alt="" onerror="this.style.display='none'">` : ''}
        <div>
          <div class="wst-title">${esc(weapon.name || weapon.baseName || 'Weapon')}</div>
          ${weapon.lore || weapon.description ? `<div class="wst-lore">${esc(weapon.lore || weapon.description)}</div>` : ''}
          <div class="wst-meta"><span style="color:${esc(tierColor)}">${esc(weapon.tierLabel || ('T' + (weapon.tier || 1)))}</span>${weapon.craftedBy ? ` · 🔨 ${esc(weapon.craftedBy)}` : ''}</div>
        </div>
      </div>`;
    }

    html += '<div class="tree-container">';
    html += `<div class="tree-title">⚔ ${esc(weapon.name || 'Weapon')} — Skill Tree</div>`;

    tiers.forEach((t) => {
      html += '<div class="tier-row">';
      const badgeClass = t.tier <= 1 ? 'active' : t.tier <= lockedAfter ? 'unlocked' : '';
      html += `<div class="tier-marker"><div class="tier-badge ${badgeClass}">${esc(t.label)}</div><div class="tier-line"></div></div>`;
      html += '<div class="tier-nodes">';
      t.nodes.forEach((node) => {
        const locked = t.tier > lockedAfter ? ' locked' : '';
        const typeLabel = node.type === 'sig' ? 'SIGNATURE' : node.type === 'passive' ? 'PASSIVE' : 'ABILITY';
        html += `<div class="tree-node ${esc(node.type)}${locked}">
          <span class="node-type">${typeLabel}</span>
          <div class="node-name">${esc(node.name)}</div>
          ${node.desc ? `<div class="node-desc">${esc(node.desc)}</div>` : ''}
        </div>`;
      });
      html += '</div></div>';
    });

    html += '</div>';
    return html;
  }

  global.WeaponSkillTree = {
    parseSkillLine,
    buildWeaponSkillTiers,
    renderWeaponSkillTreeHTML,
  };
})(typeof window !== 'undefined' ? window : globalThis);