import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  root: "src/ui",
  build: {
    target: "esnext",
    rollupOptions: {
      external: [
        "bun",
        "bun:sqlite",
        "@tajetaje/romm-api",
        "node:path",
        "node:fs/promises",
      ],
    },
  },
});
