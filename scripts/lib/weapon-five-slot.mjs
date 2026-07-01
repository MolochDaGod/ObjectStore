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
    const overlap = [...new Set([...tokens(raw), ...tokens(aliased)])].some((t) => tokens(key).includes(t));
    if (overlap) return true;
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
    const sigKey = normalizeKey(parseAbilityName(sigRaw));
    const matched = pool.find((sk) => skillNameMatches(new Set([sigKey]), sk.name, weaponType, aliases));
    if (matched) return matched;
  }

  return pool.find((sk) => sk.tier <= 1) || pool[0];
}

export function slotMap(slots) {
  return Object.fromEntries((slots || []).map((s) => [s.type, s]));
}

export const SLOT_LABELS = {
  primary: 'Slot 1 · Standard Attack',
  secondary: 'Slot 2 · Shared Style',
  ability: 'Slot 3 · Shared Style',
  ultimate: 'Slot 4 · Signature',
  passive: 'Slot 5 · Passives',
};

/**
 * @returns {{ slots: object[], passives: string[], slotPattern: string }}
 */
export function applyFiveSlotPattern(slots, variantMeta, weaponType, aliases, opts = {}) {
  const map = slotMap(slots);
  const isT0 = opts.tier === 0;

  if (isT0) {
    const standard = pickStandardAttack(map.primary?.skills, variantMeta, weaponType, aliases);
    const outSlots = [];
    const skillUuids = [];
    if (standard) {
      outSlots.push({
        type: 'primary',
        label: SLOT_LABELS.primary,
        unlockTier: 1,
        skillIds: [standard.id],
        skillUuids: standard.uuid ? [standard.uuid] : [],
        shared: true,
      });
      if (standard.uuid) skillUuids.push(standard.uuid);
    }
    return {
      slots: outSlots,
      passives: variantMeta?.passives || [],
      skillUuids,
      slotPattern: 'five-slot-starter',
      bindingMode: opts.bindingMode || 'starter',
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