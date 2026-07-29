/**
 * Main Panel character systems — profession trees, class skill trees, attributes.
 * Ported from profession-trees.html + character-builder.html for in-panel use.
 * Character-owned only: show what the hero has; spend only when points remain.
 */
(function (global) {
  'use strict';

  const CDN = 'https://assets.grudge-studio.com';

  /** Demo character state (replace with Railway/fleet sync later). */
  function defaultCharState(attrsList) {
    const attrs = {};
    (attrsList || []).forEach((a) => {
      attrs[a.id] = a.id === 'strength' || a.id === 'vitality' ? 12 : a.id === 'dexterity' ? 8 : 5;
    });
    return {
      level: 12,
      classKey: 'warrior',
      raceKey: 'human',
      /** Unspent attribute points from level-ups */
      attrPointsAvailable: 14,
      /** Spent points per attribute id */
      attrs,
      /** Unspent class skill points */
      classSkillPointsAvailable: 6,
      /** skillId → invested points */
      classSkills: { w_taunt: 1, w_quick_strike: 1 },
      /** profession key → level */
      professionLevels: { miner: 10, forester: 4, mystic: 2, chef: 3, engineer: 1 },
      /** unlocked profession node ids per prof key */
      professionNodes: { miner: [0, 1, 2], forester: [0], mystic: [], chef: [0], engineer: [] },
    };
  }

  const CLASS_KEY_FROM_NAME = {
    Warrior: 'warrior',
    'Mage Priest': 'mage',
    Mage: 'mage',
    Ranger: 'ranger',
    Worge: 'worge',
  };

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function attrIcon(attr) {
    if (attr?.iconCdn) return attr.iconCdn;
    if (attr?.icon) return CDN + '/' + String(attr.icon).replace(/^game-assets\//, '');
    return CDN + '/icons/sigils/' + (attr?.id || 'strength') + '.png';
  }

  function skillIcon(path) {
    if (!path) return '';
    if (/^https?:/i.test(path)) return path;
    return CDN + (path.startsWith('/') ? path : '/' + path);
  }

  function effectivePoints(raw) {
    if (raw <= 25) return raw;
    if (raw <= 50) return 25 + (raw - 25) * 0.5;
    return 25 + 12.5 + (raw - 50) * 0.25;
  }

  // ── Attributes (character-owned + spend available points) ───────────
  function renderAttributesPanel(ctx) {
    const { char, attributes } = ctx;
    if (!attributes?.length) {
      return '<div class="section-title">Attributes</div><p style="color:var(--muted)">Attribute data not loaded.</p>';
    }
    const avail = char.attrPointsAvailable | 0;
    let html = `<div class="section-title">Character Attributes</div>
      <div class="mp-char-meta">Lv ${char.level} · ${esc(ctx.classLabel || char.classKey)} · ${esc(ctx.raceLabel || char.raceKey)}</div>
      <div class="attr-points-bar">
        <span class="pts-label">Unspent points:</span>
        <span class="pts-val" id="mpAttrAvail">${avail}</span>
        <span class="pts-label" style="margin-left:12px">Only your hero’s spent values shown — spend when you have points.</span>
      </div>
      <div class="mp-attr-grid">`;

    attributes.forEach((a) => {
      const spent = char.attrs[a.id] | 0;
      const icon = attrIcon(a);
      const canPlus = avail > 0;
      const canMinus = spent > 0;
      const eff = effectivePoints(spent);
      html += `<div class="mp-attr-row" style="border-left-color:${a.color || 'var(--gold)'}">
        <div class="mp-attr-head">
          <img src="${esc(icon)}" alt="" class="mp-attr-icon" onerror="this.style.display='none'">
          <div>
            <div class="mp-attr-name" style="color:${a.color || 'var(--gold)'}">${esc(a.name)}</div>
            <div class="mp-attr-role">${esc(a.role || '')}</div>
          </div>
          <div class="mp-attr-val">${spent}<span class="mp-attr-eff">eff ${eff.toFixed(1)}</span></div>
        </div>
        <div class="mp-attr-desc">${esc(a.description || '')}</div>
        <div class="mp-attr-controls">
          <button type="button" class="mp-btn-sm" data-attr-minus="${esc(a.id)}" ${canMinus ? '' : 'disabled'}>−</button>
          <div class="mp-attr-bar"><div class="mp-attr-fill" style="width:${Math.min(100, spent)}%;background:${a.color || 'var(--gold)'}"></div></div>
          <button type="button" class="mp-btn-sm gold" data-attr-plus="${esc(a.id)}" ${canPlus ? '' : 'disabled'}>+</button>
        </div>
      </div>`;
    });
    html += `</div>
      <div style="margin-top:10px;font-size:10px;color:var(--dim)">Icons &amp; formulas from character-builder · diminishing returns after 25 / 50 points</div>`;
    return html;
  }

  function attachAttributeHandlers(root, char, onChange) {
    root.querySelectorAll('[data-attr-plus]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-attr-plus');
        if ((char.attrPointsAvailable | 0) <= 0) return;
        char.attrs[id] = (char.attrs[id] | 0) + 1;
        char.attrPointsAvailable -= 1;
        onChange();
      });
    });
    root.querySelectorAll('[data-attr-minus]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-attr-minus');
        if ((char.attrs[id] | 0) <= 0) return;
        char.attrs[id] -= 1;
        char.attrPointsAvailable += 1;
        onChange();
      });
    });
  }

  // ── Class skill tree (interactive, this class only) ─────────────────
  function resolveClassTree(skillTrees, classKey, className) {
    if (!skillTrees) return null;
    const trees = skillTrees.skillTrees || skillTrees;
    const key = (classKey || CLASS_KEY_FROM_NAME[className] || 'warrior').toLowerCase();
    if (trees[key]) return { key, tree: trees[key] };
    // match by className
    for (const [k, t] of Object.entries(trees)) {
      if (String(t.className || '').toLowerCase() === String(className || '').toLowerCase()) {
        return { key: k, tree: t };
      }
    }
    const first = Object.keys(trees)[0];
    return first ? { key: first, tree: trees[first] } : null;
  }

  function renderClassSkillTree(ctx) {
    const { char, skillTrees } = ctx;
    const resolved = resolveClassTree(skillTrees, char.classKey, ctx.classLabel);
    if (!resolved?.tree) {
      return `<div class="section-title">Class Skills</div><p style="color:var(--muted)">No class skill tree loaded.</p>`;
    }
    const { tree } = resolved;
    const color = tree.color || 'var(--gold)';
    const avail = char.classSkillPointsAvailable | 0;
    const level = char.level | 0;

    let html = `<div class="section-title">Class Skill Tree — ${esc(tree.className || resolved.key)}</div>
      <div class="mp-char-meta">Hero level ${level} · Unspent skill points: <strong style="color:var(--gold)">${avail}</strong>
        · Only your class · click a skill to invest when unlocked</div>
      <div class="mp-class-tree">`;

    (tree.tiers || []).forEach((tier) => {
      const unlocked = level >= (tier.requiredLevel | 0);
      html += `<div class="mp-tier ${unlocked ? 'unlocked' : 'locked'}">
        <div class="mp-tier-head" style="border-left-color:${color}">
          <span>${esc(tier.name || 'Tier')}</span>
          <span class="mp-tier-req">${unlocked ? '✓' : '🔒'} Lv ${tier.requiredLevel | 0}</span>
        </div>
        <div class="mp-skill-chips">`;

      (tier.skills || []).forEach((sk) => {
        const pts = char.classSkills[sk.id] | 0;
        const max = sk.maxPoints | 0 || 1;
        const reqOk = !sk.requires || (char.classSkills[sk.requires] | 0) > 0;
        const canInvest = unlocked && reqOk && avail > 0 && pts < max;
        const has = pts > 0;
        const icon = skillIcon(sk.iconUrl || sk.icon);
        html += `<button type="button" class="mp-skill-chip ${has ? 'owned' : ''} ${canInvest ? 'can-invest' : ''} ${!unlocked || !reqOk ? 'locked' : ''}"
          data-class-skill="${esc(sk.id)}" ${canInvest ? '' : has && pts > 0 ? '' : 'data-locked="1"'}
          title="${esc(sk.name)}: ${esc(sk.description || sk.effect || '')}">
          ${icon ? `<img src="${esc(icon)}" alt="" onerror="this.style.display='none'">` : ''}
          <div class="mp-sc-body">
            <div class="mp-sc-name">${esc(sk.name)} ${has ? `<span class="mp-sc-pts">${pts}/${max}</span>` : ''}</div>
            <div class="mp-sc-desc">${esc(sk.effect || sk.description || '')}</div>
            ${sk.requires ? `<div class="mp-sc-req">Requires: ${esc(sk.requires)}</div>` : ''}
            ${!unlocked ? `<div class="mp-sc-req">Requires character Lv ${tier.requiredLevel}</div>` : ''}
            ${canInvest ? `<div class="mp-sc-act">+ invest point</div>` : has ? `<div class="mp-sc-act owned-tag">Owned</div>` : ''}
          </div>
        </button>`;
      });
      html += `</div></div>`;
    });
    html += `</div>
      <div style="margin-top:8px;font-size:10px;color:var(--dim)">Data: master-skillTrees.json · full browser: <a href="./profession-trees.html#classes" style="color:var(--gold)">profession-trees.html</a></div>`;
    return html;
  }

  function attachClassSkillHandlers(root, char, skillTrees, classLabel, onChange) {
    const resolved = resolveClassTree(skillTrees, char.classKey, classLabel);
    if (!resolved?.tree) return;
    const skillMap = {};
    (resolved.tree.tiers || []).forEach((t) => {
      (t.skills || []).forEach((sk) => {
        skillMap[sk.id] = { skill: sk, reqLevel: t.requiredLevel | 0 };
      });
    });
    root.querySelectorAll('[data-class-skill]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-class-skill');
        const meta = skillMap[id];
        if (!meta) return;
        if ((char.level | 0) < meta.reqLevel) return;
        if (meta.skill.requires && !(char.classSkills[meta.skill.requires] | 0)) return;
        const max = meta.skill.maxPoints | 0 || 1;
        const pts = char.classSkills[id] | 0;
        if (pts >= max) return;
        if ((char.classSkillPointsAvailable | 0) <= 0) return;
        char.classSkills[id] = pts + 1;
        char.classSkillPointsAvailable -= 1;
        onChange();
      });
    });
  }

  // ── Profession trees (SVG, character levels / unlocks) ──────────────
  function renderProfessionsPanel(ctx) {
    const { char, professionTrees } = ctx;
    if (!professionTrees?.professions) {
      return `<div class="section-title">Professions</div>
        <p style="color:var(--muted)">Profession trees not loaded. <a href="./profession-trees.html" style="color:var(--gold)">Open standalone →</a></p>`;
    }
    const keys = Object.keys(professionTrees.professions);
    const active = ctx.activeProfession || keys[0];
    let tabs = keys
      .map((k) => {
        const p = professionTrees.professions[k];
        const lv = char.professionLevels[k] | 0;
        const on = k === active;
        return `<button type="button" class="mp-prof-tab ${on ? 'active' : ''}" data-prof="${esc(k)}">
          ${p.iconImage ? `<img src="${esc(p.iconImage)}" alt="" onerror="this.remove()">` : ''}
          ${esc(p.icon || '')} ${esc(p.name)} <span class="mp-prof-lv">Lv ${lv}</span>
        </button>`;
      })
      .join('');

    return `<div class="section-title">Profession Trees</div>
      <div class="mp-char-meta">Interactive tree from profession-trees.html · nodes unlock with profession level · click unlocked nodes to learn</div>
      <div class="mp-prof-tabs">${tabs}</div>
      <div class="mp-tree-container" id="mpTreeContainer">
        <div class="mp-tree-bg" id="mpTreeBg"></div>
        <svg class="mp-tree-svg" id="mpTreeSvg"></svg>
        <div class="mp-tree-legend" id="mpTreeLegend"></div>
        <div class="mp-tree-info" id="mpTreeInfo"></div>
      </div>
      <div style="margin-top:8px;font-size:10px;color:var(--dim)"><a href="./profession-trees.html#professions" style="color:var(--gold)">Full page →</a></div>
      <div class="mp-node-tooltip" id="mpNodeTooltip"></div>`;
  }

  function paintProfessionTree(ctx) {
    const { char, professionTrees, activeProfession } = ctx;
    const prof = professionTrees?.professions?.[activeProfession];
    if (!prof) return;

    const bg = document.getElementById('mpTreeBg');
    const svg = document.getElementById('mpTreeSvg');
    const legend = document.getElementById('mpTreeLegend');
    const info = document.getElementById('mpTreeInfo');
    if (!svg) return;

    if (bg) bg.style.backgroundImage = prof.bgImage ? `url(${prof.bgImage})` : 'none';
    if (info) {
      info.innerHTML = `<div class="pi-name">${esc(prof.icon || '')} ${esc(prof.name)}</div>
        <div class="pi-role">${esc(prof.role || '')}</div>
        <div class="pi-count">Your level: <strong style="color:var(--gold)">${char.professionLevels[activeProfession] | 0}</strong> · ${prof.totalNodes} nodes</div>`;
    }
    if (legend) {
      legend.innerHTML =
        `<h3>Branches</h3>` +
        (prof.branches || [])
          .map(
            (b) =>
              `<div class="legend-item"><div class="legend-dot" style="background:${b.color?.stroke || '#888'}"></div> ${esc(b.name)} (${b.nodeCount || 0})</div>`,
          )
          .join('');
    }

    const W = svg.clientWidth || 720;
    const H = svg.clientHeight || 420;
    const PAD = 36;
    const mapX = (x) => PAD + (x / 100) * (W - PAD * 2);
    const mapY = (y) => PAD + ((100 - y) / 100) * (H - PAD * 2);
    const profLv = char.professionLevels[activeProfession] | 0;
    const unlocked = new Set(char.professionNodes[activeProfession] || []);

    let svgContent = '';
    for (const node of prof.nodes || []) {
      if (node.parent !== null && node.parent !== undefined) {
        const parent = prof.nodes.find((n) => n.id === node.parent);
        if (parent) {
          const color = node.branchColor?.stroke || '#555';
          svgContent += `<line x1="${mapX(parent.x)}" y1="${mapY(parent.y)}" x2="${mapX(node.x)}" y2="${mapY(node.y)}" stroke="${color}" stroke-width="2" stroke-opacity="0.45"/>`;
        }
      }
    }

    for (const node of prof.nodes || []) {
      const cx = mapX(node.x);
      const cy = mapY(node.y);
      const color = node.branchColor?.stroke || '#d4a84b';
      const fill = node.branchColor?.fill || 'rgba(212,168,75,0.15)';
      const r = 15;
      const req = node.reqLevel | 0;
      const canLearn = profLv >= req && (node.parent === null || node.parent === undefined || unlocked.has(node.parent));
      const owned = unlocked.has(node.id);
      const opacity = owned ? 1 : canLearn ? 0.95 : 0.35;
      const strokeW = owned ? 3 : 2;
      const cls = `mp-node${owned ? ' owned' : ''}${canLearn && !owned ? ' can-learn' : ''}`;

      switch (node.nodeType) {
        case 'effect':
          svgContent += `<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${fill}" stroke="${color}" stroke-width="${strokeW}" opacity="${opacity}" class="${cls}" data-nid="${node.id}" style="cursor:pointer"/>`;
          break;
        case 'combat':
          svgContent += `<circle cx="${cx}" cy="${cy}" r="${r + 2}" fill="${fill}" stroke="${color}" stroke-width="${strokeW}" opacity="${opacity}" class="${cls}" data-nid="${node.id}" style="cursor:pointer"/>`;
          break;
        case 'recipe':
          svgContent += `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" rx="5" fill="${fill}" stroke="${color}" stroke-width="${strokeW}" opacity="${opacity}" class="${cls}" data-nid="${node.id}" style="cursor:pointer"/>`;
          break;
        default:
          svgContent += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${color}" stroke-width="${strokeW}" opacity="${opacity}" class="${cls}" data-nid="${node.id}" style="cursor:pointer"/>`;
      }
      const label = node.name.length > 14 ? node.name.slice(0, 12) + '…' : node.name;
      svgContent += `<text x="${cx}" y="${cy + r + 12}" text-anchor="middle" fill="${color}" font-size="8" font-weight="600" opacity="${opacity}">${esc(label)}</text>`;
      if (req > 0) {
        svgContent += `<text x="${cx + r + 2}" y="${cy - r + 2}" fill="#ef4444" font-size="7" opacity="0.8">Lv${req}</text>`;
      }
      if (owned) {
        svgContent += `<text x="${cx}" y="${cy + 3}" text-anchor="middle" fill="#22c55e" font-size="10" font-weight="700">✓</text>`;
      }
    }
    svg.innerHTML = svgContent;

    const tip = document.getElementById('mpNodeTooltip');
    svg.querySelectorAll('.mp-node').forEach((el) => {
      el.addEventListener('mouseenter', (e) => {
        const id = parseInt(el.dataset.nid, 10);
        const node = prof.nodes.find((n) => n.id === id);
        if (!node || !tip) return;
        const bonuses = (node.bonuses || [])
          .map((b) => `<div class="tt-bonus">+${b.value}% ${esc(b.type)} (${esc(b.target)})</div>`)
          .join('');
        const unlocks = (node.unlocks || []).length
          ? `<div class="tt-unlock">Unlocks: ${esc(node.unlocks.join(', '))}</div>`
          : '';
        const req = node.reqLevel > 0 ? `<div class="tt-req">Requires profession Lv ${node.reqLevel}</div>` : '';
        const state = unlocked.has(node.id)
          ? '<div class="tt-unlock">Learned</div>'
          : canLearnNode(char, activeProfession, node, unlocked)
            ? '<div class="tt-unlock">Click to learn</div>'
            : '<div class="tt-req">Locked</div>';
        tip.innerHTML = `<div class="tt-name">${esc(node.name)}</div><div class="tt-desc">${esc(node.description || '')}</div>${bonuses}${unlocks}${req}${state}`;
        tip.style.display = 'block';
        tip.style.left = e.clientX + 12 + 'px';
        tip.style.top = e.clientY + 12 + 'px';
      });
      el.addEventListener('mousemove', (e) => {
        if (!tip) return;
        tip.style.left = e.clientX + 12 + 'px';
        tip.style.top = e.clientY + 12 + 'px';
      });
      el.addEventListener('mouseleave', () => {
        if (tip) tip.style.display = 'none';
      });
      el.addEventListener('click', () => {
        const id = parseInt(el.dataset.nid, 10);
        const node = prof.nodes.find((n) => n.id === id);
        if (!node) return;
        const set = new Set(char.professionNodes[activeProfession] || []);
        if (set.has(id)) return;
        if (!canLearnNode(char, activeProfession, node, set)) return;
        set.add(id);
        char.professionNodes[activeProfession] = [...set];
        if (typeof ctx.onProfessionChange === 'function') ctx.onProfessionChange();
        else paintProfessionTree(ctx);
      });
    });
  }

  function canLearnNode(char, profKey, node, unlockedSet) {
    const lv = char.professionLevels[profKey] | 0;
    if (lv < (node.reqLevel | 0)) return false;
    if (node.parent !== null && node.parent !== undefined && !unlockedSet.has(node.parent)) return false;
    return true;
  }

  function attachProfessionHandlers(root, ctx) {
    root.querySelectorAll('[data-prof]').forEach((btn) => {
      btn.addEventListener('click', () => {
        ctx.activeProfession = btn.getAttribute('data-prof');
        if (typeof ctx.onProfessionChange === 'function') ctx.onProfessionChange();
      });
    });
    // paint after layout
    requestAnimationFrame(() => paintProfessionTree(ctx));
  }

  // ── Skills tab shell (weapon + class subnav) ────────────────────────
  function renderSkillsShell(weaponHtml, classHtml, sub) {
    const s = sub || 'weapon';
    return `<div class="mp-subtabs">
        <button type="button" class="mp-subtab ${s === 'weapon' ? 'active' : ''}" data-skills-sub="weapon">⚔ Weapon skills</button>
        <button type="button" class="mp-subtab ${s === 'class' ? 'active' : ''}" data-skills-sub="class">🛡 Class skill tree</button>
      </div>
      <div id="mpSkillsBody">${s === 'class' ? classHtml : weaponHtml}</div>`;
  }

  global.MainPanelSystems = {
    CDN,
    defaultCharState,
    CLASS_KEY_FROM_NAME,
    renderAttributesPanel,
    attachAttributeHandlers,
    renderClassSkillTree,
    attachClassSkillHandlers,
    renderProfessionsPanel,
    paintProfessionTree,
    attachProfessionHandlers,
    renderSkillsShell,
    resolveClassTree,
    attrIcon,
    skillIcon,
    esc,
  };
})(typeof window !== 'undefined' ? window : globalThis);
