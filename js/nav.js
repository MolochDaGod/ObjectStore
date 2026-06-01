(function() {
  // CDN base for icon images
  var ICN = 'https://objectstore.grudge-studio.com/icons';

  // Internal ObjectStore pages — icon is now image path relative to ICN
  var pages = [
    { label: 'Home',         href: './',                          icon: ICN + '/Icons_Essential/v1.2/Icons/Home.png' },
    { label: 'API Docs',     href: './docs/',                     icon: ICN + '/496_rpg_icons/I_Scroll.png' },
    { label: 'Items',        href: './GRUDGE_Item_Database.html',  icon: ICN + '/Icons_Essential/v1.2/Icons/ChestTreasure.png' },
    { label: 'Item Browser', href: './ItemBrowser.html',           icon: ICN + '/Icons_Essential/v1.2/Icons/MagnifyingGlass.png' },
    { label: 'Sprites',      href: './SPRITE_DATABASE.html',       icon: ICN + '/ui/buttons/people.png' },
    { label: 'Weapon Skills', href: './WEAPON_SKILLS.html',        icon: ICN + '/496_rpg_icons/S_Sword07.png' },
    { label: '2D Models',    href: './2D_MODELS.html',             icon: ICN + '/Icons_Essential/v1.2/Icons/PaintBrush.png' },
    { label: 'VFX',          href: './VFX_BROWSER.html',           icon: ICN + '/496_rpg_icons/S_Fire05.png' },
    { label: '3DFX',         href: './3dfx-viewer.html',           icon: ICN + '/496_rpg_icons/S_Thunder03.png' },
    { label: 'Spell VFX',    href: './spell-vfx-library.html',     icon: ICN + '/496_rpg_icons/S_Magic05.png' },
    { label: '3D Models',    href: './3D_MODELS.html',             icon: ICN + '/Icons_Essential/v1.2/Icons/Hammer.png' },
    { label: 'Audio',        href: './AUDIO_BROWSER.html',         icon: ICN + '/Icons_Essential/v1.2/Icons/SpeakerOn.png' },
    { label: 'Icons',        href: './tools/icon-generator.html',  icon: ICN + '/Icons_Essential/v1.2/Icons/Pencil.png' },
    { label: 'Admin',        href: './admin.html',                 icon: ICN + '/Icons_Essential/v1.2/Icons/Gear.png' }
  ];

  // Grudge front-end apps (external, open in same tab)
  var apps = [
    { label: 'Warlords',      href: 'https://grudgewarlords.com',         icon: ICN + '/496_rpg_icons/S_Sword01.png',     title: 'Grudge Warlords - player-facing game' },
    { label: 'Info Hub',      href: 'https://info.grudge-studio.com',     icon: ICN + '/496_rpg_icons/I_Book.png',        title: 'Game Data Hub - items, stats, skills, professions' },
    { label: 'Client',        href: 'https://client.grudge-studio.com',   icon: ICN + '/Icons_Essential/v1.2/Icons/Gamepad.png', title: 'Grudge Builder / client.grudge-studio.com' },
    { label: 'Dashboard',     href: 'https://dash.grudge-studio.com',     icon: ICN + '/Icons_Essential/v1.2/Icons/Document.png', title: 'Grudge Studio dashboard' },
    { label: 'ID',            href: 'https://id.grudge-studio.com',       icon: ICN + '/Icons_Essential/v1.2/Icons/Key.png',     title: 'Grudge Auth / identity' },
    { label: 'AI',            href: 'https://ai.grudge-studio.com',       icon: ICN + '/Icons_Essential/v1.2/Icons/Lightbulb.png', title: 'Gruda Legion AI hub' },
    { label: 'Crafting',      href: 'https://grudge-crafting.puter.site', icon: ICN + '/Icons_Essential/v1.2/Icons/Hammer.png',  title: 'Puter-hosted crafting suite' },
    { label: 'Grudge Studio', href: 'https://grudge-studio.com',          icon: ICN + '/Icons_Essential/v1.2/Icons/Trophy.png',  title: 'grudge-studio.com' }
  ];

  // Detect if we're in a subdirectory (like docs/)
  var path = window.location.pathname;
  var inSubdir = path.indexOf('/docs/') !== -1 || path.endsWith('/docs');

  function resolveHref(href) {
    if (inSubdir) return href.replace('./', '../');
    return href;
  }

  // Determine active page
  function isActive(href) {
    var loc = window.location.pathname;
    if (href === './' || href === '../') {
      return loc.endsWith('/index.html') || loc.endsWith('/ObjectStore/') || loc === '/';
    }
    var filename = href.split('/').pop();
    return loc.indexOf(filename) !== -1;
  }

  var css = document.createElement('style');
  css.textContent = [
    '.os-nav-wrap{position:sticky;top:0;z-index:9999;font-family:"Segoe UI",system-ui,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.35);}',
    '.os-nav,.os-appbar{display:flex;align-items:center;gap:6px;padding:8px 16px;overflow-x:auto;white-space:nowrap;-webkit-overflow-scrolling:touch;}',
    '.os-nav{background:#12161d;border-bottom:1px solid #2a2f3e;}',
    '.os-appbar{background:#0d1016;border-bottom:1px solid #1f2330;}',
    '.os-nav-logo{display:flex;align-items:center;gap:6px;color:#d4a84b;font-weight:700;font-size:0.85rem;margin-right:8px;text-decoration:none;flex-shrink:0;}',
    '.os-nav-logo img{height:18px;width:18px;}',
    '.os-appbar-label{color:#8b8685;font-size:0.7rem;margin-right:8px;text-transform:uppercase;letter-spacing:0.06em;flex-shrink:0;}',
    '.os-nav-btn{padding:6px 12px;border-radius:6px;font-size:0.78rem;color:#8b8685;text-decoration:none;transition:all 0.15s;border:1px solid transparent;flex-shrink:0;display:inline-flex;align-items:center;gap:5px;}',
    '.os-nav-btn img{width:16px;height:16px;object-fit:contain;vertical-align:middle;image-rendering:auto;flex-shrink:0;}',
    '.os-nav-btn:hover{color:#e8e6e3;background:#1a1f2e;border-color:#3d3d3d;}',
    '.os-nav-btn.active{color:#d4a84b;background:rgba(212,168,75,0.12);border-color:rgba(212,168,75,0.3);font-weight:600;}',
    '.os-nav-btn.external{color:#a7b0c0;border-color:transparent;}',
    '.os-nav-btn.external:hover{color:#e8e6e3;background:rgba(68,136,255,0.12);border-color:rgba(68,136,255,0.3);}',
    '.os-nav-sep{width:1px;height:18px;background:#2a2f3e;margin:0 6px;flex-shrink:0;}',
    '@media(max-width:768px){.os-nav,.os-appbar{padding:6px 10px;gap:4px;}.os-nav-btn{padding:5px 8px;font-size:0.72rem;}.os-nav-logo span{display:none;}.os-appbar-label{display:none;}}'
  ].join('\n');
  document.head.appendChild(css);

  // Wrapper so both bars scroll together when sticky
  var wrap = document.createElement('div');
  wrap.className = 'os-nav-wrap';

  // App bar (Grudge front-end apps)
  var appbar = document.createElement('nav');
  appbar.className = 'os-appbar';
  appbar.setAttribute('aria-label', 'Grudge Studio apps');
  var appLabel = document.createElement('span');
  appLabel.className = 'os-appbar-label';
  appLabel.textContent = 'Grudge Studio';
  appbar.appendChild(appLabel);
  for (var j = 0; j < apps.length; j++) {
    var app = apps[j];
    var al = document.createElement('a');
    al.className = 'os-nav-btn external';
    al.href = app.href;
    al.title = app.title || app.label;
    al.innerHTML = '<img src="' + app.icon + '" alt="" width="16" height="16"> ' + app.label;
    appbar.appendChild(al);
  }
  wrap.appendChild(appbar);

  // Internal ObjectStore nav
  var nav = document.createElement('nav');
  nav.className = 'os-nav';
  nav.setAttribute('aria-label', 'ObjectStore pages');
  var faviconPath = inSubdir ? '../favicon.svg' : './favicon.svg';
  nav.innerHTML = '<a class="os-nav-logo" href="' + resolveHref('./') + '"><img src="' + faviconPath + '" alt=""> <span>ObjectStore</span><span style="font-size:0.6rem;background:rgba(212,168,75,0.15);color:#d4a84b;padding:1px 6px;border-radius:8px;margin-left:6px;font-weight:600;">v3</span></a>';

  for (var i = 0; i < pages.length; i++) {
    var p = pages[i];
    var href = resolveHref(p.href);
    var a = document.createElement('a');
    a.className = 'os-nav-btn' + (isActive(p.href) ? ' active' : '');
    a.href = href;
    a.innerHTML = '<img src="' + p.icon + '" alt="" width="16" height="16"> ' + p.label;
    nav.appendChild(a);
  }
  wrap.appendChild(nav);

  // Insert at top of body
  if (document.body.firstChild) {
    document.body.insertBefore(wrap, document.body.firstChild);
  } else {
    document.body.appendChild(wrap);
  }

  // Register Service Worker.
  // updateViaCache: 'none' makes the browser skip its HTTP cache when checking
  // for sw.js updates, so deploys propagate immediately instead of being
  // pinned to the (default) 24h imported-script cache.
  if ('serviceWorker' in navigator) {
    var swPath = inSubdir ? '../sw.js' : './sw.js';
    navigator.serviceWorker.register(swPath, { updateViaCache: 'none' }).then(function(reg) {
      // Force an update check so SW changes (e.g. cross-origin fixes) reach
      // clients without waiting for the 24h browser HTTP cache.
      try { reg.update(); } catch (e) {}
      // If a new SW is waiting, tell it to take over immediately.
      if (reg.waiting) reg.waiting.postMessage('SKIP_WAITING');
      reg.addEventListener('updatefound', function() {
        var nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', function() {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            nw.postMessage('SKIP_WAITING');
          }
        });
      });
    }).catch(function() {});
    // Reload once when a new SW takes control, so the page picks up the new
    // fetch-handler logic immediately.
    var refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', function() {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }

  // Vercel Analytics (only when deployed on Vercel)
  if (window.location.hostname.includes('vercel.app')) {
    var s = document.createElement('script');
    s.src = 'https://va.vercel-scripts.com/v1/script.js';
    s.defer = true;
    s.dataset.sdkn = '@vercel/analytics';
    document.head.appendChild(s);
    var si = document.createElement('script');
    si.src = 'https://va.vercel-scripts.com/v1/speed-insights/script.js';
    si.defer = true;
    document.head.appendChild(si);
  }
})();
