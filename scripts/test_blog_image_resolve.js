const b = {
  "id": "6ad315d61a8fc76c11a63877",
  "title": "Resale vs Under-Construction Flat in Kolkata: Which Is Better in 2026?",
  "slug": "resale-vs-under-construction-flat-in-kolkata-which-is-better-in-2026",
  "featured_image": "https://drive.google.com/file/d/1joyw6M3gEKgRfJCHeve1DVIqGXQ-yU6h/view?usp=sharing",
  "short_description": "Resale or under-construction flat in Kolkata? Compare cost, GST, risk, home loans and possession time to pick the better option in 2026",
  "status": "published",
  "publish_date": "2026-10-17",
  "author": "Astittva Editorial"
};

// Check Google Drive file ID extraction
function getGoogleDriveFileId(url) {
  if (!url || typeof url !== "string") return null;
  const clean = url.trim();

  // 1. Matches drive.google.com/file/d/<id>
  const fileMatch = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];

  // 2. Matches googleusercontent.com/d/<id> or /d/<id>
  const dMatch = clean.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch) return dMatch[1];

  // 3. Matches query param ?id=<id> or &id=<id> (drive.google.com/open?id=... or /thumbnail?id=...)
  const idParamMatch = clean.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch) return idParamMatch[1];

  // 4. Raw Google Drive file ID (25 to 45 alphanumeric characters with underscores/dashes)
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(clean)) {
    return clean;
  }

  return null;
}

const id = getGoogleDriveFileId(b.featured_image);
console.log('Extracted drive ID:', id);
console.log('Resolved thumbnail URL:', `/api/images/thumbnail?id=${encodeURIComponent(id)}&w=900`);
