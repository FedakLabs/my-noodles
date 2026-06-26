import { defineConfig, devices } from '@playwright/test';

const mockApiUrl = 'http://127.0.0.1:3001';
const webUrl = 'http://localhost:3000';

// Playwright loads test files in this Node process — not only the Next webServer child.
process.env.NEXT_PUBLIC_API_URL ??= mockApiUrl;
process.env.NEXT_PUBLIC_SITE_URL ??= webUrl;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: webUrl,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node e2e/mock-api.mjs',
      url: `${mockApiUrl}/api/health/live`,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm dev',
      url: webUrl,
      reuseExistingServer: !process.env.CI,
      env: {
        NEXT_PUBLIC_API_URL: mockApiUrl,
        NEXT_PUBLIC_SITE_URL: webUrl,
      },
    },
  ],
});
