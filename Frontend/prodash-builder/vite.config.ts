import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

const manualChunks = (id: string) => {
  const normalizedId = id.replace(/\\/g, '/');

  if (!normalizedId.includes('/node_modules/')) {
    return undefined;
  }

  if (
    normalizedId.includes('/jspdf/') ||
    normalizedId.includes('/canvg/') ||
    normalizedId.includes('/html2canvas/') ||
    normalizedId.includes('/dompurify/') ||
    normalizedId.includes('/fflate/') ||
    normalizedId.includes('/core-js/') ||
    normalizedId.includes('/rgbcolor/') ||
    normalizedId.includes('/svg-pathdata/')
  ) {
    return 'vendor-pdf';
  }

  if (
    normalizedId.includes('/react/') ||
    normalizedId.includes('/react-dom/') ||
    normalizedId.includes('/scheduler/')
  ) {
    return 'vendor-react';
  }

  if (
    normalizedId.includes('/recharts/') ||
    normalizedId.includes('/d3-') ||
    normalizedId.includes('/react-is/')
  ) {
    return 'vendor-charts';
  }

  if (
    normalizedId.includes('/lucide-react/') ||
    normalizedId.includes('/motion/') ||
    normalizedId.includes('/framer-motion/')
  ) {
    return 'vendor-ui';
  }

  if (normalizedId.includes('/@google/genai/')) {
    return 'vendor-ai';
  }

  return 'vendor';
};

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 1100,
      modulePreload: {
        resolveDependencies: (_filename, deps) =>
          deps.filter((dep) => !dep.includes('vendor-pdf')),
      },
      rollupOptions: {
        output: {
          manualChunks,
        },
      },
    },
  };
});
