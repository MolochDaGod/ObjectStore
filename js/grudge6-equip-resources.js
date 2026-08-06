/**
 * Equipment-based mesh resources for grudge6 race kits.
 *
 * Each resource is a valid paperdoll loadout (exclusive slots — never stacked
 * body A–G). Used for race scenes + asset catalog / thumb renders.
 *
 * Does NOT invent meshes: only cataloged EquipmentManager slots/variants.
 */
import { WEAPON_R, WEAPON_L } from './grudge6-kit.js';
import { packForWeaponSlot } from './grudge6-anim-packs.js';

const ARMOR = ['body', 'arms', 'legs', 'head', 'shoulders'];
const WEAPONS = [...WEAPON_R, ...WEAPON_L, 'shield'];

function pickDefault(variants, prefer = 'A') {
  if (!variants?.length) return null;
  if (variants.includes(prefer)) return prefer;
  if (variants.includes('_default')) return '_default';
  return [...variants].sort()[0];
}

/** Default base armor loadout (variant A where present). */
export function defaultArmorLoadout(summary) {
  const loadout = {};
  for (const slot of ARMOR) {
    const v = pickDefault(summary[slot] || []);
    if (v) loadout[slot] = v;
  }
  return loadout;
}

/**
 * Enumerate all equipment-based resource assets for a race kit.
 *
 * Strategy (bounded, production-usable):
 *  1. base — default armor + default sword (or first weapon)
 *  2. armor-vary — each armor slot × each variant (others default)
 *  3. weapon-vary — base armor × each exclusive weapon variant
 *  4. mesh-piece — single visible mesh id metadata for inventory icons (no full re-render required)
 *
 * Full cartesian of all armor slots is available via buildFullCartesian()
 * with an explicit cap (default off — can explode to thousands).
 */
export function enumerateEquipResources(raceId, summary, opts = {}) {
  const prefix = opts.prefix || '';
  const resources = [];
  const baseArmor = defaultArmorLoadout(summary);

  const defaultWeapon = (() => {
    for (const slot of ['sword', 'axe', 'hammer', 'bow', 'staff', 'spear', 'dagger']) {
      if (summary[slot]?.length) {
        return { slot, variant: pickDefault(summary[slot]) };
      }
    }
    return null;
  })();

  const baseLoadout = { ...baseArmor };
  if (defaultWeapon) {
    baseLoadout._weaponSlot = defaultWeapon.slot;
    baseLoadout._weaponVariant = defaultWeapon.variant;
  }

  resources.push({
    id: `${raceId}/base`,
    raceId,
    kind: 'base',
    label: `${raceId} base loadout`,
    loadout: { ...baseLoadout },
    animPack: packForWeaponSlot(defaultWeapon?.slot),
    weaponSlot: defaultWeapon?.slot || null,
  });

  // Armor variants (one slot at a time)
  for (const slot of ARMOR) {
    const vars = summary[slot] || [];
    for (const variant of vars) {
      const loadout = { ...baseArmor };
      loadout[slot] = variant;
      if (defaultWeapon) {
        loadout._weaponSlot = defaultWeapon.slot;
        loadout._weaponVariant = defaultWeapon.variant;
      }
      resources.push({
        id: `${raceId}/armor/${slot}_${variant}`,
        raceId,
        kind: 'armor_variant',
        label: `${slot} ${variant}`,
        slot,
        variant,
        loadout,
        animPack: packForWeaponSlot(defaultWeapon?.slot),
        weaponSlot: defaultWeapon?.slot || null,
      });
    }
  }

  // Weapon exclusives
  for (const slot of WEAPONS) {
    const vars = summary[slot] || [];
    for (const variant of vars) {
      const loadout = { ...baseArmor };
      loadout._weaponSlot = slot;
      loadout._weaponVariant = variant;
      resources.push({
        id: `${raceId}/weapon/${slot}_${variant}`,
        raceId,
        kind: 'weapon_variant',
        label: `${slot} ${variant === '_default' ? 'default' : variant}`,
        slot,
        variant,
        loadout,
        animPack: packForWeaponSlot(slot),
        weaponSlot: slot,
      });
    }
  }

  // Mesh piece index (asset registry — one entry per catalog mesh name)
  if (opts.includeMeshPieces !== false && opts.meshNames) {
    for (const name of opts.meshNames) {
      resources.push({
        id: `${raceId}/mesh/${name}`,
        raceId,
        kind: 'mesh_piece',
        label: name,
        meshName: name,
        loadout: null, // not a full paperdoll — piece catalog only
      });
    }
  }

  return resources;
}

/**
 * Apply a resource loadout onto EquipmentManager (exclusive visibility).
 */
export function applyResourceLoadout(equip, loadout) {
  if (!equip || !loadout) return;
  // Clear exclusive groups first
  for (const slot of ARMOR) {
    if (equip.slots[slot]) equip.unequip(slot);
  }
  equip.hideGroup?.('weapon_r');
  equip.hideGroup?.('weapon_l');
  equip.hideGroup?.('shield');
  equip.hideGroup?.('utility');

  for (const slot of ARMOR) {
    const v = loadout[slot];
    if (v && equip.slots[slot]?.[v]) equip.equip(slot, v);
  }

  const wSlot = loadout._weaponSlot;
  const wVar = loadout._weaponVariant;
  if (wSlot && equip.slots[wSlot]) {
    if (wSlot === 'shield') {
      equip.equip('shield', wVar || pickDefault(Object.keys(equip.slots.shield || {})));
    } else if (WEAPON_R.has(wSlot) || WEAPON_L.has(wSlot)) {
      equip.equipWeapon(wSlot, wVar || '_default');
    }
  }

  // Ensure base armor if still empty
  for (const slot of ['body', 'arms', 'legs']) {
    if (!equip.equipped[slot] && equip.slots[slot]) {
      const v = pickDefault(Object.keys(equip.slots[slot]));
      if (v) equip.equip(slot, v);
    }
  }

  equip.hardenVisibility?.();
}

/**
 * Full cartesian of armor slots (optional, capped).
 * @param {number} max — hard stop (default 200)
 */
export function buildFullCartesian(raceId, summary, max = 200) {
  const slots = ARMOR.filter((s) => (summary[s] || []).length);
  if (!slots.length) return [];

  let combos = [{}];
  for (const slot of slots) {
    const next = [];
    for (const prev of combos) {
      for (const variant of summary[slot]) {
        next.push({ ...prev, [slot]: variant });
        if (next.length >= max) break;
      }
      if (next.length >= max) break;
    }
    combos = next;
    if (combos.length >= max) break;
  }

  const defaultWeapon = (() => {
    if (summary.sword?.length) return { slot: 'sword', variant: pickDefault(summary.sword) };
    return null;
  })();

  return combos.slice(0, max).map((armor, i) => {
    const loadout = { ...armor };
    if (defaultWeapon) {
      loadout._weaponSlot = defaultWeapon.slot;
      loadout._weaponVariant = defaultWeapon.variant;
    }
    return {
      id: `${raceId}/full/${i.toString().padStart(4, '0')}`,
      raceId,
      kind: 'full_cartesian',
      label: slots.map((s) => `${s}${armor[s]}`).join('_'),
      loadout,
      animPack: 'sword_shield',
      weaponSlot: defaultWeapon?.slot || null,
    };
  });
}
