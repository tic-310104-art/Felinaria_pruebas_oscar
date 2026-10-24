"""Generate mobile-friendly WebP variants from the existing local photographs.

Requires Pillow (development tooling only).
Run: python scripts/generate_responsive_photos.py
"""
from pathlib import Path

from PIL import Image

assets = Path(__file__).resolve().parents[1] / 'src' / 'assets'
assert assets.is_dir()
for slug in ['pan-frances', 'pollo-a-la-naranja', 'mochis-dulces']:
    with Image.open(assets / f'{slug}-1440.webp') as image:
        size = (800, round(image.height * 800 / image.width))
        destination = assets / f'{slug}-800.webp'
        image.resize(size, Image.Resampling.LANCZOS).save(destination, 'WEBP', quality=82, method=6)
        print(f'Generated {destination.name}: {size}, {destination.stat().st_size} bytes')
