import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const footerStart = '<footer id="site-footer" class="footer-area footer-reference">';

function prefixFor(file) {
  const depth = path.relative(root, path.dirname(file)).split(path.sep).filter(Boolean).length;
  return '../'.repeat(depth);
}

function footer(prefix) {
  const link = (target) => `${prefix}${target}`;
  return `<footer id="site-footer" class="footer-area footer-reference">
        <span class="border-gradient-shape"></span>
        <div class="custom-container">
          <div class="custom-row">
            <div class="footer-widget footer-left">
              <a href="${link('index.html')}" class="logo"><img src="${link('assets/imgs/logo/logo.png')}" alt="Nikki Advisory" /></a>
              <p>Clarity-driven business setup and advisory across the UAE, Saudi Arabia and Bahrain &mdash; focused on structured decisions, compliance and long-term business growth.</p>
              <ul class="social-icons" aria-label="Follow Nikki Advisory">
                <li><a href="https://www.facebook.com/share/199ZkXJF8D/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="lab la-facebook-f" aria-hidden="true"></i></a></li>
                <li><a href="https://www.instagram.com/nikkiadvisory?igsh=MW0zbHl0b3p1cXQ0NA%3D%3D&amp;utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="lab la-instagram" aria-hidden="true"></i></a></li>
                <li><a href="https://www.linkedin.com/company/nikkiadvisory/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="lab la-linkedin-in" aria-hidden="true"></i></a></li>
              </ul>
            </div>
            <div class="right">
              <div class="footer-links">
                <div class="footer-widget footer-widget-link">
                  <h3>Company</h3>
                  <ul>
                    <li><a href="${link('about-us.html')}">About Us</a></li>
                    <li><a href="${link('pricing.html')}">Pricing</a></li>
                    <li><a href="${link('blogs.html')}">Blogs</a></li>
                    <li><a href="${link('contact-us.html')}">Contact</a></li>
                  </ul>
                </div>
                <div class="footer-widget footer-widget-link">
                  <h3>Business Setup</h3>
                  <ul>
                    <li><a href="${link('business-setup-uae.html')}">United Arab Emirates</a></li>
                    <li><a href="${link('business-setup-uae.html#mainland-setup')}">UAE Mainland</a></li>
                    <li><a href="${link('business-setup-uae.html#free-zone-setup')}">UAE Freezone</a></li>
                    <li><a href="${link('saudi-arabia.html')}">Saudi Arabia</a></li>
                    <li><a href="${link('bahrain.html')}">Bahrain</a></li>
                  </ul>
                </div>
                <div class="footer-widget footer-widget-link footer-services">
                  <h3>Our Services</h3>
                  <ul>
                    <li><a href="${link('services/pro-services/')}">PRO Services</a></li>
                    <li><a href="${link('services/corporate-compliance/')}">Corporate Compliance</a></li>
                    <li><a href="${link('services/accounting-bookkeeping/')}">Accounting &amp; Bookkeeping</a></li>
                    <li><a href="${link('services/company-liquidation/')}">Company Liquidation</a></li>
                    <li><a href="${link('services/business-support/')}">Business Support</a></li>
                    <li><a href="${link('services/business-structuring/')}">Business Structuring</a></li>
                  </ul>
                </div>
                <div class="footer-widget footer-widget-link footer-hours">
                  <h3>Business Hours</h3>
                  <div class="footer-hours-group"><strong>UAE</strong><span>Monday &ndash; Friday</span><span>9:00 AM &ndash; 6:00 PM</span></div>
                  <div class="footer-hours-group"><strong>Saudi Arabia &amp; Bahrain</strong><span>Sunday &ndash; Thursday</span><span>9:00 AM &ndash; 6:00 PM</span></div>
                  <small>All times are local to the respective jurisdiction.</small>
                </div>
              </div>
              <div class="footer-contact-infos">
                <div class="footer-widget footer-widget-link">
                  <h3><i class="las la-map-marker-alt" aria-hidden="true"></i>Address</h3>
                  <p>Ajman, United Arab Emirates<br />Licence No. 2623315388888</p>
                </div>
                <div class="footer-widget footer-widget-link">
                  <h3><i class="las la-envelope" aria-hidden="true"></i>Contact</h3>
                  <ul><li><a href="mailto:info@nikkiadvisory.com"><i class="las la-envelope" aria-hidden="true"></i>info@nikkiadvisory.com</a></li></ul>
                </div>
                <div class="footer-widget footer-widget-link">
                  <h3><i class="las la-globe" aria-hidden="true"></i>Countries</h3>
                  <ul><li>UAE</li><li>Saudi Arabia</li><li>Bahrain</li></ul>
                </div>
              </div>
            </div>
          </div>
          <div class="copyright-area">
            <p>&copy; 2026 Nikki Advisory. All rights reserved.</p>
            <ul>
              <li><a href="${link('terms-and-conditions.html')}">Terms &amp; Conditions</a></li>
              <li><a href="${link('privacy-policy.html')}">Privacy Policy</a></li>
              <li><a href="${link('refund-cancellation-policy.html')}">Refund &amp; Cancellation Policy</a></li>
            </ul>
          </div>
        </div>
      </footer>`;
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'legacy-next-export' || entry.name === '.git') return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : entry.name.endsWith('.html') ? [fullPath] : [];
  });
}

let updated = 0;
for (const file of walk(root)) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes(footerStart)) continue;
  const next = html.replace(/<footer id="site-footer" class="footer-area footer-reference">[\s\S]*?<\/footer>/, footer(prefixFor(file)));
  if (next !== html) {
    fs.writeFileSync(file, next);
    updated += 1;
  }
}

console.log(`Refined the shared footer across ${updated} HTML files.`);
