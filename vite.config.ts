import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Allows root index.html to work statically on GitHub Pages (main / root)
 * by referencing ./dist/assets/app.js & app.css on disk, while seamlessly
 * using /src/main.tsx during `vite dev` and `vite build`.
 */
function githubPagesRootPlugin(): Plugin {
  return {
    name: 'github-pages-root-compat',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html
          .replace('<link rel="stylesheet" href="./dist/assets/app.css" />', '')
          .replace(
            '<script type="module" src="./dist/assets/app.js"></script>',
            '<script type="module" src="/src/main.tsx"></script>'
          );
      },
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [githubPagesRootPlugin(), react(), tailwindcss()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/app.[ext]',
      },
    },
  },
});
