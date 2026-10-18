const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function sendCDP(ws, method, params = {}, id = 1) {
  return new Promise((resolve, reject) => {
    const msg = JSON.stringify({ id, method, params });
    const handler = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      } catch (e) {
        reject(e);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(msg);
  });
}

async function testProps() {
  const tmpDir = path.join(__dirname, '../tmp/chrome-props-test-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const chromeProc = spawn(chromePath, [
    '--remote-debugging-port=9226',
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:3000/properties'
  ]);

  try {
    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 500));
      try {
        const res = await fetch('http://127.0.0.1:9226/json');
        const list = await res.json();
        if (list && list[0] && list[0].webSocketDebuggerUrl) {
          wsUrl = list[0].webSocketDebuggerUrl;
          break;
        }
      } catch (e) {}
    }

    if (!wsUrl) throw new Error('Could not connect to Chrome CDP');

    const ws = new globalThis.WebSocket(wsUrl);
    await new Promise(r => ws.addEventListener('open', r, { once: true }));

    await sendCDP(ws, 'Page.enable');
    await sendCDP(ws, 'DOM.enable');

    // Collect console errors
    const consoleLogs = [];
    ws.addEventListener('message', (event) => {
      try {
        const d = JSON.parse(event.data);
        if (d.method === 'Runtime.consoleAPICalled') {
          consoleLogs.push(d.params.args.map(a => a.value).join(' '));
        }
      } catch(e) {}
    });
    await sendCDP(ws, 'Runtime.enable');

    // Wait 8 seconds for React and properties API to settle
    await new Promise(r => setTimeout(r, 8000));

    const pageInfo = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const imgs = Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete
        }));
        const titles = Array.from(document.querySelectorAll('h3')).map(h => h.innerText);
        return { count: imgs.length, imgs: imgs.slice(0, 10), titles: titles.slice(0, 10) };
      })()`,
      returnByValue: true
    }, 1);

    console.log('Page Info:', JSON.stringify(pageInfo.result.value, null, 2));
    console.log('Console Logs:', consoleLogs);

    ws.close();
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

testProps().catch(console.error);
