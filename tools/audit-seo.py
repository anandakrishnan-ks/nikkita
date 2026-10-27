#!/usr/bin/env python3
"""Validate generated SEO, crawler access, entity relationships and HTTP routes.

Uses the existing route resolver and HTML scanner. Standard library only.
Run: python3 tools/audit-seo.py --base-url https://nikkiadvisory.com
For local TLS, supply --ca-file with the development CA certificate.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict, deque
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import ssl
from urllib.error import HTTPError
from urllib.parse import urljoin, urlsplit
from urllib.request import HTTPRedirectHandler, HTTPSHandler, Request, build_opener
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


def module(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / "tools" / filename)
    loaded = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(loaded)
    return loaded


SEO = module("nikki_seo", "update-seo.py")
SITE = module("nikki_routes", "audit-site.py")


def normalize(text):
    return re.sub(r"\s+", " ", text).strip()


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, newurl):
        return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", help="Also check the deployed or local Apache responses.")
    parser.add_argument("--ca-file", type=Path, help="CA certificate for a local HTTPS server.")
    parser.add_argument("--json", type=Path, help="Save the validation report.")
    args = parser.parse_args()
    errors, warnings = [], []

    def check(condition, message):
        if not condition:
            errors.append(message)

    documents, titles, descriptions, schemas = {}, defaultdict(list), defaultdict(list), Counter()
    sitemap = [node.text for node in ET.parse(ROOT / "sitemap.xml").iter() if node.tag.endswith("}loc")]
    expected = {SEO.BASE + path for path in SEO.CONFIG["pages"]}
    check(len(sitemap) == len(set(sitemap)), "Duplicate sitemap URLs")
    check(set(sitemap) == expected, "Sitemap differs from the explicit public-page catalog")
    organization = None
    image_count, faq_count, link_count = 0, 0, 0
    adjacency = defaultdict(set)
    for url in sitemap:
        parts = urlsplit(url)
        label = parts.path
        check(url == SEO.canonical_url(url) and not parts.query and not parts.fragment, f"Noncanonical sitemap URL: {url}")
        path = ROOT / SITE.route(parts.path)
        check(path.is_file(), f"Missing source for {url}")
        if not path.is_file():
            continue
        scan = SEO.Scan()
        scan.feed(path.read_text())
        documents[label] = scan
        head = next(scan.root.find(lambda e: e.tag == "head"))
        body = next(scan.root.find(lambda e: e.tag == "body"))
        metas = defaultdict(list)
        for node in head.find(lambda e: e.tag == "meta"):
            metas[node.attrs.get("name") or node.attrs.get("property")].append(node.attrs.get("content", ""))
        for key in ["description", "robots", "og:title", "og:description", "og:url", "twitter:title", "twitter:description", "twitter:url", "twitter:card"]:
            check(len(metas[key]) == 1 and bool(metas[key][0]), f"Missing or duplicate {key}: {label}")
        canonical = list(head.find(lambda e: e.tag == "link" and e.attrs.get("rel") == "canonical"))
        check(len(canonical) == 1 and canonical[0].attrs.get("href") == url, f"Canonical mismatch: {label}")
        check(metas["og:url"] == [url] and metas["twitter:url"] == [url], f"Social URL mismatch: {label}")
        check("noindex" not in ",".join(metas["robots"]), f"Public page is noindex: {label}")
        check(bool(list(head.find(lambda e: e.tag == "link" and e.attrs.get("rel") == "describedby" and e.attrs.get("href") == "/llms.txt"))), f"Missing llms discovery link: {label}")
        title_nodes = list(head.find(lambda e: e.tag == "title"))
        check(len(title_nodes) == 1 and bool(scan.title.strip()), f"Missing or duplicate title: {label}")
        titles[scan.title.strip()].append(label)
        descriptions[scan.meta.get("description", "")].append(label)
        if len(scan.title) > 85:
            warnings.append(f"Long title ({len(scan.title)} characters): {label}")
        headings = list(body.find(lambda e: e.tag in {"h1", "h2", "h3", "h4", "h5", "h6"} and bool(e.text())))
        check(sum(node.tag == "h1" for node in headings) == 1, f"Expected one H1: {label}")
        previous = 0
        for node in headings:
            level = int(node.tag[1])
            check(level <= previous + 1, f"Heading skips h{previous} to h{level}: {label}: {node.text()}")
            previous = level
        for node in body.find(lambda e: e.tag == "img"):
            image_count += 1
            check("alt" in node.attrs, f"Image missing alt: {label}: {node.attrs.get('src')}")
            if urlsplit(node.attrs.get("src", "")).path.endswith((".png", ".jpg", ".jpeg", ".webp")):
                check(bool(node.attrs.get("width") and node.attrs.get("height")), f"Image missing dimensions: {label}: {node.attrs.get('src')}")
        for node in head.find(lambda e: e.tag == "link" and e.attrs.get("rel") in {"icon", "apple-touch-icon", "manifest"}):
            check((ROOT / SITE.resolve(node.attrs["href"], path.relative_to(ROOT).as_posix())).is_file(), f"Missing identity asset: {label}")
        nodes = SEO.jsonld_nodes(path.read_text())
        definitions, references = set(), set()

        def walk(value):
            if isinstance(value, dict):
                if "@id" in value:
                    references.add(value["@id"])
                    if len(value) > 1:
                        definitions.add(value["@id"])
                for item in value.values():
                    walk(item)
            elif isinstance(value, list):
                for item in value:
                    walk(item)

        walk(nodes)
        check(not (references - definitions), f"Unresolved JSON-LD entities: {label}: {sorted(references - definitions)}")
        ids = [node["@id"] for node in nodes if "@id" in node]
        check(len(ids) == len(set(ids)), f"Duplicate graph IDs: {label}")
        orgs = [node for node in nodes if node.get("@type") == "Organization"]
        check(len(orgs) == 1, f"Expected a complete Organization entity: {label}")
        if orgs:
            if organization is None:
                organization = orgs[0]
            check(orgs[0] == organization, f"Inconsistent business identity: {label}")
        check(any(node.get("@id") == url + "#webpage" for node in nodes), f"Missing WebPage entity: {label}")
        visible = normalize(body.text())
        public_questions = {node.text() for node in body.find(lambda e: e.tag == "summary" or "faq-q" in e.attrs.get("class", "").split())}
        structured_questions = set()
        for node in nodes:
            kind = node.get("@type", "")
            schemas.update(kind if isinstance(kind, list) else [kind])
            if kind == "Service":
                check(node.get("provider", {}).get("@id") == SEO.BASE + "/#organization", f"Unlinked Service provider: {label}")
                check(node.get("areaServed") == [{"@type": "Country", "name": country} for country in SEO.CONFIG["pages"][label]["areaServed"]], f"Service area mismatch: {label}")
            if kind == "FAQPage":
                for question in node.get("mainEntity", []):
                    faq_count += 1
                    structured_questions.add(question["name"])
                    answer = question.get("acceptedAnswer", {}).get("text", "")
                    check(normalize(question["name"]) in visible and bool(answer) and normalize(answer) in visible, f"FAQ schema differs from visible content: {label}: {question['name']}")
            if kind == "BlogPosting":
                check(node.get("headline") == next(node for node in headings if node.tag == "h1").text(), f"Article headline differs from H1: {label}")
                check(node.get("datePublished") == scan.meta.get("article:published_time"), f"Article date mismatch: {label}")
        check(public_questions == structured_questions, f"FAQ coverage differs from visible questions: {label}")
        if SEO.CONFIG["pages"][label].get("kind") == "service":
            check(any(node.get("@type") == "Service" for node in nodes), f"Service schema missing: {label}")
        for anchor in body.find(lambda e: e.tag == "a" and bool(e.attrs.get("href"))):
            target = urlsplit(urljoin(url, anchor.attrs["href"]))
            if target.hostname == urlsplit(SEO.BASE).hostname and SEO.BASE + target.path in expected:
                adjacency[label].add(target.path)
                link_count += 1
    for title, paths in titles.items():
        check(len(paths) == 1, f"Duplicate title: {paths}: {title}")
    for description, paths in descriptions.items():
        check(len(paths) == 1, f"Duplicate description: {paths}: {description}")
    depth, queue = {"/": 0}, deque(["/"])
    while queue:
        source = queue.popleft()
        for target in adjacency[source]:
            if target not in depth:
                depth[target] = depth[source] + 1
                queue.append(target)
    check(set(documents) <= set(depth), f"Pages unreachable from homepage links: {sorted(set(documents) - set(depth))}")
    not_found = SEO.Scan()
    not_found.feed((ROOT / "404.html").read_text())
    check("noindex" in not_found.meta.get("robots", ""), "404 must be noindex")
    check(not list(not_found.root.find(lambda e: e.tag == "link" and e.attrs.get("rel") == "canonical")), "404 must not canonicalize to a public page")
    robots = (ROOT / "robots.txt").read_text()
    check("Sitemap: " + SEO.BASE + "/sitemap.xml" in robots, "Wrong robots sitemap URL")
    agents = re.findall(r"^User-agent:\s*(.+)$", robots, re.M | re.I)
    check(agents == ["*"], "Unexpected crawler-specific access rules")
    rules = re.findall(r"^(Allow|Disallow):\s*(/\S*)", robots, re.M | re.I)

    def allowed(path):
        matches = [(len(prefix), action.lower() == "allow") for action, prefix in rules if path.startswith(prefix)]
        return max(matches)[1] if matches else True

    check(all(allowed(path) for path in documents), "robots blocks a public page")
    check(allowed("/assets/css/style.css") and allowed("/assets/js/main.js"), "robots blocks render assets")
    check(all(not allowed(path) for path in ["/tools/audit-site.py", "/assets/mail/send-enquiry.php", "/config.php"]), "robots does not exclude internal utilities")
    llms = (ROOT / "llms.txt").read_text()
    llms_links = re.findall(r"\]\((https://[^)\s]+)\)", llms)
    check(llms.startswith("# " + SEO.CONFIG["organization"]["name"] + "\n"), "llms.txt missing business heading")
    check(set(llms_links) <= expected and len(llms_links) == len(set(llms_links)), "llms.txt has duplicate or noncanonical links")
    check(SEO.CONFIG["organization"]["email"] in llms and SEO.CONFIG["organization"]["telephone"] in llms, "llms.txt contact information mismatch")
    feed = ET.parse(ROOT / "feed.xml")
    feed_links = [item.findtext("link") for item in feed.findall("./channel/item")]
    check(set(feed_links) == {url for url in expected if "/blog/" in url}, "RSS differs from public articles")
    http_count, redirect_count, private_count = 0, 0, 0
    if args.base_url:
        context = ssl.create_default_context(cafile=str(args.ca_file) if args.ca_file else None)
        opener = build_opener(NoRedirect(), HTTPSHandler(context=context))
        base = args.base_url.rstrip("/")

        def response(path, headers=None):
            try:
                return opener.open(Request(base + path, headers=headers or {}), timeout=20)
            except HTTPError as error:
                return error

        for url in sitemap + [SEO.BASE + "/robots.txt", SEO.BASE + "/sitemap.xml", SEO.BASE + "/llms.txt", SEO.BASE + "/feed.xml"]:
            path = urlsplit(url).path
            with response(path) as result:
                http_count += 1
                check(result.code == 200, f"Public URL does not return direct HTTP 200: {path}: {result.code}")
                expected_file = ROOT / SITE.route(path)
                check(result.read() == expected_file.read_bytes(), f"Served content differs from source: {path}")
                if path == "/llms.txt":
                    check(result.headers.get_content_type() == "text/plain", "llms.txt is not served as text/plain")
        # Verify all canonical pages' historical .html and trailing-slash forms.
        redirects = {path + suffix: path for path in documents if path != "/" for suffix in ["/", ".html"]}
        redirects.update({"/index.html": "/", "/blog/": "/blogs"})
        for filename, target in SEO.ALIASES.items():
            for suffix in ["", "/", ".html"]:
                redirects["/" + filename.removesuffix(".html") + suffix] = target
        for slug in SEO.SERVICE_SLUGS | {"pro-services"}:
            target = "/pro-government-services" if slug == "pro-services" else "/" + slug
            for suffix in ["", "/", ".html", "/index.html"]:
                redirects["/services/" + slug + suffix] = target
        for path, target in redirects.items():
            with response(path + "?source=seo") as result:
                redirect_count += 1
                check(result.code == 301 and result.headers.get("Location") == base + target + "?source=seo", f"Incorrect canonical redirect: {path}: {result.code}: {result.headers.get('Location')}")
        for path, code in [("/not-a-real-public-page", 404), ("/404.html", 200), ("/tools/seo-config.json", 404), ("/README.md", 404), ("/.gitignore", 403), ("/config.php", 403), ("/assets/mail/vendor/phpmailer/PHPMailer.php", 403), ("/assets/mail/email-templates.php", 403)]:
            with response(path) as result:
                private_count += 1
                check(result.code == code, f"Incorrect private/missing URL response: {path}: {result.code}")
                if path in {"/not-a-real-public-page", "/404.html"}:
                    check("noindex" in result.headers.get("X-Robots-Tag", ""), f"Missing 404 noindex header: {path}")
        with response("/about-us", {"Host": "www.nikkiadvisory.com"}) as result:
            check(result.code == 301 and result.headers.get("Location") == SEO.BASE + "/about-us", "www origin does not redirect to canonical HTTPS origin")
        asset = "/assets/css/site.css"
        version = hashlib.sha256((ROOT / asset.lstrip("/")).read_bytes()).hexdigest()[:12]
        with response(asset + "?v=" + version) as result:
            check("31536000" in result.headers.get("Cache-Control", "") and "immutable" in result.headers.get("Cache-Control", ""), "Versioned asset caching not applied")
    report = {"status": "pass" if not errors else "fail", "scope": "local sources" + (" and " + args.base_url if args.base_url else ""),
              "canonical_pages": len(documents), "schema_types": dict(sorted(schemas.items())),
              "faq_answers_matched_to_visible_content": faq_count, "images_checked": image_count,
              "internal_links": link_count, "maximum_click_depth": max(depth.values(), default=0),
              "sitemap_urls": len(sitemap), "rss_articles": len(feed_links), "llms_links": len(llms_links),
              "direct_http_urls": http_count, "canonical_redirects": redirect_count, "private_and_missing_routes": private_count,
              "errors": errors, "warnings": warnings}
    if args.json:
        args.json.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))
    raise SystemExit(bool(errors))


if __name__ == "__main__":
    main()
