import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    [
      '@argos-ci/playwright/reporter',
      {
        // Argos reporter configuration
        uploadToArgos: !!process.env.ARGOS_TOKEN,
      },
    ],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
        launchOptions: { args: ['--disable-lcd-text', '--font-render-hinting=none'] },
      },
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 7'],
        launchOptions: { args: ['--disable-lcd-text', '--font-render-hinting=none'] },
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 14'],
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
