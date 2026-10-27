#!/usr/bin/env python3
"""Audit the live website's local file dependencies without changing any files.

Run: python3 tools/audit-site.py
Reports missing dependencies, broken navigation/section links, unused runtime
assets and duplicate binary files. Use --base-url to verify served HTML too.
"""
import re,json,posixpath
from pathlib import Path
from collections import deque,defaultdict
from urllib.parse import urlparse,unquote,urljoin
from html.parser import HTMLParser
from html import unescape
from xml.etree import ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
REDIRECTS={'kizad':'/kezad-company-formation','pro-services':'/pro-government-services'}
ALIASES={'dafza-company-formation': 'dafza.html', 'dmcc-company-formation': 'dmcc.html', 'dubai-south-company-formation': 'dubai-south.html', 'dubai-silicon-oasis-company-formation': 'dubai-silicon-oasis.html', 'shams-company-formation': 'shams.html', 'services': 'services.html', 'services/accounting-bookkeeping': 'accounting-bookkeeping.html', 'services/business-structuring': 'business-structuring.html', 'services/business-support': 'business-support.html', 'services/company-liquidation': 'company-liquidation.html', 'services/corporate-compliance': 'corporate-compliance.html', 'services/pro-services': 'pro-government-services.html', 'favicon.ico': 'assets/icons/favicons/favicon.ico', 'apple-touch-icon.png': 'assets/icons/favicons/apple-touch-icon.png', 'apple-touch-icon-precomposed.png': 'assets/icons/favicons/apple-touch-icon.png'}
def route(path, redirects=True):
 trailing=path.endswith('/')
 path=posixpath.normpath(unquote(path).lstrip('/'))
 if path=='.':path=''
 if trailing and path:path+='/'
 stem=path.removesuffix('.html').rstrip('/')
 if redirects and not path.endswith('/') and stem in REDIRECTS:return route(REDIRECTS[stem])
 if path.endswith('/index.html'):return route(path.removesuffix('index.html'))
 if stem in ALIASES:return ALIASES[stem]
 if not path:return 'index.html'
 if (ROOT/path).is_dir():return path.rstrip('/')+'/index.html'
 if (ROOT/path).is_file():return path
 if (ROOT/(path+'.html')).is_file():return path+'.html'
 return path

def resolve(url,base):
 url=unescape(url).strip()
 if not url or url.startswith(('#','data:','javascript:','mailto:','tel:','about:','blob:')):return None
 p=urlparse(url)
 if p.scheme and p.scheme not in ('http','https'):return None
 if p.netloc and p.hostname not in ('nikkiadvisory.com','www.nikkiadvisory.com'):return None
 path=unquote(p.path)
 if not path:return None
 if path.startswith('/'):return route(path)
 return route(posixpath.normpath(posixpath.join(posixpath.dirname(base),path)))

class HTML(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.urls=[];self.css=[];self.scripts=[];self.stack=[];self.ids=set();self.anchors=[];self.canonical=None
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='link' and 'canonical' in a.get('rel','').split():self.canonical=a.get('href')
  if a.get('id'):self.ids.add(a['id'])
  if a.get('name') and t=='a':self.ids.add(a['name'])
  for k in ('src','href','action','poster','data-src','data-background'):
   if a.get(k):self.urls.append(a[k])
  for k in ('srcset','imagesrcset'):
   for item in a.get(k,'').split(','):
    item=re.sub(r'\s+\d+(?:\.\d+)?[wx]\s*$','',item.strip())
    if item:self.urls.append(item)
  if a.get('style'):self.css.append(a['style'])
  if t=='meta' and a.get('content','').startswith(('https://nikkiadvisory.com/','/assets/')):self.urls.append(a['content'])
  if t=='meta' and a.get('http-equiv','').lower()=='refresh':
   m=re.search(r'url=(.+)',a.get('content',''));self.urls.extend([m[1]] if m else [])
  if t=='a' and a.get('href'):self.anchors.append(a['href'])
  if t in ('style','script'):self.stack.append((t,a.get('type','')))
 def handle_endtag(self,t):
  if self.stack and self.stack[-1][0]==t:self.stack.pop()
 def handle_data(self,data):
  if self.stack:
   if self.stack[-1][0]=='style':self.css.append(data)
   elif self.stack[-1][0]=='script':self.scripts.append(data)

def css_urls(text):
 text=re.sub(r'/\*.*?\*/','',text,flags=re.S)
 return [m.group(2) if m.group(1) else m.group(3) for m in re.finditer(r'url\(\s*(?:([\'\"])(.*?)\1|([^\s)]+))\s*\)',text,re.S)]+re.findall(r'@import\s+[\'\"]([^\'\"]+)',text)

def js_urls(text):
 # Dynamic endpoints and complete asset literals; do not infer runtime use from prose.
 return re.findall(r'[\'\"]((?:\.?\.?/|/)?assets/[^\'\"\n]+\.(?:php|js|css|svg|webp|png|jpe?g|avif)(?:\?[^\'\"\n]*)?)[\'\"]',text)

def edges(path):
 p=ROOT/path;ext=p.suffix.lower();urls=[]
 if ext in ('.html','.svg'):
  h=HTML();h.feed(p.read_text());urls+=h.urls
  for css in h.css:urls+=css_urls(css)
  for script in h.scripts:
   urls+=js_urls(script)
   urls+=re.findall(r'https://(?:www\.)?nikkiadvisory\.com/[^\s\"<>]+',script)
 elif ext=='.css':urls+=css_urls(p.read_text())
 elif ext=='.js':
  # JS URLs are resolved relative to the document; shared endpoint literals use the root.
  return [resolve(u,'index.html') for u in js_urls(p.read_text()) if resolve(u,'index.html')]
 elif ext=='.webmanifest':urls+=[i['src'] for i in json.loads(p.read_text()).get('icons',[])]
 elif ext=='.xml':urls+=re.findall(r'https://(?:www\.)?nikkiadvisory\.com/[^\s<"\']+',p.read_text())
 elif ext=='.txt' and p.name=='robots.txt':urls+=re.findall(r'https://(?:www\.)?nikkiadvisory\.com/[^\s]+',p.read_text())
 elif ext=='.txt' and p.name=='llms.txt':urls+=re.findall(r'\]\((https://nikkiadvisory\.com/[^)\s]*)\)',p.read_text())
 elif ext=='.php':
  if path=='assets/mail/send-enquiry.php':return ['config.php','assets/mail/email-templates.php','assets/mail/vendor/phpmailer/Exception.php','assets/mail/vendor/phpmailer/PHPMailer.php','assets/mail/vendor/phpmailer/SMTP.php']
 return [r for u in urls if (r:=resolve(u,path))]

def graph():
 urls=[e.text for e in ET.parse(ROOT/'sitemap.xml').iter() if e.tag.endswith('}loc')]
 pages={route(urlparse(u).path) for u in urls}|{'404.html'}
 roots=pages|{'robots.txt','sitemap.xml','feed.xml','llms.txt',route('/favicon.ico'),'.htaccess','config.php'}
 required=set();missing=defaultdict(set);incoming=defaultdict(set);q=deque(roots)
 while q:
  path=q.popleft()
  if path in required:continue
  if not (ROOT/path).is_file():
   missing[path].add('[entry point]');continue
  required.add(path)
  for target in edges(path):
   if not (ROOT/target).is_file():missing[target].add(path);continue
   incoming[target].add(path)
   if target not in required:q.append(target)
 return pages,required,missing,incoming


def navigation(pages, base_url=None, ca_file=None):
    """Resolve links from public page URLs and reject old service folder links."""
    documents = {}
    for path in sorted(pages):
        document = HTML()
        document.feed((ROOT / path).read_text())
        documents[path] = document
    errors, paths = [], set()
    internal_links = section_links = menu_controls = 0
    for source, document in documents.items():
        base = document.canonical or 'https://nikkiadvisory.com/' + source
        for href in document.anchors:
            # Existing menu controls do not navigate to document sections.
            if href == '#0':
                menu_controls += 1
                continue
            url = urlparse(urljoin(base, href))
            if url.scheme not in ('http', 'https') or url.hostname not in ('nikkiadvisory.com', 'www.nikkiadvisory.com'):
                continue
            internal_links += 1
            paths.add(url.path or '/')
            target = route(url.path)
            reason = None
            if not (ROOT / target).is_file():
                reason = 'Missing destination'
            elif url.path.startswith('/services/'):
                reason = 'Old service folder URL; use /' + target.removesuffix('.html')
            elif url.fragment:
                section_links += 1
                if target in documents and unquote(url.fragment) not in documents[target].ids:
                    reason = 'Missing section #' + unquote(url.fragment)
            if reason:
                errors.append(dict(source=source, href=href, target=target, reason=reason))
    http_errors = []
    if base_url:
        from concurrent.futures import ThreadPoolExecutor
        from urllib.request import urlopen
        import ssl
        context = ssl.create_default_context(cafile=str(ca_file) if ca_file else None)

        def check(path):
            try:
                with urlopen(base_url.rstrip('/') + path, timeout=15, context=context) as response:
                    if response.status != 200:
                        return dict(path=path, reason=f'HTTP {response.status}')
                    expected = ROOT / route(path)
                    if expected.is_file() and response.read() != expected.read_bytes():
                        return dict(path=path, reason='Response does not match the destination file')
            except Exception as error:
                return dict(path=path, reason=str(error))

        with ThreadPoolExecutor(max_workers=8) as pool:
            http_errors = [error for error in pool.map(check, sorted(paths)) if error]
    return dict(internal_links=internal_links, unique_paths=len(paths),
                section_links=section_links, menu_controls=menu_controls,
                errors=errors, http_checked=len(paths) if base_url else 0,
                http_errors=http_errors)

MAINTENANCE = {
    'README.md': 'Deployment and maintenance documentation',
    '.gitignore': 'Local editor and OS exclusions',
    'tools/audit-site.py': 'Read-only dependency and duplicate audit',
    'tools/audit-banner-forms.py': 'Responsive image and contact-form regression audit',
    'tools/banner-assets.json': 'Inventory consumed by the banner regression audit',
    'tools/image-source-notes.md': 'Photo attribution and source/licensing provenance',
    'tools/update-seo.py': 'Maintains metadata, sitemap, and RSS after content edits',
    'tools/create-social-images.swift': 'Maintains the two social preview images',
    'tools/cleanup-report.json': 'Historical record of the preceding asset cleanup',
    'tools/reorganization-report.json': 'File move map, URL compatibility, and verification for the current layout',
    'tools/live-audit-report.json': 'Public server crawl findings and locally prepared favicon corrections',
    'tools/seo-config.json': 'Central public business facts, canonical page catalog and image derivative sources',
    'tools/optimize-images.py': 'Rebuilds responsive WebP derivatives from retained originals',
    'tools/audit-seo.py': 'Metadata, entity relationships, crawler and served-route validation',
    'tools/seo-audit-report.json': 'Current local technical SEO validation results',
    'tools/seo-audit-report.md': 'Implementation scope, changed files and external configuration checklist',
    'assets/js/vendor/bootstrap.bundle.min.js': 'Retained for historical asset URLs; no current component uses Bootstrap JavaScript',
    'assets/js/vendor/aos.js': 'Retained for historical asset URLs; current pages contain no data-aos animations',
    'assets/css/vendor/aos.css': 'Retained for historical asset URLs; current pages contain no data-aos animations',
    'assets/js/data/COUNTRY_CODES_SOURCE.md': 'Required country-data attribution',
    'assets/images/social/source-dubai-skyline.jpg': 'Source consumed by the retained social-preview generator',
}
MAINTENANCE.update({source: 'Original consumed by tools/optimize-images.py; retained without changes'
                    for source in json.loads((ROOT / 'tools/seo-config.json').read_text())['image_derivatives']})


def audit():
    import argparse
    import hashlib
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--json', type=Path, help='Write the full dependency report to this path.')
    parser.add_argument('--base-url', help='Also GET every internal navigation destination from this server.')
    parser.add_argument('--ca-file', type=Path, help='Trust this CA certificate when checking a local HTTPS server.')
    args = parser.parse_args()
    pages, required, missing, incoming = graph()
    links = navigation(pages, args.base_url, args.ca_file)
    files = {str(p.relative_to(ROOT)) for p in ROOT.rglob('*') if p.is_file()}
    unreferenced = sorted(files - required - set(MAINTENANCE))
    binary_hashes = defaultdict(list)
    for path in required:
        if Path(path).suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg', '.ico'):
            binary_hashes[hashlib.sha256((ROOT / path).read_bytes()).hexdigest()].append(path)
    duplicates = [sorted(paths) for paths in binary_hashes.values() if len(paths) > 1]
    report = dict(pages=sorted(pages), required=sorted(required),
                  missing={key:sorted(value) for key,value in missing.items()},
                  incoming={key:sorted(value) for key,value in incoming.items()},
                  maintenance={key:reason for key,reason in MAINTENANCE.items() if key in files},
                  navigation=links,
                  unreferenced=unreferenced, duplicate_images=duplicates,
                  total_bytes=sum((ROOT/path).stat().st_size for path in files))
    if args.json:
        args.json.write_text(json.dumps(report, indent=2) + '\n')
    print(f"Audited {len(files)} files and {len(pages)} canonical pages (including 404).")
    print(f"Missing dependencies: {len(missing)}; unreferenced files: {len(unreferenced)}; duplicate images: {len(duplicates)}.")
    print(f"Internal links: {links['internal_links']}; section links: {links['section_links']}; broken links: {len(links['errors'])}.")
    if args.base_url:
        print(f"HTTP destinations checked: {links['http_checked']}; response errors: {len(links['http_errors'])}.")
    if missing: print(json.dumps(report['missing'], indent=2))
    if unreferenced: print('Unreferenced:', unreferenced)
    if duplicates: print('Duplicate images:', duplicates)
    if links['errors']: print('Broken links:', json.dumps(links['errors'], indent=2))
    if links['http_errors']: print('HTTP errors:', json.dumps(links['http_errors'], indent=2))
    if missing or unreferenced or duplicates or links['errors'] or links['http_errors']:
        raise SystemExit(1)


if __name__ == '__main__':
    audit()
