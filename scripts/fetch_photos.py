"""Rebuild local, optimized photographs. Requires Python and Pillow.

Source photographs and licenses are documented in src/assets/PHOTOS.md.
Run explicitly; this is not needed to install or build Fierro 40k.
"""
from io import BytesIO
import argparse
from pathlib import Path
from urllib.request import Request, urlopen
from time import sleep

from PIL import Image, ImageOps

DESTINATION = Path(__file__).resolve().parents[1] / 'src' / 'assets'
PHOTOS = {
    'pan-frances': 'https://upload.wikimedia.org/wikipedia/commons/2/20/French_toast_with_berries_and_maple_syrup_-_Pasadena%2C_CA.jpg',
    'pollo-a-la-naranja': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Flickr_preppybyday_4786746354--Orange_chicken.jpg',
    'mochis-dulces': 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Daifuku_1.jpg',
}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--force', action='store_true', help='Regenerate existing optimized photos')
    parser.add_argument('--only', choices=PHOTOS, help='Download just one recipe photograph')
    args = parser.parse_args()
    if not DESTINATION.is_dir():
        raise SystemExit('Run from the Fierro 40k repository with src/assets present.')
    for name, url in PHOTOS.items():
        if args.only and name != args.only:
            continue
        if not args.force and all((DESTINATION / f'{name}-{width}.webp').exists() for width in (640, 1440)):
            continue
        request = Request(url, headers={'User-Agent': 'SavoraRecipeProject/1.0 (image attribution in PHOTOS.md)'})
        with urlopen(request, timeout=60) as response:
            image = ImageOps.exif_transpose(Image.open(BytesIO(response.read()))).convert('RGB')
        for width in (640, 1440):
            resized = image.copy()
            resized.thumbnail((width, width * 2), Image.Resampling.LANCZOS)
            destination = DESTINATION / f'{name}-{width}.webp'
            resized.save(destination, 'WEBP', quality=85, method=6)
            print(f'{destination.name}: {resized.size}, {destination.stat().st_size:,} bytes')
        sleep(3)
