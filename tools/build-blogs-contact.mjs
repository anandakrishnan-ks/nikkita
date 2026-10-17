/** Rebuild the Blogs and Contact page bodies while preserving the shared shell. */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const stylesheet = '<link rel="stylesheet" href="assets/css/pages/blogs-contact.css" />';

const ensureStylesheet = source => source.includes('assets/css/pages/blogs-contact.css')
  ? source
  : source.replace('<link rel="stylesheet" href="assets/css/site.css" />', `<link rel="stylesheet" href="assets/css/site.css" />\n    ${stylesheet}`);

const replacePageBody = (file, startMarker, content, bodyClass) => {
  const target = path.join(root, file);
  let source = ensureStylesheet(fs.readFileSync(target, 'utf8'));
  source = source.replace(/<body(?: class="[^"]*")?>/, `<body class="${bodyClass}">`);
  const start = source.indexOf(startMarker);
  const end = source.indexOf('<!-- Site footer -->');
  if (start < 0 || end <= start) throw new Error(`Page markers are missing in ${file}`);
  fs.writeFileSync(target, `${source.slice(0, start)}${content}\n\n      ${source.slice(end)}`, 'utf8');
};

const blogContent = `<!-- Page-specific content -->
      <div class="bc-suite bc-blog-suite">
        <nav class="bc-breadcrumb" aria-label="Breadcrumb">
          <div class="bc-container"><a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">Insights</span></div>
        </nav>

        <section class="bc-blog-hero">
          <div class="bc-container bc-blog-hero-grid">
            <div class="bc-hero-copy">
              <span class="bc-eyebrow">Knowledge &amp; market intelligence</span>
              <h1>Insight for decisions that shape your business.</h1>
              <p>Practical analysis, regulatory context and structured guidance for founders and companies entering the UAE, Saudi Arabia and Bahrain.</p>
              <div class="bc-hero-actions">
                <a class="bc-button bc-button--gold" href="#latest-insights">Explore insights <i class="las la-arrow-down" aria-hidden="true"></i></a>
                <a class="bc-text-link" href="contact-us.html">Speak to an advisor <i class="las la-arrow-right" aria-hidden="true"></i></a>
              </div>
            </div>

            <article class="bc-featured-story">
              <a class="bc-featured-media" href="business-setup-uae.html" aria-label="Read the featured UAE structure guide">
                <img src="assets/imgs/gcc-uae.jpg" alt="Dubai skyline representing UAE business setup" />
                <span class="bc-featured-label">Featured guide</span>
              </a>
              <div class="bc-featured-content">
                <div class="bc-story-meta"><span>UAE setup guide</span><time datetime="2026-09">September 2026</time></div>
                <h2><a href="business-setup-uae.html">Mainland, Free Zone or Offshore: choosing the right UAE structure</a></h2>
                <p>Compare operational reach, ownership, workspace and banking considerations before selecting a jurisdiction.</p>
                <a class="bc-arrow-link" href="business-setup-uae.html">Read the guide <i class="las la-arrow-right" aria-hidden="true"></i></a>
              </div>
            </article>
          </div>
        </section>

        <section class="bc-insights" id="latest-insights">
          <div class="bc-container">
            <header class="bc-section-heading">
              <div><span class="bc-eyebrow bc-eyebrow--dark">Latest perspectives</span><h2>Navigate the GCC with greater clarity.</h2></div>
              <p>Focused guidance across market entry, licensing, structuring and regulatory compliance.</p>
            </header>

            <div class="bc-story-grid">
              <article class="bc-story-card">
                <a class="bc-story-image" href="saudi-arabia.html"><img src="assets/imgs/gcc-saudi.jpg" alt="Riyadh skyline representing Saudi Arabia market entry" /></a>
                <div class="bc-story-card-body">
                  <div class="bc-story-meta"><span>Saudi Arabia</span><time datetime="2026-09">September 2026</time></div>
                  <h3><a href="saudi-arabia.html">A practical roadmap to Saudi Arabia MISA licensing</a></h3>
                  <p>Understand the regulatory path for foreign investment, licensing and regional expansion.</p>
                  <a class="bc-arrow-link" href="saudi-arabia.html">Explore Saudi setup <i class="las la-arrow-right" aria-hidden="true"></i></a>
                </div>
              </article>

              <article class="bc-story-card">
                <a class="bc-story-image" href="bahrain.html"><img src="assets/imgs/gcc-bahrain.jpg" alt="Manama skyline representing Bahrain company formation" /></a>
                <div class="bc-story-card-body">
                  <div class="bc-story-meta"><span>Bahrain advisory</span><time datetime="2026-09">September 2026</time></div>
                  <h3><a href="bahrain.html">Establishing an efficient regional base in Bahrain</a></h3>
                  <p>Explore Bahrain's company formation pathway and its position as a gateway to the wider Gulf market.</p>
                  <a class="bc-arrow-link" href="bahrain.html">Explore Bahrain <i class="las la-arrow-right" aria-hidden="true"></i></a>
                </div>
              </article>

              <article class="bc-story-card">
                <a class="bc-story-image" href="services/corporate-compliance/"><img src="assets/imgs/new/optimized/corporate-compliance.webp" alt="Advisors reviewing corporate compliance documents" /></a>
                <div class="bc-story-card-body">
                  <div class="bc-story-meta"><span>Compliance &amp; tax</span><time datetime="2026-09">September 2026</time></div>
                  <h3><a href="services/corporate-compliance/">Staying ahead of UAE corporate compliance</a></h3>
                  <p>A structured overview of corporate tax registration, UBO records and ongoing statutory obligations.</p>
                  <a class="bc-arrow-link" href="services/corporate-compliance/">View compliance services <i class="las la-arrow-right" aria-hidden="true"></i></a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section class="bc-market-section" aria-labelledby="market-heading">
          <div class="bc-container bc-market-layout">
            <div class="bc-market-intro">
              <span class="bc-eyebrow bc-eyebrow--dark">Explore by market</span>
              <h2 id="market-heading">One region.<br />Distinct pathways.</h2>
              <p>Each jurisdiction has its own commercial, ownership and regulatory considerations. Start with the market most relevant to your plans.</p>
            </div>
            <div class="bc-market-links">
              <a href="business-setup-uae.html"><span>01</span><strong>United Arab Emirates</strong><small>Mainland, free zone and offshore structures</small><i class="las la-arrow-up-right" aria-hidden="true"></i></a>
              <a href="saudi-arabia.html"><span>02</span><strong>Saudi Arabia</strong><small>Foreign investment and MISA pathways</small><i class="las la-arrow-up-right" aria-hidden="true"></i></a>
              <a href="bahrain.html"><span>03</span><strong>Bahrain</strong><small>Company registration and regional access</small><i class="las la-arrow-up-right" aria-hidden="true"></i></a>
            </div>
          </div>
        </section>

        <section class="bc-advisory-cta">
          <div class="bc-container">
            <div class="bc-advisory-card">
              <div><span class="bc-eyebrow">Tailored advisory</span><h2>Turn market information into a clear next step.</h2><p>Discuss your activities, ownership requirements and expansion goals with a Nikki Advisory specialist.</p></div>
              <a class="bc-button bc-button--gold" href="contact-us.html">Book a consultation <i class="las la-arrow-right" aria-hidden="true"></i></a>
            </div>
          </div>
        </section>
      </div>`;

const contactContent = `<!-- Page-specific content -->
      <div class="bc-suite bc-contact-suite">
        <nav class="bc-breadcrumb" aria-label="Breadcrumb">
          <div class="bc-container"><a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">Contact Us</span></div>
        </nav>

        <section class="bc-contact-hero">
          <div class="bc-container bc-contact-hero-grid">
            <div>
              <span class="bc-eyebrow">Start with clarity</span>
              <h1>Let’s shape the right path for your business.</h1>
            </div>
            <div class="bc-contact-hero-copy">
              <p>Share your requirements and we will respond with clear next steps for the UAE, Saudi Arabia or Bahrain.</p>
              <div class="bc-market-pills" aria-label="Markets served"><span>UAE</span><span>Saudi Arabia</span><span>Bahrain</span></div>
            </div>
          </div>
        </section>

        <section class="bc-contact-main">
          <div class="bc-container bc-contact-layout">
            <aside class="bc-contact-panel" aria-labelledby="advisor-heading">
              <span class="bc-panel-kicker">Direct advisory access</span>
              <h2 id="advisor-heading">Talk to an advisor.</h2>
              <p>Tell us where you want to operate and what you need to achieve. We will help you identify the most relevant setup or support pathway.</p>
              <div class="bc-contact-methods">
                <a href="mailto:info@nikkiadvisory.com"><i class="las la-envelope" aria-hidden="true"></i><span><small>Email us</small><strong>info@nikkiadvisory.com</strong></span></a>
                <a href="tel:+971****0000"><i class="las la-phone" aria-hidden="true"></i><span><small>Call us</small><strong>+971 XX XXX XXXX</strong></span></a>
                <div><i class="las la-map-marker-alt" aria-hidden="true"></i><span><small>Based in</small><strong>United Arab Emirates</strong></span></div>
              </div>
              <a class="bc-whatsapp-link" href="https://wa.me/971000000000?text=Hi%2C%20I%20would%20like%20to%20understand%20business%20setup%20in%20UAE%20%2F%20Saudi%20Arabia%20%2F%20Bahrain." target="_blank" rel="noopener noreferrer"><i class="lab la-whatsapp" aria-hidden="true"></i>Chat on WhatsApp <i class="las la-arrow-up-right" aria-hidden="true"></i></a>
              <p class="bc-contact-note">Services are subject to the laws, regulations and authority requirements of the relevant jurisdiction.</p>
            </aside>

            <div class="bc-form-card">
              <div class="bc-form-heading"><span>Consultation request</span><h2>Tell us about your plans.</h2><p>Complete the form and our team will review your requirements.</p></div>
              <form id="ajax-form" class="contact-form bc-contact-form" action="#" method="POST">
                <div class="bc-form-grid">
                  <div class="bc-field"><label for="contact-name">Full name <span aria-hidden="true">*</span></label><input id="contact-name" type="text" name="name" autocomplete="name" placeholder="Your name" required /></div>
                  <div class="bc-field"><label for="contact-phone">Phone number <span aria-hidden="true">*</span></label><input id="contact-phone" type="tel" name="phone" autocomplete="tel" placeholder="+971" required /></div>
                  <div class="bc-field"><label for="contact-email">Email address <span aria-hidden="true">*</span></label><input id="contact-email" type="email" name="email" autocomplete="email" placeholder="you@company.com" required /></div>
                  <div class="bc-field"><label for="contact-market">Market of interest <span aria-hidden="true">*</span></label><select id="contact-market" name="interest" required><option value="">Select a market</option><option value="UAE">United Arab Emirates</option><option value="Saudi Arabia">Saudi Arabia</option><option value="Bahrain">Bahrain</option><option value="Not sure">Not sure yet</option></select></div>
                  <div class="bc-field bc-field--wide"><label for="contact-message">How can we help?</label><textarea id="contact-message" name="message" placeholder="Tell us about your activity, preferred market and support required." rows="5"></textarea></div>
                </div>
                <p class="bc-form-privacy">By submitting this form, you agree to be contacted about your enquiry. Please review our <a href="privacy-policy.html">Privacy Policy</a>.</p>
                <button type="submit" class="bc-button bc-button--dark">Request a consultation <i class="las la-arrow-right" aria-hidden="true"></i></button>
                <p id="result" class="bc-form-result" role="status" aria-live="polite"></p>
              </form>
            </div>
          </div>
        </section>

        <section class="bc-next-steps" aria-labelledby="next-steps-heading">
          <div class="bc-container">
            <header class="bc-section-heading bc-section-heading--compact"><div><span class="bc-eyebrow bc-eyebrow--dark">What happens next</span><h2 id="next-steps-heading">A clear, considered first conversation.</h2></div></header>
            <div class="bc-step-grid">
              <article><span>01</span><i class="las la-clipboard-list" aria-hidden="true"></i><h3>Share your requirement</h3><p>Tell us your target market, activities and the support you are looking for.</p></article>
              <article><span>02</span><i class="las la-search" aria-hidden="true"></i><h3>We review the context</h3><p>Our team considers the relevant structure, jurisdiction and regulatory pathway.</p></article>
              <article><span>03</span><i class="las la-route" aria-hidden="true"></i><h3>Receive clear next steps</h3><p>We outline the practical information needed to move the conversation forward.</p></article>
            </div>
          </div>
        </section>
      </div>`;

replacePageBody('blogs.html', '<!-- Page-specific content -->', blogContent, 'bc-page-body bc-blog-body');
replacePageBody('contact-us.html', '      <div class="breadcrumb-area">', contactContent, 'bc-page-body bc-contact-body');
console.log('Updated Blogs and Contact pages.');
