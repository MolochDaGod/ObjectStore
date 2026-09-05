/**
 * Stamp unique-per-weapon-type skill trees on master-weaponSkills.json.
 *
 * Law: each weapon TYPE owns its own 5-slot tree (not class trees).
 * Named variants (Bloodfeud vs Wraithfang) filter that type's catalog —
 * they never inherit another type's skills. Animation clips come from
 * Casting/grudge6 pack roles (sword_shield / longbow / magic / pistol / rifle / unarmed).
 *
 * Does not invent skill ids.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, "api/v1/master-weaponSkills.json");
const j = JSON.parse(readFileSync(path, "utf8"));

/** Unique slot copy — never "Shared". */
const SLOT_LABELS = {
  SWORD: {
    primary: "Slot 1 · Slash",
    secondary: "Slot 2 · Grudge arts",
    ability: "Slot 3 · Blade techniques",
    ultimate: "Slot 4 · Signature",
    passive: "Slot 5 · Passives",
  },
  AXE: {
    primary: "Slot 1 · Chop",
    secondary: "Slot 2 · Pain arts",
    ability: "Slot 3 · Carnage",
    ultimate: "Slot 4 · Signature",
    passive: "Slot 5 · Passives",
  },
  DAGGER: {
    primary: "Slot 1 · Stab",
    secondary: "Slot 2 · Ambush",
    ability: "Slot 3 · Killer arts",
    ultimate: "Slot 4 · Signature",
    passive: "Slot 5 · Passives",
  },
  MACE: {
    primary: "Slot 1 · Strike",
    secondary: "Slot 2 · Consecrate",
    ability: "Slot 3 · Smite",
    ultimate: "Slot 4 · Signature",
    passive: "Slot 5 · Passives",
  },
  HAMMER: {
    primary: "Slot 1 · Smash",
    secondary: "Slot 2 · Quake",
    ability: "Slot 3 · Crush",
    ultimate: "Slot 4 · Signature",
    passive: "Slot 5 · Passives",
  },
  GREATSWORD: {
    primary: "Slot 1 · Cleave",
    secondary: "Slot 2 · Sweep",
    ability: "Slot 3 · Colossus",
    ultimate: "Slot 4 · Signature",
    passive: "Slot 5 · Passives",
  },
  GREATAXE: {
    primary: "Slot 1 · Brutal chop",
    secondary: "Slot 2 · Rage",
    ability: "Slot 3 · Devastate",
    ultimate: "Slot 4 · Signature",
    passive: "Slot 5 · Passives",
  },
  SPEAR: {
    primary: "Slot 1 · Thrust",
    secondary: "Slot 2 · Reach",
    ability: "Slot 3 · Dragon arts",
    ultimate: "Slot 4 · Signature",
    passive: "Slot 5 · Passives",
  },
  SCYTHE: {
    primary: "Slot 1 · Reap",
    secondary: "Slot 2 · Drain",
    ability: "Slot 3 · Necrotic",
    ultimate: "Slot 4 · Signature",
    passive: "Slot 5 · Passives",
  },
  BOW: {
    primary: "Slot 1 · Shot",
    secondary: "Slot 2 · Volley",
    ability: "Slot 3 · Hunter",
    ultimate: "Slot 4 · Signature",
    passive: "Slot 5 · Passives",
  },
  CROSSBOW: {
    primary: "Slot 1 · Bolt",
    secondary: "Slot 2 · Trap / sniper",
    ability: "Slot 3 · Barrage",
    ultimate: "Slot 4 · Signature",
    passive: "Slot 5 · Passives",
  },
  GUN: {
    primary: "Slot 1 · Shot",
    secondary: "Slot 2 · Round",
    ability: "Slot 3 · Blast",
    ultimate: "Slot 4 · Signature",
    passive: "Slot 5 · Passives",
  },
  STAFF: {
    primary: "Slot 1 · Bolt (school)",
    secondary: "Slot 2 · Wave (school)",
    ability: "Slot 3 · Shield / meteor",
    ultimate: "Slot 4 · Signature",
    passive: "Slot 5 · Passives",
  },
  WAND: {
    primary: "Slot 1 · Missile",
    secondary: "Slot 2 · Warp",
    ability: "Slot 3 · Arcane arts",
    ultimate: "Slot 4 · Signature",
    passive: "Slot 5 · Passives",
  },
  TOME: {
    primary: "Slot 1 · Page (F)",
    secondary: "Slot 2 · Page (F)",
    ability: "Slot 3 · Page (F)",
    ultimate: "Slot 4 · Relic surge",
    passive: "Slot 5 · Passives",
  },
  SHIELD: {
    primary: "Slot 1 · Block (F)",
    secondary: "Slot 2 · Guard (F)",
    ability: "Slot 3 · Bash (F)",
    ultimate: "Slot 4 · Aegis",
    passive: "Slot 5 · Passives",
  },
  CLAW: {
    primary: "Slot 1 · Rend",
    secondary: "Slot 2 · Beast",
    ability: "Slot 3 · Form arts",
    ultimate: "Slot 4 · Animal form",
    passive: "Slot 5 · Passives",
  },
  TOOL: {
    primary: "Slot 1 · Chop",
    secondary: "Slot 2 · Mine",
    ability: "Slot 3 · Skin / Pry",
    ultimate: "Slot 4 · —",
    passive: "Slot 5 · —",
  },
};

/** Pack + clip per slot. Casting / grudge6 Bip001 packs — not Mixamo. */
const TYPE_PACK = {
  SWORD: { pack: "sword_shield", clips: { primary: "attack1", secondary: "attack2", ability: "attack3", ultimate: "finisher" } },
  AXE: { pack: "sword_shield", clips: { primary: "attack1", secondary: "attack2", ability: "attack3", ultimate: "finisher" } },
  DAGGER: { pack: "sword_shield", clips: { primary: "attack1", secondary: "attack2", ability: "attack3", ultimate: "finisher" } },
  MACE: { pack: "sword_shield", clips: { primary: "attack1", secondary: "attack2", ability: "attack3", ultimate: "finisher" } },
  HAMMER: { pack: "sword_shield", clips: { primary: "twoHandAttack", secondary: "twoHandAttack3", ability: "attack3", ultimate: "finisher" } },
  GREATSWORD: { pack: "sword_shield", clips: { primary: "twoHandAttack", secondary: "twoHandAttack3", ability: "finisher", ultimate: "finisherAir" } },
  GREATAXE: { pack: "sword_shield", clips: { primary: "twoHandAttack", secondary: "twoHandAttack3", ability: "finisher", ultimate: "finisherAir" } },
  SPEAR: { pack: "sword_shield", clips: { primary: "spearAttack1", secondary: "spearAttack2", ability: "twoHandAttack3", ultimate: "finisher" } },
  SCYTHE: { pack: "sword_shield", clips: { primary: "twoHandAttack", secondary: "twoHandAttack3", ability: "finisher", ultimate: "finisherAir" } },
  BOW: { pack: "longbow", clips: { primary: "attack", secondary: "attack", ability: "attack", ultimate: "attack" } },
  CROSSBOW: { pack: "rifle", clips: { primary: "crossbowShoot", secondary: "crouchFire", ability: "attack", ultimate: "shoulderThrow" } },
  GUN: { pack: "pistol", clips: { primary: "attack", secondary: "attack2", ability: "skill1", ultimate: "heavy" } },
  STAFF: { pack: "magic", clips: { primary: "cast", secondary: "cast", ability: "cast", ultimate: "finisherAir" } },
  WAND: { pack: "magic", clips: { primary: "cast", secondary: "cast", ability: "cast", ultimate: "finisherAir" } },
  TOME: { pack: "magic", clips: { primary: "cast", secondary: "cast", ability: "cast", ultimate: "finisherAir" } },
  SHIELD: { pack: "sword_shield", clips: { primary: "block", secondary: "block", ability: "attack1", ultimate: "finisher" } },
  CLAW: { pack: "unarmed", clips: { primary: "attack1", secondary: "attack2", ability: "attack3", ultimate: "uppercut" } },
  TOOL: { pack: "sword_shield", clips: { primary: "attack1", secondary: "attack2", ability: "attack3", ultimate: "attack1" } },
};

const WRONG_PACK = /^(dagger|polearm|2h_melee|longbow)\//;

j.treeLaw = {
  uniquePerWeaponType: true,
  namedVariantFiltersTypePool: true,
  neverSharedSlots23: true,
  classTreesAreSeparate: "master-skillTrees.json (warrior/mage/…) — not this file",
  animPacks: "sword_shield | longbow | magic | pistol | rifle | unarmed",
  oneMixer: true,
};

for (const wt of j.weaponTypes || []) {
  const id = wt.id;
  const pack = TYPE_PACK[id];
  const labels = SLOT_LABELS[id];
  wt.uniqueTree = true;
  wt.animPack = pack?.pack || null;
  if (labels) wt.slotLabels = labels;
  for (const slot of wt.slots || []) {
    if (labels?.[slot.type]) slot.label = labels[slot.type];
    const role = pack?.clips?.[slot.type];
    const clip = pack && role ? `${pack.pack}/${role}` : null;
    for (const sk of slot.skills || []) {
      sk.weaponType = id;
      sk.slotType = slot.type;
      if (!sk.prefab) sk.prefab = {};
      const prev = String(sk.prefab.animationClip || "");
      if (!prev || WRONG_PACK.test(prev) || prev.endsWith("/attack") || prev.endsWith("/special")) {
        if (clip) sk.prefab.animationClip = clip;
      }
      if (!sk.animation && role) sk.animation = role;
      if (!sk.effects || !sk.effects.length) {
        sk.effects = [slot.type === "primary" ? "Weapon attack" : `${id} ${slot.type}`];
      }
    }
  }
}

j.generated = new Date().toISOString();
j.version = "3.2.0";
writeFileSync(path, JSON.stringify(j, null, 2) + "\n");
console.log("stamped unique trees on", (j.weaponTypes || []).length, "weapon types");
