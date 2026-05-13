import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  base: '/SSSRun/',
  build: {
    rollupOptions: {
      input: {
        main:      resolve(__dirname, 'index.html'),
        prototype: resolve(__dirname, 'prototype.html'),
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@backend': fileURLToPath(new URL('./backend', import.meta.url))
    }
  }
})
