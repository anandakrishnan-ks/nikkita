/** Audit legal pages at exact viewport sizes through an existing Chrome DevTools endpoint. */
import fs from 'node:fs';
import path from 'node:path';

const port = process.argv[2] || '9227';
const captureScreenshots = process.argv.includes('--capture');
if (process.argv.includes('--cleanup')) {
  const root = process.cwd();
  for (const relative of ['.qa-refund-390.png', '.qa-refund-1024.png', '.qa-refund-footer-390.png', '.chrome-refund-audit']) {
    const target = path.resolve(root, relative);
    if (!target.startsWith(`${root}${path.sep}`)) throw new Error(`Refusing cleanup outside workspace: ${target}`);
    fs.rmSync(target, { recursive: true, force: true });
  }
  console.log('Removed legal-page QA artifacts.');
  process.exit(0);
}
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
await send('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
});

const cases = [
  ['terms-and-conditions.html', 390, 844],
  ['terms-and-conditions.html', 768, 1024],
  ['terms-and-conditions.html', 1024, 768],
  ['terms-and-conditions.html', 1440, 1000],
  ['terms-and-conditions.html', 1920, 1080],
  ['privacy-policy.html', 390, 844],
  ['privacy-policy.html', 1440, 1000],
  ['refund-cancellation-policy.html', 390, 844],
  ['refund-cancellation-policy.html', 1024, 768],
  ['refund-cancellation-policy.html', 1920, 1080],
];

for (const [page, width, height] of cases) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: width,
    screenHeight: height,
  });
  await send('Page.navigate', { url: `http://127.0.0.1:8765/${page}` });
  await wait(900);
  const { result } = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const viewport = document.documentElement.clientWidth;
      const overflowing = [...document.querySelectorAll('body *')]
        .map(element => {
          const rect = element.getBoundingClientRect();
          return { tag: element.tagName.toLowerCase(), className: String(element.className || '').slice(0, 100), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
        })
        .filter(item => item.right > viewport + 1 || item.left < -1)
        .slice(0, 12);
      const sidebar = document.querySelector('.pp-sidebar');
      return {
        page: location.pathname,
        viewport,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        overflowCount: overflowing.length,
        overflowing,
        sidebarDisplay: getComputedStyle(document.querySelector('.pp-sidebar')).display,
        sidebarPosition: sidebar ? getComputedStyle(sidebar).position : null,
        sidebarTop: sidebar ? Math.round(sidebar.getBoundingClientRect().top) : null,
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        mobileTocDisplay: getComputedStyle(document.querySelector('.pp-mobile-toc')).display,
      };
    })()`,
  });
  let stickyTopAfterScroll = null;
  if (width > 850) {
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 900)' });
    await wait(100);
    const stickyResult = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: 'Math.round(document.querySelector(".pp-sidebar").getBoundingClientRect().top)',
    });
    stickyTopAfterScroll = stickyResult.result.value;
  }
  if (captureScreenshots && page === 'refund-cancellation-policy.html' && [390, 1024].includes(width)) {
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
    await wait(500);
    const screenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync(`.qa-refund-${width}.png`, Buffer.from(screenshot.data, 'base64'));
    if (width === 390) {
      await send('Runtime.evaluate', { expression: 'window.scrollTo(0, document.documentElement.scrollHeight)' });
      await wait(500);
      const footerScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
      fs.writeFileSync('.qa-refund-footer-390.png', Buffer.from(footerScreenshot.data, 'base64'));
    }
  }
  console.log(JSON.stringify({ requested: `${width}x${height}`, ...result.value, stickyTopAfterScroll }));
}

socket.close();
