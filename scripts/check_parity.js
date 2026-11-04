const cp = require("child_process");

const files = [
  "src/components/Footer.jsx",
  "src/components/Header.jsx",
  "src/components/LeadForm.jsx",
  "src/components/PropertyCard.jsx",
  "src/components/ShareButton.jsx",
  "src/components/ShareModal.jsx",
  "src/components/admin/ApplicantDetailsModal.jsx",
  "src/data/calculatorsData.js",
  "src/pages/HomePage.jsx",
  "src/pages/PropertyDetailPage.jsx",
  "public/.htaccess",
  "public/index.html",
  "public/sitemap.xml"
];

let allGood = true;

for (const f of files) {
  try {
    const diff = cp.execSync(`git diff --no-index "frontend/${f}" "web/${f}"`, { encoding: "utf8" });
    if (diff.trim()) {
      console.log(`DIFF FOUND for ${f}:\n`, diff);
      allGood = false;
    } else {
      console.log(`[PASS] Identical parity: ${f}`);
    }
  } catch (err) {
    const out = (err.stdout || "") + (err.stderr || "");
    if (out.trim()) {
      console.log(`DIFF FOUND for ${f}:\n`, out);
      allGood = false;
    } else {
      console.log(`[PASS] Identical parity: ${f}`);
    }
  }
}

if (allGood) {
  console.log("SUCCESS: ALL 10 TOUCHED SOURCE FILES HAVE 100% BYTE-FOR-BYTE PARITY!");
} else {
  console.error("FAIL: Differences found between frontend and web directories.");
  process.exit(1);
}

