/** Build the refund policy from the established legal-page shell. */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const template = path.join(root, 'terms-and-conditions.html');
const target = path.join(root, 'refund-cancellation-policy.html');
let source = fs.readFileSync(template, 'utf8');
const start = source.indexOf('<!-- Page-specific content -->');
const end = source.indexOf('<!-- Site footer -->');
if (start < 0 || end <= start) throw new Error('Legal page shell markers are missing');

const titles = [
  ['service-cancellation', 'Service Cancellation'],
  ['refund-eligibility', 'Refund Eligibility'],
  ['non-refundable-amounts', 'Non-Refundable Amounts'],
  ['refund-processing', 'Refund Processing'],
  ['government-requirements', 'Changes in Government or Third-Party Requirements'],
  ['request-refund', 'How to Request a Cancellation or Refund'],
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
  section(1, `<p>A client may request cancellation of a service by providing written notice to Nikki Advisory.</p><p>Cancellation terms may depend on the stage of the engagement, work already completed and any government or third-party costs incurred on the client's behalf.</p>`),
  section(2, `<p>Refunds, where applicable, will be considered based on:</p><ul><li>Whether the requested service has commenced.</li><li>The amount of work already completed.</li><li>Whether government, authority or third-party costs have already been incurred.</li><li>The specific payment and cancellation terms agreed in the quotation or engagement document.</li></ul>`),
  section(3, `<p>The following may be non-refundable:</p><ul><li>Government and authority fees already paid or processed.</li><li>Visa, licensing and other statutory charges.</li><li>Third-party service fees or expenses incurred on behalf of the client.</li><li>Services already completed or substantially performed.</li><li>Any other non-refundable amounts specifically identified in the agreed quotation or engagement terms.</li></ul>`),
  section(4, `<p>Where a refund is approved, it will generally be processed through the original payment method, subject to applicable payment-processing requirements.</p><p>The applicable refund amount and processing timeline will be communicated to the client at the time the refund is approved.</p>`),
  section(5, `<p>Nikki Advisory is not responsible for refunds arising solely from changes, delays, rejection or additional requirements imposed by government authorities, licensing bodies, banks or other independent third parties.</p><p>Any refund will be assessed according to the work completed, costs incurred and terms agreed for the engagement.</p>`),
  section(6, `<p>To request a cancellation or refund, please contact us in writing:</p><p><strong>Email:</strong> <a href="mailto:info@nikkiadvisory.com">info@nikkiadvisory.com</a></p><p>Please include your name, service details and relevant quotation or invoice reference.</p><p><strong>Nikki Advisory</strong><br />UAE | Saudi Arabia | Bahrain</p><p class="pp-updated">Last Updated: October 2026</p>`, 'pp-section--contact'),
].join('\n');

const page = `<div class="privacy-suite refund-suite">
  <nav class="pp-breadcrumb visual-breadcrumb visual-breadcrumb--legal" aria-label="Breadcrumb"><div class="pp-container visual-breadcrumb__inner"><p class="visual-breadcrumb__title">Refund &amp; Cancellation Policy</p><div class="visual-breadcrumb__trail"><a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">Refund &amp; Cancellation Policy</span></div></div></nav>
  <header class="pp-hero"><div class="pp-container"><span class="pp-kicker">Payments &amp; cancellations</span><h1>Refund &amp; Cancellation Policy</h1><p>Nikki Advisory aims to provide clear service scope and payment terms before an engagement begins. This Refund &amp; Cancellation Policy sets out the general terms applicable to cancellations and refunds.</p><span class="pp-tagline">Structured decisions lead to stable businesses.</span></div></header>
  <div class="pp-container pp-content-layout"><aside class="pp-sidebar" aria-label="Policy sections"><div class="pp-sidebar-inner"><span class="pp-sidebar-label">On this page</span>${toc()}<div class="pp-sidebar-help"><span>Refund enquiry</span><a href="mailto:info@nikkiadvisory.com">info@nikkiadvisory.com <i class="las la-arrow-up-right" aria-hidden="true"></i></a></div></div></aside>
  <div class="pp-main"><details class="pp-mobile-toc"><summary>Jump to a section <i class="las la-angle-down" aria-hidden="true"></i></summary><nav aria-label="Policy sections">${toc()}</nav></details><article aria-label="Refund and cancellation policy">${sections}</article></div></div>
</div>`;

const description = 'Refund and Cancellation Policy for Nikki Advisory services, including eligibility, non-refundable costs and request procedures.';
let before = source.slice(0, start)
  .replaceAll('Terms &amp; Conditions | Nikki Advisory', 'Refund &amp; Cancellation Policy | Nikki Advisory')
  .replaceAll('Terms &amp; Conditions for Nikki Advisory business setup and advisory services across UAE, Saudi Arabia, and Bahrain.', description)
  .replace('Nikki Advisory Terms, Business Advisory Terms, UAE Business Setup Terms, Terms and Conditions', 'Nikki Advisory Refund Policy, Cancellation Policy, Service Refunds, UAE Business Advisory')
  .replaceAll('https://nikkiadvisory.com/terms-and-conditions.html', 'https://nikkiadvisory.com/refund-cancellation-policy.html')
  .replace('<main class="terms-page privacy-legal-page">', '<main class="refund-page privacy-legal-page">');
const after = source.slice(end);
fs.writeFileSync(target, `${before}<!-- Page-specific content -->\n      ${page}\n\n      ${after}`, 'utf8');
console.log('Updated refund and cancellation policy page.');
