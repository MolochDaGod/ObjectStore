/**
 * scripts/defs/armor.mjs
 *
 * Armor definitions. Filled per consolidation session.
 * The canonical armor shape is set × material × slot.
 *
 *   sets:     Bloodfeud, Wraithfang, Oathbreaker, Kinrend, Dusksinger, Emberclad, ...
 *   materials: cloth | leather | mail | plate
 *   slots:    helm, shoulder, chest, hands, legs, feet, belt, bracer, back, ring, necklace
 */

export const ARMOR = {
  // sets: {
  //   Bloodfeud: {
  //     lore: '…',
  //     setBonus: 'Arcane Ward: +20% magic resist',
  //     materials: {
  //       cloth: { primaryAttribute: 'Int/Wis', profession: 'Tailor', ... },
  //       leather: { primaryAttribute: 'Dex/Agi', profession: 'Leatherworker', ... },
  //       mail: { primaryAttribute: 'Str/End', profession: 'Armorer', ... },
  //       plate: { primaryAttribute: 'Str/Vit', profession: 'Armorer', ... },
  //     },
  //   },
  // },
};

export const SETS_MIGRATED = new Set(Object.keys(ARMOR));
