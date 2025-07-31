import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import { resolve } from 'path'
import type { PluginOption } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Mathlly',
        short_name: 'Mathlly',
        description: 'Math learning application',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
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
                maxAgeSeconds: 60 * 60 * 24 * 30 * 12,
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      },
      filename: 'sw.js'
    }),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    }) as PluginOption
  ],
  resolve: {
    alias: {
      '@components': resolve(__dirname, './src/shared/components'),
      '@composables': resolve(__dirname, './src/shared/composables'),
      '@stores': resolve(__dirname, './src/shared/stores'),
      '@services': resolve(__dirname, './src/shared/services'),
      '@utils': resolve(__dirname, './src/shared/utils'),
      '@types': resolve(__dirname, './src/shared/types'),
      '@features': resolve(__dirname, './src/features'),
      '@pages': resolve(__dirname, './src/pages'),
      '@router': resolve(__dirname, './src/router'),
      '@assets': resolve(__dirname, './src/assets'),
      '@app': resolve(__dirname, './src/app'),
      '@shared': resolve(__dirname, './src/shared'),

      '@calculator': resolve(__dirname, './src/features/calculator'),
      '@base64': resolve(__dirname, './src/features/tools/base64'),
      '@settings': resolve(__dirname, './src/features/settings'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-ui': ['radix-vue', 'lucide-vue-next'],
          'vendor-utils': ['@vueuse/core', '@vueuse/motion'],
          'vendor-math': ['mathjs', 'chart.js', 'vue-chartjs'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 8080,
    open: true,
  },
  define: {
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
  },
})
