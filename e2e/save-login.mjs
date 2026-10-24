// Saves a login to a Notion test account and a test page for the workspace e2e tests (e2e/workspace.spec.ts).
//
// Opens a browser window: log in to the test account there (email login works best; Google may refuse an
// automated browser). Then the session is saved to e2e/.auth/notion.json and a long test page is created in
// the account, or set NOTION_TEST_PAGE_URL to use an existing page instead. Set NOTION_E2E_AUTH_DIR to save it
// outside the repo (e.g. when working in temporary git worktrees).
//
// Run: pnpm test:e2e:login
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const authDir = process.env.NOTION_E2E_AUTH_DIR ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '.auth');
const title = 'Notion Boost outline test';

const context = await chromium.launchPersistentContext('', { channel: 'chromium', headless: false, viewport: null });
const page = context.pages()[0];
await page.goto('https://www.notion.so/login');
console.log('Log in to the Notion test account in the browser window...');
await page.locator('.notion-sidebar').waitFor({ timeout: 10 * 60_000 });

fs.mkdirSync(authDir, { recursive: true });
await context.storageState({ path: path.join(authDir, 'notion.json') });
console.log(`Saved the login to ${authDir}`);

const url = process.env.NOTION_TEST_PAGE_URL ?? (await createTestPage());
fs.writeFileSync(path.join(authDir, 'test-page.json'), JSON.stringify({ url: url.split('?')[0], title }, null, 4));
console.log(`Test page: ${url}`);
await context.close();

// a page long enough for Notion to render only part of it, with a wide simple table
async function createTestPage() {
    await page.goto('https://www.notion.so/new');
    await page.locator('.notion-frame .notion-page-block [contenteditable="true"]').first().click();
    await page.keyboard.type(title);
    await page.keyboard.press('Enter');

    const filler = 'This paragraph only makes the page long enough for Notion to render part of it at a time. ';
    const columns = Array.from({ length: 14 }, (_, i) => i + 1);
    const table = `<table>${[0, 1, 2]
        .map(
            (row) =>
                `<tr>${columns.map((col) => `<td>${row ? `Row ${row} cell ${col}` : `Column ${col}`}</td>`).join('')}</tr>`,
        )
        .join('')}</table>`;
    let html = '';
    for (let i = 1; i <= 30; i++) {
        html += `<h1>Section ${i}</h1><p>${filler.repeat(2)}</p>${i === 1 ? table : ''}`;
        html += `<h2>Section ${i}.1 details</h2><p>${filler.repeat(3)}</p><h3>Section ${i}.1.a notes</h3><p>${filler.repeat(2)}</p>`;
    }

    // paste it into the page body
    await page.evaluate((pasted) => {
        const data = new DataTransfer();
        data.setData('text/html', pasted);
        data.setData('text/plain', '');
        document.activeElement.dispatchEvent(
            new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }),
        );
    }, html);
    // let Notion save it
    await page.waitForTimeout(5000);
    return page.url();
}
