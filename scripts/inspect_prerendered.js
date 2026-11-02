const fs = require("fs");

const files = [
  "frontend/build/index.html",
  "frontend/build/locations/em-bypass/index.html",
  "frontend/build/locations/new-alipore/index.html",
  "frontend/build/locations/new-town-rajarhat/index.html",
];

for (const f of files) {
  if (fs.existsSync(f)) {
    const html = fs.readFileSync(f, "utf8");
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const descMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"/);
    const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="(.*?)"/);
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    console.log("--- " + f + " ---");
    console.log("Title (" + (titleMatch ? titleMatch[1].length : 0) + " chars):", titleMatch ? titleMatch[1] : "N/A");
    console.log("Desc (" + (descMatch ? descMatch[1].length : 0) + " chars):", descMatch ? descMatch[1] : "N/A");
    console.log("Canonical:", canonicalMatch ? canonicalMatch[1] : "N/A");
    console.log("H1:", h1Match ? h1Match[1].replace(/\s+/g, " ").trim() : "N/A");
  } else {
    console.error("File missing:", f);
  }
}
