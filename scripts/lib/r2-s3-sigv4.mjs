/**
 * Minimal AWS SigV4 for Cloudflare R2 S3 API (no @aws-sdk dependency).
 * Used when node_modules AWS packages are broken / disk is full.
 * Never logs secret values.
 */

import crypto from "node:crypto";
import { resolveR2S3Config, loadFleetEnv } from "./load-fleet-env.mjs";

function hmac(key, data) {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}
function sha256Hex(data) {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}
function amzDate(d = new Date()) {
  return d.toISOString().replace(/[:-]|\.\d{3}/g, "");
}
function dateStamp(d = new Date()) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

/**
 * Sign a request against R2 S3 endpoint.
 */
export async function r2S3Fetch(opts) {
  loadFleetEnv({ quiet: true });
  const config = opts.config || resolveR2S3Config();
  if (!config) throw new Error("R2 S3 config missing (fleet env / secretnow)");

  const method = opts.method || "GET";
  const body = opts.body ?? "";
  const now = new Date();
  const amz = amzDate(now);
  const ds = dateStamp(now);
  const region = "auto";
  const service = "s3";
  const host = new URL(config.endpoint).host;

  const query = { ...(opts.query || {}) };
  const qs = Object.keys(query)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`)
    .join("&");

  const canonicalUri = opts.path.startsWith("/") ? opts.path : `/${opts.path}`;
  const payloadHash = sha256Hex(body);
  const headers = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amz,
    ...(opts.headers || {}),
  };
  const signedHeaderKeys = Object.keys(headers)
    .map((h) => h.toLowerCase())
    .sort();
  const signedHeaders = signedHeaderKeys.join(";");
  const canonicalHeaders = signedHeaderKeys
    .map((k) => {
      const found = Object.keys(headers).find((h) => h.toLowerCase() === k);
      const raw = headers[found];
      return `${k}:${String(raw).trim()}\n`;
    })
    .join("");

  const canonicalRequest = [
    method,
    canonicalUri,
    qs,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${ds}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amz,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = hmac(`AWS4${config.secretAccessKey}`, ds);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, "aws4_request");
  const signature = crypto
    .createHmac("sha256", kSigning)
    .update(stringToSign, "utf8")
    .digest("hex");

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const url = `${config.endpoint}${canonicalUri}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    method,
    headers: {
      ...headers,
      Authorization: authorization,
    },
    body: method === "GET" || method === "HEAD" ? undefined : body,
  });
  return res;
}

function decodeXml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/**
 * ListObjectsV2 via raw SigV4.
 */
export async function listR2Objects({
  prefix = "",
  max = 5000,
  bucket,
} = {}) {
  loadFleetEnv({ quiet: true });
  const config = resolveR2S3Config();
  if (!config) throw new Error("missing R2 credentials");
  const bkt = bucket || config.bucket;
  const keys = [];
  let continuation;

  do {
    const query = {
      "list-type": "2",
      "max-keys": String(Math.min(1000, max - keys.length)),
    };
    if (prefix) query.prefix = prefix;
    if (continuation) query["continuation-token"] = continuation;

    const res = await r2S3Fetch({
      method: "GET",
      path: `/${bkt}`,
      query,
      config: { ...config },
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`ListObjectsV2 HTTP ${res.status}: ${text.slice(0, 300)}`);
    }

    const contents = [...text.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)];
    for (const m of contents) {
      const block = m[1];
      const key = block.match(/<Key>([\s\S]*?)<\/Key>/)?.[1];
      if (!key) continue;
      const size = parseInt(block.match(/<Size>(\d+)<\/Size>/)?.[1] || "0", 10);
      const lastModified =
        block.match(/<LastModified>([\s\S]*?)<\/LastModified>/)?.[1] || null;
      keys.push({ key: decodeXml(key), size, lastModified });
    }

    const isTruncated =
      /<IsTruncated>true<\/IsTruncated>/i.test(text) && keys.length < max;
    const next = text.match(
      /<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/,
    )?.[1];
    continuation = isTruncated && next ? decodeXml(next) : undefined;
  } while (continuation && keys.length < max);

  return { keys, count: keys.length, bucket: bkt, prefix };
}

/**
 * PutObject via raw SigV4.
 */
export async function putR2Object({
  key,
  body,
  contentType = "application/octet-stream",
  bucket,
}) {
  loadFleetEnv({ quiet: true });
  const config = resolveR2S3Config();
  if (!config) throw new Error("missing R2 credentials");
  const bkt = bucket || config.bucket;
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
  const res = await r2S3Fetch({
    method: "PUT",
    path: `/${bkt}/${key.split("/").map(encodeURIComponent).join("/")}`,
    headers: {
      "content-type": contentType,
      "content-length": String(buf.length),
    },
    body: buf,
    config,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`PutObject HTTP ${res.status}: ${t.slice(0, 300)}`);
  }
  return { ok: true, key, bucket: bkt };
}

export default { r2S3Fetch, listR2Objects, putR2Object };
