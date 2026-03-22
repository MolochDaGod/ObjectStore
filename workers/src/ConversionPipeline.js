/**
 * ConversionPipeline — Durable Object
 *
 * Coordinates 3D model conversion jobs:
 *  - Dedup via SHA-256 of original file
 *  - WebSocket real-time progress to connected clients
 *  - Stores converted GLB → R2, metadata → D1
 *  - Alarms clean up stale jobs after 10 minutes
 *
 * Routes (called via Worker proxy):
 *   POST /start          — Register a conversion job (dedup check first)
 *   POST /complete       — Receive converted GLB, store to R2 + D1
 *   POST /fail           — Mark job as failed
 *   GET  /status/:jobId  — Poll job status
 *   GET  /websocket      — Upgrade to WebSocket for live progress
 */

export class ConversionPipeline {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    /** @type {Set<WebSocket>} */
    this.sessions = new Set();
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── WebSocket upgrade ────────────────────────────────────────
    if (path === '/websocket') {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return jsonResp({ error: 'Expected WebSocket upgrade' }, 426);
      }
      const pair = new WebSocketPair();
      this._acceptWebSocket(pair[1]);
      return new Response(null, { status: 101, webSocket: pair[0] });
    }

    // ── POST /start ──────────────────────────────────────────────
    if (path === '/start' && request.method === 'POST') {
      return this._handleStart(request);
    }

    // ── POST /complete ───────────────────────────────────────────
    if (path === '/complete' && request.method === 'POST') {
      return this._handleComplete(request);
    }

    // ── POST /fail ───────────────────────────────────────────────
    if (path === '/fail' && request.method === 'POST') {
      return this._handleFail(request);
    }

    // ── GET /status/:jobId ───────────────────────────────────────
    const statusMatch = path.match(/^\/status\/(.+)$/);
    if (statusMatch && request.method === 'GET') {
      return this._handleStatus(statusMatch[1]);
    }

    // ── GET /jobs ────────────────────────────────────────────────
    if (path === '/jobs' && request.method === 'GET') {
      return this._handleListJobs();
    }

    return jsonResp({ error: 'Not found' }, 404);
  }

  // ════════════════════════════════════════════════════════════════
  //  WebSocket Management
  // ════════════════════════════════════════════════════════════════

  _acceptWebSocket(ws) {
    this.state.acceptWebSocket(ws);
    this.sessions.add(ws);
    ws.addEventListener('close', () => this.sessions.delete(ws));
    ws.addEventListener('error', () => this.sessions.delete(ws));
  }

  /** Broadcast a message to all connected WebSocket clients */
  _broadcast(data) {
    const msg = JSON.stringify(data);
    for (const ws of this.sessions) {
      try { ws.send(msg); } catch { this.sessions.delete(ws); }
    }
  }

  // Hibernation support
  async webSocketMessage(ws, message) {
    // Client can send pings or job queries
    try {
      const data = JSON.parse(message);
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', time: Date.now() }));
      } else if (data.type === 'status' && data.jobId) {
        const job = await this.state.storage.get(`job:${data.jobId}`);
        ws.send(JSON.stringify({ type: 'status', job: job || null }));
      }
    } catch { /* ignore malformed messages */ }
  }

  async webSocketClose(ws) {
    this.sessions.delete(ws);
  }

  // ════════════════════════════════════════════════════════════════
  //  Handlers
  // ════════════════════════════════════════════════════════════════

  /**
   * POST /start — Register a new conversion job
   * Body JSON: { sourceHash, sourceName, sourceFormat, sourceSize }
   * Returns: { jobId, status, existingAsset? }
   */
  async _handleStart(request) {
    const { sourceHash, sourceName, sourceFormat, sourceSize } = await request.json();

    if (!sourceHash || !sourceName || !sourceFormat) {
      return jsonResp({ error: 'Missing sourceHash, sourceName, or sourceFormat' }, 400);
    }

    // ── Dedup check: look for an existing completed job with the same hash ──
    const existingJobId = await this.state.storage.get(`hash:${sourceHash}`);
    if (existingJobId) {
      const existingJob = await this.state.storage.get(`job:${existingJobId}`);
      if (existingJob && existingJob.status === 'done') {
        this._broadcast({
          type: 'dedup',
          jobId: existingJobId,
          message: `Already converted: ${sourceName}`,
          existingAssetId: existingJob.outputAssetId,
        });
        return jsonResp({
          jobId: existingJobId,
          status: 'done',
          deduplicated: true,
          existingAssetId: existingJob.outputAssetId,
        });
      }
    }

    // ── Create new job ──────────────────────────────────────────
    const jobId = crypto.randomUUID();
    const job = {
      id: jobId,
      sourceHash,
      sourceName,
      sourceFormat: sourceFormat.toLowerCase(),
      sourceSize: sourceSize || 0,
      status: 'pending',
      outputAssetId: null,
      error: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    await this.state.storage.put(`job:${jobId}`, job);
    await this.state.storage.put(`hash:${sourceHash}`, jobId);

    // Set alarm to clean up if not completed in 10 minutes
    await this.state.storage.setAlarm(Date.now() + 10 * 60 * 1000);

    this._broadcast({
      type: 'job-created',
      jobId,
      sourceName,
      sourceFormat,
    });

    return jsonResp({ jobId, status: 'pending' }, 201);
  }

  /**
   * POST /complete — Receive converted GLB and store to R2 + D1
   * Expects multipart: file (GLB blob), jobId, meshes, vertices, animations
   */
  async _handleComplete(request) {
    const contentType = request.headers.get('content-type') || '';
    let jobId, file, filename, meshes, vertices, animations;

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      jobId = form.get('jobId');
      file = form.get('file');
      filename = form.get('filename') || file?.name;
      meshes = parseInt(form.get('meshes') || '0', 10);
      vertices = parseInt(form.get('vertices') || '0', 10);
      animations = parseInt(form.get('animations') || '0', 10);
    } else {
      // JSON body with base64-encoded file (smaller models)
      const body = await request.json();
      jobId = body.jobId;
      filename = body.filename;
      meshes = body.meshes || 0;
      vertices = body.vertices || 0;
      animations = body.animations || 0;
      if (body.fileBase64) {
        const binary = Uint8Array.from(atob(body.fileBase64), c => c.charCodeAt(0));
        file = new Blob([binary], { type: 'model/gltf-binary' });
      }
    }

    if (!jobId) return jsonResp({ error: 'Missing jobId' }, 400);
    if (!file) return jsonResp({ error: 'Missing file' }, 400);

    const job = await this.state.storage.get(`job:${jobId}`);
    if (!job) return jsonResp({ error: 'Job not found' }, 404);

    // Update job status
    job.status = 'converting';
    await this.state.storage.put(`job:${jobId}`, job);
    this._broadcast({ type: 'progress', jobId, status: 'converting', message: 'Storing to R2...' });

    // ── Store GLB to R2 ─────────────────────────────────────────
    const assetId = crypto.randomUUID();
    const r2Key = `3d-models/${assetId}/${filename}`;
    const body = file instanceof File ? file.stream() : (file.stream ? file.stream() : file);

    await this.env.BUCKET.put(r2Key, body, {
      httpMetadata: { contentType: 'model/gltf-binary' },
      customMetadata: { assetId, category: '3d-models', sourceHash: job.sourceHash },
    });

    // Get size from R2 object
    const r2Head = await this.env.BUCKET.head(r2Key);
    const size = r2Head?.size || 0;

    // ── Record in D1 ────────────────────────────────────────────
    const tags = JSON.stringify(['glb', '3d', 'converted', job.sourceFormat]);
    const metadata = JSON.stringify({
      sourceHash: job.sourceHash,
      sourceName: job.sourceName,
      sourceFormat: job.sourceFormat,
      meshes, vertices, animations,
    });

    await this.env.DB.prepare(
      `INSERT INTO assets (id, key, filename, mime, size, tags, category, visibility, metadata, owner)
       VALUES (?, ?, ?, 'model/gltf-binary', ?, ?, '3d-models', 'public', ?, 'conversion-pipeline')`
    ).bind(assetId, r2Key, filename, size, tags, metadata).run();

    // Record conversion job in D1
    await this.env.DB.prepare(
      `INSERT OR REPLACE INTO conversion_jobs
       (id, source_hash, source_name, source_format, source_size, output_asset_id, status, meshes, vertices, animations, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, 'done', ?, ?, ?, datetime('now'))`
    ).bind(jobId, job.sourceHash, job.sourceName, job.sourceFormat, job.sourceSize, assetId, meshes, vertices, animations).run();

    // ── Update DO state ─────────────────────────────────────────
    job.status = 'done';
    job.outputAssetId = assetId;
    job.completedAt = new Date().toISOString();
    await this.state.storage.put(`job:${jobId}`, job);

    this._broadcast({
      type: 'complete',
      jobId,
      assetId,
      filename,
      fileUrl: `/v1/assets/${assetId}/file`,
      meshes, vertices, animations, size,
    });

    return jsonResp({
      jobId,
      status: 'done',
      assetId,
      filename,
      fileUrl: `/v1/assets/${assetId}/file`,
      meshes, vertices, animations, size,
    });
  }

  /**
   * POST /fail — Mark a job as failed
   * Body JSON: { jobId, error }
   */
  async _handleFail(request) {
    const { jobId, error } = await request.json();
    if (!jobId) return jsonResp({ error: 'Missing jobId' }, 400);

    const job = await this.state.storage.get(`job:${jobId}`);
    if (!job) return jsonResp({ error: 'Job not found' }, 404);

    job.status = 'failed';
    job.error = error || 'Unknown error';
    job.completedAt = new Date().toISOString();
    await this.state.storage.put(`job:${jobId}`, job);

    // Record in D1
    await this.env.DB.prepare(
      `INSERT OR REPLACE INTO conversion_jobs
       (id, source_hash, source_name, source_format, source_size, status, error, completed_at)
       VALUES (?, ?, ?, ?, ?, 'failed', ?, datetime('now'))`
    ).bind(jobId, job.sourceHash, job.sourceName, job.sourceFormat, job.sourceSize, job.error).run();

    this._broadcast({ type: 'failed', jobId, error: job.error });

    return jsonResp({ jobId, status: 'failed', error: job.error });
  }

  /**
   * GET /status/:jobId — Get job status
   */
  async _handleStatus(jobId) {
    const job = await this.state.storage.get(`job:${jobId}`);
    if (!job) return jsonResp({ error: 'Job not found' }, 404);
    return jsonResp(job);
  }

  /**
   * GET /jobs — List recent jobs
   */
  async _handleListJobs() {
    const entries = await this.state.storage.list({ prefix: 'job:' });
    const jobs = [];
    for (const [, value] of entries) {
      jobs.push(value);
    }
    // Sort newest first
    jobs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return jsonResp({ jobs: jobs.slice(0, 50), count: jobs.length });
  }

  // ════════════════════════════════════════════════════════════════
  //  Alarm — Clean up stale jobs
  // ════════════════════════════════════════════════════════════════

  async alarm() {
    const entries = await this.state.storage.list({ prefix: 'job:' });
    const now = Date.now();
    const staleThreshold = 10 * 60 * 1000; // 10 minutes

    for (const [key, job] of entries) {
      if (
        (job.status === 'pending' || job.status === 'converting') &&
        new Date(job.createdAt).getTime() + staleThreshold < now
      ) {
        job.status = 'failed';
        job.error = 'Timed out after 10 minutes';
        job.completedAt = new Date().toISOString();
        await this.state.storage.put(key, job);

        this._broadcast({ type: 'timeout', jobId: job.id, message: 'Job timed out' });
      }
    }
  }
}

// ── Helpers ────────────────────────────────────────────────────────

function jsonResp(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
