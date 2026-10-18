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

async function inspectBlogCard(url) {
  console.log(`\nTesting blog page at: ${url}`);
  const tmpDir = path.join(__dirname, `../tmp/chrome-blog-card-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9666',
    `--user-data-dir=${tmpDir}`,
    '--disable-gpu',
    '--no-sandbox',
    url
  ]);

  await new Promise(r => setTimeout(r, 3000));

  const tabsRes = await fetch('http://127.0.0.1:9666/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let msgId = 1;
  const networkFailed = [];

  ws.addEventListener('message', (event) => {
    try {
      const parsed = JSON.parse(event.data);
      if (parsed.method === 'Network.loadingFailed') {
        networkFailed.push(parsed.params);
      }
      if (parsed.method === 'Log.entryAdded' && parsed.params.entry?.level === 'error') {
        console.error('Console error:', parsed.params.entry.text);
      }
    } catch {}
  });

  await sendCDP(ws, 'Runtime.enable', {}, msgId++);
  await sendCDP(ws, 'Network.enable', {}, msgId++);
  await sendCDP(ws, 'Page.enable', {}, msgId++);

  await new Promise(res => setTimeout(res, 3000));

  const cardInfo = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const articles = Array.from(document.querySelectorAll('article'));
      return articles.map(a => ({
        title: a.querySelector('h3')?.innerText,
        imgSrc: a.querySelector('img')?.src,
        naturalWidth: a.querySelector('img')?.naturalWidth
      }));
    })()`,
    returnByValue: true
  }, msgId++);

  console.log('Cards found:', JSON.stringify(cardInfo.result?.value, null, 2));
  if (networkFailed.length) {
    console.log('Network failures:', networkFailed);
  }

  ws.close();
  chromeProc.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
}

async function main() {
  await inspectBlogCard('http://localhost:3000/blogs');
}

main().catch(console.error);
