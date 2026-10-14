import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['resources/js/**/*.test.jsx'],
    setupFiles: ['./resources/js/test/setup.js'],
    clearMocks: true,
  },
});
