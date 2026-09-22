import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  // Specs hard-code http://localhost:8000/test.html, which loads
  // ./dist/ragpi-widget.js -- so this serves the repo root, not tests/.
  // python3 avoids adding a dependency. Requires dist/ to be built.
  webServer: {
    command: 'python3 -m http.server 8000',
    cwd: '..',
    url: 'http://localhost:8000/test.html',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
