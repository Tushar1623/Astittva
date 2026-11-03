const fs = require("fs");
const path = require("path");

// Check the prerendered HTML files first
const buildDir = "frontend/build";

function getCleanText(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<noscript>[\s\S]*?<\/noscript>/gi, " ") // exclude noscript to see pure client/prerender content
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function getFullCleanText(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const keyPages = [
  "index.html",
  "properties/index.html",
  "resale/index.html",
  "blogs/index.html",
  "news/index.html",
  "about/index.html",
  "contact/index.html",
  "career/index.html",
  "careers/jobs/index.html",
  "calculators/index.html",
  "locations/em-bypass/index.html",
  "locations/new-alipore/index.html",
  "locations/new-town-rajarhat/index.html"
];

console.log("PAGE".padEnd(35) + " | FULL WORDS | NO-NOSCRIPT WORDS | H1 HEADINGS");
console.log("-".repeat(110));

for (const p of keyPages) {
  const fullPath = path.join(buildDir, p);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, "utf8");
  
  const fullText = getFullCleanText(content);
  const noNoscriptText = getCleanText(content);

  const fullWords = fullText.split(" ").filter(Boolean).length;
  const noNoscriptWords = noNoscriptText.split(" ").filter(Boolean).length;

  const h1Matches = [...content.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());

  console.log(p.padEnd(35) + " | " + String(fullWords).padStart(10) + " | " + String(noNoscriptWords).padStart(17) + " | " + h1Matches.join(" || "));
}

