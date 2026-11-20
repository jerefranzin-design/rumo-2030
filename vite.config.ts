import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/rumo-2030/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-m3-192.png', 'apple-touch-icon-m3.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,webp}'],
        // guarda a fonte Archivo para o app funcionar offline
        runtimeCaching: [
          { urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/, handler: 'CacheFirst', options: { cacheName: 'fontes', expiration: { maxEntries: 20, maxAgeSeconds: 31536000 }, cacheableResponse: { statuses: [0, 200] } } }
        ]
      },
      manifest: {
        name: 'Studio Jeremias',
        short_name: 'Studio Jeremias',
        description: 'Organização financeira com foco na meta',
        lang: 'pt-BR',
        theme_color: '#0e1111',
        background_color: '#0e1111',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon-m3-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-m3-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-m3-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
});
