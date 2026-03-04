import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.mjs',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor libraries
          vendor: ['react', 'react-dom', 'react-router-dom', '@mantine/core', '@mantine/hooks'],

          // Virtualization libraries
          virtualization: ['react-virtuoso'],

          // Utilities
          utils: ['lodash', 'moment']
        }
      }
    }
  }
});
