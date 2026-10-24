# Créditos de fotografía

Las fotografías se distribuyen localmente en WebP a 640, 800 y hasta 1440 px de ancho.
Se han redimensionado y convertido de formato; la interfaz recorta su encuadre
con `object-fit: cover`. Las licencias siguientes se aplican a cada fotografía,
incluidas estas versiones, independientemente del código de la aplicación.

| Archivo | Fotografía y autor | Licencia |
| --- | --- | --- |
| `pan-frances-*.webp` | [French toast with berries and maple syrup — Pasadena, CA](https://commons.wikimedia.org/wiki/File:French_toast_with_berries_and_maple_syrup_-_Pasadena,_CA.jpg), Daderot | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `pollo-a-la-naranja-*.webp` | [Orange chicken](https://commons.wikimedia.org/wiki/File:Flickr_preppybyday_4786746354--Orange_chicken.jpg), Evan Joshua Swigart / TheCulinaryGeek | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| `mochis-dulces-*.webp` | [Daifuku 1](https://commons.wikimedia.org/wiki/File:Daifuku_1.jpg), Alice Wiegand / Lyzzy | [CC BY 2.5](https://creativecommons.org/licenses/by/2.5/) |

Fuentes y licencias consultadas durante la implementación. Las imágenes son
referencias de presentación de los platos, no fotografías del proceso de estas
recetas. El pollo de la fotografía no incluye todos los adornos sugeridos.

Para regenerar los archivos: `python scripts/fetch_photos.py` (requiere Pillow).
Las variantes de 800 px se generan desde las fotografías locales originales con
`python scripts/generate_responsive_photos.py`; conservan el encuadre y las licencias.
No es necesario descargar nada para ejecutar la aplicación: los WebP se incluyen
en el repositorio.
