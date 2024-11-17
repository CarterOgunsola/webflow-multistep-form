import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: "src/core/index.js",
      name: "WebflowMultiStepForm",
      formats: ['es', 'umd', 'iife'],
      fileName: (format) => {
        switch (format) {
          case 'es':
            return `webflow-multistep-form.esm.js`;
          case 'umd':
            return `webflow-multistep-form.umd.js`;
          case 'iife':
            return `webflow-multistep-form.min.js`;
          default:
            return `webflow-multistep-form.${format}.js`;
        }
      },
    },
    rollupOptions: {
      output: {
        sourcemap: true,
        minifyInternalExports: true,
        globals: {
          WebflowMultiStepForm: "WebflowMultiStepForm",
        },
        banner: '/* Webflow Multi-Step Form v1.0.0 | MIT License */',
      }
    },
    minify: 'terser',
  },
  server: {
    port: 3000,
    open: "/examples/index.html",
  }
});