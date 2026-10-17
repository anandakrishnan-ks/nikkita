import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'nikki-pp-qa-'));
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let port;
for (let i = 0; i < 80; i++) {
  const marker = path.join(profile, 'DevToolsActivePort');
  if (fs.existsSync(marker)) { port = Number(fs.readFileSync(marker, 'utf8').split('\n')[0]); break; }
  await wait(100);
}
if (!port) throw new Error('Chrome debugging endpoint unavailable');
const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let id = 0;
const pending = new Map();
ws.onmessage = event => { const message = JSON.parse(event.data); if (message.id && pending.has(message.id)) { const { resolve, reject } = pending.get(message.id); pending.delete(message.id); message.error ? reject(new Error(message.error.message)) : resolve(message.result); } };
function cdp(method, params = {}) { const next = ++id; return new Promise((resolve, reject) => { pending.set(next, { resolve, reject }); ws.send(JSON.stringify({ id: next, method, params })); }); }
async function evalJs(expression) { const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); return result.result.value; }
await cdp('Page.enable'); await cdp('Runtime.enable');
for (const width of [360, 390, 768, 1024, 1440, 1920]) {
  await cdp('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
  await cdp('Page.navigate', { url: 'http://127.0.0.1:8778/privacy-policy.html' });
  await wait(1100);
  const metrics = await evalJs(`(() => {const q=s=>document.querySelector(s);const b=s=>{const r=q(s).getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)}};return {width:innerWidth,docWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,hero:b('.pp-hero'),content:b('.pp-content-layout'),sections:document.querySelectorAll('.pp-section').length,desktopToc:getComputedStyle(q('.pp-sidebar')).display,mobileToc:getComputedStyle(q('.pp-mobile-toc')).display,brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),clipped:[...document.querySelectorAll('.pp-section,.pp-hero,.pp-mobile-toc')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className)}})()`);
  const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: width === 390 });
  const file = path.join(os.tmpdir(), `nikki-pp-${width}.png`);
  fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
  if (width === 390) {
    const viewport = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(os.tmpdir(), 'nikki-pp-390-viewport.png'), Buffer.from(viewport.data, 'base64'));
    const toc = await evalJs(`(() => {const d=document.querySelector('.pp-mobile-toc');d.querySelector('summary').click();return {open:d.open,links:d.querySelectorAll('a').length,firstTarget:document.querySelector(d.querySelector('a').getAttribute('href'))?.id}})()`);
    console.log('mobileToc', JSON.stringify(toc));
  }
  console.log(JSON.stringify({ ...metrics, screenshot: file }));
}
ws.close(); chrome.kill();
