#!/usr/bin/env node
/**
 * bake-icons-and-models.mjs
 * 
 * Reads all master-*.json API files, resolves every iconUrl using the same
 * logic as GRUDGE_Item_Database.html, writes the resolved URL back into iconUrl,
 * and adds modelUrl for weapon items that have matching 3D GLB prefabs.
 * 
 * Also generates api/v1/unified-registry.json — a single file with every item,
 * resolved icons, and model links for the Cloudflare Worker / game clients.
 * 
 * Usage: node scripts/bake-icons-and-models.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

const ROOT = join(import.meta.dirname, '..');
const API  = join(ROOT, 'api', 'v1');
const CDN  = 'https://molochdagod.github.io/ObjectStore';
const R2   = 'https://objectstore.grudge-studio.com';

// ─── Icon resolution (mirrors deployed HTML logic) ────────────────────────
function hashStr(s) { let h=0; for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;} return Math.abs(h); }

// Armor
const ARMOR_SLOT_ICON={Helm:{prefix:'Helm',count:72},Shoulder:{prefix:'Shoulder',count:71},Chest:{prefix:'Chest',count:83},Hands:{prefix:'Gloves',count:28},Feet:{prefix:'Boots',count:56},Ring:{prefix:'Ring',count:57},Necklace:{prefix:'necklace',count:36},Legs:{prefix:'Pants',count:42},Offhand:{prefix:'Bracer',count:7},Relic:{prefix:'Ring',count:57}};
const MAT_OFFSET={cloth:0,leather:0.33,metal:0.66,gem:0.5};
const SKIP_ICONS={Shoulder:[63]};
function armorIcon(item){const slot=ARMOR_SLOT_ICON[item.slotType];if(!slot)return`${CDN}/icons/armor/armor_${((item.tier||1)%30)+1}.png`;const ms=MAT_OFFSET[item.material]||0;const base=Math.floor(ms*slot.count);let num=(base+hashStr(item.baseName||item.name||'')%Math.ceil(slot.count/3))%slot.count+1;const skip=SKIP_ICONS[item.slotType];if(skip&&skip.includes(num))num++;return`${CDN}/icons/armor_full/${slot.prefix}_${String(num).padStart(2,'0')}.png`;}

// Weapons
const WEAPON_TYPE_ICON={swords:{prefix:'Sword',count:61},greatswords:{prefix:'Sword',count:61},axes1h:{prefix:'Axe',count:50},greataxes:{prefix:'Axe',count:50},daggers:{prefix:'Dagger',count:60},hammers1h:{prefix:'Hammer',count:50},hammers2h:{prefix:'Hammer',count:50},wands:{prefix:'staff',count:50,nopad:true},spears:{prefix:'Spear',count:40},bows:{prefix:'Bow',count:40},crossbows:{prefix:'Crossbow',count:10},guns:{prefix:'Crossbow',count:10},scythes:{prefix:'Scythe',count:7},shields:{prefix:'shield',count:51},tools:{prefix:'Hammer',count:50},'offhand-tome':{prefix:'Book',count:25,nopad:true}};
function staffIcon(item){const n=hashStr(item.baseName||item.name||'')%50+1;return`${CDN}/icons/pack/weapons/${n>=51?'Staff':'staff'}_${n}.png`;}
function weaponIcon(item){const raw=item.iconUrl||'';if(raw.includes('/icons/weapons/')&&!raw.match(/\/(staff|Sword|Axe|Dagger|Hammer|Spear|Bow|Crossbow|Book|Scythe|shield)_/i))return raw;const wt=(item.weaponType||item.subType||item.category||'').toLowerCase();if(wt.includes('stav')||wt.includes('staff'))return staffIcon(item);const slot=WEAPON_TYPE_ICON[wt];if(slot){const n=hashStr(item.baseName||item.name||'')%slot.count+1;return`${CDN}/icons/pack/weapons/${slot.prefix}_${slot.nopad?String(n):String(n).padStart(2,'0')}.png`;}return raw||`${CDN}/icons/pack/weapons/Sword_01.png`;}

// Food
const RED_FOOD=['food_steak_cooked','food_steak_rare','food_ham','food_meat_raw','food_steak_raw','food_crab','food_squid','food_fish_red'];
const GREEN_FOOD=['food_apple','food_banana','food_carrot','food_grapes','food_mango','food_mushroom','food_wheat','food_cheese'];
const BLUE_FOOD=['food_bread','food_croissant','food_fish_silver','food_beer'];
const FOOD_FALLBACK=['95_steak','85_roastedchicken','88_salmon','13_bacon','87_ramen','97_sushi','94_spaghetti','92_sandwich','81_pizza','99_taco','15_burger','54_hotdog','69_meatball','32_curry','36_dumplings','71_nacho','38_friedegg','73_omlet','67_macncheese','07_bread','09_baguette','65_loafbread','48_garlicbread','79_pancakes','101_waffle','34_donut','28_cookies','22_cheesecake','90_strawberrycake','63_lemonpie','05_apple_pie','75_pudding','57_icecream','26_chocolate','44_frenchfries','77_potatochips','83_popcorn','59_jelly','61_jam','50_giantgummybear','52_gingerbreadman'];
function foodIcon(item){const cat=(item.category||'').toLowerCase();const h=hashStr(item.baseName||item.name||'');if(cat==='redfoods')return`${CDN}/icons/consumables/${RED_FOOD[h%RED_FOOD.length]}.png`;if(cat==='greenfoods')return`${CDN}/icons/consumables/${GREEN_FOOD[h%GREEN_FOOD.length]}.png`;if(cat==='bluefoods')return`${CDN}/icons/consumables/${BLUE_FOOD[h%BLUE_FOOD.length]}.png`;return`${CDN}/icons/food/${FOOD_FALLBACK[h%FOOD_FALLBACK.length]}.png`;}

// Potions
function potionIcon(item){const name=(item.baseName||item.name||'').toLowerCase();if(name.includes('health'))return`${CDN}/icons/consumables/health_potion.png`;if(name.includes('mana'))return`${CDN}/icons/consumables/mana_potion.png`;if(name.includes('stamina'))return`${CDN}/icons/potions/P_Green05.png`;if(name.includes('antidote'))return`${CDN}/icons/potions/P_Yellow01.png`;if(name.includes('fire'))return`${CDN}/icons/potions/fire_potion.png`;if(name.includes('frost')||name.includes('ice'))return`${CDN}/icons/potions/P_Blue05.png`;if(name.includes('earth'))return`${CDN}/icons/potions/earth_potion.png`;if(name.includes('air')||name.includes('wind'))return`${CDN}/icons/potions/air_potion.png`;const n=hashStr(item.baseName||item.name||'')%48+1;return`${CDN}/icons/consumables/potion_${n}.png`;}

// Consumables + Materials
function consumableIcon(item){const n=hashStr(item.baseName||item.name||'')%48+1;return`${CDN}/icons/consumables/alchemy_${n}.png`;}
function materialIcon(item){const n=hashStr(item.baseName||item.name||'')%166+1;return`${CDN}/icons/pack/resources/Res_${String(n).padStart(2,'0')}.png`;}

// Enchants, Infusions, Relics, Artifacts
const ENCH_ICON={damage:'ability_arcane_bolt',defense:'ability_bark_skin',speed:'ability_arrow_storm',crit:'ability_arcane_focus',critChance:'ability_arcane_focus',critDamage:'ability_arcane_focus',fire:'ability_arcane_cataclysm',lightning:'ability_arcane_cataclysm',frost:'ability_avatar_form',health:'ability_avatar',mana:'ability_arcane_focus',elementResist:'ability_bark_skin'};
const INFU_ICON=Array.from({length:12},(_,i)=>`${CDN}/icons/items/alchemy/alchemy_${String(i+1).padStart(2,'0')}_framed.png`);
const RELIC_ICON=Array.from({length:12},(_,i)=>`${CDN}/icons/items/artifacts/artifacts_${String(i+1).padStart(2,'0')}_framed.png`);
const LOOT_ICON=Array.from({length:16},(_,i)=>`${CDN}/icons/loot/loot_${i+1}.png`);

function resolveIcon(item) {
  const t = item.type || '';
  if (t==='enchant') return`${CDN}/icons/abilities/${ENCH_ICON[item.effect?.stat]||'ability_arcane_bolt'}.png`;
  if (t==='infusion') return INFU_ICON[Math.min((item.tier||1)-1,11)];
  if (t==='relic') return RELIC_ICON[Math.min((item.tier||1)-1,11)];
  if (t==='artifact') return LOOT_ICON[Math.min((item.tier||1)-1,15)];
  if (t==='armor') return armorIcon(item);
  if (t==='weapon'||t==='tool'||t==='offhand-tome') return weaponIcon(item);
  if (t==='food') return foodIcon(item);
  if (t==='potion') return potionIcon(item);
  if (t==='consumable') return consumableIcon(item);
  if (t==='material') return materialIcon(item);
  const raw = item.iconUrl || '';
  if (raw && raw.includes('/icons/items/') && !raw.includes('_framed')) return raw.replace(/\.png$/,'_framed.png');
  return raw || null;
}

// ─── 3D model index ───────────────────────────────────────────────────────
// Scan models/weapons/ for GLB files and build a lookup by weapon category
function buildModelIndex() {
  const modelsDir = join(ROOT, 'models', 'weapons');
  const index = {}; // category -> [{ file, path, url }]
  if (!existsSync(modelsDir)) return index;
  for (const cat of readdirSync(modelsDir, { withFileTypes: true })) {
    if (!cat.isDirectory()) continue;
    const catDir = join(modelsDir, cat.name);
    const glbs = readdirSync(catDir).filter(f => f.endsWith('.glb'));
    index[cat.name] = glbs.map(f => ({
      file: f,
      path: `models/weapons/${cat.name}/${f}`,
      cdnUrl: `${CDN}/models/weapons/${cat.name}/${f}`,
      r2Url: `${R2}/v1/assets/models/weapons/${cat.name}/${f}`,
    }));
  }
  return index;
}

// Map item category/weaponType to model directory name
const CATEGORY_TO_MODEL = {
  swords:'sword',greatswords:'greatsword',axes1h:'axe',greataxes:'greataxe',
  daggers:'dagger',hammers1h:'hammer',hammers2h:'hammer',spears:'spear',
  bows:'bow',crossbows:'crossbow',guns:'gun',scythes:'scythe',shields:'shield',
  tools:'hammer',wands:'wand','offhand-tome':'tome',
  firestaves:'staff',froststaves:'staff',lightningstaves:'staff',
  naturestaves:'staff',holystaves:'staff',arcanestaves:'staff',
};

function assignModel(item, modelIndex) {
  const wt = (item.weaponType || item.subType || item.category || '').toLowerCase();
  const modelCat = CATEGORY_TO_MODEL[wt];
  if (!modelCat || !modelIndex[modelCat]?.length) return null;
  const models = modelIndex[modelCat];
  const idx = hashStr(item.baseName || item.name || '') % models.length;
  return models[idx];
}

// ─── Main ─────────────────────────────────────────────────────────────────
console.log('Building model index...');
const modelIndex = buildModelIndex();
const modelCounts = Object.entries(modelIndex).map(([k,v])=>`${k}:${v.length}`).join(', ');
console.log(`  Models: ${modelCounts}`);

const SOURCES = [
  { file: 'master-weapons.json', key: 'items', type: 'weapon' },
  { file: 'master-armor.json', key: 'items', type: 'armor' },
  { file: 'master-consumables.json', key: 'items', type: 'consumable' },
  { file: 'master-materials.json', key: 'materials', type: 'material' },
  { file: 'master-relics.json', key: 'relics', type: 'relic' },
  { file: 'master-enchants.json', key: 'enchants', type: 'enchant' },
  { file: 'master-infusions.json', key: 'infusions', type: 'infusion' },
  { file: 'master-artifacts.json', key: 'artifacts', type: 'artifact' },
];

let totalItems = 0, iconsBaked = 0, modelsLinked = 0;
const unifiedItems = [];

for (const src of SOURCES) {
  const filePath = join(API, src.file);
  if (!existsSync(filePath)) { console.log(`  SKIP ${src.file} (not found)`); continue; }
  
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  const items = data[src.key] || [];
  let baked = 0, linked = 0;
  
  for (const item of items) {
    // Ensure type is set for resolver
    if (!item.type) item.type = src.type;
    
    // Bake resolved iconUrl
    const resolved = resolveIcon(item);
    if (resolved && resolved !== item.iconUrl) {
      item.iconUrl = resolved;
      baked++;
    }
    
    // Link 3D model for weapons
    if (['weapon','tool','offhand-tome'].includes(item.type)) {
      const model = assignModel(item, modelIndex);
      if (model) {
        item.modelUrl = model.cdnUrl;
        item.modelPath = model.path;
        linked++;
      }
    }
    
    // Add to unified registry
    unifiedItems.push({
      uuid: item.uuid,
      name: item.name,
      baseName: item.baseName || item.name,
      type: item.type,
      category: item.category,
      tier: item.tier,
      tierLabel: item.tierLabel,
      tierColor: item.tierColor,
      iconUrl: item.iconUrl,
      modelUrl: item.modelUrl || null,
      slotType: item.slotType || null,
      material: item.material || null,
      element: item.element || null,
    });
  }
  
  // Write updated JSON back
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  totalItems += items.length;
  iconsBaked += baked;
  modelsLinked += linked;
  console.log(`  ${src.file.padEnd(28)} ${items.length} items, ${baked} icons baked, ${linked} models linked`);
}

// Write unified registry
const registry = {
  version: '3.1.0',
  generated: new Date().toISOString(),
  total: unifiedItems.length,
  cdnBase: CDN,
  r2Base: R2,
  items: unifiedItems,
};
const registryPath = join(API, 'unified-registry.json');
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
console.log(`\n  unified-registry.json: ${unifiedItems.length} items`);

console.log(`\n=== DONE ===`);
console.log(`  Total items: ${totalItems}`);
console.log(`  Icons baked: ${iconsBaked}`);
console.log(`  Models linked: ${modelsLinked}`);
console.log(`  Registry: ${registryPath}`);
