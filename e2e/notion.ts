import { expect, type Locator, type Page } from '@playwright/test';

export const scrollerSel = '.notion-frame .notion-scroller.vertical';
export const pageContentSel = '.notion-frame .notion-page-content';

export async function openNotionPage(page: Page, url: string) {
    await page.goto(url);
    await page.locator(pageContentSel).waitFor({ timeout: 60_000 });
}

export async function outlineEntries(page: Page): Promise<string[]> {
    return (await page.locator('.nb-outline .block .text').allTextContents()).map((text) => text.trim());
}

export function outlineEntry(page: Page, text: string): Locator {
    return page.locator('.nb-outline .block').filter({ has: page.getByText(text, { exact: true }) });
}

export function renderedHeading(page: Page, text: string): Locator {
    return page
        .locator(`${pageContentSel} [class*="header-block"]`)
        .filter({ has: page.getByText(text, { exact: true }) });
}

// Headings of the open page according to Notion's page data, read independently of the extension:
// this is what the outline should list, including headings Notion hasn't rendered.
export function headingsFromPageData(page: Page): Promise<string[]> {
    return page.evaluate(async () => {
        const titleBlock = [...document.querySelectorAll('.notion-frame .notion-page-block[data-block-id]')].find(
            (el) => !el.closest('.notion-page-content'),
        );
        const pageId = titleBlock?.getAttribute('data-block-id');
        const blocks: Record<string, any> = {};
        let cursor = { stack: [] };
        for (let chunkNumber = 0; chunkNumber < 100; chunkNumber++) {
            const res = await fetch('/api/v3/loadPageChunk', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ pageId, limit: 100, cursor, chunkNumber, verticalColumns: false }),
            });
            const data = await res.json();
            Object.assign(blocks, data.recordMap.block);
            cursor = data.cursor;
            if (!cursor?.stack?.length) break;
        }

        const get = (id: string) => blocks[id]?.value?.value ?? blocks[id]?.value;
        const texts: string[] = [];
        const visit = (id: string) => {
            const block = get(id);
            if (!block || block.alive === false) return;
            if (/^(sub_)*header$/.test(block.type)) {
                texts.push((block.properties?.title ?? []).map((segment: string[]) => segment[0]).join(''));
            }
            if (!['page', 'collection_view', 'collection_view_page'].includes(block.type)) {
                (block.content ?? []).forEach(visit);
            }
        };
        (get(pageId!)?.content ?? []).forEach(visit);
        return texts.map((text) => text.trim()).filter(Boolean);
    });
}

export function renderedHeadingCount(page: Page): Promise<number> {
    return page.locator(`${pageContentSel} [class*="header-block"]`).count();
}

export async function scrollPageTo(page: Page, position: 'top' | 'bottom') {
    await page
        .locator(scrollerSel)
        .evaluate((el, pos) => el.scrollTo(0, pos === 'top' ? 0 : el.scrollHeight), position);
    // let Notion render that part of the page
    await page.waitForTimeout(1000);
}

// position of an element relative to the top of the page scroller
export async function offsetInScroller(page: Page, locator: Locator): Promise<number> {
    const scrollerTop = (await page.locator(scrollerSel).boundingBox())!.y;
    return (await locator.boundingBox())!.y - scrollerTop;
}

export async function expectOutlineShown(page: Page) {
    await expect(page.locator('.nb-outline.show')).toBeVisible();
}
