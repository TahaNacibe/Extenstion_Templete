import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';


export default defineConfig({
  base: './', // required for the extension to work
  plugins: [
    tailwindcss(),
    react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    assetsDir: 'assets',
    emptyOutDir: true,
  },
})
