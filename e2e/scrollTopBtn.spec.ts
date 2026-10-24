import { type BrowserContext, expect, type Page, test } from '@playwright/test';
import { launchWithExtension, setSettings, testPage } from './fixtures';
import { openNotionPage, pageContentSel, scrollerSel } from './notion';

// Runs on the long page in the Notion test account (see e2e/README.md) and opens other pages from the sidebar.
test.skip(!testPage, 'needs a saved login and test page: run `pnpm test:e2e:login`');

test.describe.configure({ mode: 'serial' });

let context: BrowserContext;
let page: Page;

test.beforeAll(async () => {
    context = await launchWithExtension();
    await setSettings(context, { scrollTopBtn: true });
    page = context.pages()[0];
    await openNotionPage(page, testPage!.url);
});

test.afterAll(async () => {
    await context?.close();
});

const button = () => page.locator('.scroll-top-btn');
const scrollTop = () => page.locator(scrollerSel).evaluate((el) => el.scrollTop);
const sidebarPage = (title: string) =>
    page.locator('.notion-sidebar a[role="treeitem"]').filter({ hasText: title }).first();

async function expectButtonScrollsBackToTop() {
    // the button shows after scrolling down a screen
    await page.locator(scrollerSel).evaluate((el) => el.scrollTo(0, el.clientHeight * 2));
    await expect(button()).toBeVisible();

    await button().click();

    await expect.poll(scrollTop).toBe(0);
    await expect(button()).toBeHidden();
    await expect(button()).toHaveCount(1);
}

// Notion opens another page without reloading: a new page scroller replaces the old one
async function openOtherPageAndComeBack(goBack: () => Promise<unknown>) {
    await page.locator('.notion-sidebar a[role="treeitem"]').filter({ hasNotText: testPage!.title }).first().click();
    await page.waitForURL((url) => url.href.split('?')[0] !== testPage!.url);
    await page.waitForTimeout(2000);

    await goBack();
    await page.waitForURL((url) => url.href.split('?')[0] === testPage!.url);
    await page.locator(pageContentSel).waitFor();
    await page.waitForTimeout(1000);
}

test.describe('scroll to top button', () => {
    test('shows on a scrolled page and scrolls back to the top', async () => {
        await expect(button()).toBeHidden();
        await expectButtonScrollsBackToTop();
    });

    test('keeps working after opening another page from the sidebar and coming back', async () => {
        await openOtherPageAndComeBack(() => sidebarPage(testPage!.title).click());
        await expectButtonScrollsBackToTop();
    });

    test('keeps working after going back in the browser history', async () => {
        await openOtherPageAndComeBack(() => page.goBack());
        await expectButtonScrollsBackToTop();
    });
});
