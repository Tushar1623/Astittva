const cp = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function captureScreenshot(url, outputPath, width = 1440, height = 900) {
  const absOutput = path.resolve(outputPath);
  const dir = path.dirname(absOutput);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'ch_scr_' + Date.now());

  const args = [
    '--headless',
    '--disable-gpu',
    `--user-data-dir=${tempProfile}`,
    `--window-size=${width},${height}`,
    `--screenshot=${absOutput}`,
    url
  ];

  cp.spawnSync(chromePath, args, { timeout: 20000 });
  try {
    fs.rmSync(tempProfile, { recursive: true, force: true });
  } catch (e) {}

  return fs.existsSync(absOutput) && fs.statSync(absOutput).size > 0;
}

if (require.main === module) {
  const targetUrl = process.argv[2] || 'http://localhost:3000';
  const out = process.argv[3] || path.join(__dirname, '../tmp/desktop_home.png');
  const w = parseInt(process.argv[4] || '1440', 10);
  const h = parseInt(process.argv[5] || '900', 10);

  console.log(`Capturing ${targetUrl} -> ${out} (${w}x${h})...`);
  const ok = captureScreenshot(targetUrl, out, w, h);
  console.log('Result:', ok ? 'SUCCESS' : 'FAILED');
  process.exit(ok ? 0 : 1);
}

module.exports = { captureScreenshot };
