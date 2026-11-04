const http = require("http");

function testRedirect(name, headers, expectedStatus, expectedLocation) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: "localhost",
      port: 8000,
      path: "/properties",
      method: "GET",
      headers: headers
    }, (res) => {
      const loc = res.headers.location || "";
      const pass = res.statusCode === expectedStatus && (!expectedLocation || loc === expectedLocation);
      console.log(`[${pass ? "PASS" : "FAIL"}] ${name} -> Status: ${res.statusCode}, Location: ${loc || "None"}`);
      resolve(pass);
    });
    req.on("error", (e) => {
      console.error(`[ERROR] ${name}:`, e.message);
      resolve(false);
    });
    req.end();
  });
}

async function run() {
  console.log("Testing Node Canonical Redirect Middleware on port 8000:");
  await testRedirect("1. www.astittva.in (any proto)", { host: "www.astittva.in" }, 301, "https://astittva.in/properties");
  await testRedirect("2. http://astittva.in", { host: "astittva.in", "x-forwarded-proto": "http" }, 301, "https://astittva.in/properties");
  await testRedirect("3. https://astittva.in (canonical)", { host: "astittva.in", "x-forwarded-proto": "https" }, 200, "");
}

run();

