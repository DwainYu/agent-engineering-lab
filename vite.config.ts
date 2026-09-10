import { copyFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const REPO_NAME = "agent-engineering-lab";

/**
 * GitHub Pages has no rewrite rule, so a deep link like /learn/day/7 only
 * resolves if `404.html` is the app itself: the browser keeps the requested
 * path, React Router matches it, and the site behaves like a normal SPA.
 */
function spaFallback(): Plugin {
  return {
    name: "spa-404-fallback",
    apply: "build",
    closeBundle() {
      const out = resolve(dirname(fileURLToPath(import.meta.url)), "dist");
      const index = join(out, "index.html");
      if (existsSync(index)) copyFileSync(index, join(out, "404.html"));
    },
  };
}

export default defineConfig(() => ({
  plugins: [react(), tailwindcss(), spaFallback()],
  // The app lives in web/, the content engine and its Markdown live in the
  // repository root, so every path below is resolved from there.
  root: "web",
  base: process.env.GITHUB_ACTIONS === "true" ? `/${REPO_NAME}/` : "/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: false,
  },
}));
