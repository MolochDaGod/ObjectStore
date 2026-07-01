/**
 * Canonical 5-slot weapon hotbar pattern:
 *   1 — standard attack (one skill, same per weapon type)
 *   2 — shared style options (full secondary pool for type)
 *   3 — shared style options (full ability pool for type)
 *   4 — signature (variant ultimate, 1 skill)
 *   5 — passives (variant-specific, display/loadout metadata)
 */

export function parseAbilityName(str) {
  if (!str) return null;
  return String(str).replace(/\s*\([^)]*\)\s*/g, ' ').trim().split(/\s{2,}/)[0].trim() || null;
}

export function normalizeKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function resolveAlias(aliases, weaponType, abilityKey) {
  const typeMap = aliases?.byWeaponType?.[weaponType] || {};
  return typeMap[abilityKey] || aliases?.global?.[abilityKey] || abilityKey;
}

export function skillNameMatches(allowedKeys, skillName, weaponType, aliases) {
  const key = normalizeKey(skillName);
  for (const raw of allowedKeys) {
    const aliased = resolveAlias(aliases, weaponType, raw);
    if (key === aliased || key.includes(aliased) || aliased.includes(key)) return true;
    const tokens = (s) => s.split(' ').filter((t) => t.length > 3);
    const rawTokens = [...new Set([...tokens(raw), ...tokens(aliased)])];
    const keyTokens = tokens(key);
    const overlap = rawTokens.filter((t) => keyTokens.includes(t));
    if (overlap.length >= 2 || (overlap.length === 1 && rawTokens.length === 1 && keyTokens.length === 1)) return true;
  }
  return false;
}

export function pickStandardAttack(primarySkills, variantMeta, weaponType, aliases) {
  const pool = primarySkills || [];
  if (!pool.length) return null;

  if (variantMeta?.basicAbility) {
    const key = normalizeKey(parseAbilityName(variantMeta.basicAbility));
    const matched = pool.find((sk) => skillNameMatches(new Set([key]), sk.name, weaponType, aliases));
    if (matched) return matched;
  }

  return pool.find((sk) => sk.tier <= 1) || pool[0];
}

export function pickSignature(ultimateSkills, variantMeta, weaponType, aliases) {
  const pool = ultimateSkills || [];
  if (!pool.length) return null;

  const sigRaw = variantMeta?.signatureAbility || variantMeta?.signature;
  if (sigRaw) {
    const sigName = parseAbilityName(sigRaw);
    const sigKey = normalizeKey(sigName);
    const sigSlug = sigKey.replace(/\s+/g, '_');

    const exact = pool.find((sk) => normalizeKey(sk.name) === sigKey);
    if (exact) return exact;

    const aliased = resolveAlias(aliases, weaponType, sigKey);
    const aliasExact = pool.find(
      (sk) => normalizeKey(sk.name) === normalizeKey(aliased) || normalizeKey(sk.name) === aliased,
    );
    if (aliasExact) return aliasExact;

    const idMatch = pool.find(
      (sk) => sk.id === `${weaponType.toLowerCase()}_${sigSlug}` || sk.id?.endsWith(`_${sigSlug}`),
    );
    if (idMatch) return idMatch;

    const matched = pool.find((sk) => skillNameMatches(new Set([sigKey]), sk.name, weaponType, aliases));
    if (matched) return matched;
  }

  return pool.find((sk) => sk.tier <= 1) || pool[0];
}

export function slotMap(slots) {
  return Object.fromEntries((slots || []).map((s) => [s.type, s]));
}

export const OFFHAND_TOGGLE_KEY = 'F';
export const OFFHAND_INJECT_SLOT_TYPES = ['primary', 'secondary', 'ability'];
export const PRESERVED_MAINHAND_SLOT_TYPES = ['ultimate', 'passive'];

export const SLOT_LABELS = {
  primary: 'Slot 1 · Standard Attack',
  secondary: 'Slot 2 · Shared Style',
  ability: 'Slot 3 · Shared Style',
  ultimate: 'Slot 4 · Signature',
  passive: 'Slot 5 · Passives',
};

export const T0_SLOT_LABELS = {
  primary: 'Slot 1 · Starter Attack',
  secondary: 'Slot 2 · Starter Style',
  ability: 'Slot 3 · Starter Ability',
};

export const OFFHAND_ACTIVE_LABELS = {
  primary: `Slot 1 · ${OFFHAND_TOGGLE_KEY} Active`,
  secondary: `Slot 2 · ${OFFHAND_TOGGLE_KEY} Active`,
  ability: `Slot 3 · ${OFFHAND_TOGGLE_KEY} Active`,
};

export const LOADOUT_PATTERN = {
  toggleKey: OFFHAND_TOGGLE_KEY,
  pattern: 'five-slot',
  offhandTypes: ['SHIELD', 'TOME'],
  injectSlots: [1, 2, 3],
  preserveSlots: [4, 5],
};

/**
 * @returns {{ slots: object[], passives: string[], slotPattern: string }}
 */
export function applyFiveSlotPattern(slots, variantMeta, weaponType, aliases, opts = {}) {
  const map = slotMap(slots);
  const isT0 = opts.tier === 0;

  if (isT0) {
    if (weaponType === 'TOOL') {
      const starter = opts.starterSlots;
      if (starter?.length) {
        const outSlots = [];
        const skillUuids = [];
        for (const slot of starter) {
          const ids = (slot.skills || []).map((s) => s.id);
          const uuids = (slot.skills || []).map((s) => s.uuid).filter(Boolean);
          outSlots.push({
            type: slot.type,
            label: slot.label || T0_SLOT_LABELS[slot.type] || slot.type,
            unlockTier: 0,
            skillIds: ids,
            skillUuids: uuids,
            fixed: !!slot.fixed,
            choice: !!slot.choice,
            shared: !slot.choice,
          });
          skillUuids.push(...uuids);
        }
        return {
          slots: outSlots,
          passives: [],
          skillUuids: [...new Set(skillUuids)],
          slotPattern: 'gather-starter',
          bindingMode: 'gather',
          craftsInto: 'T1',
        };
      }
      return {
        slots: [],
        passives: [],
        skillUuids: [],
        slotPattern: 'gather',
        bindingMode: 'gather',
        note: 'T0 tool — run enrich:t0-starter-skills to populate gather slots 1–3',
      };
    }

    const starter = opts.starterSlots;
    if (starter?.length) {
      const outSlots = [];
      const skillUuids = [];
      for (const slot of starter) {
        const ids = (slot.skills || []).map((s) => s.id);
        const uuids = (slot.skills || []).map((s) => s.uuid).filter(Boolean);
        outSlots.push({
          type: slot.type,
          label: slot.label || T0_SLOT_LABELS[slot.type] || slot.type,
          unlockTier: 0,
          skillIds: ids,
          skillUuids: uuids,
          fixed: !!slot.fixed,
          choice: !!slot.choice,
          shared: !slot.choice,
        });
        skillUuids.push(...uuids);
      }
      return {
        slots: outSlots,
        passives: [],
        skillUuids: [...new Set(skillUuids)],
        slotPattern: 'three-slot-starter',
        bindingMode: opts.bindingMode || 'starter',
        craftsInto: 'T1',
      };
    }

    const standard = pickStandardAttack(map.primary?.skills, variantMeta, weaponType, aliases);
    const outSlots = [];
    const skillUuids = [];
    if (standard) {
      outSlots.push({
        type: 'primary',
        label: T0_SLOT_LABELS.primary,
        unlockTier: 0,
        skillIds: [standard.id],
        skillUuids: standard.uuid ? [standard.uuid] : [],
        shared: true,
        fixed: true,
      });
      if (standard.uuid) skillUuids.push(standard.uuid);
    }
    return {
      slots: outSlots,
      passives: [],
      skillUuids,
      slotPattern: 'three-slot-starter',
      bindingMode: opts.bindingMode || 'starter',
      craftsInto: 'T1',
    };
  }

  const standard = pickStandardAttack(map.primary?.skills, variantMeta, weaponType, aliases);
  const secondary = map.secondary?.skills || [];
  const ability = map.ability?.skills || [];
  const signature = pickSignature(map.ultimate?.skills, variantMeta, weaponType, aliases);

  const outSlots = [];
  const skillUuids = [];

  if (standard) {
    outSlots.push({
      type: 'primary',
      label: SLOT_LABELS.primary,
      unlockTier: map.primary?.unlockTier ?? 1,
      skillIds: [standard.id],
      skillUuids: standard.uuid ? [standard.uuid] : [],
      shared: true,
      standardAttack: standard.name,
    });
    if (standard.uuid) skillUuids.push(standard.uuid);
  }

  if (secondary.length) {
    const ids = secondary.map((s) => s.id);
    const uuids = secondary.map((s) => s.uuid).filter(Boolean);
    outSlots.push({
      type: 'secondary',
      label: SLOT_LABELS.secondary,
      unlockTier: map.secondary?.unlockTier ?? 2,
      skillIds: ids,
      skillUuids: uuids,
      shared: true,
    });
    skillUuids.push(...uuids);
  }

  if (ability.length) {
    const ids = ability.map((s) => s.id);
    const uuids = ability.map((s) => s.uuid).filter(Boolean);
    outSlots.push({
      type: 'ability',
      label: SLOT_LABELS.ability,
      unlockTier: map.ability?.unlockTier ?? 2,
      skillIds: ids,
      skillUuids: uuids,
      shared: true,
    });
    skillUuids.push(...uuids);
  }

  if (signature) {
    outSlots.push({
      type: 'ultimate',
      label: SLOT_LABELS.ultimate,
      unlockTier: map.ultimate?.unlockTier ?? 3,
      skillIds: [signature.id],
      skillUuids: signature.uuid ? [signature.uuid] : [],
      shared: false,
      signature: signature.name,
    });
    if (signature.uuid) skillUuids.push(signature.uuid);
  }

  return {
    slots: outSlots,
    passives: variantMeta?.passives || [],
    skillUuids: [...new Set(skillUuids)],
    slotPattern: 'five-slot',
    bindingMode: opts.bindingMode || 'standard',
    standardAttack: standard?.name || null,
    signatureAbility: signature?.name || null,
  };
}

/** Build loadout metadata attached to every weapon prefab */
export function buildLoadoutMeta(weaponType, skillBinding, opts = {}) {
  const tier = opts.tier ?? 1;
  if (tier === 0 && weaponType !== 'TOOL') {
    return {
      pattern: 'three-slot-starter',
      role: weaponType === 'TOME' ? 'starterOffhand' : 'starter',
      noTierUpgrades: true,
      craftsInto: skillBinding?.craftsInto || 'T1',
      slotRoles: { 1: 'starterAttack', 2: 'starterStyle', 3: 'starterChoice' },
      ...(weaponType === 'TOME'
        ? { note: 'T1+ tomes couple via F toggle into mainhand slots 1–3' }
        : {}),
      bindings: skillBinding,
    };
  }
  if (tier === 0 && weaponType === 'TOOL') {
    return {
      pattern: skillBinding?.slotPattern || 'gather-starter',
      role: 'tool',
      noTierUpgrades: true,
      craftsInto: 'T1',
      slotRoles: { 1: 'gatherPrimary', 2: 'gatherStyle', 3: 'gatherChoice' },
      bindings: skillBinding,
    };
  }

  const isOffhand = weaponType === 'SHIELD' || weaponType === 'TOME';
  return {
    pattern: LOADOUT_PATTERN.pattern,
    toggleKey: OFFHAND_TOGGLE_KEY,
    ...(isOffhand
      ? {
          role: 'offhandModifier',
          whenToggleActive: {
            injectsIntoMainhandSlots: LOADOUT_PATTERN.injectSlots,
            preservesOnMainhand: LOADOUT_PATTERN.preserveSlots,
          },
          requiresOneHandMainhand: weaponType === 'TOME',
        }
      : {
          role: 'mainhand',
          slots: { 1: 'standardAttack', 2: 'sharedStyle', 3: 'sharedStyle', 4: 'signature', 5: 'passives' },
          offhandModifier: {
            toggleKey: OFFHAND_TOGGLE_KEY,
            affectedSlotsWhenEquipped: LOADOUT_PATTERN.injectSlots,
            preservedSlots: LOADOUT_PATTERN.preserveSlots,
          },
        }),
    bindings: skillBinding,
  };
}