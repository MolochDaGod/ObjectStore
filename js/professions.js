// js/professions.js — Data-driven Professions & Skills page
// Sources: api/v1/master-professions.json (canonical) and master-weaponSkills.json
(async function () {
  const PROF_URL = "./api/v1/master-professions.json";
  const WEAP_URL = "./api/v1/master-weaponSkills.json";
  const WPNS_URL = "./api/v1/master-weapons.json";
  const CONS_URL = "./api/v1/master-consumables.json";
  const ARMR_URL = "./api/v1/master-armor.json";

  const COLOR_MAP = {
    blue: "#4a9eff",
    green: "#5fd862",
    orange: "#ff9846",
    purple: "#9d4dff",
    red: "#ef4444",
    yellow: "#f0d890",
    pink: "#ec4899",
    amber: "#f59e0b",
    gray: "#a8a8a8",
    brown: "#8b7355",
  };
  // Canonical tier colors (matches master-weapons.json / master-armor.json tierColor field)
  const TIER_COLOR = {
    1: "#8b7355",
    2: "#a8a8a8",
    3: "#4a9eff",
    4: "#9d4dff",
    5: "#ff4d4d",
    6: "#ffaa00",
    7: "#d4a84b",
    8: "#f0d890",
  };
  const TIER_NAME = [
    "",
    "Common",
    "Uncommon",
    "Rare",
    "Epic",
    "Heroic",
    "Mythic",
    "Ancient",
    "Legendary",
  ];

  function color(name) {
    return COLOR_MAP[name] || "#d4af37";
  }
  function gradient(c) {
    return `radial-gradient(ellipse at top left, ${c}1f 0%, transparent 55%)`;
  }
  function el(id) {
    return document.getElementById(id);
  }

  let prof = null,
    weap = null,
    wpns = null,
    cons = null,
    armr = null;
  try {
    [prof, weap, wpns, cons, armr] = await Promise.all([
      fetch(PROF_URL).then((r) => r.json()),
      fetch(WEAP_URL).then((r) => r.json()),
      fetch(WPNS_URL)
        .then((r) => r.json())
        .catch(() => null),
      fetch(CONS_URL)
        .then((r) => r.json())
        .catch(() => null),
      fetch(ARMR_URL)
        .then((r) => r.json())
        .catch(() => null),
    ]);
  } catch (e) {
    el("profRow").innerHTML =
      `<div style="color:#ef4444;padding:20px;">Failed to load canonical data. ${e.message}</div>`;
    return;
  }

  // ── Canonical signature items per crafter (T8 Legendary) ────────────────
  // Pulls top-tier items where craftedBy matches the profession name.
  function getSignatures(craftedByName, limit) {
    const max = limit || 8;
    const all = [
      ...((wpns && wpns.items) || []),
      ...((cons && cons.items) || []),
      ...((armr && armr.items) || []),
    ];
    const byCrafter = all.filter(
      (x) =>
        x &&
        x.craftedBy &&
        x.craftedBy.toLowerCase() === craftedByName.toLowerCase(),
    );
    // Prefer T8, fall back to top tiers.
    const t8 = byCrafter.filter((x) => x.tier === 8);
    const sorted = (t8.length ? t8 : byCrafter).sort(
      (a, b) => (b.tier || 0) - (a.tier || 0),
    );
    // De-dup by baseName (keep first which is highest tier).
    const seen = new Set();
    const out = [];
    for (const it of sorted) {
      const key = it.baseName || it.name;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(it);
      if (out.length >= max) break;
    }
    return out;
  }

  function sigItemHtml(it, accent) {
    const tier = it.tier || 8;
    const tColor = TIER_COLOR[tier] || accent;
    const tLabel = TIER_NAME[tier] || it.tierLabel || "";
    const sig =
      it.signature ||
      (Array.isArray(it.abilities) ? it.abilities[0] : "") ||
      it.passive ||
      "";
    const lore = it.lore || it.description || "";
    const icon = it.iconUrl
      ? `<img src="${it.iconUrl}" alt="" loading="lazy" style="width:42px;height:42px;border-radius:4px;border:1px solid ${tColor};background:#0a0a0a;flex-shrink:0;">`
      : `<div style="width:42px;height:42px;border-radius:4px;border:1px solid ${tColor};background:#0a0a0a;display:flex;align-items:center;justify-content:center;font-size:1.4em;flex-shrink:0;">${it.emoji || "✦"}</div>`;
    const baseName = (it.baseName || it.name || "").replace(/\s+T\d+\s*$/, "");
    return `
      <div style="display:flex;gap:10px;align-items:flex-start;background:rgba(255,255,255,0.02);border:1px solid var(--gold-dim);border-left:3px solid ${tColor};border-radius:4px;padding:10px;">
        ${icon}
        <div style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">
            <span style="font-family:var(--font-heading);color:${tColor};font-size:0.95em;">${baseName}</span>
            <span style="font-family:var(--font-mono);font-size:0.7em;color:${tColor};letter-spacing:0.05em;">T${tier} ${tLabel}</span>
          </div>
          ${sig ? `<div style="font-size:0.78em;color:var(--gold-light);margin-top:3px;">${sig}</div>` : ""}
          ${lore ? `<div style="font-size:0.72em;color:var(--muted);margin-top:3px;font-style:italic;">${lore}</div>` : ""}
        </div>
      </div>`;
  }

  const gatherList = Object.values(prof.gathering || {});
  const craftList = Object.values(prof.crafting || {});
  const milestones = prof.gatheringMilestones || [];

  // ── Header counts ───────────────────────────────────────────────────────
  el("countGather").textContent = gatherList.length;
  el("countCraft").textContent = craftList.length;
  el("countNodes").textContent =
    prof.totalNodes ??
    craftList.reduce((s, c) => s + (c.skillTree?.length || 0), 0);
  el("countMiles").textContent = milestones.length;
  const wTypes = Array.isArray(weap.weaponTypes)
    ? weap.weaponTypes
    : Object.values(weap.weaponTypes || {});
  el("countWeapons").textContent = wTypes.length;

  // ── Gathering ───────────────────────────────────────────────────────────
  function renderGathering() {
    el("profRow").innerHTML = gatherList
      .map((p) => {
        const c = color(p.color);
        const t1 =
          (p.tierResources && p.tierResources["1"]) || p.resources || [];
        const tierCount = p.tierResources
          ? Object.keys(p.tierResources).length
          : 0;
        return `
        <div class="prof-card" style="border-left-color:${c};" onclick="window.openGather('${p.name}')">
          <div class="prof-card-bg" style="background:${gradient(c)};"></div>
          <div class="prof-card-content">
            <h3 style="color:${c};"><span class="icon-big">${p.icon || "⛏"}</span> ${p.name}</h3>
            <div>
              <span class="role-badge">Gathering</span>
              ${p.feedsInto ? p.feedsInto.map((f) => `<span class="attr-tag" style="color:${c};border:1px solid ${c};background:${c}18;">→ ${f}</span>`).join("") : ""}
            </div>
            <div class="desc-text">Resources: ${(p.resources || []).join(", ")}</div>
            <div class="resources">
              ${t1
                .slice(0, 3)
                .map((r) => `<span class="res-tag">${r}</span>`)
                .join("")}
              ${tierCount > 1 ? `<span class="res-tag" style="color:var(--gold-light);">+${tierCount - 1} tiers&hellip;</span>` : ""}
            </div>
            <div class="expand-hint">Click to see all 8 tiers &rarr;</div>
          </div>
        </div>`;
      })
      .join("");
  }

  window.openGather = function (name) {
    const p = gatherList.find((x) => x.name === name);
    if (!p) return;
    const c = color(p.color);
    el("detailName").innerHTML =
      `<span style="color:${c};">${p.icon || ""} ${p.name}</span>`;
    el("detailMeta").innerHTML =
      `<strong>Type:</strong> Gathering &middot; <strong>Feeds Into:</strong> ${(p.feedsInto || []).join(", ") || "—"} &middot; <strong>Resources:</strong> ${(p.resources || []).join(", ")}`;
    const tiers = p.tierResources || {};
    el("detailTiers").innerHTML = Object.keys(tiers)
      .sort((a, b) => +a - +b)
      .map(
        (k) => `
      <div class="tier-step" style="border-top-color:${TIER_COLOR[k]};">
        <div class="lv">T${k} &middot; ${TIER_NAME[+k] || ""}</div>
        <div class="tn">${tiers[k].length} resources</div>
        <div class="tres">${tiers[k].map((r) => `<span class="tr">${r}</span>`).join("")}</div>
      </div>`,
      )
      .join("");
    const detail = el("profDetail");
    detail.classList.add("open");
    detail.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  window.closeProfDetail = function () {
    el("profDetail").classList.remove("open");
  };

  // ── Crafting ────────────────────────────────────────────────────────────
  function renderCrafting() {
    el("craftRow").innerHTML = craftList
      .map((p) => {
        const c = color(p.color);
        const nodes = p.skillTree || [];
        return `
        <div class="prof-card" style="border-left-color:${c};" onclick="window.openCraft('${p.name}')">
          <div class="prof-card-bg" style="background:${gradient(c)};"></div>
          <div class="prof-card-content">
            <h3 style="color:${c};"><span class="icon-big">${p.icon || "🔨"}</span> ${p.name}</h3>
            <div>
              <span class="role-badge">Crafting</span>
              <span class="attr-tag" style="color:${c};border:1px solid ${c};background:${c}18;">${p.recipeCount || 0} recipes</span>
              <span class="attr-tag" style="color:var(--muted);border:1px solid var(--gold-dim);">${nodes.length} nodes</span>
            </div>
            <div class="desc-text">${p.role || ""}</div>
            <div class="resources">
              ${(p.specializations || []).map((s) => `<span class="res-tag" style="color:${c};">${s}</span>`).join("")}
            </div>
            <div class="expand-hint">Click for recipes, tools &amp; skill tree &rarr;</div>
          </div>
        </div>`;
      })
      .join("");
  }

  window.openCraft = function (name) {
    const p = craftList.find((x) => x.name === name);
    if (!p) return;
    const c = color(p.color);
    el("craftDetailName").innerHTML =
      `<span style="color:${c};">${p.icon || ""} ${p.name}</span>`;
    el("craftDetailMeta").innerHTML =
      `<strong>Role:</strong> ${p.role || "—"} &middot; <strong>Recipes:</strong> ${p.recipeCount || 0} &middot; <strong>Skill Nodes:</strong> ${(p.skillTree || []).length}`;
    const blk = (label, arr, col) => `
      <div class="tier-step" style="border-top-color:${col};min-width:160px;">
        <div class="lv">${label}</div>
        <div class="tres">${(arr || []).map((r) => `<span class="tr">${r}</span>`).join("")}</div>
      </div>`;
    const branches = {};
    (p.skillTree || []).forEach((n) => {
      const b = n.branch || "Core";
      (branches[b] = branches[b] || []).push(n);
    });
    const branchHtml = Object.entries(branches)
      .map(([b, arr]) => {
        arr.sort((a, b) => a.reqLevel - b.reqLevel);
        const min = arr[0]?.reqLevel ?? 0,
          max = arr[arr.length - 1]?.reqLevel ?? 0;
        return `
        <div class="tier-step" style="border-top-color:${c};min-width:240px;">
          <div class="lv">${b} &middot; Lv ${min}–${max}</div>
          <div class="tn">${arr.length} nodes</div>
          <div class="tres">${arr.map((n) => `<span class="tr" title="Lv ${n.reqLevel} &middot; ${n.nodeType}">${n.name}</span>`).join("")}</div>
        </div>`;
      })
      .join("");
    el("craftDetailTiers").innerHTML =
      blk("Specializations", p.specializations, c) +
      blk("Crafts", p.crafts, c) +
      blk("Gathers", p.gathers, c) +
      blk("Tools", p.tools, c) +
      blk("Recipe Types", p.recipeTypes, c) +
      branchHtml;

    // ── Signature Crafts (T8 Legendary items by this profession) ──────────
    const sigHost = el("craftDetailSignatures");
    if (sigHost) {
      const sigs = getSignatures(p.name, 8);
      if (sigs.length) {
        sigHost.innerHTML = `
          <div style="font-family:var(--font-heading);color:${c};font-size:1.05em;letter-spacing:0.06em;text-transform:uppercase;margin:18px 0 10px;border-bottom:1px solid ${c}40;padding-bottom:6px;">
            Signature Crafts &middot; <span style="color:var(--muted);font-size:0.8em;">${sigs.length} legendary items</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:8px;">
            ${sigs.map((it) => sigItemHtml(it, c)).join("")}
          </div>`;
      } else {
        sigHost.innerHTML = "";
      }
    }

    const detail = el("craftDetail");
    detail.classList.add("open");
    detail.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  window.closeCraftDetail = function () {
    el("craftDetail").classList.remove("open");
  };

  // ── Milestones ──────────────────────────────────────────────────────────
  function renderMilestones() {
    el("milesGrid").innerHTML = milestones
      .map(
        (m) => `
      <div class="tier-step" style="border-top-color:var(--gold);min-width:200px;">
        <div class="lv">LEVEL ${m.level}</div>
        <div class="tn">${m.unlock}</div>
        <div class="tres"><span class="tr" style="white-space:normal;line-height:1.4;">${m.description}</span></div>
      </div>`,
      )
      .join("");
  }

  // ── Weapon Types ────────────────────────────────────────────────────────
  function renderWeapons() {
    el("weaponTypesGrid").innerHTML = wTypes
      .map((w) => {
        const restrict = w.classRestrictions || w.classes || [];
        return `
        <div style="background:var(--card);border:1px solid var(--gold-dim);border-radius:4px;padding:12px 14px;">
          <div style="font-family:var(--font-heading);font-size:0.9em;color:var(--gold);margin-bottom:6px;">${w.name || w.id}</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${restrict.map((c) => `<span style="background:rgba(255,255,255,0.05);color:var(--muted);padding:1px 7px;border-radius:3px;font-size:0.7em;font-family:var(--font-mono);">${c}</span>`).join("")}
          </div>
        </div>`;
      })
      .join("");
  }

  // ── Tabs ────────────────────────────────────────────────────────────────
  document.querySelectorAll(".tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".tabs button")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document
        .querySelectorAll(".section")
        .forEach((s) => s.classList.remove("active"));
      el("tab-" + btn.dataset.tab).classList.add("active");
    });
  });

  renderGathering();
  renderCrafting();
  renderMilestones();
  renderWeapons();
})();
