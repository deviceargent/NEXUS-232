import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'packages/**/*.test.ts']
  },
  resolve: {
    alias: {
      '@nexus/core': path.resolve(import.meta.dirname, './packages/core/src'),
      '@nexus/application': path.resolve(import.meta.dirname, './packages/application/src'),
      '@nexus/agent': path.resolve(import.meta.dirname, './packages/agent/src'),
      '@nexus/ui': path.resolve(import.meta.dirname, './packages/ui/src')
    }
  }
});
