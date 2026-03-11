#!/usr/bin/env node
/**
 * JSON Schema Validation
 * Validates all api/v1/*.json files have required structure.
 * Usage: node scripts/validate-schemas.mjs
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'api', 'v1');

const SCHEMAS = {
  'weapons.json': {
    required: ['version', 'categories'],
    categoryShape: { required: ['items'], itemRequired: ['id', 'name'] }
  },
  'armor.json': {
    required: ['version'],
  },
  'materials.json': {
    required: ['version', 'materials'],
    arrayField: 'materials',
    itemRequired: ['id', 'name', 'tier']
  },
  'consumables.json': {
    required: ['version', 'categories']
  },
  'enemies.json': {
    required: ['enemies'],
    arrayField: 'enemies',
    itemRequired: ['id', 'name']
  },
  'bosses.json': {
    required: ['bosses'],
    arrayField: 'bosses',
    itemRequired: ['id', 'name']
  },
  'weaponSkills.json': {
    required: ['totalSkills', 'weaponTypes'],
    arrayField: 'weaponTypes',
    itemRequired: ['weaponType', 'skills']
  },
  'sprites2d.json': {
    required: ['totalSprites', 'categories']
  },
  'effectSprites.json': {
    required: ['totalEffects']
  },
  'abilityEffects.json': {
    required: ['totalAbilities']
  },
  'classes.json': {
    required: ['classes']
  },
  'races.json': {
    required: ['races']
  },
  'factions.json': {
    required: ['factions']
  },
  'professions.json': {
    required: ['professions']
  },
};

let passed = 0, failed = 0, warnings = 0;

function validate(filename, schema) {
  let data;
  try {
    data = JSON.parse(readFileSync(join(DATA_DIR, filename), 'utf8'));
  } catch (err) {
    console.error(`  ❌ ${filename}: Failed to parse — ${err.message}`);
    failed++;
    return;
  }

  // Check required fields
  for (const field of schema.required || []) {
    if (!(field in data)) {
      console.error(`  ❌ ${filename}: Missing required field "${field}"`);
      failed++;
      return;
    }
  }

  // Check array items
  if (schema.arrayField && schema.itemRequired) {
    const arr = data[schema.arrayField];
    if (!Array.isArray(arr)) {
      console.error(`  ❌ ${filename}: "${schema.arrayField}" is not an array`);
      failed++;
      return;
    }
    for (let i = 0; i < Math.min(arr.length, 5); i++) {
      for (const field of schema.itemRequired) {
        if (!(field in arr[i])) {
          console.warn(`  ⚠️  ${filename}: Item[${i}] missing "${field}"`);
          warnings++;
        }
      }
    }
  }

  // Check categories shape
  if (schema.categoryShape && data.categories) {
    for (const [cat, catData] of Object.entries(data.categories)) {
      for (const field of schema.categoryShape.required || []) {
        if (!(field in catData)) {
          console.warn(`  ⚠️  ${filename}: Category "${cat}" missing "${field}"`);
          warnings++;
        }
      }
      if (schema.categoryShape.itemRequired && Array.isArray(catData.items)) {
        for (let i = 0; i < Math.min(catData.items.length, 3); i++) {
          for (const field of schema.categoryShape.itemRequired) {
            if (!(field in catData.items[i])) {
              console.warn(`  ⚠️  ${filename}: ${cat}.items[${i}] missing "${field}"`);
              warnings++;
            }
          }
        }
      }
    }
  }

  console.log(`  ✅ ${filename}`);
  passed++;
}

console.log('🔍 ObjectStore Schema Validator\n');

// Validate known schemas
for (const [filename, schema] of Object.entries(SCHEMAS)) {
  validate(filename, schema);
}

// Check all JSON files exist and are valid
const allFiles = readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
for (const file of allFiles) {
  if (SCHEMAS[file]) continue;
  try {
    JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8'));
    console.log(`  ✅ ${file} (no schema, valid JSON)`);
    passed++;
  } catch {
    console.error(`  ❌ ${file}: Invalid JSON`);
    failed++;
  }
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${warnings} warnings`);
if (failed > 0) process.exit(1);
