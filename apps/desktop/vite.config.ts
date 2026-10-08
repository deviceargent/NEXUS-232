import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@nexus/core': path.resolve(import.meta.dirname, '../../packages/core/src'),
      '@nexus/application': path.resolve(import.meta.dirname, '../../packages/application/src'),
      '@nexus/agent': path.resolve(import.meta.dirname, '../../packages/agent/src'),
      '@nexus/ui': path.resolve(import.meta.dirname, '../../packages/ui/src')
    }
  },
  server: {
    port: 1420,
    strictPort: true
  },
  clearScreen: false
});
