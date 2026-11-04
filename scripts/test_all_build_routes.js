const fs = require('fs');
const http = require('http');
const path = require('path');

const BUILD_DIR = path.resolve('frontend/build');

function getHtmlFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const htmlFiles = getHtmlFiles(BUILD_DIR);
const routes = new Set();
for (const f of htmlFiles) {
  const rel = path.relative(BUILD_DIR, f).replace(/\\/g, '/');
  let r = '/' + rel.replace(/index\.html$/, '').replace(/\.html$/, '');
  r = r.replace(/\/+$/, '') || '/';
  routes.add(r);
}

function check(r) {
  return new Promise((resolve) => {
    http.get(`http://localhost:8000${r}`, (res) => {
      resolve({ route: r, status: res.statusCode });
    }).on('error', (err) => resolve({ route: r, status: 'ERR' }));
  });
}

async function run() {
  console.log(`Checking all ${routes.size} build routes against server...`);
  const failures = [];
  for (const r of routes) {
    const res = await check(r);
    if (res.status !== 200) {
      failures.push(res);
      console.log(`❌ ${res.status}: ${r}`);
    }
  }
  console.log(`Total non-200 build routes: ${failures.length}`);
}

run();

