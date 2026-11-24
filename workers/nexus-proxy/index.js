const PLAY = "https://www.spawn.co/@survival/nexus-nemesis-season-1/play";

export default {
  fetch(request) {
    const incoming = new URL(request.url);
    const target = new URL(PLAY);
    const characterId = incoming.searchParams.get("characterId");
    if (characterId) target.searchParams.set("characterId", characterId);
    target.searchParams.set("era", "nexus");
    return Response.redirect(target.toString(), 302);
  },
};
