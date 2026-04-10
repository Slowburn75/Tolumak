import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  format: "esm",
  outDir: "./api",
  clean: true,
  noExternal: [/@Tolumak\/.*/],
  platform: "node",
  minify: true,
});
