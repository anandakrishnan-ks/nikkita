"""Refresh static metadata, linked JSON-LD, sitemap, RSS and llms.txt in place.

Business facts and page relationships live in seo-config.json. Public content
and FAQ answers are read from the HTML; no client-side SEO or build is needed.
"""

from __future__ import annotations

import argparse
from copy import deepcopy
import hashlib
import json
import re
import struct
from datetime import datetime, timezone
from email.utils import format_datetime
from html import escape, unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlsplit, urlunsplit
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / "tools/seo-config.json").read_text(encoding="utf-8"))
BASE = CONFIG["origin"].rstrip("/")
OG = f"{BASE}/assets/images/social/nikki-advisory-og.jpg"
SQUARE = f"{BASE}/assets/images/social/nikki-advisory-square.jpg"
OG_ALT = "Nikki Advisory business setup and advisory across the UAE, Saudi Arabia and Bahrain"
EXCLUDE = {"404.html", "index copy.html", "kizad.html"}
SERVICE_SLUGS = {
    "accounting-bookkeeping", "business-structuring", "business-support",
    "company-liquidation", "corporate-compliance", "pro-government-services",
}
ALIASES = {
    "dafza.html": "/dafza-company-formation",
    "dmcc.html": "/dmcc-company-formation",
    "dubai-silicon-oasis.html": "/dubai-silicon-oasis-company-formation",
    "dubai-south.html": "/dubai-south-company-formation",
    "shams.html": "/shams-company-formation",
}


class Element:
    def __init__(self, tag, attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def text(self):
        return re.sub(r"\s+", " ", " ".join(
            child.text() if isinstance(child, Element) else child
            for child in self.children
        )).strip()

    def find(self, predicate):
        for child in self.children:
            if isinstance(child, Element):
                if predicate(child):
                    yield child
                yield from child.find(predicate)


class Scan(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.in_title = False
        self.meta = {}
        self.scripts = []
        self.root = Element("document")
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        element = Element(tag, attrs)
        self.stack[-1].children.append(element)
        if tag not in {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}:
            self.stack.append(element)
        if tag == "title":
            self.in_title = True
        elif tag == "meta":
            self.meta[d.get("name") or d.get("property")] = d.get("content", "")
        elif tag == "script" and d.get("type") == "application/ld+json":
            self.scripts.append(True)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        self.stack[-1].children.append(data)
        if self.in_title:
            self.title += data

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)


def route(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    if rel == "index.html":
        return "/"
    if rel == "kizad.html":
        return "/kezad-company-formation"
    if rel in ALIASES:
        return ALIASES[rel]
    return "/" + rel.removesuffix(".html")


def canonical_url(value: str) -> str:
    """Normalize this site's historical page URLs without changing other hosts."""
    parts = urlsplit(value)
    if parts.hostname not in {"nikkiadvisory.com", "www.nikkiadvisory.com"}:
        return value
    path = parts.path or "/"
    if path.endswith("/index.html"):
        path = path.removesuffix("index.html")
    path = path.removesuffix(".html")
    service_path = path.rstrip("/")
    if service_path == "/services":
        path = "/services"
    elif service_path.startswith("/services/"):
        slug = service_path.removeprefix("/services/")
        slug = "pro-government-services" if slug == "pro-services" else slug
        if slug in SERVICE_SLUGS:
            path = "/" + slug
    elif service_path == "/pro-services":
        path = "/pro-government-services"
    elif service_path.removeprefix("/") in SERVICE_SLUGS:
        path = service_path
    aliases = {"/" + name.removesuffix(".html"): target for name, target in ALIASES.items()}
    aliases["/kizad"] = "/kezad-company-formation"
    path = aliases.get(path.rstrip("/"), path).rstrip("/") or "/"
    return urlunsplit(("https", "nikkiadvisory.com", path, parts.query, parts.fragment))


def attr(tag: str, name: str) -> str | None:
    match = re.search(r"\b" + re.escape(name) + r"\s*=\s*([\"'])(.*?)\1", tag, re.I | re.S)
    return unescape(match.group(2)) if match else None


def meta_tag(key: str, value: str, kind: str = "property") -> str:
    return f'<meta {kind}="{key}" content="{escape(value, quote=True)}" />'


def jsonld_nodes(source: str) -> list[dict]:
    nodes = []
    for block in re.findall(r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', source, re.I | re.S):
        data = json.loads(block)
        for entry in data if isinstance(data, list) else [data]:
            nodes.extend(entry.get("@graph", [entry]))
    return nodes


def visible_faqs(scan: Scan) -> list[dict]:
    """Use the actual public accordion/details text, including collapsed answers."""
    questions, seen = [], set()
    for element in scan.root.find(lambda e: e.tag == "details" or "faq-item" in e.attrs.get("class", "").split()):
        heading = next(element.find(lambda e: e.tag == "summary" or "faq-q" in e.attrs.get("class", "").split()), None)
        if heading is None:
            continue
        if element.tag == "details":
            answer = " ".join(child.text() if isinstance(child, Element) else child
                              for child in element.children if child is not heading).strip()
        else:
            content = next(element.find(lambda e: "faq-answer" in e.attrs.get("class", "").split()), None)
            answer = content.text() if content else ""
        question = heading.text()
        if question and answer and question not in seen:
            seen.add(question)
            questions.append({"@type": "Question", "name": question,
                              "acceptedAnswer": {"@type": "Answer", "text": answer}})
    return questions


def schema_for(url: str, title: str, description: str, scan: Scan, previous: list[dict]) -> dict:
    org = deepcopy(CONFIG["organization"])
    founder = org.pop("founder")
    org["@type"], org["@id"], org["url"] = "Organization", BASE + "/#organization", BASE + "/"
    width, height = raster_dimensions(ROOT / org["logo"].lstrip("/"))
    org["logo"] = {"@type": "ImageObject", "@id": BASE + "/#logo", "url": BASE + org["logo"],
                   "width": width, "height": height}
    org["image"] = OG
    org["areaServed"] = [{"@type": "Country", "name": name} for name in org["areaServed"]]
    org["contactPoint"] = {"@type": "ContactPoint", "contactType": "enquiries",
                           "email": org["email"], "telephone": org["telephone"], "url": BASE + "/contact-us"}
    org["founder"] = {"@type": "Person", "@id": BASE + "/about-us#founder", **founder}
    website = {"@type": "WebSite", "@id": BASE + "/#website", "url": BASE + "/",
               "name": org["name"], "inLanguage": "en", "publisher": {"@id": org["@id"]}}
    path = urlsplit(url).path
    settings = CONFIG["pages"].get(path, {})
    kind = settings.get("kind")
    page_type = {"about": "AboutPage", "contact": "ContactPage", "collection": "CollectionPage"}.get(kind, "WebPage")
    page = {
        "@type": page_type, "@id": url + "#webpage", "url": url,
        "name": title, "description": description, "inLanguage": "en",
        "isPartOf": {"@id": BASE + "/#website"},
        "publisher": {"@id": BASE + "/#organization"},
    }
    graph = [org, website, page]
    if path in {"/", "/about-us", "/contact-us"}:
        page["about"] = {"@id": org["@id"]}
    if path != "/":
        trail = [("/", "Home")]
        parent = settings.get("parent")
        if parent:
            trail.append((parent, CONFIG["pages"][parent]["name"]))
        h1 = next(scan.root.find(lambda e: e.tag == "h1"), None)
        trail.append((path, settings.get("name") or (h1.text() if h1 else title)))
        breadcrumb = {"@type": "BreadcrumbList", "@id": url + "#breadcrumb", "itemListElement": [
            {"@type": "ListItem", "position": i, "name": name, "item": BASE + route_path}
            for i, (route_path, name) in enumerate(trail, 1)
        ]}
        graph.append(breadcrumb)
        page["breadcrumb"] = {"@id": breadcrumb["@id"]}
    if kind == "service":
        service = {"@type": "Service", "@id": url + "#service", "url": url,
                   "name": settings["name"], "serviceType": settings["name"], "description": description,
                   "provider": {"@id": org["@id"]}, "mainEntityOfPage": {"@id": page["@id"]},
                   "areaServed": [{"@type": "Country", "name": country} for country in settings["areaServed"]]}
        graph.append(service)
        page["about"] = page["mainEntity"] = {"@id": service["@id"]}
    if settings.get("items"):
        listing = {"@type": "ItemList", "@id": url + "#list", "itemListElement": [
            {"@type": "ListItem", "position": i, "name": CONFIG["pages"][item]["name"], "url": BASE + item}
            for i, item in enumerate(settings["items"], 1)
        ]}
        graph.append(listing)
        page["mainEntity"] = {"@id": listing["@id"]}
    for original in previous:
        if original.get("@type") != "BlogPosting":
            continue
        article = deepcopy(original)
        article.pop("@context", None)
        article["@id"] = url + "#article"
        article["url"] = url
        article["mainEntityOfPage"] = {"@id": page["@id"]}
        article["isPartOf"] = {"@id": website["@id"]}
        article["author"] = article["publisher"] = {"@id": org["@id"]}
        # Search titles may be shorter; the article headline remains the visible H1.
        headline = next(scan.root.find(lambda e: e.tag == "h1"), None)
        if headline:
            article["headline"] = headline.text()
        graph.append(article)
        page["mainEntity"] = {"@id": article["@id"]}
    faqs = visible_faqs(scan)
    if faqs:
        faq = {"@type": "FAQPage", "@id": url + "#faq", "isPartOf": {"@id": page["@id"]},
               "mainEntity": faqs}
        graph.append(faq)
        page["hasPart"] = {"@id": faq["@id"]}
    return {"@context": "https://schema.org", "@graph": graph}


def article_image(source: str) -> str | None:
    for block in re.findall(r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
                            source, flags=re.I | re.S):
        try:
            data = json.loads(block)
        except json.JSONDecodeError:
            continue
        for node in data.get("@graph", [data]):
            if node.get("@type") == "BlogPosting" and isinstance(node.get("image"), str):
                return node["image"]
    return None


def image_dimensions(url: str) -> tuple[str, str]:
    return tuple(str(value) for value in raster_dimensions(ROOT / urlparse(url).path.lstrip("/")))


def raster_dimensions(path: Path) -> tuple[int, int]:
    with path.open("rb") as image:
        header = image.read(32)
        if header.startswith(b"\x89PNG\r\n\x1a\n"):
            return struct.unpack(">II", header[16:24])
        if header[:4] == b"RIFF" and header[8:12] == b"WEBP":
            chunk = header[12:16]
            if chunk == b"VP8X":
                return int.from_bytes(header[24:27], "little") + 1, int.from_bytes(header[27:30], "little") + 1
            if chunk == b"VP8L":
                bits = int.from_bytes(header[21:25], "little")
                return (bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1
            if chunk == b"VP8 ":
                width, height = struct.unpack("<HH", header[26:30])
                return width & 0x3fff, height & 0x3fff
        if header[:2] != b"\xff\xd8":
            raise ValueError(f"Unsupported raster image: {path}")
        image.seek(2)
        while True:
            marker = image.read(1)
            if not marker:
                raise ValueError(f"Missing JPEG dimensions: {path}")
            if marker != b"\xff":
                continue
            marker = image.read(1)
            while marker == b"\xff":
                marker = image.read(1)
            if marker[0] in {0xD8, 0xD9, 0x01} or 0xD0 <= marker[0] <= 0xD7:
                continue
            length = struct.unpack(">H", image.read(2))[0]
            if marker[0] in {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}:
                image.read(1)
                height, width = struct.unpack(">HH", image.read(4))
                return width, height
            image.seek(length - 2, 1)


def update_image(match: re.Match) -> str:
    tag = match.group(0)
    src = attr(tag, "src") or ""
    relative = re.sub(r"^(?:\.\./|\./)+", "", urlsplit(src).path.lstrip("/"))
    if relative in CONFIG["image_derivatives"] and "/brand/" not in relative:
        image = Path(relative)
        widths = CONFIG["image_derivatives"][relative]["widths"]
        variants = ["/" + image.with_name(f"{image.stem}-{width}.webp").as_posix() for width in widths]
        tag = re.sub(r'\bsrc\s*=\s*(["\']).*?\1', f'src="{variants[-1]}"', tag, count=1)
        if attr(tag, "srcset") is None:
            attributes = ' srcset="' + ", ".join(f"{url} {width}w" for url, width in zip(variants, widths)) + '" sizes="(max-width: 767px) 100vw, 800px"'
            end = "/>" if tag.endswith("/>") else ">"
            tag = tag[:-len(end)].rstrip() + attributes + " " + end
        src = variants[-1]
    # Keep the original PNGs for existing external URLs and the social generator.
    if "/images/brand/logo" in src and src.endswith(".png"):
        src = src.removesuffix(".png") + "-600.webp"
        tag = re.sub(r'\bsrc\s*=\s*(["\']).*?\1', f'src="{src}"', tag, count=1)
    klass = attr(tag, "class") or ""
    banner = attr(tag, "fetchpriority") == "high" or bool(
        re.search(r"(?:hero|banner|breadcrumb)", src + " " + klass, re.I)
    ) or src.endswith("/brand/logo-600.webp")
    loading = "eager" if banner else "lazy"
    if attr(tag, "loading") is None:
        tag = tag[:-2] + f' loading="{loading}" />' if tag.endswith("/>") else tag[:-1] + f' loading="{loading}">'
    elif banner:
        tag = re.sub(r"\bloading\s*=\s*(['\"]).*?\1", 'loading="eager"', tag, flags=re.I | re.S)
    if attr(tag, "alt") is None:
        raise ValueError(f"Add a descriptive or decorative alt attribute to {src}")
    image = ROOT / urlsplit(src).path.lstrip("/")
    if image.is_file() and image.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}:
        width, height = raster_dimensions(image)
        declared_width, declared_height = attr(tag, "width"), attr(tag, "height")
        additions = []
        if not declared_width:
            additions.append(f'width="{round(int(declared_height) * width / height) if declared_height else width}"')
        if not declared_height:
            additions.append(f'height="{round(int(declared_width) * height / width) if declared_width else height}"')
        if attr(tag, "decoding") is None:
            additions.append('decoding="async"')
        if additions:
            end = "/>" if tag.endswith("/>") else ">"
            tag = tag[:-len(end)].rstrip() + " " + " ".join(additions) + " " + end
    return tag


def clean_href(match: re.Match) -> str:
    quote, value = match.group(1), match.group(2)
    parts = urlsplit(value)
    if parts.hostname in {"nikkiadvisory.com", "www.nikkiadvisory.com"}:
        target = canonical_url(value)
        return f"href={quote}{target}{quote}" if target != value else match.group(0)
    if value.startswith(("http:", "https:", "//", "mailto:", "tel:", "#")):
        return match.group(0)
    local = "/" + re.sub(r"^(?:\.\./|\./)+", "", parts.path.lstrip("/"))
    if local.startswith("/services/") or local in {"/services.html", "/pro-services", "/pro-services.html"}:
        target = urlunsplit(("https", "nikkiadvisory.com", local, parts.query, parts.fragment))
        canonical = canonical_url(target)
        if canonical != target:
            return f"href={quote}{canonical.removeprefix(BASE)}{quote}"
    parts = re.match(r"^([^?#]+?\.html)(.*)$", value, re.I)
    if not parts:
        return match.group(0)
    page, suffix = parts.groups()
    basename = page.rsplit("/", 1)[-1]
    if basename == "index.html":
        target = page.removesuffix("index.html") or "./"
    elif basename == "services.html":
        target = "/services"
    elif basename == "kizad.html":
        target = "/kezad-company-formation"
    elif basename in ALIASES:
        target = ALIASES[basename]
    elif basename.removesuffix(".html") in SERVICE_SLUGS:
        target = "/" + basename.removesuffix(".html")
    else:
        target = page.removesuffix(".html")
    return f"href={quote}{target}{suffix}{quote}"


def version_asset(match: re.Match) -> str:
    """Version CSS/JS by content so long-lived caches are safe on deployment."""
    prefix, quote, value = match.groups()
    parts = urlsplit(unescape(value))
    if parts.netloc and parts.hostname not in {"nikkiadvisory.com", "www.nikkiadvisory.com"}:
        return match[0]
    asset = ROOT / re.sub(r"^(?:\.\./|\./)+", "", parts.path.lstrip("/"))
    if asset.suffix not in {".css", ".js"} or not asset.is_file():
        return match[0]
    query = [(key, val) for key, val in parse_qsl(parts.query) if key != "v"]
    query.append(("v", hashlib.sha256(asset.read_bytes()).hexdigest()[:12]))
    value = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))
    return prefix + quote + escape(value, quote=True) + quote


def update_page(path: Path, metadata_only: bool = False) -> tuple[str, Scan]:
    source = path.read_text(encoding="utf-8")
    original = source
    previous = jsonld_nodes(source)
    placeholder = "<!-- SEO metadata placeholder -->"
    source = re.sub(r"<!-- Search and social metadata -->.*?<!-- End search and social metadata -->",
                    placeholder, source, flags=re.S)
    scan = Scan()
    scan.feed(original)
    url = BASE + route(path)
    title = scan.title.strip()
    description = scan.meta.get("description", "").strip()
    settings = CONFIG["pages"].get(route(path), {})
    title = settings.get("title", title)
    description = settings.get("description", description)
    source = re.sub(r"<title>.*?</title>", "<title>" + escape(title) + "</title>", source, count=1, flags=re.S | re.I)
    source = re.sub(r'<meta\b[^>]*\bname=["\']description["\'][^>]*>',
                    meta_tag("description", description, "name"), source, count=1, flags=re.I | re.S)
    scan.title, scan.meta["description"] = title, description
    article = path.parent.name == "blog"
    not_found = path.name == "404.html"
    image = (article_image(original) or scan.meta.get("og:image") or OG) if article else OG
    image_alt = scan.meta.get("og:image:alt", title) if article else OG_ALT
    width, height = image_dimensions(image) if article else ("1200", "630")
    image_type = "image/png" if image.lower().endswith(".png") else "image/jpeg"
    head_end = source.lower().find("</head>")
    if head_end < 0:
        raise ValueError(f"Missing head: {path}")
    head, body = source[:head_end], source[head_end:]

    # The site has several generations of metadata. Replace only the fields managed here.
    controlled = {
        "robots", "og:type", "og:title", "og:description", "og:url", "og:site_name",
        "og:locale", "og:image", "og:image:secure_url", "og:image:type", "og:image:width",
        "og:image:height", "og:image:alt", "twitter:card", "twitter:title",
        "twitter:description", "twitter:image", "twitter:image:alt", "twitter:url",
    }

    def strip_meta(m):
        tag = m.group(0)
        return "" if (attr(tag, "name") or attr(tag, "property")) in controlled else tag

    head = re.sub(r"<meta\b[^>]*>", strip_meta, head, flags=re.I | re.S)
    head = re.sub(r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>.*?</script>', "", head, flags=re.I | re.S)
    head = re.sub(r"<link\b[^>]*>",
                  lambda m: "" if attr(m.group(0), "rel") in {"canonical", "alternate", "describedby"}
                  and (attr(m.group(0), "rel") in {"canonical", "describedby"} or attr(m.group(0), "type") == "application/rss+xml")
                  else m.group(0), head, flags=re.I | re.S)
    tags = [
        '<meta name="robots" content="noindex, follow" />' if not_found else
        '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />',
    ]
    if not not_found:
        tags += [f'<link rel="canonical" href="{escape(url, quote=True)}" />',
                 f'<link rel="alternate" type="application/rss+xml" title="Nikki Advisory Insights" href="{BASE}/feed.xml" />',
                 '<link rel="describedby" href="/llms.txt" type="text/plain" />']
    tags += [
        meta_tag("og:type", "article" if article else "website"),
        meta_tag("og:site_name", "Nikki Advisory"),
        meta_tag("og:locale", "en_US"),
        meta_tag("og:title", title),
        meta_tag("og:description", description),
        meta_tag("og:url", url),
        meta_tag("og:image", image),
        meta_tag("og:image:secure_url", image),
        meta_tag("og:image:type", image_type),
        meta_tag("og:image:width", width),
        meta_tag("og:image:height", height),
        meta_tag("og:image:alt", image_alt),
    ]
    tags += [
        meta_tag("og:image", SQUARE), meta_tag("og:image:type", "image/jpeg"),
        meta_tag("og:image:width", "1200"), meta_tag("og:image:height", "1200"),
        meta_tag("og:image:alt", OG_ALT),
    ]
    tags += [
        meta_tag("twitter:card", "summary_large_image", "name"),
        meta_tag("twitter:title", title, "name"),
        meta_tag("twitter:description", description, "name"),
        meta_tag("twitter:url", url, "name"),
        meta_tag("twitter:image", image, "name"),
        meta_tag("twitter:image:alt", image_alt, "name"),
    ]
    if not not_found:
        data = schema_for(url, title, description, scan, previous)
        tags.append('<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c") + "</script>")
    metadata = "<!-- Search and social metadata -->\n    " + "\n    ".join(tags) + "\n    <!-- End search and social metadata -->"
    if placeholder in head:
        head = head.replace(placeholder, metadata)
    else:
        head += "\n    " + metadata + "\n"
    # Correct absolute canonical references in existing JSON-LD and links.
    # Replace the nested footer @import with a parallel request at the same cascade position.
    head = re.sub(r'<link\b[^>]*href=["\'][^"\']*/footer-v2\.css[^"\']*["\'][^>]*>\s*', "", head, flags=re.I)
    head = re.sub(r'(<link\b[^>]*href=["\']([^"\']*assets/css/)site\.css[^"\']*["\'][^>]*>)',
                  lambda m: f'<link rel="stylesheet" href="{m[2]}footer-v2.css?v=20261026-seo" />\n    ' + m[1], head)
    head = re.sub(r'(<link\b[^>]*\bhref=["\'][^"\']*)images/brand/logo\.png',
                  r'\1images/brand/logo-600.webp', head)
    head = re.sub(r"\n(?:[ \t]*\n)+", "\n", head)
    source = head + body
    unused = {"aos.css", "aos.js", "bootstrap.bundle.min.js"}
    if not next(scan.root.find(lambda e: "swiper-container" in e.attrs.get("class", "").split()), None):
        unused.update({"swiper.min.css", "swiper.min.js"})
    if not next(scan.root.find(lambda e: "counter" in e.attrs.get("class", "").split()), None):
        unused.update({"waypoints.min.js", "jquery.counterup.min.js"})
    def used_asset(match):
        tag = match[0]
        value = attr(tag, "src") or attr(tag, "href") or ""
        return "" if Path(urlsplit(value).path).name in unused else tag
    source = re.sub(r'<script\b[^>]*\bsrc=[^>]*>\s*</script>|<link\b[^>]*>', used_asset, source, flags=re.I)
    source = re.sub(r'<script\b(?=[^>]*\bsrc=)(?![^>]*\b(?:defer|async)\b)', '<script defer', source, flags=re.I)
    source = re.sub(r"https?://(?:www\.)?nikkiadvisory\.com/[^\"'\s<>]*",
                    lambda m: canonical_url(m.group(0)), source)
    source = re.sub(r"\bhref\s*=\s*([\"'])(.*?)\1", clean_href, source, flags=re.I | re.S)
    if not metadata_only:
        # Resolve article-relative assets against the source document before reading dimensions.
        def image(match):
            tag = match[0]
            src = attr(tag, "src") or ""
            if src.startswith("../"):
                rewritten = tag.replace(src, "/" + src.removeprefix("../"), 1)
                return update_image(re.match(r"[\s\S]+", rewritten))
            return update_image(match)
        source = re.sub(r"<img\b[^>]*>", image, source, flags=re.I | re.S)
    source = re.sub(r'((?:href|src)\s*=\s*)(["\'])(.*?)\2', version_asset, source, flags=re.I)
    head_end = source.lower().find("</head>")
    source = re.sub(r"\n(?:[ \t]*\n)+", "\n", source[:head_end]) + source[head_end:]
    if source != path.read_text(encoding="utf-8"):
        path.write_text(source, encoding="utf-8")
    return url, scan


def build_sitemap(pages: list[tuple[Path, str, Scan]]):
    ET.register_namespace("", "http://www.sitemaps.org/schemas/sitemap/0.9")
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    root = ET.Element(ns + "urlset")
    seen = set()
    for path, url, scan in sorted(pages, key=lambda x: (x[1] != BASE + "/", x[1])):
        if path.name in EXCLUDE or url in seen:
            continue
        seen.add(url)
        node = ET.SubElement(root, ns + "url")
        ET.SubElement(node, ns + "loc").text = url
        if path.parent.name == "blog":
            modified = scan.meta.get("article:modified_time") or scan.meta.get("article:published_time")
            if modified:
                ET.SubElement(node, ns + "lastmod").text = modified[:10]
    ET.indent(root, space="  ")
    (ROOT / "sitemap.xml").write_bytes(b'<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="utf-8") + b"\n")


def build_feed(pages: list[tuple[Path, str, Scan]]):
    ET.register_namespace("atom", "http://www.w3.org/2005/Atom")
    rss = ET.Element("rss", version="2.0")
    channel = ET.SubElement(rss, "channel")
    for key, val in [("title", "Nikki Advisory Insights"), ("link", BASE + "/blogs"),
                     ("description", "Business setup, licensing and compliance insights for the UAE, Saudi Arabia and Bahrain."),
                     ("language", "en")]:
        ET.SubElement(channel, key).text = val
    ET.SubElement(channel, "{http://www.w3.org/2005/Atom}link", href=BASE + "/feed.xml", rel="self", type="application/rss+xml")
    articles = [(p, u, s) for p, u, s in pages if p.parent.name == "blog"]
    articles.sort(key=lambda x: x[2].meta.get("article:published_time", ""), reverse=True)
    for path, url, scan in articles:
        item = ET.SubElement(channel, "item")
        headline = next(scan.root.find(lambda e: e.tag == "h1"), None)
        for key, val in [("title", headline.text() if headline else scan.title.strip()), ("link", url),
                         ("guid", url), ("description", scan.meta.get("description", ""))]:
            node = ET.SubElement(item, key)
            node.text = val
            if key == "guid":
                node.set("isPermaLink", "true")
        pub = scan.meta.get("article:published_time")
        if pub:
            dt = datetime.fromisoformat(pub.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            ET.SubElement(item, "pubDate").text = format_datetime(dt)
    ET.indent(rss, space="  ")
    (ROOT / "feed.xml").write_bytes(b'<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(rss, encoding="utf-8") + b"\n")


def build_llms(pages: list[tuple[Path, str, Scan]]):
    public = {route(path): scan for path, _, scan in pages if path.name not in EXCLUDE}
    org = CONFIG["organization"]
    lines = ["# " + org["name"], "", "> " + org["description"], "",
             f'Official website: {BASE}/',
             'Location: Ajman, United Arab Emirates. Service areas: United Arab Emirates, Saudi Arabia and Bahrain.',
             f'Contact: {org["email"]}; {org["telephone"]}.', "",
             'The linked public pages describe the services and their scope. Costs and timelines are indicative where stated; the applicable requirements and quotation depend on the activity, jurisdiction and circumstances.', ""]
    for label, paths in CONFIG["llms_sections"].items():
        lines.extend(["## " + label, ""])
        for path in paths:
            if path not in public:
                raise ValueError(f"llms.txt references a non-public page: {path}")
            scan = public[path]
            name = CONFIG["pages"].get(path, {}).get("name") or scan.title.split(" | ")[0]
            lines.append(f'- [{name}]({BASE}{path}): {scan.meta["description"]}')
        lines.append("")
    (ROOT / "llms.txt").write_text("\n".join(lines), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--metadata-only', action='store_true',
                        help='Refresh SEO URLs and metadata while preserving image attributes and presentation.')
    args = parser.parse_args()
    # Only the established public page locations are eligible. A temporary HTML
    # file under tools/, assets/, or a future private folder must never enter SEO output.
    paths = sorted(ROOT.glob("*.html")) + sorted((ROOT / "blog").glob("*.html"))
    paths = [p for p in paths if route(p) in CONFIG["pages"] or p.name == "404.html"]
    missing = set(CONFIG["pages"]) - {route(path) for path in paths}
    if missing:
        raise ValueError(f"Public catalog pages have no HTML source: {sorted(missing)}")
    pages = [(path, *update_page(path, metadata_only=args.metadata_only)) for path in paths]
    build_sitemap(pages)
    build_feed(pages)
    build_llms(pages)
    print(f"Refreshed SEO for {len(pages)} HTML pages, sitemap.xml, feed.xml and llms.txt")


if __name__ == "__main__":
    main()
