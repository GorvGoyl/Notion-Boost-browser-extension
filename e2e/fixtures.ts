import { chromium, type BrowserContext } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

export const extensionPath = process.env.EXTENSION_PATH ?? path.resolve(dir, '../build/chrome-mv3');
// saved by `pnpm test:e2e:login`, not committed; NOTION_E2E_AUTH_DIR keeps it outside the repo
const authDir = process.env.NOTION_E2E_AUTH_DIR ?? path.join(dir, '.auth');
export const authFile = path.join(authDir, 'notion.json');
export const testPageFile = path.join(authDir, 'test-page.json');

// the extension API, in code evaluated in extension pages
declare const chrome: any;

export type TestPage = { url: string; title: string };
export const testPage: TestPage | null = fs.existsSync(testPageFile)
    ? JSON.parse(fs.readFileSync(testPageFile, 'utf8'))
    : null;

// Chromium with the built extension, logged in to the Notion test account if a login was saved.
// Specs open one page and run their tests in order on it: Notion throttles bursts of page loads.
export async function launchWithExtension(): Promise<BrowserContext> {
    if (!fs.existsSync(path.join(extensionPath, 'manifest.json'))) {
        throw new Error(`No extension build in ${extensionPath}, run \`pnpm build\` first`);
    }
    // extensions need a persistent context; the "chromium" channel runs them headless too
    const context = await chromium.launchPersistentContext('', {
        channel: 'chromium',
        viewport: { width: 1440, height: 900 },
        args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    });
    if (fs.existsSync(authFile)) {
        await context.addCookies(JSON.parse(fs.readFileSync(authFile, 'utf8')).cookies);
    }
    return context;
}

// Turns features on or off the way the extension's popup saves them (see components/settings.ts), e.g.
// `{ scrollTopBtn: true }`. The extension reads them when a Notion page loads, so set them before opening one.
export async function setSettings(context: BrowserContext, settings: Record<string, boolean>) {
    const page = await context.newPage();
    // the extension has no background page, so save them from its popup page
    await page.goto('chrome://extensions');
    const extensionId = await page.evaluate(async () => {
        const extensions = await chrome.management.getAll();
        return extensions.find((extension: { name: string }) => extension.name === 'Notion Boost')?.id;
    });
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.evaluate((nbSettings) => chrome.storage.sync.set({ nb_settings: nbSettings }), settings);
    await page.close();
}
