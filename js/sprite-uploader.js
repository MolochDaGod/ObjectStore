/**
 * Grudge Studio — Sprite Uploader & Parser
 * Handles upload of sprite sheets (PNG/WEBP), GIFs, individual PNGs,
 * and Aseprite JSON atlas exports. Includes AI-assisted layout detection.
 */
(function () {
  'use strict';

  var uploadModal, dropZone, previewArea, settingsArea, parsedFrames, pendingFile;
  var parseState = {
    image: null,
    cols: 1,
    rows: 1,
    frameW: 0,
    frameH: 0,
    frameCount: 0,
    layout: 'horizontal',
    name: '',
    category: 'characters',
    frames: [],       // Array of {canvas, dataUrl}
    gifFrames: null,   // Raw GIF frame data
    asepriteData: null // Aseprite JSON atlas
  };

  var CATEGORIES = [
    'characters', 'enemies', 'monsters', 'bosses', 'effects',
    'fish', 'npcs', 'projectiles', 'ui', 'backgrounds', 'icons', 'images'
  ];

  // ── Build Upload Modal ──
  function buildUploadModal() {
    uploadModal = document.createElement('div');
    uploadModal.id = 'uploadModal';
    uploadModal.className = 'upload-modal-overlay';
    uploadModal.innerHTML =
      '<div class="upload-modal">' +
        '<div class="upload-modal-header">' +
          '<h2>📤 Upload & Parse Sprites</h2>' +
          '<button id="uploadCloseBtn" class="modal-close">&times;</button>' +
        '</div>' +
        '<div class="upload-body">' +
          // Drop zone
          '<div id="uploadDropZone" class="upload-drop-zone">' +
            '<div class="upload-drop-icon">📁</div>' +
            '<p class="upload-drop-text">Drag & drop sprite sheets, GIFs, or PNGs here</p>' +
            '<p class="upload-drop-sub">Supports: PNG, WEBP, GIF, Aseprite JSON+PNG</p>' +
            '<input type="file" id="uploadFileInput" multiple accept="image/*,.json" style="display:none;">' +
            '<button id="uploadBrowseBtn" class="filter-btn" style="margin-top:12px;">Browse Files</button>' +
          '</div>' +
          // Preview area
          '<div id="uploadPreview" class="upload-preview" style="display:none;">' +
            '<div class="upload-preview-header">' +
              '<h3 id="uploadFileName">filename.png</h3>' +
              '<span id="uploadFileInfo" class="upload-file-info"></span>' +
            '</div>' +
            '<div class="upload-preview-canvas-wrap">' +
              '<canvas id="uploadPreviewCanvas" width="512" height="512"></canvas>' +
            '</div>' +
            '<div id="uploadFrameStrip" class="upload-frame-strip"></div>' +
          '</div>' +
          // Settings area
          '<div id="uploadSettings" class="upload-settings" style="display:none;">' +
            '<h3>Parse Settings</h3>' +
            '<div class="upload-settings-grid">' +
              '<label>Name <input type="text" id="upName" placeholder="sprite-name"></label>' +
              '<label>Category <select id="upCategory"></select></label>' +
              '<label>Layout <select id="upLayout">' +
                '<option value="horizontal">Horizontal Strip</option>' +
                '<option value="vertical">Vertical Strip</option>' +
                '<option value="grid">Grid</option>' +
                '<option value="frame-sequence">Individual Frames</option>' +
              '</select></label>' +
              '<label>Columns <input type="number" id="upCols" min="1" value="1"></label>' +
              '<label>Rows <input type="number" id="upRows" min="1" value="1"></label>' +
              '<label>Frame W <input type="number" id="upFrameW" min="1" value="128"></label>' +
              '<label>Frame H <input type="number" id="upFrameH" min="1" value="128"></label>' +
              '<label>Frame Count <input type="number" id="upFrameCount" min="1" value="1"></label>' +
            '</div>' +
            '<div class="upload-settings-actions">' +
              '<button id="upAiDetect" class="filter-btn" style="background:var(--tier-4);color:#000;">🤖 AI Detect Layout</button>' +
              '<button id="upAutoDetect" class="filter-btn">⚙ Auto-Detect</button>' +
              '<button id="upReparse" class="filter-btn">🔄 Re-Parse</button>' +
              '<button id="upSave" class="filter-btn" style="background:var(--tier-4);color:#000;">💾 Save to Browser</button>' +
              '<button id="upSavePuter" class="filter-btn">☁ Save to Puter Cloud</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(uploadModal);

    // Populate category select
    var catSelect = document.getElementById('upCategory');
    CATEGORIES.forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c.charAt(0).toUpperCase() + c.slice(1);
      catSelect.appendChild(opt);
    });

    // Events
    document.getElementById('uploadCloseBtn').addEventListener('click', closeUpload);
    uploadModal.addEventListener('click', function (e) { if (e.target === uploadModal) closeUpload(); });

    dropZone = document.getElementById('uploadDropZone');
    var fileInput = document.getElementById('uploadFileInput');

    document.getElementById('uploadBrowseBtn').addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () { handleFiles(this.files); });

    // Drag & drop
    dropZone.addEventListener('dragover', function (e) { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', function () { dropZone.classList.remove('dragover'); });
    dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      handleFiles(e.dataTransfer.files);
    });

    // Settings controls
    document.getElementById('upAutoDetect').addEventListener('click', autoDetectLayout);
    document.getElementById('upAiDetect').addEventListener('click', aiDetectLayout);
    document.getElementById('upReparse').addEventListener('click', reparseFrames);
    document.getElementById('upSave').addEventListener('click', saveToLocalBrowser);
    document.getElementById('upSavePuter').addEventListener('click', saveToPuterCloud);

    ['upCols', 'upRows', 'upFrameW', 'upFrameH', 'upFrameCount', 'upLayout'].forEach(function (id) {
      document.getElementById(id).addEventListener('change', function () {
        syncSettingsToState();
        reparseFrames();
      });
    });
  }

  // ── Upload Button ──
  function buildUploadButton() {
    var btn = document.createElement('button');
    btn.id = 'uploadToggleBtn';
    btn.className = 'filter-btn';
    btn.innerHTML = '📤 Upload Sprites';
    btn.style.fontSize = '0.7rem';
    btn.addEventListener('click', openUpload);

    // Insert into the tools row
    var toolsRow = document.querySelector('.controls .filter-row:last-child');
    if (toolsRow) {
      toolsRow.appendChild(btn);
    }
  }

  function openUpload() {
    uploadModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeUpload() {
    uploadModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ── File Handling ──
  function handleFiles(fileList) {
    if (!fileList || !fileList.length) return;

    var files = Array.from(fileList);
    var imageFiles = files.filter(function (f) { return f.type.startsWith('image/'); });
    var jsonFiles = files.filter(function (f) { return f.name.endsWith('.json'); });

    // Check for Aseprite JSON atlas
    if (jsonFiles.length > 0 && imageFiles.length > 0) {
      handleAsepriteAtlas(jsonFiles[0], imageFiles[0]);
      return;
    }

    // Single GIF
    if (imageFiles.length === 1 && imageFiles[0].type === 'image/gif') {
      handleGif(imageFiles[0]);
      return;
    }

    // Multiple individual PNGs = frame sequence
    if (imageFiles.length > 1) {
      handleFrameSequence(imageFiles);
      return;
    }

    // Single sprite sheet
    if (imageFiles.length === 1) {
      handleSpriteSheet(imageFiles[0]);
      return;
    }
  }

  // ── Sprite Sheet ──
  function handleSpriteSheet(file) {
    pendingFile = file;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        parseState.image = img;
        parseState.name = file.name.replace(/\.\w+$/, '').replace(/[-_]/g, ' ');

        document.getElementById('uploadFileName').textContent = file.name;
        document.getElementById('uploadFileInfo').textContent = img.naturalWidth + 'x' + img.naturalHeight + ' | ' + formatSize(file.size);

        autoDetectLayout();
        showPreview();
        showSettings();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ── Auto-detect layout by analyzing image ──
  function autoDetectLayout() {
    var img = parseState.image;
    if (!img) return;

    var w = img.naturalWidth;
    var h = img.naturalHeight;

    // Try to detect frame boundaries by looking for transparent/uniform columns
    var tc = document.createElement('canvas');
    tc.width = w;
    tc.height = h;
    var tctx = tc.getContext('2d');
    tctx.drawImage(img, 0, 0);
    var data = tctx.getImageData(0, 0, w, h).data;

    // Find vertical separators (transparent columns)
    var vSeps = findSeparators(data, w, h, 'vertical');
    // Find horizontal separators
    var hSeps = findSeparators(data, w, h, 'horizontal');

    var cols, rows, fw, fh;

    if (vSeps.length > 0 && hSeps.length > 0) {
      // Grid layout
      cols = vSeps.length + 1;
      rows = hSeps.length + 1;
      fw = Math.round(w / cols);
      fh = Math.round(h / rows);
      parseState.layout = 'grid';
    } else if (vSeps.length > 0) {
      // Horizontal strip
      cols = vSeps.length + 1;
      rows = 1;
      fw = Math.round(w / cols);
      fh = h;
      parseState.layout = 'horizontal';
    } else if (hSeps.length > 0) {
      // Vertical strip
      cols = 1;
      rows = hSeps.length + 1;
      fw = w;
      fh = Math.round(h / rows);
      parseState.layout = 'vertical';
    } else {
      // Try common square frame detection
      if (w === h) {
        cols = 1; rows = 1; fw = w; fh = h;
        parseState.layout = 'horizontal';
      } else if (w > h) {
        // Guess horizontal strip with square frames
        fw = h;
        fh = h;
        cols = Math.max(1, Math.round(w / fw));
        rows = 1;
        parseState.layout = 'horizontal';
      } else {
        // Guess vertical strip with square frames
        fw = w;
        fh = w;
        cols = 1;
        rows = Math.max(1, Math.round(h / fh));
        parseState.layout = 'vertical';
      }
    }

    parseState.cols = cols;
    parseState.rows = rows;
    parseState.frameW = fw;
    parseState.frameH = fh;
    parseState.frameCount = cols * rows;

    syncStateToSettings();
    reparseFrames();
  }

  // Find transparent column/row separators in image data
  function findSeparators(data, w, h, direction) {
    var seps = [];
    var threshold = 0.9; // 90% transparent pixels = separator
    var minGap = 16;     // Minimum frame size

    if (direction === 'vertical') {
      // Check each column
      for (var x = minGap; x < w - minGap; x++) {
        var transparent = 0;
        for (var y = 0; y < h; y++) {
          var idx = (y * w + x) * 4;
          if (data[idx + 3] < 10) transparent++;
        }
        if (transparent / h > threshold) {
          // Check if this is far enough from last separator
          if (seps.length === 0 || x - seps[seps.length - 1] > minGap) {
            seps.push(x);
          }
        }
      }
    } else {
      // Check each row
      for (var y = minGap; y < h - minGap; y++) {
        var transparent = 0;
        for (var x = 0; x < w; x++) {
          var idx = (y * w + x) * 4;
          if (data[idx + 3] < 10) transparent++;
        }
        if (transparent / w > threshold) {
          if (seps.length === 0 || y - seps[seps.length - 1] > minGap) {
            seps.push(y);
          }
        }
      }
    }

    return seps;
  }

  // ── GIF Parser (in-browser, no library) ──
  function handleGif(file) {
    pendingFile = file;
    parseState.name = file.name.replace(/\.gif$/i, '').replace(/[-_]/g, ' ');

    document.getElementById('uploadFileName').textContent = file.name;
    document.getElementById('uploadFileInfo').textContent = 'GIF | ' + formatSize(file.size);

    var reader = new FileReader();
    reader.onload = function (e) {
      decodeGifFrames(e.target.result).then(function (frames) {
        if (!frames || frames.length === 0) {
          alert('Failed to parse GIF frames.');
          return;
        }

        parseState.frames = frames;
        parseState.frameCount = frames.length;
        parseState.layout = 'frame-sequence';

        if (frames.length > 0) {
          parseState.frameW = frames[0].canvas.width;
          parseState.frameH = frames[0].canvas.height;
        }

        parseState.cols = frames.length;
        parseState.rows = 1;

        // Create a composite image for preview
        var totalW = parseState.frameW * frames.length;
        var compCanvas = document.createElement('canvas');
        compCanvas.width = totalW;
        compCanvas.height = parseState.frameH;
        var compCtx = compCanvas.getContext('2d');
        frames.forEach(function (f, i) {
          compCtx.drawImage(f.canvas, i * parseState.frameW, 0);
        });
        var compImg = new Image();
        compImg.onload = function () {
          parseState.image = compImg;
          syncStateToSettings();
          showPreview();
          showSettings();
          renderFrameStrip();
        };
        compImg.src = compCanvas.toDataURL();
      });
    };
    reader.readAsArrayBuffer(file);
  }

  // Basic GIF frame decoder using canvas + Image element
  // For full GIF decoding we render each frame via an img tag and capture
  async function decodeGifFrames(arrayBuffer) {
    return new Promise(function (resolve) {
      var blob = new Blob([arrayBuffer], { type: 'image/gif' });
      var url = URL.createObjectURL(blob);

      var img = document.createElement('img');
      img.src = url;

      img.onload = function () {
        var w = img.naturalWidth;
        var h = img.naturalHeight;

        // Use requestAnimationFrame-based approach to capture GIF frames
        // Simplified: extract what we can with a single frame capture
        // For full frame extraction we need the Web Animations API or a decoder
        var frames = [];

        // Single frame capture (GIF will show first frame)
        var cv = document.createElement('canvas');
        cv.width = w;
        cv.height = h;
        var ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0);

        frames.push({
          canvas: cv,
          dataUrl: cv.toDataURL('image/png')
        });

        // Try to detect if it's an animated GIF by checking file size vs dimensions
        // For proper multi-frame extraction, use the ImageDecoder API if available
        if (typeof ImageDecoder !== 'undefined') {
          decodeGifWithImageDecoder(arrayBuffer, w, h).then(function (decodedFrames) {
            URL.revokeObjectURL(url);
            resolve(decodedFrames.length > 0 ? decodedFrames : frames);
          }).catch(function () {
            URL.revokeObjectURL(url);
            resolve(frames);
          });
        } else {
          URL.revokeObjectURL(url);
          resolve(frames);
        }
      };

      img.onerror = function () {
        URL.revokeObjectURL(url);
        resolve([]);
      };
    });
  }

  // Use WebCodecs ImageDecoder for proper GIF frame extraction
  async function decodeGifWithImageDecoder(arrayBuffer, w, h) {
    var frames = [];
    try {
      var decoder = new ImageDecoder({
        type: 'image/gif',
        data: arrayBuffer
      });

      await decoder.completed;
      var count = decoder.tracks.selectedTrack.frameCount;

      for (var i = 0; i < count; i++) {
        var result = await decoder.decode({ frameIndex: i });
        var vf = result.image;

        var cv = document.createElement('canvas');
        cv.width = vf.displayWidth;
        cv.height = vf.displayHeight;
        var ctx = cv.getContext('2d');
        ctx.drawImage(vf, 0, 0);
        vf.close();

        frames.push({
          canvas: cv,
          dataUrl: cv.toDataURL('image/png')
        });
      }

      decoder.close();
    } catch (e) {
      console.warn('ImageDecoder GIF extraction failed:', e);
    }
    return frames;
  }

  // ── Frame Sequence (multiple PNGs) ──
  function handleFrameSequence(files) {
    // Sort by filename
    var sorted = Array.from(files).sort(function (a, b) { return a.name.localeCompare(b.name, undefined, { numeric: true }); });

    parseState.name = sorted[0].name.replace(/[-_]?\d+\.\w+$/, '').replace(/[-_]/g, ' ') || 'sprite';
    parseState.layout = 'frame-sequence';

    document.getElementById('uploadFileName').textContent = sorted.length + ' files';
    document.getElementById('uploadFileInfo').textContent = 'Frame sequence | ' + sorted.length + ' frames';

    var loaded = 0;
    var frames = new Array(sorted.length);

    sorted.forEach(function (file, idx) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          var cv = document.createElement('canvas');
          cv.width = img.naturalWidth;
          cv.height = img.naturalHeight;
          var ctx = cv.getContext('2d');
          ctx.drawImage(img, 0, 0);
          frames[idx] = { canvas: cv, dataUrl: cv.toDataURL('image/png') };

          loaded++;
          if (loaded === sorted.length) {
            parseState.frames = frames.filter(Boolean);
            parseState.frameCount = parseState.frames.length;
            if (parseState.frames.length > 0) {
              parseState.frameW = parseState.frames[0].canvas.width;
              parseState.frameH = parseState.frames[0].canvas.height;
            }
            parseState.cols = parseState.frameCount;
            parseState.rows = 1;

            // Build composite for preview
            var totalW = parseState.frameW * parseState.frameCount;
            var compCv = document.createElement('canvas');
            compCv.width = totalW;
            compCv.height = parseState.frameH;
            var compCtx = compCv.getContext('2d');
            parseState.frames.forEach(function (f, i) {
              compCtx.drawImage(f.canvas, i * parseState.frameW, 0);
            });
            var compImg = new Image();
            compImg.onload = function () {
              parseState.image = compImg;
              syncStateToSettings();
              showPreview();
              showSettings();
              renderFrameStrip();
            };
            compImg.src = compCv.toDataURL();
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // ── Aseprite JSON Atlas ──
  function handleAsepriteAtlas(jsonFile, imageFile) {
    var jsonReader = new FileReader();
    jsonReader.onload = function (je) {
      try {
        var atlas = JSON.parse(je.target.result);
        parseState.asepriteData = atlas;

        var imgReader = new FileReader();
        imgReader.onload = function (ie) {
          var img = new Image();
          img.onload = function () {
            parseState.image = img;
            parseState.name = jsonFile.name.replace('.json', '').replace(/[-_]/g, ' ');

            document.getElementById('uploadFileName').textContent = jsonFile.name + ' + ' + imageFile.name;
            document.getElementById('uploadFileInfo').textContent = 'Aseprite Atlas | ' + img.naturalWidth + 'x' + img.naturalHeight;

            // Parse Aseprite frames
            parseAsepriteFrames(atlas, img);
            syncStateToSettings();
            showPreview();
            showSettings();
            renderFrameStrip();
          };
          img.src = ie.target.result;
        };
        imgReader.readAsDataURL(imageFile);
      } catch (e) {
        alert('Invalid Aseprite JSON: ' + e.message);
      }
    };
    jsonReader.readAsText(jsonFile);
  }

  function parseAsepriteFrames(atlas, img) {
    var frameData = atlas.frames;
    var frames = [];

    // Aseprite can have frames as object or array
    var frameList = Array.isArray(frameData)
      ? frameData
      : Object.keys(frameData).map(function (k) { return Object.assign({ filename: k }, frameData[k]); });

    frameList.forEach(function (f) {
      var rect = f.frame || f;
      var cv = document.createElement('canvas');
      cv.width = rect.w;
      cv.height = rect.h;
      var ctx = cv.getContext('2d');
      ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
      frames.push({ canvas: cv, dataUrl: cv.toDataURL('image/png') });
    });

    parseState.frames = frames;
    parseState.frameCount = frames.length;
    parseState.layout = 'frame-sequence';
    if (frames.length > 0) {
      parseState.frameW = frames[0].canvas.width;
      parseState.frameH = frames[0].canvas.height;
    }
    parseState.cols = frames.length;
    parseState.rows = 1;
  }

  // ── Re-parse with current settings ──
  function reparseFrames() {
    syncSettingsToState();

    if (parseState.layout === 'frame-sequence' && parseState.frames.length > 0) {
      renderFrameStrip();
      drawPreview();
      return;
    }

    if (!parseState.image) return;

    var img = parseState.image;
    var frames = [];

    for (var r = 0; r < parseState.rows; r++) {
      for (var c = 0; c < parseState.cols; c++) {
        if (frames.length >= parseState.frameCount) break;
        var cv = document.createElement('canvas');
        cv.width = parseState.frameW;
        cv.height = parseState.frameH;
        var ctx = cv.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        var sx = c * parseState.frameW;
        var sy = r * parseState.frameH;
        ctx.drawImage(img, sx, sy, parseState.frameW, parseState.frameH, 0, 0, parseState.frameW, parseState.frameH);
        frames.push({ canvas: cv, dataUrl: cv.toDataURL('image/png') });
      }
    }

    parseState.frames = frames;
    renderFrameStrip();
    drawPreview();
  }

  // ── AI Layout Detection ──
  async function aiDetectLayout() {
    if (!parseState.image) { alert('Upload an image first.'); return; }

    var aiBtn = document.getElementById('upAiDetect');
    aiBtn.textContent = '🤖 Detecting...';
    aiBtn.disabled = true;

    try {
      // Create a small thumbnail for AI analysis
      var thumbCv = document.createElement('canvas');
      var maxSize = 512;
      var scale = Math.min(maxSize / parseState.image.naturalWidth, maxSize / parseState.image.naturalHeight, 1);
      thumbCv.width = Math.round(parseState.image.naturalWidth * scale);
      thumbCv.height = Math.round(parseState.image.naturalHeight * scale);
      var thumbCtx = thumbCv.getContext('2d');
      thumbCtx.drawImage(parseState.image, 0, 0, thumbCv.width, thumbCv.height);
      var thumbUrl = thumbCv.toDataURL('image/png');

      var prompt = 'This is a game sprite sheet image (' + parseState.image.naturalWidth + 'x' + parseState.image.naturalHeight + ' pixels). ' +
        'Analyze it and respond ONLY with a JSON object containing: ' +
        '{"cols": NUMBER, "rows": NUMBER, "frameW": NUMBER, "frameH": NUMBER, "layout": "horizontal"|"vertical"|"grid", ' +
        '"characterType": "STRING", "animationType": "STRING", "frameCount": NUMBER}. ' +
        'Look at the frames in the sheet, count columns and rows of sprite frames, and calculate frame dimensions.';

      var response = await puter.ai.chat(prompt, thumbUrl, { model: 'gpt-4o' });
      var text = response?.message?.content?.[0]?.text || response?.message?.content || response || '';
      if (typeof text !== 'string') text = JSON.stringify(text);

      // Extract JSON from response
      var jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        var detected = JSON.parse(jsonMatch[0]);
        if (detected.cols) parseState.cols = detected.cols;
        if (detected.rows) parseState.rows = detected.rows;
        if (detected.frameW) parseState.frameW = detected.frameW;
        if (detected.frameH) parseState.frameH = detected.frameH;
        if (detected.layout) parseState.layout = detected.layout;
        if (detected.frameCount) parseState.frameCount = detected.frameCount;
        if (detected.characterType) parseState.name = detected.characterType;

        syncStateToSettings();
        reparseFrames();

        // Show AI feedback
        if (window.SpriteAI) {
          window.SpriteAI.sendPrompt('AI detected layout: ' + JSON.stringify(detected));
        }
      }
    } catch (err) {
      alert('AI detection failed: ' + (err.message || err));
    }

    aiBtn.textContent = '🤖 AI Detect Layout';
    aiBtn.disabled = false;
  }

  // ── UI Helpers ──
  function showPreview() {
    document.getElementById('uploadPreview').style.display = 'block';
    drawPreview();
  }

  function showSettings() {
    document.getElementById('uploadSettings').style.display = 'block';
  }

  function drawPreview() {
    var cv = document.getElementById('uploadPreviewCanvas');
    var ctx = cv.getContext('2d');
    var img = parseState.image;
    if (!img) return;

    // Scale to fit
    var maxW = 512, maxH = 400;
    var scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 2);
    cv.width = Math.round(img.naturalWidth * scale);
    cv.height = Math.round(img.naturalHeight * scale);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, cv.width, cv.height);

    // Draw grid overlay
    ctx.strokeStyle = 'rgba(212,168,75,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    var fw = parseState.frameW * scale;
    var fh = parseState.frameH * scale;

    for (var c = 1; c < parseState.cols; c++) {
      var x = c * fw;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cv.height); ctx.stroke();
    }
    for (var r = 1; r < parseState.rows; r++) {
      var y = r * fh;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cv.width, y); ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  function renderFrameStrip() {
    var strip = document.getElementById('uploadFrameStrip');
    strip.innerHTML = '';

    parseState.frames.forEach(function (f, i) {
      var wrap = document.createElement('div');
      wrap.className = 'upload-frame-thumb';
      var cv = document.createElement('canvas');
      cv.width = 64;
      cv.height = 64;
      var ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      var scale = Math.min(64 / f.canvas.width, 64 / f.canvas.height);
      var dw = f.canvas.width * scale;
      var dh = f.canvas.height * scale;
      ctx.drawImage(f.canvas, (64 - dw) / 2, (64 - dh) / 2, dw, dh);
      wrap.appendChild(cv);

      var label = document.createElement('span');
      label.textContent = '#' + i;
      wrap.appendChild(label);

      strip.appendChild(wrap);
    });
  }

  function syncStateToSettings() {
    document.getElementById('upName').value = parseState.name;
    document.getElementById('upCols').value = parseState.cols;
    document.getElementById('upRows').value = parseState.rows;
    document.getElementById('upFrameW').value = parseState.frameW;
    document.getElementById('upFrameH').value = parseState.frameH;
    document.getElementById('upFrameCount').value = parseState.frameCount;
    document.getElementById('upLayout').value = parseState.layout;
  }

  function syncSettingsToState() {
    parseState.name = document.getElementById('upName').value || 'sprite';
    parseState.category = document.getElementById('upCategory').value;
    parseState.cols = parseInt(document.getElementById('upCols').value) || 1;
    parseState.rows = parseInt(document.getElementById('upRows').value) || 1;
    parseState.frameW = parseInt(document.getElementById('upFrameW').value) || 128;
    parseState.frameH = parseInt(document.getElementById('upFrameH').value) || 128;
    parseState.frameCount = parseInt(document.getElementById('upFrameCount').value) || 1;
    parseState.layout = document.getElementById('upLayout').value;
  }

  // ── Save ──
  function saveToLocalBrowser() {
    if (!parseState.image || parseState.frameCount === 0) {
      alert('Nothing to save. Upload and parse a sprite first.');
      return;
    }

    syncSettingsToState();

    // Build sprite-characters.json compatible entry
    var uuid = 'custom-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    var entry = {
      uuid: uuid,
      name: parseState.name.replace(/\s+/g, '-').toLowerCase(),
      displayName: parseState.name,
      category: parseState.category,
      source: 'custom-upload',
      animationCount: 1,
      animations: [{
        uuid: uuid + '-anim-0',
        id: parseState.name.replace(/\s+/g, '-').toLowerCase() + '-animation',
        name: 'Default',
        path: '', // Will be filled if saved to cloud
        width: parseState.image.naturalWidth,
        height: parseState.image.naturalHeight,
        frameW: parseState.frameW,
        frameH: parseState.frameH,
        frameCount: parseState.frameCount,
        cols: parseState.cols,
        rows: parseState.rows,
        layout: parseState.layout
      }]
    };

    // Store in localStorage for the browser to pick up
    var stored = [];
    try {
      var existing = localStorage.getItem('grudge-custom-sprites');
      if (existing) stored = JSON.parse(existing);
    } catch (e) {}

    stored.push(entry);
    localStorage.setItem('grudge-custom-sprites', JSON.stringify(stored));

    // Store the image data too
    if (parseState.image.src) {
      try {
        localStorage.setItem('grudge-sprite-img-' + uuid, parseState.image.src);
      } catch (e) {
        console.warn('Image too large for localStorage');
      }
    }

    alert('Sprite saved to browser! Refresh to see it in the gallery.');
    closeUpload();
  }

  async function saveToPuterCloud() {
    if (!parseState.image || parseState.frameCount === 0) {
      alert('Nothing to save. Upload and parse a sprite first.');
      return;
    }

    if (typeof puter === 'undefined') {
      alert('Puter.js is not loaded. Cannot save to cloud.');
      return;
    }

    syncSettingsToState();
    var btn = document.getElementById('upSavePuter');
    btn.textContent = '☁ Saving...';
    btn.disabled = true;

    try {
      var dirName = 'grudge-sprites/' + parseState.category;
      var fileName = parseState.name.replace(/\s+/g, '-').toLowerCase() + '.png';

      // Convert image to blob
      var cv = document.createElement('canvas');
      cv.width = parseState.image.naturalWidth;
      cv.height = parseState.image.naturalHeight;
      var ctx = cv.getContext('2d');
      ctx.drawImage(parseState.image, 0, 0);

      var blob = await new Promise(function (res) { cv.toBlob(res, 'image/png'); });
      var arrayBuf = await blob.arrayBuffer();

      // Ensure directory exists
      try { await puter.fs.mkdir(dirName, { createMissingParents: true }); } catch (e) {}

      // Write file
      await puter.fs.write(dirName + '/' + fileName, new Blob([arrayBuf]));

      // Save metadata
      var meta = {
        name: parseState.name,
        category: parseState.category,
        frameW: parseState.frameW,
        frameH: parseState.frameH,
        frameCount: parseState.frameCount,
        cols: parseState.cols,
        rows: parseState.rows,
        layout: parseState.layout,
        savedAt: new Date().toISOString()
      };
      await puter.fs.write(dirName + '/' + fileName.replace('.png', '.json'), JSON.stringify(meta, null, 2));

      alert('Sprite saved to Puter Cloud! Path: ' + dirName + '/' + fileName);
    } catch (err) {
      alert('Cloud save failed: ' + (err.message || err));
    }

    btn.textContent = '☁ Save to Puter Cloud';
    btn.disabled = false;
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  // ── Public API ──
  window.SpriteUploader = {
    open: openUpload,
    close: closeUpload,
    getState: function () { return parseState; }
  };

  // ── Init ──
  function init() {
    buildUploadModal();
    buildUploadButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
