import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'favicon-32.png', 'icons/*.png'],
      manifest: {
        name: 'Fierro 40k - Recetario',
        short_name: 'Fierro 40k',
        description: 'Cocina a tu ritmo: pan francés, pollo a la naranja y mochis dulces, paso a paso.',
        lang: 'es',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#23392f',
        background_color: '#f8f5ef',
        icons: [
          { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{html,js,css,woff,woff2,webp}'],
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: true,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/\/(?:api|assets|icons)(?:\/|$)/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [{
          // Only the recipe photographs shipped by this application; never APIs.
          urlPattern: ({ url, request, sameOrigin }) => sameOrigin
            && request.destination === 'image'
            && /\/(?:pan-frances|pollo-a-la-naranja|mochis-dulces)-(?:640|800|1440)-[\w-]+\.webp$/.test(url.pathname),
          handler: 'CacheFirst',
          options: {
            cacheName: 'fierro-40k-recipe-photos-v1',
            cacheableResponse: { statuses: [200] },
            expiration: { maxEntries: 12, maxAgeSeconds: 30 * 24 * 60 * 60, purgeOnQuotaError: true },
          },
        }],
      },
      devOptions: { enabled: false },
    }),
  ],
})
