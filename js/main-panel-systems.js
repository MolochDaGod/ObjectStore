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

  /** Race / class base bonuses (character-builder SSOT) */
  const CLASS_ATTR_BONUSES = {
    warrior: { strength: 2, vitality: 1, endurance: 1, tactics: 1 },
    mage: { intellect: 3, wisdom: 2 },
    ranger: { dexterity: 2, agility: 2, tactics: 1 },
    worge: { strength: 1, vitality: 2, endurance: 1, agility: 1 },
  };
  const RACE_ATTR_BONUSES = {
    human: { strength: 2, vitality: 2, intellect: 1 },
    elf: { intellect: 2, dexterity: 1, wisdom: 2 },
    dwarf: { vitality: 2, endurance: 2, wisdom: 1 },
    orc: { strength: 2, vitality: 1, endurance: 2 },
    barbarian: { strength: 2, vitality: 2, endurance: 1 },
    undead: { intellect: 2, wisdom: 3 },
  };

  /**
   * Soft effectiveness only — equip is never blocked.
   * mult > 1 = class passive boost; mult < 1 = reduced effectiveness.
   */
  const CLASS_EQUIP_FALLBACK = {
    warrior: {
      dualWieldEfficient: true,
      preferredArmor: ['plate', 'mail'],
      preferredWeapons: ['shields', 'swords', 'greatswords', 'axes1h', 'greataxes', 'hammers1h', 'hammers2h'],
      weaponEffectiveness: { '1h_melee': 1.15, '2h_melee': 1.12, shield: 1.18, bow: 0.72, gun: 0.7, staff: 0.68, focus: 0.75 },
      armorEffectiveness: { plate: 1.2, mail: 1.1, leather: 0.88, cloth: 0.72 },
      dualWieldEffectiveness: 1.08,
      animPacks: { sword_shield: true, dual_wield: true, two_handed: true },
      defaultLoadout: { main: 'swords', off: 'shields', style: 'sword_shield' },
      passives: [
        { id: 'w_plate_training', name: 'Plate Training', kind: 'armor', description: 'Plate/mail strong; cloth weak.' },
        { id: 'w_weapon_mastery', name: 'Weapon Mastery', kind: 'weapon', description: 'Melee + shields strong; bows/staves weak.' },
        { id: 'w_dual_blades', name: 'Twin Blades', kind: 'dual', description: 'Efficient dual-wield (+8%).' },
      ],
    },
    mage: {
      dualWieldEfficient: false,
      preferredArmor: ['cloth'],
      preferredWeapons: ['fireStaves', 'arcaneStaves', 'orbs', 'tomes'],
      weaponEffectiveness: { staff: 1.22, focus: 1.18, '1h_melee': 0.7, '2h_melee': 0.65, shield: 0.72, bow: 0.75, gun: 0.7 },
      armorEffectiveness: { cloth: 1.25, leather: 0.9, mail: 0.7, plate: 0.55 },
      dualWieldEffectiveness: 0.72,
      animPacks: { magic_spell: true },
      defaultLoadout: { main: 'arcaneStaves', off: 'tomes', style: 'magic_spell' },
      passives: [
        { id: 'm_arcane_vestments', name: 'Arcane Vestments', kind: 'armor', description: 'Cloth amplifies; plate chokes mana.' },
        { id: 'm_focus_channel', name: 'Focus Channel', kind: 'weapon', description: 'Staves/tomes strong; steel weak.' },
        { id: 'm_no_twin_steel', name: 'Single Focus', kind: 'dual', description: 'Dual melee inefficient (−28%).' },
      ],
    },
    ranger: {
      dualWieldEfficient: false,
      preferredArmor: ['leather', 'mail'],
      preferredWeapons: ['bows', 'crossbows', 'guns', 'daggers', 'spears'],
      weaponEffectiveness: { bow: 1.22, gun: 1.15, '1h_melee': 1.0, '2h_melee': 1.05, shield: 0.78, staff: 0.72, focus: 0.8 },
      armorEffectiveness: { leather: 1.18, mail: 1.08, cloth: 0.85, plate: 0.68 },
      dualWieldEffectiveness: 0.88,
      animPacks: { longbow: true, rifle: true, two_handed: true },
      defaultLoadout: { main: 'bows', off: null, style: 'longbow' },
      passives: [
        { id: 'r_trail_gear', name: 'Trail Gear', kind: 'armor', description: 'Leather/mail preferred; plate slows.' },
        { id: 'r_marksman', name: 'Marksman', kind: 'weapon', description: 'Bows/guns excel; staves weak.' },
        { id: 'r_offhand_burden', name: 'Off-Hand Burden', kind: 'dual', description: 'Dual allowed but −12%.' },
      ],
    },
    worge: {
      dualWieldEfficient: false,
      preferredArmor: ['leather'],
      preferredWeapons: ['hammers1h', 'spears', 'natureStaves', 'bows', 'daggers'],
      weaponEffectiveness: { '1h_melee': 1.1, '2h_melee': 1.05, staff: 1.12, bow: 1.05, focus: 1.0, shield: 0.8, gun: 0.75 },
      armorEffectiveness: { leather: 1.2, mail: 0.92, cloth: 0.95, plate: 0.65 },
      dualWieldEffectiveness: 0.85,
      animPacks: { sword_shield: true, magic_spell: true, longbow: true },
      defaultLoadout: { main: 'hammers1h', off: null, style: 'sword_shield' },
      passives: [
        { id: 'o_hidebound', name: 'Hidebound', kind: 'armor', description: 'Leather for the shift; plate resists.' },
        { id: 'o_primal_tools', name: 'Primal Tools', kind: 'weapon', description: 'Hybrid mace/staff/bow; guns weak.' },
        { id: 'o_wild_grip', name: 'Wild Grip', kind: 'dual', description: 'Dual possible at −15%.' },
      ],
    },
  };

  const WEAPON_FAMILY_MAP = {
    swords: '1h_melee',
    axes1h: '1h_melee',
    hammers1h: '1h_melee',
    daggers: '1h_melee',
    maces: '1h_melee',
    greatswords: '2h_melee',
    greataxes: '2h_melee',
    hammers2h: '2h_melee',
    spears: '2h_melee',
    shields: 'shield',
    bows: 'bow',
    crossbows: 'bow',
    guns: 'gun',
    rifles: 'gun',
    pistols: 'gun',
    fireStaves: 'staff',
    frostStaves: 'staff',
    holyStaves: 'staff',
    lightningStaves: 'staff',
    arcaneStaves: 'staff',
    natureStaves: 'staff',
    staves: 'staff',
    orbs: 'focus',
    tomes: 'focus',
    foci: 'focus',
    wands: 'focus',
  };

  const ARMOR_FAMILY_MAP = {
    cloth: 'cloth',
    robe: 'cloth',
    leather: 'leather',
    mail: 'mail',
    chain: 'mail',
    plate: 'plate',
    heavy: 'plate',
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

  function resolveWeaponFamily(typeOrFamily, rulesDoc) {
    const raw = String(typeOrFamily || '').toLowerCase().replace(/\s+/g, '');
    if (!raw) return null;
    if (['1h_melee', '2h_melee', 'shield', 'bow', 'gun', 'staff', 'focus'].includes(raw)) return raw;
    if (WEAPON_FAMILY_MAP[raw]) return WEAPON_FAMILY_MAP[raw];
    const families = rulesDoc?.weaponFamilies || {};
    for (const [fam, list] of Object.entries(families)) {
      if ((list || []).some((t) => String(t).toLowerCase() === raw)) return fam;
    }
    return raw;
  }

  function resolveArmorFamily(typeOrFamily, rulesDoc) {
    const raw = String(typeOrFamily || '').toLowerCase().replace(/\s+/g, '');
    if (!raw) return null;
    if (['cloth', 'leather', 'mail', 'plate'].includes(raw)) return raw;
    if (ARMOR_FAMILY_MAP[raw]) return ARMOR_FAMILY_MAP[raw];
    const families = rulesDoc?.armorFamilies || {};
    for (const [fam, list] of Object.entries(families)) {
      if ((list || []).some((t) => String(t).toLowerCase() === raw)) return fam;
    }
    return raw;
  }

  /** Soft mult only — never blocks equip. Defaults from policy if missing. */
  function getWeaponEffectiveness(classKey, weaponTypeOrFamily, rulesDoc) {
    const rules = getClassEquipRules(classKey, rulesDoc);
    const fam = resolveWeaponFamily(weaponTypeOrFamily, rulesDoc);
    const table = rules.weaponEffectiveness || {};
    if (fam && table[fam] != null) return Number(table[fam]);
    const def = rulesDoc?.policy?.defaultWeaponMult;
    return def != null ? Number(def) : 0.78;
  }

  function getArmorEffectiveness(classKey, armorTypeOrFamily, rulesDoc) {
    const rules = getClassEquipRules(classKey, rulesDoc);
    const fam = resolveArmorFamily(armorTypeOrFamily, rulesDoc);
    const table = rules.armorEffectiveness || {};
    if (fam && table[fam] != null) return Number(table[fam]);
    const def = rulesDoc?.policy?.defaultArmorMult;
    return def != null ? Number(def) : 0.82;
  }

  function getDualWieldEffectiveness(classKey, rulesDoc) {
    const rules = getClassEquipRules(classKey, rulesDoc);
    if (rules.dualWieldEffectiveness != null) return Number(rules.dualWieldEffectiveness);
    return rules.dualWieldEfficient ? 1.08 : 0.85;
  }

  function formatMult(m) {
    const n = Number(m);
    if (!Number.isFinite(n)) return '—';
    const pct = Math.round((n - 1) * 100);
    if (pct > 0) return `+${pct}%`;
    if (pct < 0) return `${pct}%`;
    return '±0%';
  }

  function renderEffectivenessGrid(table, label) {
    if (!table || !Object.keys(table).length) return '';
    const cells = Object.entries(table)
      .map(([k, v]) => {
        const n = Number(v);
        const cls = n > 1.01 ? 'mp-eff-up' : n < 0.99 ? 'mp-eff-down' : 'mp-eff-flat';
        return `<span class="mp-eff-chip ${cls}" title="${esc(label)} ${esc(k)}">${esc(k)} <strong>${formatMult(n)}</strong></span>`;
      })
      .join('');
    return `<div class="mp-eff-row"><span class="mp-eff-label">${esc(label)}</span>${cells}</div>`;
  }

  /** Default icons when SSOT passive lacks iconUrl (class · kind). */
  const PASSIVE_ICON_FALLBACK = {
    warrior: {
      armor: '/icons/skills/class/barbarian/barbarian_05.png',
      weapon: '/icons/skills/class/barbarian/barbarian_01.png',
      dual: '/icons/skills/class/barbarian/barbarian_06.png',
      tree: '/icons/skills/class/barbarian/barbarian_03.png',
    },
    mage: {
      armor: '/icons/skills/class/firemage/firemage_05.png',
      weapon: '/icons/skills/class/firemage/firemage_01.png',
      dual: '/icons/skills/class/firemage/firemage_03.png',
      tree: '/icons/skills/class/firemage/firemage_02.png',
    },
    ranger: {
      armor: '/icons/skills/class/hunter/hunter_05.png',
      weapon: '/icons/skills/class/hunter/hunter_01.png',
      dual: '/icons/skills/class/hunter/hunter_03.png',
      tree: '/icons/skills/class/hunter/hunter_02.png',
    },
    worge: {
      armor: '/icons/skills/class/necromancer/necromancer_05.png',
      weapon: '/icons/skills/class/necromancer/necromancer_01.png',
      dual: '/icons/skills/class/necromancer/necromancer_03.png',
      tree: '/icons/skills/class/necromancer/necromancer_02.png',
    },
  };

  function passiveIconFor(classKey, passive) {
    if (passive.iconUrl || passive.icon) return skillIcon(passive.iconUrl || passive.icon);
    const ck = (classKey || 'warrior').toLowerCase();
    const kind = passive.kind || (passive.treePassive ? 'tree' : 'armor');
    const path =
      (PASSIVE_ICON_FALLBACK[ck] && PASSIVE_ICON_FALLBACK[ck][kind]) ||
      PASSIVE_ICON_FALLBACK.warrior.armor;
    return skillIcon(path);
  }

  function buildPassiveTooltipLines(p) {
    if (Array.isArray(p.tooltipLines) && p.tooltipLines.length) return p.tooltipLines.slice();
    const lines = [];
    const eff = p.effect || {};
    if (eff.armor) {
      Object.entries(eff.armor).forEach(([t, m]) => {
        lines.push(`${formatMult(m)} armor effectiveness (${t})`);
      });
    }
    if (eff.weapon) {
      Object.entries(eff.weapon).forEach(([t, m]) => {
        lines.push(`${formatMult(m)} weapon effectiveness (${t})`);
      });
    }
    if (eff.dualWield != null) lines.push(`${formatMult(eff.dualWield)} dual-wield contribution`);
    if (p.effect && typeof p.effect === 'string') lines.push(p.effect);
    if (p.bonuses) {
      Object.entries(p.bonuses).forEach(([k, v]) => lines.push(`+${v} ${k} per rank`));
    }
    if (p.procEffect?.type) {
      lines.push(`Proc: ${p.procEffect.type}${p.procEffect.duration ? ` (${p.procEffect.duration}s)` : ''}`);
    }
    return lines;
  }

  /**
   * WoW spellbook-style passive row: icon grid + rich hover tooltip.
   * Includes class gear passives (soft mults) + tree skills flagged passive:true.
   */
  function collectSpellbookPassives(rules, tree, classKey) {
    const list = [];
    (rules.passives || []).forEach((p) => {
      list.push({
        id: p.id,
        name: p.name,
        kind: p.kind || 'armor',
        description: p.description || '',
        rank: p.rank || 'Passive',
        alwaysOn: p.alwaysOn !== false,
        iconUrl: p.iconUrl || p.icon,
        effect: p.effect,
        tooltipLines: p.tooltipLines,
        source: 'class',
      });
    });
    (tree?.tiers || []).forEach((tier) => {
      (tier.skills || []).forEach((sk) => {
        if (!sk.passive) return;
        list.push({
          id: sk.id,
          name: sk.name,
          kind: 'tree',
          description: sk.description || sk.effect || '',
          rank: `Passive · Lv ${tier.requiredLevel | 0}`,
          alwaysOn: true,
          iconUrl: sk.iconUrl || sk.icon,
          effect: sk.effect,
          bonuses: sk.bonuses,
          procEffect: sk.procEffect,
          treePassive: true,
          requires: sk.requires,
          source: 'tree',
        });
      });
    });
    return list;
  }

  function renderSpellbookPassives(rules, tree, classKey) {
    const passives = collectSpellbookPassives(rules, tree, classKey);
    if (!passives.length) return '';
    const icons = passives
      .map((p, i) => {
        const ico = passiveIconFor(classKey, p);
        const tipPayload = {
          name: p.name,
          rank: p.rank || 'Passive',
          desc: p.description || '',
          lines: buildPassiveTooltipLines(p),
          kind: p.kind || 'passive',
          alwaysOn: !!p.alwaysOn,
          source: p.source || 'class',
        };
        return `<button type="button" class="mp-sb-passive" data-sb-passive="${i}"
          data-sb-tip="${esc(JSON.stringify(tipPayload))}"
          aria-label="${esc(p.name)}">
          <span class="mp-sb-frame">
            ${ico ? `<img src="${esc(ico)}" alt="" draggable="false" onerror="this.classList.add('mp-sb-ico-missing')">` : '<span class="mp-sb-ico-fallback">◆</span>'}
            <span class="mp-sb-corner" aria-hidden="true"></span>
          </span>
        </button>`;
      })
      .join('');
    return `<div class="mp-spellbook-passives" data-class-key="${esc(classKey || '')}">
      <div class="mp-sb-header">
        <span class="mp-sb-title">Passives</span>
        <span class="mp-sb-sub">Always on · hover for details · soft gear mults (no equip bans)</span>
      </div>
      <div class="mp-sb-icon-row">${icons}</div>
      <div class="mp-sb-tooltip" id="mpSpellbookTip" role="tooltip" hidden></div>
    </div>`;
  }

  function attachSpellbookTooltips(root) {
    const tip = root.querySelector('#mpSpellbookTip') || document.getElementById('mpSpellbookTip');
    if (!tip) return;
    const show = (btn, e) => {
      let data;
      try {
        data = JSON.parse(btn.getAttribute('data-sb-tip') || '{}');
      } catch {
        return;
      }
      const lines = (data.lines || [])
        .map((ln) => {
          const s = String(ln);
          const up = s.startsWith('+');
          const down = s.startsWith('-');
          return `<div class="mp-sb-tip-line ${up ? 'up' : down ? 'down' : ''}">${esc(s)}</div>`;
        })
        .join('');
      tip.innerHTML = `
        <div class="mp-sb-tip-name">${esc(data.name || 'Passive')}</div>
        <div class="mp-sb-tip-rank">${esc(data.rank || 'Passive')}${data.alwaysOn ? ' · Always active' : ''}</div>
        <div class="mp-sb-tip-desc">${esc(data.desc || '')}</div>
        ${lines ? `<div class="mp-sb-tip-effects">${lines}</div>` : ''}
        <div class="mp-sb-tip-foot">${data.source === 'tree' ? 'Class skill tree' : 'Class training'} · does not restrict equip</div>`;
      tip.hidden = false;
      tip.style.display = 'block';
      const pad = 12;
      let x = e.clientX + pad;
      let y = e.clientY + pad;
      tip.style.left = '0px';
      tip.style.top = '0px';
      const tw = tip.offsetWidth || 280;
      const th = tip.offsetHeight || 120;
      if (x + tw > window.innerWidth - 8) x = e.clientX - tw - pad;
      if (y + th > window.innerHeight - 8) y = e.clientY - th - pad;
      tip.style.left = Math.max(8, x) + 'px';
      tip.style.top = Math.max(8, y) + 'px';
    };
    const hide = () => {
      tip.hidden = true;
      tip.style.display = 'none';
    };
    root.querySelectorAll('.mp-sb-passive').forEach((btn) => {
      btn.addEventListener('mouseenter', (e) => show(btn, e));
      btn.addEventListener('mousemove', (e) => show(btn, e));
      btn.addEventListener('mouseleave', hide);
      btn.addEventListener('focus', (e) => show(btn, e));
      btn.addEventListener('blur', hide);
    });
  }

  function renderEquipRulesStrip(rules, rulesDoc) {
    if (!rules) return '';
    const dualEff = getDualWieldEffectiveness(rules.id || 'warrior', { classes: { [rules.id]: rules }, policy: rulesDoc?.policy });
    const dualPill =
      dualEff >= 1
        ? `<span class="mp-rule-pill mp-rule-ok">Dual style ${formatMult(dualEff)}</span>`
        : `<span class="mp-rule-pill mp-rule-soft">Dual style ${formatMult(dualEff)} (allowed)</span>`;
    const prefW = (rules.preferredWeapons || rules.weaponTypes || []).slice(0, 6).map((w) => esc(w)).join(' · ');
    const prefA = (rules.preferredArmor || rules.armorTypes || []).map((a) => esc(a)).join(' · ');
    const packs = rules.animPacks
      ? Object.keys(rules.animPacks)
          .map((p) => esc(p))
          .join(' · ')
      : '';
    const load = rules.defaultLoadout
      ? `${esc(rules.defaultLoadout.main || '—')}${rules.defaultLoadout.off ? ' + ' + esc(rules.defaultLoadout.off) : ''} → ${esc(rules.defaultLoadout.style || '')}`
      : '';
    return `<div class="mp-equip-rules">
      <div class="mp-equip-rules-title">Gear effectiveness (reference)</div>
      <div class="mp-equip-rules-row">
        <span class="mp-rule-pill mp-rule-ok">Equip anything</span>
        ${dualPill}
        <span class="mp-rule-pill">Pref armor: ${prefA || '—'}</span>
      </div>
      ${renderEffectivenessGrid(rules.armorEffectiveness, 'Armor')}
      ${renderEffectivenessGrid(rules.weaponEffectiveness, 'Weapon')}
      <div class="mp-equip-rules-detail"><strong>Preferred weapons</strong> ${prefW || '—'}</div>
      <div class="mp-equip-rules-detail"><strong>Anim packs</strong> ${packs || '—'}</div>
      <div class="mp-equip-rules-detail"><strong>Default loadout</strong> ${load || '—'}</div>
      <div class="mp-equip-rules-note">Passives at top apply these mults in combat — never lock slots. SSOT: class-equipment-rules.json</div>
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

    // Actives only in tier grid (passives already in spellbook row at top)
    const showTreePassiveInGrid = !!ctx.showTreePassivesInGrid;

    let html = `<div class="section-title">${ctx.embedInAttributes ? 'Class skills' : 'Class Skill Tree'} — ${esc(tree.className || key)}</div>
      <div class="mp-char-meta">Hero Lv ${level} · Skill pts <strong style="color:var(--gold)">${avail}</strong>
        · Prefab: <code>${esc(rules.prefabPack || key)}</code>
        · Soft gear passives · tree from master-skillTrees</div>
      ${renderSpellbookPassives(rules, tree, key)}
      ${renderEquipRulesStrip(rules, equipRules)}
      <div class="mp-class-tree">
      <div class="mp-equip-rules-title" style="margin:4px 0 8px">Skill tree</div>`;

    (tree.tiers || []).forEach((tier) => {
      const unlocked = level >= (tier.requiredLevel | 0);
      html += `<div class="mp-tier ${unlocked ? 'unlocked' : 'locked'}">
        <div class="mp-tier-head" style="border-left-color:${color}">
          <span>${esc(tier.name || 'Tier')}</span>
          <span class="mp-tier-req">${unlocked ? '✓' : '🔒'} Lv ${tier.requiredLevel | 0}</span>
        </div>
        <div class="mp-skill-chips">`;

      (tier.skills || []).forEach((sk) => {
        // Passives live in spellbook row at top (WoW-style)
        if (sk.passive && !showTreePassiveInGrid) return;
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
    attachSpellbookTooltips(root);
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

  /**
   * Soft policy: never hard-block equip. Always true.
   * Use getWeaponEffectiveness / getArmorEffectiveness for combat contribution.
   */
  function canEquipWeapon(_classKey, _weaponFamily, _hand, _rulesDoc) {
    return true;
  }

  function canEquipArmor(_classKey, _armorFamily, _rulesDoc) {
    return true;
  }

  /** Dual style is always allowed; contribution uses getDualWieldEffectiveness. */
  function canDualWield(_classKey, _rulesDoc) {
    return true;
  }

  function isDualWieldEfficient(classKey, rulesDoc) {
    return !!getClassEquipRules(classKey, rulesDoc).dualWieldEfficient;
  }

  /**
   * Apply class soft mults to a gear piece's combat stats.
   * @param {'weapon'|'armor'} kind
   * @param {string} typeOrFamily category string (e.g. swords, plate)
   * @param {Record<string, number>} stats flat stats from item
   */
  function applyClassGearEffectiveness(classKey, kind, typeOrFamily, stats, rulesDoc) {
    const mult =
      kind === 'armor'
        ? getArmorEffectiveness(classKey, typeOrFamily, rulesDoc)
        : getWeaponEffectiveness(classKey, typeOrFamily, rulesDoc);
    const out = {};
    Object.entries(stats || {}).forEach(([k, v]) => {
      out[k] = typeof v === 'number' ? v * mult : v;
    });
    out._classEffectiveness = mult;
    out._classKey = classKey;
    out._gearFamily = kind === 'armor' ? resolveArmorFamily(typeOrFamily, rulesDoc) : resolveWeaponFamily(typeOrFamily, rulesDoc);
    return out;
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
    CLASS_ATTR_BONUSES,
    RACE_ATTR_BONUSES,
    CLASS_EQUIP_FALLBACK,
    renderAttributesPanel,
    attachAttributeHandlers,
    renderClassSkillTree,
    attachClassSkillHandlers,
    renderProfessionsPanel,
    paintProfessionTree,
    attachProfessionHandlers,
    renderSkillsShell,
    resolveClassTree,
    getClassEquipRules,
    canEquipWeapon,
    canEquipArmor,
    canDualWield,
    isDualWieldEfficient,
    getWeaponEffectiveness,
    getArmorEffectiveness,
    getDualWieldEffectiveness,
    applyClassGearEffectiveness,
    resolveWeaponFamily,
    resolveArmorFamily,
    collectSpellbookPassives,
    renderSpellbookPassives,
    attachSpellbookTooltips,
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
