#!/usr/bin/env node
/**
 * Stamp deterministic SKIL-* grudgeUuid, ICON-* iconUuid, CDN iconUrl,
 * and Bip001 prefab.animationClip pack/role on master-weaponSkills.json.
 * Does not invent skill rows.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS = join(ROOT, 'api/v1/master-weaponSkills.json');
const ICON_IDX = join(ROOT, 'api/v1/icon-path-index.json');

const PACK = {
  SWORD: 'sword_shield', AXE: 'sword_shield', DAGGER: 'dagger', CLAW: 'dagger',
  BOW: 'longbow', CROSSBOW: 'longbow', GUN: 'rifle',
  STAFF: 'magic', TOME: 'magic', WAND: 'magic',
  HAMMER: '2h_melee', GREATSWORD: '2h_melee', GREATAXE: '2h_melee',
  MACE: '2h_melee', SCYTHE: '2h_melee', SPEAR: 'polearm',
  SHIELD: 'sword_shield', TOOL: 'sword_shield',
};
const ROLE = {
  primary: 'attack', attack: 'attack', core: 'attack',
  defense: 'idle', special: 'special', ultimate: 'special',
};

function skilUuid(id) {
  const h = createHash('sha1').update('grudge-skill:' + String(id || '')).digest('hex').toUpperCase();
  return `SKIL-${h.slice(0, 4)}-${h.slice(4, 8)}-${h.slice(8, 12)}`;
}

function isPlayClip(c) {
  return typeof c === 'string' && c.includes('/') && !/\s/.test(c);
}

function walkSkills(j, fn) {
  for (const wt of [...(j.weaponTypes || []), ...(j.artifactWeapons || [])]) {
    for (const sl of wt.slots || []) {
      for (const sk of sl.skills || []) fn(sk, wt, sl);
    }
  }
}

const icons = JSON.parse(readFileSync(ICON_IDX, 'utf8')).index || {};
const j = JSON.parse(readFileSync(SKILLS, 'utf8'));
const stats = { n: 0, uuid: 0, iconUuid: 0, clipFill: 0, clipNorm: 0, prefab: 0 };

walkSkills(j, (sk, wt, sl) => {
  stats.n++;
  if (sk.uuid && !sk.uuidLegacy) sk.uuidLegacy = sk.uuid;
  sk.grudgeUuid = skilUuid(sk.id);
  sk.uuid = sk.grudgeUuid;
  stats.uuid++;
  const iconPath = sk.icon || '';
  const hit = icons[iconPath] || icons[iconPath.replace(/^\/+/, '/')] || null;
  if (hit?.grudgeUuid) {
    sk.iconUuid = hit.grudgeUuid;
    sk.iconUrl = hit.cdnUrl || sk.iconUrl;
    stats.iconUuid++;
  } else if (iconPath && !sk.iconUrl) {
    const rel = iconPath.replace(/^\//, '');
    sk.iconUrl = 'https://assets.grudge-studio.com/game-assets/' + rel;
  }
  if (!sk.prefab || typeof sk.prefab !== 'object') {
    sk.prefab = { modelRef: null, vfxRef: null, impactRef: null, animationClip: null, soundRef: null, cameraShake: null, projectileRef: null };
    stats.prefab++;
  }
  const pack = PACK[wt.id] || 'sword_shield';
  const role = ROLE[String(sl.type || sl.label || 'primary').toLowerCase()] || 'attack';
  const play = `${pack}/${role}`;
  if (!isPlayClip(sk.prefab.animationClip)) {
    if (sk.prefab.animationClip) sk.prefab.animationClipAuthor = sk.prefab.animationClip;
    sk.prefab.animationClip = play;
    stats.clipFill++;
  } else if (sk.prefab.animationClip !== play && !sk.prefab.animationClip.startsWith(pack + '/')) {
    sk.prefab.animationClipAuthor = sk.prefab.animationClipAuthor || sk.prefab.animationClip;
    stats.clipNorm++;
  }
  sk.weaponType = wt.id;
  sk.slotType = sl.type || sl.label || null;
});

j.ssot = {
  catalog: 'api/v1/master-weaponSkills.json',
  browse: 'https://info.grudge-studio.com/WEAPON_SKILLS.html',
  uuidLaw: 'api/v1/uuid-law.json',
  wiki: 'https://info.grudge-studio.com/wiki.html',
  skillUuid: 'SKIL-XXXX-XXXX-XXXX sha1(grudge-skill:{id})',
  iconUuid: 'ICON-* from icon-path-index.json',
  playClip: '{pack}/{role} on Bip001 — not Mixamo',
  notPlayerSsot: true,
};
j.generated = new Date().toISOString();
j.totalSkillsStamped = stats.n;
writeFileSync(SKILLS, JSON.stringify(j, null, 2) + '\n');
console.log(stats);
