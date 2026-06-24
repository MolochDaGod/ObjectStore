/**
 * grudge-edge-proxy — objectstore.grudge-studio.com edge router
 *
 * Routes API traffic to grudgeassets; static game-data JSON and docs to
 * info.grudge-studio.com (canonical Vercel deploy).
 */
const API_WORKER = 'https://grudgeassets.grudge.workers.dev';
const STATIC_ORIGIN = 'https://info.grudge-studio.com';

function isApiPath(pathname) {
  return (
    pathname === '/health' ||
    pathname === '/v1/health' ||
    pathname.startsWith('/v1/') ||
    pathname.startsWith('/api/v1/')
  );
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (isApiPath(url.pathname)) {
      const target = API_WORKER + url.pathname + url.search;
      const upstream = await fetch(target, {
        method: request.method,
        headers: request.headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
        redirect: 'manual',
      });
      const headers = new Headers(upstream.headers);
      headers.set('X-Edge-Proxy', 'grudge-edge-proxy');
      return new Response(upstream.body, { status: upstream.status, headers });
    }

    if (url.pathname === '/docs' || url.pathname.startsWith('/docs/')) {
      return Response.redirect(STATIC_ORIGIN + url.pathname + url.search, 301);
    }

    const staticUrl = STATIC_ORIGIN + url.pathname + url.search;
    const staticRes = await fetch(staticUrl, {
      method: request.method,
      headers: request.headers,
      redirect: 'manual',
    });

    if (staticRes.status !== 404) {
      const headers = new Headers(staticRes.headers);
      headers.set('X-Edge-Proxy', 'grudge-edge-proxy');
      return new Response(staticRes.body, { status: staticRes.status, headers });
    }

    return Response.redirect(STATIC_ORIGIN + '/docs', 302);
  },
};