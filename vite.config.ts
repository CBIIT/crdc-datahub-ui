import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitetsConfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    svgr({
      svgrOptions: { exportType: "default", ref: true, svgo: false, titleProp: true },
    }),
    vitetsConfigPaths(),
  ],
  server: {
    open: true, // automatically open the app in the browser
    port: 3010,
  },
  build: {
    outDir: "build",
  },
});
