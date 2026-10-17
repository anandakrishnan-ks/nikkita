/** One-time precise migration of root-page service links to the new clean routes. */
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const replacements = [
  ['pro-government-services.html', 'services/pro-services/'],
  ['corporate-compliance.html', 'services/corporate-compliance/'],
  ['accounting-bookkeeping.html', 'services/accounting-bookkeeping/'],
  ['company-liquidation.html', 'services/company-liquidation/'],
  ['business-support.html', 'services/business-support/'],
  ['business-structuring.html', 'services/business-structuring/'],
];
let filesChanged = 0;
let linksChanged = 0;
for (const name of fs.readdirSync(cwd).filter(name => name.endsWith('.html'))) {
  const file = path.join(cwd, name);
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [oldPath, newPath] of replacements) {
    const needle = `href="${oldPath}"`;
    const count = after.split(needle).length - 1;
    if (count) { linksChanged += count; after = after.replaceAll(needle, `href="${newPath}"`); }
  }
  // The Services parent item leads to the overview, not the PRO detail.
  after = after.replaceAll('href="services/pro-services/">Services</a>', 'href="services/index.html">Services</a>');
  after = after.replace(/(<a\s+href=")services\/pro-services\/("[^>]*>\s*Services\s*<\/a)/g, '$1services/index.html$2');
  after = after.replace(/href="services\/pro-services\/"(?=\s+class="has-nav-star")/g, 'href="services/index.html"');
  if (after !== before) { fs.writeFileSync(file, after, 'utf8'); filesChanged++; }
}
console.log(`Updated ${linksChanged} service links in ${filesChanged} root HTML files.`);
