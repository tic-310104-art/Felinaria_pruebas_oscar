"""Production PWA checks in Chromium; requires Python Playwright and Pillow.

Run against Vite preview:
  python tests/pwa_smoke.py --url http://127.0.0.1:4173
Optional real two-build update check:
  python tests/pwa_smoke.py --url http://127.0.0.1:4173 --next-dist PATH
The second build must differ from dist/ (for example, build with --minify false).
"""
import argparse
import io
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urljoin, urlparse

from PIL import Image
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:4173')
parser.add_argument('--next-dist', type=Path)
args = parser.parse_args()
base = args.url.rstrip('/') + '/'
root = Path(__file__).resolve().parents[1]


def controlled(page):
    page.wait_for_function('!!navigator.serviceWorker.controller')


def wait_photo(page):
    image = page.locator('.detail-hero img')
    expect(image).to_be_visible()
    page.wait_for_function('(img) => img.complete && img.naturalWidth > 0', arg=image.element_handle())
    return image.evaluate('(img) => img.currentSrc')


with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, service_workers='allow')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(base)
    page.wait_for_load_state('networkidle')
    controlled(page)
    expect(page.get_by_text('Recetas y fotografías listas sin conexión.', exact=True)).to_be_visible()
    registrations = page.evaluate('navigator.serviceWorker.getRegistrations().then(items => items.length)')
    assert registrations == 1, registrations
    print('PASS: one active service-worker registration and offline-ready acknowledgement')

    manifest_url = page.locator('link[rel="manifest"]').evaluate('(link) => link.href')
    response = context.request.get(manifest_url)
    assert response.ok
    manifest = response.json()
    assert manifest['name'] == 'Fierro 40k - Recetario'
    assert manifest['short_name'] == 'Fierro 40k'
    assert manifest['display'] == 'standalone'
    assert manifest['orientation'] == 'any'
    assert manifest['theme_color'].lower() == '#23392f'
    assert manifest['background_color'].lower() == '#f8f5ef'
    for field in ['id', 'scope', 'start_url']:
        assert urljoin(manifest_url, manifest[field]) == base, (field, manifest[field])
    assert {(icon['sizes'], icon['purpose']) for icon in manifest['icons']} == {
        ('192x192', 'any'), ('512x512', 'any'), ('512x512', 'maskable')}
    for icon in manifest['icons']:
        data = context.request.get(urljoin(manifest_url, icon['src']))
        assert data.ok
        image = Image.open(io.BytesIO(data.body()))
        expected = tuple(map(int, icon['sizes'].split('x')))
        assert image.format == 'PNG' and image.size == expected
        if icon['purpose'] == 'maskable':
            assert image.convert('RGBA').getchannel('A').getextrema() == (255, 255)
    favicon = context.request.get(urljoin(base, 'favicon-32.png'))
    assert Image.open(io.BytesIO(favicon.body())).size == (32, 32)
    cdp = context.new_cdp_session(page)
    result = cdp.send('Page.getAppManifest')
    assert not result.get('errors'), result
    installability = cdp.send('Page.getInstallabilityErrors')
    assert not installability['installabilityErrors'], installability
    print('PASS: manifest, start/scope/id, PNG dimensions, opaque maskable icon, favicon and Chromium installability criteria')

    cached = page.evaluate('''async () => (await Promise.all((await caches.keys()).map(async key =>
        (await (await caches.open(key)).keys()).map(request => request.url)))).flat()''')
    cached_paths = {urlparse(url).path for url in cached}
    assert '/index.html' in cached_paths
    assert '/manifest.webmanifest' in cached_paths
    assert any(path.endswith('.js') for path in cached_paths)
    assert any(path.endswith('.css') for path in cached_paths)
    assert all(urlparse(urljoin(manifest_url, icon['src'])).path in cached_paths for icon in manifest['icons'])
    for recipe in ['pan-frances', 'pollo-a-la-naranja', 'mochis-dulces']:
        for size in [640, 800, 1440]:
            assert any(f'/{recipe}-{size}-' in path and path.endswith('.webp') for path in cached_paths)
    asset_types = page.evaluate(r'''async urls => Object.fromEntries(await Promise.all(urls
        .filter(url => /\.(?:js|css|webp|png)$/.test(new URL(url).pathname))
        .map(async url => [url, (await caches.match(url))?.headers.get('content-type') ?? ''])))''', cached)
    for url, mime in asset_types.items():
        extension = urlparse(url).path.rsplit('.', 1)[-1]
        assert {'js': 'javascript' in mime, 'css': mime.startswith('text/css'),
                'webp': mime.startswith('image/webp'), 'png': mime.startswith('image/png')}[extension], (url, mime)
    print('PASS: precache contains HTML, manifest, JS, CSS, icons and all nine recipe photographs')

    # Test the capability-gated UI independently of headless browser prompt policy.
    page.evaluate('''() => {
        window.__installPromptCount = 0;
        const event = new Event('beforeinstallprompt', {cancelable: true});
        event.prompt = async () => { window.__installPromptCount++; };
        event.userChoice = Promise.resolve({outcome: 'dismissed'});
        window.dispatchEvent(event);
    }''')
    page.get_by_role('button', name='Instalar Fierro 40k').click()
    assert page.evaluate('window.__installPromptCount') == 1
    expect(page.get_by_role('button', name='Instalar Fierro 40k')).to_have_count(0)
    standalone = browser.new_context()
    standalone.add_init_script('''(() => {
        const original = window.matchMedia.bind(window);
        window.matchMedia = query => query === '(display-mode: standalone)'
            ? {matches: true, addEventListener() {}, removeEventListener() {}}
            : original(query);
    })()''')
    installed_page = standalone.new_page()
    installed_page.goto(base)
    installed_page.wait_for_load_state('networkidle')
    installed_page.evaluate("window.dispatchEvent(new Event('beforeinstallprompt', {cancelable: true}))")
    expect(installed_page.get_by_role('button', name='Instalar Fierro 40k')).to_have_count(0)
    standalone.close()
    print('PASS: install button invokes supplied event once, hides after dismissal and stays hidden in simulated standalone mode')

    for route in ['recetas', 'favoritos', 'recetas/pan-frances', 'recetas/pollo-a-la-naranja', 'recetas/mochis-dulces', 'no-existe']:
        page.goto(urljoin(base, route))
        expect(page.locator('h1')).to_have_count(1)
    page.goto(urljoin(base, 'recetas/pan-frances'))
    warm_photo = wait_photo(page)
    assert page.evaluate('async url => !!(await caches.match(url))', warm_photo)
    page.evaluate("fetch('" + urljoin(base, 'api/pwa-cache-probe') + "', {headers: {Authorization: 'Bearer test-only'}})")
    entries = page.evaluate('''async () => {
        const entries = await Promise.all((await caches.keys()).map(async key =>
            (await (await caches.open(key)).keys()).map(request => request.url)));
        return entries.flat();
    }''')
    assert not any('pwa-cache-probe' in url for url in entries)
    context.set_offline(True)
    missing_type = page.evaluate('''async () => {
        try { return (await fetch('/assets/not-cached.webp')).headers.get('content-type') ?? '' }
        catch { return '' }
    }''')
    assert 'html' not in missing_type, missing_type
    page.goto(base)
    expect(page.locator('h1')).to_contain_text('Cocinar también es crear')
    page.reload()
    expect(page.locator('.recipe-card')).to_have_count(3)
    page.goto(urljoin(base, 'recetas/pan-frances'))
    assert wait_photo(page) == warm_photo
    expect(page.get_by_text('Sin conexión. Puedes consultar las recetas;', exact=False)).to_be_visible()
    page.get_by_role('button', name='Guardar Pan francés en favoritos').click()
    page.locator('.steps-list input').first.check()
    page.get_by_role('button', name='Aumentar porciones').click()
    page.reload()
    expect(page.locator('.steps-list input').first).to_be_checked()
    expect(page.locator('.portion-control')).to_contain_text('4 porciones')
    page.goto(urljoin(base, 'favoritos'))
    expect(page.locator('.recipe-card')).to_have_count(1)
    page.goto(urljoin(base, 'recetas'))
    page.get_by_role('searchbox').fill('naranja')
    expect(page.locator('.recipe-card')).to_have_count(1)
    page.goto(urljoin(base, 'recetas/pollo-a-la-naranja'))
    expect(page.locator('h1')).to_have_text('Pollo a la naranja')
    wait_photo(page)
    assert page.locator('.ingredients-list li').count() == 12
    assert page.locator('.steps-list li').count() == 7
    page.goto(urljoin(base, 'recetas/mochis-dulces'))
    expect(page.locator('h1')).to_have_text('Mochis dulces')
    wait_photo(page)
    assert page.locator('.ingredients-list li').count() == 6
    assert page.locator('.steps-list li').count() == 8
    page.goto(urljoin(base, 'no-existe'))
    expect(page.locator('h1')).to_have_count(1)
    print('PASS: offline direct routes/reloads, all recipe photographs and content, search, favorites, persisted progress/portions and 404')

    page.goto(urljoin(base, 'recetas/pollo-a-la-naranja'))
    context.set_offline(False)
    page.wait_for_function('navigator.onLine')
    wait_photo(page)
    expect(page.get_by_text('Sin conexión. Puedes consultar las recetas;', exact=False)).to_have_count(0)
    for width in [320, 375, 768, 1440]:
        page.set_viewport_size({'width': width, 'height': 900})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.emulate_media(media='print')
    expect(page.locator('.pwa-controls')).not_to_be_visible()
    page.emulate_media(media='screen')
    assert not errors, errors
    print('PASS: reconnection, no cached API probe, responsive controls and print exclusion')
    context.close()

    mobile = browser.new_context(viewport={'width': 375, 'height': 812}, device_scale_factor=2, is_mobile=True, has_touch=True)
    mobile_page = mobile.new_page()
    mobile_page.goto(base)
    controlled(mobile_page)
    mobile_page.reload()
    mobile_page.wait_for_function('''() => {
        const image = document.querySelector('.home-hero img');
        return image?.complete && image.naturalWidth > 0;
    }''')
    mobile_photo = mobile_page.locator('.home-hero img').evaluate('(image) => image.currentSrc')
    assert '-800-' in mobile_photo, mobile_photo
    assert mobile_page.evaluate('async url => !!(await caches.match(url))', mobile_photo)
    mobile.set_offline(True)
    mobile_page.reload()
    mobile_page.wait_for_function("document.querySelector('.home-hero img')?.naturalWidth > 0")
    mobile.close()
    print('PASS: real mobile DPR selects the 800px image variant and caches it for offline reload')

    if args.next_dist:
        current = root / 'dist'
        following = args.next_dist.resolve()
        assert (following / 'sw.js').is_file()
        assert (current / 'sw.js').read_bytes() != (following / 'sw.js').read_bytes(), 'Builds must differ'

        class BuildHandler(SimpleHTTPRequestHandler):
            def __init__(self, *arguments, **kwargs):
                super().__init__(*arguments, directory=str(server.build_root), **kwargs)

            def do_GET(self):
                # Builds can finish in the same second. Python's mtime-only
                # validator would incorrectly return 304 for different sw.js.
                if 'If-Modified-Since' in self.headers:
                    del self.headers['If-Modified-Since']
                path = urlparse(self.path).path
                if path != '/' and not (Path(self.directory) / path.lstrip('/')).is_file() and '.' not in path.rsplit('/', 1)[-1]:
                    self.path = '/index.html'
                super().do_GET()

            def end_headers(self):
                self.send_header('Cache-Control', 'no-cache')
                super().end_headers()

            def log_message(self, *_args):
                pass

        server = ThreadingHTTPServer(('127.0.0.1', 0), BuildHandler)
        server.build_root = current
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()
        update_url = f'http://127.0.0.1:{server.server_port}'
        update_context = browser.new_context()
        try:
            first = update_context.new_page()
            first.goto(update_url + '/recetas/pan-frances')
            controlled(first)
            second = update_context.new_page()
            second.goto(update_url + '/recetas/pollo-a-la-naranja')
            second.wait_for_load_state('networkidle')
            second.locator('.steps-list input').first.check()
            first.get_by_role('button', name='Aumentar porciones').click()
            first.evaluate('window.__documentMarker = "keep-first"')
            second.evaluate('window.__documentMarker = "keep-second"')
            old_controller = first.evaluate('navigator.serviceWorker.controller.scriptURL')
            old_bundle = first.locator('script[type="module"]').get_attribute('src')
            update_errors = []
            first.on('console', lambda message: update_errors.append(message.text) if message.type == 'error' else None)
            first.evaluate('''async () => {
                window.__swTrace = [];
                const registration = await navigator.serviceWorker.ready;
                registration.addEventListener('updatefound', () => {
                    const worker = registration.installing;
                    window.__swTrace.push('found:' + worker?.state);
                    worker?.addEventListener('statechange', () => window.__swTrace.push(worker.state));
                });
            }''')
            first.evaluate('navigator.serviceWorker.ready.then(registration => registration.update())')
            server.build_root = following
            assert update_context.request.get(update_url + '/sw.js').body() == (following / 'sw.js').read_bytes()
            first.evaluate('navigator.serviceWorker.ready.then(registration => registration.update())')
            try:
                expect(first.get_by_role('button', name='Actualizar', exact=True)).to_be_visible(timeout=30000)
            except AssertionError:
                print('UPDATE DIAGNOSTICS:', first.evaluate('''async () => {
                    const r = await navigator.serviceWorker.ready;
                    return {trace: window.__swTrace, active:r.active?.state, waiting:r.waiting?.state, installing:r.installing?.state};
                }'''), update_errors)
                raise
            expect(second.get_by_role('button', name='Actualizar', exact=True)).to_be_visible(timeout=30000)
            assert first.evaluate('window.__documentMarker') == 'keep-first'
            first.get_by_role('button', name='Más tarde').click()
            expect(first.get_by_role('button', name='Actualizar', exact=True)).to_have_count(0)
            assert first.evaluate('window.__documentMarker') == 'keep-first'
            first.get_by_role('button', name='Nueva versión disponible').click()
            first.get_by_role('button', name='Actualizar', exact=True).click()
            first.wait_for_function('!window.__documentMarker')
            assert first.locator('script[type="module"]').get_attribute('src') != old_bundle
            assert first.evaluate('async url => !(await caches.match(new URL(url, location.href).href))', old_bundle)
            expect(first.locator('.portion-control')).to_contain_text('4 porciones')
            assert first.evaluate('navigator.serviceWorker.controller.scriptURL') == old_controller
            assert second.evaluate('window.__documentMarker') == 'keep-second', 'Another tab reloaded unexpectedly'
            expect(second.locator('.steps-list input').first).to_be_checked()
            expect(second.get_by_text('La nueva versión ya está disponible.', exact=False)).to_be_visible()
            second.get_by_role('button', name='Actualizar', exact=True).click()
            second.wait_for_function('!window.__documentMarker')
            expect(second.locator('.steps-list input').first).to_be_checked()
            print('PASS: real two-build update, postponement, explicit reload, persisted state and no forced reload in another tab')
        finally:
            update_context.close()
            server.shutdown()
            server.server_close()
            worker.join()
    else:
        print('SKIP: two-build update (provide --next-dist)')
    browser.close()
    print('All requested PWA checks passed. Native OS installation is a separate manual check.')
