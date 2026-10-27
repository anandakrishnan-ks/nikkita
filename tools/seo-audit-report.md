# Nikki Advisory: SEO and AI discoverability implementation

Date: 26 October 2026. Scope: local implementation and local Apache/browser validation.
Production origin: `https://nikkiadvisory.com`, confirmed by the existing canonical
URLs, sitemap and live homepage. Changes have **not** been deployed.

## Architecture and initial audit

The project consists of static HTML, CSS and JavaScript, with PHP for enquiry
delivery and Apache-compatible rewrite rules on Hostinger/LiteSpeed. There is no
Next.js, React, TypeScript, package manager, compilation or application build.

The baseline contained 58 HTML files: 57 public pages and a noindex 404 page.
The existing dependency audit reported no broken internal links, missing assets
or duplicate images. Canonicals, social images, a 57-URL sitemap, RSS, favicons
and an SEO maintenance script already existed and were extended in place.

The initial gaps were partial/disconnected JSON-LD on many pages, multiple
homepage H1s (including carousel clones), no Contact H1, service pages without
audience/FAQ content, no llms.txt, inconsistent trailing-slash handling and
oversized images/blocking script work. The earlier mobile PageSpeed report was
69 performance, 88 accessibility, 96 best practices and 100 SEO. That is the
pre-deployment baseline, not a score for this implementation.

## Technical SEO and identity

- All 57 public pages have unique titles/descriptions, a canonical HTTPS URL,
  consistent Open Graph/Twitter metadata, one static H1 and valid JSON-LD.
- The homepage keeps one rendered H1 after Swiper creates loop clones. Subtitle
  text and statistics use appropriate non-heading elements. Existing heading
  typography was retained, including mobile hero copy and spacing.
- `tools/seo-config.json` centralizes business identity, known contact details,
  Ajman location, service areas, existing LinkedIn/Instagram profiles, page
  relationships and search-title overrides. It also explicitly registers public
  routes; temporary/private HTML cannot silently enter generated SEO files.
- Existing favicon assets already contain 16, 32 and 48-pixel ICO variants and
  valid manifest/Apple icons. Their URLs and branding were preserved.
- Existing HTTPS/non-www canonicalization remains. Public `.html` and trailing
  slash variants redirect permanently to the canonical route, preserving query
  parameters. Legacy service, asset and article routes remain supported; missing
  legacy PRO-service variants and the `/blog/` index redirect were added.
- Missing routes retain HTTP 404 and the existing error page. The error page is
  excluded from the sitemap, has no canonical, and carries noindex metadata and
  an `X-Robots-Tag`. Configuration, bundled mail dependencies, templates, source
  tools, dotfiles and backup files are protected at the server level.
- No verification values, fabricated business identifiers, offices, credentials,
  testimonials, ratings, awards, clients, prices or experience claims were added.

## Content, trust and internal links

The six existing service pages now explain their intended audience, retain their
scope/process/professional limitations, answer three relevant questions each and
link to related services, the setup guide, pricing/process guidance and contact.
These pages are accounting/bookkeeping, business structuring, business support,
company closure, corporate compliance, and PRO/government services.

The existing UAE setup guide now answers six practical questions about choosing
a route, documents, process, costs, eligibility/timelines and post-formation
support. It links to the existing route-specific guides rather than duplicating
their prices, requirements or timelines in a new resource. No new landing pages
or thin location pages were created.

About now identifies founder Nikita D using information already published in the
homepage founder note. Contact specifies Ajman using the existing footer address.
Existing article corporate bylines link to About; article headlines, authorship,
publication dates and original social images are retained. All important pages
are reachable within two link clicks of the homepage.

## Structured data

Each public document contains a complete Organization and WebSite entity using
consistent IDs. Page entities connect to the website, organization, breadcrumb,
service, article and actual FAQ content as applicable.

Implemented types include Organization, WebSite, WebPage, AboutPage, ContactPage,
CollectionPage, BreadcrumbList, Service, ItemList, BlogPosting and FAQPage, plus
the relevant nested Person, PostalAddress, ContactPoint, Country and ImageObject
objects. The audit finds 31 Service entities, 56 breadcrumbs, 9 BlogPosting
entities and 38 FAQPage entities covering 271 public answers. Of those answers,
24 were added to the six service pages and the UAE guide; the rest already
existed in the website. FAQ JSON-LD is generated from the actual HTML answers.

Organization is used instead of asserting a LocalBusiness listing with an
unverified street address or customer-facing office. No fake Offer, rating,
review or price schema was introduced. JSON-LD parsing, IDs, entity references,
service areas and FAQ/content agreement pass local validation. Google rich
result eligibility is not implied by having valid Schema.org markup.

## Sitemap, robots and llms.txt

- **Sitemap:** the existing `sitemap.xml` remains the single implementation. Its
  57 canonical, public URLs were already correct, so its final bytes are unchanged.
  No redirect, query, utility or 404 URLs are included. Existing article lastmod
  dates are preserved; artificial "updated today" dates were not added.
- **RSS:** the existing nine-article feed is preserved, including article
  headlines, publication dates and canonical URLs.
- **Robots:** the wildcard group permits public content and rendering assets
  for search/AI crawlers, identifies the production sitemap, and excludes the
  actual maintenance, legacy-export, configuration and mail-handler paths.
  Server access rules protect private files independently of robots rules.
- **llms.txt:** a concise root overview contains the actual business identity,
  known contact/location information and 36 canonical links to company, setup,
  service, process, guide and policy pages. Every public HTML page points to it
  with `rel="describedby"`. It is generated from the same facts and page metadata
  and is served as `text/plain`.
- **llms-full.txt:** intentionally omitted. The complete public content is already
  in crawlable HTML; another full-text copy would add drift and maintenance.

Important content is available in the original HTML, not client-generated SEO
tags. Native new FAQ answers work without JavaScript, and the first hero remains
readable before Swiper initializes or when JavaScript is disabled. No cloaking,
AI-only claims, special bot pages or additional SEO libraries were introduced.

## Performance and accessibility

- Two responsive logo WebPs replace 810,236/815,244-byte PNG downloads with
  33,422/33,658-byte assets (about 96% smaller). Original PNGs remain for existing
  URLs, structured data and source regeneration.
- Fifteen WebP derivatives cover the logos and five other oversized source
  images. Large photographs, the founder portrait and a blog thumbnail now use
  responsive sizes; original source files are retained.
- Twenty-four existing homepage/market image variants were re-encoded with
  unchanged dimensions, saving 1,687,096 bytes across those files. Lossy WebP
  compression was used; the banner inventory records the actual resulting sizes.
- All 406 public-page image instances have explicit alt attributes; raster images
  have dimensions. Existing decorative empty alt attributes remain intentional.
- jQuery stays at 3.7.1 and now uses the official minified distribution, verified
  against its published SHA-256 integrity value. The file shrank from 296,039 to
  87,533 bytes. A targeted Waypoints compatibility fix avoids `offset(window)`
  and removes the observed `getClientRects` exception.
- Dependent local scripts use ordered `defer`. Unused Bootstrap JavaScript and
  AOS assets no longer load; originals remain available for historical asset
  URLs. Swiper/counter assets load only where their components exist.
- reCAPTCHA loads on form engagement or submission, rather than initial render.
  Submission still requests a token and uses the unchanged server verification.
- The nested footer CSS import is now a direct stylesheet at the same cascade
  position. CSS/JS references carry content hashes and get one-year immutable
  caching; unversioned images/fonts receive 30 days. HTML revalidates. Compression
  directives are guarded so the hosting server can use its existing support.
- Carousel controls are native buttons with names matching their visible labels.
  The homepage interest select has an accessible name, footer hit areas are
  larger, and selected gold-on-white text uses a readable gold shade.

No new public PageSpeed/Core Web Vitals result is claimed. The changes must be
uploaded before the public audit can measure them.

## Verification

`tools/seo-audit-report.json` records the final source/HTTP SEO audit. Checks run:

1. Existing dependency/navigation audit: no missing dependencies, duplicate images,
   unreferenced files or broken internal/section links.
2. SEO audit: 57 canonical public pages, unique metadata, one H1, sequential
   headings, valid JSON-LD relationships, FAQ agreement, image attributes, robots,
   sitemap, RSS, llms links and two-click maximum reachability.
3. Actual Apache HTTP checks: 61 direct public URLs, 157 permanent canonical
   redirect variants with query preservation, and eight private/error cases.
   Cache headers, text content type, noindex error headers and www canonical
   origin behavior were checked against the real `.htaccess` file.
4. Browser audit: 324 inventoried WebPs, all 57 public pages and 40 enquiry forms;
   country search, keyboard/touch interactions, mocked multipart submission/reset,
   mobile/tablet/desktop layouts and responsive hero preload selection.
5. Focused browser checks: one rendered H1, carousel controls, initial absence of
   reCAPTCHA, one load on form engagement, no original PNG logo requests, native
   FAQ disclosures, readable no-JavaScript content and no JavaScript exceptions.
6. JavaScript syntax and maintenance Python syntax checks. Both metadata-only and
   full SEO refreshes are idempotent. The complete PHP/config/mail backend and the
   historical cleanup report are byte-identical to the starting project.

No application compilation is applicable to this static site. CAPTCHA/mail are
mocked locally; no email was sent. PHP syntax/runtime, live SMTP delivery and
production reCAPTCHA were not executed locally because PHP/SMTP are unavailable
in this test environment. No PHP backend code was changed.

## External configuration and remaining work

1. Upload the changed public HTML, `.htaccess`, `robots.txt`, `llms.txt` and updated
   assets to the existing production document root. Keep `tools/`, local test
   files and private mail configuration outside production uploads. Purge the
   hosting/CDN cache so new HTML and asset references become visible together.
2. In the owner's Google Search Console/Bing Webmaster accounts, preserve existing
   verification and use real account-provided DNS records or verification files
   where required. No verification tags were present in the local HTML, and no
   placeholder verification codes/files were added. Account/DNS state was not
   accessed. Submit `https://nikkiadvisory.com/sitemap.xml` after deployment.
3. Use URL Inspection and the relevant structured-data validation tools on Home,
   a service, a formation page and an article. Rerun the CLI audits against the
   production origin after upload and rerun mobile/desktop PageSpeed. The earlier
   report had insufficient real-user data; this work does not establish a field
   Core Web Vitals pass.
4. Confirm production enquiry delivery with the existing configured reCAPTCHA and
   SMTP settings. The business owner should continue to review jurisdiction-specific
   prices, timelines, legal/tax guidance and published business facts as they change.

Business facts were taken from the existing public website. No full street
address, business registration identifiers or additional credentials were supplied,
so they are omitted. Existing pricing and publication dates are preserved rather
than asserted to have been freshly verified.

Reference guidance: [Google AI features and website best practices](https://developers.google.com/search/docs/appearance/ai-features),
[Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization),
[llms.txt proposal](https://llmstxt.org/), and
[LiteSpeed header/configuration support](https://docs.litespeedtech.com/lsws/configuration/).

## File inventory

Created: **21** files. Modified: **101** files. Removed: **0** files.

### Created

```text
assets/images/blogs/misa-operational-readiness/thumbnail-640.webp
assets/images/blogs/misa-operational-readiness/thumbnail-960.webp
assets/images/brand/logo-600.webp
assets/images/brand/logo-alt-600.webp
assets/images/locations/bahrain/manama/waterfront-original-1280.webp
assets/images/locations/bahrain/manama/waterfront-original-640.webp
assets/images/locations/bahrain/manama/waterfront-original-960.webp
assets/images/locations/uae/abu-dhabi-mainland/louvre-1600.webp
assets/images/locations/uae/abu-dhabi-mainland/louvre-640.webp
assets/images/locations/uae/abu-dhabi-mainland/louvre-960.webp
assets/images/shared/photography/business-planning-1600.webp
assets/images/shared/photography/business-planning-640.webp
assets/images/shared/photography/business-planning-960.webp
assets/images/team/nikita-d-founder-640.webp
assets/images/team/nikita-d-founder-960.webp
llms.txt
tools/audit-seo.py
tools/optimize-images.py
tools/seo-audit-report.json
tools/seo-audit-report.md
tools/seo-config.json
```

### Modified

```text
.htaccess
404.html
README.md
about-us.html
abu-dhabi-mainland.html
accounting-bookkeeping.html
adgm.html
ajman-free-zone-company-formation.html
ajman-nuventures-company-formation.html
ajman-offshore.html
assets/css/footer-v2.css
assets/css/pages/blogs-contact.css
assets/css/pages/business-setup-uae.css
assets/css/pages/index.css
assets/css/pages/service-suite.css
assets/css/responsive.css
assets/css/site.css
assets/css/style.css
assets/images/home/advisory-banner-1600.webp
assets/images/home/advisory-banner-2880.webp
assets/images/home/advisory-banner-640.webp
assets/images/home/advisory-banner-960.webp
assets/images/home/hero-dubai-1376.webp
assets/images/home/hero-dubai-960.webp
assets/images/home/hero-dubai-mobile-640.webp
assets/images/home/hero-dubai-mobile-960.webp
assets/images/locations/bahrain/manama/world-trade-centre-1376.webp
assets/images/locations/bahrain/manama/world-trade-centre-640.webp
assets/images/locations/bahrain/manama/world-trade-centre-960.webp
assets/images/locations/bahrain/manama/world-trade-centre-mobile-640.webp
assets/images/locations/bahrain/manama/world-trade-centre-mobile-960.webp
assets/images/locations/saudi-arabia/riyadh/kingdom-centre-1376.webp
assets/images/locations/saudi-arabia/riyadh/kingdom-centre-640.webp
assets/images/locations/saudi-arabia/riyadh/kingdom-centre-960.webp
assets/images/locations/saudi-arabia/riyadh/kingdom-centre-mobile-640.webp
assets/images/locations/saudi-arabia/riyadh/kingdom-centre-mobile-960.webp
assets/images/locations/uae/dubai/skyline-dusk-1600.webp
assets/images/locations/uae/dubai/skyline-dusk-1920.webp
assets/images/locations/uae/dubai/skyline-dusk-640.webp
assets/images/locations/uae/dubai/skyline-dusk-960.webp
assets/images/locations/uae/dubai/skyline-dusk-mobile-640.webp
assets/images/locations/uae/dubai/skyline-dusk-mobile-960.webp
assets/js/enquiry-forms.js
assets/js/main.js
assets/js/vendor/jquery-3.7.1.js
assets/js/vendor/waypoints.min.js
bahrain-pricing.html
bahrain.html
blog/bahrain-fintech-gcc-base.html
blog/misa-license-operational-readiness.html
blog/sama-licensing-fintech.html
blog/saudi-ai-market-entry.html
blog/saudi-entry-strategic-decisions.html
blog/saudi-nitaqat-2026.html
blog/saudi-trading-foreign-investor.html
blog/saudi-transport-tga-license.html
blog/uae-golden-residency-2026.html
blogs-bahrain.html
blogs-saudi-arabia.html
blogs-uae.html
blogs.html
business-setup-uae.html
business-structuring.html
business-support.html
company-liquidation.html
contact-us.html
corporate-compliance.html
dafza.html
difc-company-formation.html
dmcc.html
dubai-mainland.html
dubai-silicon-oasis.html
dubai-south.html
ifza.html
index.html
jafza-company-formation.html
jafza-offshore.html
kezad-company-formation.html
masdar.html
meydan-free-zone-company-formation.html
pricing.html
privacy-policy.html
pro-government-services.html
rak-icc.html
rakez.html
refund-cancellation-policy.html
robots.txt
saudi-arabia-pricing.html
saudi-arabia.html
services.html
shams.html
sharjah-mainland.html
spc-free-zone-company-formation.html
terms-and-conditions.html
tools/audit-banner-forms.py
tools/audit-site.py
tools/banner-assets.json
tools/update-seo.py
uae-free-zone-pricing.html
uae-mainland-pricing.html
uae-offshore-pricing.html
```

### Removed

None.

