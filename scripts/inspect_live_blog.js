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
      } catch (e) {}
    };
    ws.addEventListener('message', handler);
    ws.send(msg);
  });
}

async function inspectLive() {
  const url = 'https://astittva.in/blogs';
  console.log(`\nTesting LIVE site at: ${url}`);
  const tmpDir = path.join(__dirname, `../tmp/chrome-live-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9777',
    `--user-data-dir=${tmpDir}`,
    '--disable-gpu',
    '--no-sandbox',
    url
  ]);

  await new Promise(r => setTimeout(r, 4000));

  const tabsRes = await fetch('http://127.0.0.1:9777/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let msgId = 1;
  const consoleErrors = [];
  const networkFailed = [];

  ws.addEventListener('message', (event) => {
    try {
      const parsed = JSON.parse(event.data);
      if (parsed.method === 'Log.entryAdded' && parsed.params.entry?.level === 'error') {
        consoleErrors.push(parsed.params.entry.text);
      }
      if (parsed.method === 'Network.responseReceived') {
        const u = parsed.params.response.url;
        if (u.includes('1joyw6M3gEKgRfJCHeve1DVIqGXQ-yU6h') || u.includes('thumbnail') || u.includes('luxe')) {
          console.log('NET RESPONSE:', parsed.params.response.status, u);
        }
      }
      if (parsed.method === 'Network.loadingFailed') {
        networkFailed.push(parsed.params);
      }
    } catch {}
  });

  await sendCDP(ws, 'Runtime.enable', {}, msgId++);
  await sendCDP(ws, 'Log.enable', {}, msgId++);
  await sendCDP(ws, 'Network.enable', {}, msgId++);
  await sendCDP(ws, 'Page.enable', {}, msgId++);

  await new Promise(res => setTimeout(res, 4000));

  const cardInfo = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const articles = Array.from(document.querySelectorAll('article'));
      const target = articles.find(a => a.innerText.includes('Resale vs Under-Construction'));
      const img = target?.querySelector('img');
      return {
        found: !!target,
        title: target?.querySelector('h3')?.innerText,
        imgSrc: img?.src,
        naturalWidth: img?.naturalWidth
      };
    })()`,
    returnByValue: true
  }, msgId++);

  console.log('Live Target Card Info:', JSON.stringify(cardInfo.result?.value, null, 2));
  console.log('Console Errors:', consoleErrors);

  ws.close();
  chromeProc.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
}

inspectLive().catch(console.error);
