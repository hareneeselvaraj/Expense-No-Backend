import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5715,
    proxy: {
      '/api': {
        target: 'http://localhost:5202',
        changeOrigin: true,
      },
    },
  },
});
