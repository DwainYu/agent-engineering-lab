import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    environment: "node",
    // React ships different builds per NODE_ENV; the development build is the
    // one that exposes `act`, which Testing Library needs.
    env: { NODE_ENV: "test" },
  },
});
