/** Replace only the privacy page's content, preserving site-wide header and footer. */
import fs from 'node:fs';
import path from 'node:path';

const target = path.join(process.cwd(), 'privacy-policy.html');
const source = fs.readFileSync(target, 'utf8');
const start = source.indexOf('<!-- Page-specific content -->');
const end = source.indexOf('<!-- Site footer -->');
if (start < 0 || end <= start) throw new Error('Privacy page shell markers are missing');
const before = source.slice(0, start);
const after = source.slice(end);

const titles = [
  ['information-we-collect', 'Information We Collect'],
  ['how-we-use-information', 'How We Use Your Information'],
  ['confidentiality', 'Client Confidentiality & Document Handling'],
  ['information-sharing', 'Information Sharing & Disclosure'],
  ['data-security', 'Data Security'],
  ['cookies', 'Cookies & Website Usage'],
  ['retention', 'Data Retention'],
  ['your-rights', 'Your Data Protection Rights'],
  ['third-party-websites', 'Third-Party Websites'],
  ['policy-updates', 'Updates to This Policy'],
  ['contact', 'Contact Us'],
];
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const toc = () => `<ol>${titles.map(([id, title], index) => `<li><a href="#${id}"><span>${String(index + 1).padStart(2, '0')}</span>${escape(title)}</a></li>`).join('')}</ol>`;
const section = (number, body, extraClass = '') => {
  const [id, title] = titles[number - 1];
  return `<section class="pp-section${extraClass ? ` ${extraClass}` : ''}" id="${id}" aria-labelledby="${id}-title"><div class="pp-section-heading"><span class="pp-number">${String(number).padStart(2, '0')}</span><h2 id="${id}-title">${escape(title)}</h2></div><div class="pp-prose">${body}</div></section>`;
};

const sections = [
  section(1, `<p>When you contact Nikki Advisory, submit an enquiry, request a consultation or engage our services across the UAE, Saudi Arabia or Bahrain, we may collect information relevant to your requirements, including:</p>
    <ul><li><strong>Contact Details:</strong> Full name, email address, phone number and preferred jurisdiction.</li>
    <li><strong>Business Information:</strong> Proposed business activities, company structure, ownership or shareholder details and visa requirements, where relevant.</li>
    <li><strong>Documents &amp; Records:</strong> Identification documents, company incorporation documents, business plans, financial or commercial information, licences, certificates and other documents required for the requested service.</li>
    <li><strong>Technical Information:</strong> IP address, browser information and basic website usage data, where applicable.</li></ul>
    <p>We seek to collect only information reasonably necessary for the relevant purpose.</p>`),
  section(2, `<p>We may use your information to:</p><ul>
    <li>Understand your business requirements and provide relevant advisory guidance.</li>
    <li>Assess jurisdiction, structure, licensing and business setup options.</li>
    <li>Coordinate company formation, PRO services, government procedures and compliance-related requirements.</li>
    <li>Communicate with you regarding enquiries, documentation and project updates.</li>
    <li>Maintain appropriate business and client records.</li>
    <li>Meet applicable legal, regulatory and administrative requirements.</li>
    <li>Improve our website and services.</li></ul>`),
  section(3, `<p>Nikki Advisory treats information and documents provided by clients as <strong>confidential</strong> and handles them with appropriate professional care.</p>
    <p>This may include passports and identification documents, shareholder information, incorporation documents, business plans, financial information, licences, certificates, visa documents and other information provided during an engagement.</p>
    <p>Client information and documents are used only to the extent reasonably necessary to assess, coordinate or deliver the requested service.</p>
    <p>Where documents must be submitted to a relevant government authority, licensing authority, bank, professional adviser, authorised partner or service provider, information will be shared only where reasonably necessary for the relevant engagement or where required by applicable law.</p>
    <p>Nikki Advisory does <strong>not sell or rent client information or documents</strong>.</p>`),
  section(4, `<p>Information may be shared, where reasonably necessary, with:</p><ul>
    <li>Relevant government and licensing authorities.</li>
    <li>Banks or financial institutions where banking assistance is requested.</li>
    <li>Professional advisers, authorised partners or service providers involved in the engagement.</li>
    <li>Technology, hosting, communication or administrative service providers supporting our operations.</li>
    <li>Other parties where disclosure is required by applicable law or regulatory requirements.</li></ul>
    <p>We seek to limit information shared to what is reasonably necessary for the relevant purpose.</p>`),
  section(5, `<p>We maintain reasonable administrative, technical and organisational measures to protect personal information and client documents against unauthorised access, loss, misuse, alteration or disclosure.</p>
    <p>Access to client information is limited to persons or service providers who reasonably require it for the relevant business or service purpose.</p>
    <p>While we take appropriate measures to protect information, no electronic transmission or storage system can be guaranteed to be completely secure.</p>`),
  section(6, `<p>Our website may use cookies or similar technologies to support website functionality, understand website usage and improve user experience.</p>
    <p>You may manage or restrict cookies through your browser settings. Certain website functions may be affected if cookies are disabled.</p>`),
  section(7, `<p>We retain personal information and client documents only for as long as reasonably necessary for the purpose for which they were collected, the provision of services, business recordkeeping, dispute resolution or applicable legal and regulatory requirements.</p>
    <p>Where information is no longer required, it may be securely deleted or destroyed, subject to applicable legal or regulatory obligations.</p>`),
  section(8, `<p>Subject to applicable law, you may have the right to:</p><ul>
    <li>Request access to personal information we hold about you.</li>
    <li>Request correction of inaccurate or incomplete information.</li>
    <li>Request deletion of your personal information where legally applicable.</li>
    <li>Request restriction of certain processing activities where applicable.</li>
    <li>Withdraw consent where processing is based on consent.</li></ul>
    <p>To exercise these rights, please contact us using the details below. Requests may be subject to appropriate identity verification and applicable legal requirements.</p>`),
  section(9, `<p>Our website may contain links to government portals or other third-party websites.</p>
    <p>Nikki Advisory does not control the privacy practices of external websites. We recommend reviewing their respective privacy policies before providing personal information.</p>`),
  section(10, `<p>Nikki Advisory may update this Privacy Policy from time to time to reflect changes in our services, website practices or applicable legal and regulatory requirements.</p>
    <p>The updated version will be published on this page with the relevant revision date.</p>`),
  section(11, `<p>For questions regarding this Privacy Policy, your personal information or the handling of your documents, please contact us:</p>
    <p><strong>Email:</strong> <a href="mailto:info@nikkiadvisory.com">info@nikkiadvisory.com</a></p>
    <p><strong>Nikki Advisory</strong><br />UAE | Saudi Arabia | Bahrain</p>`, 'pp-section--contact'),
].join('\n');

const page = `<div class="privacy-suite">
  <nav class="pp-breadcrumb" aria-label="Breadcrumb"><div class="pp-container"><a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">Privacy Policy</span></div></nav>
  <header class="pp-hero"><div class="pp-container"><span class="pp-kicker">Privacy &amp; confidentiality</span><h1>Privacy Policy</h1><p>Nikki Advisory respects your privacy and is committed to protecting the personal, business and consultation information entrusted to us.</p><span class="pp-tagline">Structured decisions lead to stable businesses.</span></div></header>
  <div class="pp-container pp-content-layout"><aside class="pp-sidebar" aria-label="Policy sections"><div class="pp-sidebar-inner"><span class="pp-sidebar-label">On this page</span>${toc()}<div class="pp-sidebar-help"><span>Privacy enquiry</span><a href="mailto:info@nikkiadvisory.com">info@nikkiadvisory.com <i class="las la-arrow-up-right" aria-hidden="true"></i></a></div></div></aside>
  <div class="pp-main"><details class="pp-mobile-toc"><summary>Jump to a section <i class="las la-angle-down" aria-hidden="true"></i></summary><nav aria-label="Policy sections">${toc()}</nav></details><article aria-label="Privacy policy">${sections}</article></div></div>
</div>`;

const rebuiltBefore = before.replace('<body>', '<body class="privacy-suite-body">').replace('content="#1C1C1C"', 'content="#102b24"').replace('<link rel="stylesheet" href="assets/css/site.css" />', '<link rel="stylesheet" href="assets/css/site.css" />\n    <link rel="stylesheet" href="assets/css/pages/privacy-policy.css" />');
fs.writeFileSync(target, rebuiltBefore + '<!-- Page-specific content -->\n      ' + page + '\n\n      ' + after, 'utf8');
console.log('Updated privacy policy page.');
