/**
 * Grudge Studio — Sprite AI Editor
 * Puter.js powered chat panel for AI-assisted sprite editing.
 * Uses puter.ai.chat() for vision analysis and puter.ai.txt2img() for generation.
 */
(function () {
  'use strict';

  // ── State ──
  var messages = [];
  var isOpen = false;
  var isStreaming = false;
  var currentModel = 'gpt-4o';
  var panelEl, chatLog, chatInput, sendBtn, modelSelect, statusEl;

  // Models that support vision (image input)
  var VISION_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-5-nano', 'gpt-5.4-nano', 'gemini-2.5-flash', 'gemini-2.0-flash'];
  var MODELS = [
    { id: 'gpt-4o', label: 'GPT-4o (Vision)', vision: true },
    { id: 'gpt-5.4-nano', label: 'GPT-5.4 Nano (Vision)', vision: true },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', vision: true },
    { id: 'claude-sonnet-4', label: 'Claude Sonnet 4', vision: false },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Vision)', vision: true }
  ];

  var SYSTEM_PROMPT =
    'You are a pixel-art sprite editing assistant for Grudge Studio.\n' +
    'You help users analyze, fix, and improve 2D game sprites and sprite sheets.\n' +
    'When the user asks you to make edits, respond with a JSON command block that the app can auto-apply.\n\n' +
    'Available commands (wrap in ```json fences):\n' +
    '{"action":"hue","value":NUMBER}  — shift hue (-180 to 180)\n' +
    '{"action":"saturation","value":NUMBER}  — saturation % (0 to 200)\n' +
    '{"action":"brightness","value":NUMBER}  — brightness % (50 to 200)\n' +
    '{"action":"flip"}  — flip horizontally\n' +
    '{"action":"trim"}  — auto-trim transparent padding\n' +
    '{"action":"export"}  — export current frame as PNG\n' +
    '{"action":"exportAll"}  — export all frames\n' +
    '{"action":"generate","prompt":"DESCRIPTION"}  — generate a new sprite via AI image gen\n\n' +
    'You can return multiple commands as a JSON array.\n' +
    'Be concise. When analyzing a sprite image, describe: character type, animation state, frame count estimate, palette, and any issues you notice.';

  // ── Build Panel DOM ──
  function buildPanel() {
    panelEl = document.createElement('div');
    panelEl.id = 'aiPanel';
    panelEl.className = 'ai-panel';
    panelEl.innerHTML =
      '<div class="ai-panel-header">' +
        '<span class="ai-panel-title">🤖 AI Sprite Editor</span>' +
        '<div class="ai-panel-header-btns">' +
          '<button id="aiClearBtn" class="ai-small-btn" title="Clear chat">🗑</button>' +
          '<button id="aiCloseBtn" class="ai-small-btn" title="Close">&times;</button>' +
        '</div>' +
      '</div>' +
      '<div class="ai-model-row">' +
        '<select id="aiModelSelect"></select>' +
        '<span id="aiStatus" class="ai-status"></span>' +
      '</div>' +
      '<div class="ai-chat-log" id="aiChatLog"></div>' +
      '<div class="ai-input-row">' +
        '<textarea id="aiChatInput" placeholder="Describe edits, ask about the sprite..." rows="2"></textarea>' +
        '<button id="aiSendBtn" class="ai-send-btn">▶</button>' +
      '</div>' +
      '<div class="ai-quick-actions">' +
        '<button class="ai-quick-btn" data-prompt="Analyze this sprite and describe what you see.">Analyze</button>' +
        '<button class="ai-quick-btn" data-prompt="What issues do you see with this sprite? Any missing frames or bad transparency?">Find Issues</button>' +
        '<button class="ai-quick-btn" data-prompt="Suggest color palette changes to make this sprite look more epic.">Color Suggest</button>' +
        '<button class="ai-quick-btn" data-prompt="Generate a matching idle animation sprite for this character in pixel art style.">Generate Idle</button>' +
      '</div>';

    document.body.appendChild(panelEl);

    chatLog = document.getElementById('aiChatLog');
    chatInput = document.getElementById('aiChatInput');
    sendBtn = document.getElementById('aiSendBtn');
    modelSelect = document.getElementById('aiModelSelect');
    statusEl = document.getElementById('aiStatus');

    // Populate model select
    MODELS.forEach(function (m) {
      var opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.label;
      if (m.id === currentModel) opt.selected = true;
      modelSelect.appendChild(opt);
    });

    // Events
    modelSelect.addEventListener('change', function () { currentModel = this.value; });
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    document.getElementById('aiCloseBtn').addEventListener('click', togglePanel);
    document.getElementById('aiClearBtn').addEventListener('click', clearChat);

    // Quick action buttons
    panelEl.querySelectorAll('.ai-quick-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        chatInput.value = this.dataset.prompt;
        sendMessage();
      });
    });
  }

  // ── Toggle Button ──
  function buildToggle() {
    var btn = document.createElement('button');
    btn.id = 'aiToggleBtn';
    btn.className = 'ai-toggle-btn';
    btn.innerHTML = '🤖';
    btn.title = 'AI Sprite Editor';
    btn.addEventListener('click', togglePanel);
    document.body.appendChild(btn);
  }

  function togglePanel() {
    isOpen = !isOpen;
    panelEl.classList.toggle('open', isOpen);
    document.getElementById('aiToggleBtn').classList.toggle('active', isOpen);
    if (isOpen) chatInput.focus();
  }

  // ── Chat Logic ──
  function clearChat() {
    messages = [];
    chatLog.innerHTML = '';
    addSystemBubble('Chat cleared. Open a sprite in the viewer and ask me anything!');
  }

  function addBubble(role, content, isHtml) {
    var div = document.createElement('div');
    div.className = 'ai-msg ai-msg-' + role;
    if (isHtml) div.innerHTML = content;
    else div.textContent = content;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
    return div;
  }

  function addSystemBubble(text) {
    addBubble('system', text);
  }

  function addImageBubble(src) {
    var div = document.createElement('div');
    div.className = 'ai-msg ai-msg-image';
    var img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '100%';
    img.style.borderRadius = '8px';
    img.style.imageRendering = 'pixelated';
    div.appendChild(img);
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function getCanvasDataUrl() {
    // Try modal canvas first, then fall back to any visible sprite canvas
    var cv = document.getElementById('mCv');
    if (cv && cv.width > 1 && document.getElementById('modalOverlay').classList.contains('active')) {
      return cv.toDataURL('image/png');
    }
    return null;
  }

  function getSpriteContext() {
    // Build context string about the currently viewed sprite
    var info = '';
    var modal = document.getElementById('modalOverlay');
    if (modal && modal.classList.contains('active')) {
      var title = document.querySelector('.modal-title');
      var meta = document.querySelector('.modal-body .char-meta, .modal .char-meta');
      var path = document.getElementById('mPath');
      if (title) info += 'Sprite: ' + title.textContent + '\n';
      if (path) info += 'Path: ' + path.textContent + '\n';
      var infoItems = document.querySelectorAll('.modal-info-item');
      infoItems.forEach(function (item) {
        var label = item.querySelector('.modal-info-label');
        var value = item.querySelector('.modal-info-value');
        if (label && value) info += label.textContent + ': ' + value.textContent + '\n';
      });
    }
    return info;
  }

  async function sendMessage() {
    var text = chatInput.value.trim();
    if (!text || isStreaming) return;
    chatInput.value = '';

    addBubble('user', text);

    // Get sprite context
    var spriteCtx = getSpriteContext();
    var imageUrl = getCanvasDataUrl();
    var hasVision = VISION_MODELS.indexOf(currentModel) !== -1;

    // Build messages array
    if (messages.length === 0) {
      messages.push({ role: 'system', content: SYSTEM_PROMPT });
    }

    // Build user message content
    var userContent;
    if (imageUrl && hasVision) {
      // Multimodal: text + image
      var contextPrefix = spriteCtx ? '[Current sprite context]\n' + spriteCtx + '\n' : '';
      userContent = [
        { type: 'text', text: contextPrefix + text },
        { type: 'image_url', image_url: { url: imageUrl } }
      ];
    } else {
      var contextPrefix = spriteCtx ? '[Current sprite context]\n' + spriteCtx + '\n' : '';
      userContent = contextPrefix + text;
    }

    messages.push({ role: 'user', content: typeof userContent === 'string' ? userContent : text });

    isStreaming = true;
    sendBtn.disabled = true;
    statusEl.textContent = '● Thinking...';
    statusEl.className = 'ai-status ai-status-active';

    var responseBubble = addBubble('assistant', '');
    var fullResponse = '';

    try {
      // Prepare chat call
      var chatOpts = { model: currentModel, stream: true };

      var response;
      if (imageUrl && hasVision) {
        // Vision call with image
        response = await puter.ai.chat(text, imageUrl, chatOpts);
      } else {
        // Text-only call with message history
        response = await puter.ai.chat(messages, chatOpts);
      }

      // Handle streaming
      if (response && typeof response[Symbol.asyncIterator] === 'function') {
        for await (var part of response) {
          var chunk = part?.text || part?.message?.content || '';
          if (typeof chunk === 'string') {
            fullResponse += chunk;
            responseBubble.innerHTML = formatMarkdown(fullResponse);
            chatLog.scrollTop = chatLog.scrollHeight;
          }
        }
      } else {
        // Non-streaming response
        fullResponse = response?.message?.content?.[0]?.text || response?.message?.content || response || '';
        if (typeof fullResponse !== 'string') fullResponse = JSON.stringify(fullResponse);
        responseBubble.innerHTML = formatMarkdown(fullResponse);
      }

      messages.push({ role: 'assistant', content: fullResponse });

      // Parse and execute commands from response
      parseAndExecuteCommands(fullResponse);

    } catch (err) {
      fullResponse = '⚠ Error: ' + (err.message || err);
      responseBubble.textContent = fullResponse;
      responseBubble.classList.add('ai-msg-error');
    }

    isStreaming = false;
    sendBtn.disabled = false;
    statusEl.textContent = '● Ready';
    statusEl.className = 'ai-status ai-status-ready';
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // ── Command Parser ──
  function parseAndExecuteCommands(text) {
    // Extract JSON blocks from ```json ... ``` fences
    var jsonBlocks = text.match(/```json\s*([\s\S]*?)```/g);
    if (!jsonBlocks) return;

    jsonBlocks.forEach(function (block) {
      var jsonStr = block.replace(/```json\s*/, '').replace(/```/, '').trim();
      try {
        var cmd = JSON.parse(jsonStr);
        var cmds = Array.isArray(cmd) ? cmd : [cmd];
        cmds.forEach(executeCommand);
      } catch (e) {
        // Not valid JSON, ignore
      }
    });
  }

  function executeCommand(cmd) {
    if (!cmd || !cmd.action) return;
    var action = cmd.action.toLowerCase();

    switch (action) {
      case 'hue':
        var hueSlider = document.getElementById('mHue');
        if (hueSlider) {
          hueSlider.value = cmd.value;
          hueSlider.dispatchEvent(new Event('input'));
          addSystemBubble('✅ Applied hue shift: ' + cmd.value + '°');
        }
        break;

      case 'saturation':
        var satSlider = document.getElementById('mSat');
        if (satSlider) {
          satSlider.value = cmd.value;
          satSlider.dispatchEvent(new Event('input'));
          addSystemBubble('✅ Applied saturation: ' + cmd.value + '%');
        }
        break;

      case 'brightness':
        var brightSlider = document.getElementById('mBright');
        if (brightSlider) {
          brightSlider.value = cmd.value;
          brightSlider.dispatchEvent(new Event('input'));
          addSystemBubble('✅ Applied brightness: ' + cmd.value + '%');
        }
        break;

      case 'flip':
        var flipBtn = document.getElementById('mFlipBtn');
        if (flipBtn) {
          flipBtn.click();
          addSystemBubble('✅ Flipped horizontally');
        }
        break;

      case 'trim':
        var trimBtn = document.getElementById('mTrimBtn');
        if (trimBtn) {
          trimBtn.click();
          addSystemBubble('✅ Auto-trimmed');
        }
        break;

      case 'export':
        var exportBtn = document.getElementById('mExportBtn');
        if (exportBtn) {
          exportBtn.click();
          addSystemBubble('✅ Exported current frame');
        }
        break;

      case 'exportall':
        var exportAllBtn = document.getElementById('mExportAllBtn');
        if (exportAllBtn) {
          exportAllBtn.click();
          addSystemBubble('✅ Exporting all frames...');
        }
        break;

      case 'generate':
        generateSprite(cmd.prompt || 'pixel art game sprite');
        break;

      default:
        addSystemBubble('⚠ Unknown command: ' + action);
    }
  }

  // ── Sprite Generation ──
  async function generateSprite(prompt) {
    addSystemBubble('🎨 Generating sprite: "' + prompt + '"...');
    statusEl.textContent = '● Generating image...';
    statusEl.className = 'ai-status ai-status-active';

    try {
      var fullPrompt = prompt + ', pixel art sprite sheet, transparent background, game asset, centered, 128x128';
      var imageEl = await puter.ai.txt2img({
        prompt: fullPrompt,
        model: 'gpt-image-1.5',
        provider: 'openai'
      });

      if (imageEl && imageEl.src) {
        addImageBubble(imageEl.src);
        addSystemBubble('✅ Sprite generated! Right-click to save.');

        // Also offer to download
        var link = document.createElement('a');
        link.href = imageEl.src;
        link.download = 'generated-sprite.png';
        var dlBtn = document.createElement('button');
        dlBtn.className = 'ai-quick-btn';
        dlBtn.textContent = '💾 Download';
        dlBtn.addEventListener('click', function () { link.click(); });
        chatLog.appendChild(dlBtn);
        chatLog.scrollTop = chatLog.scrollHeight;
      }
    } catch (err) {
      addSystemBubble('⚠ Generation failed: ' + (err.message || err));
    }

    statusEl.textContent = '● Ready';
    statusEl.className = 'ai-status ai-status-ready';
  }

  // ── Simple markdown formatter ──
  function formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/```json\s*([\s\S]*?)```/g, '<pre class="ai-code-block">$1</pre>')
      .replace(/```(\w*)\s*([\s\S]*?)```/g, '<pre class="ai-code-block">$2</pre>')
      .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  // ── Save/Load chat from Puter KV ──
  async function saveChatHistory() {
    try {
      if (typeof puter !== 'undefined' && puter.kv) {
        await puter.kv.set('sprite-ai-chat', JSON.stringify(messages.slice(-50)));
      }
    } catch (e) { /* silent */ }
  }

  async function loadChatHistory() {
    try {
      if (typeof puter !== 'undefined' && puter.kv) {
        var data = await puter.kv.get('sprite-ai-chat');
        if (data) {
          messages = JSON.parse(data);
          messages.forEach(function (m) {
            if (m.role === 'user') addBubble('user', m.content);
            else if (m.role === 'assistant') addBubble('assistant', m.content, true);
          });
        }
      }
    } catch (e) { /* silent */ }
  }

  // ── Public API (used by 2D_MODELS.html) ──
  window.SpriteAI = {
    toggle: togglePanel,
    isOpen: function () { return isOpen; },
    sendPrompt: function (prompt) {
      if (!isOpen) togglePanel();
      chatInput.value = prompt;
      sendMessage();
    },
    getPanel: function () { return panelEl; }
  };

  // ── Init ──
  function init() {
    buildPanel();
    buildToggle();
    addSystemBubble('Welcome to the AI Sprite Editor! Open a sprite and I can analyze, edit, or generate new sprites for you.');
    statusEl.textContent = '● Ready';
    statusEl.className = 'ai-status ai-status-ready';

    // Auto-save chat periodically
    setInterval(saveChatHistory, 30000);

    // Try to load previous chat
    if (typeof puter !== 'undefined') {
      loadChatHistory();
    }
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
