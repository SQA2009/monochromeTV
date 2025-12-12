import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/history': 'http://localhost:5000',
      '/server': 'http://localhost:5000',
      '/album': 'http://localhost:5000',
      '/search': 'http://localhost:5000',
      '/stream': 'http://localhost:5000',
    }
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.js$/,
    exclude: [],
  },
});
