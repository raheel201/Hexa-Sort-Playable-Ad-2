import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    },
    target: 'es2015',
    minify: 'terser'
  },
  server: {
    port: 3000,
    open: true
  }
})