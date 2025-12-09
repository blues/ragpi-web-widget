import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget',
  testMatch: 'test-modal.spec.js',
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
  },
});
