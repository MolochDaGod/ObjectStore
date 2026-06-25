/**
 * Canonical weapon skill UI — loads master-weaponSkills.json (slot 1 primary/LMB,
 * slots 2–4 secondary / ability / ultimate with tier unlocks).
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
    tome: 'TOME',
    wands: 'WAND',
    wand: 'WAND',
    scythes: 'SCYTHE',
    scythe: 'SCYTHE',
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

    // Slot 5 — reserved (consumable/interact in-game); show locked placeholder in browser
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

  /** Compact panel for main-panel.html Skills tab */
  function renderEquippedWeaponPanel(weapon, opts) {
    const asset = opts.asset || defaultAsset;
    const playerTier = opts.playerTier ?? weapon?.tier ?? 1;
    const typeId = resolveTypeFromWeapon(weapon);
    const typeDef = getTypeDef(typeId);

    if (!typeDef) {
      return `<div class="wst-empty">No canonical skill set for <strong>${esc(weapon?.category || 'unknown')}</strong>.
        <br><span style="font-size:10px;color:var(--dim)">Expected type <code>${esc(typeId || '?')}</code> in master-weaponSkills.json</span></div>`;
    }

    const selected = opts.selectedSkills || defaultSelections(typeDef, playerTier);
    const icon = weapon.iconUrl ? asset(weapon.iconUrl) : asset(typeDef.icon);

    let html = `<div class="wst-header">
      ${icon ? `<img class="wst-icon" src="${esc(icon)}" alt="" onerror="this.style.display='none'">` : ''}
      <div>
        <div class="wst-title">${esc(weapon.name)}</div>
        <div class="wst-lore">${esc(weapon.lore || weapon.description || '')}</div>
        <div class="wst-meta"><span style="color:var(--gold)">${esc(typeDef.name)} · T${playerTier}</span></div>
      </div>
    </div>`;

    html += `<div class="wst-action-bar-compact">${renderActionBarHTML(typeDef, { asset, playerTier, selectedSkills: selected })}</div>`;
    html += `<div class="slot-columns wst-compact-cols">${renderSlotColumnsHTML(typeDef, { asset, playerTier, selectedSkills: selected })}</div>`;
    html += `<div style="margin-top:10px;font-size:9px;color:var(--dim);text-align:center">
      Slot 1 = LMB combo (pick one) · Slots 2–4 unlock with weapon tier ·
      <a href="./WEAPON_SKILLS.html" style="color:var(--gold)">Full browser</a></div>`;
    return html;
  }

  function getHotbarSkills(weapon, playerTier) {
    const typeId = resolveTypeFromWeapon(weapon);
    const typeDef = getTypeDef(typeId);
    if (!typeDef) return [];
    const selected = defaultSelections(typeDef, playerTier);
    const asset = defaultAsset;
    return SLOT_TYPES.map((slotType, i) => {
      const skill = findSkill(typeDef, slotType, selected[slotType]);
      return {
        key: SLOT_HOTKEYS[i],
        slotType,
        skill,
        icon: skill ? asset(skill.icon) : null,
        label: skill?.name || SLOT_UI_LABELS[slotType],
      };
    });
  }

  global.WeaponSkillTree = {
    CDN,
    CATEGORY_TO_TYPE,
    SLOT_TYPES,
    loadCatalog,
    setCatalog,
    getTypeDef,
    listTypeIds,
    categoryToTypeId,
    resolveTypeFromWeapon,
    defaultSelections,
    findSkill,
    renderActionBarHTML,
    renderSlotColumnsHTML,
    renderEquippedWeaponPanel,
    getHotbarSkills,
    esc,
    defaultAsset,
  };
})(typeof window !== 'undefined' ? window : globalThis);