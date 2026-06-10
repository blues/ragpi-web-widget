import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Alias React to Preact's compat layer to shrink the runtime (~35KB gzip).
    // Order matters: the more specific subpaths must come before the bare
    // "react"/"react-dom" entries so they aren't swallowed by the prefix match.
    alias: [
      { find: "react/jsx-runtime", replacement: "preact/jsx-runtime" },
      { find: "react/jsx-dev-runtime", replacement: "preact/jsx-dev-runtime" },
      {
        // react-shadow only calls renderToString in SSR mode, which this widget
        // never uses; stub it so the Preact alias doesn't pull in
        // preact-render-to-string. Must precede the "react-dom" entry below.
        find: "react-dom/server",
        replacement: fileURLToPath(
          new URL("./src/widget/react-server-stub.ts", import.meta.url),
        ),
      },
      { find: "react-dom/test-utils", replacement: "preact/test-utils" },
      { find: "react-dom/client", replacement: "preact/compat/client" },
      { find: "react-dom", replacement: "preact/compat" },
      { find: "react", replacement: "preact/compat" },
    ],
  },
  build: {
    minify: 'oxc',
    sourcemap: true,
    rollupOptions: {
      input: "src/widget/index.tsx",
      output: {
        // ESM output so the lazy() ChatModal import actually code-splits into a
        // separate chunk (IIFE forces all dynamic imports to be inlined). The
        // heavy markdown + syntax-highlighter code now loads only when the user
        // first opens the chat panel, not on every page that embeds the widget.
        // Embedders must load the entry with <script type="module" ...>.
        entryFileNames: "ragpi-widget.js",
        // Friendly, stable prefix for the lazy chat-panel chunk. The [hash] is
        // kept so the chunk cache-busts on change (the entry references it by
        // this exact filename, so a new hash propagates automatically).
        chunkFileNames: "ragpi-widget-chat-[hash].js",
        assetFileNames: "ragpi-widget-[name][extname]",
        format: "es",
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
  },
});
