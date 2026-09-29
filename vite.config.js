import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// base is the repo name so the build works on GitHub Pages at /apply-engine/
export default defineConfig({ plugins: [react()], base: process.env.GITHUB_PAGES ? '/apply-engine/' : '/' });
