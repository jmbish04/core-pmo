// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const site = process.env.SITE ?? "http://localhost:4321";
const base = process.env.BASE || "/";

// https://astro.build/config
export default defineConfig({
  site,
  srcDir: "./src/frontend",
  base,
  output: "server",
  adapter: cloudflare({
    imageService: "cloudflare",
    platformProxy: {
      enabled: true,
    },
    // Explicitly define session binding name if needed, defaults to SESSION
    sessionKVBindingName: "SESSION",
  }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Ensure Vite respects the path aliases if standard resolution fails
      alias: {
        "@": "/src/frontend",
      },
    },
  },
});
