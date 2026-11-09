const cp = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetRoute = process.argv[2] || '/properties';
const outFile = process.argv[3] || 'tmp/test_properties.png';

const navHtml = path.resolve('tmp/nav.html');
fs.writeFileSync(navHtml, `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<script>
window.location.href = "http://localhost:3000${targetRoute}";
</script>
</body>
</html>`);

const absOutput = path.resolve(outFile);
const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'ch_scr_' + Date.now());

const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  `--user-data-dir=${tempProfile}`,
  '--window-size=1440,900',
  '--virtual-time-budget=4000',
  '--run-all-compositor-stages-before-draw',
  `--screenshot=${absOutput}`,
  `file://${navHtml}`
];

cp.spawnSync(chromePath, args, { timeout: 25000 });
try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch (e) {}

console.log('Result:', fs.existsSync(absOutput) && fs.statSync(absOutput).size > 0 ? 'SUCCESS' : 'FAILED');

