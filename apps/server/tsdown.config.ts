import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/server.ts",
  format: "esm",
  outDir: "./api",
  clean: true,
  noExternal: [/@Tolumak\/.*/],
  platform: "node",
  minify: true,
});
