
# Puter Audit & Integration Guide
**Version 1.0** | Last Updated: February 2026

Complete guide for auditing Grudge Studio apps on Puter and integrating Puter services (file system, AI, key-value store) into the Grudge Studio ecosystem.

---

## Table of Contents

1. [Overview](#overview)
2. [Running the Audit](#running-the-audit)
3. [Puter Services Reference](#puter-services-reference)
4. [Integration Patterns](#integration-patterns)
5. [Remediation Checklist](#remediation-checklist)

---

## Overview

**Puter** (https://puter.com) provides cloud storage, AI inference, and key-value storage that Grudge Studio uses for:

| Service | Purpose |
|---------|---------|
| **Puter FS** | Store generated item icons, save files, and build artifacts |
| **Puter AI** | `txt2img` for procedural item icon generation |
| **Puter KV** | Cache ObjectStore API responses; store session metadata |
| **Puter Auth** | Link Puter accounts to Grudge UUIDs |

---

## Running the Audit

### Prerequisites

- Node.js ≥ 18
- Internet access (audits live endpoints)

### Commands

```bash
# Run audit (health check only)
npm run audit:puter

# Run audit and write a remediation report
npm run audit:puter -- --report

# Run audit with auto-remediation hints
npm run audit:puter -- --fix --report
```

Reports are written to `docs/reports/puter-remediation-plan-YYYY-MM-DD.md`.

### What Is Checked

| Check | Description |
|-------|-------------|
| **App health** | HTTP GET to each Grudge Studio app's health endpoints |
| **Puter services** | Reachability of Puter FS, AI, KV, and Auth endpoints |
| **API files** | Presence of all required `api/v1/*.json` files locally |

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | All checks passed |
| `1` | One or more checks failed |

---

## Puter Services Reference

### Puter File System

```javascript
import puter from 'https://js.puter.com/v2/';

// Write a generated icon to Puter cloud storage
async function saveItemIcon(itemId, imageBlob) {
  await puter.fs.write(`/grudge-studio/icons/${itemId}.png`, imageBlob);
  console.log(`Icon saved: /grudge-studio/icons/${itemId}.png`);
}

// Read back the icon
async function loadItemIcon(itemId) {
  const blob = await puter.fs.read(`/grudge-studio/icons/${itemId}.png`);
  return URL.createObjectURL(blob);
}

// List all stored icons
async function listIcons() {
  const entries = await puter.fs.readdir('/grudge-studio/icons/');
  return entries.map(e => e.name);
}
```

### Puter AI — Image Generation

```javascript
import puter from 'https://js.puter.com/v2/';

/**
 * Generate an item icon from a text prompt.
 * Falls back to an emoji placeholder if generation fails.
 */
async function generateItemIcon(item) {
  const prompt = buildPrompt(item);
  try {
    const imageBlob = await puter.ai.txt2img(prompt);
    // Persist to Puter FS
    await puter.fs.write(`/grudge-studio/icons/${item.id}.png`, imageBlob);
    return URL.createObjectURL(imageBlob);
  } catch (err) {
    console.warn(`[puter-ai] Generation failed for "${item.name}": ${err.message}`);
    return null; // caller uses emoji fallback
  }
}

function buildPrompt(item) {
  const tierLabel = ['', 'bronze', 'silver', 'blue', 'purple', 'red', 'orange', 'gold', 'legendary'][item.tier] ?? 'rare';
  return `${tierLabel} tier ${item.category} icon, ${item.name}, fantasy RPG pixel art, transparent background`;
}
```

### Puter Key-Value Store

```javascript
import puter from 'https://js.puter.com/v2/';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function cachedFetch(key, fetchFn) {
  const cached = await puter.kv.get(key);
  if (cached) {
    const { value, expiresAt } = JSON.parse(cached);
    if (Date.now() < expiresAt) return value;
  }
  const value = await fetchFn();
  await puter.kv.set(key, JSON.stringify({ value, expiresAt: Date.now() + CACHE_TTL_MS }));
  return value;
}

// Usage: cache ObjectStore weapons
const weapons = await cachedFetch('objectstore:weapons', () =>
  fetch('https://molochdagod.github.io/ObjectStore/api/v1/weapons.json').then(r => r.json())
);
```

### Puter Auth — Linking to GRUDGE UUIDs

```javascript
import puter from 'https://js.puter.com/v2/';
import { generateGrudgeUuid } from '../sdk/grudge-sdk.js';

async function linkPuterAccount() {
  // Sign in (opens Puter auth dialog)
  await puter.auth.signIn();
  const user = await puter.auth.getUser();

  // Generate a deterministic GRUDGE UUID for this Puter user
  const grudgeId = generateGrudgeUuid('hero', user.uuid);
  console.log(`Puter user ${user.username} linked to GRUDGE ID: ${grudgeId}`);
  return grudgeId;
}
```

---

## Integration Patterns

### PuterGrudge Backend

The `PuterGrudge` backend (`https://puter-monitor-ai.vercel.app`) exposes Puter AI as HTTP endpoints:

```javascript
// server/grudge-integration.js
import { initGrudgeStudio } from '@grudgstudio/core';

const api = await initGrudgeStudio({
  objectStoreUrl: process.env.OBJECTSTORE_URL,
  puterEnabled: true,
  puterApiKey: process.env.PUTER_API_KEY,
});

// Generate an item icon on demand
app.post('/api/generate-icon', async (req, res) => {
  const { itemName, tier, category } = req.body;
  const imageUrl = await api.generateImage(itemName, { tier, category });
  res.json({ imageUrl });
});

// Proxy ObjectStore with Puter KV caching
app.get('/api/items/:endpoint', async (req, res) => {
  const data = await api.getCached(req.params.endpoint);
  res.json(data);
});
```

### React / Warlord-Crafting-Suite

```typescript
// src/hooks/usePuterAI.ts
import { useState, useCallback } from 'react';

declare const puter: any; // injected via <script src="https://js.puter.com/v2/">

export function usePuterAI() {
  const [loading, setLoading] = useState(false);

  const generateIcon = useCallback(async (item: { name: string; tier: number; category: string }) => {
    setLoading(true);
    try {
      const blob = await puter.ai.txt2img(
        `${item.name}, tier ${item.tier} ${item.category}, fantasy RPG icon`
      );
      return URL.createObjectURL(blob);
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generateIcon, loading };
}
```

### Unity WebGL — Puter FS Bridge

```csharp
// Assets/Scripts/API/PuterBridge.cs
using UnityEngine;
using System.Runtime.InteropServices;

public class PuterBridge : MonoBehaviour
{
    [DllImport("__Internal")]
    private static extern void PuterFS_Write(string path, string dataBase64);

    [DllImport("__Internal")]
    private static extern void PuterFS_Read(string path, string callbackObject, string callbackMethod);

    public void SaveInventory(string characterId, string inventoryJson)
    {
        var path = $"/grudge-studio/saves/{characterId}/inventory.json";
        var encoded = System.Convert.ToBase64String(
            System.Text.Encoding.UTF8.GetBytes(inventoryJson));
        PuterFS_Write(path, encoded);
    }
}
```

---

## Remediation Checklist

Use this checklist after running `npm run audit:puter --report` to resolve any issues.

### App Connectivity Issues

- [ ] Verify the app is deployed at its expected URL.
- [ ] Check Vercel / GitHub Pages deployment logs for build failures.
- [ ] Confirm environment variables (`PUTER_API_KEY`, `OBJECTSTORE_URL`) are set in the deployment platform.
- [ ] Re-run the audit after deploying a fix: `npm run audit:puter`.

### Puter Service Issues

- [ ] Confirm `PUTER_API_KEY` is valid and not expired.
- [ ] Check Puter service status at https://puter.com.
- [ ] Ensure the server/client has outbound HTTPS access to `api.puter.com`.
- [ ] For `txt2img` failures, check Puter AI quota and rate limits.

### Missing `api/v1/*.json` Files

- [ ] Restore from `main` branch: `git checkout main -- api/v1/<file>.json`.
- [ ] Or re-run the data conversion scripts: `node scripts/convert-data.js`.
- [ ] Push the restored files and redeploy to GitHub Pages.

---

**See also**: [INTEGRATION-GUIDE.md](../INTEGRATION-GUIDE.md) for cross-project integration examples.

---

**Last Updated**: February 28, 2026  
**Maintained by**: Grudge Studio Team
=======
# Puter Systems Audit & Integration (Grudge Studio)

**Owner**: Grudge Studio Platform
**Scope**: All Grudge Studio apps/sites that use Puter capabilities (AI, FS, auth/session)
**Last Updated**: 2026-02-27

---

## 1) Objective

Establish one repeatable standard to:

- Audit Puter usage across Grudge Studio web apps, game backends, and companion tools.
- Detect integration drift (missing config, broken endpoints, disabled features).
- Define a minimum integration contract for every app/site that enables Puter features.

---

## 2) What is audited

For each app/site, audit these controls:

1. **Service Reachability**
   - Public URL is reachable.
   - Optional status endpoint is reachable if defined.

2. **Puter Integration Contract**
   - `puter.enabled` is explicitly declared in integration inventory.
   - Required Puter capabilities are listed (for example `txt2img`, `fs.write`).
   - Integration reference file exists where applicable.

3. **Configuration Hygiene**
   - App/site has explicit ObjectStore base URL.
   - If API key mode is used, env var names are documented (no hardcoded secrets in repo).

4. **Operational Readiness**
   - Health endpoint and ownership contact are defined.
   - Rollback plan exists (deprecate broken feature, switch fallback path).

---

## 3) Standard integration contract

Every Puter-enabled Grudge app/site should expose:

- **Config flags**
  - `puterEnabled` (boolean)
  - `objectStoreUrl` (string)
  - `environment` (`development` | `staging` | `production`)

- **Capability declaration**
  - Explicit feature list in inventory (`txt2img`, `fs.write`, etc.)

- **Fallback behavior**
  - If Puter is unavailable, app should return deterministic fallback responses or disable UI actions cleanly.

- **Status method**
  - Runtime status report containing at least:
    - Puter enabled/disabled
    - Puter initialized true/false
    - Timestamp

---

## 4) Audit workflow

1. Update inventory file: `docs/puter-integration-inventory.json`.
2. Run audit script:
   - `npm run audit:puter`
3. Optional: persist report to disk:
   - `npm run audit:puter:save`
4. Review report:
   - `docs/reports/puter-audit-report.json`
5. Open remediation issue(s) for any project with score `< 70`.

---

## 5) Scoring model

Each project is scored 0-100:

- URL reachable: **30**
- Optional status URL reachable: **15**
- Puter enabled declaration + feature list valid: **25**
- Integration reference file exists (if local path): **20**
- Ownership metadata present: **10**

Interpretation:

- **90-100**: Production ready
- **70-89**: Acceptable with minor gaps
- **50-69**: At risk; remediation required
- **0-49**: Not integration-ready

---

## 6) Remediation playbook

If a project fails audit:

1. **Reachability fail**
   - Validate deployment URL and DNS/hosting status.
   - Restore latest known-good deployment.

2. **Contract fail**
   - Add/align `puterEnabled` and capability declarations.
   - Ensure fallback behavior exists for unavailable Puter runtime.

3. **Reference fail**
   - Create/update integration module and inventory `integrationFile` path.

4. **Ownership fail**
   - Add owner/team and escalation contact.

---

## 7) Integration rollout for Grudge Studio portfolio

Recommended sequence:

1. ObjectStore (source of truth)
2. GrudgeStudioNPM / shared core package
3. Warlord-Crafting-Suite
4. GrudgeWarlords web clients
5. Remaining game tools/sites

This order reduces downstream drift because consumer apps depend on ObjectStore and shared integrations.

---

## 8) Change management

- Re-run Puter audit before every release candidate.
- Re-run Puter audit after any Puter SDK/API version update.
- Keep inventory current when adding/removing projects.

---

## 9) Remediation tracking assets

- Remediation plan: [docs/reports/puter-remediation-plan-2026-02-28.md](docs/reports/puter-remediation-plan-2026-02-28.md)
- Machine-readable checklist: [docs/reports/puter-remediation-checklist.json](docs/reports/puter-remediation-checklist.json)
- Latest audit baseline: [docs/reports/puter-audit-report.json](docs/reports/puter-audit-report.json)
