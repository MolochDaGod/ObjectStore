// Vite config for the Grudge Three.js player-and-grass playground.
// - Serves src/index.html at /
// - Serves dist/assets/** (the race FBX + TGAs + anim library) at /assets/**
// - Serves dist/api/** (race-models.json manifest) at /api/**
// - Uses three directly from node_modules (no importmap, no CDN roundtrip)

import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

const ROOT = path.resolve(__dirname);
const DIST = path.join(ROOT, 'dist');

// Mime overrides for assets the default resolver gets wrong.
const MIME = {
  '.fbx':  'application/octet-stream',
  '.glb':  'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin':  'application/octet-stream',
  '.tga':  'application/octet-stream',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ktx2': 'application/octet-stream',
  '.json': 'application/json',
};

function serveDistAssets() {
  return {
    name: 'grudge-dist-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        // /assets/** and /api/** resolve to dist/**
        if (req.url.startsWith('/assets/') || req.url.startsWith('/api/')) {
          const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\//, '');
          const filePath = path.join(DIST, rel);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.setHeader('Content-Type', MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=86400');
            fs.createReadStream(filePath).pipe(res);
            return;
          }
          res.statusCode = 404;
          res.end(`Asset not found: ${req.url}`);
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  root: 'src',
  resolve: {
    alias: {
      'three/addons/': path.resolve(__dirname, 'node_modules/three/examples/jsm/'),
    },
  },
  publicDir: false,
  plugins: [serveDistAssets()],
  server: {
    port: 5173,
    fs: { allow: ['.', '..'] },
    strictPort: false,
  },
  // IMPORTANT: we build into ./dist-build, NOT ./dist.
  // `dist/` is the hand-curated static-CDN deploy (index.html with esm.sh
  // importmap + script.js + assets/race-characters/ + api/v1/race-models.json).
  // A vite build that lands there would overwrite `dist/index.html` and
  // leave orphaned bundles alongside the legacy script.js — a classic
  // duplication/conflict trap. Keep the two deploys cleanly separated.
  build: {
    outDir: path.resolve(__dirname, 'dist-build'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: { three: ['three'] },
      },
    },
  },
  optimizeDeps: {
    include: [
      'three',
      'three/examples/jsm/loaders/FBXLoader.js',
      'three/examples/jsm/loaders/GLTFLoader.js',
      'three/examples/jsm/loaders/DRACOLoader.js',
      'three/examples/jsm/loaders/KTX2Loader.js',
      'three/examples/jsm/loaders/TGALoader.js',
    ],
  },
});
