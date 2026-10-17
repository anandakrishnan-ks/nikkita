# Nikki Advisory Static Website

Nikki Advisory is a multi-page, zero-build corporate advisory and business setup website for the UAE, Saudi Arabia, and Bahrain. Every public destination is delivered as pre-rendered static HTML with centralized styling, modular page scripts, optimized WebP imagery, and Apache `.htaccess` clean URL routing.

---

## Architecture & Design Principles

- **Zero-Build Static Architecture**: Every page is served as pure HTML, CSS, and vanilla JavaScript without client-side hydration or required compilation steps.
- **Dual-Path Routing Support**: Provides both clean directory structures (e.g., `services/accounting-bookkeeping/`) and direct root endpoints (e.g., `accounting-bookkeeping.html`) with `.htaccess` rewrite rules for seamless server and local preview compatibility.
- **Modular Asset Organization**:
  - `assets/css/site.css` & `assets/css/responsive.css` provide shared design tokens and global layout rules.
  - `assets/css/pages/` isolates page-specific styles (e.g., mainland, free zones, pricing, services, legal suites).
  - `assets/js/site.js` manages global navigation, mobile menus, and interactive utilities.
  - `assets/js/pages/` powers modular calculator, tab, and accordion behaviors.
  - `assets/imgs/` houses modern WebP illustrations, icons, and hero artwork.
  - `assets/fonts/` holds self-hosted web fonts for maximum performance and privacy compliance.

---

## Directory Structure

```text
├── index.html                           # Home page
├── about-us.html                        # About Us company profile
├── contact-us.html                      # Contact and consultation intake
├── blogs.html                           # Insights, articles, and news
├── 404.html                             # Custom not-found error page
├── sitemap.xml                          # Search engine XML sitemap
├── .htaccess                            # Apache configuration (rewrites, clean URLs, cache headers)
│
├── pricing.html                         # Pricing suite hub
├── pricing/                             # Structured pricing directory endpoints
│   ├── uae-mainland/index.html
│   ├── uae-free-zone/index.html
│   ├── uae-offshore/index.html
│   ├── saudi-arabia/index.html
│   └── bahrain/index.html
│
├── services.html                        # Services overview hub
├── services/                            # Structured service directory endpoints
│   ├── accounting-bookkeeping/index.html
│   ├── business-structuring/index.html
│   ├── business-support/index.html
│   ├── company-liquidation/index.html
│   ├── corporate-compliance/index.html
│   └── pro-services/index.html
│
├── [jurisdiction-pages].html            # Individual mainland, free zone, offshore & regional pages
├── [legal-pages].html                   # Privacy policy, terms, and refund policy
│
├── assets/
│   ├── css/                             # Core framework, global typography, and page suites
│   │   └── pages/                       # Dedicated CSS for mainland, free zones, services, pricing
│   ├── js/                              # Core behavior, theme interaction, and page-specific scripts
│   │   └── pages/                       # Mainland, pricing suite, saudi, bahrain, service suite JS
│   ├── imgs/                            # High-resolution optimized WebP assets organized by topic
│   └── fonts/                           # Self-hosted Line Awesome and web fonts
│
├── tools/                               # Automated site validation, audits, and generators
│   ├── validate-site.ps1                # PowerShell validator checking routes, assets, and tags
│   ├── build-service-suite.mjs          # Service suite builder
│   ├── build-pricing-suite.mjs          # Pricing suite builder
│   ├── build-bahrain-suite.mjs          # Bahrain suite builder
│   ├── build-saudi-suite.mjs            # Saudi suite builder
│   ├── build-privacy-policy.mjs         # Privacy policy generator
│   ├── build-refund-cancellation-policy.mjs
│   ├── build-terms-and-conditions.mjs
│   ├── legal-layout-audit.mjs           # Legal page layout checker
│   └── blogs-contact-audit.mjs          # Blog and contact page link auditor
│
└── legacy-next-export/                  # Historical reference archive (excluded from production)
```

---

## Page & Jurisdiction Catalog

### 1. Core Pages
- `index.html` — Homepage with hero slider, service highlights, and setup guides.
- `about-us.html` — Company background, mission, and advisory team credentials.
- `contact-us.html` — Consultation booking form and direct office communication channels.
- `blogs.html` — Industry news, market updates, and regulatory changes.
- `404.html` — Custom error page guiding visitors back to active hubs.

### 2. Services Suite (`/services/`)
- `services.html` (or `services/index.html`) — Complete corporate service catalog.
- `accounting-bookkeeping.html` (`services/accounting-bookkeeping/`) — Bookkeeping, VAT, and corporate tax compliance.
- `business-structuring.html` (`services/business-structuring/`) — Corporate holding structures and asset protection.
- `business-support.html` (`services/business-support/`) — Operational management, banking assistance, and office solutions.
- `company-liquidation.html` (`services/company-liquidation/`) — Compliant strike-offs, liquidations, and license cancellations.
- `corporate-compliance.html` (`services/corporate-compliance/`) — Regulatory reporting, AML/CFT, and ESR filings.
- `pro-government-services.html` (`services/pro-services/`) — Visa processing, ministry approvals, and labor services.

### 3. Pricing Suite (`/pricing/`)
- `pricing.html` — Central pricing estimator and fee comparison matrix.
- `pricing/uae-mainland/` — Cost breakdowns for DED Mainland licenses.
- `pricing/uae-free-zone/` — Package comparisons across key UAE free zones.
- `pricing/uae-offshore/` — Formation fees for international business companies.
- `pricing/saudi-arabia/` — MISA license costs and commercial registration estimates.
- `pricing/bahrain/` — Sijilat registration and CR cost guides.

### 4. Mainland Formations
- `dubai-mainland.html` — Dubai Department of Economy and Tourism (DET) setup.
- `abu-dhabi-mainland.html` — Abu Dhabi Department of Economic Development (ADDED) licensing.
- `sharjah-mainland.html` — Sharjah Economic Development Department (SEDD) registration.

### 5. Free Zone Jurisdictions
- `dmcc.html` — Dubai Multi Commodities Centre.
- `dafza.html` — Dubai Airport Freezone.
- `ifza.html` — International Free Zone Authority (Dubai).
- `dubai-silicon-oasis.html` — Dubai Silicon Oasis (DSO / DIEZ).
- `dubai-south.html` — Dubai South Aviation & Logistics City.
- `difc-company-formation.html` — Dubai International Financial Centre.
- `adgm.html` — Abu Dhabi Global Market.
- `jafza-company-formation.html` — Jebel Ali Free Zone.
- `kezad-company-formation.html` / `kizad.html` — Khalifa Economic Zones Abu Dhabi.
- `masdar.html` — Masdar City Free Zone.
- `meydan-free-zone-company-formation.html` — Meydan Free Zone.
- `rakez.html` — Ras Al Khaimah Economic Zone.
- `shams.html` — Sharjah Media City.
- `spc-free-zone-company-formation.html` — Sharjah Publishing City Free Zone.
- `ajman-free-zone-company-formation.html` — Ajman Free Zone (AFZ).
- `ajman-nuventures-company-formation.html` — Ajman Nuventures Centre Free Zone (ANCFZ).

### 6. Offshore & International
- `jafza-offshore.html` — JAFZA Offshore company formation.
- `rak-icc.html` — RAK International Corporate Centre.
- `ajman-offshore.html` — Ajman Offshore company setup.

### 7. Regional Expansion
- `business-setup-uae.html` — Comprehensive UAE entry advisory.
- `saudi-arabia.html` — Saudi Vision 2030, MISA, and commercial incorporation.
- `bahrain.html` — 100% foreign-ownership commercial registration in Bahrain.

### 8. Legal & Governance
- `privacy-policy.html` — Data protection and privacy disclosures.
- `terms-and-conditions.html` — Website terms and client engagement conditions.
- `refund-cancellation-policy.html` — Service fee refund and cancellation terms.

---

## Deployment & Hosting

### Hostinger / Apache Server Deployment
1. Upload all root `.html` files, `favicon.ico`, `sitemap.xml`, and `.htaccess` directly into `public_html/`.
2. Upload the `assets/`, `services/`, and `pricing/` directories into `public_html/`.
3. Ensure `.htaccess` is uploaded to enable:
   - Trailing slash redirection for directory URLs.
   - Clean `.html` URL rewrite mapping.
   - Custom 404 handler (`ErrorDocument 404 /404.html`).
   - Browser caching for static images, CSS, JS, and fonts.
4. Exclude `.git/`, `.gitignore`, `tools/`, and `legacy-next-export/` from production uploads.

### Local Development & Preview
To preview locally with Live Server or Python's built-in HTTP server:

```powershell
# Using Python
python -m http.server 5501

# Or run Live Server via VS Code (configured on port 5501)
```

Open `http://localhost:5501/` in your browser.

---

## Validation & Quality Assurance

To verify link integrity, relative asset paths, script loading order, and form handlers across all 43+ pages, run the automated PowerShell validation script:

```powershell
pwsh -File tools/validate-site.ps1
```

The validation suite verifies:
- All referenced internal pages and anchors exist.
- All stylesheet (`.css`), script (`.js`), font (`.woff2`), and image (`.webp`/`.svg`) paths resolve.
- No absolute root-escaping URLs (`/assets/...`) break sub-folder or staging deployments.
- No legacy Next.js runtime residues exist.
- Script dependencies are correctly ordered across all templates.
