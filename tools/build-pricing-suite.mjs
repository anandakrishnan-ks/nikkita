/** Build the pricing overview and five cost/process guides from the supplied copy. */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const site = 'https://nikkiadvisory.com';
const source = fs.readFileSync(path.join(root, 'pricing.html'), 'utf8');
const first = source.indexOf('<!-- Page-specific content -->');
const last = source.indexOf('<!-- Site footer -->');
if (first < 0 || last <= first) throw new Error('Pricing shell markers are missing');
const prefix = source.slice(0, first);
const suffix = source.slice(last);
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const write = (name, content) => { const target = path.join(root, name); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, content, 'utf8'); };

const routes = [
  {
    slug: 'uae-free-zone', name: 'UAE Free Zone', region: 'UAE / Dubai', number: '01',
    title: 'UAE Free Zone Setup Cost & Process', description: 'Indicative UAE Free Zone company setup cost, timeline, process, documents and tax considerations. Compare your options with Nikki Advisory.',
    intro: 'Explore the indicative investment and practical steps for a Free Zone business setup. Your authority, activity and visa needs will shape the final quotation.',
    price: 'AED 4,888 Onwards', priceLabel: 'Basic setup', extraPrice: 'AED 15,000 – AED 30,000+', extraLabel: 'With visa & operations', timeline: '2 – 7 working days',
    variance: 'Varies by Free Zone, activity and visa requirement.',
    process: ['Select activity & authority', 'Trade name reservation', 'Application submission', 'Licence issuance', 'Visa, if required'],
    documents: ['Passport copy', 'Photograph', 'Application form'],
    insight: 'The authority, licence activity and visa allocation are the key decisions to confirm before comparing packages.',
    image: 'assets/imgs/gcc-uae-card.jpg', alt: 'Dubai skyline, representing UAE Free Zone setup options', related: 'business-setup-uae.html', relatedLabel: 'Explore UAE Setup',
    tax: 'UAE Corporate Tax is generally 9% on taxable income above AED 375,000. Qualifying Free Zone Persons may have different treatment for qualifying income. VAT is 5%; mandatory registration generally applies when taxable supplies and imports exceed AED 375,000.',
  },
  {
    slug: 'uae-mainland', name: 'UAE Mainland', region: 'UAE / Dubai', number: '02',
    title: 'UAE Mainland Setup Cost & Process', description: 'Indicative UAE Mainland company setup cost, timeline, process and documents, with important office and approval considerations.',
    intro: 'Understand the likely cost range and sequence for mainland formation before you commit to an activity, premises or licence application.',
    price: 'AED 18,000 – AED 40,000+', priceLabel: 'Indicative setup', timeline: '5 – 10 working days',
    variance: 'Depends on approvals and office requirements.',
    process: ['Activity finalisation', 'Trade name & approval', 'Office registration / Ejari', 'Licence issuance', 'Visa processing'],
    documents: ['Passport copy', 'Address proof', 'Business details'],
    insight: 'Approval requirements and the office arrangement can materially change the final cost and timing.',
    image: 'assets/imgs/gcc-uae-card.jpg', alt: 'Dubai skyline, representing UAE Mainland company formation', related: 'dubai-mainland.html', relatedLabel: 'Explore Dubai Mainland',
    tax: 'UAE Corporate Tax is generally 9% on taxable income above AED 375,000. VAT is 5%; mandatory registration generally applies when taxable supplies and imports exceed AED 375,000.',
  },
  {
    slug: 'uae-offshore', name: 'UAE Offshore', region: 'UAE / Dubai', number: '03',
    title: 'UAE Offshore Setup Cost & Process', description: 'Indicative UAE Offshore incorporation cost, timeline, process and documents, including key operational limitations.',
    intro: 'An offshore structure serves a different purpose from an operating mainland or Free Zone company. Check the limitations before comparing the lower setup range.',
    price: 'AED 8,000 – AED 18,000+', priceLabel: 'Indicative incorporation', timeline: '3 – 7 working days',
    variance: 'Final fees vary by jurisdiction, structure and documentation.',
    process: ['Jurisdiction selection', 'Name approval', 'Documentation', 'Incorporation'],
    documents: ['Passport copy', 'Address proof', 'Business profile'],
    insight: 'This offshore route does not permit UAE operations or provide visas, and it does not require an office.',
    image: 'assets/imgs/pricing-cost-hero.webp', alt: 'Illustrative papers and folio for planning an offshore company structure', related: 'ajman-offshore.html', relatedLabel: 'Explore Offshore Setup',
    tax: 'Tax treatment depends on the entity and its activities. Obtain case-specific advice; the indicative incorporation range is not a tax assessment.',
  },
  {
    slug: 'saudi-arabia', name: 'Saudi Arabia', region: 'Saudi Arabia', number: '04',
    title: 'Saudi Arabia Business Setup Cost & Process', description: 'Indicative Saudi Arabia company formation cost, 4–8 week timeline, licensing process, documents and tax considerations.',
    intro: 'Saudi market entry is a structured, compliance-driven undertaking suited to long-term operational plans. See the stages and likely requirements before seeking a tailored quotation.',
    price: 'SAR 25,000 Onwards', priceLabel: 'Indicative setup', timeline: '4 – 8 weeks',
    variance: 'Varies by approvals, activity and structure. Approvals or documentation may extend the timeline.',
    process: ['Business structure definition', 'Investment licence approval via the Ministry of Investment', 'Trade name & documentation', 'Commercial Registration (CR)', 'Government registrations', 'Office setup & bank account', 'Operational activation'],
    documents: ['Passport copy', 'Business plan', 'Company profile / parent documents'],
    insight: 'Office setup is required. This is not a quick or low-cost market entry; plan for approvals and operational readiness.',
    image: 'assets/imgs/gcc-saudi-card.jpg', alt: 'Riyadh skyline, representing Saudi Arabia business setup', related: 'saudi-arabia.html', relatedLabel: 'Explore Saudi Setup',
    tax: 'Corporate income tax is generally 20% on the non-Saudi ownership share of taxable income. Zakat is generally 2.5% of the applicable base for Saudi/GCC ownership. Standard VAT is 15%; registration depends on applicable thresholds.',
  },
  {
    slug: 'bahrain', name: 'Bahrain', region: 'Bahrain', number: '05',
    title: 'Bahrain Business Setup Cost & Process', description: 'Indicative Bahrain company setup cost, 5–10 working day timeline, registration process, documents and tax considerations.',
    intro: 'Review the indicative cost, Commercial Registration sequence and key documents for a Bahrain setup, then refine the scope for your activity.',
    price: 'BHD 800 Onwards', priceLabel: 'Indicative setup', timeline: '5 – 10 working days',
    variance: 'Final cost depends on activity, licensing, office and banking requirements.',
    process: ['Activity selection', 'Trade name reservation', 'CR issuance', 'Licence', 'Office & bank setup'],
    documents: ['Passport copy', 'Address details', 'Business activity'],
    insight: 'The activity and required licence determine which approvals and premises arrangements apply.',
    image: 'assets/imgs/gcc-bahrain-card.jpg', alt: 'Manama skyline, representing Bahrain business setup', related: 'bahrain.html', relatedLabel: 'Explore Bahrain Setup',
    tax: 'Corporate income tax is generally 0% for most sectors, subject to applicable exceptions and special regimes. Standard VAT is 10%.',
  },
];

function head(title, description, canonical, image) {
  const t = esc(title), d = esc(description), c = esc(site + canonical), i = esc(site + '/' + image);
  return `<head>
    <meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#102b24" /><title>${t} | Nikki Advisory</title>
    <meta name="description" content="${d}" /><meta name="robots" content="index, follow" />
    <link rel="canonical" href="${c}" /><meta property="og:type" content="website" />
    <meta property="og:site_name" content="Nikki Advisory" /><meta property="og:title" content="${t} | Nikki Advisory" />
    <meta property="og:description" content="${d}" /><meta property="og:url" content="${c}" /><meta property="og:image" content="${i}" />
    <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${t} | Nikki Advisory" />
    <meta name="twitter:description" content="${d}" /><meta name="twitter:image" content="${i}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Marcellus&amp;family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,400&amp;display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="assets/css/bootstrap.min.css" /><link rel="stylesheet" href="assets/css/swiper.min.css" />
    <link rel="stylesheet" href="assets/css/aos.css" /><link rel="stylesheet" href="assets/css/style.css" />
    <link rel="stylesheet" href="assets/css/responsive.css" /><link rel="stylesheet" href="assets/css/line-awesome.min.css" />
    <link rel="stylesheet" href="assets/css/site.css" /><link rel="stylesheet" href="assets/css/pages/pricing-suite.css" />
    <link rel="icon" type="image/x-icon" href="assets/imgs/favicon/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" href="assets/imgs/favicon/favicon-32x32.png" sizes="32x32" />
    <link rel="apple-touch-icon" href="assets/imgs/favicon/apple-touch-icon.png" />
  </head>`;
}

function breadcrumb(current, detail = false) {
  return `<nav class="pc-breadcrumb visual-breadcrumb visual-breadcrumb--pricing" aria-label="Breadcrumb"><div class="pc-container visual-breadcrumb__inner"><p class="visual-breadcrumb__title">${esc(detail ? current : 'Pricing')}</p><div class="visual-breadcrumb__trail"><a href="index.html">Home</a><span aria-hidden="true">/</span>${detail ? '<a href="pricing.html">Pricing</a><span aria-hidden="true">/</span>' : ''}<span aria-current="page">${esc(current)}</span></div></div></nav>`;
}

function button(label, href, style = '') { return `<a class="pc-button${style ? ' pc-button--' + style : ''}" href="${href}" data-pc-cta="${esc(label)}">${esc(label)} <i class="las la-arrow-right" aria-hidden="true"></i></a>`; }
function list(items, ordered = false) { return `<${ordered ? 'ol' : 'ul'} class="pc-${ordered ? 'steps' : 'checks'}">${items.map((item, i) => `<li>${ordered ? `<span>${String(i + 1).padStart(2, '0')}</span>` : '<i class="las la-check" aria-hidden="true"></i>'}<span>${esc(item)}</span></li>`).join('')}</${ordered ? 'ol' : 'ul'}>`; }
function taxNote(text, region) {
  const links = region === 'UAE'
    ? '<a href="https://tax.gov.ae/en/taxes/corporate.tax/faqs.aspx" target="_blank" rel="noopener noreferrer">UAE Federal Tax Authority</a>'
    : region === 'Saudi Arabia'
      ? '<a href="https://zatca.gov.sa/en/Pages/IncomeTax.aspx" target="_blank" rel="noopener noreferrer">ZATCA</a>'
      : '<a href="https://www.nbr.gov.bh/" target="_blank" rel="noopener noreferrer">Bahrain NBR</a>';
  return `<aside class="pc-tax pc-notice-card" aria-label="Tax considerations"><div><span class="pc-notice-heading">Tax considerations</span><p class="pc-notice-copy">${esc(text)}</p><small class="pc-notice-footnote">General guidance only; confirm current rules and eligibility with the authority or a qualified adviser. ${links}</small></div></aside>`;
}

function quoteForm(route = '') {
  const selected = route ? routes.find(r => r.slug === route) : null;
  return `<form class="pc-form" data-pc-form="${esc(route || 'pricing-overview')}" data-lead-form="${esc(route || 'pricing-overview')}" data-endpoint="" action="mailto:info@nikkiadvisory.com" method="post" enctype="text/plain">
    <div class="pc-form-head"><span class="pc-kicker">Your requirements</span><h3>Request a detailed quotation</h3><p>Tell us about the business you intend to establish.</p></div>
    <div class="pc-form-grid">
      <div class="pc-field"><label for="pc-name">Full Name<span>*</span></label><input id="pc-name" name="name" autocomplete="name" required /></div>
      <div class="pc-field"><label for="pc-phone">Phone Number<span>*</span></label><input id="pc-phone" name="phone" type="tel" autocomplete="tel" required /></div>
      <div class="pc-field"><label for="pc-email">Email Address<span>*</span></label><input id="pc-email" name="email" type="email" autocomplete="email" required /></div>
      <div class="pc-field"><label for="pc-jurisdiction">Preferred Jurisdiction<span>*</span></label><select id="pc-jurisdiction" name="jurisdiction" required><option value="">Select a jurisdiction</option><option${selected?.region.startsWith('UAE') ? ' selected' : ''}>UAE</option><option${selected?.region === 'Saudi Arabia' ? ' selected' : ''}>Saudi Arabia</option><option${selected?.region === 'Bahrain' ? ' selected' : ''}>Bahrain</option><option>Not Sure</option></select></div>
      <div class="pc-field pc-field--full"><label for="pc-activity">Business Activity<span>*</span></label><input id="pc-activity" name="business_activity" required /></div>
      <div class="pc-field pc-field--full"><label for="pc-requirement">Tell Us About Your Requirement</label><textarea id="pc-requirement" name="requirement" rows="3"></textarea></div>
      <label class="pc-consent"><input name="consent" type="checkbox" value="yes" required /><span>I agree to be contacted about this enquiry and have read the <a href="privacy-policy.html">Privacy Policy</a>.</span></label>
      <div class="pc-trap" aria-hidden="true"><label for="pc-company-site">Leave empty</label><input id="pc-company-site" name="company_site" tabindex="-1" autocomplete="off" /></div>
      <input type="hidden" name="route" value="${esc(selected?.name || 'Not specified')}" /><input type="hidden" name="lead_source" /><input type="hidden" name="landing_page" />
      <button class="pc-button pc-button--submit" type="submit">Submit Enquiry <i class="las la-arrow-right" aria-hidden="true"></i></button>
      <p class="pc-form-status" data-pc-status role="status" aria-live="polite">Until the form endpoint is connected, this opens a prepared email for you to send.</p>
    </div>
  </form>`;
}

function quotation(route = '') { return `<section class="pc-quotation" id="quotation" aria-labelledby="pc-quotation-title"><div class="pc-container pc-quotation-grid"><div class="pc-quotation-copy"><span class="pc-kicker pc-kicker--light">Get a detailed quotation</span><h2 id="pc-quotation-title">A price built around your business.</h2><p>Business setup costs are indicative. Your final cost depends on your business activity, structure, jurisdiction and requirements.</p><div class="pc-quote-line">Share your requirements with Nikki Advisory and receive a detailed quotation tailored to your setup.</div></div>${quoteForm(route)}</div></section>`; }
function finalNote() { return `<aside class="pc-final"><div class="pc-container"><p>Business setup is not only about cost — structure, compliance, and long-term planning define success.</p><strong>“The right setup is not the cheapest — it’s the one aligned with your business goals.”</strong></div></aside>`; }

function overviewCard(r) { return `<article class="pc-route-card"><div class="pc-route-top"><span class="pc-route-number">${r.number} / UAE</span><i class="las ${r.slug === 'uae-free-zone' ? 'la-city' : r.slug === 'uae-mainland' ? 'la-building' : 'la-globe'}" aria-hidden="true"></i></div><h3>${esc(r.name.replace('UAE ', ''))}</h3><div class="pc-card-block"><span>Cost</span><strong>${esc(r.price)}</strong><small>${esc(r.priceLabel)}</small>${r.extraPrice ? `<strong>${esc(r.extraPrice)}</strong><small>${esc(r.extraLabel)}</small>` : ''}<em>${esc(r.variance)}</em></div><div class="pc-card-block"><span>Timeline</span><strong>${esc(r.timeline)}</strong></div><div class="pc-card-block"><span>Process</span>${list(r.process, true)}</div><div class="pc-card-block"><span>Documents</span>${list(r.documents)}</div>${r.slug === 'uae-offshore' ? `<p class="pc-offshore-note">${esc(r.insight)}</p>` : ''}<p class="pc-terms-note">Terms &amp; Conditions apply.</p><a class="pc-text-link" href="${r.slug}-pricing.html" data-pc-cta="view-${r.slug}">View cost &amp; process <i class="las la-arrow-right" aria-hidden="true"></i></a></article>`; }

function overview() {
  const uae = routes.slice(0, 3);
  const saudi = routes[3], bahrain = routes[4];
  return `<div class="pricing-suite pricing-suite--overview">
    ${breadcrumb('Cost & Process')}
    <section class="pc-hero" aria-labelledby="pc-title"><div class="pc-container pc-hero-grid"><div class="pc-hero-copy"><span class="pc-kicker">Business setup cost &amp; process</span><h1 id="pc-title">Understand the Cost Before You Set Up</h1><p>Understanding the cost, timeline, process and tax considerations is essential before establishing a business in the GCC. Each jurisdiction has different structures, approval requirements and compliance obligations.</p><div class="pc-hero-actions">${button('Discuss Your Business Setup', '#quotation')}${button('Compare Setup Routes', '#uae-options', 'outline')}</div><div class="pc-hero-foot">UAE <span>·</span> Saudi Arabia <span>·</span> Bahrain</div></div><figure class="pc-hero-image"><img src="assets/imgs/pricing-cost-hero.webp" alt="Illustrative papers, folio and calculator in a GCC office" width="1536" height="1024" fetchpriority="high" /><figcaption>Illustrative visual · plan with clarity</figcaption></figure></div></section>
    <section class="pc-section pc-section--cream" id="uae-options" aria-labelledby="pc-uae-title"><div class="pc-container"><div class="pc-section-heading"><div><span class="pc-kicker">01 / UAE</span><h2 id="pc-uae-title">Three routes. Different operating models.</h2></div><p>Compare the indicative costs and practical requirements for Free Zone, Mainland and Offshore setup.</p></div><div class="pc-route-grid">${uae.map(overviewCard).join('')}</div>${taxNote('Corporate Tax is generally 9% on taxable income above AED 375,000. Qualifying Free Zone Persons may have different treatment for qualifying income. VAT is 5%; mandatory registration generally applies when taxable supplies and imports exceed AED 375,000.', 'UAE')}</div></section>
    <section class="pc-section" id="saudi-arabia" aria-labelledby="pc-saudi-title"><div class="pc-container pc-region-grid"><div class="pc-region-lead"><span class="pc-kicker">02 / Saudi Arabia</span><h2 id="pc-saudi-title">A structured route to a long-term presence.</h2><p>Saudi Arabia is suitable for serious expansion and long-term operational presence. It is a compliance-driven market, with office setup and staged approvals to plan for.</p><figure><img src="${saudi.image}" alt="${saudi.alt}" width="638" height="811" loading="eager" /></figure></div><div class="pc-region-details"><div class="pc-region-metrics"><div><span>Indicative cost</span><strong>${saudi.price}</strong><small>${saudi.variance}</small></div><div><span>Timeline</span><strong>${saudi.timeline}</strong><small>May extend with approvals or documentation.</small></div></div><p class="pc-terms-note">Terms &amp; Conditions apply.</p><div class="pc-region-columns"><div><h3>Process</h3>${list(saudi.process, true)}</div><div><h3>Documents</h3>${list(saudi.documents)}<div class="pc-region-callout"><strong>Important</strong><p>Office setup required. Not a quick or low-cost entry.</p></div></div></div>${taxNote(saudi.tax, 'Saudi Arabia')}${button('Explore Saudi Cost & Process', `${saudi.slug}-pricing.html`, 'outline')}</div></div></section>
    <section class="pc-section pc-section--cream" id="bahrain" aria-labelledby="pc-bahrain-title"><div class="pc-container pc-bahrain-grid"><figure><img src="${bahrain.image}" alt="${bahrain.alt}" width="638" height="811" loading="eager" /></figure><div><span class="pc-kicker">03 / Bahrain</span><h2 id="pc-bahrain-title">A clear path from activity to registration.</h2><div class="pc-region-metrics"><div><span>Indicative cost</span><strong>${bahrain.price}</strong></div><div><span>Timeline</span><strong>${bahrain.timeline}</strong></div></div><p class="pc-terms-note">Terms &amp; Conditions apply.</p><div class="pc-region-columns"><div><h3>Process</h3>${list(bahrain.process, true)}</div><div><h3>Documents</h3>${list(bahrain.documents)}</div></div>${taxNote(bahrain.tax, 'Bahrain')}${button('Explore Bahrain Cost & Process', `${bahrain.slug}-pricing.html`, 'outline')}</div></div></section>
    <section class="pc-clarity" aria-labelledby="pc-clarity-title"><div class="pc-container"><div><span class="pc-kicker pc-kicker--light">Pricing clarity</span><h2 id="pc-clarity-title">What changes the final quote?</h2><p>These ranges are indicative. Bank account approval is subject to business activity, documentation and compliance review.</p></div><ul><li>Business activity</li><li>Visa requirements</li><li>Office setup</li><li>Regulatory approvals</li><li>Ownership structure</li></ul></div></section>
    <section class="pc-section pc-role" aria-labelledby="pc-role-title"><div class="pc-container"><div class="pc-section-heading"><div><span class="pc-kicker">Our role</span><h2 id="pc-role-title">Support from setup to operational readiness.</h2></div><p>We coordinate the decisions and practical steps that turn a business plan into an operating structure.</p></div><div class="pc-role-grid">${[['Business advisory','la-compass'],['Company formation','la-building'],['Government approvals','la-stamp'],['Compliance & office setup','la-clipboard-check'],['Visa & banking assistance','la-passport']].map(([n,icon]) => `<div><i class="las ${icon}" aria-hidden="true"></i><span>${n}</span></div>`).join('')}</div></div></section>
    ${quotation()}${finalNote()}
  </div>`;
}

function guide(r) {
  const others = routes.filter(item => item.slug !== r.slug);
  return `<div class="pricing-suite pricing-suite--guide">
    ${breadcrumb(r.name + ' Cost & Process', true)}
    <section class="pc-guide-hero" aria-labelledby="pc-title"><div class="pc-container pc-guide-hero-grid"><div><span class="pc-kicker">${esc(r.region)} / setup guide</span><h1 id="pc-title">${esc(r.title)}</h1><p>${esc(r.intro)}</p><div class="pc-hero-actions">${button('Request a Detailed Quotation', '#quotation')}${button('Compare All Routes', 'pricing.html', 'outline')}</div></div><figure><img src="${esc(r.image)}" alt="${esc(r.alt)}" loading="eager" /></figure></div></section>
    <section class="pc-section pc-section--cream" id="cost" aria-labelledby="pc-cost-title"><div class="pc-container pc-guide-cost-grid"><div><span class="pc-kicker">01 / Cost</span><h2 id="pc-cost-title">Understand the indicative investment.</h2><p>The range is a planning guide, not a fixed package or final quotation.</p></div><div class="pc-cost-panel"><span>${esc(r.priceLabel)}</span><strong>${esc(r.price)}</strong>${r.extraPrice ? `<div><span>${esc(r.extraLabel)}</span><strong>${esc(r.extraPrice)}</strong></div>` : ''}<p>${esc(r.variance)}</p><p class="pc-terms-note">Terms &amp; Conditions apply.</p></div></div></section>
    <section class="pc-section" id="process" aria-labelledby="pc-process-title"><div class="pc-container pc-guide-process-grid"><div><span class="pc-kicker">02 / Process</span><h2 id="pc-process-title">The sequence from decision to setup.</h2><p>Allow approximately <strong>${esc(r.timeline)}</strong>, subject to documentation, authority review and any required approvals.</p><div class="pc-guide-insight"><i class="las la-lightbulb" aria-hidden="true"></i><p>${esc(r.insight)}</p></div></div><div class="pc-process-panel">${list(r.process, true)}</div></div></section>
    <section class="pc-section pc-section--cream" id="documents" aria-labelledby="pc-docs-title"><div class="pc-container pc-guide-docs-grid"><div><span class="pc-kicker">03 / Documents</span><h2 id="pc-docs-title">What to prepare first.</h2><p>The initial documents below help start the application. Authorities may request additional information for your activity or structure.</p></div><div class="pc-docs-panel">${list(r.documents)}</div></div></section>
    <section class="pc-section pc-guide-tax" aria-labelledby="pc-tax-title"><div class="pc-container"><div class="pc-section-heading"><div><span class="pc-kicker">04 / Tax &amp; considerations</span><h2 id="pc-tax-title">Keep the ongoing obligations in view.</h2></div></div>${taxNote(r.tax, r.region.startsWith('UAE') ? 'UAE' : r.region)}</div></section>
    <nav class="pc-guide-related" aria-label="Related setup guidance"><div class="pc-container"><span>Continue exploring</span><a href="${esc(r.related)}">${esc(r.relatedLabel)} <i class="las la-arrow-right" aria-hidden="true"></i></a>${others.map(item => `<a href="${item.slug}-pricing.html">${esc(item.name)} <i class="las la-arrow-right" aria-hidden="true"></i></a>`).join('')}</div></nav>
    ${quotation(r.slug)}${finalNote()}
  </div>`;
}

function assemble(body, title, description, canonical, image) {
  const before = prefix.replace(/<head>[\s\S]*?<\/head>/, head(title, description, canonical, image)).replace('<body>', '<body class="pricing-suite-body">');
  const after = suffix.includes('assets/js/pages/pricing-suite.js') ? suffix : suffix.replace('</body>', '    <script src="assets/js/pages/pricing-suite.js"></script>\n  </body>');
  return before + '<!-- Page-specific content -->\n      ' + body + '\n      ' + after;
}
write('pricing.html', assemble(overview(), 'Business Setup Cost & Process in UAE, Saudi Arabia & Bahrain', 'Compare indicative setup costs, timelines, processes and documents for UAE Free Zone, Mainland and Offshore, Saudi Arabia and Bahrain.', '/pricing.html', 'assets/imgs/pricing-cost-hero.webp'));
for (const r of routes) {
  const html = assemble(guide(r), r.title, r.description, `/${r.slug}-pricing.html`, r.image);
  write(`${r.slug}-pricing.html`, html);
}
console.log('Updated pricing overview and five flat individual cost/process guides.');
