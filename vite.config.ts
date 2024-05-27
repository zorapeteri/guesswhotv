import { sentryVitePlugin } from "@sentry/vite-plugin"
import { vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { netlifyPlugin } from "@netlify/remix-adapter/plugin"

export default defineConfig({
  plugins: [
    remix(),
    netlifyPlugin(),
    tsconfigPaths(),
    sentryVitePlugin({
      org: "zora-peteri",
      project: "guesswhotv",
    }),
  ],

  build: {
    sourcemap: true,
  },
})
