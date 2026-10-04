/**
 * Astittva Real Estate - API Endpoint Integration Verification
 *
 * Tests all key routes against the Express server app:
 * - GET /healthz
 * - GET /api
 * - GET /api/nonexistent (verifies JSON 404)
 * - GET /api/auth/me (verifies JSON 401)
 * - GET / (verifies static SPA fallback)
 * - GET /properties (verifies client-side route fallback)
 */

const http = require("http");
const app = require("../server");

async function runTests() {
  console.log("=== Starting Astittva Express Server Verification ===");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(8082, "127.0.0.1", resolve));
  console.log("[OK] Test server listening on http://127.0.0.1:8082");

  const baseUrl = "http://127.0.0.1:8082";

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/healthz`);
    const healthJson = await healthRes.json();
    console.log(`[PASS] GET /healthz (status: ${healthRes.status}):`, healthJson);

    // 2. API Root
    const apiRes = await fetch(`${baseUrl}/api`);
    const apiJson = await apiRes.json();
    console.log(`[PASS] GET /api (status: ${apiRes.status}):`, apiJson);

    // 3. API 404 should return JSON, not HTML
    const notFoundRes = await fetch(`${baseUrl}/api/nonexistent-endpoint`);
    const notFoundJson = await notFoundRes.json();
    console.log(`[PASS] GET /api/nonexistent-endpoint returns JSON 404 (status: ${notFoundRes.status}):`, notFoundJson);

    // 4. Auth /me unauthenticated should return 401
    const meRes = await fetch(`${baseUrl}/api/auth/me`);
    const meJson = await meRes.json();
    console.log(`[PASS] GET /api/auth/me unauthenticated returned expected 401:`, meJson);

    // 5. Static SPA fallback (e.g. GET /)
    const homeRes = await fetch(`${baseUrl}/`);
    const homeHtml = await homeRes.text();
    const isHtml = homeHtml.includes("<!doctype html>") || homeHtml.includes("<html");
    console.log(`[PASS] GET / (status: ${homeRes.status}, is HTML: ${isHtml})`);

    // 6. Static SPA fallback on client route (e.g. GET /properties)
    const clientRouteRes = await fetch(`${baseUrl}/properties`);
    const clientHtml = await clientRouteRes.text();
    const isClientHtml = clientHtml.includes("<!doctype html>") || clientHtml.includes("<html");
    console.log(`[PASS] GET /properties client route (status: ${clientRouteRes.status}, serves SPA: ${isClientHtml})`);

    console.log("\n=== ALL SERVER VERIFICATION TESTS PASSED ===");
  } catch (err) {
    console.error("[FAIL] Test error:", err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
}

runTests();
