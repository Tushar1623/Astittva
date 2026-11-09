const path = require('path');
const { captureScreenshot } = require('./capture_screenshot');

const screenshots = [
  { url: 'http://localhost:8000', out: 'tmp/verified_home_desktop.png', w: 1440, h: 900 },
  { url: 'http://localhost:8000', out: 'tmp/verified_home_mobile.png', w: 390, h: 844 },
  { url: 'http://localhost:8000/properties', out: 'tmp/verified_properties_desktop.png', w: 1440, h: 900 },
  { url: 'http://localhost:8000/resale', out: 'tmp/verified_resale_desktop.png', w: 1440, h: 900 },
  { url: 'http://localhost:8000/calculators', out: 'tmp/verified_calculators_desktop.png', w: 1440, h: 900 },
  { url: 'http://localhost:8000/career', out: 'tmp/verified_career_desktop.png', w: 1440, h: 900 },
  { url: 'http://localhost:8000/admin/login', out: 'tmp/verified_admin_login_desktop.png', w: 1440, h: 900 },
];

console.log('Capturing verified screenshots...');
for (const s of screenshots) {
  const absOut = path.resolve(s.out);
  console.log(`Capturing ${s.url} -> ${s.out} (${s.w}x${s.h})`);
  const ok = captureScreenshot(s.url, absOut, s.w, s.h);
  console.log(`-> ${ok ? 'OK' : 'FAILED'}`);
}
console.log('Batch capture finished.');

