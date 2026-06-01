/**
 * Grudge 3DFX — Save a custom effect to R2 via the ObjectStore Worker.
 *
 * Requires an API key (X-API-Key header). See:
 *   https://objectstore.grudge-studio.com/AGENTS.md
 */
const R2_WORKER = 'https://objectstore.grudge-studio.com';

export async function save3DFXToR2(def, apiKey) {
  if (!def?.id) throw new Error('Effect must have an id');
  const res = await fetch(`${R2_WORKER}/v1/assets`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-Filename':   `${def.id}.3dfx.json`,
      'X-Category':   '3DFX',
      'X-Tags':       JSON.stringify(def.tags || []),
      'X-API-Key':    apiKey || ''
    },
    body: JSON.stringify(def, null, 2)
  });
  if (!res.ok) throw new Error(`R2 upload failed: ${res.status}`);
  return res.json();
}

// Example:
//   import { save3DFXToR2 } from './save-effect-to-r2.js';
//   await save3DFXToR2({ id: 'my_effect', name: 'My FX', colors: {...} }, GRUDGE_API_KEY);
