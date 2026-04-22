# Shader.lab integration in ObjectStore
This ObjectStore package hosts the [lo-th/Shader.lab](https://github.com/lo-th/Shader.lab) GLSL library (243 shaders + manifest + editor loader) so every Grudge editor can consume shaders and textures from a single canonical source. Texture binaries are served from R2 (too large for GitHub Pages); shaders and the manifest are served from this repo via `gh-pages`.
## Served URLs
- Manifest: `https://molochdagod.github.io/ObjectStore/api/v1/shader-lab/manifest.json`
- Editor loader: `https://molochdagod.github.io/ObjectStore/api/v1/shader-lab/loader.js`
- GLSL: `https://molochdagod.github.io/ObjectStore/api/v1/shader-lab/<category>/<name>.glsl`
  Categories: `basic`, `advanced`, `function`, `hdr`, `test`, `texture`, `glsl`.
- Shared vertex shader: `https://molochdagod.github.io/ObjectStore/api/v1/shader-lab/basic/basic_vs.glsl`
- Flat textures: `https://assets.grudge-studio.com/shader-lab/textures/<name>.png`
- Cubemap faces: `https://assets.grudge-studio.com/shader-lab/textures/cube/<cube>/<px|nx|py|ny|pz|nz>.png`
## What lives where
- `api/v1/shader-lab/` — 243 `.glsl` files + `manifest.json` + `loader.js` + `README.txt` (upstream `about_method.txt`). Git-tracked, deploys via `npm run deploy:pages`.
- `scripts/shader-lab-manifest.mjs` — regenerates `manifest.json` from the GLSL headers.
- `scripts/shader-lab-sync-textures.mjs` — uploads textures to R2 via `wrangler`.
- `docs/SHADER-LAB.md` — this file.
## Editor integration
### Dynamic import (any ES-module-capable editor)
```js
const { ShaderLab } = await import(
  'https://molochdagod.github.io/ObjectStore/api/v1/shader-lab/loader.js'
);
const lab = new ShaderLab(THREE);
await lab.ready();
const material = await lab.createMaterial('texture/water');
mesh.material = material;
renderer.setAnimationLoop(() => {
  lab.tick(performance.now() / 1000);
  renderer.render(scene, camera);
});
```
`ShaderLab` auto-resolves each shader's channel-define block (`// 0_# noise #_0`), loads the matching R2 texture/cubemap, and wires it to `iChannel0..3`. Multi-pass shaders whose channels bind `buffer_*` names must be completed by the caller via `overrideChannels`.
### Bundled editor
Copy `api/v1/shader-lab/loader.js` into the editor's `src/lib/`, or import it via the package's URL — same API either way.
### Three.js version
`ShaderLab` is injected with the editor's Three.js module, so editors can pin any version. Known-good: Three.js r150+.
## Regenerating the manifest
Run after adding, removing, or editing any GLSL file:
```bash
npm run shader-lab:manifest
```
Writes `api/v1/shader-lab/manifest.json` with per-shader `channels`, `author`, `shadertoyUrl`, `license`, `byteSize` plus top-level `channelVocabulary` (sorted by frequency).
## Publishing GLSL + manifest
```bash
npm run deploy:pages
```
Pushes the repo to `gh-pages`. Verify:
```bash
curl -I https://molochdagod.github.io/ObjectStore/api/v1/shader-lab/manifest.json
curl -I https://molochdagod.github.io/ObjectStore/api/v1/shader-lab/loader.js
```
## Uploading textures to R2
Textures are NOT committed to the ObjectStore repo (36 MB PNGs bloat git history and slow gh-pages). Instead, `scripts/shader-lab-sync-textures.mjs` streams them to R2.
Prereqs:
- `wrangler` authenticated against the Cloudflare account that owns the `grudge-assets` bucket.
- A local clone of `lo-th/Shader.lab` at `../Shader.lab` relative to this repo (or pass `--src=<path>`).
Dry run first:
```bash
npm run shader-lab:sync-textures -- --dry-run
```
Live upload:
```bash
npm run shader-lab:sync-textures
```
Verify:
```bash
curl -I https://assets.grudge-studio.com/shader-lab/textures/noise.png
curl -I https://assets.grudge-studio.com/shader-lab/textures/cube/grey1/px.png
```
## Re-running after upstream updates
If lo-th publishes new shaders, pull the upstream clone, then:
```bash
cd ../Shader.lab && git pull
cd ../ObjectStore
# Re-copy any new/changed categories
cp ../Shader.lab/glsl_basic/*.glsl    api/v1/shader-lab/basic/
cp ../Shader.lab/glsl_advanced/*.glsl api/v1/shader-lab/advanced/
# ... (see scripts/shader-lab-import.sh if you want this scripted)
npm run shader-lab:manifest
npm run deploy:pages
npm run shader-lab:sync-textures   # only if textures changed
```
## Licensing reminder
GLSL files preserve their per-shader headers (author, shadertoy URL, license). 155 of 243 declare a shadertoy source; 27 declare an explicit license (most commonly Creative Commons Non-Commercial). Do NOT strip comments when patching. External commercial reuse requires re-checking each author individually — see the skill `grudge-shader-lab` for the full attribution list.
## Related
- Skill: `grudge-shader-lab` at `C:\Users\nugye\.agents\skills\grudge-shader-lab\SKILL.md` — the developer/AI guide for using this library.
- Upstream: `https://github.com/lo-th/Shader.lab`.
- Grudge game engine plan: `GrudgeBuilder/docs/audit-report.md` §11.
