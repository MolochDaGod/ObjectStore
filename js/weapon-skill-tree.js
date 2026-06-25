/**
 * Canonical weapon skill UI — loads master-weaponSkills.json (slot 1 primary/LMB,
 * slots 2–4 secondary / ability / ultimate with tier unlocks).
 *
 * Off-hand rules:
 *   SHIELD — while blocking, replaces mainhand slots 1–3 with per-shield-type tank skills
 *   TOME   — canonical off-hand relic; with 1H mainhand, transforms slots 1–4 by coupling mode
 */
(function (global) {
  const CDN = 'https://assets.grudge-studio.com';

  const CATEGORY_TO_TYPE = {
    swords: 'SWORD',
    greatswords: 'GREATSWORD',
    axes1h: 'AXE',
    greataxes: 'GREATAXE',
    daggers: 'DAGGER',
    bows: 'BOW',
    crossbows: 'CROSSBOW',
    guns: 'GUN',
    hammers1h: 'HAMMER',
    hammers2h: 'HAMMER',
    spears: 'SPEAR',
    shields: 'SHIELD',
    firestaves: 'STAFF',
    froststaves: 'STAFF',
    holystaves: 'STAFF',
    lightningstaves: 'STAFF',
    naturestaves: 'STAFF',
    staves: 'STAFF',
    staff: 'STAFF',
    'offhand-tome': 'TOME',
    tomes: 'TOME',
    tome: 'TOME',
    wands: 'WAND',
    wand: 'WAND',
    scythes: 'SCYTHE',
    scythe: 'SCYTHE',
    maces: 'MACE',
  };

  const ONE_HAND_TYPES = new Set(['SWORD', 'AXE', 'DAGGER', 'HAMMER', 'MACE', 'GUN', 'WAND']);
  const OFFHAND_MODIFIER_TYPES = new Set(['SHIELD', 'TOME']);
  const SHIELD_TYPE_KEYWORDS = {
    buckler: /buckler|wraithfang/i,
    tower: /bulwark|tower|grudge/i,
    spiked: /crimson|spike|emberclad/i,
    magic: /oathbreaker|magic|runic|arcane/i,
    relic: /relic|bastion|kinrend/i,
    kite: /kite|aegis|ward/i,
  };
  const SCHOOL_TO_MODE_FALLBACK = {
    fire: 'elemental',
    frost: 'elemental',
    lightning: 'elemental',
    nature: 'elemental',
    holy: 'heal',
    arcane: 'ranged',
  };

  const SLOT_TYPES = ['primary', 'secondary', 'ability', 'ultimate'];
  const SLOT_HOTKEYS = ['1', '2', '3', '4', '5'];
  const SLOT_UI_LABELS = {
    primary: 'Slot 1 · LMB',
    secondary: 'Slot 2',
    ability: 'Slot 3',
    ultimate: 'Slot 4',
  };

  let catalog = null;
  let catalogById = {};

  function esc(s) {
    return s
      ? String(s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
      : '';
  }

  function defaultAsset(url) {
    if (!url) return url;
    if (/^(https?:|data:|blob:)/i.test(url)) return url;
    if (url.startsWith('/icons/')) return `${CDN}${url}`;
    return url;
  }

  function normalizeCategory(raw) {
    return String(raw || '').toLowerCase().replace(/\s+/g, '');
  }

  function categoryToTypeId(category) {
    const key = normalizeCategory(category);
    if (CATEGORY_TO_TYPE[key]) return CATEGORY_TO_TYPE[key];
    if (key.endsWith('s')) {
      const singular = key.slice(0, -1);
      if (CATEGORY_TO_TYPE[singular]) return CATEGORY_TO_TYPE[singular];
    }
    return key ? key.toUpperCase() : null;
  }

  function resolveTypeFromWeapon(weapon) {
    if (!weapon) return null;
    return categoryToTypeId(weapon.category || weapon.weaponType || weapon.subType || weapon._weaponKey);
  }

  function isOffhandItem(weapon) {
    if (!weapon) return false;
    const cat = normalizeCategory(weapon.category || weapon.type);
    return cat === 'shields' || cat === 'offhand-tome' || cat === 'tomes' || cat === 'tome';
  }

  function isOneHandMainhand(weapon) {
    const typeId = resolveTypeFromWeapon(weapon);
    if (!typeId) return false;
    if (weapon?.subCategory === '2h') return false;
    return ONE_HAND_TYPES.has(typeId);
  }

  function resolveShieldType(shield) {
    if (!shield) return 'kite';
    const text = `${shield.name || ''} ${shield.id || ''} ${shield.description || ''}`;
    for (const [type, re] of Object.entries(SHIELD_TYPE_KEYWORDS)) {
      if (re.test(text)) return type;
    }
    if (shield.shieldType) return shield.shieldType;
    return 'kite';
  }

  function resolveTomeCouplingMode(tome) {
    if (!tome) return 'elemental';
    const school = (tome.school || tome.element || '').toLowerCase();
    const tomeDef = getTypeDef('TOME');
    const map = tomeDef?.mechanic?.schoolToMode || SCHOOL_TO_MODE_FALLBACK;
    if (school && map[school]) return map[school];
    const text = `${tome.name || ''}`.toLowerCase();
    if (/holy|light|divine|genesis/.test(text)) return 'heal';
    if (/arcane|spell|grimoire/.test(text)) return 'ranged';
    if (/verdant|growth|nature|buff/.test(text)) return 'buff';
    if (/fire|frost|ice|lightning|inferno|glacier/.test(text)) return 'elemental';
    return 'elemental';
  }

  function cloneTypeDef(base) {
    if (!base) return null;
    return JSON.parse(JSON.stringify(base));
  }

  function getShieldVariant(shieldType) {
    const def = getTypeDef('SHIELD');
    return def?.shieldTypes?.[shieldType] || def?.shieldTypes?.kite || null;
  }

  function getTomeCoupling(couplingMode) {
    const def = getTypeDef('TOME');
    return def?.couplingModes?.[couplingMode] || def?.couplingModes?.elemental || null;
  }

  /** Merge mainhand + offhand into effective 4-slot type def for UI/hotbar */
  function resolveEffectiveLoadout(mainhand, offhand, opts = {}) {
    const playerTier = opts.playerTier ?? mainhand?.tier ?? 1;
    const blockActive = opts.blockActive !== false;
    const mainTypeId = resolveTypeFromWeapon(mainhand);
    const mainDef = cloneTypeDef(getTypeDef(mainTypeId));

    if (!mainDef) {
      return { typeDef: null, mainTypeId, modifiers: [], banner: null };
    }

    const modifiers = [];
    let banner = null;

    if (offhand && isOffhandItem(offhand)) {
      const offType = resolveTypeFromWeapon(offhand);

      if (offType === 'SHIELD' && blockActive) {
        const shieldType = resolveShieldType(offhand);
        const variant = getShieldVariant(shieldType);
        if (variant) {
          modifiers.push({ kind: 'shield', shieldType, variant });
          banner = {
            kind: 'shield',
            title: `Blocking · ${variant.name || shieldType}`,
            detail: 'Slots 1–3 show tank abilities while block is active. Slot 4 unchanged.',
          };
          for (const slotType of ['primary', 'secondary', 'ability']) {
            const modSlot = variant.slots?.find((s) => s.type === slotType);
            const baseSlot = mainDef.slots?.find((s) => s.type === slotType);
            if (modSlot && baseSlot) {
              baseSlot.skills = modSlot.skills.map((sk) => ({
                ...sk,
                _modifier: 'shield',
                _shieldType: shieldType,
              }));
              baseSlot.label = modSlot.label || baseSlot.label;
            }
          }
        }
      }

      if (offType === 'TOME' && isOneHandMainhand(mainhand)) {
        const mode = resolveTomeCouplingMode(offhand);
        const coupling = getTomeCoupling(mode);
        if (coupling) {
          modifiers.push({ kind: 'tome', mode, coupling });
          banner = {
            kind: 'tome',
            title: `Tome Coupling · ${coupling.name}`,
            detail: `1H ${mainDef.name} + tome transforms slots 1–4 into ${coupling.name.toLowerCase()} variants.`,
          };
          for (const slotType of SLOT_TYPES) {
            const modSlot = coupling.slots?.find((s) => s.type === slotType);
            const baseSlot = mainDef.slots?.find((s) => s.type === slotType);
            if (modSlot && baseSlot) {
              baseSlot.skills = modSlot.skills.map((sk) => ({
                ...sk,
                _modifier: 'tome',
                _couplingMode: mode,
              }));
              baseSlot.label = modSlot.label || baseSlot.label;
            }
          }
        }
      }
    }

    return { typeDef: mainDef, mainTypeId, modifiers, banner, playerTier };
  }

  async function loadCatalog(apiBases) {
    const bases = Array.isArray(apiBases) ? apiBases : ['./api/v1'];
    for (const base of bases) {
      try {
        const res = await fetch(`${base.replace(/\/$/, '')}/master-weaponSkills.json`);
        if (!res.ok) continue;
        catalog = await res.json();
        catalogById = {};
        (catalog.weaponTypes || []).forEach((wt) => {
          catalogById[wt.id] = wt;
        });
        return catalog;
      } catch {
        /* try next */
      }
    }
    catalog = null;
    catalogById = {};
    return null;
  }

  function setCatalog(data) {
    catalog = data;
    catalogById = {};
    (catalog?.weaponTypes || []).forEach((wt) => {
      catalogById[wt.id] = wt;
    });
  }

  function getTypeDef(typeId) {
    return typeId ? catalogById[typeId] || null : null;
  }

  function listTypeIds() {
    return (catalog?.weaponTypes || []).map((w) => w.id);
  }

  function listPlayableTypeIds() {
    return listTypeIds().filter((id) => !OFFHAND_MODIFIER_TYPES.has(id));
  }

  function defaultSelections(typeDef, playerTier) {
    const sel = { primary: null, secondary: null, ability: null, ultimate: null };
    if (!typeDef) return sel;
    SLOT_TYPES.forEach((slotType) => {
      const slot = typeDef.slots?.find((s) => s.type === slotType);
      if (!slot || playerTier < slot.unlockTier) return;
      const unlocked = slot.skills.filter((sk) => playerTier >= sk.tier);
      if (unlocked.length) sel[slotType] = unlocked[0].id;
    });
    return sel;
  }

  function findSkill(typeDef, slotType, skillId) {
    const slot = typeDef?.slots?.find((s) => s.type === slotType);
    return slot?.skills?.find((s) => s.id === skillId) || null;
  }

  function renderModifierBanner(banner) {
    if (!banner) return '';
    const cls = banner.kind === 'shield' ? 'wst-banner-shield' : 'wst-banner-tome';
    return `<div class="wst-modifier-banner ${cls}">
      <strong>${esc(banner.title)}</strong>
      <span>${esc(banner.detail)}</span>
    </div>`;
  }

  function renderSkillCard(skill, slotType, opts) {
    const asset = opts.asset || defaultAsset;
    const isSelected = opts.selectedSkills?.[slotType] === skill.id;
    const isSlotUnlocked = opts.playerTier >= (opts.slotUnlockTier || 1);
    const isSkillUnlocked = isSlotUnlocked && opts.playerTier >= skill.tier;
    const locked = !isSkillUnlocked;

    const dmgText =
      skill.damage < 0
        ? `<span class="value heal">Heal ${Math.abs(skill.damage)}</span>`
        : skill.damage > 0
          ? `<span class="value dmg">${skill.damage}</span>`
          : `<span class="value" style="color:var(--text-muted)">—</span>`;

    const castText = skill.castTime ? `${skill.castTime}s` : 'Instant';
    const rangeText = skill.range ? `${skill.range}m` : '—';
    const dmgTypeClass = skill.damageType || 'physical';
    const icon = asset(skill.icon);

    const modTag =
      skill._modifier === 'shield'
        ? '<span class="meta-tag shield-mod">While Blocking</span>'
        : skill._modifier === 'tome'
          ? '<span class="meta-tag tome-mod">Tome Coupled</span>'
          : '';

    const clickAttr = locked
      ? ''
      : ` data-wst-select="${esc(slotType)}" data-wst-skill="${esc(skill.id)}"`;

    return `<div class="skill-card${isSelected ? ' selected' : ''}${locked ? ' locked' : ''}" data-slot="${esc(slotType)}"${clickAttr}>
      ${isSelected ? '<div class="selected-check">✓</div>' : ''}
      <div class="skill-icon-row">
        <div class="skill-icon"><img src="${esc(icon)}" alt="${esc(skill.name)}" loading="lazy" onerror="this.style.display='none'"></div>
        <span class="skill-name">${esc(skill.name)}</span>
        <span class="skill-tier-tag">T${skill.tier}</span>
      </div>
      <div class="skill-desc">${esc(skill.description)}</div>
      <div class="skill-stats">
        <div class="skill-stat"><span class="label">DMG</span> ${dmgText}</div>
        <div class="skill-stat"><span class="label">CD</span> <span class="value cd">${skill.cooldown > 0 ? skill.cooldown + 's' : '—'}</span></div>
        <div class="skill-stat"><span class="label">Cast</span> <span class="value cast">${castText}</span></div>
        <div class="skill-stat"><span class="label">Range</span> <span class="value range">${rangeText}</span></div>
      </div>
      <div class="skill-meta">
        ${modTag}
        ${skill.damageType ? `<span class="meta-tag ${esc(dmgTypeClass)}">${esc(skill.damageType)}</span>` : ''}
        ${skill.projectile ? `<span class="meta-tag proj">${esc(skill.projectile)}</span>` : ''}
        ${skill.physics ? `<span class="meta-tag phys">${esc(skill.physics)}</span>` : ''}
      </div>
      <div class="skill-effects">${(skill.effects || []).map((e) => `<span class="effect-tag">${esc(e)}</span>`).join('')}</div>
    </div>`;
  }

  function renderActionBarHTML(typeDef, opts) {
    const asset = opts.asset || defaultAsset;
    const playerTier = opts.playerTier ?? 1;
    const selected = opts.selectedSkills || defaultSelections(typeDef, playerTier);
    if (!typeDef) return '';

    let html = '';
    SLOT_TYPES.forEach((slotType, i) => {
      const slot = typeDef.slots.find((s) => s.type === slotType);
      const isUnlocked = slot && playerTier >= slot.unlockTier;
      const selectedId = selected[slotType];
      const skill = selectedId ? findSkill(typeDef, slotType, selectedId) : null;
      const icon = skill ? asset(skill.icon) : '';

      html += `<div class="action-slot" data-type="${esc(slotType)}" style="${isUnlocked ? '' : 'opacity:0.4'}">
        <div class="slot-num">${i + 1}</div>
        ${skill
          ? `<img src="${esc(icon)}" alt="${esc(skill.name)}" onerror="this.style.display='none'">`
          : `<span style="color:var(--text-muted);font-size:1.5em;">${isUnlocked ? '—' : '🔒'}</span>`}
        <div class="slot-label">${esc(SLOT_UI_LABELS[slotType] || slotType)}</div>
      </div>`;
    });

    html += `<div class="action-slot" data-type="reserved" style="opacity:0.35;border-color:var(--stone)">
      <div class="slot-num">5</div>
      <span style="color:var(--text-muted);font-size:1.2em;">—</span>
      <div class="slot-label">Slot 5</div>
    </div>`;

    return html;
  }

  function renderSlotColumnsHTML(typeDef, opts) {
    const playerTier = opts.playerTier ?? 1;
    const selected = opts.selectedSkills || {};
    if (!typeDef) {
      return '<div class="wst-empty">No weapon skill data for this type.</div>';
    }

    let html = '';
    typeDef.slots.forEach((slot) => {
      const isSlotUnlocked = playerTier >= slot.unlockTier;
      html += `<div class="slot-column">
        <div class="slot-header" data-type="${esc(slot.type)}">
          ${esc(slot.label || slot.type)}
          <span class="unlock-tag">${isSlotUnlocked ? '✓ Unlocked' : `Requires Tier ${slot.unlockTier}`}</span>
        </div>`;

      slot.skills.forEach((skill) => {
        html += renderSkillCard(skill, slot.type, {
          asset: opts.asset,
          playerTier,
          selectedSkills: selected,
          slotUnlockTier: slot.unlockTier,
        });
      });

      html += `<div class="wst-slot-placeholder">Higher tier options unlock as your weapon tier increases…</div>`;
      html += `</div>`;
    });
    return html;
  }

  /** Render offhand modifier browser (SHIELD types or TOME coupling modes) */
  function renderOffhandModifierColumns(typeId, opts = {}) {
    const def = getTypeDef(typeId);
    if (!def) return '<div class="wst-empty">Off-hand data not loaded.</div>';

    const asset = opts.asset || defaultAsset;
    const playerTier = opts.playerTier ?? 3;
    const selectedKey = opts.variantKey || (typeId === 'SHIELD' ? 'kite' : 'elemental');

    if (typeId === 'SHIELD') {
      const variant = def.shieldTypes?.[selectedKey];
      if (!variant) return '<div class="wst-empty">Unknown shield type.</div>';
      const pseudo = { slots: variant.slots };
      return `<div class="wst-modifier-intro">Shield skills apply to <strong>mainhand slots 1–3</strong> only while <strong>block is active</strong>. Slot 4 stays your weapon ultimate.</div>${renderSlotColumnsHTML(pseudo, { asset, playerTier, selectedSkills: {} })}`;
    }

    if (typeId === 'TOME') {
      const coupling = def.couplingModes?.[selectedKey];
      if (!coupling) return '<div class="wst-empty">Unknown tome coupling mode.</div>';
      const pseudo = { slots: coupling.slots };
      return `<div class="wst-modifier-intro">Tomes are the <strong>canonical off-hand relic</strong>. Paired with a <strong>1H mainhand</strong>, slots 1–4 become <strong>${esc(coupling.name)}</strong> variants.</div>${renderSlotColumnsHTML(pseudo, { asset, playerTier, selectedSkills: {} })}`;
    }

    return '';
  }

  function renderOffhandVariantBar(typeId, opts = {}) {
    const def = getTypeDef(typeId);
    if (!def) return '';

    const selected = opts.variantKey || '';
    let html = '<div class="wst-variant-bar">';

    if (typeId === 'SHIELD') {
      for (const [key, variant] of Object.entries(def.shieldTypes || {})) {
        html += `<button type="button" class="wst-variant-btn${key === selected ? ' active' : ''}" data-wst-variant="${esc(key)}">${esc(variant.name)}</button>`;
      }
    } else if (typeId === 'TOME') {
      for (const [key, mode] of Object.entries(def.couplingModes || {})) {
        html += `<button type="button" class="wst-variant-btn${key === selected ? ' active' : ''}" data-wst-variant="${esc(key)}">${esc(mode.name)}</button>`;
      }
    }

    html += '</div>';
    return html;
  }

  /** Compact panel for main-panel.html Skills tab */
  function renderEquippedWeaponPanel(mainhand, opts) {
    const asset = opts.asset || defaultAsset;
    const offhand = opts.offhand || null;
    const playerTier = opts.playerTier ?? mainhand?.tier ?? 1;
    const loadout = resolveEffectiveLoadout(mainhand, offhand, {
      playerTier,
      blockActive: opts.blockActive !== false,
    });
    const { typeDef, mainTypeId, banner } = loadout;

    if (!typeDef) {
      return `<div class="wst-empty">No canonical skill set for <strong>${esc(mainhand?.category || 'unknown')}</strong>.
        <br><span style="font-size:10px;color:var(--dim)">Expected type <code>${esc(mainTypeId || '?')}</code> in master-weaponSkills.json</span></div>`;
    }

    const selected = opts.selectedSkills || defaultSelections(typeDef, playerTier);
    const icon = mainhand.iconUrl ? asset(mainhand.iconUrl) : asset(typeDef.icon);

    let html = `<div class="wst-header">
      ${icon ? `<img class="wst-icon" src="${esc(icon)}" alt="" onerror="this.style.display='none'">` : ''}
      <div>
        <div class="wst-title">${esc(mainhand.name)}</div>
        <div class="wst-lore">${esc(mainhand.lore || mainhand.description || '')}</div>
        <div class="wst-meta"><span style="color:var(--gold)">${esc(typeDef.name)} · T${playerTier}</span></div>
      </div>
    </div>`;

    if (offhand) {
      html += `<div class="wst-offhand-chip">Off-hand: <strong>${esc(offhand.name)}</strong></div>`;
    }
    html += renderModifierBanner(banner);
    html += `<div class="wst-action-bar-compact">${renderActionBarHTML(typeDef, { asset, playerTier, selectedSkills: selected })}</div>`;
    html += `<div class="slot-columns wst-compact-cols">${renderSlotColumnsHTML(typeDef, { asset, playerTier, selectedSkills: selected })}</div>`;
    html += `<div style="margin-top:10px;font-size:9px;color:var(--dim);text-align:center">
      Slot 1 = LMB combo · Shield mods slots 1–3 while blocking · Tome couples 1–4 with 1H ·
      <a href="./WEAPON_SKILLS.html" style="color:var(--gold)">Full browser</a></div>`;
    return html;
  }

  function getHotbarSkills(mainhand, playerTier, opts = {}) {
    const offhand = opts.offhand || null;
    const loadout = resolveEffectiveLoadout(mainhand, offhand, {
      playerTier,
      blockActive: opts.blockActive !== false,
    });
    const typeDef = loadout.typeDef;
    if (!typeDef) return [];
    const selected = defaultSelections(typeDef, playerTier);
    const asset = opts.asset || defaultAsset;
    return SLOT_TYPES.map((slotType, i) => {
      const skill = findSkill(typeDef, slotType, selected[slotType]);
      return {
        key: SLOT_HOTKEYS[i],
        slotType,
        skill,
        icon: skill ? asset(skill.icon) : null,
        label: skill?.name || SLOT_UI_LABELS[slotType],
        modifier: skill?._modifier || null,
      };
    });
  }

  global.WeaponSkillTree = {
    CDN,
    CATEGORY_TO_TYPE,
    ONE_HAND_TYPES,
    OFFHAND_MODIFIER_TYPES,
    SLOT_TYPES,
    loadCatalog,
    setCatalog,
    getTypeDef,
    listTypeIds,
    listPlayableTypeIds,
    categoryToTypeId,
    resolveTypeFromWeapon,
    isOffhandItem,
    isOneHandMainhand,
    resolveShieldType,
    resolveTomeCouplingMode,
    resolveEffectiveLoadout,
    defaultSelections,
    findSkill,
    renderActionBarHTML,
    renderSlotColumnsHTML,
    renderOffhandModifierColumns,
    renderOffhandVariantBar,
    renderModifierBanner,
    renderEquippedWeaponPanel,
    getHotbarSkills,
    esc,
    defaultAsset,
  };
})(typeof window !== 'undefined' ? window : globalThis);