import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/shenzhen-homebuy-2027/enterprise-map/',
  build: { outDir: 'dist', assetsDir: 'assets', sourcemap: false }
});
