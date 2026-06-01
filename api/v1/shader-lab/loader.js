/**
 * Grudge Shader.lab loader — editor-friendly ES module.
 *
 * Drop this into any Grudge editor (Three.js / grudge-game-engine / the
 * GrudgeBuilder runtime) and it resolves shader + texture URLs, fetches
 * and caches GLSL, and builds a Three.js ShaderMaterial in one call.
 *
 * Served from:
 *   https://objectstore.grudge-studio.com/api/v1/shader-lab/loader.js
 *
 * Usage (dynamic import from an editor):
 *   const { ShaderLab } = await import(
 *     'https://objectstore.grudge-studio.com/api/v1/shader-lab/loader.js'
 *   );
 *   const lab = new ShaderLab(THREE);
 *   await lab.ready();
 *   const mat = await lab.createMaterial('advanced/bubble');
 *   mesh.material = mat;
 *   renderer.setAnimationLoop(() => { lab.tick(performance.now() / 1000); renderer.render(scene, camera); });
 *
 * Or static import in a bundled editor:
 *   import { ShaderLab } from '<path-to-local-copy>/loader.js';
 *
 * No bundler required. No dependencies besides Three.js, which is
 * injected by the caller so the editor can pin its own version.
 */

const MANIFEST_URL = 'https://objectstore.grudge-studio.com/api/v1/shader-lab/manifest.json';
const GLSL_BASE    = 'https://objectstore.grudge-studio.com/api/v1/shader-lab';
const TEX_BASE     = 'https://assets.grudge-studio.com/shader-lab/textures';

const CUBEMAP_FACES = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];

export class ShaderLab {
  /**
   * @param {typeof import('three')} THREE   — the Three.js module the editor is using
   * @param {object} [opts]
   * @param {string} [opts.manifestUrl]
   * @param {string} [opts.glslBase]
   * @param {string} [opts.textureBase]
   * @param {Record<string, any>} [opts.extraUniforms] — merged into every material's uniforms
   */
  constructor(THREE, opts = {}) {
    if (!THREE) throw new Error('ShaderLab: pass the Three.js module as the first argument.');
    this.THREE = THREE;
    this.manifestUrl = opts.manifestUrl || MANIFEST_URL;
    this.glslBase    = opts.glslBase    || GLSL_BASE;
    this.textureBase = opts.textureBase || TEX_BASE;
    this.extraUniforms = opts.extraUniforms || {};

    /** @type {Promise<any>|null} */ this._manifest = null;
    /** @type {Map<string, Promise<string>>} */ this._glslCache = new Map();
    /** @type {Promise<string>|null} */ this._vertexCache = null;
    /** @type {Map<string, THREE.Texture>} */ this._texCache = new Map();
    /** @type {Map<string, THREE.CubeTexture>} */ this._cubeCache = new Map();
    /** @type {THREE.Material[]} */ this._materials = [];
  }

  /** Preload and cache the manifest. Returns the parsed object. */
  ready() {
    if (!this._manifest) this._manifest = fetch(this.manifestUrl).then(r => r.json());
    return this._manifest;
  }

  /** All shader entries across every category. */
  async list() {
    const m = await this.ready();
    return m.shaders;
  }

  /** Filter shader entries by category (basic | advanced | function | hdr | test | texture | glsl). */
  async listByCategory(cat) {
    const m = await this.ready();
    return m.shaders.filter(s => s.category === cat);
  }

  /** Fetch a shader's raw GLSL source by "category/name" (e.g. "advanced/bubble"). */
  fetchGLSL(ref) {
    if (!this._glslCache.has(ref)) {
      const url = `${this.glslBase}/${ref}.glsl`;
      this._glslCache.set(ref, fetch(url).then(r => {
        if (!r.ok) throw new Error(`ShaderLab: ${url} returned ${r.status}`);
        return r.text();
      }));
    }
    return this._glslCache.get(ref);
  }

  /** The shared vertex shader used by every Shader.lab fragment. */
  fetchVertexShader() {
    if (!this._vertexCache) this._vertexCache = this.fetchGLSL('basic/basic_vs');
    return this._vertexCache;
  }

  /** Absolute URL for a flat texture name, e.g. 'noise' → '.../noise.png'. */
  textureUrl(name) {
    return `${this.textureBase}/${name}.png`;
  }

  /** Absolute URLs for the six cubemap faces under textures/cube/<name>/. */
  cubemapUrls(name) {
    const bare = name.replace(/^cube_/, '');
    return CUBEMAP_FACES.map(face => `${this.textureBase}/cube/${bare}/${face}.png`);
  }

  /** Load + cache a 2D texture with repeat-wrapping (sensible default for noise/patterns). */
  loadTexture(name) {
    if (this._texCache.has(name)) return this._texCache.get(name);
    const tex = new this.THREE.TextureLoader().load(this.textureUrl(name));
    tex.wrapS = tex.wrapT = this.THREE.RepeatWrapping;
    this._texCache.set(name, tex);
    return tex;
  }

  /** Load + cache a cube texture (accepts either 'grey1' or 'cube_grey1'). */
  loadCubemap(name) {
    const bare = name.replace(/^cube_/, '');
    if (this._cubeCache.has(bare)) return this._cubeCache.get(bare);
    const cube = new this.THREE.CubeTextureLoader().load(this.cubemapUrls(bare));
    this._cubeCache.set(bare, cube);
    return cube;
  }

  /**
   * One-call ShaderMaterial builder.
   *
   * @param {string} ref — "category/name", e.g. "advanced/bubble"
   * @param {object} [opts]
   * @param {Record<string, THREE.Texture|THREE.CubeTexture>} [opts.overrideChannels]
   *        — pass pre-loaded textures keyed by channel name to skip auto-loading.
   * @param {Record<string, any>} [opts.extraUniforms] — merged after default uniforms.
   * @param {THREE.ShaderMaterialParameters} [opts.materialParams] — `side`, `transparent`, etc.
   * @returns {Promise<THREE.ShaderMaterial>}
   */
  async createMaterial(ref, opts = {}) {
    const manifest = await this.ready();
    const entry = manifest.shaders.find(s => `${s.category}/${s.name}` === ref);
    if (!entry) throw new Error(`ShaderLab: shader not found: ${ref}`);

    const [fragmentShader, vertexShader] = await Promise.all([
      this.fetchGLSL(ref),
      this.fetchVertexShader(),
    ]);

    const uniforms = {
      iTime:       { value: 0 },
      iResolution: { value: new this.THREE.Vector2(1, 1) },
      iMouse:      { value: new this.THREE.Vector4(0, 0, 0, 0) },
      ...this.extraUniforms,
      ...(opts.extraUniforms || {}),
    };

    // Bind textures the shader asked for, honoring any overrides.
    for (const c of entry.channels) {
      const key = `iChannel${c.slot}`;
      const override = opts.overrideChannels?.[c.name];
      if (override) { uniforms[key] = { value: override }; continue; }
      if (c.kind === 'cubemap') uniforms[key] = { value: this.loadCubemap(c.name) };
      else if (c.kind === 'texture') uniforms[key] = { value: this.loadTexture(c.name) };
      // buffer bindings are multi-pass — caller must supply via overrideChannels.
    }

    const material = new this.THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      ...(opts.materialParams || {}),
    });
    material.userData.shaderLabEntry = entry;
    this._materials.push(material);
    return material;
  }

  /** Tick all materials' iTime uniform from an external clock. */
  tick(timeSeconds) {
    for (const m of this._materials) {
      if (m.uniforms.iTime) m.uniforms.iTime.value = timeSeconds;
    }
  }

  /** Update iResolution on every material (call on canvas resize). */
  setResolution(width, height) {
    for (const m of this._materials) {
      if (m.uniforms.iResolution) m.uniforms.iResolution.value.set(width, height);
    }
  }

  /** Dispose all cached textures and materials. */
  dispose() {
    for (const m of this._materials) m.dispose();
    for (const t of this._texCache.values()) t.dispose();
    for (const c of this._cubeCache.values()) c.dispose();
    this._materials.length = 0;
    this._texCache.clear();
    this._cubeCache.clear();
    this._glslCache.clear();
    this._vertexCache = null;
    this._manifest = null;
  }
}

export default ShaderLab;
