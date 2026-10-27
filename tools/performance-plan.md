Performance improvement plan for Nikki Advisory — 27 October 2026

The objective is a PageSpeed Performance score above 90 on desktop and mobile, preserving the present design, content, responsive layouts and business functionality. Aim for 95 or better to provide room for normal measurement variation; use 91 as the minimum passing score. This document prepares the work only. No HTML, CSS, JavaScript, images, mail configuration or production settings were changed during this analysis.

The primary evidence is the [supplied PageSpeed report](https://pagespeed.web.dev/analysis/https-nikkiadvisory-com/m4tk0k97fl?form_factor=desktop), including both device results embedded in that report. Lighthouse 13.5.0 ran these tests on 27 October 2026 at approximately 11:06 AM IST. I also fetched the [live homepage](https://nikkiadvisory.com/), inspected the local source, checked live resource headers, and opened the homepage in Chrome at desktop and mobile sizes. The fetched homepage exactly matches local `index.html`. The SEO catalog contains 57 canonical public pages; the supplied performance scores apply to the homepage, not all 57 pages.

The extracted evidence is saved in [performance-baseline-2026-10-27.json](performance-baseline-2026-10-27.json). The PageSpeed page reports insufficient real-user data, so these are laboratory results. The additional local browser observations are diagnostic observations, not new PageSpeed scores.

| Measurement | Desktop report | Mobile report | Working target: desktop / mobile |
| --- | ---: | ---: | --- |
| Performance | 89 | 79 | Aim for 95+ / 95+; minimum 91 on each |
| First Contentful Paint — first visible content | 0.75 s | 2.78 s | ≤0.8 s / ≤1.8 s |
| Largest Contentful Paint — main hero becomes visible | 1.06 s | 3.95 s | ≤1.2 s / ≤2.5 s |
| Speed Index — visual completion | 2.01 s | 5.69 s | ≤1.3 s / ≤3.4 s |
| Total Blocking Time — JavaScript blocking | 36 ms | 3 ms, displayed as 0 ms | ≤100 ms / ≤100 ms |
| Cumulative Layout Shift — unexpected movement | 0.141 | 0.004 | ≤0.05 / ≤0.05 |
| Total transferred resources | 1,874 KiB | 1,534 KiB | Reduce measured transfer without losing visual quality |
| Accessibility / Best Practices / SEO | 93 / 100 / 100 | 97 / 100 / 100 | Preserve or improve these scores |

Desktop and mobile need different emphasis. Desktop already paints its main content quickly, but the report attributes a 0.141 layout shift to `.hero-slide-container`. Mobile has good layout stability and almost no JavaScript blocking, but takes too long to paint and finish displaying the first screen. Lighthouse assigns 25% of this report's performance score to CLS and 25% to LCP. Keeping every other reported metric score unchanged and improving desktop's CLS subscore to 1 would move its weighted score from about 89 to about 94. That is an illustration of priority, not a prediction of a future run. [Lighthouse scoring explanation](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring).

The evidence points to these specific opportunities:

| Finding | Evidence | Implication |
| --- | --- | --- |
| CSS delays rendering | Ten local stylesheets plus the Google Fonts stylesheet block rendering. Local CSS totals about 713 KiB before compression; stylesheet transfer totals about 101 KiB. Estimated first-paint savings: 2,150 ms mobile and 1,850 ms desktop. | Reducing the CSS needed for the first screen is the largest reported mobile opportunity. |
| Much of the generic theme is unused during the audit | Mobile reports about 55 KiB of removable transferred CSS; desktop about 66 KiB. Bootstrap is 97.4% unused and Line Awesome CSS 98.7% unused in the mobile load recording. | Build smaller, verified style subsets. Initial-load coverage does not establish that rules are unused on other pages or during interactions. |
| Desktop hero moves | The saved audit attributes its entire desktop CLS to the hero carousel container. | Reproduce and trace the movement before choosing a fix. The shifted element can be affected by a change elsewhere. |
| Fonts add substantial loading work | Five font downloads total about 265 KiB transferred. The two full Line Awesome icon fonts contain about 177 KiB of font data. Google Fonts requests multiple Montserrat weights and italics, plus Marcellus. | Subset the existing icons and deliver the current typefaces more efficiently. |
| Images still have avoidable bytes | Image delivery estimates 319 KiB savings on mobile and 333 KiB on desktop. Examples include Riyadh imagery, market cards, the logo, ADGM JPEG and founder portrait. | Improve responsive sizing and compression while retaining current pictures and crops. |
| Content outside the first screen starts loading early | `index.html` explicitly loads the advisory banner eagerly. The trace also includes footer/newsletter backgrounds and inactive carousel backgrounds. | Avoid having distant content compete with the active hero and critical fonts. Native lazy images may still fetch near the viewport; some early requests are expected. |

The live server already delivers Brotli-compressed HTML/CSS/JavaScript and HTTP/2 was used in the supplied audit. Versioned CSS/JS checked live currently have a one-year immutable cache; images/fonts have a 30-day cache. The saved desktop report's small cache warning concerns three resources that now return one-year caching. Its document response-time diagnostic was 50 ms desktop and 36 ms mobile. Those values measure server response work, not the complete connection-and-document TTFB. Existing hero preloads also pass Lighthouse's discovery and high-priority checks. These findings do not support making a hosting migration, extra hero preloads or another generic caching pass the first work item.

1. **Record a reproducible baseline and protect current behavior.**

   Start from a backup of the current files and keep performance changes in small, separately reviewable batches. Record three cold-cache homepage runs for each device using consistent Lighthouse settings. Save metric values and traces as well as scores. Capture the current desktop, tablet and mobile appearance, including all three carousel slides and open menus.

   Reproduce the saved desktop shift with a Performance trace and inspect what changes immediately before it. Include slower CSS, font and script arrival, reloads and carousel initialization. In the additional local desktop observation, the large saved-report shift did not recur; smaller font/icon movements did. The local mobile observation also showed initial header movement. The exact trigger of the saved desktop shift remains unconfirmed, so do not assume that changing only the carousel's height will solve it.

   Primary files: `index.html`, `assets/css/pages/index.css`, `assets/css/style.css`, `assets/js/main.js` and shared header styles in `assets/css/site.css`.

2. **Stabilize the header and carousel, starting with desktop.**

   Keep the same initial, initialized and transitioning layout geometry. Inspect header height, slide sizing, Swiper's loop clones and pagination insertion. Preserve the existing responsive hero dimensions and allow content to grow where necessary; a rigid height that clips phone copy is unacceptable. The source already provides a readable first slide before Swiper initializes, so retain and verify that fallback.

   Reserve space for controls and icons before fonts arrive. If the trace identifies a font swap as a cause, use matching fallback metrics and early font discovery. Apply any change only to the element and state demonstrated to cause movement. Keep carousel autoplay, swipe, clickable country tabs, fade transitions and all CTA links.

   Completion check: CLS ≤0.05 across repeated desktop and mobile loads, with no clipping or sudden movement during initialization, resize or slide changes. Confirm one document H1 remains after loop cloning.

3. **Reduce the CSS that blocks the first screen.**

   First create a smaller shared stylesheet containing the Bootstrap utilities, layout rules and theme components actually used across the site's templates. Minify the maintained output. Preserve cascade order, media queries and styles required for hover, focus, open navigation, accordions, form errors, country selection and Swiper's generated classes. Use page and interaction coverage together; do not remove rules solely because the homepage's first load did not exercise them.

   Keep the initial header, navigation, hero, critical icons and responsive rules available immediately. Remove redundant resource hints, including the decorative star preload, where they provide no measurable benefit. The repeated footer stylesheet link is worth cleaning up, but identical links are generally deduplicated by the browser and should not be counted as two full downloads.

   Re-measure after reducing the stylesheet payload. If mobile first paint is still above target, extract a small, maintained set of critical styles for each template and load the remaining styles without blocking first paint, with a JavaScript-disabled fallback. Begin with a critical-CSS budget of about 10 KiB compressed and adjust only if trace evidence justifies it. Test fast scrolling and delayed stylesheet delivery to prevent unstyled content. Forms visible near the top of an inner page need their styles in that page's critical set. [Google's guidance on deferring noncritical CSS](https://web.dev/articles/defer-non-critical-css).

   Primary files: `assets/css/vendor/bootstrap.min.css`, `assets/css/vendor/line-awesome.min.css`, `assets/css/style.css`, `assets/css/responsive.css`, `assets/css/site.css`, page stylesheets and HTML stylesheet links. Add a repeatable optimization step suitable for this static site; no framework migration is needed.

4. **Reduce font and icon transfer while retaining the typography.**

   Retain Marcellus and Montserrat. Verify the weights and italics actually used before narrowing the font request. Compare optimized Google Fonts delivery with serving identical WOFF2 fonts locally; keep the approach that improves cold-cache measurements. If serving locally, retain the font licenses and use the correct subsets and weight declarations.

   Preload only the font files demonstrated to be necessary for the first screen. Keep font swapping and use measured fallback metrics to reduce changes in text width and line wrapping. Generate a subset of the existing Line Awesome fonts and CSS, preserving the same glyphs. Inventory all 57 pages and dynamically generated markup: the HTML currently contains 137 distinct `la-*` icon classes, so a homepage-only subset would break other pages. Keep icon boxes stable before the subset loads. [Google's font performance guidance](https://web.dev/articles/font-best-practices).

   Completion check: reduced font bytes and earlier font discovery, with identical final typefaces, correct icons and stable wrapping across tested widths. Preserve keyboard and screen-reader behavior.

5. **Optimize image selection and loading order.**

   Keep the current photography, mobile crops, dimensions, alt text and visual composition. Optimize the identified files first: Riyadh hero/card variants, the Dubai and Bahrain cards, the ADGM JPEG, the logo and founder portrait. Compare compressed WebP with AVIF alternatives where useful; select versions only after checking fine skyline detail, faces and logo edges at the display size. AVIF conversion is optional, not a prerequisite.

   Correct each image's `sizes` to its actual rendered column width. For example, the homepage's three-column market cards currently advertise a generic 600 px desktop size. Add intermediate variants if they materially reduce overfetch. Use a smaller responsive logo source while retaining a sharp high-density option.

   Change the distant advisory banner from eager loading to lazy loading. Load later carousel backgrounds and footer/newsletter backgrounds closer to when they are needed, without a blank frame when a visitor switches slides immediately. Retain the existing high-priority responsive preload for the first hero and verify that its selected URL matches the CSS image. The active hero currently weighs about 145 KiB desktop and 93 KiB mobile; it has less reported compression waste than several other images. [Google's LCP optimization guidance](https://web.dev/articles/optimize-lcp).

   Primary files: `index.html`, `assets/css/banner-images.css`, shared background rules, `assets/images/`, `tools/seo-config.json`, `tools/optimize-images.py` and `tools/update-seo.py`. Update the maintenance scripts/configuration so future asset refreshes retain these improvements. Use new filenames for changed images so existing 30-day browser caches cannot mask replacements.

6. **Keep JavaScript changes small and evidence-led.**

   Keep deferred execution and the existing on-engagement reCAPTCHA loader. Retain country selection, validation, token generation, server verification and the PHP mail endpoint. The saved audit shows only 3 ms mobile blocking and no unused-JavaScript opportunity, so replacing jQuery or Swiper is a lower priority than the CSS and image work.

   Inspect the reported Swiper forced reflows after the rendering changes. Batch layout reads/writes or initialize below-screen counters near visibility only if a trace shows a benefit. Preserve the present counters and interactions. Do not defer the carousel until scrolling or require a click to show the first slide.

7. **Validate, extend across templates, then deploy and recheck.**

   Prove the homepage improvements first. Apply the verified shared CSS/font changes across the site, preserving page-specific rules. Test representative pages for About, UAE setup, Saudi Arabia, Bahrain, Pricing, Contact, a service detail, a free-zone/mainland detail, blog listing and blog article. Crawl all 57 canonical routes for successful responses, missing resources and navigation integrity; homepage scores do not establish the scores of other templates.

   Compare screenshots at 360, 390, 412, 768, 1024 and 1440 px. Exercise desktop dropdowns, mobile menus, every hero tab, autoplay, swipe, CTAs, WhatsApp/telephone links, pricing hovers, accordions, counters and form country search. Check keyboard focus, reduced-motion preferences, JavaScript-disabled content, zoom and horizontal overflow. Test form validation, success/error states and reset on a development/staging site with mocked CAPTCHA/mail, keeping real email delivery out of automated browser checks.

   Run the existing dependency, SEO and browser audits: `python3 tools/audit-site.py`, `python3 tools/audit-seo.py` and `tools/audit-banner-forms.py` against the appropriate preview server. These are planned implementation checks; they were not run as part of this read-only analysis. Maintain source metadata and refresh content hashes without allowing the generator to restore old loading choices.

   The acceptance gate is three fresh PageSpeed runs per device after deployment: every homepage run at least 91, with a median target of 95 or more. Investigate any failure rather than selecting the best run. Require the other three categories to remain above 90 without a regression from their baseline. Apply the same performance minimum to the representative public landing pages before considering the broader rollout complete. Keep local Lighthouse/Chrome settings consistent for before/after comparisons, and separately confirm the published site with PageSpeed.

   Deploy each verified batch with updated asset hashes/new image names, purge relevant hosting caches, and repeat live checks. Keep the previous files available for rollback. Real-user Core Web Vitals should be assessed separately once sufficient data becomes available; a green lab score alone does not establish a field-data pass.

Allow approximately 3–5 developer days for implementation and cross-template validation, subject to reproducing the desktop shift and the extent of CSS extraction needed. Work in this order: baseline and shift diagnosis; carousel/header stability; smaller blocking CSS; font/icon optimization; image delivery; regression checks and live verification. Re-measure between batches and stop adding optimizations when the acceptance criteria are consistently satisfied. Estimated audit savings overlap and do not add up to a guaranteed timing or score improvement.
