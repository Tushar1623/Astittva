const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.resolve('frontend/build');

// Find all HTML files in build directory
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
console.log(`Found ${htmlFiles.length} HTML files in ${BUILD_DIR}`);

// Let's audit links across all HTML files
const internalLinks = new Map(); // target -> [sources]
const externalLinks = new Set();
const placeholderLinks = [];
const emptyAnchorLinks = [];
const brokenInternalLinks = [];
const allRoutes = new Set();

// Register all valid routes from files
for (const file of htmlFiles) {
  const rel = path.relative(BUILD_DIR, file).replace(/\\/g, '/');
  let route = '/' + rel.replace(/index\.html$/, '').replace(/\.html$/, '');
  route = route.replace(/\/+$/, '') || '/';
  allRoutes.add(route);
  allRoutes.add(route + '/');
  allRoutes.add(route === '/' ? '/' : route);
}

console.log(`Total recognized static routes: ${allRoutes.size}`);

// Scan each HTML file for <a href="...">
for (const file of htmlFiles) {
  const rel = path.relative(BUILD_DIR, file).replace(/\\/g, '/');
  let currentRoute = '/' + rel.replace(/index\.html$/, '').replace(/\.html$/, '');
  currentRoute = currentRoute.replace(/\/+$/, '') || '/';

  const html = fs.readFileSync(file, 'utf8');

  // Match <a> tags
  const aTagRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = aTagRegex.exec(html)) !== null) {
    const attrs = match[1];
    const body = match[2];
    const hrefMatch = attrs.match(/href=["'](.*?)["']/i);
    const ariaLabelMatch = attrs.match(/aria-label=["'](.*?)["']/i);
    const text = body.replace(/<[^>]+>/g, '').trim();

    if (!hrefMatch) {
      placeholderLinks.push({ file: rel, issue: 'No href attribute', tag: match[0].slice(0, 80) });
      continue;
    }

    const href = hrefMatch[1].trim();

    // Check placeholder / empty href
    if (href === '#' || href === '' || href.startsWith('javascript:')) {
      placeholderLinks.push({ file: rel, issue: `Placeholder href="${href}"`, tag: match[0].slice(0, 80) });
      continue;
    }

    // Check anchor text quality
    if (!text && !ariaLabelMatch && !body.includes('<img')) {
      emptyAnchorLinks.push({ file: rel, href, tag: match[0].slice(0, 80) });
    }

    // External link
    if (href.startsWith('http://') || href.startsWith('https://')) {
      if (href.startsWith('https://astittva.in') || href.startsWith('http://astittva.in')) {
        // Internal absolute link
        const urlObj = new URL(href);
        const internalPath = (urlObj.pathname.replace(/\/+$/, '') || '/');
        if (!internalLinks.has(internalPath)) internalLinks.set(internalPath, []);
        internalLinks.get(internalPath).push(currentRoute);

        if (!allRoutes.has(internalPath) && !internalPath.startsWith('/api') && !internalPath.startsWith('/static')) {
          brokenInternalLinks.push({ file: rel, href, targetPath: internalPath });
        }
      } else {
        externalLinks.add(href);
      }
    } else if (href.startsWith('/')) {
      // Relative internal link
      const internalPath = (href.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/');
      if (!internalLinks.has(internalPath)) internalLinks.set(internalPath, []);
      internalLinks.get(internalPath).push(currentRoute);

      if (!allRoutes.has(internalPath) && !internalPath.startsWith('/api') && !internalPath.startsWith('/static')) {
        brokenInternalLinks.push({ file: rel, href, targetPath: internalPath });
      }
    }
  }
}

console.log('\n--- AUDIT SUMMARY ---');
console.log(`Unique External Links: ${externalLinks.size}`);
console.log(`Placeholder/Empty Href Links: ${placeholderLinks.length}`);
console.log(`Empty Anchor Text Links: ${emptyAnchorLinks.length}`);
console.log(`Broken Internal Links: ${brokenInternalLinks.length}`);

if (placeholderLinks.length > 0) {
  console.log('\nSample Placeholder Links:');
  console.log(placeholderLinks.slice(0, 10));
}

if (emptyAnchorLinks.length > 0) {
  console.log('\nSample Empty Anchor Links:');
  console.log(emptyAnchorLinks.slice(0, 10));
}

if (brokenInternalLinks.length > 0) {
  console.log('\nSample Broken Internal Links:');
  console.log(brokenInternalLinks.slice(0, 15));
}

// Check orphan routes
const orphanRoutes = [];
for (const route of allRoutes) {
  if (route.endsWith('/') && route !== '/') continue;
  if (!internalLinks.has(route) && route !== '/') {
    orphanRoutes.push(route);
  }
}
console.log(`\nOrphan Routes (0 internal links pointing to them): ${orphanRoutes.length}`);
if (orphanRoutes.length > 0) {
  console.log(orphanRoutes.slice(0, 20));
}

