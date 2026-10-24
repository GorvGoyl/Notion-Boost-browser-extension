import { defineConfig } from '@playwright/test';

// End-to-end tests: load the built extension (build/chrome-mv3) in Chromium and check it on live Notion pages.
// See e2e/README.md.
export default defineConfig({
    testDir: './e2e',
    timeout: 120_000,
    expect: { timeout: 20_000 },
    // tests share one Notion test page, and Notion rate-limits its API
    workers: 1,
    // live pages over the network
    retries: 1,
    reporter: [['list']],
});
