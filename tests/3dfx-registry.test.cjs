/**
 * 3DFX Registry — Rendering Compatibility Test Suite
 *
 * Validates every effect definition in 3dfx-registry.json against the viewer's
 * actual rendering contract (geometry types, particle distributions, shaders,
 * blending modes, bloom, timing, colors, tags).
 *
 * Run:  node tests/3dfx-registry.test.cjs
 */

const path = require('path');
const registry = require(path.join(__dirname, '..', 'api', 'v1', '3dfx-registry.json'));

// ── Viewer contract: supported values extracted from 3dfx-viewer.html ────────

const VALID_GEOMETRY_TYPES = new Set([
  'plane', 'ring', 'sphere', 'torus', 'compound', 'wall', 'rune_disc',
  'arc', 'cone', 'cylinder',
]);

const VALID_PARTICLE_DISTRIBUTIONS = new Set([
  'sphere', 'circular', 'ring', 'spiral', 'volume', 'explosion',
  'cone', 'ground', 'hemisphere', 'plane', 'points', 'trail', 'line',
  'beam', 'arc', 'dual-arc', 'multi-arc', 'cylinder',
  'sphere-inward', 'spiral-inward',
]);

const VALID_SHADERS = new Set([
  'fire', 'lightning', 'shockwave', 'magic', null,
]);

const VALID_BLENDING = new Set(['additive', 'normal']);

const VALID_CATEGORIES = new Set(Object.keys(registry.categories));

const VALID_COST_COLORS = /^#[0-9a-fA-F]{6}$/;

const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

// ── Test runner ──────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
let warnings = 0;
const failures = [];
const warns = [];

function assert(condition, effectId, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(`FAIL [${effectId}]: ${message}`);
  }
}

function warn(effectId, message) {
  warnings++;
  warns.push(`WARN [${effectId}]: ${message}`);
}

// ── Header tests ─────────────────────────────────────────────────────────────

const effects = registry.effects;
const effectIds = Object.keys(effects);
const actualTotal = effectIds.length;

assert(
  registry.totalEffects === actualTotal,
  'HEADER',
  `totalEffects header (${registry.totalEffects}) != actual count (${actualTotal})`
);

// Category counts
for (const [catKey, catDef] of Object.entries(registry.categories)) {
  const actual = Object.values(effects).filter(e => e.category === catKey).length;
  assert(
    catDef.count === actual,
    'HEADER',
    `Category "${catKey}" header count (${catDef.count}) != actual (${actual})`
  );
  assert(
    HEX_COLOR.test(catDef.color),
    'HEADER',
    `Category "${catKey}" color "${catDef.color}" is not a valid hex color`
  );
}

// No duplicate IDs
const idSet = new Set(effectIds);
assert(idSet.size === effectIds.length, 'HEADER', 'Duplicate effect IDs found');

// ── Per-effect tests ─────────────────────────────────────────────────────────

for (const [id, fx] of Object.entries(effects)) {

  // Required fields
  assert(fx.id === id, id, `id field "${fx.id}" doesn't match key "${id}"`);
  assert(typeof fx.name === 'string' && fx.name.length > 0, id, 'Missing or empty name');
  assert(typeof fx.description === 'string' && fx.description.length > 0, id, 'Missing description');
  assert(typeof fx.category === 'string', id, 'Missing category');
  assert(VALID_CATEGORIES.has(fx.category), id, `Unknown category "${fx.category}"`);
  assert(typeof fx.source === 'string', id, 'Missing source');

  // Colors
  assert(fx.colors && typeof fx.colors === 'object', id, 'Missing colors object');
  if (fx.colors) {
    assert(HEX_COLOR.test(fx.colors.primary), id, `Invalid primary color "${fx.colors.primary}"`);
    assert(HEX_COLOR.test(fx.colors.secondary), id, `Invalid secondary color "${fx.colors.secondary}"`);
  }

  // Timing
  assert(fx.timing && typeof fx.timing === 'object', id, 'Missing timing object');
  if (fx.timing) {
    assert(typeof fx.timing.duration === 'number' && fx.timing.duration > 0, id,
      `Invalid duration: ${fx.timing.duration}`);
    assert(typeof fx.timing.loop === 'boolean', id, `loop must be boolean, got ${typeof fx.timing.loop}`);
    assert(typeof fx.timing.speed === 'number' && fx.timing.speed > 0, id,
      `Invalid speed: ${fx.timing.speed}`);
  }

  // Shader
  assert(VALID_SHADERS.has(fx.shader), id, `Unknown shader "${fx.shader}"`);

  // Particles
  assert(fx.particles && typeof fx.particles === 'object', id, 'Missing particles config');
  if (fx.particles) {
    const p = fx.particles;
    assert(typeof p.count === 'number' && p.count > 0, id, `Invalid particle count: ${p.count}`);
    assert(typeof p.size === 'number' && p.size > 0, id, `Invalid particle size: ${p.size}`);
    assert(typeof p.opacity === 'number' && p.opacity >= 0 && p.opacity <= 1, id,
      `Particle opacity out of range: ${p.opacity}`);
    assert(VALID_BLENDING.has(p.blending), id, `Unknown blending mode "${p.blending}"`);

    // Distribution (optional but should be valid if present)
    if (p.distribution) {
      if (!VALID_PARTICLE_DISTRIBUTIONS.has(p.distribution)) {
        warn(id, `Non-standard particle distribution "${p.distribution}" — viewer will use sphere fallback`);
      }
    }

    // velocityY should be [min, max] array if present
    if (p.velocityY) {
      assert(Array.isArray(p.velocityY) && p.velocityY.length === 2, id,
        `velocityY must be [min, max] array, got ${JSON.stringify(p.velocityY)}`);
    }
  }

  // Geometry (optional)
  if (fx.geometry) {
    const g = fx.geometry;
    assert(typeof g.type === 'string', id, 'Geometry missing type');

    if (g.type === 'compound') {
      assert(g.elements && (Array.isArray(g.elements) || typeof g.elements[0] === 'string'), id,
        'Compound geometry missing elements array');
    } else {
      if (!VALID_GEOMETRY_TYPES.has(g.type)) {
        warn(id, `Non-standard geometry type "${g.type}" — may not render`);
      }
    }

    // Arc-specific validation
    if (g.type === 'arc') {
      assert(typeof g.radius === 'number' && g.radius > 0, id, `Arc missing valid radius`);
      assert(typeof g.arcAngle === 'number' && g.arcAngle > 0, id, `Arc missing valid arcAngle`);
      assert(typeof g.width === 'number' && g.width > 0, id, `Arc missing valid width`);
    }

    // Ring-specific
    if (g.type === 'ring') {
      assert(typeof g.innerRadius === 'number', id, 'Ring missing innerRadius');
      assert(typeof g.outerRadius === 'number', id, 'Ring missing outerRadius');
      if (typeof g.innerRadius === 'number' && typeof g.outerRadius === 'number') {
        assert(g.outerRadius > g.innerRadius, id,
          `Ring outerRadius (${g.outerRadius}) must be > innerRadius (${g.innerRadius})`);
      }
    }

    // Torus-specific
    if (g.type === 'torus') {
      assert(typeof g.radius === 'number' && g.radius > 0, id, 'Torus missing valid radius');
      assert(typeof g.tube === 'number' && g.tube > 0, id, 'Torus missing valid tube');
    }

    // Sphere-specific
    if (g.type === 'sphere') {
      assert(typeof g.radius === 'number' && g.radius > 0, id, 'Sphere missing valid radius');
    }

    // Cylinder-specific
    if (g.type === 'cylinder') {
      assert(typeof g.height === 'number' && g.height > 0, id, 'Cylinder missing valid height');
    }
  }

  // Bloom
  assert(fx.bloom && typeof fx.bloom === 'object', id, 'Missing bloom config');
  if (fx.bloom) {
    assert(typeof fx.bloom.strength === 'number' && fx.bloom.strength >= 0, id,
      `Invalid bloom strength: ${fx.bloom.strength}`);
    assert(typeof fx.bloom.radius === 'number' && fx.bloom.radius >= 0, id,
      `Invalid bloom radius: ${fx.bloom.radius}`);
    assert(typeof fx.bloom.threshold === 'number' && fx.bloom.threshold >= 0 && fx.bloom.threshold <= 1, id,
      `Bloom threshold out of range [0,1]: ${fx.bloom.threshold}`);
  }

  // Light (optional)
  if (fx.light) {
    assert(HEX_COLOR.test(fx.light.color), id, `Invalid light color "${fx.light.color}"`);
    assert(typeof fx.light.intensity === 'number' && fx.light.intensity > 0, id,
      `Invalid light intensity: ${fx.light.intensity}`);
    assert(typeof fx.light.distance === 'number' && fx.light.distance > 0, id,
      `Invalid light distance: ${fx.light.distance}`);
  }

  // Screen shake (optional)
  if (fx.screenShake) {
    assert(typeof fx.screenShake.intensity === 'number' && fx.screenShake.intensity > 0, id,
      `Invalid screenShake intensity`);
    assert(typeof fx.screenShake.duration === 'number' && fx.screenShake.duration > 0, id,
      `Invalid screenShake duration`);
  }

  // Tags
  assert(Array.isArray(fx.tags) && fx.tags.length > 0, id, 'Missing or empty tags array');
  if (fx.tags) {
    for (const tag of fx.tags) {
      assert(typeof tag === 'string' && tag.length > 0, id, `Invalid tag: ${JSON.stringify(tag)}`);
    }
    // Effect should be tagged with its own category
    if (!fx.tags.includes(fx.category)) {
      warn(id, `Tags don't include own category "${fx.category}"`);
    }
  }
}

// ── New effects specific tests ───────────────────────────────────────────────

const NEW_SLASH_IDS = [
  'slash_horizontal', 'slash_vertical', 'slash_cross', 'slash_spin',
  'slash_combo', 'slash_fire', 'slash_frost',
];

const NEW_ANNIHILATOR_IDS = [
  'annihilator_beam', 'annihilator_slam', 'annihilator_vortex',
  'annihilator_nova', 'annihilator_execute',
];

for (const id of NEW_SLASH_IDS) {
  assert(id in effects, id, 'Slash effect missing from registry');
  if (effects[id]) {
    assert(effects[id].category === 'combat', id, `Slash effect should be category "combat", got "${effects[id].category}"`);
    assert(effects[id].source === 'grudge-rpg-combat', id, `Source should be "grudge-rpg-combat"`);
    assert(effects[id].tags.includes('slash'), id, 'Slash effect missing "slash" tag');
    assert(effects[id].tags.includes('rpg'), id, 'Slash effect missing "rpg" tag');
    assert(effects[id].tags.includes('melee'), id, 'Slash effect missing "melee" tag');
    assert(effects[id].timing.loop === false, id, 'Slash effects should not loop (one-shot attacks)');
  }
}

for (const id of NEW_ANNIHILATOR_IDS) {
  assert(id in effects, id, 'Annihilator effect missing from registry');
  if (effects[id]) {
    assert(effects[id].category === 'annihilator', id, `Should be category "annihilator", got "${effects[id].category}"`);
    assert(effects[id].source === 'grudge-rpg-combat', id, 'Source should be "grudge-rpg-combat"');
    assert(effects[id].tags.includes('annihilator'), id, 'Missing "annihilator" tag');
    assert(effects[id].tags.includes('ultimate'), id, 'Missing "ultimate" tag');
    assert(effects[id].bloom.strength >= 2.5, id,
      `Annihilator bloom too weak (${effects[id].bloom.strength}), expected >= 2.5`);
  }
}

// Slash geometry: all should use arc or compound-with-arc
for (const id of NEW_SLASH_IDS) {
  if (!effects[id]) continue;
  const g = effects[id].geometry;
  if (g) {
    const hasArc = g.type === 'arc' ||
      (g.type === 'compound' && Array.isArray(g.elements) && g.elements.some(e => typeof e === 'object' && e.type === 'arc'));
    assert(hasArc, id, `Slash effect should use arc geometry, got "${g.type}"`);
  }
}

// Cross slash: compound with exactly 2 arcs
if (effects.slash_cross?.geometry) {
  const elems = effects.slash_cross.geometry.elements;
  assert(Array.isArray(elems), 'slash_cross', 'Cross slash elements should be array');
  if (Array.isArray(elems)) {
    const arcCount = elems.filter(e => typeof e === 'object' && e.type === 'arc').length;
    assert(arcCount === 2, 'slash_cross', `Cross slash should have 2 arcs, got ${arcCount}`);
  }
}

// Combo slash: compound with 3 sequenced arcs
if (effects.slash_combo?.geometry) {
  const elems = effects.slash_combo.geometry.elements;
  assert(Array.isArray(elems), 'slash_combo', 'Combo elements should be array');
  if (Array.isArray(elems)) {
    const arcs = elems.filter(e => typeof e === 'object' && e.type === 'arc');
    assert(arcs.length === 3, 'slash_combo', `Combo should have 3 arcs, got ${arcs.length}`);
    // Verify delays are sequential
    if (arcs.length === 3) {
      assert(arcs[0].delay === 0, 'slash_combo', 'First arc delay should be 0');
      assert(arcs[1].delay > arcs[0].delay, 'slash_combo', 'Second arc should have later delay');
      assert(arcs[2].delay > arcs[1].delay, 'slash_combo', 'Third arc should have latest delay');
    }
  }
}

// Flame slash should use fire shader
assert(effects.slash_fire?.shader === 'fire', 'slash_fire', 'Flame slash should use fire shader');

// Annihilator beam should use lightning shader + cylinder geometry
if (effects.annihilator_beam) {
  assert(effects.annihilator_beam.shader === 'lightning', 'annihilator_beam', 'Beam should use lightning shader');
  assert(effects.annihilator_beam.geometry?.type === 'cylinder', 'annihilator_beam', 'Beam should use cylinder geometry');
  assert(effects.annihilator_beam.screenShake?.continuous === true, 'annihilator_beam', 'Beam screen shake should be continuous');
}

// Annihilator nova should have highest bloom
if (effects.annihilator_nova) {
  const novaBloom = effects.annihilator_nova.bloom.strength;
  const allBlooms = Object.values(effects).map(e => e.bloom?.strength || 0);
  const maxBloom = Math.max(...allBlooms);
  assert(novaBloom === maxBloom, 'annihilator_nova',
    `Nova should have highest bloom (${novaBloom}), but max is ${maxBloom}`);
}

// Executioner's mark: compound with 2 descending arcs + 1 ring
if (effects.annihilator_execute?.geometry) {
  const elems = effects.annihilator_execute.geometry.elements;
  if (Array.isArray(elems)) {
    const arcs = elems.filter(e => typeof e === 'object' && e.type === 'arc');
    const rings = elems.filter(e => typeof e === 'object' && e.type === 'ring');
    assert(arcs.length === 2, 'annihilator_execute', `Execute should have 2 arcs, got ${arcs.length}`);
    assert(rings.length === 1, 'annihilator_execute', `Execute should have 1 ring, got ${rings.length}`);
    assert(arcs.every(a => a.descend === true), 'annihilator_execute', 'Execute arcs should descend');
  }
}

// ── Report ───────────────────────────────────────────────────────────────────

console.log('\n' + '='.repeat(60));
console.log('  3DFX Registry — Rendering Compatibility Report');
console.log('='.repeat(60));
console.log(`  Effects tested: ${actualTotal}`);
console.log(`  Passed:   ${passed}`);
console.log(`  Failed:   ${failed}`);
console.log(`  Warnings: ${warnings}`);
console.log('='.repeat(60));

if (failures.length) {
  console.log('\nFAILURES:');
  failures.forEach(f => console.log('  ' + f));
}
if (warns.length) {
  console.log('\nWARNINGS:');
  warns.forEach(w => console.log('  ' + w));
}

console.log('');
process.exit(failed > 0 ? 1 : 0);
