# PR #50 provenance

Base: `main` @605d70aa. The source is the CLI production deploy `dpl_F8pyFmVXYnsCYPoEwGSnhMr9eJGv` of the unmerged `feat/blox-edge-proxy` @1e78a330. That branch was never pushed to GitHub, so nothing here comes from its git history.

**Source categories**
- **Deploy-hash-verified**: the SHA-1 equals the file uid in the Vercel dpl_F8pyFmVX listing.
- **Carried from dpl_EcwZH83e reconstruction**: produced on Oct 6 and Oct 13 from the earlier CLI deploy of the same branch.
- **Live-site-only**: read from the F8 aliases only.
- **Authored in this PR**: written or regenerated here.

The Vercel `list_deployment_files` output via MCP is truncated after `scripts/split-spritesheet…` and in several api/v1 subranges. About 25 files therefore have no checkable uid.

## Changed files

| Status | File | Source |
|---|---|---|
| M | `.gitignore` | Authored in this PR: adds spawn/ (operator script output). |
| M | `WEAPON_SKILLS.html` | Live-site-only: fetched from the F8 production aliases. It is not in the F8 file listing, so its uid could not be checked. Its version/date is newer than main. |
| M | `api/v1/account-game-uuid-contract.json` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). It is in the F8 listing and the uid matched before any edits. 3-way merge with main; conflicting hunks resolved to main. |
| M | `api/v1/best-practices.json` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). It is in the F8 listing and the uid matched before any edits. Edited in this PR: removed links to split-out game-ready-systems.json. |
| M | `api/v1/catalog.json` | Regenerated in this PR by scripts/sync-docs-canonical.mjs (not the F8 copy). |
| M | `api/v1/grudge6-characters.json` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). NOT in the dpl_F8pyFmVX listing, which the Vercel MCP truncates. The content equals what the F8 aliases (info/objectstore.grudge-studio.com) serve today. That earlier reconstruction got it from the dpl_EcwZH83e source or live site, not from git. Clean 3-way merge with main. |
| M | `api/v1/grudge6-editor-ssot.json` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). NOT in the dpl_F8pyFmVX listing, which the Vercel MCP truncates. The content equals what the F8 aliases (info/objectstore.grudge-studio.com) serve today. That earlier reconstruction got it from the dpl_EcwZH83e source or live site, not from git. |
| M | `api/v1/grudge6-warlords-play-contract.json` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). NOT in the dpl_F8pyFmVX listing, which the Vercel MCP truncates. The content equals what the F8 aliases (info/objectstore.grudge-studio.com) serve today. That earlier reconstruction got it from the dpl_EcwZH83e source or live site, not from git. |
| M | `api/v1/master-weaponSkills.json` | Live-site-only: fetched from the F8 production aliases. It is not in the F8 file listing, so its uid could not be checked. Its version/date is newer than main. |
| M | `api/v1/prefab-scheme.json` | Live-site-only: fetched from the F8 production aliases. It is not in the F8 file listing, so its uid could not be checked. Its version/date is newer than main. |
| A | `api/v1/spawn-grudge-identity-contract.json` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). NOT in the dpl_F8pyFmVX listing, which the Vercel MCP truncates. The content equals what the F8 aliases (info/objectstore.grudge-studio.com) serve today. That earlier reconstruction got it from the dpl_EcwZH83e source or live site, not from git. |
| A | `api/v1/spawn-grudge-share-matrix.json` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). NOT in the dpl_F8pyFmVX listing, which the Vercel MCP truncates. The content equals what the F8 aliases (info/objectstore.grudge-studio.com) serve today. That earlier reconstruction got it from the dpl_EcwZH83e source or live site, not from git. Edited in this PR: host is now https://id.grudge-studio.com. |
| A | `api/v1/spawn-wallet-verify-send-contract.json` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). NOT in the dpl_F8pyFmVX listing, which the Vercel MCP truncates. The content equals what the F8 aliases (info/objectstore.grudge-studio.com) serve today. That earlier reconstruction got it from the dpl_EcwZH83e source or live site, not from git. Edited in this PR: host is now https://id.grudge-studio.com, not *.up.railway.app. |
| M | `api/v1/studio.json` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). It is in the F8 listing and the uid matched before any edits. Edited in this PR: removed links to split-out spell-book.json and game-ready-systems.json. |
| M | `api/v1/warlords-entity-prefabs.json` | Deploy-hash-verified: the SHA-1 matches the dpl_F8pyFmVX file uid (CRLF-normalised). 3-way merge with main; conflicting hunks resolved to main. |
| M | `docs/CANONICAL_CODEX.md` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). NOT in the dpl_F8pyFmVX listing, which the Vercel MCP truncates. The content equals what the F8 aliases (info/objectstore.grudge-studio.com) serve today. That earlier reconstruction got it from the dpl_EcwZH83e source or live site, not from git. Clean 3-way merge with main. |
| M | `docs/GRUDGE6_PLAY_PATH_PURGE.md` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). NOT in the dpl_F8pyFmVX listing, which the Vercel MCP truncates. The content equals what the F8 aliases (info/objectstore.grudge-studio.com) serve today. That earlier reconstruction got it from the dpl_EcwZH83e source or live site, not from git. |
| A | `docs/GRUDGE6_RACES_BEST_PRACTICES.md` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). NOT in the dpl_F8pyFmVX listing, which the Vercel MCP truncates. The content equals what the F8 aliases (info/objectstore.grudge-studio.com) serve today. That earlier reconstruction got it from the dpl_EcwZH83e source or live site, not from git. |
| A | `docs/SPAWN_GRUDGE_SHARE_PHASE0.md` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). NOT in the dpl_F8pyFmVX listing, which the Vercel MCP truncates. The content equals what the F8 aliases (info/objectstore.grudge-studio.com) serve today. That earlier reconstruction got it from the dpl_EcwZH83e source or live site, not from git. |
| A | `docs/SPAWN_GRUDGE_SHARE_PHASE1.md` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). NOT in the dpl_F8pyFmVX listing, which the Vercel MCP truncates. The content equals what the F8 aliases (info/objectstore.grudge-studio.com) serve today. That earlier reconstruction got it from the dpl_EcwZH83e source or live site, not from git. Edited in this PR: host is now https://id.grudge-studio.com. |
| A | `docs/SPAWN_WALLET_VERIFY_SEND.md` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). NOT in the dpl_F8pyFmVX listing, which the Vercel MCP truncates. The content equals what the F8 aliases (info/objectstore.grudge-studio.com) serve today. That earlier reconstruction got it from the dpl_EcwZH83e source or live site, not from git. Edited in this PR: host is now https://id.grudge-studio.com. |
| M | `docs/canonical-manifest.json` | Regenerated in this PR by scripts/sync-docs-canonical.mjs against the committed tree (master-item-prefabs v1.1.0, 5,425,153 bytes). |
| M | `docs/index.html` | Regenerated in this PR by scripts/sync-docs-canonical.mjs. |
| M | `grudge-guide.html` | Live-site-only: fetched from the F8 production aliases. It is not in the F8 file listing, so its uid could not be checked. Its version/date is newer than main. |
| M | `js/grudge6-editor.js` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). It is in the F8 listing and the uid matched before any edits. |
| M | `js/grudge6-foot-ik.js` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). It is in the F8 listing and the uid matched before any edits. |
| M | `js/main-panel-systems.js` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). It is in the F8 listing and the uid matched before any edits. |
| M | `js/weapon-skill-tree.js` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). It is in the F8 listing and the uid matched before any edits. Clean 3-way merge with main. |
| M | `main-panel.html` | Live-site-only: fetched from the F8 production aliases. It is not in the F8 file listing, so its uid could not be checked. Its version/date is newer than main. Clean 3-way merge with main. |
| M | `profession-trees.html` | Live-site-only: fetched from the F8 production aliases. It is not in the F8 file listing, so its uid could not be checked. Its version/date is newer than main. 3-way merge with main; conflicting hunks resolved to main. |
| M | `scripts/sync-docs-canonical.mjs` | Authored in this PR: kept main's OBJECTSTORE_URL (the F8 copy regressed it to info.*; the F8 copy is an older main revision) and added assertCatalogBases(). |
| A | `scripts/sync-spawn-grudge-account.mjs` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). NOT in the dpl_F8pyFmVX listing, which the Vercel MCP truncates. The content equals what the F8 aliases (info/objectstore.grudge-studio.com) serve today. That earlier reconstruction got it from the dpl_EcwZH83e source or live site, not from git. Edited in this PR: no host fallbacks; exits 2 if GRUDGE_ID_URL or GRUDGE_API_URL is unset. |
| A | `scripts/verify-spawn-account-wallet.mjs` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). NOT in the dpl_F8pyFmVX listing, which the Vercel MCP truncates. The content equals what the F8 aliases (info/objectstore.grudge-studio.com) serve today. That earlier reconstruction got it from the dpl_EcwZH83e source or live site, not from git. Edited in this PR: no host fallbacks; exits 2 if GRUDGE_ID_URL or GRUDGE_API_URL is unset. |
| M | `workers/src/index.js` | Carried from the dpl_EcwZH83e reconstruction (Oct 6). It is in the F8 listing and the uid matched before any edits. |

## Restored to main (Verdict C1)
- `api/v1/master-skillTrees.json` is byte-identical to main again. The branch copy replaced the 12 priest skills (p_smite, p_penance, p_atonement, p_flash_mend, p_pw_shield, p_barrier, p_evangelism, p_mass_dispel, p_pain_reflect, p_purify, p_rapture, p_spirit_shell). That copy was live-site-only, with no deploy uid. Every p_* id in classes.json now resolves.
- `3dfx-viewer.html`, `js/3dfx-lab.js`, `spell-vfx-library.html` and `docs/API-AND-UUID-GUIDE.md` are back at main. Their branch versions only wired the split-out effects.json.

## Split out for a follow-up PR (Verdict C4)
These were present in dpl_F8pyFmVX or the Ecw reconstruction and are removed from this PR. They are unrelated to the Spawn/Grudge recovery.

- `api/v1/duelyst-units.json`
- `api/v1/effects.json`
- `api/v1/game-ready-systems.json`
- `api/v1/island-scenery.json`
- `api/v1/spell-book.json`
- `docs/ASSETS_TO_GLTF.md`
- `scripts/_force-blender-mcp.py`
- `scripts/assets-to-gltf-pipeline.mjs`
- `scripts/assign-weapon-skill-icons.mjs`
- `scripts/audit-agent-assets.mjs`
- `scripts/bake-all-weapon-anim-packs.mjs`
- `scripts/bake-grudge6-from-toon-originals.mjs`
- `scripts/bake-super-terrain-surfaces.mjs`
- `scripts/batch-t1-weapon-prefabs.mjs`
- `scripts/blender-mcp-force-connect.py`
- `scripts/blender-mcp-keepalive.py`
- `scripts/blender-mcp-start-server.py`
- `scripts/build-class-graphs.mjs`
- `scripts/build-fleet-effects-api.mjs`
- `scripts/build-game-ready-scene-catalog.mjs`
- `scripts/build-prod-gltf-packages.mjs`
- `scripts/build-ummorpg-forge-catalog.mjs`
- `scripts/extract-ummorpg-for-warlords.mjs`
- `scripts/resolve-and-deploy-building-meshes.mjs`
- `scripts/resolve-remaining-mecha.mjs`
- `api/v1/master-skillTrees.json` (branch priest kit v3.2.1, needs owner OK)
- `3dfx-viewer.html`, `js/3dfx-lab.js`, `spell-vfx-library.html`, `docs/API-AND-UUID-GUIDE.md` (effects.json wiring)

## Not committed / needs local push
- `api/v1/master-item-prefabs.json` v1.1.1 (5,711,151 bytes): too large for the GitHub API. The branch has v1.1.0 (5,425,153 bytes) and the manifest matches that. Push v1.1.1 later from a local checkout of feat/blox-edge-proxy and regenerate.
- `package.json`: the F8 copy differs from main but could not be retrieved. main is kept.
- Any F8 file in the truncated listing range that shares no path with main or the reconstruction.

## Excluded by rule
`.env`, `.vercel/`, `.wrangler/` (root and workers/*), `.pages-deploy/` (build output). F8 copies that equal an older main revision are excluded too, so main's later fixes are not reverted.
