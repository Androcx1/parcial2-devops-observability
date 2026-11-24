const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',

  timeout: 30000,

  expect: {
    timeout: 5000,
  },

  fullyParallel: false,

  workers: 1,

  retries: 0,

  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: 'never',
      },
    ],
  ],

  use: {
    baseURL: 'http://127.0.0.1:3000',

    headless: true,

    viewport: {
      width: 1366,
      height: 768,
    },

    screenshot: 'only-on-failure',

    trace: 'retain-on-failure',

    video: 'off',
  },

  webServer: {
    command: 'npm start',

    url: 'http://127.0.0.1:3000/api/health',

    reuseExistingServer: true,

    timeout: 30000,
  },

  projects: [
    {
      name: 'chromium',

      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});