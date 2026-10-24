"""Rebuild branded PNGs from public/favicon.svg using Chromium's SVG renderer.

Requires Python Playwright and its Chromium browser (test tooling only).
Run: python scripts/generate_pwa_icons.py
"""
import base64
from pathlib import Path

from playwright.sync_api import sync_playwright

public = Path(__file__).resolve().parents[1] / 'public'
assert public.is_dir()
source = (public / 'favicon.svg').read_text(encoding='utf-8')
# A full-bleed background and inset artwork keep the maskable symbol safe.
maskable = source.replace('<rect width="64" height="64" rx="12" fill="url(#bg)"/>',
                            '<rect width="64" height="64" fill="url(#bg)"/><g transform="translate(9.6 9.6) scale(.7)">')
maskable = maskable.replace('</svg>', '</g></svg>')
icons = public / 'icons'
icons.mkdir(exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    for path, size, svg in [
        (public / 'favicon-32.png', 32, source),
        (icons / 'pwa-192.png', 192, source),
        (icons / 'pwa-512.png', 512, source),
        (icons / 'pwa-maskable-512.png', 512, maskable),
    ]:
        encoded = page.evaluate('''async ({svg, size}) => {
            const image = new Image();
            image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
            await image.decode();
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = size;
            canvas.getContext('2d').drawImage(image, 0, 0, size, size);
            return canvas.toDataURL('image/png').split(',')[1];
        }''', {'svg': svg, 'size': size})
        path.write_bytes(base64.b64decode(encoded))
        print(f'Generated {path.relative_to(public)} ({size}x{size})')
    browser.close()
