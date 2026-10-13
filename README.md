# Nikki Advisory static website

This is a traditional, zero-build, multi-page HTML website. Every public page is an explicitly named `.html` file in the project root, while shared styling, behavior, and media remain centralized under `assets/`.

## Page structure

- `index.html` — home page
- `<page-name>.html` — one editable document per public page, for example `about-us.html`
- `404.html` — not-found page used by static hosting providers
- `assets/css/` — vendor styles, theme styles, responsive rules, and site-specific overrides
- `assets/css/pages/` — styles isolated to individual redesigned pages
- `assets/js/` — vendor libraries, theme interactions, forms, and site-specific behavior
- `assets/js/pages/` — interactions used only by an individual page
- `assets/imgs/` — all site imagery and SVG artwork
- `tools/validate-site.ps1` — checks every page, internal route, local asset, form hook, and script order
- `legacy-next-export/` — recoverable archive of the superseded Next.js payload; it is not loaded by the website and should be excluded from deployment

Local page links and asset URLs are relative to their HTML document. CSS imports and image URLs are relative to their stylesheet. The same files work at the domain root or inside a folder such as `/demo/`, with no build step or base-path configuration. Preview the project through an HTTP server.

## Uploading to Hostinger

For a demo site, upload the root `.html` files, `favicon.ico`, and the entire `assets/` folder directly into `public_html/demo/`. The home page must be `public_html/demo/index.html`, and shared files must be under `public_html/demo/assets/`.

Visit `https://your-domain.com/demo/`. Keep the folder structure intact and replace the older HTML and CSS files when uploading this fix. After uploading, hard-refresh the browser with Ctrl+F5 to load the updated files.

For the main site, upload the same files directly into `public_html/`. The `tools/` and `legacy-next-export/` folders are not needed on the server. Use the explicitly named `.html` pages; no Next.js routing or rewrite rules are required.

## Editing content

Open the explicitly named HTML file for the page you want to change. Page-specific content sits inside the `<div class="page-html">` wrapper. Shared navigation and footer markup remain in each document so the site works on any static host with no server-side includes or build step.

Shared visual rules belong in `assets/css/site.css` or `assets/css/responsive.css`. Shared interactions belong in `assets/js/site.js`. The existing vendor and theme files should only be changed when intentionally updating the underlying component behavior.

The redesigned mainland pages use `assets/css/pages/mainland-base.css` and `assets/js/pages/mainland.js`. Page-specific additions remain in their named stylesheets, while locally stored page imagery stays under `assets/imgs/`. These styles do not affect the shared header, breadcrumb, or footer.

## Validation

From the project root, run:

```powershell
pwsh -File tools/validate-site.ps1
```

The validator fails if a route or asset is missing, a local URL starts with `/` and would escape a deployment folder, a Next.js runtime reference returns, or the dependency order changes.
