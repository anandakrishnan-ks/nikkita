/** Audit the Blogs and Contact pages through an existing Chrome DevTools endpoint. */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
if (process.argv.includes('--cleanup')) {
  for (const relative of ['.qa-blogs-390.png', '.qa-blogs-1440.png', '.qa-contact-390.png', '.qa-contact-1440.png', '.chrome-bc-audit']) {
    const target = path.resolve(root, relative);
    if (!target.startsWith(`${root}${path.sep}`)) throw new Error(`Refusing cleanup outside workspace: ${target}`);
    fs.rmSync(target, { recursive: true, force: true });
  }
  console.log('Removed Blogs and Contact QA artifacts.');
  process.exit(0);
}

const port = process.argv[2] || '9228';
const capture = process.argv.includes('--capture');
const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json());
const target = targets.find(item => item.type === 'page');
if (!target) throw new Error('No Chrome page target found');
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
let sequence = 0;
const pending = new Map();
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });

const cases = [
  ['blogs.html', 390, 844], ['blogs.html', 768, 1024], ['blogs.html', 1024, 768], ['blogs.html', 1440, 1000], ['blogs.html', 1920, 1080],
  ['contact-us.html', 390, 844], ['contact-us.html', 768, 1024], ['contact-us.html', 1024, 768], ['contact-us.html', 1440, 1000], ['contact-us.html', 1920, 1080],
];
for (const [page, width, height] of cases) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false, screenWidth: width, screenHeight: height });
  const pageUrl = process.argv.includes('--file') ? pathToFileURL(path.join(root, page)).href : `http://127.0.0.1:8765/${page}`;
  await send('Page.navigate', { url: pageUrl });
  await wait(850);
  const evaluation = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const viewport = document.documentElement.clientWidth;
      const suite = document.querySelector('.bc-suite');
      const visibleOverflow = [...document.querySelectorAll('.bc-suite *')].map(element => {
        const rect = element.getBoundingClientRect();
        return { tag:element.tagName.toLowerCase(), className:String(element.className || '').slice(0,80), left:Math.round(rect.left), right:Math.round(rect.right), width:Math.round(rect.width) };
      }).filter(item => item.right > viewport + 1 || item.left < -1).slice(0,10);
      return {
        viewport,
        scrollWidth:document.documentElement.scrollWidth,
        bodyScrollWidth:document.body.scrollWidth,
        suiteWidth:Math.round(suite.getBoundingClientRect().width),
        visibleOverflow,
        h1:document.querySelector('.bc-suite h1')?.innerText,
        h1Size:getComputedStyle(document.querySelector('.bc-suite h1')).fontSize,
      };
    })()`,
  });
  if (evaluation.exceptionDetails) throw new Error(`${page} ${width}px audit failed: ${evaluation.exceptionDetails.exception?.description || evaluation.exceptionDetails.text}`);
  const { result } = evaluation;
  if (capture && [390, 1440].includes(width)) {
    const screenshot = await send('Page.captureScreenshot', { format:'png', fromSurface:true });
    fs.writeFileSync(`.qa-${page === 'blogs.html' ? 'blogs' : 'contact'}-${width}.png`, Buffer.from(screenshot.data, 'base64'));
  }
  console.log(JSON.stringify({ requested:`${width}x${height}`, page, ...result.value }));
}
socket.close();
