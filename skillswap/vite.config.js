import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['react-jutsu'], // ✅ Avoid bundling issues on Vercel
    },
  },
});
