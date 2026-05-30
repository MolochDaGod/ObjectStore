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

// Food (keyword-matched)
function foodIcon(item){
  const n=(item.baseName||item.name||'').toLowerCase();
  const C=`${CDN}/icons/consumables`,F=`${CDN}/icons/food`;
  if((item.category||'')==='redFoods'){
    if(n.includes('steak')||n.includes('seared'))return`${C}/food_steak_cooked.png`;
    if(n.includes('roast')||n.includes('cuts'))return`${F}/85_roastedchicken.png`;
    if(n.includes('ribs')||n.includes('bbq'))return`${C}/food_steak_rare.png`;
    if(n.includes('bacon')||n.includes('sausage'))return`${C}/food_ham.png`;
    if(n.includes('burger'))return`${F}/15_burger.png`;
    if(n.includes('skewer')||n.includes('kebab'))return`${F}/54_hotdog.png`;
    if(n.includes('wings'))return`${C}/food_crab.png`;
    if(n.includes('curry'))return`${F}/32_curry.png`;
    if(n.includes('stew'))return`${F}/87_ramen.png`;
    if(n.includes('sashimi')||n.includes('fish'))return`${C}/food_fish_red.png`;
    if(n.includes('feast')||n.includes('platter'))return`${F}/95_steak.png`;
    if(n.includes('charred')||n.includes('burnt'))return`${C}/food_steak_raw.png`;
    return`${C}/food_meat_raw.png`;
  }
  if((item.category||'')==='greenFoods'){
    if(n.includes('salad')||n.includes('greens'))return`${C}/food_grapes.png`;
    if(n.includes('soup')||n.includes('stew'))return`${C}/food_mushroom.png`;
    if(n.includes('herb')||n.includes('tea'))return`${C}/herb_herb_leaf.png`;
    if(n.includes('mushroom'))return`${C}/food_mushroom.png`;
    if(n.includes('fruit')||n.includes('blossom'))return`${C}/food_apple.png`;
    if(n.includes('nectar'))return`${C}/food_mango.png`;
    if(n.includes('wrap')||n.includes('roll'))return`${C}/food_carrot.png`;
    if(n.includes('garden')||n.includes('medley'))return`${C}/food_carrot.png`;
    if(n.includes('feast')||n.includes('bowl'))return`${C}/food_banana.png`;
    return`${C}/food_wheat.png`;
  }
  if((item.category||'')==='blueFoods'){
    if(n.includes('bread')||n.includes('biscuit'))return`${C}/food_bread.png`;
    if(n.includes('cake')||n.includes('pastry')||n.includes('pie'))return`${C}/food_croissant.png`;
    if(n.includes('soup')||n.includes('stew')||n.includes('broth')||n.includes('chowder')||n.includes('bisque')||n.includes('gumbo'))return`${C}/food_fish_silver.png`;
    if(n.includes('brew')||n.includes('grog')||n.includes('nectar'))return`${C}/food_beer.png`;
    if(n.includes('fish'))return`${C}/food_fish_silver.png`;
    return`${C}/food_bread.png`;
  }
  return`${C}/food_cheese.png`;
}

// Potions (keyword-matched)
function potionIcon(item){
  const n=(item.baseName||item.name||'').toLowerCase();
  const C=`${CDN}/icons/consumables`,P=`${CDN}/icons/potions`;
  if(n.includes('health'))return`${C}/health_potion.png`;
  if(n.includes('mana'))return`${C}/mana_potion.png`;
  if(n.includes('stamina'))return`${P}/P_Green05.png`;
  if(n.includes('antidote')||n.includes('poison'))return`${P}/P_Yellow01.png`;
  if(n.includes('fire')||n.includes('incendiar'))return`${P}/fire_potion.png`;
  if(n.includes('frost')||n.includes('ice'))return`${P}/P_Blue05.png`;
  if(n.includes('lightning'))return`${P}/P_Yellow01.png`;
  if(n.includes('earth'))return`${P}/earth_potion.png`;
  if(n.includes('air')||n.includes('wind'))return`${P}/air_potion.png`;
  if(n.includes('speed')||n.includes('swift'))return`${P}/P_Green03.png`;
  if(n.includes('rage')||n.includes('berserker')||n.includes('strength')||n.includes('titan'))return`${P}/P_Red07.png`;
  if(n.includes('defense')||n.includes('ward'))return`${P}/P_Blue03.png`;
  if(n.includes('invisib'))return`${P}/P_White05.png`;
  if(n.includes('invulner'))return`${P}/P_Medicine06.png`;
  if(n.includes('elixir')||n.includes('ultimate')||n.includes('divine')||n.includes('immortal'))return`${P}/P_Red05.png`;
  if(n.includes('elemental'))return`${P}/P_Blue06.png`;
  if(n.includes('super')||n.includes('greater'))return`${P}/P_Red03.png`;
  if(n.includes('mega'))return`${P}/P_Red05.png`;
  return`${C}/potion_${hashStr(item.baseName||item.name||'')%48+1}.png`;
}

// Consumables (keyword-matched)
function consumableIcon(item){
  const n=(item.baseName||item.name||'').toLowerCase();
  const C=`${CDN}/icons/consumables`;
  if(n.includes('bandage')||n.includes('medkit'))return`${C}/alchemy_1.png`;
  if(n.includes('repair'))return`${C}/alchemy_5.png`;
  if(n.includes('grenade')||n.includes('bomb'))return`${C}/alchemy_30.png`;
  if(n.includes('smoke'))return`${C}/alchemy_25.png`;
  if(n.includes('flash'))return`${C}/alchemy_28.png`;
  if(n.includes('turret'))return`${C}/alchemy_40.png`;
  if(n.includes('lure')||n.includes('fish'))return`${C}/food_fish_silver.png`;
  if(n.includes('emp'))return`${C}/alchemy_35.png`;
  return`${C}/alchemy_${hashStr(item.baseName||item.name||'')%48+1}.png`;
}

// Materials (name-matched to exact icon files)
const MAT_FALLBACK={'hemp':'rag-thread','rough stone':'ore_t1','wild herb':'herb_herb_leaf','water flask':'food_beer','raw meat':'food_meat_raw','raw fish':'food_fish_red','moonweave thread':'celestial-thread','starweave thread':'arcane-thread','voidweave thread':'enchanted-thread','wyrm leather':'rugged-leather','infernal leather':'hardened-leather','titan leather':'thick-hide','divine leather':'rawhide'};
function materialIcon(item){
  const name=(item.name||'').toLowerCase();
  const fb=MAT_FALLBACK[name];
  if(fb){if(fb.startsWith('food_')||fb.startsWith('herb_'))return`${CDN}/icons/consumables/${fb}.png`;return`${CDN}/icons/materials/${fb}.png`;}
  return`${CDN}/icons/materials/${name.replace(/\s+/g,'-')}.png`;
}

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
