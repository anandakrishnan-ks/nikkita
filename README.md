# Nikki Advisory website

Static HTML, CSS and JavaScript, with PHP for enquiry delivery and Apache
`.htaccess` rules for clean URLs and historical redirects. No build is required.

## Layout

```text
web/
├── index.html, about-us.html, contact-us.html, ...
├── services.html
├── accounting-bookkeeping.html
├── business-structuring.html
├── business-support.html
├── company-liquidation.html
├── corporate-compliance.html
├── pro-government-services.html
├── blog/                         # Existing article filenames and structure
├── assets/
│   ├── images/
│   │   ├── brand/                # Logos
│   │   ├── team/                 # People and portraits
│   │   ├── home/                 # Homepage-specific photography
│   │   ├── about/
│   │   ├── contact/
│   │   ├── blogs/                # All blog covers, thumbnails, social images
│   │   │   ├── shared/           # Shared insights banner
│   │   │   └── <article>/
│   │   ├── services/<service>/   # Banner, hero, card and responsive widths
│   │   ├── locations/<country>/<location>/
│   │   ├── business-setup/uae/
│   │   ├── pricing/
│   │   ├── shared/               # Backgrounds, decorations, shared photography
│   │   └── social/               # Site-wide social previews and generator source
│   ├── icons/
│   │   ├── favicons/             # Browser icons and webmanifest
│   │   └── ui/                   # Cursor and decorative navigation star
│   ├── fonts/
│   ├── css/
│   │   ├── pages/
│   │   └── vendor/               # Bootstrap, Swiper, AOS, Line Awesome
│   ├── js/
│   │   ├── pages/
│   │   ├── data/                 # Country calling-code dataset and attribution
│   │   └── vendor/               # Third-party libraries
│   └── mail/                     # Existing PHP endpoint and mail dependencies
└── tools/                        # Audits, maintenance and provenance
```

Store shared photographs once, under the subject they depict. Keep responsive
variants beside their parent image, using `-640`, `-960`, etc. and `-mobile-640`
for the existing phone crops. New blog imagery belongs under
`assets/images/blogs/<article>/`. No local video files are currently used, so an
empty video directory is not included.

Service source files and public URLs are flat, consistent with the other
root-level pages:

| Public URL | Source |
| --- | --- |
| `/services` | `services.html` |
| `/accounting-bookkeeping` | `accounting-bookkeeping.html` |
| `/business-structuring` | `business-structuring.html` |
| `/business-support` | `business-support.html` |
| `/company-liquidation` | `company-liquidation.html` |
| `/corporate-compliance` | `corporate-compliance.html` |
| `/pro-government-services` | `pro-government-services.html` |

The `blog/` directory, article filenames, content and public blog URLs remain
unchanged. Older `/services/<service>/` and service `index.html` URLs redirect to
the root-level URLs above. Moved static asset URLs redirect to their new locations; the browser's
implicit `/favicon.ico` request returns the same Nikki icon used in page metadata.
Root Apple touch-icon requests also resolve to the existing branded Apple icon.
All pages, including blogs, declare versioned browser/Apple icons and a manifest;
`.webmanifest` files are served as `application/manifest+json`.
Service navigation uses the root-level URLs above in headers, mobile
menus, footers and page content, including blog articles.

## Hosting

Upload all root HTML files, `config.php`, `.htaccess`, `robots.txt`, `sitemap.xml`,
`feed.xml`, `llms.txt`, and the `assets/` and `blog/` directories into `public_html/`. Use
Apache 2.4+ with `mod_rewrite` and HTTPS enabled. There is no service directory
to upload; the old service folder URLs are redirects only.

Keep `tools/`, editor files and documentation out of production uploads. Local
previews should use an Apache document root pointing at this folder, because a
plain static server does not implement extensionless page URLs or legacy redirects.
The website has no compilation/build step.

## Enquiry delivery

All live forms submit through `assets/js/enquiry-forms.js` to
`assets/mail/send-enquiry.php`. Country selection, validation, reCAPTCHA v3,
submission status and form reset share this handler. Page scripts retain CTA
and form-start tracking.

The endpoint requires PHP 8+, cURL, OpenSSL and SMTP access. Its configuration
loads `../nikki-mail-config.php`, or the file specified by `NIKKI_PRIVATE_CONFIG`.
Keep this private file outside `public_html/` with owner-only permissions:

```php
<?php
return [
    'smtp_user' => 'info@nikkiadvisory.com',
    'smtp_password' => 'YOUR_SMTP_PASSWORD',
    'recaptcha_secret' => 'YOUR_RECAPTCHA_V3_SECRET',
];
```

The default SMTP server is `smtpout.secureserver.net`, SSL port 465. Override
`smtp_host`, `smtp_port` and `smtp_encryption` in the private file if the mailbox
uses different settings. The reCAPTCHA key must allow `nikkiadvisory.com`.

## Maintenance and checks

```sh
python3 tools/audit-site.py
python3 tools/audit-seo.py
python3 tools/audit-site.py --base-url https://localhost:9443 --ca-file /path/to/dev-ca.pem
python3 tools/audit-seo.py --base-url https://localhost:9443 --ca-file /path/to/dev-ca.pem
python3 -m pip install Pillow playwright
python3 tools/audit-banner-forms.py --base-url https://localhost:9443
```

The dependency audit cross-checks canonical pages, HTML, CSS imports/backgrounds,
responsive images, JavaScript endpoints, metadata, manifests, fonts and PHP
includes. It reports missing dependencies, duplicate images and unreferenced
files, with explicit allowances for required maintenance and attribution files.
It also checks internal navigation and section IDs using each page's public URL.
With `--base-url`, it requests every internal navigation destination and checks
that the returned HTML matches the intended source file, following redirects.
Use `--json /tmp/site-audit.json` to save its full report outside the website.

The browser audit uses installed Chrome on macOS; pass `--browser /path/to/chrome`
on other systems. It verifies responsive banners and preloads, country search,
keyboard/touch behavior and contact-form submission/reset. CAPTCHA and mail are
mocked; the audit sends no email.
For a local HTTPS server, both CLI audits accept `--ca-file /path/to/dev-ca.pem`.
Use an Apache TLS virtual host when testing the production rules unchanged;
the production `.htaccess` redirects plain HTTP requests to the public origin.
The browser audit accepts local test certificates; use it only against your
development server. HTTP checks exercise the actual Apache `.htaccess` rules.

`tools/banner-assets.json` inventories the retained WebP files and records their
original source paths as provenance. Removed originals are not build dependencies.
`tools/image-source-notes.md` and `assets/js/data/COUNTRY_CODES_SOURCE.md` retain photo
and country-data attribution. `tools/cleanup-report.json` is the historical cleanup record.
`tools/reorganization-report.json` maps every moved file to its current location
and records the routing, reference, visual and functional validation. Historical
source paths in provenance records are intentionally retained as historical data.
`tools/live-audit-report.json` records the public server crawl, confirmed icon
issues and the files to upload for the prepared fixes; it is not a deployment log.

After URL or metadata changes, use `python3 tools/update-seo.py --metadata-only`
to refresh canonical/social URLs, structured-data URLs, sitemap and RSS while
preserving image loading attributes and page presentation. The refresh uses the
root-level service URLs and retains the current blog URLs. It replaces managed
metadata in place, keeping stylesheets and preloads in their existing order.
Run without `--metadata-only` to also maintain image loading/alt attributes.
On macOS, `swift tools/create-social-images.swift` rebuilds the
two social preview images; its required skyline source is retained.

## SEO and AI discoverability maintenance

`tools/seo-config.json` is the source of truth for public business facts, the
57-page canonical catalog, service areas, parent-page relationships, search-title
overrides, curated `llms.txt` links and responsive image sources. Edit it when a
business fact or public route changes, then run `python3 tools/update-seo.py`.
Keep the visible page copy/contact links aligned when business facts change;
the generator manages metadata and entities rather than rewriting editorial copy.
New pages must be added deliberately to this catalog; HTML under private or
maintenance folders is never discovered automatically. Public content and FAQ
answers remain in the HTML rather than a separate SEO-only content copy.

The refresh updates each page in place and generates the existing sitemap and
RSS plus `llms.txt`. Organization and WebSite entities are complete on every
public page, with consistent IDs connecting page, service, breadcrumb, article
and FAQ entities. Existing article publication dates, headlines and corporate
authorship are preserved. FAQ schema is derived from the actual public answers,
including collapsed native details and existing accordions. The same HTML is
available to readers and crawlers. No special AI-only content or client-side
metadata is used. `llms-full.txt` is intentionally omitted because it would
duplicate this already crawlable content and require separate maintenance.

Use `python3 tools/audit-seo.py --json /tmp/nikki-seo-check.json` to verify the
catalog, metadata, headings, image attributes, JSON-LD entity references and FAQ
content, robots rules, sitemap, RSS and llms links. With `--base-url`, the audit
also verifies direct HTTP responses, canonical redirects, private routes, 404
status/noindex handling and versioned-asset cache headers. It complements the
existing dependency and browser audits.

For retained PNG/JPEG sources, `python3 tools/optimize-images.py` (Pillow required)
rebuilds responsive WebP variants without modifying the originals. Follow it
with `python3 tools/update-seo.py` to update page attributes and asset versions.
CSS and JS references use content hashes and can be cached for one year. HTML
revalidates; unversioned images/fonts use a 30-day cache. Use a new image filename
when replacing published imagery and purge the hosting/CDN cache on deployment.
Legacy AOS and Bootstrap JavaScript assets remain available for historical URLs
but no longer load on current pages. Swiper and counter libraries load only on
the homepage, where their components are used. reCAPTCHA loads on form engagement
or submission; token generation and the existing server verification remain.

The complete implementation report and external setup steps are in
`tools/seo-audit-report.md`; `tools/seo-audit-report.json` records local validation.
Do not upload the `tools/` directory. Search Console and Bing verification must
use real account-provided DNS records or verification files; no placeholder
verification values are shipped. Preserve any existing verification records
when deploying, submit `https://nikkiadvisory.com/sitemap.xml`, then inspect
representative pages and rerun the public PageSpeed audit after upload.
