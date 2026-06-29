import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, resolve(__dirname, '..'), '');
  const appEnv = loadEnv(mode, process.cwd(), '');
  const env = { ...rootEnv, ...appEnv };
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icons.svg'],
        manifest: {
          name: '小卦摊',
          short_name: '小卦摊',
          description: '周易六爻、梅花易数与紫微斗数排盘占卜工具',
          theme_color: '#F8F4ED',
          background_color: '#F8F4ED',
          display: 'standalone',
          orientation: 'portrait-primary',
          icons: [
            {
              src: 'pwa-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-maskable-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: 'pwa-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        }
      }),
      {
        name: 'html-env-replacement',
        transformIndexHtml(html) {
          return html
            .replace(/%VITE_REDIRECT_DOMAIN%/g, env.VITE_REDIRECT_DOMAIN || '')
            .replace(/%VITE_GA_ID%/g, env.VITE_GA_ID || '');
        }
      }
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.BASE_URL': JSON.stringify(env.BASE_URL || ''),
      'process.env.MODEL': JSON.stringify(env.MODEL || ''),
    }
  }
})
