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
