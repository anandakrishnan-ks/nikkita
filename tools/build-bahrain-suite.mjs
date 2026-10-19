/** Rebuild the Bahrain setup detail page while preserving the shared site header and footer. */
import fs from 'node:fs';
import path from 'node:path';

const target = path.join(process.cwd(), 'bahrain.html');
const source = fs.readFileSync(target, 'utf8');
const start = source.indexOf('<!-- Page-specific content -->');
const end = source.indexOf('<!-- Site footer -->');
if (start < 0 || end <= start) throw new Error('Bahrain page shell markers are missing');
const before = source.slice(0, start);
const after = source.slice(end);
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const icon = name => `<i class="las ${name}" aria-hidden="true"></i>`;
const action = (label, href) => `<a class="sa-button" href="${href}" data-bh-cta="${esc(label)}">${esc(label)} ${icon('la-arrow-right')}</a>`;
const bullets = items => `<ul class="sa-checks">${items.map(item => `<li>${icon('la-check')}<span>${esc(item)}</span></li>`).join('')}</ul>`;
const heading = (kicker, title, id, intro = '') => `<div class="sa-heading"><span class="sa-kicker">${esc(kicker)}</span><h2 id="${id}">${esc(title)}</h2>${intro ? `<p>${esc(intro)}</p>` : ''}</div>`;

const fit = [
  ['When Bahrain may fit', 'la-check-circle', ['First-time GCC market entry', 'Service-based or consultancy businesses', 'Cost-controlled setup', 'Lower operational commitments', 'Testing regional demand']],
  ['When UAE or Saudi Arabia may be more suitable', 'la-compass', ['Strong international branding is a priority — UAE', 'Large-scale contracts or government opportunities are the focus — Saudi Arabia', 'A larger domestic market presence is required']],
];
const stages = ['Business Activity & Structure', 'Trade Name Reservation', 'Commercial Registration (CR)', 'Government Approvals & Licensing', 'Office / Address Registration | Bank Account Assistance'];
const documents = ['Passport copy', 'Address proof', 'Business activity details', 'Corporate documents, where applicable', 'Additional activity-specific documents, where required'];
const tax = [
  ['Corporate Tax', '0% in most sectors. Sector-specific and qualifying multinational-group rules may apply.', 'la-percentage'],
  ['VAT', '10% standard rate. Some supplies may be zero-rated or exempt.', 'la-receipt'],
  ['VAT Registration', 'Mandatory above BHD 37,500 in annual taxable supplies; voluntary from BHD 18,750 where qualifying conditions are met.', 'la-file-invoice-dollar'],
  ['Ongoing Compliance', 'Activity-specific approvals; office requirements; tax and VAT obligations; corporate, regulatory and banking compliance.', 'la-clipboard-check'],
];
const support = [
  ['Business structure and jurisdiction advisory', 'la-compass'],
  ['Company registration and licensing', 'la-building'],
  ['Documentation and approval coordination', 'la-file-alt'],
  ['Compliance and operational guidance', 'la-clipboard-check'],
  ['Bank account assistance, subject to approval', 'la-university'],
];
const considerations = [
  ['Business Activity', 'Some activities require additional approvals.', 'la-briefcase'],
  ['Office Requirements', 'Requirements vary depending on the business type and activity.', 'la-building'],
  ['Banking', "Bank account approval is subject to the bank's compliance requirements and business profile.", 'la-university'],
  ['Market Fit', 'Bahrain can be particularly relevant for lean, service-based and regional businesses.', 'la-globe'],
];
const faqs = [
  ['Is Bahrain suitable for first-time GCC businesses?', 'Bahrain can be a practical option for businesses seeking a cost-controlled and operationally flexible GCC entry.'],
  ['How much does it cost to set up a business in Bahrain?', 'Indicative setup costs range from BHD 800 to BHD 3,000+, depending on the activity, licence type, office requirements and other applicable costs.'],
  ['How long does company formation take?', 'The indicative timeline is 5–10 working days, subject to documentation, approvals and authority processing.'],
  ['Do all businesses require additional approvals?', 'Not necessarily. Additional approvals may apply depending on the selected business activity.'],
  ['Is an office required in Bahrain?', 'Office and address requirements depend on the business type, activity and applicable requirements.'],
  ['Is corporate tax applicable in Bahrain?', 'Bahrain generally has no broad corporate income tax across most sectors, subject to applicable rules, sector-specific exceptions and qualifying multinational-group tax rules.'],
  ['Can Nikki Advisory assist with banking?', "Yes. Nikki Advisory can assist with the bank account setup process, subject to the bank's approval and compliance requirements."],
  ['Can Nikki Advisory support us after registration?', 'Yes. Support can continue with relevant compliance, operational and corporate requirements.'],
];

function head() {
  const title = 'Business Setup in Bahrain | Nikki Advisory';
  const description = 'Explore Bahrain company formation with Nikki Advisory: Commercial Registration, licensing, documentation, indicative costs, VAT and operational support.';
  const image = 'https://nikkiadvisory.com/assets/imgs/bahrain/business-waterfront.webp';
  const canonical = 'https://nikkiadvisory.com/bahrain.html';
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
    <link rel="stylesheet" href="assets/css/pages/bahrain-suite.css" />
    <link rel="icon" type="image/x-icon" href="assets/imgs/favicon/favicon.ico" sizes="any" /><link rel="icon" type="image/png" href="assets/imgs/favicon/favicon-32x32.png" sizes="32x32" />
    <link rel="apple-touch-icon" href="assets/imgs/favicon/apple-touch-icon.png" />
  </head>`;
}

function form() { return `<form class="sa-form" data-bh-form="bahrain-business-setup" data-lead-form="bahrain-business-setup" data-endpoint="" action="mailto:info@nikkiadvisory.com" method="post" enctype="text/plain">
  <span class="sa-kicker">Tell us about your plan</span><h3>Discuss Your Bahrain Business Setup</h3>
  <div class="sa-form-grid">
    <div class="sa-field"><label for="bh-name">Full Name*</label><input id="bh-name" name="name" autocomplete="name" required /></div>
    <div class="sa-field"><label for="bh-phone">Phone Number*</label><input id="bh-phone" name="phone" type="tel" autocomplete="tel" required /></div>
    <div class="sa-field sa-field--full"><label for="bh-email">Email Address*</label><input id="bh-email" name="email" type="email" autocomplete="email" required /></div>
    <div class="sa-field sa-field--full"><label for="bh-activity">Business Activity*</label><input id="bh-activity" name="business_activity" required /></div>
    <div class="sa-field sa-field--full"><label for="bh-requirement">Tell Us About Your Requirement</label><textarea id="bh-requirement" name="requirement" rows="3"></textarea></div>
    <label class="sa-consent"><input name="consent" type="checkbox" value="yes" required /><span>I agree to be contacted about this enquiry and have read the <a href="privacy-policy.html">Privacy Policy</a>.</span></label>
    <div class="sa-trap" aria-hidden="true"><label for="bh-company-site">Leave empty</label><input id="bh-company-site" name="company_site" tabindex="-1" autocomplete="off" /></div>
    <input type="hidden" name="jurisdiction" value="Bahrain" /><input type="hidden" name="lead_source" /><input type="hidden" name="landing_page" />
    <button class="sa-button sa-button--submit" type="submit">Submit Enquiry ${icon('la-arrow-right')}</button>
    <p class="sa-form-status" data-bh-status role="status" aria-live="polite">Until the form endpoint is connected, this opens a prepared email for you to send.</p>
  </div>
  </form>`; }

function page() { return `<div class="saudi-suite bahrain-suite">
  <nav class="sa-breadcrumb visual-breadcrumb visual-breadcrumb--bahrain" aria-label="Breadcrumb"><div class="sa-container visual-breadcrumb__inner"><p class="visual-breadcrumb__title">Bahrain Business Setup</p><div class="visual-breadcrumb__trail"><a href="index.html">Home</a><span>/</span><span class="sa-crumb-label">Business Setup</span><span>/</span><span aria-current="page">Bahrain</span></div></div></nav>
  <section class="sa-hero" aria-labelledby="bh-title"><div class="sa-container sa-hero-grid"><div class="sa-hero-copy"><span class="sa-kicker">Business setup in Bahrain</span><h1 id="bh-title">Establish Your Business in Bahrain with Clarity and Confidence</h1><p>Bahrain offers a practical and cost-efficient entry point into the GCC for businesses seeking operational flexibility with a relatively streamlined setup environment.</p><p>Nikki Advisory supports businesses with <strong>company formation, commercial registration, licensing, documentation, approvals and post-establishment requirements.</strong></p>${action('Discuss Your Bahrain Business Setup', '#bahrain-enquiry')}<span class="sa-hero-foot">Practical entry · flexible operations · regional perspective</span></div><figure class="sa-hero-image"><img src="assets/imgs/bahrain/business-waterfront.webp" alt="Illustrative Bahrain-inspired waterfront business district at golden hour" width="1672" height="941" fetchpriority="high" /><figcaption>Illustrative Bahrain business district</figcaption></figure></div></section>
  <section class="sa-section sa-market" aria-labelledby="bh-market-title"><div class="sa-container sa-market-grid"><div>${heading('The Bahrain market', 'A Practical Entry Point into the GCC', 'bh-market-title')}<p>Bahrain can be a suitable starting point for businesses seeking a <strong>cost-controlled and operationally flexible GCC presence</strong>, particularly for service-based and consultancy businesses.</p><p>It can also be considered by businesses looking to develop regional operations while evaluating opportunities in larger GCC markets.</p></div><div class="sa-market-highlights"><div>${icon('la-coins')}<span>Cost-efficient</span></div><div>${icon('la-sitemap')}<span>Operational flexibility</span></div><div>${icon('la-globe')}<span>GCC access</span></div></div></div></section>
  <section class="sa-section sa-section--cream" aria-labelledby="bh-fit-title"><div class="sa-container">${heading('Assess the fit', 'Is Bahrain Right for Your Business?', 'bh-fit-title')}<div class="sa-fit-grid">${fit.map(([title, symbol, items]) => `<article class="sa-fit-card"><div class="sa-fit-card-head">${icon(symbol)}<h3>${esc(title)}</h3></div>${bullets(items)}</article>`).join('')}</div></div></section>
  <section class="sa-section" aria-labelledby="bh-process-title"><div class="sa-container">${heading('Bahrain business setup process', 'Key Stages & Setup Requirements', 'bh-process-title')}<ol class="sa-timeline">${stages.map((stage, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span><h3>${esc(stage)}</h3></li>`).join('')}</ol><p class="sa-section-note">Requirements may vary depending on the business activity and structure.</p></div></section>
  <section class="sa-section sa-section--cream" aria-labelledby="bh-docs-title"><div class="sa-container sa-docs-grid"><div>${heading('Documentation', 'Typical Requirements', 'bh-docs-title')}<p class="sa-section-note">Requirements vary according to the business activity and structure.</p></div><div class="sa-docs-panel">${bullets(documents)}</div></div></section>
  <section class="sa-section" aria-labelledby="bh-cost-title"><div class="sa-container">${heading('Cost & timeline', 'Plan Your Bahrain Setup', 'bh-cost-title')}<div class="sa-cost-grid"><article><span>Setup cost</span><h3>BHD 800 – BHD 3,000+</h3><p class="bh-cost-equivalent">Approximately USD 2,100 – 8,000+</p><p>Actual cost depends on the business activity, licence type, office requirements and other applicable costs.</p><p class="pricing-terms-note">Terms &amp; Conditions apply.</p></article><article><span>Timeline</span><h3>5 – 10 Working Days*</h3><p>An indicative timeframe, not a guaranteed completion date.</p></article></div><p class="sa-section-note bh-cost-note">*Subject to documentation, approvals and authority processing.</p><a class="sa-text-link" href="bahrain-pricing.html">View the individual Bahrain cost &amp; process guide ${icon('la-arrow-right')}</a></div></section>
  <section class="sa-section sa-section--cream" aria-labelledby="bh-tax-title"><div class="sa-container">${heading('Tax & ongoing compliance', 'Understand the Ongoing Obligations', 'bh-tax-title')}<div class="sa-tax-grid">${tax.map(([title, body, symbol]) => `<article>${icon(symbol)}<h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join('')}</div><p class="sa-section-note">Tax treatment depends on the entity and activity; confirm current obligations before proceeding.</p></div></section>
  <section class="sa-section" aria-labelledby="bh-support-title"><div class="sa-container">${heading('Why Nikki Advisory', 'Support Beyond Company Registration', 'bh-support-title', 'Our focus is on helping businesses establish in Bahrain with a structure aligned to their business model and regional objectives.')}<div class="sa-support-grid bh-support-grid">${support.map(([body, symbol], i) => `<article>${icon(symbol)}<span>${String(i + 1).padStart(2, '0')}</span><h3>${esc(body)}</h3></article>`).join('')}</div>${action('Discuss Your Bahrain Requirement', '#bahrain-enquiry')}</div></section>
  <section class="sa-section sa-section--cream" aria-labelledby="bh-consider-title"><div class="sa-container">${heading('Key considerations', 'Decisions to Clarify Early', 'bh-consider-title')}<div class="sa-consider-grid">${considerations.map(([title, body, symbol]) => `<article>${icon(symbol)}<div><h3>${esc(title)}</h3><p>${esc(body)}</p></div></article>`).join('')}</div></div></section>
  <section class="sa-section" aria-labelledby="bh-faq-title"><div class="sa-container sa-faq-grid"><div>${heading('Frequently asked questions', 'Bahrain Setup, Answered', 'bh-faq-title')}<p>Practical questions to consider before registration and licensing.</p></div><div class="sa-faq-list">${faqs.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('')}</div></div></section>
  <section class="sa-enquiry" id="bahrain-enquiry" aria-labelledby="bh-enquiry-title"><div class="sa-container sa-enquiry-grid"><div><span class="sa-kicker sa-kicker--light">Ready to establish your business in Bahrain?</span><h2 id="bh-enquiry-title">Start with the right structure.</h2><p>Whether you are entering the GCC for the first time, establishing a regional base or evaluating Bahrain alongside other GCC jurisdictions, the right structure should come first.</p><div class="sa-enquiry-insight">Share your requirements with Nikki Advisory and let us assess the appropriate way forward.</div><strong>Bahrain works best when used strategically — not just as a low-cost option.</strong></div>${form()}</div></section>
</div>`; }

const rebuiltBefore = before.replace(/<head>[\s\S]*?<\/head>/, head()).replace('<body>', '<body class="saudi-suite-body bahrain-suite-body">');
const rebuiltAfter = after.includes('assets/js/pages/bahrain-suite.js') ? after : after.replace('</body>', '    <script src="assets/js/pages/bahrain-suite.js"></script>\n  </body>');
fs.writeFileSync(target, rebuiltBefore + '<!-- Page-specific content -->\n      ' + page() + '\n      ' + rebuiltAfter, 'utf8');
console.log('Updated Bahrain setup page.');
