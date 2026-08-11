/**
 * grudge6 prefab ↔ animation connection rules (pure, no THREE).
 * SSOT bridge: master-weaponSkills.prefab.* ↔ grudge6-anim-packs packs/roles
 *            ↔ prod/gltf weapon meshes.
 *
 * Used by:
 *   - js/grudge6-prefab-anim-worker.js (editor AI worker)
 *   - scripts/wire-skill-prefab-anims.mjs (batch fill nulls)
 *   - grudge6-editor game-ready tests
 */

export const CDN = 'https://assets.grudge-studio.com';

/** ObjectStore / Warlords weaponType id → grudge6 anim pack id */
export const WEAPON_TYPE_TO_PACK = {
  SWORD: 'sword_shield',
  AXE: '2h_melee',
  GREATAXE: '2h_melee',
  GREATSWORD: '2h_melee',
  HAMMER: '2h_melee',
  MACE: '2h_melee',
  SCYTHE: '2h_melee',
  DAGGER: 'dagger',
  SPEAR: 'polearm',
  BOW: 'longbow',
  CROSSBOW: 'pistol',
  GUN: 'rifle',
  STAFF: 'magic',
  WAND: 'magic',
  TOME: 'magic',
  SHIELD: 'sword_shield',
  TOOL: 'harvest',
};

/** Fantasy weapon type → prod/gltf mesh key (matches wire-prod-gltf-weapon-prefabs) */
export const WEAPON_TYPE_TO_MODEL = {
  SWORD: 'prod/gltf/weapons/sword.glb',
  AXE: 'prod/gltf/weapons/axe.glb',
  GREATAXE: 'prod/gltf/weapons/axe.glb',
  GREATSWORD: 'prod/gltf/weapons/sword.glb',
  HAMMER: 'prod/gltf/weapons/hammer.glb',
  MACE: 'prod/gltf/weapons/mace.glb',
  SCYTHE: 'prod/gltf/weapons/axe.glb',
  DAGGER: 'prod/gltf/weapons/dagger.glb',
  SPEAR: 'prod/gltf/weapons/staff.glb',
  BOW: 'prod/gltf/weapons/bow.glb',
  CROSSBOW: 'prod/gltf/weapons/bow.glb',
  GUN: 'prod/gltf/weapons/assault_rifle.glb',
  STAFF: 'prod/gltf/weapons/staff.glb',
  WAND: 'prod/gltf/weapons/staff.glb',
  TOME: 'prod/gltf/weapons/staff.glb',
  SHIELD: 'prod/gltf/weapons/sword.glb',
};

/** master-weaponSkills slot.type → combat anim role */
export const SLOT_TYPE_TO_ROLE = {
  primary: 'attack',
  secondary: 'heavy',
  ability: 'skill1',
  special: 'skill2',
  ultimate: 'skill4',
  defense: 'block',
  passive: 'idle',
  style: 'idle',
};

/**
 * Name/description keyword → role override (before slot default).
 * First match wins.
 */
export const NAME_ROLE_RULES = [
  { re: /block|guard|parry|shield\s*bash/i, role: 'block' },
  { re: /reload|sheath|holster/i, role: 'sheath' },
  { re: /draw|unsheath|ready/i, role: 'draw' },
  { re: /channel|sustain|beam|aura/i, role: 'cast' },
  { re: /cast|spell|bolt|orb|missile|nova|wave|surge/i, role: 'cast' },
  { re: /aim|snipe|focus/i, role: 'aim' },
  { re: /ultimate|execute|finisher|annihilat/i, role: 'skill4' },
  { re: /spin|whirl|cyclone|cleave\s*all/i, role: 'heavy' },
  { re: /jump|leap|gap.?close|lunge|charge/i, role: 'skill2' },
  { re: /heavy|slam|overhead|crush|smash/i, role: 'heavy' },
  { re: /thrust|stab|pierce|impale/i, role: 'attack' },
  { re: /slash|strike|swing|cut|hack/i, role: 'attack' },
  { re: /shot|fire|blast|volley|spray/i, role: 'attack' },
  { re: /heal|buff|stance|idle/i, role: 'idle' },
];

/** Optional VFX id hints by element keyword (docs-compatible string refs) */
export const VFX_HINTS = [
  { re: /fire|flame|inferno|ember|pyro/i, vfx: 'fireball', impact: 'inferno' },
  { re: /ice|frost|freeze|glacial/i, vfx: 'frost_wave', impact: 'frost_wave' },
  { re: /lightning|thunder|storm|shock/i, vfx: 'chain_lightning', impact: 'ice_lightning_burst' },
  { re: /nature|earth|vine|root/i, vfx: 'earth_surge', impact: 'earth_surge' },
  { re: /holy|light|divine|radiant/i, vfx: 'moon_beam', impact: 'moon_beam' },
  { re: /shadow|dark|void|curse/i, vfx: 'shadow_bolt', impact: 'shadow_burst' },
];

export function normalizeWeaponType(raw) {
  const s = String(raw || 'SWORD')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '');
  if (WEAPON_TYPE_TO_PACK[s]) return s;
  if (/SWORD/.test(s) && !/GREAT/.test(s)) return 'SWORD';
  if (/GREATSWORD|2HSWORD/.test(s)) return 'GREATSWORD';
  if (/GREATAXE|2HAXE/.test(s)) return 'GREATAXE';
  if (/AXE/.test(s)) return 'AXE';
  if (/BOW|LONGBOW/.test(s)) return 'BOW';
  if (/CROSSBOW/.test(s)) return 'CROSSBOW';
  if (/GUN|RIFLE|PISTOL/.test(s)) return 'GUN';
  if (/STAFF/.test(s)) return 'STAFF';
  if (/WAND/.test(s)) return 'WAND';
  if (/TOME|BOOK|GRIMOIRE/.test(s)) return 'TOME';
  if (/DAGGER|KNIFE/.test(s)) return 'DAGGER';
  if (/SPEAR|LANCE|POLE/.test(s)) return 'SPEAR';
  if (/HAMMER/.test(s)) return 'HAMMER';
  if (/MACE/.test(s)) return 'MACE';
  if (/SCYTHE/.test(s)) return 'SCYTHE';
  if (/SHIELD/.test(s)) return 'SHIELD';
  return 'SWORD';
}

export function packForWeaponType(weaponType) {
  return WEAPON_TYPE_TO_PACK[normalizeWeaponType(weaponType)] || 'sword_shield';
}

export function modelKeyForWeaponType(weaponType) {
  return WEAPON_TYPE_TO_MODEL[normalizeWeaponType(weaponType)] || null;
}

export function modelUrlForWeaponType(weaponType) {
  const key = modelKeyForWeaponType(weaponType);
  return key ? `${CDN}/${key}` : null;
}

/**
 * Resolve combat anim role for a skill + optional slot type.
 */
export function suggestAnimRole(skill, slotType) {
  const text = [skill?.name, skill?.id, skill?.description, ...(skill?.effects || [])]
    .filter(Boolean)
    .join(' ');
  for (const rule of NAME_ROLE_RULES) {
    if (rule.re.test(text)) return rule.role;
  }
  const st = String(slotType || skill?._slotType || skill?.slot || skill?.slotType || 'primary').toLowerCase();
  if (SLOT_TYPE_TO_ROLE[st]) return SLOT_TYPE_TO_ROLE[st];
  // numeric tier heuristic: 1=attack, 2=heavy, 3+=skill
  const tier = Number(skill?.tier);
  if (Number.isFinite(tier)) {
    if (tier <= 1) return 'attack';
    if (tier === 2) return 'heavy';
    if (tier === 3) return 'skill1';
    if (tier >= 4) return 'skill2';
  }
  return 'attack';
}

export function suggestVfx(skill) {
  const text = [skill?.name, skill?.id, skill?.description, skill?.damageType, ...(skill?.effects || [])]
    .filter(Boolean)
    .join(' ');
  for (const h of VFX_HINTS) {
    if (h.re.test(text)) return { vfxRef: h.vfx, impactRef: h.impact };
  }
  const dt = String(skill?.damageType || '').toLowerCase();
  if (dt === 'fire') return { vfxRef: 'fireball', impactRef: 'inferno' };
  if (dt === 'frost' || dt === 'ice') return { vfxRef: 'frost_wave', impactRef: 'frost_wave' };
  if (dt === 'lightning') return { vfxRef: 'chain_lightning', impactRef: 'ice_lightning_burst' };
  if (dt === 'nature') return { vfxRef: 'earth_surge', impactRef: 'earth_surge' };
  return { vfxRef: null, impactRef: null };
}

/**
 * Canonical animationClip string: `{pack}/{role}` — editor resolves via clipUrlsFor(pack, role).
 */
export function makeAnimationClipId(pack, role) {
  return `${pack}/${role}`;
}

/**
 * Propose a complete prefab block improvement for one skill.
 * Never invents assets outside known pack/model maps.
 */
export function suggestPrefabPatch(skill, weaponType, opts = {}) {
  const wt = normalizeWeaponType(weaponType || skill?.weaponType || 'SWORD');
  const pack = packForWeaponType(wt);
  const role = suggestAnimRole(skill, opts.slotType || skill?._slotType);
  const clipId = makeAnimationClipId(pack, role);
  const modelKey = modelKeyForWeaponType(wt);
  const modelUrl = modelUrlForWeaponType(wt);
  const vfx = suggestVfx(skill);
  const prev = skill?.prefab && typeof skill.prefab === 'object' ? skill.prefab : {};

  const next = {
    modelRef: prev.modelRef || modelKey || null,
    vfxRef: prev.vfxRef || vfx.vfxRef,
    impactRef: prev.impactRef || vfx.impactRef,
    animationClip: prev.animationClip || clipId,
    soundRef: prev.soundRef || null,
    cameraShake: prev.cameraShake != null ? prev.cameraShake : role === 'skill4' || role === 'heavy' ? 'light' : null,
    projectileRef: prev.projectileRef || null,
  };

  // Keep existing non-null fields; only fill nulls unless force
  if (!opts.force) {
    for (const k of Object.keys(next)) {
      if (prev[k] != null && prev[k] !== '') next[k] = prev[k];
    }
  }

  const filled = [];
  for (const k of Object.keys(next)) {
    if ((prev[k] == null || prev[k] === '') && next[k] != null && next[k] !== '') filled.push(k);
  }

  return {
    skillId: skill?.id || skill?.uuid || null,
    skillUuid: skill?.uuid || null,
    weaponType: wt,
    animPack: pack,
    animRole: role,
    animationClip: next.animationClip,
    modelKey,
    modelUrl,
    prefab: next,
    filledFields: filled,
    improved: filled.length > 0,
    score: prefabReadyScore(next),
  };
}

/** 0–100 game-ready score for a prefab block */
export function prefabReadyScore(prefab) {
  if (!prefab || typeof prefab !== 'object') return 0;
  let s = 0;
  if (prefab.animationClip) s += 40;
  if (prefab.modelRef) s += 25;
  if (prefab.vfxRef) s += 15;
  if (prefab.impactRef) s += 10;
  if (prefab.soundRef) s += 5;
  if (prefab.cameraShake) s += 5;
  return Math.min(100, s);
}

export function isPrefabGameReady(prefab, minScore = 40) {
  return prefabReadyScore(prefab) >= minScore && !!(prefab && prefab.animationClip);
}

/**
 * Walk master-weaponSkills document; return skills + audit + patches.
 */
export function auditWeaponSkillsDoc(doc) {
  const skills = [];
  for (const wt of doc?.weaponTypes || []) {
    const weaponType = wt.id || wt.type || wt.name;
    for (const slot of wt.slots || []) {
      for (const s of slot.skills || []) {
        skills.push({
          skill: s,
          weaponType,
          slotType: slot.type || slot.label,
          path: `weaponTypes[${wt.id}].slots[${slot.type}]`,
        });
      }
    }
    for (const s of wt.skills || []) {
      skills.push({ skill: s, weaponType, slotType: s.slot || 'primary', path: `weaponTypes[${wt.id}].skills` });
    }
  }

  const patches = [];
  let withClip = 0;
  let withModel = 0;
  let withVfx = 0;
  let improved = 0;
  let ready = 0;

  for (const row of skills) {
    const pref = row.skill.prefab || {};
    if (pref.animationClip) withClip++;
    if (pref.modelRef) withModel++;
    if (pref.vfxRef) withVfx++;
    if (isPrefabGameReady(pref)) ready++;
    const patch = suggestPrefabPatch(row.skill, row.weaponType, { slotType: row.slotType });
    patch.path = row.path;
    patches.push(patch);
    if (patch.improved) improved++;
  }

  return {
    version: doc?.version || null,
    totalSkills: skills.length,
    withAnimationClip: withClip,
    withModelRef: withModel,
    withVfxRef: withVfx,
    gameReadyCount: ready,
    improveable: improved,
    pctClip: skills.length ? +((100 * withClip) / skills.length).toFixed(1) : 0,
    pctReady: skills.length ? +((100 * ready) / skills.length).toFixed(1) : 0,
    patches,
    byWeapon: summarizeByWeapon(patches),
  };
}

function summarizeByWeapon(patches) {
  const m = {};
  for (const p of patches) {
    const k = p.weaponType || '?';
    if (!m[k]) m[k] = { total: 0, improveable: 0, avgScore: 0 };
    m[k].total++;
    if (p.improved) m[k].improveable++;
    m[k].avgScore += p.score;
  }
  for (const k of Object.keys(m)) {
    m[k].avgScore = +(m[k].avgScore / m[k].total).toFixed(1);
  }
  return m;
}

/**
 * Apply fill-null patches into a master-weaponSkills document (mutates).
 * Returns count of skills touched.
 */
export function applyPrefabPatchesToDoc(doc, opts = {}) {
  const force = !!opts.force;
  let touched = 0;
  let fieldsFilled = 0;

  for (const wt of doc?.weaponTypes || []) {
    const weaponType = wt.id || wt.type || wt.name;
    const visit = (s, slotType) => {
      if (!s || typeof s !== 'object') return;
      if (!s.prefab || typeof s.prefab !== 'object') s.prefab = {};
      const patch = suggestPrefabPatch(s, weaponType, { slotType, force });
      if (!patch.improved && !force) return;
      const before = { ...s.prefab };
      s.prefab = { ...s.prefab, ...patch.prefab };
      // also mirror animation string on skill when empty
      if (!s.animation && s.prefab.animationClip) s.animation = s.prefab.animationClip;
      s.prefabWiredAt = new Date().toISOString();
      s.prefabWireSource = 'grudge6-prefab-anim-rules';
      s.animPack = patch.animPack;
      s.animRole = patch.animRole;
      let changed = false;
      for (const k of Object.keys(s.prefab)) {
        if (before[k] !== s.prefab[k]) {
          changed = true;
          if (before[k] == null || before[k] === '') fieldsFilled++;
        }
      }
      if (changed) touched++;
    };

    for (const slot of wt.slots || []) {
      for (const s of slot.skills || []) visit(s, slot.type || slot.label);
    }
    for (const s of wt.skills || []) visit(s, s.slot || 'primary');
  }

  doc.prefabAnimWiredAt = new Date().toISOString();
  doc.prefabAnimWireVersion = 1;
  doc.prefabAnimWireNote =
    'animationClip = {pack}/{role} resolved by grudge6-anim-packs clipUrlsFor; modelRef = prod/gltf key';

  return { touched, fieldsFilled };
}

/** Game-ready check catalog (ids used by editor worker) */
export const GAME_READY_CHECK_IDS = [
  'race_loaded',
  'si_height',
  'feet_ground',
  'hand_bones',
  'mixer_idle',
  'play_kit_cdn',
  'anim_pack_attack',
  'skill_prefab_clip',
  'weapon_model_cdn',
  'loadout_bound',
];
