# Fierro 40k · El gusto de cocinar

Aplicación de recetas en español, construida con **React, Vite y JavaScript**.
Diseño editorial en marfil, verde bosque y terracota, con DM Serif Display y DM
Sans alojadas localmente. Funciona sin backend, cuentas ni APIs de recetas.
Es una **PWA instalable**, con recetas disponibles sin conexión después de
preparar correctamente el almacenamiento local.

## Empezar

Requiere **Node.js 22.12+** y npm. Desarrollo validado con Node.js 24.14.

```bash
npm install
npm run dev
```

Abre la dirección que indique Vite, normalmente `http://localhost:5173`.

```bash
npm run build    # Genera dist/
npm run preview  # Sirve la compilación de producción
npm run lint     # ESLint, React Hooks, Fast Refresh y accesibilidad JSX
npm test         # Pruebas de datos, búsqueda, porciones y validación de progreso
```

## Páginas

| Ruta | Contenido |
| --- | --- |
| `/` | Portada editorial, tres recetas destacadas y filosofía |
| `/recetas` | Catálogo, búsqueda por nombre/ingrediente y categorías |
| `/recetas/pan-frances` | Desayuno · 20 min · Fácil · 2 porciones |
| `/recetas/pollo-a-la-naranja` | Comida · 40 min · Media · 4 porciones |
| `/recetas/mochis-dulces` | Postres · 35 min + enfriamiento · Media · 8 piezas |
| `/favoritos` | Colección personal guardada en este navegador |
| Cualquier otra ruta | Página 404 personalizada |

La colección contiene **exactamente tres recetas**, con 26 ingredientes y 20
pasos en total. Sus datos viven en `src/data/recipes.js`.

## Funcionalidades

- React Router con rutas directas, navegación móvil, Escape para cerrar el menú
  y gestión del foco al cambiar de página.
- Búsqueda instantánea por nombre e ingredientes, sin distinguir mayúsculas ni
  acentos. Se combina con categorías. Los filtros quedan en la URL para poder
  recargarla o compartirla.
- Favoritos con contador, botones con estado accesible y página propia.
- Ingredientes y pasos con casillas reales, progreso de preparación y reinicio.
- Porciones de ½×, 1×, 2× y 3×. Cantidades numéricas, fracciones legibles,
  escalado del agua de la salsa y actualización del número de mochis en los
  pasos. Los ingredientes «al gusto» conservan su indicación.
- Impresión: botón con vista previa del navegador que mantiene cantidades
  seleccionadas, ingredientes, instrucciones y consejos; oculta navegación y
  controles, y elimina tachados.
- Mensajes de estado, recuperación de datos locales inválidos y funcionamiento
  en memoria si el navegador bloquea el almacenamiento.
- Fotografías WebP con `srcset`, carga diferida fuera de la portada y reserva de
  espacio; fuentes e imágenes locales sin peticiones a terceros en ejecución.
- Títulos y descripciones por ruta, favicon, HTML semántico, enlaces de salto,
  foco visible, estados de control y respeto a `prefers-reduced-motion`.

### Persistencia y privacidad

Se utiliza `localStorage`, sin enviar datos a un servidor:

| Clave | Contenido |
| --- | --- |
| `savora:favorites:v1` | Identificadores de recetas guardadas |
| `savora:progress:v1:<slug>` | Ingredientes, pasos y multiplicador de porciones |

Los datos permanecen después de recargar y están separados por receta. No se
sincronizan entre dispositivos; borrar los datos del sitio elimina el progreso.
Si el almacenamiento está bloqueado, la interfaz muestra el estado correspondiente.

## Arquitectura

```text
public/
  favicon.svg
  favicon-32.png
  icons/              # PNG de 192, 512 y maskable de 512 px
src/
  assets/             # Fotografías locales y PHOTOS.md con licencias
  components/
    layout/           # Header, Footer, Layout y gestión de navegación
    recipes/          # Tarjetas, búsqueda, filtros, ingredientes y pasos
    ui/               # Estados vacíos y metadatos
    pwa/              # Instalación, estado de conexión y actualización
  context/            # Favoritos compartidos y mensajes de retroalimentación
  data/               # Recetas estructuradas y referencias de fotografías
  hooks/              # Persistencia validada y acceso al contexto
  pages/              # Inicio, catálogo, detalle, favoritos y 404
  styles/             # Tokens, base, layout, recetas, páginas e impresión
  utils/              # Búsqueda, cantidades y validación de progreso
  App.jsx             # Definición de rutas
  main.jsx            # Entrada de React, fuentes y estilos
  pwa.js              # Registro único y actualizaciones confirmadas por pestaña
scripts/
  fetch_photos.py      # Regeneración opcional de imágenes, requiere Pillow
  generate_responsive_photos.py # Variantes locales de 800 px, requiere Pillow
  generate_pwa_icons.py # PNG desde el SVG existente, requiere Playwright
tests/
  recipes.test.js      # Pruebas con el runner nativo de Node.js
  browser_smoke.py     # Flujos de navegador, responsive y auditoría axe
  pwa_smoke.py         # Manifest, instalación, caché offline y dos versiones
```

### Dependencias

Se conserva React + Vite. Se añaden `react-router-dom` para rutas, `lucide-react`
para iconos y `@fontsource/dm-sans` / `@fontsource/dm-serif-display` para fuentes
locales. ESLint utiliza los plugins de React Hooks, React Refresh y JSX a11y.
El diseño usa CSS nativo con variables; no requiere framework de estilos.
`vite-plugin-pwa` **2.0.0**, compatible con Vite 8, es la única dependencia directa
añadida para la PWA y se utiliza en desarrollo/compilación. Workbox genera el
Service Worker; su registro se realiza con la API nativa del navegador para
gestionar explícitamente la confirmación de actualización de cada pestaña.

## Fotografías

Las nueve imágenes WebP ya están incluidas: las seis originales y tres variantes
de 800 px para móviles. Las fuentes y licencias verificadas
se documentan en [`src/assets/PHOTOS.md`](src/assets/PHOTOS.md). Son fotografías
de los platos como referencia de presentación.

Para regenerarlas de manera opcional:

```bash
python -m pip install Pillow
python scripts/fetch_photos.py --force
python scripts/generate_responsive_photos.py
```

La ejecución normal y el build **no necesitan descargar fotografías**.

## PWA: probar e instalar

El Service Worker se genera únicamente al compilar y se registra **solo en
producción**, después de la carga inicial, sobre HTTPS o localhost. `npm run dev`
mantiene el flujo normal de desarrollo sin instalar un Service Worker.

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

Abre `http://127.0.0.1:4173` y espera el mensaje **«Recetas listas sin conexión»**.
Para probar desde otro dispositivo, publica `dist/` en un alojamiento HTTPS;
una dirección HTTP de la red local no equivale a localhost en el móvil.

### Instalación

- **Android, Chrome:** abre la dirección HTTPS y utiliza «Instalar aplicación»
  desde el menú del navegador, o el botón «Instalar Fierro 40k» del pie de página
  cuando esté disponible.
- **Windows y Linux:** utiliza un navegador compatible, como Chrome; pulsa su
  icono de instalación en la barra de direcciones o la opción de instalación del
  menú. Edge también ofrece instalación donde la plataforma la admite.
- La aplicación instalada se identifica como **Fierro 40k**, utiliza el símbolo
  existente y solicita apertura en ventana independiente (`standalone`).

El botón propio aparece exclusivamente cuando el navegador proporciona un evento
`beforeinstallprompt` utilizable. Desaparece después de usarlo, al instalar o al
ejecutarse en modo independiente. El navegador decide cuándo ofrecer el evento.

### Disponibilidad sin conexión y límites

| Recurso | Política |
| --- | --- |
| HTML, JavaScript, CSS, fuentes e iconos | Precaché versionada de los recursos de la compilación |
| Datos de las tres recetas | Incluidos en el JavaScript precacheado |
| Fotografías locales de recetas | `CacheFirst`, respuestas 200, hasta 12 entradas y 30 días |
| Rutas de la aplicación | Fallback al HTML precacheado para que React Router resuelva la página |

La precaché final del núcleo ocupa aproximadamente **545 KiB** sin compresión,
con 21 recursos. No descarga todas las fotografías anticipadamente. El núcleo se
renueva por versión y Workbox elimina los recursos obsoletos al activar la nueva
versión; las fotografías usan una caché acotada y se pueden purgar ante falta de
espacio.

Después de una preparación correcta se pueden abrir y recargar las rutas,
consultar las tres recetas, buscar, filtrar, ajustar porciones y utilizar favoritos
y progreso. Estos últimos conservan la persistencia en `localStorage` existente.
El fallback de navegación excluye APIs, directorios de recursos y solicitudes de
archivos; no hay reglas generales para almacenar respuestas de API ni peticiones
a terceros.

Solo están disponibles las fotografías **descargadas y todavía conservadas**.
Si falta una, se indica «Fotografía no disponible sin conexión». Al recuperar la
conexión se reintenta su carga; también hay un botón de reintento si falla estando
en línea. La caché no garantiza contenido nunca descargado, y el navegador puede
eliminar almacenamiento. Si se borran los datos del sitio, hace falta volver a
abrirlo con conexión y también se pierden los favoritos y el progreso locales.

### Actualizaciones

Cada nueva compilación genera un Service Worker con revisiones del contenido.
Se comprueban actualizaciones al abrir y, como máximo una vez por hora, cuando la
aplicación está visible y en línea, también al recuperar foco/conexión.

Cuando hay una versión preparada aparecen **«Actualizar»** y **«Más tarde»**.
Actualizar activa el nuevo worker y recarga únicamente la pestaña que lo ha
confirmado. Las demás mantienen su documento y muestran un aviso para recargar
cuando el usuario termine. «Más tarde» conserva un recordatorio accesible. No hay
recargas automáticas impuestas a una pestaña por la actualización de otra.

Los PNG se pueden regenerar desde el favicon SVG original con:

```bash
python scripts/generate_pwa_icons.py
```

El icono maskable tiene fondo opaco y el símbolo reducido dentro de la zona segura.

## Validación en navegador

Además de `npm test` y `npm run lint`, se incluye una suite de Chromium con
Playwright para las rutas, filtros, estados vacíos, favoritos, almacenamiento,
porciones, progreso, impresión, menú y navegación por teclado.
Comprueba anchos de 320, 375, 430, 768, 1024, 1280, 1440 y 1920 px, así como
orientación horizontal. Captura pantallas y ejecuta axe-core con reglas WCAG
A/AA. La auditoría automatizada no sustituye una evaluación manual completa.

Instalación opcional de herramientas de prueba (no son dependencias de la app):

```bash
python -m pip install playwright Pillow
python -m playwright install chromium
```

Con `npm run dev` activo, en otra terminal:

```bash
python tests/browser_smoke.py --url http://localhost:5173
```

Para probar producción, ejecuta `npm run build` y `npm run preview`, y utiliza
`--url http://localhost:4173`. `--artifacts` permite elegir un directorio
**existente** para las capturas; por defecto se usa el directorio temporal.
La auditoría descarga axe-core 4.10.3 desde cdnjs únicamente durante las pruebas.
La impresión verifica la invocación y el CSS de impresión, sin enviar trabajos a
una impresora.

### Verificación específica de la PWA

Con una vista previa de producción activa:

```bash
python tests/pwa_smoke.py --url http://127.0.0.1:4173
```

Comprueba el manifest con Chromium, criterios de instalación, un único registro,
dimensiones de PNG y opacidad maskable, rutas y recargas offline, fotos guardadas y
ausentes, búsqueda, favoritos, progreso, reconexión, exclusión de API, impresión y
la selección/caché de fotos de 800 px en un dispositivo móvil emulado. El flujo del
botón de instalación y el modo standalone se simulan explícitamente; no instalan
la aplicación en el sistema operativo.

Para verificar la transición entre **dos compilaciones distintas**, genera otra
compilación en un directorio de pruebas (no utilices el directorio publicado):

```bash
npm run build -- --outDir ../fierro-pwa-test --minify false
python tests/pwa_smoke.py --url http://127.0.0.1:4173 --next-dist ../fierro-pwa-test
```

El segundo build sin minificar es solo una versión distinta para la prueba. La
suite inicia un servidor local temporal para intercambiar ambos builds y comprueba
aplazamiento, activación confirmada, renovación del bundle, eliminación del bundle
obsoleto y conservación del progreso en dos pestañas sin recargas forzadas.

### Resultados de esta implementación

- `npm run lint`, las siete pruebas de `npm test` y la compilación de producción:
  correctos.
- Suite funcional existente sobre producción: rutas, filtros, datos locales,
  porciones, progreso, impresión, anchos de 320 a 1920 px y axe WCAG A/AA en cinco
  tipos de página; sin errores de consola ni excepciones de página.
- Suite PWA completa: correcta, incluida la transición real entre dos builds y la
  selección de imágenes en móvil. También se verificó otro build bajo `/cocina/`,
  con registro, manifest, rutas e imágenes sin conexión.
- Lighthouse **13.5.0**, portada de producción en localhost, perfil móvil:
  **rendimiento 89**, **accesibilidad 100**, **buenas prácticas 100**, **SEO 92**.
  LCP medido: **3,4 s**. Son resultados locales de una ejecución, no garantías
  sobre el alojamiento final. La variante intermedia redujo la foto principal
  solicitada en el móvil auditado de aproximadamente 262 KB a 98 KB.
- Lighthouse actual no ofrece una categoría PWA; manifest, Service Worker,
  instalación y offline se comprobaron por separado con Chromium/Playwright.

Queda pendiente la instalación manual y apertura desde el icono del sistema en
dispositivos Android, Windows y Linux, y verificar el alojamiento HTTPS definitivo.

## Despliegue

Publica el contenido de `dist/` en un alojamiento estático. Como se utiliza
`BrowserRouter`, configura el servidor para devolver `index.html` para rutas de
la aplicación que no coincidan con un archivo, conservando la URL. Vite dev y
preview ya incluyen este comportamiento. Por ejemplo, en Nginx:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

La configuración actual asume publicación en la raíz del dominio.

### HTTPS, cabeceras y versiones

Publica **todo** `dist/`, incluidos `sw.js`, `workbox-*.js`,
`manifest.webmanifest`, `icons/` y `assets/`, sobre HTTPS. Mantén el fallback SPA
para las rutas y devuelve 404 reales para archivos inexistentes de `assets/` e
`icons/`, para no servir HTML donde se esperan JavaScript o imágenes.

Configura la revalidación de `index.html`, `sw.js`, el manifest y los iconos con
nombre estable (`Cache-Control: no-cache`). Los recursos con hash de `assets/`
admiten `Cache-Control: public, max-age=31536000, immutable`. Sirve `sw.js` con un
tipo MIME JavaScript y el manifest como `application/manifest+json`. La aplicación
solicita `updateViaCache: 'none'` para no reutilizar respuestas HTTP antiguas al
comprobar el worker.

Para Nginx, puedes complementar el fallback anterior con reglas específicas:

```nginx
location = /sw.js {
    try_files $uri =404;
    add_header Cache-Control "no-cache" always;
}
location = /index.html {
    add_header Cache-Control "no-cache" always;
}
location = /manifest.webmanifest {
    default_type application/manifest+json;
    add_header Cache-Control "no-cache" always;
}
location /assets/ {
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
location /icons/ {
    try_files $uri =404;
    add_header Cache-Control "no-cache";
}
```

Si publicas bajo una subruta, compila con la base correspondiente, por ejemplo
`npm run build -- --base /cocina/`, y adapta el fallback del alojamiento a
`/cocina/index.html` y las reglas anteriores al prefijo. Router, registro, favicon
y URLs relativas del manifest respetan esa base. Utiliza una base de ruta absoluta
como `/` o `/cocina/`, coherente con `BrowserRouter`.
