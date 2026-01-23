import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      DATABASE_URL: "postgres://user:pass@localhost:5432/test",
      BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret-test-secret",
      BETTER_AUTH_URL: "http://localhost:3000",
      CORS_ORIGIN: "http://localhost:3000",
    },
    include: ["**/*.test.ts"],
  },
});
