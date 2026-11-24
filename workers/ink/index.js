const GAMES = [
  {
    id: "warlords",
    name: "Grudge Warlords",
    host: "warlords.grudge.studio",
    play: "https://www.spawn.co/@racalvin/grudge-warlords/play",
    era: "warlords",
  },
  {
    id: "grudges",
    name: "Grudges",
    host: "grudges.grudge.studio",
    play: "https://www.spawn.co/@survival/grudges/play",
    era: "grudges",
  },
  {
    id: "links",
    name: "Grudge Social",
    host: "links.grudge.studio",
    play: "https://www.spawn.co/@survival/grudge-links/play",
    era: "social",
  },
  {
    id: "poker",
    name: "Spawn Poker",
    host: "spoker.grudge-studio.com",
    play: "https://www.spawn.co/@survival/spawn-poker/play",
    era: "poker",
  },
  {
    id: "ink",
    name: "Reality Ink",
    host: "ink.grudge.studio",
    play: "https://www.spawn.co/@racalvin/reality-ink@dev/room:main+hall?c=16rgw3b&with=uxcdkidk",
    era: "ink",
  },
  {
    id: "nexus",
    name: "Nexus Nemesis",
    host: "nexus.grudge-studio.com",
    play: "https://www.spawn.co/@survival/nexus-nemesis-season-1/play",
    era: "nexus",
  },
];

const BANK = "https://grudgewarlords.com";
const ID = "https://id.grudge-studio.com/login";

function playUrl(game, characterId) {
  const url = new URL(game.play);
  if (characterId) url.searchParams.set("characterId", characterId);
  if (game.era) url.searchParams.set("era", game.era);
  return url.toString();
}

function page(request) {
  const here = new URL(request.url);
  const host = here.hostname;
  const characterId = here.searchParams.get("characterId") || "";
  const mine = GAMES.find((g) => g.host === host) || GAMES[0];
  const login = ID + "?redirect_uri=" + encodeURIComponent(here.origin + here.pathname);
  const rows = GAMES.map((g) => {
    const href = playUrl(g, characterId);
    const mark = g.host === mine.host ? " · this door" : "";
    return `<li><a href="${href}">${g.name}</a>${mark}<br><span>${g.play}</span></li>`;
  }).join("");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${mine.name} · Grudge</title>
  <style>
    body { margin: 0; background: #12100c; color: #f3e6cf; font: 16px/1.45 Georgia, serif; }
    main { max-width: 40rem; margin: 0 auto; padding: 2rem 1.2rem 3rem; }
    h1 { font-size: 1.7rem; margin: 0 0 0.3rem; }
    p, span { color: #cbbfa8; }
    a.play { display: inline-block; margin: 0.7rem 0 1rem; padding: 0.7rem 1rem; background: #e0b15a; color: #1a140c; text-decoration: none; font-weight: 700; }
    a { color: #e0b15a; }
    ul { padding-left: 1.1rem; }
    li { margin: 0.55rem 0; }
  </style>
</head>
<body>
  <main>
    <h1>${mine.name}</h1>
    <p>One Grudge ID. One hero UUID. One account bank. Social is the shared card, not the bank.</p>
    <a class="play" href="${playUrl(mine, characterId)}">Play ${mine.name}</a>
    <p><a href="${login}">Sign in with Grudge ID</a> · <a href="${BANK}">Shared bank</a> · <a href="${playUrl(GAMES[2], characterId)}">Grudge Social</a></p>
    <ul>${rows}</ul>
    <p>Play stays on Spawn. The bank is the Grudge account bag. Social play-gold is not that bag. A hero rides as <code>characterId</code> plus <code>era</code>.</p>
  </main>
</body>
</html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

export default {
  fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname;
    const game = GAMES.find((g) => g.host === host);
    if (!game && host.endsWith(".workers.dev") === false) {
      return new Response("Unknown door", { status: 404 });
    }
    if (url.searchParams.get("go") === "1" && game) {
      const characterId = url.searchParams.get("characterId") || "";
      return Response.redirect(playUrl(game, characterId), 302);
    }
    return page(request);
  },
};
