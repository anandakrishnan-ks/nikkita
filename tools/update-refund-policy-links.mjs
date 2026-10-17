/** Add the refund policy to every current site footer and to the sitemap. */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const excluded = new Set(['.git', 'legacy-next-export', 'node_modules', 'vendor']);
const htmlFiles = [];
const walk = directory => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excluded.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(fullPath);
  }
};
walk(root);

let changed = 0;
for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');
  if (/<li><a href="(?:\.\.\/)*refund-cancellation-policy\.html">Refund &amp; Cancellation Policy<\/a><\/li>/.test(html)) continue;
  const next = html.replace(
    /([ \t]*)<li><a href="((?:\.\.\/)*)privacy-policy\.html">Privacy Policy<\/a><\/li>/,
    (match, indent, prefix) => `${match}\n${indent}<li><a href="${prefix}refund-cancellation-policy.html">Refund &amp; Cancellation Policy</a></li>`,
  );
  if (next !== html) {
    fs.writeFileSync(file, next, 'utf8');
    changed += 1;
  }
}

const sitemapPath = path.join(root, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const refundUrl = '  <url><loc>https://nikkiadvisory.com/refund-cancellation-policy.html</loc></url>';
if (!sitemap.includes('refund-cancellation-policy.html')) {
  sitemap = sitemap.replace(
    '  <url><loc>https://nikkiadvisory.com/terms-and-conditions.html</loc></url>',
    `${refundUrl}\n  <url><loc>https://nikkiadvisory.com/terms-and-conditions.html</loc></url>`,
  );
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
}

console.log(`Updated refund policy footer links in ${changed} HTML files.`);
