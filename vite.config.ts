/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { VitePWA, type ManifestOptions } from 'vite-plugin-pwa'
import { resolve } from 'path'

import manifestJson from './public/manifest.json'
const manifest: Partial<ManifestOptions> = manifestJson as Partial<ManifestOptions>

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: manifest,
      workbox: {
        skipWaiting: false,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/version-info.json'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|woff2|woff|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 * 12
              }
            }
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            urlPattern: /^https:\/\/open\.er-api\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'currency-api',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 2
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https:\/\/open\.er-api\.com\//,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'currency-api-fallback'
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      },
      filename: 'sw.js'
    })
  ],
  resolve: {
    alias: {
      '@components': resolve(__dirname, './src/shared/components'),
      '@composables': resolve(__dirname, './src/shared/composables'),
      '@stores': resolve(__dirname, './src/shared/stores'),
      '@services': resolve(__dirname, './src/shared/services'),
      '@utils': resolve(__dirname, './src/shared/utils'),
      '@types': resolve(__dirname, './src/app/types'),
      '@features': resolve(__dirname, './src/features'),
      '@pages': resolve(__dirname, './src/pages'),
      '@router': resolve(__dirname, './src/router'),
      '@assets': resolve(__dirname, './src/assets'),
      '@app': resolve(__dirname, './src/app'),
      '@shared': resolve(__dirname, './src/shared'),
      '@calculator': resolve(__dirname, './src/features/calculator'),
      '@base64': resolve(__dirname, './src/features/tools/base64'),
      '@color': resolve(__dirname, './src/features/tools/color'),
      '@json': resolve(__dirname, './src/features/tools/json'),
      '@converter': resolve(__dirname, './src/features/converter'),
      '@settings': resolve(__dirname, './src/features/settings')
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia', 'dexie'],
          'vendor-ui': ['radix-vue', 'lucide-vue-next', 'vue-tippy', 'tippy.js'],
          'vendor-utils': ['@vueuse/core', 'anime.js', 'culori'],
          'vendor-math': ['mathjs', 'chart.js', 'vue-chartjs']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  test: {
    environment: 'jsdom',
    globals: true,
    css: true,
  },
  server: {
    port: 8080,
    host: '0.0.0.0',
    allowedHosts: ['dev.local'],
    open: false
  },
  define: {
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true
  }
})
