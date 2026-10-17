/** Rebuild the Saudi Arabia setup page from the supplied page flow, preserving shared chrome. */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const target = path.join(root, 'saudi-arabia.html');
const source = fs.readFileSync(target, 'utf8');
const start = source.indexOf('<!-- Page-specific content -->');
const end = source.indexOf('<!-- Site footer -->');
if (start < 0 || end <= start) throw new Error('Saudi page shell markers are missing');
const before = source.slice(0, start);
const after = source.slice(end);
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const icon = (name) => `<i class="las ${name}" aria-hidden="true"></i>`;
const action = (label, href, outline = false) => `<a class="sa-button${outline ? ' sa-button--outline' : ''}" href="${href}" data-sa-cta="${esc(label)}">${esc(label)} ${icon('la-arrow-right')}</a>`;
const bullets = (items) => `<ul class="sa-checks">${items.map(item => `<li>${icon('la-check')}<span>${esc(item)}</span></li>`).join('')}</ul>`;
const heading = (kicker, title, id, intro = '') => `<div class="sa-heading"><span class="sa-kicker">${esc(kicker)}</span><h2 id="${id}">${esc(title)}</h2>${intro ? `<p>${intro}</p>` : ''}</div>`;

const fit = [
  ['When Saudi may fit', 'la-check-circle', ['Long-term GCC expansion', 'Clear commercial and revenue model', 'Requirement for a Saudi market presence', 'Local customers, contracts or business opportunities', 'Readiness for ongoing regulatory requirements']],
  ['When further assessment may be needed', 'la-compass', ['Market is still being tested', 'Saudi operating model is not yet defined', 'Objective is mainly exploratory', 'Looking primarily for a quick, low-cost setup', 'Not yet ready for ongoing operational commitments']],
];
const stages = [
  'Business Activity & Structure',
  'MISA Investment Registration',
  'Company Incorporation & Commercial Registration (CR)',
  'ZATCA | GOSI | Qiwa | Mudad | Muqeem',
  'CEO / General Manager Visa | Bank Account Assistance',
];
const documents = ['Passport / identification documents', 'Parent or foreign company documents, where applicable', 'Financial statements, where required', 'Business plan / business information', 'Legalised or authenticated documents, where applicable', 'Activity-specific documents'];
const tax = [
  ['Income Tax', 'Generally 20% on relevant taxable income, subject to applicable Saudi tax rules.', 'la-percentage'],
  ['Zakat', 'Treatment depends on ownership and applicable ZATCA rules.', 'la-balance-scale'],
  ['VAT', '15%, subject to applicable registration requirements.', 'la-receipt'],
  ['Ongoing Compliance', 'Saudization and employment requirements; tax and statutory registrations; activity-specific, corporate and regulatory compliance.', 'la-clipboard-check'],
];
const support = [
  ['Market entry and structure assessment', 'la-compass'],
  ['MISA Investment Registration and company formation coordination', 'la-building'],
  ['Documentation and regulatory coordination', 'la-file-alt'],
  ['Office and operational setup support', 'la-city'],
  ['Banking assistance, subject to bank approval', 'la-university'],
  ['Post-establishment business support', 'la-hands-helping'],
];
const considerations = [
  ['Business Activity', 'Requirements and approvals may vary according to the activity.', 'la-briefcase'],
  ['Ownership', 'Foreign ownership and local participation requirements depend on the activity and applicable framework.', 'la-users'],
  ['Operational Requirements', 'Premises, staffing, visas and other requirements depend on the business and structure.', 'la-building'],
  ['Compliance', 'Saudi operations involve ongoing tax, employment and regulatory responsibilities.', 'la-clipboard-check'],
];
const faqs = [
  ['Is MISA Investment Registration required for foreign investors?', 'Foreign investors are required to register with MISA before engaging in investment activities, subject to the applicable framework.'],
  ['Can a foreign investor own 100% of a Saudi company?', 'This depends on the business activity and applicable requirements.'],
  ['Is MISA Investment Registration the same as Commercial Registration?', 'No. Investment Registration and Commercial Registration are separate parts of the establishment process.'],
  ['Do I need an office in Saudi Arabia?', 'Premises requirements depend on the business activity, structure and applicable requirements.'],
  ['How much does it cost to establish a business in Saudi Arabia?', 'Costs vary according to the activity, structure, ownership, approvals, premises and operational requirements.'],
  ['How long does Saudi company formation take?', 'The timeline varies according to the structure, documentation, Investment Registration, approvals and operational requirements.'],
  ['Can Nikki Advisory assist after establishment?', 'Yes. Support can continue with relevant corporate, compliance and operational requirements.'],
];

function head() {
  const title = 'Business Setup in Saudi Arabia | Nikki Advisory';
  const description = 'Explore Saudi Arabia business setup with Nikki Advisory: MISA Investment Registration, company formation, documentation, costs, compliance and ongoing support.';
  const image = 'https://nikkiadvisory.com/assets/imgs/saudi/business-infrastructure.webp';
  const canonical = 'https://nikkiadvisory.com/saudi-arabia.html';
  return `<head>
    <meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="theme-color" content="#102b24" />
    <title>${title}</title><meta name="description" content="${description}" /><meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonical}" /><meta property="og:type" content="website" /><meta property="og:site_name" content="Nikki Advisory" />
    <meta property="og:title" content="${title}" /><meta property="og:description" content="${description}" /><meta property="og:url" content="${canonical}" /><meta property="og:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${title}" /><meta name="twitter:description" content="${description}" /><meta name="twitter:image" content="${image}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Marcellus&amp;family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,400&amp;display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="assets/css/bootstrap.min.css" /><link rel="stylesheet" href="assets/css/swiper.min.css" /><link rel="stylesheet" href="assets/css/aos.css" />
    <link rel="stylesheet" href="assets/css/style.css" /><link rel="stylesheet" href="assets/css/responsive.css" /><link rel="stylesheet" href="assets/css/line-awesome.min.css" /><link rel="stylesheet" href="assets/css/site.css" />
    <link rel="stylesheet" href="assets/css/pages/saudi-suite.css" />
    <link rel="icon" type="image/x-icon" href="assets/imgs/favicon/favicon.ico" sizes="any" /><link rel="icon" type="image/png" href="assets/imgs/favicon/favicon-32x32.png" sizes="32x32" />
    <link rel="apple-touch-icon" href="assets/imgs/favicon/apple-touch-icon.png" />
  </head>`;
}

function form() { return `<form class="sa-form" data-sa-form="saudi-business-setup" data-lead-form="saudi-business-setup" data-endpoint="" action="mailto:info@nikkiadvisory.com" method="post" enctype="text/plain">
  <span class="sa-kicker">Tell us about your plan</span><h3>Discuss Your Saudi Business Setup</h3>
  <div class="sa-form-grid">
    <div class="sa-field"><label for="sa-name">Full Name*</label><input id="sa-name" name="name" autocomplete="name" required /></div>
    <div class="sa-field"><label for="sa-phone">Phone Number*</label><input id="sa-phone" name="phone" type="tel" autocomplete="tel" required /></div>
    <div class="sa-field sa-field--full"><label for="sa-email">Email Address*</label><input id="sa-email" name="email" type="email" autocomplete="email" required /></div>
    <div class="sa-field sa-field--full"><label for="sa-activity">Business Activity*</label><input id="sa-activity" name="business_activity" required /></div>
    <div class="sa-field sa-field--full"><label for="sa-requirement">Tell Us About Your Requirement</label><textarea id="sa-requirement" name="requirement" rows="3"></textarea></div>
    <label class="sa-consent"><input name="consent" type="checkbox" value="yes" required /><span>I agree to be contacted about this enquiry and have read the <a href="privacy-policy.html">Privacy Policy</a>.</span></label>
    <div class="sa-trap" aria-hidden="true"><label for="sa-company-site">Leave empty</label><input id="sa-company-site" name="company_site" tabindex="-1" autocomplete="off" /></div>
    <input type="hidden" name="jurisdiction" value="Saudi Arabia" /><input type="hidden" name="lead_source" /><input type="hidden" name="landing_page" />
    <button class="sa-button sa-button--submit" type="submit">Submit Enquiry ${icon('la-arrow-right')}</button>
    <p class="sa-form-status" data-sa-status role="status" aria-live="polite">Until the form endpoint is connected, this opens a prepared email for you to send.</p>
  </div>
  </form>`; }

function page() { return `<div class="saudi-suite">
  <nav class="sa-breadcrumb" aria-label="Breadcrumb"><div class="sa-container"><a href="index.html">Home</a><span>/</span><span class="sa-crumb-label">Business Setup</span><span>/</span><span aria-current="page">Saudi Arabia</span></div></nav>
  <section class="sa-hero" aria-labelledby="sa-title"><div class="sa-container sa-hero-grid"><div class="sa-hero-copy"><span class="sa-kicker">Business setup in Saudi Arabia</span><h1 id="sa-title">Establish Your Business in Saudi Arabia with Clarity and Confidence</h1><p>Saudi Arabia is a high-value, compliance-driven market for businesses entering with a clear operational and expansion strategy.</p><p>Nikki Advisory supports investors and businesses with <strong>market entry, MISA Investment Registration, company formation, regulatory coordination and post-establishment support.</strong></p>${action('Discuss Your Saudi Business Setup', '#saudi-enquiry')}<span class="sa-hero-foot">Structured entry · practical support · long-term readiness</span></div><figure class="sa-hero-image"><img src="assets/imgs/saudi/business-infrastructure.webp" alt="Illustrative modern Saudi business district and infrastructure" width="1983" height="793" fetchpriority="high" /><figcaption>Illustrative Saudi business infrastructure</figcaption></figure></div></section>
  <section class="sa-section sa-market" aria-labelledby="sa-market-title"><div class="sa-container sa-market-grid"><div>${heading('The Saudi market', 'A Structured Market for Long-Term Business', 'sa-market-title')}<p>Saudi Arabia differs from the UAE and Bahrain in its approach to business entry. Establishing a presence requires consideration of <strong>business activity, ownership, regulatory requirements and operational readiness.</strong></p><p>This is a market for businesses with a clear commercial direction and a structured approach to entering and operating in the Kingdom.</p></div><div class="sa-market-highlights"><div>${icon('la-sitemap')}<span>Structure</span></div><div>${icon('la-clipboard-check')}<span>Compliance</span></div><div>${icon('la-building')}<span>Operations</span></div></div></div></section>
  <section class="sa-section sa-section--cream" aria-labelledby="sa-fit-title"><div class="sa-container">${heading('Assess the fit', 'Is Saudi Arabia Right for Your Business?', 'sa-fit-title')}<div class="sa-fit-grid">${fit.map(([title, symbol, items]) => `<article class="sa-fit-card"><div class="sa-fit-card-head">${icon(symbol)}<h3>${esc(title)}</h3></div>${bullets(items)}</article>`).join('')}</div></div></section>
  <section class="sa-section" aria-labelledby="sa-process-title"><div class="sa-container">${heading('Saudi business setup process', 'Key Stages & Setup Requirements', 'sa-process-title')}<ol class="sa-timeline">${stages.map((stage, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span><h3>${esc(stage)}</h3></li>`).join('')}</ol><p class="sa-section-note">Requirements may vary depending on the business activity and structure.</p></div></section>
  <section class="sa-section sa-section--cream" aria-labelledby="sa-docs-title"><div class="sa-container sa-docs-grid"><div>${heading('Documentation', 'Typical Requirements', 'sa-docs-title')}<p class="sa-section-note">Requirements vary according to the investor, business activity and structure.</p></div><div class="sa-docs-panel">${bullets(documents)}</div></div></section>
  <section class="sa-section" aria-labelledby="sa-cost-title"><div class="sa-container">${heading('Cost & timeline', 'Plan for the Full Setup', 'sa-cost-title')}<div class="sa-cost-grid"><article><span>Setup cost</span><h3>SAR 30,000 – SAR 80,000+</h3><p>Cost varies based on business activity, ownership, structure, approvals, premises and operational requirements.</p></article><article><span>Timeline</span><h3>Depends on requirements and approvals</h3><p>Typically dependent on the structure, documentation, Investment Registration, approvals and operational requirements.</p></article></div><a class="sa-text-link" href="pricing/saudi-arabia/">View the individual Saudi cost &amp; process guide ${icon('la-arrow-right')}</a></div></section>
  <section class="sa-section sa-section--cream" aria-labelledby="sa-tax-title"><div class="sa-container">${heading('Tax & ongoing compliance', 'Know the Ongoing Obligations', 'sa-tax-title')}<div class="sa-tax-grid">${tax.map(([title, body, symbol]) => `<article>${icon(symbol)}<h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join('')}</div></div></section>
  <section class="sa-section" aria-labelledby="sa-support-title"><div class="sa-container">${heading('Why Nikki Advisory', 'Support Beyond Company Formation', 'sa-support-title', 'Our focus is on helping clients understand the requirements, establish the appropriate structure and move forward with clarity.')}<div class="sa-support-grid">${support.map(([body, symbol], i) => `<article>${icon(symbol)}<span>${String(i + 1).padStart(2, '0')}</span><h3>${esc(body)}</h3></article>`).join('')}</div>${action('Discuss Your Saudi Requirement', '#saudi-enquiry')}</div></section>
  <section class="sa-section sa-section--cream" aria-labelledby="sa-consider-title"><div class="sa-container">${heading('Important considerations', 'Decisions to Clarify Early', 'sa-consider-title')}<div class="sa-consider-grid">${considerations.map(([title, body, symbol]) => `<article>${icon(symbol)}<div><h3>${esc(title)}</h3><p>${esc(body)}</p></div></article>`).join('')}</div></div></section>
  <section class="sa-section" aria-labelledby="sa-faq-title"><div class="sa-container sa-faq-grid"><div>${heading('Frequently asked questions', 'Saudi Setup, Answered', 'sa-faq-title')}<p>Key questions to resolve before deciding on a structure or beginning an application.</p></div><div class="sa-faq-list">${faqs.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('')}</div></div></section>
  <section class="sa-enquiry" id="saudi-enquiry" aria-labelledby="sa-enquiry-title"><div class="sa-container sa-enquiry-grid"><div><span class="sa-kicker sa-kicker--light">Ready to explore the Saudi market?</span><h2 id="sa-enquiry-title">Start with the right structure.</h2><p>Whether you are establishing a new business, expanding from another GCC market or evaluating Saudi Arabia as your next market, the right structure should come first.</p><div class="sa-enquiry-insight">Share your requirements with Nikki Advisory and let us assess the appropriate way forward.</div><strong>Saudi Arabia rewards commitment — not shortcuts.</strong></div>${form()}</div></section>
</div>`; }

const rebuiltBefore = before.replace(/<head>[\s\S]*?<\/head>/, head()).replace('<body>', '<body class="saudi-suite-body">');
const rebuiltAfter = after.includes('assets/js/pages/saudi-suite.js') ? after : after.replace('</body>', '    <script src="assets/js/pages/saudi-suite.js"></script>\n  </body>');
fs.writeFileSync(target, rebuiltBefore + '<!-- Page-specific content -->\n      ' + page() + '\n      ' + rebuiltAfter, 'utf8');
console.log('Updated Saudi Arabia setup page.');
