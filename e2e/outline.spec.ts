import { type BrowserContext, expect, type Page, test } from '@playwright/test';
import { launchWithExtension } from './fixtures';
import {
    expectOutlineShown,
    headingsFromPageData,
    offsetInScroller,
    openNotionPage,
    outlineEntries,
    outlineEntry,
    renderedHeading,
    scrollerSel,
    scrollPageTo,
} from './notion';

// public page (no login needed) with headings spread over a few screens
const publicPageUrl =
    process.env.NOTION_PUBLIC_PAGE_URL ??
    'https://akogahira.notion.site/Detailed-Guide-to-Creating-a-Table-of-Contents-in-Notion-The-Productive-Engineer-de9adc4835fd4ce8bd4f7adffa1a0444';

test.describe.configure({ mode: 'serial' });

let context: BrowserContext;
let page: Page;
let headings: string[];

test.beforeAll(async () => {
    context = await launchWithExtension();
    page = context.pages()[0];
    await openNotionPage(page, publicPageUrl);
    headings = await headingsFromPageData(page);
});

test.afterAll(async () => {
    await context?.close();
});

test.describe('outline on a public page', () => {
    test('lists every heading of the page', async () => {
        expect(headings.length).toBeGreaterThan(3);

        await expectOutlineShown(page);
        await expect.poll(() => outlineEntries(page)).toEqual(headings);
    });

    test('keeps every heading while scrolling through the page', async () => {
        await scrollPageTo(page, 'bottom');
        expect(await outlineEntries(page)).toEqual(headings);
        await scrollPageTo(page, 'top');
        expect(await outlineEntries(page)).toEqual(headings);
    });

    test('jumps to a heading when its entry is clicked', async () => {
        const target = headings[Math.floor(headings.length / 2)];

        await outlineEntry(page, target).click();

        await expect(renderedHeading(page, target)).toBeInViewport();
        const isAtBottom = await page
            .locator(scrollerSel)
            .evaluate((el) => el.scrollTop + el.clientHeight >= el.scrollHeight - 2);
        // near the top, unless the page can't scroll that far
        if (!isAtBottom) expect(await offsetInScroller(page, renderedHeading(page, target))).toBeLessThan(200);
    });

    test('Outline button hides and shows the outline', async () => {
        const button = page.locator('.outlineToggleBtn');
        await expect(button).toBeVisible();

        await button.click();
        await expect(page.locator('.nb-outline')).toBeHidden();
        await button.click();
        await expectOutlineShown(page);
    });
});
