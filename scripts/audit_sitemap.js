const fs = require('fs');
const http = require('http');

const sitemapXml = fs.readFileSync('frontend/public/sitemap.xml', 'utf8');
const locRegex = /<loc>(https:\/\/astittva\.in([^<]*))<\/loc>/gi;

const urls = [];
let match;
while ((match = locRegex.exec(sitemapXml)) !== null) {
  urls.push({ full: match[1], path: match[2] || '/' });
}

console.log(`Found ${urls.length} URLs in sitemap.xml`);

function checkUrl(urlPath) {
  return new Promise((resolve) => {
    http.get(`http://localhost:8000${urlPath}`, (res) => {
      resolve({
        path: urlPath,
        status: res.statusCode,
        location: res.headers.location || null
      });
    }).on('error', (err) => {
      resolve({ path: urlPath, status: 'ERROR', error: err.message });
    });
  });
}

async function run() {
  const issues = [];
  let checked = 0;
  for (const item of urls) {
    const res = await checkUrl(item.path);
    checked++;
    if (res.status !== 200) {
      issues.push(res);
      console.log(`❌ [${res.status}] ${item.path} ${res.location ? '-> ' + res.location : ''}`);
    }
  }

  console.log(`\nChecked ${checked} URLs. Non-200 issues: ${issues.length}`);
  if (issues.length > 0) {
    console.log(issues);
  } else {
    console.log('✅ All sitemap URLs return 200 on backend!');
  }
}

run();

