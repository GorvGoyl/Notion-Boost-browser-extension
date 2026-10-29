import { type BrowserContext, expect, type Locator, type Page, test } from '@playwright/test';
import { launchWithExtension, testPage } from './fixtures';
import {
    expectOutlineShown,
    headingsFromPageData,
    offsetInScroller,
    openNotionPage,
    outlineEntries,
    outlineEntry,
    pageContentSel,
    renderedHeading,
    renderedHeadingCount,
    scrollerSel,
    scrollPageTo,
} from './notion';

// Runs on a long page in a Notion test account (see e2e/README.md); the tests edit it and undo their edits.
test.skip(!testPage, 'needs a saved login and test page: run `pnpm test:e2e:login`');

test.describe.configure({ mode: 'serial' });

let context: BrowserContext;
let page: Page;
let headings: string[];

test.beforeAll(async () => {
    context = await launchWithExtension();
    page = context.pages()[0];
    await openNotionPage(page, testPage!.url);
    headings = await headingsFromPageData(page);
});

test.afterAll(async () => {
    await context?.close();
});

// put the caret at the end of a block's text
async function clickEndOfText(block: Locator) {
    const text = block.locator('[data-content-editable-leaf]').first();
    const box = (await text.boundingBox())!;
    await text.click({ position: { x: box.width - 2, y: box.height - 4 } });
}

test.describe('outline on a long workspace page', () => {
    test('lists every heading, also the ones Notion has not rendered', async () => {
        expect(headings.length).toBeGreaterThan(30);

        await expectOutlineShown(page);
        await expect.poll(() => outlineEntries(page)).toEqual(headings);
        test.info().annotations.push({
            type: 'rendered headings',
            description: `${await renderedHeadingCount(page)} of ${headings.length}`,
        });
    });

    test('stays on the open page while a link to a sub-page is hovered', async () => {
        await scrollPageTo(page, 'top');
        const subPageLink = page.locator(`${pageContentSel} .notion-page-block`).first();
        test.skip(!(await subPageLink.count()), 'the test page has no sub-page');

        await subPageLink.hover();
        // the outline checks for page changes every 500 ms
        for (let i = 0; i < 8; i++) {
            await page.waitForTimeout(250);
            expect(await outlineEntries(page)).toEqual(headings);
        }
        await expectOutlineShown(page);
        await page.mouse.move(0, 0);
    });

    test('jumps to a heading far down the page', async () => {
        await scrollPageTo(page, 'top');
        const target = headings[headings.length - 5];

        await outlineEntry(page, target).click();

        await expect(renderedHeading(page, target)).toBeInViewport();
        expect(await offsetInScroller(page, renderedHeading(page, target))).toBeLessThan(200);
        expect(await outlineEntries(page)).toEqual(headings);
    });

    test('shows a heading renamed in the page', async () => {
        const target = headings[3];
        await outlineEntry(page, target).click();
        await clickEndOfText(renderedHeading(page, target));

        await page.keyboard.type(' (edited)');
        await expect(outlineEntry(page, `${target} (edited)`)).toBeVisible();

        for (let i = 0; i < ' (edited)'.length; i++) await page.keyboard.press('Backspace');
        await expect(outlineEntry(page, target)).toBeVisible();
    });

    test('shows a heading added to the page, and drops it when removed', async () => {
        const target = headings[6];
        await outlineEntry(page, target).click();
        // the paragraph after the heading
        const paragraphId = await renderedHeading(page, target).evaluate((heading) => {
            const blocks = [...document.querySelectorAll('.notion-page-content [data-block-id]')];
            const next = blocks.slice(blocks.indexOf(heading) + 1).find((b) => b.matches('.notion-text-block'));
            return next?.getAttribute('data-block-id');
        });
        await clickEndOfText(page.locator(`[data-block-id="${paragraphId}"]`));

        await page.keyboard.press('Enter');
        await page.keyboard.type('## ');
        await page.keyboard.type('E2E new heading');

        await expect.poll(() => outlineEntries(page)).toContain('E2E new heading');
        const entries = await outlineEntries(page);
        expect(entries[entries.indexOf(target) + 1]).toBe('E2E new heading');

        // clear the heading, turn it back into text, and remove the empty block
        for (let i = 0; i < 'E2E new heading'.length + 2; i++) await page.keyboard.press('Backspace');

        await expect.poll(() => outlineEntries(page)).not.toContain('E2E new heading');
        // page data reloaded after the change still matches the page
        await page.waitForTimeout(4000);
        expect(await outlineEntries(page)).toEqual(await headingsFromPageData(page));
    });

    test('fits wide simple tables next to the outline', async () => {
        await scrollPageTo(page, 'top');
        const table = page.locator(`${pageContentSel} .notion-table-block`).first();
        test.skip(!(await table.count()), 'the test page has no simple table');

        const scroller = page.locator(scrollerSel);
        const scrollerBox = (await scroller.boundingBox())!;
        const scrollerWidth = await scroller.evaluate((el) => el.clientWidth);
        const tableBox = (await table.boundingBox())!;

        expect(tableBox.x).toBeGreaterThanOrEqual(scrollerBox.x - 1);
        expect(tableBox.x + tableBox.width).toBeLessThanOrEqual(scrollerBox.x + scrollerWidth + 1);
    });

    test('follows navigation to another page and back', async () => {
        const otherPageLink = page
            .locator('.notion-sidebar a[role="treeitem"]')
            .filter({ hasNotText: testPage!.title })
            .first();
        await otherPageLink.click();
        await page.waitForURL((url) => url.href.split('?')[0] !== testPage!.url);
        await page.waitForTimeout(3000);

        if (await page.locator(pageContentSel).count()) {
            const otherHeadings = await headingsFromPageData(page);
            await expect.poll(() => outlineEntries(page)).toEqual(otherHeadings);
            if (!otherHeadings.length) await expect(page.locator('.nb-outline')).toBeHidden();
        } else {
            // e.g. a database
            await expect(page.locator('.nb-outline')).toBeHidden();
        }

        await page.goBack();
        await expectOutlineShown(page);
        await expect.poll(() => outlineEntries(page)).toEqual(headings);
    });
});
