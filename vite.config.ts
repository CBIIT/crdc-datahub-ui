import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";

// List of test files to exclude from coverage and testing
const testExcludes: string[] = [
  "src/**/*.stories.tsx",
  "src/test-utils/**",
  "src/vitest.global-setup.ts",
  "conf/**",
  "public/**",
];

export default defineConfig({
  base: "/",
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    svgr({
      svgrOptions: { exportType: "default", ref: true, svgo: false, titleProp: true },
    }),
    viteTsConfigPaths(),
  ],
  server: {
    open: true,
    port: 3010,
    hmr: {
      port: 3010,
      protocol: "ws",
    },
  },
  build: {
    outDir: "build",
    manifest: true,
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.tsx"],
    globalSetup: "./src/vitest.global-setup.ts",
    exclude: [...configDefaults.exclude, ...testExcludes],
    coverage: {
      provider: "v8",
      reporter: ["lcov", "json", "html"],
      exclude: [...configDefaults.coverage.exclude, ...testExcludes],
    },
    testTimeout: 10_000,
  },
  optimizeDeps: {
    include: [
      "@emotion/react",
      "@emotion/styled",
      "@mui/material/Unstable_Grid2",
      "@mui/icons-material",
    ],
  },
});
