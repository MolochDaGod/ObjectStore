# Off-hand tomes (book_set) + main-panel equip

**Source multipack:** `C:\Users\nugye\Documents\book_set.glb`  
**Split:** 4 tomes + cast companions with embedded textures  
**CDN:** `https://assets.grudge-studio.com/models/weapons/tomes/`  
**Runtime:** `js/grudge6-tome-offhand.js`  
**Catalog:** `api/v1/tome-weapons.json`  
**Viewport:** `js/main-panel-hero-viewport.js` (info.grudge-studio.com/main-panel.html)

## Split contents

| Id | Mesh (rest) | Cast pack (mesh + VFX + NLA) |
|----|-------------|------------------------------|
| arcanist | `tome_arcanist.glb` | `tome_arcanist_cast.glb` |
| blacksmith | `tome_blacksmith.glb` | `tome_blacksmith_cast.glb` |
| knight | `tome_knight.glb` | `tome_knight_cast.glb` |
| warlock | `tome_warlock.glb` | `tome_warlock_cast.glb` |

SI: longest axis **0.28 m** (hand prop). Textures packed in each GLB.

## Prefab behavior

1. **Rest** — parent left shoulder (`Bip001 L Clavicle` / upper arm). Offset behind body + slow hover.  
2. **Cast** — reparent / blend toward `L_hand_container` / `L_shield_container` (off-hand shield zone). Play spell clip from cast pack.  
3. **End cast** — return to shoulder hover.

Character cast anim stays **magic** pack (`grudge6-anim-packs` · tome → magic). Prop NLA is supplemental VFX.

## Main panel

- Paperdoll **Offhand** + item type `tome` / `offhand-tome` / name match → `createTomeOffhand`.  
- Hides kit L weapon groups as needed.  
- Demo cast loop every ~4.5s in viewport preview.

## Re-bake

```powershell
blender -b -P F:\GitHub\ObjectStore\_staging\book_set\export_tomes.py
blender -b -P F:\GitHub\ObjectStore\_staging\book_set\fix_si_tomes.py
# then wrangler r2 object put grudge-assets/models/weapons/tomes/...
```

## Off-hand weapons roadmap (same viewport)

| Kind | Attach | Status |
|------|--------|--------|
| Tome / grimoire | shoulder rest → L hand cast | **This pack** |
| Dagger / knife | `L_hand` kit dual | lab canOffhand |
| Mace / hammer | `L_hand` dual | lab canOffhand |
| 1H sword off | dual when catalog allows | wire next |
| Shield | `L_shield_container` | kit shield variants |
