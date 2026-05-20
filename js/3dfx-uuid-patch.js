/**
 * 3DFX UUID Patch — loads Grudge UUIDs and injects them into the viewer.
 *
 * Add to 3dfx-viewer.html:
 *   <script src="./js/3dfx-uuid-patch.js" defer></script>
 *
 * Once loaded, every effect in the sidebar shows its GRDG-3DFX-* UUID
 * and a copy button. The inspector panel also shows the UUID with a
 * one-click copy + Three.js code snippet.
 */
(function () {
  const UUIDS_URL = './api/v1/3dfx-uuids.json';
  let uuidMap = {};

  // Fetch UUIDs on load
  fetch(UUIDS_URL)
    .then(r => r.json())
    .then(data => {
      uuidMap = data.uuids || {};
      patchSidebar();
      patchInspector();
      console.log(`[3DFX-UUID] Loaded ${Object.keys(uuidMap).length} UUIDs`);
    })
    .catch(err => console.warn('[3DFX-UUID] Failed to load UUIDs:', err));

  // Inject UUID badges into sidebar effect items
  function patchSidebar() {
    // Override the buildEffectList to include UUIDs
    const origSelect = window.selectEffect;
    window.selectEffect = function (id) {
      origSelect(id);
      updateInspectorUUID(id);
    };

    // Add UUID to existing items
    document.querySelectorAll('.effect-item').forEach(el => {
      const id = el.dataset.id;
      if (!id || !uuidMap[id]) return;
      const uuid = uuidMap[id];
      const badge = document.createElement('span');
      badge.className = 'uuid-badge';
      badge.textContent = uuid.slice(-8);
      badge.title = `Click to copy: ${uuid}`;
      badge.style.cssText = 'font-size:9px;color:var(--accent-gold);background:var(--accent-gold-soft);padding:1px 5px;border-radius:4px;cursor:pointer;font-family:monospace;border:1px solid var(--accent-gold-strong);flex-shrink:0;';
      badge.onclick = function (e) {
        e.stopPropagation();
        copyUUID(uuid);
      };
      el.appendChild(badge);
    });

    // Observe sidebar for new items (when filtering/searching)
    const observer = new MutationObserver(() => {
      document.querySelectorAll('.effect-item:not([data-uuid-patched])').forEach(el => {
        el.setAttribute('data-uuid-patched', '1');
        const id = el.dataset.id;
        if (!id || !uuidMap[id]) return;
        const uuid = uuidMap[id];
        const badge = document.createElement('span');
        badge.className = 'uuid-badge';
        badge.textContent = uuid.slice(-8);
        badge.title = `Click to copy: ${uuid}`;
        badge.style.cssText = 'font-size:9px;color:var(--accent-gold);background:var(--accent-gold-soft);padding:1px 5px;border-radius:4px;cursor:pointer;font-family:monospace;border:1px solid var(--accent-gold-strong);flex-shrink:0;';
        badge.onclick = function (e) {
          e.stopPropagation();
          copyUUID(uuid);
        };
        el.appendChild(badge);
      });
    });
    const effectList = document.getElementById('effectList');
    if (effectList) observer.observe(effectList, { childList: true, subtree: true });
    const spellList = document.getElementById('spellList');
    if (spellList) observer.observe(spellList, { childList: true, subtree: true });
  }

  // Add UUID section to inspector
  function patchInspector() {
    const inspector = document.querySelector('.inspector');
    if (!inspector) return;

    const section = document.createElement('div');
    section.className = 'insp-section';
    section.id = 'uuid-section';
    section.innerHTML = `
      <div class="insp-title">Grudge UUID</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <code id="uuid-display" style="flex:1;font-size:11px;color:var(--accent-gold);background:var(--bg-darker);padding:5px 8px;border-radius:4px;border:1px solid var(--border-soft);font-family:'Cascadia Code','Fira Code',monospace;word-break:break-all">Select an effect</code>
        <button id="uuid-copy-btn" onclick="document.getElementById('uuid-display').textContent !== 'Select an effect' && window.__copyUUID()" style="background:var(--accent-gold);border:1px solid var(--accent-gold);color:#000;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:10px;font-weight:600;font-family:inherit">Copy</button>
      </div>
      <div style="margin-bottom:6px">
        <button id="uuid-snippet-btn" onclick="window.__showSnippet()" style="width:100%;background:var(--bg-darker);border:1px solid var(--border-soft);color:var(--text-primary);padding:5px 8px;border-radius:4px;cursor:pointer;font-size:10px;font-family:inherit;text-align:left">📋 Copy Three.js snippet</button>
      </div>
      <pre id="uuid-snippet" style="display:none;font-size:10px;color:#d4cfb9;background:var(--bg-darker);padding:8px;border-radius:4px;border:1px solid var(--border-soft);font-family:'Cascadia Code','Fira Code',monospace;line-height:1.5;overflow-x:auto;white-space:pre;max-height:120px"></pre>
    `;
    inspector.insertBefore(section, inspector.firstChild);
  }

  function updateInspectorUUID(effectId) {
    const display = document.getElementById('uuid-display');
    const snippet = document.getElementById('uuid-snippet');
    if (!display) return;

    const uuid = uuidMap[effectId];
    if (uuid) {
      display.textContent = uuid;
      display.title = 'Click Copy to copy this UUID';
      if (snippet) {
        snippet.textContent = `// Load effect by Grudge UUID\nconst EFFECT_UUID = '${uuid}';\nconst reg = await fetch('https://grudge-objectstore.pages.dev/api/v1/3dfx-registry.json').then(r=>r.json());\nconst uuids = await fetch('https://grudge-objectstore.pages.dev/api/v1/3dfx-uuids.json').then(r=>r.json());\nconst id = Object.entries(uuids.uuids).find(([k,v]) => v === EFFECT_UUID)?.[0];\nconst effect = reg.effects[id]; // Full effect definition`;
      }
    } else {
      display.textContent = 'No UUID assigned';
      if (snippet) snippet.style.display = 'none';
    }
  }

  window.__copyUUID = function () {
    const display = document.getElementById('uuid-display');
    if (!display) return;
    copyUUID(display.textContent);
  };

  window.__showSnippet = function () {
    const snippet = document.getElementById('uuid-snippet');
    if (!snippet) return;
    if (snippet.style.display === 'none') {
      snippet.style.display = 'block';
      navigator.clipboard?.writeText(snippet.textContent);
      showToast('Snippet copied to clipboard');
    } else {
      snippet.style.display = 'none';
    }
  };

  function copyUUID(uuid) {
    navigator.clipboard?.writeText(uuid).then(
      () => showToast(`Copied: ${uuid}`),
      () => showToast('Copy failed')
    );
  }

  function showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
  }
})();
