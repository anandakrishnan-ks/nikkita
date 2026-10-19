/** Builds the six service detail pages and clean static routes from one scoped content source. */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const site = 'https://nikkiadvisory.com';
const footerDisclaimer = 'All services are provided subject to the applicable laws, regulations and authority requirements of the respective jurisdiction. Requirements, documentation and procedures may vary depending on the business activity, structure, circumstances and regulatory framework.';
const entries = [
  {
    legacy: 'pro-government-services.html', slug: 'pro-services', title: 'PRO & Government Services',
    seoTitle: 'PRO & Government Services in UAE, Saudi Arabia & Bahrain | Nikki Advisory',
    description: 'PRO and government support including visa processing, documentation, approvals, renewals and licensing coordination across UAE, Saudi Arabia and Bahrain.',
    intro: 'We provide PRO and government support across the UAE, Saudi Arabia and Bahrain, assisting businesses with documentation, applications, approvals and government-related coordination.',
    image: 'pro-services.webp', dimensions: [1672, 941], alt: 'Illustrative arrangement of blank application papers and a dark green document folio',
    imageCaption: 'Documentation & coordination', icon: 'la-passport', cta: 'Discuss Your Requirement',
    scopeHeading: 'Government & PRO support', scopeIntro: 'Support with the documents, applications and follow-up that different business and residency processes require.',
    scope: [
      ['Investor, employment and family visa assistance', 'la-passport'],
      ['Emirates ID / CPR / Iqama coordination', 'la-id-card'],
      ['Labour and immigration support', 'la-users'],
      ['Document clearing and attestation', 'la-file-signature'],
      ['Licence renewals and amendments', 'la-sync-alt'],
      ['Government application and approval coordination', 'la-landmark'],
    ],
    howHeading: 'How we support you', howIntro: 'We coordinate the relevant documentation, applications and follow-up required for government-related processes, helping businesses manage procedural requirements with greater clarity and continuity.',
    how: ['Understand the authority and process relevant to your requirement', 'Organise the required documentation', 'Coordinate applications and submissions', 'Follow up and keep the next steps clear'],
    note: 'Government procedures, eligibility, timelines and documentation requirements vary by jurisdiction, authority and individual circumstances. Services are provided subject to applicable requirements and approvals.',
    ctaHint: 'Tell us the process, authority and jurisdiction you need help with.',
  },
  {
    legacy: 'corporate-compliance.html', slug: 'corporate-compliance', title: 'Corporate Compliance',
    seoTitle: 'Corporate Compliance Services in UAE, Saudi Arabia & Bahrain | Nikki Advisory',
    description: 'Corporate compliance support including VAT, Corporate Tax coordination, regulatory requirements and compliance reminders across UAE, Saudi Arabia and Bahrain.',
    intro: 'We support businesses with ongoing compliance requirements across the UAE, Saudi Arabia and Bahrain, helping them stay organised and aligned with applicable regulatory obligations.',
    image: 'corporate-compliance.webp', dimensions: [1672, 941], alt: 'Illustrative blank compliance checklist, calendar and document binder',
    imageCaption: 'Documentation & deadlines', icon: 'la-clipboard-check', cta: 'Discuss Your Compliance Requirement',
    scopeHeading: 'Compliance areas we support', scopeIntro: 'A practical view of the recurring obligations and coordination that may apply to your business.',
    scope: [
      ['VAT registration and filing support', 'la-receipt'],
      ['Corporate Tax compliance support, where applicable', 'la-balance-scale'],
      ['Regulatory compliance coordination', 'la-clipboard-check'],
      ['Compliance documentation', 'la-folder-open'],
      ['Filing and renewal reminders', 'la-calendar-check'],
      ['General compliance follow-up', 'la-tasks'],
    ],
    howHeading: 'How we support your compliance', howIntro: 'Our role is to make the applicable requirements easier to identify, organise and follow through—not to promise an outcome or replace regulated advice.',
    how: ['Identify applicable compliance requirements', 'Coordinate documentation and submissions', 'Maintain structured compliance follow-up', 'Help you stay aware of relevant deadlines and requirements'],
    note: 'Compliance requirements vary according to jurisdiction, business activity, legal structure and applicable regulations. Tax, accounting or regulated professional services are subject to the appropriate scope and professional requirements.',
    ctaHint: 'Tell us the obligation, deadline or filing issue you are working through.',
  },
  {
    legacy: 'accounting-bookkeeping.html', slug: 'accounting-bookkeeping', title: 'Accounting & Bookkeeping',
    seoTitle: 'Accounting & Bookkeeping Services in UAE, Saudi Arabia & Bahrain | Nikki Advisory',
    description: 'Accounting and bookkeeping support including transaction recording, financial reporting, audit coordination and payroll assistance across UAE, Saudi Arabia and Bahrain.',
    intro: 'We provide accounting and bookkeeping support to help businesses maintain organised financial records and greater visibility over their day-to-day financial activity.',
    image: 'accounting-bookkeeping.webp', dimensions: [1774, 887], alt: 'Illustrative ledger and blank financial record sheets arranged on a desk',
    imageCaption: 'Records & reporting support', icon: 'la-book', cta: 'Discuss Your Accounting Requirement',
    scopeHeading: 'Accounting & bookkeeping support', scopeIntro: 'Keep the financial recordkeeping work visible and organised across routine business activity.',
    scope: [
      ['Bookkeeping and transaction recording', 'la-book'],
      ['Financial summaries and reporting support', 'la-chart-bar'],
      ['Audit coordination assistance', 'la-file-alt'],
      ['Basic payroll coordination', 'la-users'],
      ['Financial record organisation', 'la-folder-open'],
    ],
    howHeading: 'How we support your business', howIntro: 'Structured records make it easier to understand day-to-day financial activity and work with the relevant reporting professionals.',
    how: ['Maintain structured financial records', 'Organise information for reporting', 'Support coordination with auditors and other relevant professionals', 'Improve visibility over day-to-day financial activity'],
    note: 'Accounting requirements, reporting standards and documentation may vary depending on the jurisdiction, business structure and nature of the business. Audit services themselves are subject to applicable professional requirements.',
    ctaHint: 'Describe the records, reporting or coordination support you require.',
  },
  {
    legacy: 'company-liquidation.html', slug: 'company-liquidation', title: 'Company Liquidation & Closure',
    seoTitle: 'Company Liquidation Services in UAE, Saudi Arabia & Bahrain | Nikki Advisory',
    description: 'Company liquidation and business closure support including licence cancellation, government clearances and regulatory coordination across UAE, Saudi Arabia and Bahrain.',
    intro: 'We assist businesses with company liquidation and closure procedures across the UAE, Saudi Arabia and Bahrain, coordinating the necessary documentation and regulatory steps.',
    image: 'company-liquidation.webp', dimensions: [1672, 941], alt: 'Illustrative closed corporate folio and orderly blank closure documents',
    imageCaption: 'Orderly closure coordination', icon: 'la-folder-minus', cta: 'Discuss Your Company Closure',
    scopeHeading: 'Closure & liquidation support', scopeIntro: 'A focused set of coordination tasks for businesses preparing to close or cancel an entity.', listScope: true,
    scope: [
      ['Company liquidation coordination', 'la-folder-minus'],
      ['Licence cancellation', 'la-file-excel'],
      ['Government clearance procedures', 'la-clipboard-check'],
      ['Final documentation support', 'la-file-signature'],
      ['Coordination with relevant authorities and service providers', 'la-project-diagram'],
    ],
    howHeading: 'How we coordinate the closure', howIntro: 'We help establish the applicable sequence and coordinate the parties and paperwork involved in the closure process.',
    how: ['Review the applicable closure requirements', 'Coordinate required documentation and clearances', 'Follow up on cancellation and closure procedures', 'Support completion of relevant regulatory formalities'],
    note: 'Liquidation procedures, clearance requirements, timelines and documentation vary according to the jurisdiction, authority, company structure and outstanding obligations.',
    ctaHint: 'Share the entity type, jurisdiction and current stage of closure.',
  },
  {
    legacy: 'business-support.html', slug: 'business-support', title: 'Business Support',
    seoTitle: 'Business Support Services in UAE, Saudi Arabia & Bahrain | Nikki Advisory',
    description: 'Business support including documentation, administrative coordination, workspace assistance and vendor registration support across UAE, Saudi Arabia and Bahrain.',
    intro: 'We provide practical administrative and operational support to help businesses manage ongoing requirements and day-to-day coordination more efficiently.',
    image: 'business-support.webp', dimensions: [1672, 941], alt: 'Illustrative folders, workspace plan and blank business correspondence',
    imageCaption: 'Practical business coordination', icon: 'la-briefcase', cta: 'Discuss Your Business Requirement',
    scopeHeading: 'Business support areas', scopeIntro: 'Practical assistance with the administrative work around running a business.',
    scope: [
      ['Documentation support', 'la-file-alt'],
      ['Office and workspace coordination', 'la-building'],
      ['Administrative assistance', 'la-clipboard-list'],
      ['Vendor registration assistance, where applicable', 'la-address-card'],
      ['Insurance coordination through associated partners', 'la-shield-alt', 'Partner-coordinated service'],
    ],
    howHeading: 'How we support your operations', howIntro: 'We help keep routine coordination and communication moving so your team can stay focused on the business itself.',
    how: ['Coordinate routine business requirements', 'Assist with administration and documentation', 'Support communication with relevant providers and parties', 'Help maintain continuity in day-to-day processes'],
    note: 'The availability and scope of business support depend on the jurisdiction, business requirement and relevant third-party or authority procedures. Partner-based services are subject to the terms and requirements of the respective provider.',
    ctaHint: 'Describe the administrative task and any providers involved.',
  },
  {
    legacy: 'business-structuring.html', slug: 'business-structuring', title: 'Business Structuring',
    seoTitle: 'Business Structuring Services in UAE, Saudi Arabia & Bahrain | Nikki Advisory',
    description: 'Business structuring guidance covering ownership, activities, jurisdiction selection and setup considerations across UAE, Saudi Arabia and Bahrain.',
    intro: 'We help businesses assess their structural options based on ownership, business activities, operational requirements and long-term objectives.',
    image: 'business-structuring.webp', dimensions: [1774, 887], alt: 'Illustrative glass and stone forms connected as alternative structural paths',
    imageCaption: 'Clarity before execution', icon: 'la-sitemap', cta: 'Discuss Your Business Structure',
    scopeHeading: 'Structuring areas we support', scopeIntro: 'Bring the decision into focus before a formation or restructuring route is chosen.',
    scope: [
      ['Ownership structure guidance', 'la-users'],
      ['Business activity alignment', 'la-bullseye'],
      ['Mainland vs Free Zone assessment', 'la-balance-scale'],
      ['Jurisdiction selection', 'la-globe'],
      ['Basic cross-border structuring support', 'la-project-diagram'],
    ],
    howHeading: 'How we help you assess options', howIntro: 'We help you understand and compare options before execution, with the operating model and long-term objective in view.',
    how: ['Understand your objectives and operating model', 'Compare relevant jurisdiction and structure options', 'Identify ownership and activity considerations', 'Clarify the decision before setup or restructuring'],
    note: 'Business structuring requirements depend on the jurisdiction, activity, ownership model and intended operations. Where legal, tax or other regulated professional advice is required, the relevant qualified professional should be consulted.',
    ctaHint: 'Tell us the intended activity, ownership and where you plan to operate.',
    decisionRail: ['Ownership', 'Activity', 'Jurisdiction', 'Operating model'],
  },
];

const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const write = (name, content) => { const target = path.join(root, name); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, content, 'utf8'); };

function head(title, description, canonical, image) {
  const t = esc(title), d = esc(description), c = esc(site + canonical), i = esc(site + '/assets/imgs/services/' + image);
  return `  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#102b24" />
    <title>${t}</title>
    <meta name="description" content="${d}" />
    <meta name="application-name" content="Nikki Advisory" />
    <meta name="author" content="Nikki Advisory" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${c}" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:url" content="${c}" />
    <meta property="og:site_name" content="Nikki Advisory" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image" content="${i}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${i}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Marcellus&amp;family=Montserrat:wght@400;500;600;700&amp;display=swap" rel="stylesheet" />
    <link rel="preload" href="assets/imgs/logo/logo.png" as="image" />
    <link rel="stylesheet" href="assets/css/bootstrap.min.css" />
    <link rel="stylesheet" href="assets/css/swiper.min.css" />
    <link rel="stylesheet" href="assets/css/aos.css" />
    <link rel="stylesheet" href="assets/css/style.css" />
    <link rel="stylesheet" href="assets/css/responsive.css" />
    <link rel="stylesheet" href="assets/css/line-awesome.min.css" />
    <link rel="stylesheet" href="assets/css/site.css" />
    <link rel="stylesheet" href="assets/css/pages/service-suite.css" />
    <link rel="icon" type="image/x-icon" href="assets/imgs/favicon/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" href="assets/imgs/favicon/favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="assets/imgs/favicon/favicon-16x16.png" sizes="16x16" />
    <link rel="apple-touch-icon" href="assets/imgs/favicon/apple-touch-icon.png" />
    <link rel="manifest" href="assets/imgs/favicon/site.webmanifest" />
  </head>`;
}

function shell(name) {
  const html = read(name);
  const first = html.indexOf('<!-- Page-specific content -->');
  const last = html.indexOf('<!-- Site footer -->');
  if (first < 0 || last < 0 || first >= last) throw new Error('Missing page markers in ' + name);
  return [html.slice(0, first), html.slice(last)];
}

function form(service, name) {
  const serviceField = service
    ? `<input id="sv-service" name="service_required" type="text" value="${esc(service)}" readonly required />`
    : `<select id="sv-service" name="service_required" required><option value="">Select a service</option>${entries.map(e => `<option value="${esc(e.title)}">${esc(e.title)}</option>`).join('')}</select>`;
  return `<form class="sv-form" action="mailto:info@nikkiadvisory.com" method="post" enctype="text/plain" data-sv-form="${esc(name)}" data-lead-form="${esc(name)}" data-endpoint="">
      <h3>Tell us what you need</h3><p>Share a few details so we can understand the requirement.</p>
      <div class="sv-form-grid">
        <div class="sv-field"><label for="sv-name">Full Name*</label><input id="sv-name" name="name" type="text" autocomplete="name" required /></div>
        <div class="sv-field"><label for="sv-phone">Phone Number*</label><input id="sv-phone" name="phone" type="tel" autocomplete="tel" required /></div>
        <div class="sv-field"><label for="sv-email">Email Address*</label><input id="sv-email" name="email" type="email" autocomplete="email" required /></div>
        <div class="sv-field"><label for="sv-service">Service Required*</label>${serviceField}</div>
        <div class="sv-field sv-field--full"><label for="sv-country">Country / Jurisdiction*</label><select id="sv-country" name="country" required><option value="">Select a jurisdiction</option><option>UAE</option><option>Saudi Arabia</option><option>Bahrain</option><option>Not sure yet</option></select></div>
        <div class="sv-field sv-field--full"><label for="sv-requirement">Tell Us About Your Requirement</label><textarea id="sv-requirement" name="requirement" rows="4"></textarea></div>
        <label class="sv-consent"><input name="consent" type="checkbox" value="yes" required /><span>I agree to be contacted about this enquiry and have read the <a href="privacy-policy.html">Privacy Policy</a>.</span></label>
        <div class="sv-form-trap" aria-hidden="true"><label for="sv-company-site">Leave this field empty</label><input id="sv-company-site" name="company_site" type="text" autocomplete="off" tabindex="-1" /></div>
        <input type="hidden" name="lead_source" /><input type="hidden" name="landing_page" />
        <div class="sv-form-submit"><button class="sv-button" type="submit">Submit Enquiry <i class="las la-arrow-right" aria-hidden="true"></i></button></div>
        <p class="sv-form-status" data-sv-status role="status" aria-live="polite">Submitting currently prepares an email in your email application.</p>
      </div>
    </form>`;
}

function enquiry(service, name, text) {
  return `<section class="sv-enquiry" id="enquiry" aria-labelledby="sv-enquiry-title"><div class="sv-container sv-enquiry-grid">
      <div class="sv-enquiry-copy"><span class="sv-eyebrow sv-eyebrow--light">Let's discuss your requirement</span><h2 id="sv-enquiry-title">Tell Us What You Need Support With.</h2><p>Share your requirement with us and we will review the relevant details and advise you on the appropriate next step.</p><div class="sv-enquiry-hint">${esc(text || 'The next step depends on your jurisdiction, business and specific requirement.')}</div></div>
      ${form(service, name)}
    </div><p class="sv-disclaimer sv-container">${esc(footerDisclaimer)}</p></section>`;
}

function detail(e) {
  const scope = e.scope.map((item, index) => `<article class="sv-scope-card${item[2] ? ' sv-scope-card--partner' : ''}"><div class="sv-scope-card-top"><i class="las ${esc(item[1])}" aria-hidden="true"></i><span class="sv-number">${String(index + 1).padStart(2, '0')}</span></div><div><h3>${esc(item[0])}</h3>${item[2] ? `<small>${esc(item[2])}</small>` : ''}</div></article>`).join('');
  const how = e.how.map((item, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><p>${esc(item)}</p></li>`).join('');
  const rail = e.decisionRail ? `<div class="sv-decision-rail" aria-label="Decision factors">${e.decisionRail.map((item, index) => `${index ? '<i class="las la-arrow-right" aria-hidden="true"></i>' : ''}<span>${esc(item)}</span>`).join('')}</div>` : '';
  return `<div class="service-suite" data-service="${esc(e.slug)}">
    <nav class="sv-breadcrumb visual-breadcrumb visual-breadcrumb--services" aria-label="Breadcrumb"><div class="sv-container visual-breadcrumb__inner"><p class="visual-breadcrumb__title">${esc(e.title)}</p><div class="visual-breadcrumb__trail"><a href="index.html">Home</a><span class="sv-separator">/</span><a href="services/index.html">Services</a><span class="sv-separator">/</span><span aria-current="page">${esc(e.title)}</span></div></div></nav>
    <section class="sv-hero" aria-labelledby="sv-page-title"><div class="sv-container sv-hero-grid"><div class="sv-hero-copy"><span class="sv-eyebrow">Nikki Advisory Services</span><h1 id="sv-page-title">${esc(e.title)}</h1><p class="sv-hero-intro">${esc(e.intro)}</p><div class="sv-hero-actions"><a class="sv-button" href="#enquiry" data-sv-cta="hero-enquiry">${esc(e.cta)} <i class="las la-arrow-right" aria-hidden="true"></i></a><a class="sv-button sv-button--outline" href="#scope" data-sv-cta="hero-scope">Explore Support</a></div><p class="sv-region-line"><i class="las la-globe" aria-hidden="true"></i>UAE · Saudi Arabia · Bahrain</p></div><figure class="sv-hero-figure"><img src="assets/imgs/services/${esc(e.image)}" alt="${esc(e.alt)}" width="${e.dimensions[0]}" height="${e.dimensions[1]}" fetchpriority="high" /><figcaption>${esc(e.imageCaption)} · illustrative visual</figcaption></figure></div></section>
    <section class="sv-section" id="scope" aria-labelledby="sv-scope-title"><div class="sv-container"><div class="sv-section-head"><span class="sv-eyebrow">What we support</span><h2 id="sv-scope-title">${esc(e.scopeHeading)}</h2><p>${esc(e.scopeIntro)}</p></div><div class="${e.listScope ? 'sv-scope-list' : 'sv-scope-grid'}">${scope}</div></div></section>
    <section class="sv-section sv-section--soft" id="how-we-help" aria-labelledby="sv-how-title"><div class="sv-container sv-how-grid"><div class="sv-how-copy"><span class="sv-eyebrow">How Nikki Supports</span><h2 id="sv-how-title">${esc(e.howHeading)}</h2><p>${esc(e.howIntro)}</p>${rail}<a class="sv-side-link" href="#enquiry" data-sv-cta="how-enquiry">${esc(e.cta)} <i class="las la-arrow-right" aria-hidden="true"></i></a></div><ol class="sv-how-list">${how}</ol></div></section>
    <aside class="sv-note" aria-labelledby="sv-note-title"><div class="sv-container"><div class="sv-note-box sv-notice-card"><i class="las la-info-circle sv-notice-icon" aria-hidden="true"></i><div><h2 class="sv-notice-heading" id="sv-note-title">Important to know</h2><p class="sv-notice-copy">${esc(e.note)}</p></div></div></div></aside>
    <nav class="sv-related" aria-label="Related business setup guidance"><div class="sv-container"><strong>Related guidance</strong><a href="business-setup-uae.html">UAE Business Setup</a><a href="saudi-arabia.html">Saudi Arabia</a><a href="bahrain.html">Bahrain</a><a href="services/index.html">All Services</a></div></nav>
    ${enquiry(e.title, e.slug, e.ctaHint)}
  </div>`;
}

function hub() {
  const cards = entries.map((e, index) => `<article class="sv-hub-card"><figure><img src="assets/imgs/services/${esc(e.image)}" alt="${esc(e.alt)}" width="${e.dimensions[0]}" height="${e.dimensions[1]}" loading="lazy" /></figure><div class="sv-hub-card-copy"><span>${String(index + 1).padStart(2, '0')} / 06</span><h3>${esc(e.title)}</h3><p>${esc(e.scopeIntro)}</p><a href="services/${esc(e.slug)}/" data-sv-cta="service-${esc(e.slug)}">Explore this service <i class="las la-arrow-right" aria-hidden="true"></i></a></div></article>`).join('');
  return `<div class="service-suite service-suite--hub" data-service="all-services">
    <nav class="sv-breadcrumb visual-breadcrumb visual-breadcrumb--services" aria-label="Breadcrumb"><div class="sv-container visual-breadcrumb__inner"><p class="visual-breadcrumb__title">Services</p><div class="visual-breadcrumb__trail"><a href="index.html">Home</a><span class="sv-separator">/</span><span aria-current="page">Services</span></div></div></nav>
    <section class="sv-hero sv-hero--hub" aria-labelledby="sv-page-title"><div class="sv-container sv-hero-grid"><div class="sv-hero-copy"><span class="sv-eyebrow">Nikki Advisory Services</span><h1 id="sv-page-title">Support for the work behind your business</h1><p class="sv-hero-intro">From structural decisions to routine administration, choose the practical support that matches the requirement in front of you across the UAE, Saudi Arabia and Bahrain.</p><div class="sv-hero-actions"><a class="sv-button" href="#services" data-sv-cta="hub-explore">Explore Services <i class="las la-arrow-right" aria-hidden="true"></i></a><a class="sv-button sv-button--outline" href="#enquiry" data-sv-cta="hub-enquiry">Discuss a Requirement</a></div></div><figure class="sv-hero-figure"><img src="assets/imgs/services/business-structuring.webp" alt="Illustrative glass and stone forms connected as alternative business paths" width="1774" height="887" fetchpriority="high" /><figcaption>Practical advice · coordinated support</figcaption></figure></div></section>
    <section class="sv-section sv-hub-intro" id="services" aria-labelledby="sv-services-title"><div class="sv-container"><div><span class="sv-eyebrow">Find the right support</span><h2 id="sv-services-title">What do you need help with?</h2></div><p>Each service page sets out what we support, how we help and what to consider before proceeding.</p></div></section>
    <section class="sv-section sv-section--soft" aria-label="Service options"><div class="sv-container"><div class="sv-hub-grid">${cards}</div><div class="sv-hub-advice"><i class="las la-compass" aria-hidden="true"></i><div><h3>Not sure which service fits?</h3><p>Tell us what you are trying to complete and we can help identify an appropriate next step.</p></div><a class="sv-button" href="#enquiry" data-sv-cta="hub-help">Discuss Your Requirement <i class="las la-arrow-right" aria-hidden="true"></i></a></div></div></section>
    ${enquiry('', 'all-services', 'Choose a service if you know it, or describe the task and jurisdiction in your message.')}
  </div>`;
}

function assemble(parts, pageHead, body) {
  const prefix = parts[0].replace(/<head>[\s\S]*?<\/head>/, pageHead).replace('<body>', '<body class="service-suite-body">');
  const suffix = parts[1].includes('assets/js/pages/service-suite.js')
    ? parts[1]
    : parts[1].replace('</body>', '    <script src="assets/js/pages/service-suite.js"></script>\n  </body>');
  return prefix + '<!-- Page-specific content -->\n      ' + body + '\n      ' + suffix;
}

function nestedCopy(html, levels) {
  const relative = '../'.repeat(levels);
  return html.replace(/\b(href|src|action)="(?!https?:|mailto:|tel:|#|data:|javascript:|\/)([^"?#]+(?:[?#][^"]*)?)"/gi,
    (_, attr, url) => `${attr}="${relative}${url}"`);
}

const shells = new Map(entries.map(e => [e.legacy, shell(e.legacy)]));
const proShell = shells.get('pro-government-services.html');
const hubShell = [proShell[0].replace(/<li class="active">(\s*<a href="services\/pro-services\/")/g, '<li class="">$1'), proShell[1]];
for (const e of entries) {
  const canonical = `/services/${e.slug}/`;
  const html = assemble(shells.get(e.legacy), head(e.seoTitle, e.description, canonical, e.image), detail(e));
  write(e.legacy, html);
  write(`services/${e.slug}/index.html`, nestedCopy(html, 2));
}
const hubHtml = assemble(hubShell, head('Business Services in UAE, Saudi Arabia & Bahrain | Nikki Advisory', 'Explore Nikki Advisory services for government coordination, compliance, bookkeeping, business closure, practical support and structuring across the UAE, Saudi Arabia and Bahrain.', '/services/', 'business-structuring.webp'), hub());
write('services.html', hubHtml);
write('services/index.html', nestedCopy(hubHtml, 1));
console.log(`Updated ${entries.length} legacy pages, ${entries.length} clean service routes, and two Services hub routes.`);
