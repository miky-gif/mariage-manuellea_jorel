// Outil de capture (dev). Usage : node scripts/shot.js <url> <out.png> [width] [height] [beyond:no]
const http = require('http'); const fs = require('fs');
const URL = process.argv[2] || 'http://localhost:3000/';
const OUT = process.argv[3] || 'shot.png';
const WIDTH = parseInt(process.argv[4] || '360', 10);
const HEIGHT = parseInt(process.argv[5] || '800', 10);
const BEYOND = process.argv[6] !== 'no';
function getJSON(u){return new Promise((res,rej)=>{http.get(u,r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>res(JSON.parse(d)))}).on('error',rej)})}
(async () => {
  const t = await getJSON('http://127.0.0.1:9222/json');
  const page = t.find(x => x.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pending = {};
  const send = (m, p) => new Promise(r => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending[m.id]) { pending[m.id](m.result); delete pending[m.id]; } };
  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: URL });
  await new Promise(r => setTimeout(r, 2500));
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: BEYOND });
  fs.writeFileSync(OUT, Buffer.from(shot.data, 'base64'));
  console.log('saved', OUT); ws.close();
})();
