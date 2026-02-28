# Puter Remediation Plan (2026-02-28)

Source report: `docs/reports/puter-audit-report.json`

## Summary

- Portfolio average score: **73**
- Immediate priority: **2 at-risk projects**
- Goal for next audit run: move all projects to **>= 70** and raise portfolio average to **>= 85**

---

## Priority 0 (Fix this week)

### 1) Warlord-Crafting-Suite (Score 55, At Risk)

- **Owner**: Grudge Studio Frontend
- **Primary issues**:
  - Main URL returns 404 (`urlReachable=false`, status 404)
  - Status URL returns 404 (`statusReachable=false`, status 404)
- **Actions**:
  1. Correct production URL in inventory if deployment moved.
  2. If URL is correct, restore Vercel deployment and verify HTTP 200.
  3. Add stable `/api/status` endpoint that returns JSON health payload.
  4. Re-run Puter audit and confirm reachability checks pass.
- **Target date**: 2026-03-03
- **Exit criteria**:
  - `urlReachable=true`
  - `statusReachable=true`
  - Project score >= 85

### 2) PuterGrudge (Score 50, At Risk)

- **Owner**: Grudge Studio AI
- **Primary issues**:
  - Main URL returns 404 (`urlReachable=false`, status 404)
  - Integration file missing in this repo (`integrationFileExists=false`)
- **Actions**:
  1. Validate canonical public URL for PuterGrudge and update inventory.
  2. Ensure canonical URL serves a 200 response (landing or health route).
  3. Add/commit integration module at `server/grudge-integration.js` in canonical codebase or update inventory path to the correct file.
  4. Add explicit status endpoint URL in inventory for non-site backends.
  5. Re-run Puter audit to verify URL and integration-file checks.
- **Target date**: 2026-03-05
- **Exit criteria**:
  - `urlReachable=true`
  - `integrationFileExists=true`
  - Project score >= 80

---

## Priority 1 (Stabilize next)

### 3) GrudgeWarlords (Score 85, Minor Gaps)

- **Owner**: Grudge Studio Game Team
- **Primary gap**:
  - Puter is disabled by design; no explicit status URL in inventory
- **Actions**:
  1. Keep `puter.enabled=false` as intentional unless roadmap changes.
  2. Add a status URL in inventory if service health endpoint exists.
  3. Document rationale for disabled Puter in integration notes.
- **Target date**: 2026-03-07
- **Exit criteria**:
  - Documented rationale + optional status URL
  - Score remains >= 85

---

## Priority 2 (Maintain)

### 4) ObjectStore (Score 100, Production Ready)

- **Owner**: Grudge Studio Platform
- **Actions**:
  1. Keep current integration contract as reference baseline.
  2. Re-run audit before each release candidate.
- **Target date**: Ongoing

---

## Execution cadence

- Run baseline check after each fix batch:
  - `npm run audit:puter`
- Save formal checkpoint report after each milestone:
  - `npm run audit:puter:save`
- Proposed checkpoints:
  - Checkpoint A: 2026-03-03
  - Checkpoint B: 2026-03-05
  - Checkpoint C: 2026-03-07

---

## Tracking fields for issues/tickets

Create one ticket per project with:

- Project name
- Owner team
- Current score and risk
- Failing checks
- Planned actions
- Due date
- Validation evidence (audit output snippet + URL response)
