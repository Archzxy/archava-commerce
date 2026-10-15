import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { avatarkitVitePlugin } from "@spatius/avatarkit/vite";
import { resolve } from "node:path";
import { copyFileSync, readdirSync } from "node:fs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: "/assets/archava/",
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    plugins: [react(), avatarkitVitePlugin(), {
      name: "widget-assets", enforce: "post",
      generateBundle(_options, bundle) { for (const [key, entry] of Object.entries(bundle)) { if (entry.type === "asset" && key.endsWith(".css")) { delete bundle[key]; entry.fileName = "widget.css"; bundle[entry.fileName] = entry; } } },
      closeBundle() { for (const name of readdirSync(resolve("dist/assets"))) { if (name.endsWith(".wasm")) copyFileSync(resolve("dist/assets", name), resolve("dist/chunks", name)); } },
    }],
    build: {
      // An already-open storefront can still request a previous lazy chunk.
      // Keep hashed assets across local rebuilds instead of breaking that page.
      emptyOutDir: false,
      lib: { entry: resolve(process.cwd(), "src/main.tsx"), formats: ["es"], fileName: () => "widget.js" },
      cssCodeSplit: false,
      rollupOptions: { output: { chunkFileNames: "chunks/[name]-[hash].js", assetFileNames: (asset) => asset.name?.endsWith(".css") ? "widget.css" : "assets/[name]-[hash][extname]" } },
    },
    server: {
      port: 5174,
      strictPort: true,
      proxy: { "/api": `http://127.0.0.1:${env.PORT || 5002}` },
    },
  };
});
