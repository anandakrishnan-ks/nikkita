/** Replace only the terms page's content, preserving the site-wide header and footer. */
import fs from 'node:fs';
import path from 'node:path';

const target = path.join(process.cwd(), 'terms-and-conditions.html');
const source = fs.readFileSync(target, 'utf8');
const start = source.indexOf('<!-- Page-specific content -->');
const end = source.indexOf('<!-- Site footer -->');
if (start < 0 || end <= start) throw new Error('Terms page shell markers are missing');

const titles = [
  ['introduction', 'Introduction & Acceptance'],
  ['scope-of-services', 'Scope of Services'],
  ['regulatory-disclaimer', 'Government & Regulatory Disclaimer'],
  ['client-responsibilities', 'Client Responsibilities'],
  ['fees-and-payments', 'Fees, Quotations & Payments'],
  ['no-guarantee', 'No Guarantee of Approval'],
  ['intellectual-property', 'Website Content & Intellectual Property'],
  ['third-party-services', 'Third-Party Websites & Services'],
  ['limitation-of-liability', 'Limitation of Liability'],
  ['confidentiality', 'Confidentiality'],
  ['suspension', 'Suspension or Termination'],
  ['governing-law', 'Governing Law & Jurisdiction'],
  ['changes', 'Changes to These Terms'],
  ['contact', 'Contact Us'],
];

const escape = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');
const toc = () => `<ol>${titles.map(([id, title], index) => `<li><a href="#${id}"><span>${String(index + 1).padStart(2, '0')}</span>${escape(title)}</a></li>`).join('')}</ol>`;
const section = (number, body, extraClass = '') => {
  const [id, title] = titles[number - 1];
  return `<section class="pp-section${extraClass ? ` ${extraClass}` : ''}" id="${id}" aria-labelledby="${id}-title"><div class="pp-section-heading"><span class="pp-number">${String(number).padStart(2, '0')}</span><h2 id="${id}-title">${escape(title)}</h2></div><div class="pp-prose">${body}</div></section>`;
};

const sections = [
  section(1, `<p>By accessing the Nikki Advisory website or engaging our services, you agree to comply with these Terms &amp; Conditions.</p><p>If you do not agree with these terms, please refrain from using the website or engaging our services.</p>`),
  section(2, `<p>Nikki Advisory provides business setup and advisory support, including:</p><ul><li>Business setup and company formation coordination</li><li>Business structuring guidance</li><li>PRO and government services</li><li>Corporate compliance support</li><li>Accounting and bookkeeping support</li><li>Company liquidation coordination</li><li>Business and operational support</li></ul><p>The specific scope, deliverables and fees will be communicated through the applicable quotation, proposal, engagement letter or other agreed commercial document.</p>`),
  section(3, `<p>Nikki Advisory provides guidance and administrative coordination based on the information and requirements available at the time of the engagement.</p><p>Business activities, licences, visas, approvals and registrations remain subject to the requirements and decisions of the relevant government, licensing and regulatory authorities.</p><p>Government requirements, fees, procedures and processing timelines may change without prior notice. Nikki Advisory is not responsible for delays, changes, rejection or additional requirements imposed by an authority, bank or other independent third party.</p>`),
  section(4, `<p>Clients are responsible for providing <strong>accurate, authentic, complete and current</strong> information and documentation.</p><p>Clients agree to:</p><ul><li>Provide documents reasonably required for the engagement.</li><li>Disclose relevant information that may affect the requested service.</li><li>Comply with applicable AML, KYC, UBO and other regulatory requirements.</li><li>Ensure proposed business activities are lawful and appropriately disclosed.</li><li>Respond promptly to requests for information, documents, signatures or approvals.</li></ul><p>Nikki Advisory may decline or discontinue an engagement where information or documentation is inaccurate, incomplete, misleading or inconsistent with applicable requirements.</p>`),
  section(5, `<p>Service fees and scope will be communicated through a written quotation, proposal, invoice or other agreed commercial document.</p><p>Government fees, authority charges, visa fees and third-party costs may be additional unless specifically included in the quotation.</p><p>Additional requirements or changes in scope may result in additional costs.</p><p>Payments are subject to the agreed quotation or invoice terms.</p><p>Government and third-party fees already paid or processed on behalf of a client may be non-refundable, subject to the applicable authority or service-provider terms.</p>`),
  section(6, `<p>Nikki Advisory may assist with applications, documentation and coordination; however, approval remains with the relevant authority or third party.</p><p>We do not guarantee approval of:</p><ul><li>Companies, licences, visas or government applications.</li><li>Bank accounts.</li><li>Specific business activities requiring additional approvals.</li><li>Processing timelines dependent on external authorities or third parties.</li></ul>`),
  section(7, `<p>Unless otherwise stated, content published on the Nikki Advisory website, including text, articles, guides, graphics, logos, visual materials and original content, is owned by or used by Nikki Advisory with the appropriate rights.</p><p>Such content may not be copied, reproduced, republished, distributed or commercially used without prior written permission, except where permitted by applicable law.</p><p>Website information is provided for general informational purposes and does not constitute advice specific to an individual business or situation.</p>`),
  section(8, `<p>Our website may contain links to government portals and other third-party websites.</p><p>Nikki Advisory does not control or accept responsibility for the content, availability, policies or practices of third-party websites or services.</p><p>Third-party providers may have their own terms, requirements, fees and approval processes.</p>`),
  section(9, `<p>To the extent permitted by applicable law, Nikki Advisory shall not be liable for indirect, incidental, special or consequential loss arising from:</p><ul><li>Government or regulatory decisions.</li><li>Changes in laws, regulations, fees or procedures.</li><li>Delays or failures caused by third parties.</li><li>Bank account approval or rejection.</li><li>Incorrect, incomplete or delayed information provided by the client.</li><li>Business decisions based on general information published on our website.</li></ul><p>Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited.</p>`),
  section(10, `<p>Client information and documents are handled in accordance with the <a href="privacy-policy.html">Nikki Advisory Privacy Policy</a> and applicable confidentiality obligations.</p><p>Nikki Advisory will not use confidential client information for purposes unrelated to the relevant engagement, except where required or permitted by applicable law.</p>`),
  section(11, `<p>Nikki Advisory may suspend or discontinue an engagement where:</p><ul><li>Required information or documentation is not provided.</li><li>Information provided is inaccurate, misleading or incomplete.</li><li>The requested service cannot reasonably be undertaken due to legal or regulatory requirements.</li><li>Continuing the engagement would create a compliance, legal or professional concern.</li><li>Applicable fees remain unpaid.</li></ul><p>Any applicable cancellation or refund terms will be governed by the relevant quotation, engagement terms or <a href="refund-cancellation-policy.html">Refund &amp; Cancellation Policy</a>, where provided.</p>`),
  section(12, `<p>These Terms &amp; Conditions shall be governed by and interpreted in accordance with the <strong>laws of the United Arab Emirates</strong>.</p><p>Subject to applicable law, disputes arising from the use of the Nikki Advisory website or provision of its services shall be subject to the jurisdiction of the <strong>competent courts of the United Arab Emirates</strong>.</p><p>Where a separate written quotation, engagement letter, service agreement or other contract specifies different governing law, jurisdiction or dispute-resolution arrangements for a particular engagement, that agreement shall prevail.</p>`),
  section(13, `<p>Nikki Advisory may update these Terms &amp; Conditions from time to time to reflect changes in its services, website practices or applicable legal and regulatory requirements.</p><p>The updated version will be published on this page with the relevant revision date.</p>`),
  section(14, `<p>For questions regarding these Terms &amp; Conditions:</p><p><strong>Email:</strong> <a href="mailto:info@nikkiadvisory.com">info@nikkiadvisory.com</a></p><p><strong>Nikki Advisory</strong><br />UAE | Saudi Arabia | Bahrain</p>`, 'pp-section--contact'),
].join('\n');

const page = `<div class="privacy-suite terms-suite">
  <nav class="pp-breadcrumb visual-breadcrumb visual-breadcrumb--legal" aria-label="Breadcrumb"><div class="pp-container visual-breadcrumb__inner"><p class="visual-breadcrumb__title">Terms &amp; Conditions</p><div class="visual-breadcrumb__trail"><a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">Terms &amp; Conditions</span></div></div></nav>
  <header class="pp-hero"><div class="pp-container"><span class="pp-kicker">Website &amp; service terms</span><h1>Terms &amp; Conditions</h1><p>These Terms &amp; Conditions govern the use of the Nikki Advisory website and the provision of its business setup, advisory and related services across the UAE, Saudi Arabia and Bahrain.</p><span class="pp-tagline">Structured decisions lead to stable businesses.</span></div></header>
  <div class="pp-container pp-content-layout"><aside class="pp-sidebar" aria-label="Terms sections"><div class="pp-sidebar-inner"><span class="pp-sidebar-label">On this page</span>${toc()}<div class="pp-sidebar-help"><span>Terms enquiry</span><a href="mailto:info@nikkiadvisory.com">info@nikkiadvisory.com <i class="las la-arrow-up-right" aria-hidden="true"></i></a></div></div></aside>
  <div class="pp-main"><details class="pp-mobile-toc"><summary>Jump to a section <i class="las la-angle-down" aria-hidden="true"></i></summary><nav aria-label="Terms sections">${toc()}</nav></details><article aria-label="Terms and conditions">${sections}</article></div></div>
</div>`;

let before = source.slice(0, start);
const after = source.slice(end);
before = before
  .replace('<body>', '<body class="privacy-suite-body">')
  .replace('<main class="terms-page">', '<main class="terms-page privacy-legal-page">')
  .replace('content="#1C1C1C"', 'content="#102b24"')
  .replace('<link rel="stylesheet" href="assets/css/site.css" />', '<link rel="stylesheet" href="assets/css/site.css" />\n    <link rel="stylesheet" href="assets/css/pages/privacy-policy.css" />');

fs.writeFileSync(target, `${before}<!-- Page-specific content -->\n      ${page}\n\n      ${after}`, 'utf8');
console.log('Updated terms and conditions page.');
