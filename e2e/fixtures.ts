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
