const { captureScreenshot } = require('./capture_screenshot');
const path = require('path');

const routes = [
  { url: 'http://localhost:3000/properties', name: 'properties_desktop', w: 1440, h: 900 },
  { url: 'http://localhost:3000/properties', name: 'properties_mobile', w: 390, h: 844 },
  { url: 'http://localhost:3000/resale', name: 'resale_desktop', w: 1440, h: 900 },
  { url: 'http://localhost:3000/blogs', name: 'blogs_desktop', w: 1440, h: 900 },
  { url: 'http://localhost:3000/calculators', name: 'calculators_desktop', w: 1440, h: 900 },
  { url: 'http://localhost:3000/career', name: 'career_desktop', w: 1440, h: 900 },
  { url: 'http://localhost:3000/admin/login', name: 'admin_login_desktop', w: 1440, h: 900 },
];

(async () => {
  for (const r of routes) {
    const out = path.join(__dirname, `../tmp/baseline_${r.name}.png`);
    console.log(`Capturing ${r.name}...`);
    captureScreenshot(r.url, out, r.w, r.h);
  }
  console.log('Batch capture complete.');
})();

