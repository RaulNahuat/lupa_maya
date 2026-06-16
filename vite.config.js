import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-icon-512.png'],
      manifest: {
        id: '/',
        start_url: '/',
        name: 'Lupa Maya',
        short_name: 'LupaMaya',
        description: 'Descubre la belleza de la cultura Maya',
        theme_color: '#FCF8F2',
        background_color: '#FCF8F2',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-icon-512.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-icon-512.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-wide.png',
            sizes: '343x361',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Lupa Maya en Escritorio'
          },
          {
            src: 'screenshot-narrow.png',
            sizes: '1024x1024',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Lupa Maya en Móvil'
          }
        ]
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,jpg,ttf,woff2}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8MB to support large badge images
        navigateFallbackDenylist: [/^\/api/, /^\/models/, /^\/socket\.io/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /.*\/models\/.*\.(json|bin)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'lupa-maya-ai-models-v1',
              expiration: {
                maxEntries: 15,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90 días
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
})
