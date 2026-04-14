/**
 * @grudge-studio/objectstore/characters
 *
 * Clean API for Grudge race characters, animations, and weapon models.
 * All assets served from Cloudflare R2 CDN.
 *
 * Usage:
 *   import { GrudgeCharacters } from '@grudge-studio/objectstore/characters';
 *   const chars = new GrudgeCharacters();
 *
 *   // Get character model URL
 *   const url = chars.getCharacterModelURL('fabled', 'elf');
 *
 *   // List all animation files in a pack
 *   const anims = chars.getAnimationPack('pro_sword_shield');
 *
 *   // Get a weapon model URL
 *   const sword = chars.getWeaponURL('swords', '_sword_1.fbx');
 */

// ══════════════════════════════════════════════════════════════
// CDN Configuration
// ══════════════════════════════════════════════════════════════
const DEFAULT_CDN = 'https://assets.grudge-studio.com';
const R2_PREFIX = 'characters';

// ══════════════════════════════════════════════════════════════
// Faction / Race Registry
// ══════════════════════════════════════════════════════════════
const FACTIONS = {
  crusade: {
    name: 'Crusade', color: '#c9a04e',
    races: {
      human:     { name: 'Human',     prefix: 'WK_',  model: 'WK_Characters_customizable.FBX',  cavalry: 'WK_Cavalry_customizable.FBX' },
      barbarian: { name: 'Barbarian', prefix: 'BRB_', model: 'BRB_Characters_customizable.FBX', cavalry: 'BRB_Cavalry_customizable.FBX' },
    },
  },
  fabled: {
    name: 'Fabled', color: '#7ec8e3',
    races: {
      elf:   { name: 'Elf',   prefix: 'ELF_', model: 'ELF_Characters_customizable.FBX', cavalry: 'ELF_Cavalry_customizable.FBX' },
      dwarf: { name: 'Dwarf', prefix: 'DWF_', model: 'DWF_Characters_customizable.FBX', cavalry: 'DWF_Cavalry_customizable.FBX' },
    },
  },
  legion: {
    name: 'Legion', color: '#8b2020',
    races: {
      orc:    { name: 'Orc',    prefix: 'ORC_', model: 'ORC_Characters_Customizable.FBX', cavalry: 'ORC_Cavalry_Customizable.FBX' },
      undead: { name: 'Undead', prefix: 'UD_',  model: 'UD_Characters_customizable.FBX',  cavalry: 'UD_Cavalry_customizable.FBX' },
    },
  },
};

// ══════════════════════════════════════════════════════════════
// Animation Packs
// ══════════════════════════════════════════════════════════════
const ANIMATION_PACKS = {
  // Combat — Base
  '1h_sword_shield':  { name: '1H Sword & Shield',  type: 'combat',     files: ['sword and shield idle.fbx','sword and shield run.fbx','sword and shield run (2).fbx','sword and shield attack.fbx','sword and shield attack (2).fbx','sword and shield attack (3).fbx','sword and shield attack (4).fbx','sword and shield block.fbx','sword and shield block (2).fbx','sword and shield block idle.fbx','sword and shield strafe.fbx','sword and shield strafe (2).fbx','sword and shield turn.fbx','sword and shield turn (2).fbx','sword and shield death.fbx','draw sword 1.fbx','sheath sword 1.fbx'] },
  '2h_melee':         { name: '2H Melee',            type: 'combat',     files: ['standing idle.fbx','standing run forward.fbx','standing run back.fbx','standing melee attack horizontal.fbx','standing melee attack downward.fbx','standing melee attack backhand.fbx','standing melee attack 360 high.fbx','standing melee attack 360 low.fbx','standing melee combo attack ver. 1.fbx','standing melee combo attack ver. 2.fbx','standing melee combo attack ver. 3.fbx','standing melee run jump attack.fbx','standing block idle.fbx','standing block react large.fbx','standing jump.fbx','standing walk forward.fbx','standing walk back.fbx','standing walk left.fbx','standing walk right.fbx','standing turn left 90.fbx','standing turn right 90.fbx','standing taunt battlecry.fbx','standing taunt chest thump.fbx'] },
  longbow:            { name: 'Longbow',             type: 'combat',     files: ['standing idle 01.fbx','standing run forward.fbx','standing run back.fbx','standing run left.fbx','standing run right.fbx','standing aim overdraw.fbx','standing aim recoil.fbx','standing draw arrow.fbx','standing equip bow.fbx','standing disarm bow.fbx','standing aim walk forward.fbx','standing aim walk back.fbx','standing aim walk left.fbx','standing aim walk right.fbx','standing block.fbx','standing dodge forward.fbx','standing dodge backward.fbx','standing dodge left.fbx','standing dodge right.fbx','standing death forward 01.fbx','standing death backward 01.fbx','standing melee kick.fbx','standing melee punch.fbx'] },
  magic:              { name: 'Magic Staff',         type: 'combat',     files: ['standing idle.fbx','standing idle 02.fbx','Standing Run Forward.fbx','Standing Run Back.fbx','Standing Walk Forward.fbx','Standing Walk Back.fbx','Standing 1H Magic Attack 01.fbx','Standing 2H Magic Area Attack 02.fbx','Standing Jump.fbx','Standing React Death Backward.fbx','Standing React Large From Front.fbx','Standing React Small From Front.fbx','Standing Turn Left 90.fbx','Standing Turn Right 90.fbx'] },
  rifle_crossbow:     { name: 'Rifle / Crossbow',   type: 'combat',     files: ['rifle aiming idle.fbx','rifle run.fbx','firing rifle.fbx','reloading.fbx','rifle jump.fbx','hit reaction.fbx','run backwards.fbx','strafe left.fbx','strafe right.fbx','walking.fbx','walking backwards.fbx','toss grenade.fbx','turn left.fbx','turning right 45 degrees.fbx'] },
  advanced_gun:       { name: 'Advanced Gun 8-Dir',  type: 'combat',     files: ['idle.fbx','idle aiming.fbx','run forward.fbx','run backward.fbx','run left.fbx','run right.fbx','sprint forward.fbx','walk forward.fbx','walk backward.fbx','walk left.fbx','walk right.fbx','jump up.fbx','jump loop.fbx','jump down.fbx','death from front headshot.fbx','death from the back.fbx','turn 90 left.fbx','turn 90 right.fbx'] },

  // Combat — Pro (expanded)
  pro_sword_shield:   { name: 'Pro Sword & Shield',  type: 'combat',     files: ['draw sword 1.fbx','draw sword 2.fbx','sheath sword 1.fbx','sheath sword 2.fbx','sword and shield attack.fbx','sword and shield attack (2).fbx','sword and shield attack (3).fbx','sword and shield attack (4).fbx','sword and shield block.fbx','sword and shield block (2).fbx','sword and shield block idle.fbx','sword and shield casting.fbx','sword and shield casting (2).fbx','sword and shield crouch idle.fbx','sword and shield crouch.fbx','sword and shield crouch block.fbx','sword and shield crouch block (2).fbx','sword and shield crouch block idle.fbx','sword and shield death.fbx','sword and shield death (2).fbx','sword and shield idle.fbx','sword and shield idle (2).fbx','sword and shield impact.fbx','sword and shield impact (2).fbx','sword and shield jump.fbx','sword and shield kick.fbx','sword and shield kick (2).fbx','sword and shield power up.fbx','sword and shield run.fbx','sword and shield run (2).fbx','sword and shield slash.fbx','sword and shield slash (2).fbx','sword and shield strafe.fbx','sword and shield strafe (2).fbx','sword and shield strafe (3).fbx','sword and shield strafe (4).fbx','sword and shield turn.fbx','sword and shield turn (2).fbx','sword and shield 180 turn.fbx','sword and shield 180 turn (2).fbx','sword and shield walk.fbx','sword and shield walk (2).fbx'] },
  pro_longbow:        { name: 'Pro Longbow',         type: 'combat',     files: ['standing aim overdraw.fbx','standing aim recoil.fbx','standing aim walk forward.fbx','standing aim walk back.fbx','standing aim walk left.fbx','standing aim walk right.fbx','standing block.fbx','standing death backward 01.fbx','standing death forward 01.fbx','standing disarm bow.fbx','standing dive forward.fbx','standing dodge backward.fbx','standing dodge forward.fbx','standing dodge left.fbx','standing dodge right.fbx','standing draw arrow.fbx','standing equip bow.fbx','standing idle 01.fbx','standing idle 02.fbx','standing melee kick.fbx','standing melee punch.fbx','standing run back.fbx','standing run forward.fbx','standing run left.fbx','standing run right.fbx','standing turn left 90.fbx','standing turn right 90.fbx','standing walk back.fbx','standing walk forward.fbx','standing walk left.fbx','standing walk right.fbx','fall a loop.fbx','fall a land to run forward.fbx','fall a land to standing idle 01.fbx'] },
  pro_magic:          { name: 'Pro Magic',           type: 'combat',     files: ['standing 1H cast spell 01.fbx','Standing 1H Magic Attack 01.fbx','Standing 1H Magic Attack 02.fbx','Standing 1H Magic Attack 03.fbx','Standing 2H Cast Spell 01.fbx','Standing 2H Magic Area Attack 01.fbx','Standing 2H Magic Area Attack 02.fbx','Standing 2H Magic Attack 01.fbx','Standing 2H Magic Attack 02.fbx','Standing 2H Magic Attack 03.fbx','Standing 2H Magic Attack 04.fbx','Standing 2H Magic Attack 05.fbx','Crouch Idle.fbx','Crouch To Standing Idle.fbx','Crouch Turn Left 90.fbx','Crouch Turn Right 90.fbx','Crouch Walk Back.fbx','Crouch Walk Forward.fbx','Crouch Walk Left.fbx','Crouch Walk Right.fbx'] },
  pro_melee_axe:      { name: 'Pro Melee Axe',       type: 'combat',     files: ['standing idle.fbx','standing idle looking ver. 1.fbx','standing idle looking ver. 2.fbx','standing jump.fbx','standing melee attack horizontal.fbx','standing melee attack downward.fbx','standing melee attack backhand.fbx','standing melee attack 360 high.fbx','standing melee attack 360 low.fbx','standing melee combo attack ver. 1.fbx','standing melee combo attack ver. 2.fbx','standing melee combo attack ver. 3.fbx','standing melee attack kick ver. 1.fbx','standing melee attack kick ver. 2.fbx','standing block idle.fbx','standing block react large.fbx','standing disarm over shoulder.fbx','standing disarm underarm.fbx','crouch idle.fbx','crouch to standing idle.fbx'] },
  great_sword:        { name: 'Great Sword',         type: 'combat',     files: ['draw a great sword 1.fbx','draw a great sword 2.fbx','great sword idle.fbx','great sword idle (2).fbx','great sword idle (3).fbx','great sword idle (4).fbx','great sword idle (5).fbx','great sword attack.fbx','great sword high spin attack.fbx','great sword slash.fbx','great sword slash (2).fbx','great sword slash (3).fbx','great sword slash (4).fbx','great sword slash (5).fbx','great sword slide attack.fbx','great sword blocking.fbx','great sword blocking (2).fbx','great sword blocking (3).fbx','great sword casting.fbx','great sword run.fbx','great sword run (2).fbx','great sword walk.fbx','great sword walk (2).fbx','great sword strafe.fbx','great sword strafe (2).fbx','great sword strafe (3).fbx','great sword strafe (4).fbx','great sword turn.fbx','great sword turn (2).fbx','great sword 180 turn.fbx','great sword 180 turn (2).fbx','great sword jump.fbx','great sword jump (2).fbx','great sword jump attack.fbx','great sword kick.fbx','great sword kick (2).fbx','great sword power up.fbx','great sword impact.fbx','great sword impact (2).fbx','great sword impact (3).fbx','great sword impact (4).fbx','great sword impact (5).fbx','great sword crouching.fbx','great sword crouching (2).fbx','great sword crouching (3).fbx','great sword crouching (4).fbx','great sword crouching (5).fbx','great sword crouching (6).fbx','two handed sword death.fbx','two handed sword death (2).fbx','spell cast.fbx'] },

  // Locomotion
  magic_locomotion:   { name: 'Magic Locomotion',    type: 'locomotion', files: ['standing idle.fbx','Standing Run Forward.fbx','Standing Run Back.fbx','Standing Run Left.fbx','Standing Run Right.fbx','Standing Sprint Forward.fbx','Standing Walk Forward.fbx','Standing Walk Back.fbx','Standing Walk Left.fbx','Standing Walk Right.fbx','Standing Jump.fbx','Standing Jump Running.fbx','Standing Jump Running Landing.fbx','Standing Land To Standing Idle.fbx','Standing Turn Left 90.fbx','Standing Turn Right 90.fbx'] },
  male_injured:       { name: 'Male Injured',        type: 'locomotion', files: ['injured idle.fbx','injured hurting idle.fbx','injured stumble idle.fbx','injured wave idle.fbx','injured run.fbx','injured run jump.fbx','injured run left turn.fbx','injured run right turn.fbx','injured run backwards.fbx','injured run backwards left turn.fbx','injured run backwards right turn.fbx','injured walk.fbx','injured walk backwards.fbx','injured walk left turn.fbx','injured walk right turn.fbx','injured turn left.fbx','injured turn right.fbx','injured backwards turn left.fbx','injured backwards turn right.fbx','injured standing jump.fbx'] },
  male_locomotion:    { name: 'Male Locomotion',     type: 'locomotion', files: ['idle.fbx','standard run.fbx','walking.fbx','left strafe.fbx','right strafe.fbx','left strafe walking.fbx','right strafe walking.fbx','left turn 90.fbx','right turn 90.fbx','jump.fbx','rac.fbx'] },
};

// ══════════════════════════════════════════════════════════════
// Weapon Model Packs
// ══════════════════════════════════════════════════════════════
const WEAPON_PACKS = {
  swords:          { name: 'Swords (24)',           count: 24, prefix: '_sword_' },
  axes_2h:         { name: 'Axes 2H (24)',          count: 24, prefix: '_axe_' },
  axes_1h:         { name: 'Axes 1H (24)',          count: 24, prefix: '_axe_' },
  staffs:          { name: 'Staffs (24)',           count: 24, prefix: '_cane_' },
  shields:         { name: 'Shields (20)',          count: 20, prefix: '_Shield_' },
  bows:            { name: 'Bows (24)',             count: 24, prefix: '_bow_' },
  daggers:         { name: 'Daggers (24)',          count: 24, prefix: '_dagger_' },
  hammers_2h:      { name: 'Hammers 2H (24)',       count: 24, prefix: '_hammer_' },
  magic_staffs:    { name: 'Magic Staffs (24)',     count: 24, prefix: '_staff_' },
  crossbows:       { name: 'Crossbows (24)',        count: 24, prefix: '_crossbow_' },
  swords_extra:    { name: 'Swords Extra (24)',     count: 24, prefix: '_sword_' },
  staffs_extra:    { name: 'Staffs Extra (24)',     count: 24, prefix: '_cane_' },
  fantasy_weapons: { name: 'Fantasy Weapons (58)',  count: 58, prefix: '' },
  medieval:        { name: 'Medieval Collection (19)', count: 19, prefix: '' },
};

// ══════════════════════════════════════════════════════════════
// GrudgeCharacters Class
// ══════════════════════════════════════════════════════════════
export class GrudgeCharacters {
  /**
   * @param {object} [opts]
   * @param {string} [opts.cdnBase]  Override CDN base URL
   * @param {string} [opts.r2Base]   Override R2 key prefix
   */
  constructor(opts = {}) {
    this.cdn = (opts.cdnBase || DEFAULT_CDN).replace(/\/$/, '');
    this.prefix = opts.r2Base || R2_PREFIX;
  }

  // ── URL builders ────────────────────────────────────────────

  /** Build a CDN URL for an R2 key */
  url(r2Key) {
    return `${this.cdn}/${r2Key}`;
  }

  // ── Characters ──────────────────────────────────────────────

  /** List all factions with their races */
  listFactions() {
    return Object.entries(FACTIONS).map(([id, f]) => ({
      id,
      name: f.name,
      color: f.color,
      races: Object.entries(f.races).map(([rId, r]) => ({ id: rId, name: r.name, prefix: r.prefix })),
    }));
  }

  /** List all available races as flat array */
  listRaces() {
    const races = [];
    for (const [fId, f] of Object.entries(FACTIONS)) {
      for (const [rId, r] of Object.entries(f.races)) {
        races.push({ factionId: fId, factionName: f.name, raceId: rId, ...r });
      }
    }
    return races;
  }

  /** Get the main customizable character model URL */
  getCharacterModelURL(factionId, raceId) {
    const race = FACTIONS[factionId]?.races?.[raceId];
    if (!race) throw new Error(`Unknown race: ${factionId}/${raceId}`);
    return this.url(`${this.prefix}/factions/${factionId}/${raceId}/${race.model}`);
  }

  /** Get the cavalry model URL */
  getCavalryModelURL(factionId, raceId) {
    const race = FACTIONS[factionId]?.races?.[raceId];
    if (!race) throw new Error(`Unknown race: ${factionId}/${raceId}`);
    return this.url(`${this.prefix}/factions/${factionId}/${raceId}/${race.cavalry}`);
  }

  /** Get race config (prefix, model name, etc.) */
  getRace(factionId, raceId) {
    const faction = FACTIONS[factionId];
    if (!faction) return null;
    const race = faction.races[raceId];
    if (!race) return null;
    return { factionId, factionName: faction.name, raceId, ...race };
  }

  // ── Animations ──────────────────────────────────────────────

  /** List all animation pack IDs and names */
  listAnimationPacks(type) {
    return Object.entries(ANIMATION_PACKS)
      .filter(([, p]) => !type || p.type === type)
      .map(([id, p]) => ({ id, name: p.name, type: p.type, fileCount: p.files.length }));
  }

  /** Get full animation pack with file URLs */
  getAnimationPack(packId) {
    const pack = ANIMATION_PACKS[packId];
    if (!pack) throw new Error(`Unknown animation pack: ${packId}`);
    return {
      id: packId,
      ...pack,
      urls: pack.files.map(f => ({
        file: f,
        name: f.replace(/\.fbx$/i, ''),
        url: this.url(`${this.prefix}/animations/${packId}/${f}`),
      })),
    };
  }

  /** Get a single animation file URL */
  getAnimationURL(packId, fileName) {
    return this.url(`${this.prefix}/animations/${packId}/${fileName}`);
  }

  /** Find animations by keyword across all packs */
  searchAnimations(query) {
    const q = query.toLowerCase();
    const results = [];
    for (const [packId, pack] of Object.entries(ANIMATION_PACKS)) {
      for (const file of pack.files) {
        if (file.toLowerCase().includes(q)) {
          results.push({
            packId,
            packName: pack.name,
            file,
            name: file.replace(/\.fbx$/i, ''),
            url: this.url(`${this.prefix}/animations/${packId}/${file}`),
          });
        }
      }
    }
    return results;
  }

  // ── Weapons ─────────────────────────────────────────────────

  /** List all weapon pack IDs and names */
  listWeaponPacks() {
    return Object.entries(WEAPON_PACKS).map(([id, p]) => ({
      id, name: p.name, count: p.count, prefix: p.prefix,
    }));
  }

  /** Get a weapon model URL by pack and index (1-based) */
  getWeaponURL(packId, fileOrIndex) {
    const pack = WEAPON_PACKS[packId];
    if (!pack) throw new Error(`Unknown weapon pack: ${packId}`);
    const file = typeof fileOrIndex === 'number'
      ? `${pack.prefix}${fileOrIndex}.fbx`
      : fileOrIndex;
    return this.url(`${this.prefix}/weapons/${packId}/${file}`);
  }

  /** Get all weapon URLs in a pack */
  getWeaponPack(packId) {
    const pack = WEAPON_PACKS[packId];
    if (!pack) throw new Error(`Unknown weapon pack: ${packId}`);
    const urls = [];
    for (let i = 1; i <= pack.count; i++) {
      const file = `${pack.prefix}${i}.fbx`;
      urls.push({ index: i, file, url: this.url(`${this.prefix}/weapons/${packId}/${file}`) });
    }
    return { id: packId, ...pack, models: urls };
  }
}

// ══════════════════════════════════════════════════════════════
// Convenience singleton
// ══════════════════════════════════════════════════════════════
export const grudgeCharacters = new GrudgeCharacters();

// Re-export constants for direct access
export { FACTIONS, ANIMATION_PACKS, WEAPON_PACKS };
