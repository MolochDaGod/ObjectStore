/**
 * blox.grudge-studio.com → Vercel GrudgeBlox (grudgeblox.vercel.app).
 * Same Worker custom-domain pattern as duelyst-codex-proxy.
 * Rapier/uWS room stays on Railway; characters/bag stay on grudge-api.
 */
const ORIGIN = "https://grudgeblox.vercel.app";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = new URL(url.pathname + url.search, ORIGIN);
    const headers = new Headers(request.headers);
    headers.set("Host", new URL(ORIGIN).host);
    headers.set("X-Forwarded-Host", url.host);
    const upstream = await fetch(
      new Request(target, {
        method: request.method,
        headers,
        body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
        redirect: "manual",
      }),
    );
    const out = new Headers(upstream.headers);
    out.set("X-Edge-Proxy", "grudgeblox-edge-proxy");
    return new Response(upstream.body, { status: upstream.status, headers: out });
  },
};
