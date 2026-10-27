#!/usr/bin/env python3
"""Check responsive banners and country selectors against a local static server.

Requires Pillow and Playwright. No enquiry is sent: CAPTCHA and mail are mocked.
Example: python3 tools/audit-banner-forms.py --base-url http://127.0.0.1:8765
"""

import argparse
import json
from pathlib import Path
from urllib.parse import urlparse, unquote
import re

from PIL import Image
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'


def audit(base_url, executable):
    manifest = json.loads((ROOT / 'tools/banner-assets.json').read_text())
    assert len({a['key'] for a in manifest['assets']}) == len(manifest['assets'])
    banner_paths = {v['path'] for asset in manifest['assets'] for v in asset['variants'] + asset.get('mobile_variants', [])}
    home_hero_paths = {v['path'] for asset in manifest['assets'] if asset['key'] == 'bg-1' for v in asset['variants']}
    variants = 0
    for asset in manifest['assets']:
        for variant in asset['variants'] + asset.get('mobile_variants', []):
            with Image.open(ROOT / variant['path']) as image:
                assert image.format == 'WEBP', variant['path']
                assert image.size == (variant['width'], variant['height']), variant['path']
                assert image.width <= asset['width'] and image.height <= asset['height']
                image.verify()
            variants += 1

    pages = sorted(ROOT.glob('*.html')) + sorted((ROOT / 'blog').glob('*.html'))
    pages = [p for p in pages if p.name != '404.html']
    failures, form_count = [], 0

    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=executable, headless=True)
        context = browser.new_context(viewport=dict(width=1440, height=1000), reduced_motion='reduce', has_touch=True, ignore_https_errors=True)

        def external_request(route):
            if route.request.url.startswith(base_url + '/'):
                route.continue_()
            elif '/recaptcha/api.js' in route.request.url:
                route.fulfill(content_type='application/javascript', body='window.grecaptcha={ready:cb=>cb(),execute:()=>Promise.resolve("test-token")};')
            else:
                route.abort()

        context.route('https://**/*', external_request)
        page = context.new_page()
        script_errors = []
        page.on('pageerror', lambda error: script_errors.append(str(error)))
        page.on('response', lambda r: failures.append((r.status, r.url)) if r.url.startswith(base_url) and r.status >= 400 else None)
        for path in pages:
            relative = path.relative_to(ROOT).as_posix()
            canonical = re.search(r'<link[^>]+rel="canonical"[^>]+href="([^"]+)"', path.read_text())
            public_path = urlparse(canonical[1]).path if canonical else '/' + relative
            page.goto(base_url + public_path, wait_until='load')
            forms = page.locator('form[data-enquiry-form]:has(input[name="phone"])')
            expect(page.locator('.nikki-dial-trigger')).to_have_count(forms.count())
            for form in forms.all():
                expect(form.locator('[name="dial_code"]')).to_have_value('+971')
                form_count += 1
            banner = page.locator('.visual-breadcrumb, .breadcrumb-area, .hero-slider-wrap .swiper-slide-active .slide-inner').first
            if banner.count():
                backgrounds = banner.evaluate('(el)=>[getComputedStyle(el).backgroundImage,getComputedStyle(el,"::before").backgroundImage]')
                assert any('/' + asset in bg for bg in backgrounds for asset in banner_paths), (relative, backgrounds)
            for image in page.locator('img[src]').all():
                image_path = unquote(urlparse(image.evaluate('(img)=>img.src')).path).lstrip('/')
                if image_path not in banner_paths:
                    continue
                assert image.get_attribute('srcset') and image.get_attribute('sizes'), relative
                assert image.get_attribute('width') and image.get_attribute('height'), relative
                if image.get_attribute('loading') == 'eager':
                    image.evaluate('(img)=>img.decode()')
                    assert image.evaluate('(img)=>img.naturalWidth > 0'), relative
        assert not failures, failures
        assert not script_errors, script_errors

        # Search by name/code, shared calling codes, empty results, and focus behavior.
        for width in (320, 390, 768, 1440):
            page.set_viewport_size(dict(width=width, height=844))
            page.goto(base_url + '/contact-us.html', wait_until='load')
            trigger = page.locator('.nikki-dial-trigger')
            popup = page.locator('.nikki-country-picker')
            search = popup.locator('[role="combobox"]')
            native = page.locator('select[name="dial_code"]')
            phone = page.locator('input[name="phone"]')
            for query in ('India', 'iNdIa', '+91', '91', '+ 91'):
                trigger.tap()
                expect(search).to_be_focused()
                search.fill(query)
                # A name substring also matches British Indian Ocean Territory;
                # the exact country must rank first for Enter to select India.
                expect(popup.locator('[role="option"]').first).to_contain_text('India')
                if '91' in query:
                    expect(popup.locator('[role="option"]')).to_have_count(1)
                search.press('Enter')
                expect(native).to_have_value('+91')
                expect(popup).to_be_hidden()
                expect(trigger).to_be_focused()
                assert page.locator('form[data-enquiry-form]').evaluate('(form)=>new FormData(form).get("dial_code")') == '+91'
            trigger.click()
            search.fill('+1')
            assert popup.locator('[role="option"]').count() > 1
            popup.get_by_role('option', name='Canada', exact=False).click()
            expect(native).to_have_value('+1')
            expect(trigger).to_have_attribute('aria-label', 'Country calling code: 🇨🇦 Canada (+1)')
            trigger.click()
            search.fill('United')
            search.press('ArrowDown')
            search.press('Enter')
            expect(native).to_have_value('+44')
            trigger.click()
            search.fill('zz-no-such-country')
            expect(popup.locator('[role="option"]')).to_have_count(0)
            expect(popup.get_by_role('status')).to_contain_text('No countries found')
            search.press('Enter')
            expect(native).to_have_value('+44')
            search.press('Escape')
            expect(trigger).to_be_focused()
            trigger.press('i')
            expect(search).to_have_value('i')
            search.fill('reunion')
            expect(popup.locator('[role="option"]')).to_have_count(1)
            search.press('Tab')
            expect(phone).to_be_focused()
            trigger.click()
            search.press('Shift+Tab')
            expect(trigger).to_be_focused()
            trigger.click()
            phone.click()
            expect(popup).to_be_hidden()
            expect(phone).to_be_focused()
            trigger.click()
            bounds = popup.bounding_box()
            assert bounds['x'] >= 0 and bounds['x'] + bounds['width'] <= width, bounds
            assert bounds['y'] >= 0 and bounds['y'] + bounds['height'] <= 844, bounds
            page.locator('form[data-enquiry-form]').evaluate('(form)=>form.reset()')
            expect(native).to_have_value('+971')
            expect(trigger).to_contain_text('+971')
            expect(popup).to_be_hidden()
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width

        # Verify the actual multipart submission and successful reset without sending mail.
        captured = []

        def mail_request(route):
            captured.append(route.request.post_data_buffer.decode())
            route.fulfill(content_type='application/json', body=json.dumps(dict(success=True, message='Test enquiry received.')))

        page.route('**/assets/mail/send-enquiry.php', mail_request)
        trigger.click()
        search.fill('+91')
        search.press('Enter')
        page.locator('[name="name"]').fill('Banner QA')
        phone.fill('9876543210')
        page.locator('form[data-enquiry-form] [name="email"]').fill('qa@example.com')
        page.locator('[name="interest"]').select_option('UAE')
        page.locator('form[data-enquiry-form] [type="submit"]').click()
        expect(page.locator('#result')).to_have_attribute('data-state', 'success')
        assert len(captured) == 1 and 'name="dial_code"\r\n\r\n+91' in captured[0]
        expect(native).to_have_value('+971')
        expect(trigger).to_contain_text('+971')

        # Confirm responsive CSS selection and preload use the same image URL.
        for width, dpr in ((390, 2), (768, 1), (1440, 1), (1920, 2)):
            responsive = browser.new_context(viewport=dict(width=width, height=1000), device_scale_factor=dpr, reduced_motion='reduce', ignore_https_errors=True)
            responsive.route('https://**/*', external_request)
            view = responsive.new_page()
            for relative in ('index.html', 'contact-us.html', 'about-us.html', 'dubai-mainland.html', 'services/accounting-bookkeeping/', 'blog/saudi-ai-market-entry.html'):
                view.goto(base_url + '/' + relative, wait_until='load')
                assert view.evaluate('document.documentElement.scrollWidth <= innerWidth'), (relative, width)
                if relative == 'index.html':
                    expect(view.locator('h1')).to_have_count(1)
                    expect(view.locator('.swiper-slide-active .slide-content')).to_be_visible()
                    entries = view.evaluate('paths=>performance.getEntriesByType("resource").filter(e=>paths.includes(new URL(e.name).pathname.slice(1))).map(e=>e.name)', sorted(home_hero_paths))
                    assert len(entries) == 1, ('Duplicate/mismatched hero preload', width, entries)
                    assert ('-mobile-' in entries[0]) == (width <= 480)
            responsive.close()
        browser.close()
    print(f'Passed: {variants} WebP files; {len(pages)} pages; {form_count} forms; country search, keyboard/touch, mocked submission, and responsive/preload checks.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://127.0.0.1:8765')
    parser.add_argument('--browser', default=CHROME)
    args = parser.parse_args()
    audit(args.base_url.rstrip('/'), args.browser)
