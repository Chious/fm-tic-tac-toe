import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
  },
  plugins: [
    {
      // Treat SVG imports as empty string data URLs so component tests don't fail
      name: 'svg-mock',
      load(id) {
        if (id.endsWith('.svg')) {
          return 'export default ""';
        }
      },
    },
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
