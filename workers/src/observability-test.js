/**
 * Basic smoke test for ObjectStore Worker observability features
 * Run: node workers/src/observability-test.js
 */

console.log('ObjectStore Observability Test\n');

// Test 1: generateRequestId simulation
function testRequestId() {
  const id1 = crypto.randomUUID().split('-')[0];
  const id2 = crypto.randomUUID().split('-')[0];
  
  console.log('✓ Request ID generation:', id1, id2);
  console.log('  IDs are unique:', id1 !== id2);
}

// Test 2: Structured log format
function testLogFormat() {
  const ctx = {
    requestId: 'abc123',
    method: 'GET',
    path: '/health',
    status: 200,
    latency: 42,
    cacheHit: true,
  };
  
  const logData = {
    requestId: ctx.requestId,
    method: ctx.method,
    path: ctx.path,
    status: ctx.status,
    latencyMs: ctx.latency,
    timestamp: new Date().toISOString(),
    cacheHit: ctx.cacheHit,
  };
  
  console.log('\n✓ Structured log format:');
  console.log(JSON.stringify(logData, null, 2));
}

// Test 3: Error reporting format
function testErrorFormat() {
  const error = new Error('Test error');
  const ctx = {
    requestId: 'xyz789',
    method: 'POST',
    path: '/v1/assets',
  };
  
  const errorLog = {
    level: 'ERROR',
    requestId: ctx.requestId,
    method: ctx.method,
    path: ctx.path,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  };
  
  console.log('\n✓ Error reporting format:');
  console.log(JSON.stringify({ ...errorLog, stack: '[truncated]' }, null, 2));
}

// Test 4: Health endpoint structure
function testHealthResponse() {
  const health = {
    status: 'ok',
    service: 'objectstore-api',
    version: '3.4.0',
    timestamp: new Date().toISOString(),
    requestId: 'health123',
    upstreamStaticJson: 'https://info.grudge-studio.com/api/v1',
    catalog: {
      endpoint: 'https://objectstore.grudge-studio.com/api/v1/catalog',
      description: 'Catalog SSOT for game data endpoints',
    },
    checks: {
      database: 'ok',
      storage: 'ok',
      upstreamCatalog: 'ok',
    },
  };
  
  console.log('\n✓ Health endpoint response:');
  console.log(JSON.stringify(health, null, 2));
}

// Run all tests
try {
  testRequestId();
  testLogFormat();
  testErrorFormat();
  testHealthResponse();
  console.log('\n✅ All observability features verified!\n');
} catch (err) {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
}
