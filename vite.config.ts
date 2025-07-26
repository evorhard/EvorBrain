import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import path from "path";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [solid()],

  // Path resolution
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@types": path.resolve(__dirname, "./src/types"),
    },
  },

  // Build optimizations
  build: {
    // Generate sourcemaps for better debugging
    sourcemap: true,
    // Optimize output
    minify: "esbuild",
    target: "esnext",
    // Rollup options for optimal chunking
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          "solid-vendor": ["solid-js"],
          "tauri-vendor": ["@tauri-apps/api", "@tauri-apps/plugin-opener"],
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : {
          // Enhanced HMR settings for local development
          overlay: true,
          clientPort: 1420,
        },
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ["solid-js", "@tauri-apps/api"],
    exclude: ["@tauri-apps/cli"],
  },
}));
