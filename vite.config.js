// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',  // Automatically updates the service worker
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],  // Add your static assets here
      manifest: {
        name: 'Customer Orders App',  // App name
        short_name: 'OrdersApp',      // Short name for home screen
        description: 'Manage customer orders for Mahithraa Sri Crackers',
        theme_color: '#2563eb',       // Matches your Tailwind blue
        background_color: '#f9fafb',  // Matches your bg-gray-50
        display: 'standalone',        // Opens as a full app (no browser UI)
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',  // You'll create this icon
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',  // You'll create this icon
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'  // For adaptive icons
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']  // Cache your build assets
      }
    })
  ]
})