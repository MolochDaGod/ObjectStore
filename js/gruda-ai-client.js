/**
 * Browser helper for Railway POST /api/ai/chat (gruda-ai-router SSOT).
 * Same-origin on warlords / localhost; absolute Railway URL elsewhere.
 */
(function (root) {
  'use strict';
  var RAILWAY = 'https://grudge-api-production-0d46.up.railway.app';

  function grudaAiOrigin() {
    if (typeof location === 'undefined') return RAILWAY;
    var h = location.hostname;
    if (
      h === 'localhost' ||
      h === '127.0.0.1' ||
      h === 'grudgewarlords.com' ||
      h === 'www.grudgewarlords.com' ||
      h === 'client.grudge-studio.com'
    ) {
      return '';
    }
    return RAILWAY;
  }

  function grudaChatUrl() {
    return grudaAiOrigin() + '/api/ai/chat';
  }

  async function grudaChat(messages, opts) {
    opts = opts || {};
    var r = await fetch(grudaChatUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages,
        model: opts.model || 'auto',
        page: opts.page || 'objectstore',
        tier: opts.tier || 'cheap',
        maxTokens: opts.maxTokens || 512,
        stream: !!opts.stream,
        imageUrl: opts.imageUrl || null,
      }),
    });
    var data = await r.json().catch(function () { return {}; });
    if (!r.ok || data.ok === false) {
      throw new Error(data.error || 'ai_router_failed');
    }
    return data;
  }

  async function grudaChatText(messages, opts) {
    var r = await grudaChat(messages, opts);
    return r.text;
  }

  root.grudaAiOrigin = grudaAiOrigin;
  root.grudaChatUrl = grudaChatUrl;
  root.grudaChat = grudaChat;
  root.grudaChatText = grudaChatText;
})(typeof window !== 'undefined' ? window : globalThis);
