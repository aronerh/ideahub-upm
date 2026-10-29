import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:3000";
const isCi = Boolean(process.env.CI);

// Tests a production build: run `npm run build` first, then `npm run test:e2e`.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  reporter: isCi ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run start",
    url: baseURL,
    reuseExistingServer: !isCi,
    timeout: 120_000,
  },
});
