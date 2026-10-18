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

async function inspectPropertiesPage() {
  const tmpDir = path.join(__dirname, '../tmp/chrome-props-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const chromeProc = spawn(chromePath, [
    '--remote-debugging-port=9225',
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
        const res = await fetch('http://127.0.0.1:9225/json');
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

    // Wait for content to render
    await new Promise(r => setTimeout(r, 6000));

    // Get cards info
    const info = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const cards = document.querySelectorAll('article.luxury-card, [data-testid^="property-card-"]');
        return Array.from(cards).slice(0, 10).map(c => {
          const title = c.querySelector('h3, h2, a')?.innerText;
          const img = c.querySelector('img');
          return {
            title,
            src: img?.src,
            naturalWidth: img?.naturalWidth,
            naturalHeight: img?.naturalHeight,
            complete: img?.complete
          };
        });
      })()`,
      returnByValue: true
    }, 1);

    console.log('Cards Info:', JSON.stringify(info.result.value, null, 2));

    const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, 2);
    const shotPath = path.join(__dirname, 'properties_view.png');
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved screenshot to:', shotPath);

    ws.close();
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

inspectPropertiesPage().catch(console.error);
