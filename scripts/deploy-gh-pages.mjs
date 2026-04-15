#!/usr/bin/env node
/**
 * deploy-gh-pages.mjs — Push servable content to gh-pages branch
 *
 * Bypasses GitHub Actions entirely — pushes directly to the gh-pages branch
 * which GitHub Pages serves from.
 *
 * Excludes: node_modules, scripts, tools, workers, .wrangler, .git,
 *           _converted, _optimized (pipeline intermediates),
 *           package-lock.json, wrangler.toml, .env
 *
 * Usage:
 *   node scripts/deploy-gh-pages.mjs
 *   npm run deploy:pages
 */

import { publish } from 'gh-pages';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

console.log('Deploying ObjectStore to gh-pages branch...');
console.log(`Source: ${ROOT}`);

publish(ROOT, {
  branch: 'gh-pages',
  dotfiles: true,  // include .nojekyll
  src: [
    '**/*',
    '.nojekyll',
    '!node_modules/**',
    '!.git/**',
    '!.github/**',
    '!.wrangler/**',
    '!scripts/**',
    '!tools/**',
    '!workers/**',
    '!models/_converted/**',
    '!models/_optimized/**',
    '!package-lock.json',
    '!wrangler.toml',
    '!.env',
    '!.env.local',
    '!*.log',
    '!tsconfig.json',
  ],
  message: 'Deploy to GitHub Pages [skip ci]',
  user: {
    name: 'Oz',
    email: 'oz-agent@warp.dev',
  },
}, (err) => {
  if (err) {
    console.error('Deploy failed:', err);
    process.exit(1);
  }
  console.log('Deployed to gh-pages branch successfully.');
});
