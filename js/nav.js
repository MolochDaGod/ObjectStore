(function() {
  var pages = [
    { label: 'Home', href: './', icon: '🏠' },
    { label: 'API Docs', href: './docs/', icon: '📖' },
    { label: 'Items', href: './GRUDGE_Item_Database.html', icon: '🗃️' },
    { label: 'Sprites', href: './SPRITE_DATABASE.html', icon: '📊' },
    { label: '2D Models', href: './2D_MODELS.html', icon: '🎨' },
    { label: 'VFX', href: './VFX_BROWSER.html', icon: '✨' },
    { label: 'Browser', href: './ItemBrowser.html', icon: '🔍' },
    { label: 'Icons', href: './tools/icon-generator.html', icon: '🖌️' }
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
    '.os-nav{display:flex;align-items:center;gap:6px;padding:8px 16px;background:#12161d;border-bottom:1px solid #2a2f3e;position:sticky;top:0;z-index:9999;overflow-x:auto;white-space:nowrap;font-family:"Segoe UI",system-ui,sans-serif;-webkit-overflow-scrolling:touch;}',
    '.os-nav-logo{display:flex;align-items:center;gap:6px;color:#d4a84b;font-weight:700;font-size:0.85rem;margin-right:8px;text-decoration:none;flex-shrink:0;}',
    '.os-nav-logo img{height:18px;width:18px;}',
    '.os-nav-btn{padding:6px 12px;border-radius:6px;font-size:0.78rem;color:#8b8685;text-decoration:none;transition:all 0.15s;border:1px solid transparent;flex-shrink:0;display:inline-flex;align-items:center;gap:4px;}',
    '.os-nav-btn:hover{color:#e8e6e3;background:#1a1f2e;border-color:#3d3d3d;}',
    '.os-nav-btn.active{color:#d4a84b;background:rgba(212,168,75,0.12);border-color:rgba(212,168,75,0.3);font-weight:600;}',
    '@media(max-width:768px){.os-nav{padding:6px 10px;gap:4px;}.os-nav-btn{padding:5px 8px;font-size:0.72rem;}.os-nav-logo span{display:none;}}'
  ].join('\n');
  document.head.appendChild(css);

  var nav = document.createElement('nav');
  nav.className = 'os-nav';

  var faviconPath = inSubdir ? '../favicon.svg' : './favicon.svg';
  nav.innerHTML = '<a class="os-nav-logo" href="' + resolveHref('./') + '"><img src="' + faviconPath + '" alt=""> <span>ObjectStore</span><span style="font-size:0.6rem;background:rgba(212,168,75,0.15);color:#d4a84b;padding:1px 6px;border-radius:8px;margin-left:6px;font-weight:600;">v3</span></a>';

  for (var i = 0; i < pages.length; i++) {
    var p = pages[i];
    var href = resolveHref(p.href);
    var a = document.createElement('a');
    a.className = 'os-nav-btn' + (isActive(p.href) ? ' active' : '');
    a.href = href;
    a.innerHTML = p.icon + ' ' + p.label;
    nav.appendChild(a);
  }

  // Insert at top of body
  if (document.body.firstChild) {
    document.body.insertBefore(nav, document.body.firstChild);
  } else {
    document.body.appendChild(nav);
  }

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    var swPath = inSubdir ? '../sw.js' : './sw.js';
    navigator.serviceWorker.register(swPath).catch(function() {});
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
