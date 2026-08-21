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
    Raider: 'raider',
    Mage: 'mage',
    Priest: 'priest',
    'Mage Priest': 'mage',
    Ranger: 'ranger',
    Thief: 'thief',
    Worge: 'worge',
    Verduror: 'verduror',
  };

  const FAMILY_OF = {
    warrior: 'warrior', raider: 'warrior',
    mage: 'mage', priest: 'mage',
    ranger: 'ranger', thief: 'ranger',
    worge: 'worge', verduror: 'worge',
  };

  const FAMILY_SPECS = {
    warrior: ['warrior', 'raider'],
    mage: ['mage', 'priest'],
    ranger: ['ranger', 'thief'],
    worge: ['worge', 'verduror'],
  };

  /** Race / class base bonuses (character-builder SSOT) */
  const CLASS_ATTR_BONUSES = {
    warrior: { strength: 2, vitality: 1, endurance: 1, tactics: 1 },
    raider: { strength: 3, endurance: 1, dexterity: 1 },
    mage: { intellect: 3, wisdom: 2 },
    priest: { wisdom: 3, intellect: 1, tactics: 1 },
    ranger: { dexterity: 2, agility: 2, tactics: 1 },
    thief: { agility: 3, dexterity: 2 },
    worge: { strength: 1, vitality: 2, endurance: 1, agility: 1 },
    verduror: { wisdom: 2, vitality: 1, agility: 1 },
  };
  const RACE_ATTR_BONUSES = {
    human: { strength: 2, vitality: 2, intellect: 1 },
    elf: { intellect: 2, dexterity: 1, wisdom: 2 },
    dwarf: { vitality: 2, endurance: 2, wisdom: 1 },
    orc: { strength: 2, vitality: 1, endurance: 2 },
    barbarian: { strength: 2, vitality: 2, endurance: 1 },
    undead: { intellect: 2, wisdom: 3 },
  };

  /** Fallback equip rules if class-equipment-rules.json not loaded */
  const CLASS_EQUIP_FALLBACK = {
    warrior: {
      dualWield: true,
      armorTypes: ['plate', 'mail'],
      weaponTypes: ['shields', 'swords', 'greatswords', 'axes1h', 'greataxes', 'hammers1h', 'hammers2h'],
      animPacks: { sword_shield: true, dual_wield: true, two_handed: true },
      defaultLoadout: { main: 'swords', off: 'shields', style: 'sword_shield' },
    },
    mage: {
      dualWield: false,
      armorTypes: ['cloth'],
      weaponTypes: ['fireStaves', 'frostStaves', 'holyStaves', 'lightningStaves', 'arcaneStaves', 'natureStaves'],
      animPacks: { magic_spell: true },
      defaultLoadout: { main: 'arcaneStaves', off: 'tomes', style: 'magic_spell' },
    },
    ranger: {
      dualWield: false,
      armorTypes: ['leather', 'mail'],
      weaponTypes: ['bows', 'crossbows', 'guns', 'daggers', 'greatswords', 'spears'],
      animPacks: { longbow: true, rifle: true, two_handed: true },
      defaultLoadout: { main: 'bows', off: null, style: 'longbow' },
    },
    worge: {
      dualWield: false,
      armorTypes: ['leather'],
      weaponTypes: ['fireStaves', 'natureStaves', 'spears', 'daggers', 'bows', 'hammers1h'],
      animPacks: { sword_shield: true, magic_spell: true, longbow: true },
      defaultLoadout: { main: 'hammers1h', off: null, style: 'sword_shield' },
    },
    raider: {
      dualWield: false,
      armorTypes: ['plate', 'mail'],
      weaponTypes: ['greatswords', 'greataxes', 'hammers2h'],
      animPacks: { two_handed: true },
      defaultLoadout: { main: 'greatswords', off: null, style: 'two_handed' },
    },
    priest: {
      dualWield: false,
      armorTypes: ['cloth'],
      weaponTypes: ['holyStaves', 'arcaneStaves', 'tomes'],
      animPacks: { magic_spell: true },
      defaultLoadout: { main: 'holyStaves', off: 'tomes', style: 'magic_spell' },
    },
    thief: {
      dualWield: true,
      armorTypes: ['leather'],
      weaponTypes: ['daggers', 'swords', 'pistols'],
      animPacks: { dual_wield: true, rifle: true },
      defaultLoadout: { main: 'daggers', off: 'pistols', style: 'dual_wield' },
    },
    verduror: {
      dualWield: false,
      armorTypes: ['leather', 'cloth'],
      weaponTypes: ['natureStaves', 'hammers1h'],
      animPacks: { magic_spell: true, sword_shield: true },
      defaultLoadout: { main: 'natureStaves', off: null, style: 'magic_spell' },
    },
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

  function normalizeRaceKey(race) {
    return String(race || 'human')
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  function getClassEquipRules(classKey, rulesDoc) {
    const key = (classKey || 'warrior').toLowerCase();
    const fromDoc = rulesDoc?.classes?.[key];
    if (fromDoc) return fromDoc;
    return Object.assign({ id: key, name: key }, CLASS_EQUIP_FALLBACK[key] || CLASS_EQUIP_FALLBACK.warrior);
  }

  function getAttrTotal(char, attrId, classKey, raceKey) {
    const spent = char.attrs[attrId] | 0;
    const cb = CLASS_ATTR_BONUSES[classKey] || {};
    const rb = RACE_ATTR_BONUSES[normalizeRaceKey(raceKey)] || {};
    return spent + (cb[attrId] | 0) + (rb[attrId] | 0);
  }

  function calculateDerivedStats(char, attributes, classKey, raceKey) {
    const stats = {
      health: 250,
      mana: 100,
      stamina: 100,
      damage: 0,
      defense: 0,
      block: 0,
      blockEffect: 0,
      evasion: 0,
      accuracy: 0,
      criticalChance: 0,
      criticalDamage: 0,
      attackSpeed: 0,
      movementSpeed: 0,
      resistance: 0,
      manaRegen: 0,
      healthRegen: 0,
      cooldownReduction: 0,
      stagger: 0,
      armor: 0,
      damageReduction: 0,
      dodge: 0,
    };
    const ck = (classKey || char.classKey || 'warrior').toLowerCase();
    const rk = raceKey || char.raceKey || 'human';
    (attributes || []).forEach((a) => {
      const raw = getAttrTotal(char, a.id, ck, rk);
      const eff = effectivePoints(raw);
      if (eff <= 0 || !a.gains) return;
      Object.entries(a.gains).forEach(([key, g]) => {
        if (stats[key] === undefined) return;
        const flatGain = g.flat !== undefined ? g.flat : g.value || 0;
        stats[key] += flatGain * eff;
      });
    });
    const tacticsEff = effectivePoints(getAttrTotal(char, 'tactics', ck, rk));
    if (tacticsEff > 0) {
      const bonus = tacticsEff * 0.5;
      Object.keys(stats).forEach((k) => {
        if (k === 'health' || k === 'mana' || k === 'stamina') return;
        if (typeof stats[k] === 'number') stats[k] *= 1 + bonus / 100;
      });
    }
    // Class skill bonuses from invested tree nodes
    return stats;
  }

  function applySkillTreeStatBonuses(stats, char, skillTrees, classLabel) {
    const resolved = resolveClassTree(skillTrees, char.classKey, classLabel);
    if (!resolved?.tree) return stats;
    (resolved.tree.tiers || []).forEach((tier) => {
      (tier.skills || []).forEach((sk) => {
        const pts = char.classSkills[sk.id] | 0;
        if (pts <= 0 || !sk.bonuses) return;
        Object.entries(sk.bonuses).forEach(([k, v]) => {
          if (typeof stats[k] === 'number') stats[k] += Number(v) * pts;
        });
      });
    });
    return stats;
  }

  /** Hero score — same formula as character-builder combat power */
  function calculateCombatPower(stats) {
    const ehp = stats.health * (1 + stats.defense / 100) * (1 + (stats.resistance || 0) / 100);
    const dps =
      (stats.damage + 10) *
      (1 + (stats.criticalChance / 100) * ((stats.criticalDamage || 50) / 100)) *
      (1 + (stats.attackSpeed || 0) / 100);
    const utility =
      (stats.cooldownReduction || 0) * 2 + (stats.manaRegen || 0) * 10 + (stats.movementSpeed || 0) * 2;
    return Math.floor(ehp * 0.4 + dps * 2.5 + utility * 5);
  }

  function getBuildRating(cp) {
    if (cp > 5000) return { rating: 'S+', color: '#fbbf24', label: 'Legendary' };
    if (cp > 4500) return { rating: 'S', color: '#fbbf24', label: 'Elite' };
    if (cp > 3800) return { rating: 'A', color: '#a855f7', label: 'Strong' };
    if (cp > 3000) return { rating: 'B', color: '#e8eaf6', label: 'Solid' };
    if (cp > 2000) return { rating: 'C', color: '#94a3b8', label: 'Developing' };
    return { rating: 'D', color: '#9ca3af', label: 'Novice' };
  }

  function spiderAxes(stats) {
    const maxHP = 3000,
      maxDmg = 500,
      maxDef = 500;
    return {
      labels: ['Survivability', 'Damage', 'Utility', 'Mobility', 'Control', 'Magic'],
      data: [
        Math.min(100, (stats.health / maxHP) * 100 + (stats.defense / maxDef) * 50),
        Math.min(100, (stats.damage / maxDmg) * 100 + (stats.criticalChance || 0)),
        Math.min(100, (stats.cooldownReduction || 0) * 2 + (stats.manaRegen || 0) * 5),
        Math.min(100, (stats.movementSpeed || 0) * 5 + (stats.evasion || 0)),
        Math.min(100, (stats.block || 0) + (stats.stagger || 0) * 2),
        Math.min(100, (stats.resistance || 0) + stats.mana / 20),
      ],
    };
  }

  let _attrChart = null;

  function paintAttributeRadar(stats) {
    const canvas = document.getElementById('mpAttrSpider');
    if (!canvas || typeof global.Chart === 'undefined') return;
    const axes = spiderAxes(stats);
    if (_attrChart) {
      _attrChart.data.datasets[0].data = axes.data;
      _attrChart.update('none');
      return;
    }
    _attrChart = new global.Chart(canvas, {
      type: 'radar',
      data: {
        labels: axes.labels,
        datasets: [
          {
            label: 'Hero',
            data: axes.data,
            fill: true,
            backgroundColor: 'rgba(212, 175, 55, 0.16)',
            borderColor: '#d4af37',
            pointBackgroundColor: '#d4af37',
            pointBorderColor: '#1a1208',
            pointRadius: 3,
          },
          {
            label: 'Reference',
            data: [55, 55, 48, 48, 40, 42],
            fill: true,
            backgroundColor: 'rgba(165, 180, 208, 0.06)',
            borderColor: 'rgba(165,180,208,0.55)',
            borderDash: [4, 4],
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            labels: { color: '#a09070', font: { size: 10 }, boxWidth: 10 },
          },
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { display: false, backdropColor: 'transparent' },
            angleLines: { color: 'rgba(212,175,55,0.12)' },
            grid: { color: 'rgba(212,175,55,0.12)' },
            pointLabels: { color: '#c8b890', font: { size: 10, family: 'Cinzel, serif' } },
          },
        },
      },
    });
  }

  function destroyAttributeRadar() {
    if (_attrChart) {
      try {
        _attrChart.destroy();
      } catch (e) { /* ok */ }
      _attrChart = null;
    }
  }

  // ── Attributes tab: left score/spider/attrs · right class tree ──────
  function renderAttributesPanel(ctx) {
    const { char, attributes, skillTrees, equipRules, classCatalog } = ctx;
    if (!attributes?.length) {
      return '<div class="section-title">Attributes</div><p style="color:var(--muted)">Attribute data not loaded.</p>';
    }
    const ck = (char.classKey || CLASS_KEY_FROM_NAME[ctx.classLabel] || 'warrior').toLowerCase();
    const rk = char.raceKey || ctx.raceLabel || 'human';
    let stats = calculateDerivedStats(char, attributes, ck, rk);
    stats = applySkillTreeStatBonuses(stats, char, skillTrees, ctx.classLabel);
    const cp = calculateCombatPower(stats);
    const br = getBuildRating(cp);
    const avail = char.attrPointsAvailable | 0;
    const rules = getClassEquipRules(ck, equipRules);

    const leftAttrs = attributes
      .map((a) => {
        const spent = char.attrs[a.id] | 0;
        const total = getAttrTotal(char, a.id, ck, rk);
        const icon = attrIcon(a);
        const canPlus = avail > 0;
        const canMinus = spent > 0;
        const eff = effectivePoints(total);
        return `<div class="mp-attr-row mp-attr-row--compact" style="border-left-color:${a.color || 'var(--gold)'}">
        <div class="mp-attr-head">
          <img src="${esc(icon)}" alt="" class="mp-attr-icon" onerror="this.style.display='none'">
          <div class="mp-attr-titles">
            <div class="mp-attr-name" style="color:${a.color || 'var(--gold)'}">${esc(a.abbrev || a.name)}</div>
            <div class="mp-attr-role">${esc(a.name)}</div>
          </div>
          <div class="mp-attr-val">${total}<span class="mp-attr-eff">spent ${spent} · eff ${eff.toFixed(0)}</span></div>
        </div>
        <div class="mp-attr-controls">
          <button type="button" class="mp-btn-sm" data-attr-minus="${esc(a.id)}" ${canMinus ? '' : 'disabled'}>−</button>
          <div class="mp-attr-bar"><div class="mp-attr-fill" style="width:${Math.min(100, total)}%;background:${a.color || 'var(--gold)'}"></div></div>
          <button type="button" class="mp-btn-sm gold" data-attr-plus="${esc(a.id)}" ${canPlus ? '' : 'disabled'}>+</button>
        </div>
      </div>`;
      })
      .join('');

    const rightTree = renderClassSkillTree(
      Object.assign({}, ctx, {
        compact: true,
        equipRules,
        classCatalog,
        embedInAttributes: true,
      }),
    );

    return `<div class="mp-attr-split" data-mp-attr-split="1">
      <div class="mp-attr-left">
        <div class="mp-attr-hero-score">
          <div class="mp-score-block">
            <div class="mp-score-label">Hero score</div>
            <div class="mp-score-val" style="color:#fbbf24">${cp.toLocaleString()}</div>
            <div class="mp-score-sub">Combat power</div>
          </div>
          <div class="mp-score-block">
            <div class="mp-score-label">Build rating</div>
            <div class="mp-score-val" style="color:${br.color}">${br.rating}</div>
            <div class="mp-score-sub">${esc(br.label)}</div>
          </div>
          <div class="mp-score-meta">
            <div>Lv <strong>${char.level}</strong></div>
            <div>${esc(ctx.classLabel || rules.name || ck)}</div>
            <div>${esc(ctx.raceLabel || rk)}</div>
            <div class="mp-pts">Points <strong id="mpAttrAvail">${avail}</strong></div>
          </div>
        </div>
        <div class="mp-spider-wrap">
          <canvas id="mpAttrSpider" width="320" height="260" aria-label="Attribute spider graph"></canvas>
        </div>
        <div class="mp-attr-stat-pills">
          <span title="Health">HP ${Math.floor(stats.health)}</span>
          <span title="Damage">DMG ${Math.floor(stats.damage)}</span>
          <span title="Defense">DEF ${Math.floor(stats.defense)}</span>
          <span title="Crit">CRIT ${(stats.criticalChance || 0).toFixed(1)}%</span>
          <span title="Mana">MP ${Math.floor(stats.mana)}</span>
        </div>
        <div class="section-title mp-attr-sec">Attributes</div>
        <div class="mp-attr-grid mp-attr-grid--compact">${leftAttrs}</div>
        <div class="mp-attr-footnote">Diminishing returns after 25 / 50 · class+race bonuses included · same score as character-builder</div>
      </div>
      <div class="mp-attr-right">
        ${rightTree}
      </div>
    </div>`;
  }

  function attachAttributeHandlers(root, char, onChange, extra) {
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
    // Class skills live on the right half of Attributes tab
    if (extra?.skillTrees) {
      attachClassSkillHandlers(root, char, extra.skillTrees, extra.classLabel, onChange);
    }
    // Radar after paint
    requestAnimationFrame(() => {
      if (!extra?.attributes) return;
      let stats = calculateDerivedStats(char, extra.attributes, char.classKey, char.raceKey);
      stats = applySkillTreeStatBonuses(stats, char, extra.skillTrees, extra.classLabel);
      paintAttributeRadar(stats);
    });
  }

  // ── Class skill tree (interactive, this class only) ─────────────────
  function resolveClassTree(skillTrees, classKey, className) {
    if (!skillTrees) return null;
    const trees = skillTrees.skillTrees || skillTrees;
    const key = (classKey || CLASS_KEY_FROM_NAME[className] || 'warrior').toLowerCase();
    if (trees[key]) return { key, tree: trees[key] };
    for (const [k, t] of Object.entries(trees)) {
      if (String(t.className || '').toLowerCase() === String(className || '').toLowerCase()) {
        return { key: k, tree: t };
      }
    }
    const first = Object.keys(trees)[0];
    return first ? { key: first, tree: trees[first] } : null;
  }

  function renderEquipRulesStrip(rules) {
    if (!rules) return '';
    const dual = rules.dualWield
      ? `<span class="mp-rule-pill mp-rule-ok">Dual wield ✓</span>`
      : `<span class="mp-rule-pill mp-rule-no">No dual wield</span>`;
    const weapons = (rules.weaponTypes || []).slice(0, 8).map((w) => esc(w)).join(' · ');
    const armor = (rules.armorTypes || []).map((a) => esc(a)).join(' · ');
    const packs = rules.animPacks
      ? Object.keys(rules.animPacks)
          .map((p) => esc(p))
          .join(' · ')
      : '';
    const load = rules.defaultLoadout
      ? `${esc(rules.defaultLoadout.main || '—')}${rules.defaultLoadout.off ? ' + ' + esc(rules.defaultLoadout.off) : ''} → ${esc(rules.defaultLoadout.style || '')}`
      : '';
    return `<div class="mp-equip-rules">
      <div class="mp-equip-rules-title">Class equipment · mesh rules</div>
      <div class="mp-equip-rules-row">${dual}
        <span class="mp-rule-pill">Armor: ${armor || '—'}</span>
      </div>
      <div class="mp-equip-rules-detail"><strong>Weapons</strong> ${weapons || '—'}</div>
      <div class="mp-equip-rules-detail"><strong>Anim packs</strong> ${packs || '—'}</div>
      <div class="mp-equip-rules-detail"><strong>Default loadout</strong> ${load || '—'}</div>
      <div class="mp-equip-rules-note">Warrior and Thief dual-wield 1H. Raider is 2H only. Mage/Priest off-hand = tome/orb. Wire via class-equipment-rules.json.</div>
    </div>`;
  }

  function renderClassSkillTree(ctx) {
    const { char, skillTrees, equipRules, classCatalog } = ctx;
    const resolved = resolveClassTree(skillTrees, char.classKey, ctx.classLabel);
    if (!resolved?.tree) {
      return `<div class="section-title">Class Skills</div><p style="color:var(--muted)">No class skill tree loaded.</p>`;
    }
    const { tree, key } = resolved;
    const color = tree.color || 'var(--gold)';
    const avail = char.classSkillPointsAvailable | 0;
    const level = char.level | 0;
    const rules = getClassEquipRules(key, equipRules);
    const classAbilities =
      classCatalog?.classes?.[key]?.abilities ||
      classCatalog?.[key]?.abilities ||
      [];

    const family = FAMILY_OF[key] || key;
    const specs = FAMILY_SPECS[family] || [key];
    const identity = tree.specIdentity;
    const specBtns = specs
      .map((s) => {
        const on = s === key;
        return `<button type="button" class="mp-spec-btn ${on ? 'on' : ''}" data-spec-swap="${esc(s)}">${esc(s)}</button>`;
      })
      .join('');

    let html = `<div class="section-title">${ctx.embedInAttributes ? 'Class tree & passives' : 'Class Skill Tree'} — ${esc(tree.className || key)}</div>
      <div class="mp-char-meta">Hero Lv ${level} · Skill pts <strong style="color:var(--gold)">${avail}</strong>
        · Family <code>${esc(family)}</code>
        · L0 identity: <strong>${esc(identity?.name || '—')}</strong>
        · Prefab pack: <code>${esc(rules.prefabPack || key)}</code></div>
      <div class="mp-spec-row">
        <span class="mp-spec-lab">Spec</span>${specBtns}
        <button type="button" class="mp-spec-btn reset" data-class-reset="1">Reset points</button>
      </div>
      <p class="mp-spec-note">Swap connected specs by resetting points and picking a different L0. Rewrite the same spec by reset + same L0.</p>
      ${renderEquipRulesStrip(rules)}
      ${tree.graph?.nodes ? `<div class="mp-tree-container mp-class-graph" id="mpClassGraph" data-class-graph="${esc(key)}"></div>` : ''}
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
        const isPassive = !!sk.passive;
        const hasGrant = !!sk.grantedAbility;
        const hasProc = !!sk.procEffect;
        const tags = [
          isPassive ? '<span class="mp-sk-tag passive">Passive</span>' : '<span class="mp-sk-tag active">Active</span>',
          hasGrant ? '<span class="mp-sk-tag grant">Ability</span>' : '',
          hasProc ? '<span class="mp-sk-tag proc">Proc</span>' : '',
        ]
          .filter(Boolean)
          .join('');
        const effectBits = [];
        if (sk.effect) effectBits.push(sk.effect);
        if (sk.grantedAbility?.name) effectBits.push(`Cast: ${sk.grantedAbility.name}`);
        if (sk.procEffect?.type) effectBits.push(`Proc ${sk.procEffect.type}`);
        if (sk.bonuses) {
          effectBits.push(
            Object.entries(sk.bonuses)
              .map(([k, v]) => `+${v} ${k}/pt`)
              .join(', '),
          );
        }
        html += `<button type="button" class="mp-skill-chip ${has ? 'owned' : ''} ${canInvest ? 'can-invest' : ''} ${!unlocked || !reqOk ? 'locked' : ''} ${isPassive ? 'is-passive' : ''}"
          data-class-skill="${esc(sk.id)}"
          title="${esc(sk.name)}: ${esc(sk.description || sk.effect || '')}">
          ${icon ? `<img src="${esc(icon)}" alt="" onerror="this.style.display='none'">` : ''}
          <div class="mp-sc-body">
            <div class="mp-sc-name">${esc(sk.name)} ${has ? `<span class="mp-sc-pts">${pts}/${max}</span>` : ''}</div>
            <div class="mp-sc-tags">${tags}</div>
            <div class="mp-sc-desc">${esc(effectBits.join(' · ') || sk.description || '')}</div>
            ${sk.requires ? `<div class="mp-sc-req">Requires: ${esc(sk.requires)}</div>` : ''}
            ${!unlocked ? `<div class="mp-sc-req">Requires character Lv ${tier.requiredLevel}</div>` : ''}
            ${canInvest ? `<div class="mp-sc-act">+ invest</div>` : has ? `<div class="mp-sc-act owned-tag">Owned</div>` : ''}
          </div>
        </button>`;
      });
      html += `</div></div>`;
    });

    if (classAbilities.length) {
      html += `<div class="mp-class-prefabs">
        <div class="mp-equip-rules-title">Class ability prefabs (classes.json · ready to wire)</div>
        <div class="mp-prefab-chips">`;
      classAbilities.slice(0, 12).forEach((ab) => {
        const ico = skillIcon(ab.iconUrl || ab.icon);
        html += `<div class="mp-prefab-chip" title="${esc(ab.description || '')}">
          ${ico ? `<img src="${esc(ico)}" alt="" onerror="this.remove()">` : ''}
          <div>
            <div class="mp-sc-name">${esc(ab.name)}</div>
            <div class="mp-sc-desc">${esc(ab.type || '')} · CD ${ab.cooldown ?? '—'} · ${ab.staminaCost ? 'STA ' + ab.staminaCost : ab.manaCost ? 'MP ' + ab.manaCost : 'free'}</div>
          </div>
        </div>`;
      });
      html += `</div></div>`;
    }

    html += `</div>
      <div style="margin-top:8px;font-size:10px;color:var(--dim)">SSOT: master-skillTrees.json · classes.json · class-equipment-rules.json · <a href="./profession-trees.html#classes" style="color:var(--gold)">full trees</a></div>`;
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
    root.querySelectorAll('[data-class-reset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const spent = Object.values(char.classSkills || {}).reduce((a, n) => a + (n | 0), 0);
        char.classSkillPointsAvailable = (char.classSkillPointsAvailable | 0) + spent;
        char.classSkills = {};
        onChange();
      });
    });
    root.querySelectorAll('[data-spec-swap]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const spec = btn.getAttribute('data-spec-swap');
        const fam = FAMILY_OF[char.classKey] || char.classKey;
        if (!(FAMILY_SPECS[fam] || []).includes(spec)) return;
        const spent = Object.values(char.classSkills || {}).reduce((a, n) => a + (n | 0), 0);
        char.classSkillPointsAvailable = (char.classSkillPointsAvailable | 0) + spent;
        char.classSkills = {};
        char.classKey = spec;
        const next = resolveClassTree(skillTrees, spec, spec);
        const l0 = next?.tree?.specIdentity?.skillId || next?.tree?.tiers?.[0]?.skills?.[0]?.id;
        if (l0) {
          char.classSkills[l0] = 1;
          if ((char.classSkillPointsAvailable | 0) > 0) char.classSkillPointsAvailable -= 1;
        }
        onChange();
      });
    });
    requestAnimationFrame(() => paintClassGraph(resolved.tree, char));
  }

  function paintClassGraph(tree, char) {
    const host = document.getElementById('mpClassGraph');
    if (!host || !tree?.graph?.nodes) return;
    const nodes = tree.graph.nodes;
    const W = host.clientWidth || 720;
    const H = Math.max(host.clientHeight || 0, 380);
    host.style.minHeight = '380px';
    const PAD = 28;
    const mapX = (x) => PAD + (x / 100) * (W - PAD * 2);
    const mapY = (y) => PAD + ((100 - y) / 100) * (H - PAD * 2);
    const owned = char.classSkills || {};
    let svg = `<svg class="mp-tree-svg" width="100%" height="${H}" viewBox="0 0 ${W} ${H}">`;
    for (const node of nodes) {
      if (node.parent != null) {
        const parent = nodes.find((n) => n.id === node.parent);
        if (parent) {
          const color = node.branchColor?.stroke || '#555';
          svg += `<line x1="${mapX(parent.x)}" y1="${mapY(parent.y)}" x2="${mapX(node.x)}" y2="${mapY(node.y)}" stroke="${color}" stroke-width="2" stroke-opacity="0.45"/>`;
        }
      }
    }
    for (const node of nodes) {
      const cx = mapX(node.x);
      const cy = mapY(node.y);
      const color = node.branchColor?.stroke || tree.color || '#d4a84b';
      const fill = node.branchColor?.fill || 'rgba(212,168,75,0.15)';
      const r = node.path ? 10 : 14;
      const has = node.skillId ? (owned[node.skillId] | 0) > 0 : node.path && (char.level | 0) >= (node.reqLevel | 0);
      const opacity = has ? 1 : 0.55;
      if (node.nodeType === 'effect') {
        svg += `<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${fill}" stroke="${color}" stroke-width="${has ? 3 : 2}" opacity="${opacity}"/>`;
      } else if (node.path) {
        svg += `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" rx="3" fill="${fill}" stroke="${color}" stroke-width="2" opacity="${opacity}"/>`;
      } else {
        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${color}" stroke-width="${has ? 3 : 2}" opacity="${opacity}"/>`;
      }
      const label = (node.name || '').length > 14 ? node.name.slice(0, 12) + '…' : node.name;
      svg += `<text x="${cx}" y="${cy + r + 11}" text-anchor="middle" fill="${color}" font-size="8">${esc(label)}</text>`;
    }
    svg += '</svg>';
    host.innerHTML = svg;
  }

  /** Equip gate used by inventory / mesh equip wiring */
  function canEquipWeapon(classKey, weaponFamily, hand, rulesDoc) {
    const rules = getClassEquipRules(classKey, rulesDoc);
    const fam = String(weaponFamily || '').toLowerCase();
    const types = (rules.weaponTypes || []).map((t) => String(t).toLowerCase());
    if (types.includes(fam)) {
      if (hand === 'off' && !rules.dualWield) {
        // shields / focus off-hand ok without dual
        const offOk = (rules.offHandAllowed || []).some((f) => fam.includes(String(f).replace(/_/g, '')) || String(f) === fam);
        if (fam.includes('shield') || fam.includes('tome') || fam.includes('orb') || fam.includes('focus')) return true;
        if (!offOk && fam.match(/sword|axe|hammer|dagger|mace/)) return false;
      }
      if (hand === 'off' && rules.dualWield === false && fam.match(/sword|axe|hammer|dagger/)) return false;
      return true;
    }
    return false;
  }

  function canDualWield(classKey, rulesDoc) {
    return !!getClassEquipRules(classKey, rulesDoc).dualWield;
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
    FAMILY_OF,
    FAMILY_SPECS,
    CLASS_ATTR_BONUSES,
    RACE_ATTR_BONUSES,
    CLASS_EQUIP_FALLBACK,
    renderAttributesPanel,
    attachAttributeHandlers,
    renderClassSkillTree,
    attachClassSkillHandlers,
    paintClassGraph,
    renderProfessionsPanel,
    paintProfessionTree,
    attachProfessionHandlers,
    renderSkillsShell,
    resolveClassTree,
    getClassEquipRules,
    canEquipWeapon,
    canDualWield,
    calculateDerivedStats,
    calculateCombatPower,
    getBuildRating,
    paintAttributeRadar,
    destroyAttributeRadar,
    applySkillTreeStatBonuses,
    attrIcon,
    skillIcon,
    esc,
    effectivePoints,
  };
})(typeof window !== 'undefined' ? window : globalThis);
