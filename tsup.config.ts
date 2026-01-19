import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: true,
  external: ['react', 'react-dom', 'framer-motion', 'react-router-dom', 'lucide-react'],
  treeshake: true,
  splitting: false,
  loader: {
    '.css': 'css',
  },
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
  outDir: 'dist',
});
