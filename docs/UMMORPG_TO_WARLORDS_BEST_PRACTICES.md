# uMMORPG → Warlords / Forge Best Practices

**Extracted:** 2026-08-02T03:40:15.014Z  
**Unity source (read-only vault):** `C:/Users/nugye/Desktop/FRESH GRUDGE/Assets/uMMORPG`  
**Web destinations:** forge.grudge-studio.com, Warlords fleet games, ObjectStore  

Unity is a **quarry**, not the ship target. Do not block web work on Editor compile/Safe Mode.

---

## 1. Architecture map (what to port)

| uMMORPG (Unity) | Web / Warlords / Forge equivalent |
|-----------------|-----------------------------------|
| `NetworkManagerMMO` + Mirror | Railway game API + optional Carrier/WS rooms |
| `Entity` + `Player` / `Monster` | Character entity + NPC/unit runtime |
| `Combat` (damage, crit, block, popups) | CombatController + floating combat text |
| `Skills` + `Skill` struct + `ScriptableSkill` | ObjectStore skill JSON + runtime skill runner |
| `skillTemplates[0]` = default attack | LMB / slot0 basic attack |
| SyncList skills + cooldownEnd timestamps | Client skill state + server authority CD |
| `Inventory` / `Equipment` | Account bag (Railway) + equip slots |
| Prefabs Entities / Structures | `warlords-entity-prefabs.json` + GLB CDN |
| Resources ScriptableObjects | ObjectStore `api/v1/*.json` + D1 index |
| Party / Guild / Instance | Fleet party APIs + instance rooms (later) |
| NavMeshSurface on instances | Navmesh / pathfinding on island mesh (web) |

---

## 2. Skill system best practices (from uMMORPG source)

### Static vs dynamic (bandwidth + DB)
- **Static** skill defs live in ScriptableObjects (`ScriptableSkill`): cast time, CD, range, mana, weapon category, levels.
- **Dynamic** runtime is a small `Skill` **struct**: `hash`, `level`, `castTimeEnd`, `cooldownEnd`.
- Hash references the template — change balance in data without rewriting saves.
- **Port:** ObjectStore skill id + runtime state `{ id, level, cooldownEnd }` — not full skill blobs per tick.

### Cooldowns
- Set `cooldownEnd = NetworkTime.time + cooldown` on cast — **no** per-skill elapsed counters every frame.
- **Port:** `performance.now()/1000` or server time + same pattern.

### Templates on entity
- `Skills.skillTemplates` = available skills; index **0** is default attack.
- Learned skills in SyncList; level 0 = not learned.
- **Port:** weapon pack defines slots 1–5; slot 0 / LMB = basic attack from weapon category.

### Casting pipeline
1. CheckSelf (mana, CD, weapon category, movement rules)
2. Start cast → sync `currentSkill` (drives animator)
3. Cast finished → spawn effect at `effectMount` (hand bone)
4. Apply damage/heal/buff server-side
5. Events: `onSkillCastStarted` / `onSkillCastFinished`

**Port to web:** CombatController requestSkill(slot) → anim one-shot → VFX mount → hit resolve.

### Combat
- `ICombatBonus` components sum damage/defense/crit/block (no Linq.Sum — GC).
- Damage types: Normal / Block / Crit.
- Invincible flag for GM/NPC.
- **Port:** same bonus interfaces on equipment + buffs; avoid heavy alloc in hot path.

### Partial classes / addons
- Core types are `partial` so Addons extend without forking core files.
- **Port:** keep core combat/skill modules thin; Warlords-specific hooks in separate modules.

---

## 3. Prefab / content inventory (this extract)

- **Prefabs total:** 1322
- **Top folders:** Entities (589), Particles (460), Environment (47), UI (30), Structures (18), Structure Crusade Preview (16), Structure Preview (16), Structure Crusade (15), Structure Fabled (15), Structure Legion (15), ItemModels (14), Structure Fabled Preview (14)
- **Resource assets:** 2303 (skills-ish names: 675)
- **Model FBX under Models/:** 11
- **Addons:** 122 folders, 1105 scripts
- **Core scripts copied:** 35 (missing: Targetable.cs, Skillbar.cs)

Ship priority for Forge/Warlords:
1. Entities/Pets/Mercs, Siege, Mounts, Vehicles  
2. Structure Crusade / Legion / Fabled + Structures  
3. Scriptable skill/item names → ObjectStore skill/weapon JSON  
4. Combat/Skills/Player patterns → web controllers  

---

## 4. Folder locations (on disk)

```
C:/Users/nugye/Desktop/FRESH GRUDGE/Assets/uMMORPG/
  Scripts/           core + Addons + Scriptable*
  Prefabs/           Entities, Structures, Particles, UI
  Resources/         ScriptableObject instances (skills, items, quests)
  Models/            FBX sources
  Plugins/Mirror     netcode (do not port Mirror; learn authority patterns only)
```

Extract output:
```
ObjectStore/assets/ummorpg-extract/
  scripts/core/**     C# reference
  prefab-inventory.json
  resources-inventory.json
  addons-inventory.json
api/v1/ummorpg-extract-index.json
docs/UMMORPG_TO_WARLORDS_BEST_PRACTICES.md
```

---

## 5. Hard rules for agents

1. **Unity path SSOT for extract:** `C:\\Users\\nugye\\Desktop\\FRESH GRUDGE` only (not grudgeproduction\\grudgenew\\...).
2. **Never block Forge/Warlords on Unity Safe Mode** — extract from disk; Editor is optional.
3. **Weapon skills "done"** only if Warlords/Danger URL: key fires + anim + CD (not only JSON/docs).
4. **Do not invent Meshy/capsule** content when uMMORPG/Toon/CDN sources exist.
5. **One vertical slice** per request (e.g. one skill or one building in Forge).

---

## 6. Re-run extract

```bash
cd F:/GitHub/ObjectStore
node scripts/extract-ummorpg-for-warlords.mjs
```

Optional: publish index  
`node scripts/publish-static-json.mjs ummorpg-extract-index`
