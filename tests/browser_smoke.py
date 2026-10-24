"""Real Chromium checks. Requires Python Playwright and its Chromium browser.

Run against a running Vite dev or preview server:
  python tests/browser_smoke.py --url http://127.0.0.1:5173
Screenshots are written to --artifacts or the system temporary directory.
"""
import argparse
import json
import tempfile
from pathlib import Path
from urllib.request import urlopen

from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:5173')
parser.add_argument('--artifacts', default=tempfile.gettempdir(), help='Existing screenshot output directory')
args = parser.parse_args()
artifacts = Path(args.artifacts)
assert artifacts.is_dir(), f'Artifact directory must exist: {artifacts}'
routes = ['/', '/recetas', '/favoritos', '/recetas/pan-frances',
          '/recetas/pollo-a-la-naranja', '/recetas/mochis-dulces', '/no-existe', '/recetas/no-existe']

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)

    def visit(route):
        page.goto(args.url + route)
        page.wait_for_load_state('networkidle')
        expect(page.locator('h1')).to_have_count(1)

    def no_overflow():
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), page.url

    def check_photos():
        for image in page.locator('img').all():
            image.scroll_into_view_if_needed()
            expect(image).to_be_visible()
            page.wait_for_function('(img) => img.complete && img.naturalWidth > 0', arg=image.element_handle())

    for route in routes:
        visit(route)
        no_overflow()
        check_photos()
        if route == '/':
            assert page.title() == 'Fierro 40k'
        else:
            assert page.title().endswith('| Fierro 40k')
        assert page.locator('meta[name="description"]').count() == 1
    print('PASS: direct routes, 404s, unique h1/meta description, real photographs and page titles')

    visit('/')
    check_photos()
    page.evaluate('window.scrollTo(0, 0)')
    page.screenshot(path=str(artifacts / 'savora-home-desktop.png'), full_page=True)
    page.get_by_role('link', name='Explorar recetas', exact=True).first.click()
    expect(page).to_have_url(args.url + '/recetas')
    expect(page.locator('.recipe-card')).to_have_count(3)
    search = page.get_by_role('searchbox', name='Buscar por nombre o ingrediente')
    search.fill('FECULA')
    expect(page.locator('.recipe-card')).to_have_count(2)
    page.get_by_role('button', name='Desayuno', exact=True).click()
    expect(page.locator('.recipe-card')).to_have_count(0)
    expect(page.get_by_role('heading', name='Ese antojo aún no está aquí')).to_be_visible()
    page.get_by_role('button', name='Limpiar filtros').click()
    search.fill('pan frances')
    expect(page.locator('.recipe-card')).to_have_count(1)
    page.reload()
    expect(search).to_have_value('pan frances')
    page.get_by_role('button', name='Borrar búsqueda').click()
    page.get_by_role('button', name='Postres', exact=True).click()
    expect(page.locator('.recipe-card')).to_have_count(1)
    expect(page.locator('.recipe-card .card-title')).to_have_text('Mochis dulces')
    page.get_by_role('button', name='Limpiar filtros').click()
    page.screenshot(path=str(artifacts / 'savora-catalog-desktop.png'), full_page=True)
    print('PASS: realtime ingredient/name search, accents, combined filters, empty state, URL persistence and reset')

    page.get_by_role('button', name='Guardar Pan francés en favoritos').click()
    expect(page.get_by_role('button', name='Quitar Pan francés de favoritos')).to_have_attribute('aria-pressed', 'true')
    visit('/favoritos')
    expect(page.locator('.recipe-card')).to_have_count(1)
    page.reload()
    expect(page.locator('.recipe-card')).to_have_count(1)
    assert page.evaluate("JSON.parse(localStorage.getItem('savora:favorites:v1'))") == ['pan-frances']
    page.get_by_role('button', name='Quitar Pan francés de favoritos').click()
    expect(page.get_by_role('heading', name='Tu recetario empieza con un antojo')).to_be_visible()
    print('PASS: save/remove favorites, reload and localStorage')

    visit('/recetas/pollo-a-la-naranja')
    expect(page.locator('.ingredients-list li')).to_have_count(12)
    expect(page.locator('.steps-list li')).to_have_count(7)
    page.get_by_role('button', name='Aumentar porciones').click()
    expect(page.locator('.portion-control')).to_contain_text('8 porciones')
    expect(page.locator('.ingredients-list')).to_contain_text('1,200 g')
    expect(page.locator('.ingredients-list')).to_contain_text('4 cucharadas de agua')
    page.locator('.ingredients-list input').first.check()
    page.locator('.steps-list input').first.check()
    expect(page.get_by_role('progressbar')).to_have_attribute('value', '1')
    page.reload()
    expect(page.locator('.ingredients-list input').first).to_be_checked()
    expect(page.locator('.steps-list input').first).to_be_checked()
    expect(page.locator('.portion-control')).to_contain_text('8 porciones')
    visit('/recetas/pan-frances')
    expect(page.get_by_role('progressbar')).to_have_attribute('value', '0')
    expect(page.locator('.ingredients-list li')).to_have_count(8)
    expect(page.locator('.steps-list li')).to_have_count(5)
    visit('/recetas/mochis-dulces')
    expect(page.locator('.ingredients-list li')).to_have_count(6)
    expect(page.locator('.steps-list li')).to_have_count(8)
    page.get_by_role('button', name='Reducir porciones').click()
    expect(page.locator('.portion-control')).to_contain_text('4 piezas')
    expect(page.get_by_role('button', name='Reducir porciones')).to_be_disabled()
    expect(page.locator('.steps-list li').first).to_contain_text('4 porciones')
    expect(page.locator('.steps-list li').nth(5)).to_contain_text('4 porciones')
    for _ in range(3):
        page.get_by_role('button', name='Aumentar porciones').click()
    expect(page.get_by_role('button', name='Aumentar porciones')).to_be_disabled()
    for checkbox in page.locator('.steps-list input').all():
        checkbox.check()
    expect(page.get_by_role('progressbar')).to_have_attribute('value', '8')
    expect(page.get_by_text('¡A la mesa! Has completado todos los pasos.')).to_be_visible()
    page.get_by_role('button', name='Reiniciar progreso').click()
    expect(page.get_by_role('progressbar')).to_have_attribute('value', '0')
    expect(page.get_by_role('button', name='Reiniciar progreso')).to_be_disabled()
    print('PASS: all recipe content, scaled quantities/steps, portion bounds, progress persistence/isolation, completion and reset')

    visit('/recetas/pan-frances')
    page.evaluate("window.print = () => { window.__printCalled = true }")
    page.get_by_role('button', name='Imprimir', exact=True).click()
    assert page.evaluate('window.__printCalled')
    page.emulate_media(media='print')
    expect(page.locator('.site-header')).not_to_be_visible()
    expect(page.locator('.recipe-actions')).not_to_be_visible()
    expect(page.locator('.ingredients-panel')).to_be_visible()
    expect(page.locator('.preparation-panel')).to_be_visible()
    page.screenshot(path=str(artifacts / 'savora-print.png'), full_page=True)
    page.emulate_media(media='screen')
    expect(page.get_by_role('button', name='Compartir', exact=True)).to_have_count(0)
    visit('/recetas/pan-frances')
    check_photos()
    page.evaluate('window.scrollTo(0, 0)')
    page.screenshot(path=str(artifacts / 'savora-recipe-desktop.png'), full_page=True)
    print('PASS: print invocation/CSS and sharing options removed')

    for width in [320, 375, 430, 768, 1024, 1280, 1440, 1920]:
        page.set_viewport_size({'width': width, 'height': 900})
        for route in ['/', '/recetas', '/recetas/mochis-dulces', '/favoritos', '/404']:
            visit(route)
            no_overflow()
    page.set_viewport_size({'width': 375, 'height': 812})
    visit('/')
    check_photos()
    page.evaluate('window.scrollTo(0, 0)')
    page.screenshot(path=str(artifacts / 'savora-home-mobile.png'), full_page=True)
    menu = page.locator('.menu-toggle')
    menu.click()
    expect(menu).to_have_attribute('aria-expanded', 'true')
    page.keyboard.press('Escape')
    expect(menu).to_be_focused()
    expect(menu).to_have_attribute('aria-expanded', 'false')
    menu.click()
    page.get_by_role('navigation', name='Navegación móvil').get_by_role('link', name='Recetas', exact=True).click()
    expect(page).to_have_url(args.url + '/recetas')
    expect(page.get_by_role('button', name='Abrir menú')).to_have_attribute('aria-expanded', 'false')
    check_photos()
    page.evaluate('window.scrollTo(0, 0)')
    page.screenshot(path=str(artifacts / 'savora-catalog-mobile.png'), full_page=True)
    visit('/recetas/mochis-dulces')
    check_photos()
    page.evaluate('window.scrollTo(0, 0)')
    page.screenshot(path=str(artifacts / 'savora-recipe-mobile.png'), full_page=True)
    page.set_viewport_size({'width': 812, 'height': 375})
    no_overflow()
    visit('/')
    page.keyboard.press('Tab')
    expect(page.get_by_role('link', name='Saltar al contenido principal')).to_be_focused()
    page.keyboard.press('Enter')
    expect(page.locator('main')).to_be_focused()
    assert page.evaluate("getComputedStyle(document.documentElement).scrollBehavior") == 'auto'
    print('PASS: 320–1920px layouts, landscape, mobile menu/Escape/focus, skip link and reduced motion')

    # Corrupt storage should recover without a blank screen.
    page.evaluate("localStorage.setItem('savora:favorites:v1', '{bad'); localStorage.setItem('savora:progress:v1:pan-frances', JSON.stringify({steps: 'bad'}))")
    visit('/favoritos')
    expect(page.get_by_role('heading', name='Tu recetario empieza con un antojo')).to_be_visible()
    visit('/recetas/pan-frances')
    expect(page.get_by_role('progressbar')).to_have_attribute('value', '0')

    blocked = browser.new_context(viewport={'width': 375, 'height': 812})
    blocked.add_init_script("Object.defineProperty(window, 'localStorage', {get() {throw new DOMException('Blocked', 'SecurityError')}})")
    blocked_page = blocked.new_page()
    blocked_page.goto(args.url + '/recetas/pan-frances')
    blocked_page.get_by_role('button', name='Guardar Pan francés en favoritos').click()
    expect(blocked_page.get_by_role('button', name='Quitar Pan francés de favoritos')).to_be_visible()
    blocked_page.locator('.steps-list input').first.check()
    expect(blocked_page.get_by_role('progressbar')).to_have_attribute('value', '1')
    blocked.close()
    print('PASS: corrupted data recovery and blocked localStorage with in-memory functionality')

    # axe is fetched only for testing, never by the application.
    axe_url = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.3/axe.min.js'
    with urlopen(axe_url, timeout=30) as response:
        axe = response.read().decode()
    page.set_viewport_size({'width': 1440, 'height': 1000})
    for route in ['/', '/recetas', '/favoritos', '/recetas/pan-frances', '/404']:
        visit(route)
        await_fonts = 'document.fonts.ready.then(() => true)'
        page.evaluate(await_fonts)
        page.add_script_tag(content=axe)
        result = page.evaluate("async () => await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})")
        assert not result['violations'], json.dumps([{'id': item['id'], 'nodes': [node['target'] for node in item['nodes']]} for item in result['violations']], indent=2)
    assert not errors, errors
    print('PASS: axe WCAG A/AA automated checks on five page types; no console/page errors')
    print(f'Screenshots: {artifacts}')
    browser.close()
