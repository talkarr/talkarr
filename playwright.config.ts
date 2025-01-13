import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './e2e',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    // reporter: process.env.CI ? 'github' : 'html',
    reporter: process.env.CI
        ? [['github'], ['html'], ['json', { outputFile: 'results.json' }]]
        : 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        // baseURL: 'http://127.0.0.1:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on', // 'retain-on-first-failure',
        screenshot: {
            mode: 'only-on-failure',
        },
        video: process.env.CI ? 'off' : 'retain-on-failure',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        {
            name: 'firefox',
            // for some reason, firefox sometimes fails on local machine
            retries: process.env.CI ? undefined : 5,
            timeout: process.env.CI ? undefined : 30000,
            use: { ...devices['Desktop Firefox'] },
        },

        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },

        /* Test against mobile viewports. */
        ...(process.env.EXCLUDE_MOBILE
            ? []
            : [
                  {
                      name: 'Mobile Chrome',
                      use: { ...devices['Pixel 5'] },
                  },
                  {
                      name: 'Mobile Safari',
                      use: { ...devices['iPhone 12'] },
                  },
              ]),
    ],

    webServer: {
        // CI always has to start its own server
        command: process.env.CI ? 'exit 1' : 'yarn dev',
        port: 3232,
        reuseExistingServer: !process.env.CI,
    },
});
