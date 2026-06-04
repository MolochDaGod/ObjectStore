/**
 * Grudge Game Data Hub — UUID Registry
 * Client-side UUID lookup and generation matching ObjectStore SDK format.
 */

const PREFIX_MAP = {
  hero: 'HERO', item: 'ITEM', equipment: 'EQIP', ability: 'ABIL',
  material: 'MATL', recipe: 'RECP', node: 'NODE', mob: 'MOBS',
  boss: 'BOSS', mission: 'MISS', food: 'FOOD', potion: 'POTN',
  skill: 'SKIL', attribute: 'ATTR', consumable: 'CONS',
};

let _seq = 0;

function _fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return ((h >>> 0) ^ ((h >>> 0) >>> 16)).toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
}

export function generateUuid(entityType, metadata = '') {
  const prefix = PREFIX_MAP[entityType] || entityType.slice(0, 4).toUpperCase();
  const now = new Date();
  const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
  const seq = (++_seq).toString(16).toUpperCase().padStart(6, '0');
  return `${prefix}-${ts}-${seq}-${_fnv1a(`${prefix}-${ts}-${seq}-${metadata}-${Math.random()}`)}`;
}

export function parseUuid(uuid) {
  if (!uuid || typeof uuid !== 'string') return null;
  const parts = uuid.split('-');
  if (parts.length !== 4) return null;
  return { prefix: parts[0], timestamp: parts[1], sequence: parts[2], hash: parts[3],
    entityType: Object.entries(PREFIX_MAP).find(([,v]) => v === parts[0])?.[0] || 'unknown' };
}

export function isValid(uuid) {
  return typeof uuid === 'string' && /^[A-Z]{4}-\d{14}-[0-9A-F]{6}-[0-9A-F]{8}$/.test(uuid);
}

export { PREFIX_MAP };
