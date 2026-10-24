import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    type Block,
    blockHtml,
    heading,
    isOutlineShown,
    mockPageDataApi,
    outlineEntries,
    pageContent,
    pageData,
    paragraph,
    renderNotionPage,
    renderedBlock,
    scrollerHtml,
    slotHtml,
} from './notion';

const pageId = 'page-1';

// 30 sections: h1 + paragraph + h2 + paragraph
const sections: Block[] = Array.from({ length: 30 }, (_, i) => [
    heading(`h1-${i}`, 1, `Section ${i}`),
    paragraph(`p1-${i}`),
    heading(`h2-${i}`, 2, `Section ${i} details`),
    paragraph(`p2-${i}`),
]).flat();
const allEntries = sections
    .filter((b) => b.type !== 'text')
    .map((b) => `${b.type === 'header' ? 'h1' : 'h2'} ${b.text}`);

// Notion only renders the blocks around the viewport; sections 10 and 11 here
const renderedSections = sections.slice(40, 48);

let fetchMock: ReturnType<typeof vi.fn>;
let displayOutline: (isShow: boolean) => void;

async function startOutline(pages: Record<string, Record<string, unknown>>, chunkSize = 100) {
    fetchMock = vi.fn(mockPageDataApi(pages, chunkSize));
    vi.stubGlobal('fetch', fetchMock);
    // fresh module state for every test
    vi.resetModules();
    ({ displayOutline } = await import('../components/features/outline'));
    displayOutline(true);
}

// loads of the page data (a long page takes several requests, one per chunk)
const pageDataLoads = () => fetchMock.mock.calls.filter(([, init]) => JSON.parse(init.body).chunkNumber === 0).length;

const waitFor = (assertion: () => void) => vi.waitFor(assertion, { timeout: 4000, interval: 50 });
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    renderNotionPage(pageId, renderedSections);
});

afterEach(() => {
    displayOutline?.(false);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
});

describe('outline', () => {
    it('lists every heading of the page, not only the rendered ones', async () => {
        await startOutline({ [pageId]: pageData(pageId, sections) });

        await waitFor(() => expect(outlineEntries()).toEqual(allEntries));
        expect(isOutlineShown()).toBe(true);
        // css expects the outline right before the page scroller
        expect(document.querySelector('.nb-outline')!.nextElementSibling).toBe(
            document.querySelector('.notion-scroller.vertical'),
        );
    });

    it('loads long pages chunk by chunk', async () => {
        await startOutline({ [pageId]: pageData(pageId, sections) }, 50);

        await waitFor(() => expect(outlineEntries()).toEqual(allEntries));
        const requests = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body));
        expect(requests.map((r) => r.chunkNumber)).toEqual([0, 1, 2]);
        expect(requests[1].cursor).toEqual({ stack: [[{ table: 'block', id: pageId, index: 50 }]] });
        expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/v3\/loadPageChunk$/);
    });

    it('indents headings relative to the highest level on the page', async () => {
        const blocks = [heading('a', 2, 'Second level'), heading('b', 3, 'Third level')];
        renderNotionPage(pageId, blocks);
        await startOutline({ [pageId]: pageData(pageId, blocks) });

        await waitFor(() => expect(outlineEntries()).toEqual(['h1 Second level', 'h2 Third level']));
    });

    it('hides the outline on pages without headings', async () => {
        const blocks = [paragraph('a'), paragraph('b')];
        renderNotionPage(pageId, blocks);
        await startOutline({ [pageId]: pageData(pageId, blocks) });

        await waitFor(() => expect(pageDataLoads()).toBe(1));
        await sleep(300);
        expect(isOutlineShown()).toBe(false);
    });

    it('shows text typed into a heading right away', async () => {
        await startOutline({ [pageId]: pageData(pageId, sections) });
        await waitFor(() => expect(outlineEntries()).toHaveLength(60));

        renderedBlock('h1-10').querySelector('[data-content-editable-leaf]')!.textContent = 'Renamed section';

        await waitFor(() => expect(outlineEntries()).toContain('h1 Renamed section'));
        expect(pageDataLoads()).toBe(1);
    });

    it('shows a heading added to the page in the right place', async () => {
        await startOutline({ [pageId]: pageData(pageId, sections) });
        await waitFor(() => expect(outlineEntries()).toHaveLength(60));

        const newHeading = heading('new', 2, 'New heading');
        renderedBlock('p1-10')
            .closest('[data-virtual-item-slot]')!
            .insertAdjacentHTML('afterend', slotHtml(newHeading));

        await waitFor(() => expect(outlineEntries()).toHaveLength(61));
        const entries = outlineEntries();
        expect(entries.slice(entries.indexOf('h1 Section 10'), entries.indexOf('h1 Section 10') + 3)).toEqual([
            'h1 Section 10',
            'h2 New heading',
            'h2 Section 10 details',
        ]);
        // and reloads the page data to confirm it
        await waitFor(() => expect(pageDataLoads()).toBe(2));
    });

    it('drops a heading turned into another block type', async () => {
        await startOutline({ [pageId]: pageData(pageId, sections) });
        await waitFor(() => expect(outlineEntries()).toHaveLength(60));

        renderedBlock('h2-10').replaceWith(
            document.createRange().createContextualFragment(blockHtml(paragraph('h2-10', 'Now a paragraph'))),
        );

        await waitFor(() => expect(outlineEntries()).not.toContain('h2 Section 10 details'));
        expect(outlineEntries()).toHaveLength(59);
    });

    it('reloads the page data when a rendered heading is deleted', async () => {
        const pages = { [pageId]: pageData(pageId, sections) };
        await startOutline(pages);
        await waitFor(() => expect(outlineEntries()).toHaveLength(60));

        // delete "Section 10 details" from the page and from the page data
        pages[pageId] = pageData(
            pageId,
            sections.filter((b) => b.id !== 'h2-10'),
        );
        renderedBlock('h2-10').closest('[data-virtual-item-slot]')!.remove();

        await waitFor(() => expect(outlineEntries()).not.toContain('h2 Section 10 details'));
        expect(pageDataLoads()).toBe(2);
    });

    it('keeps headings that are only scrolled out of the rendered part of the page', async () => {
        await startOutline({ [pageId]: pageData(pageId, sections) });
        await waitFor(() => expect(outlineEntries()).toHaveLength(60));

        // Notion removes the first rendered blocks when scrolling down
        renderedBlock('h1-10').closest('[data-virtual-item-slot]')!.remove();
        renderedBlock('p1-10').closest('[data-virtual-item-slot]')!.remove();

        await sleep(2500);
        expect(outlineEntries()).toEqual(allEntries);
        expect(pageDataLoads()).toBe(1);
    });

    it('falls back to the rendered headings when the page data cannot be loaded', async () => {
        await startOutline({});

        await waitFor(() =>
            expect(outlineEntries()).toEqual([
                'h1 Section 10',
                'h2 Section 10 details',
                'h1 Section 11',
                'h2 Section 11 details',
            ]),
        );
    });

    it('follows navigation to another page', async () => {
        const otherPage = [heading('other-a', 1, 'Other page heading'), paragraph('other-p')];
        await startOutline({
            [pageId]: pageData(pageId, sections),
            'page-2': pageData('page-2', otherPage),
        });
        await waitFor(() => expect(outlineEntries()).toHaveLength(60));

        // Notion keeps the frame but replaces the page scroller on navigation
        document.querySelector('.notion-scroller.vertical')!.outerHTML = scrollerHtml('page-2', otherPage);

        await waitFor(() => expect(outlineEntries()).toEqual(['h1 Other page heading']));
        expect(document.querySelector('.nb-outline')!.nextElementSibling).toBe(
            document.querySelector('.notion-scroller.vertical'),
        );
    });
});

describe('outline button', () => {
    it('is added next to Share and hides and shows the outline', async () => {
        await startOutline({ [pageId]: pageData(pageId, sections) });
        await waitFor(() => expect(isOutlineShown()).toBe(true));

        const btn = document.querySelector<HTMLElement>('.outlineToggleBtn')!;
        expect(btn.nextElementSibling).toBe(document.querySelector('.notion-topbar-share-menu'));

        btn.click();
        expect(isOutlineShown()).toBe(false);
        btn.click();
        expect(isOutlineShown()).toBe(true);
    });

    it('is added before the ••• menu on public pages', async () => {
        renderNotionPage(pageId, renderedSections, { isPublic: true });
        await startOutline({ [pageId]: pageData(pageId, sections) });

        await waitFor(() => expect(document.querySelector('.outlineToggleBtn')).not.toBeNull());
        expect(document.querySelector('.outlineToggleBtn')!.nextElementSibling!.getAttribute('aria-label')).toBe(
            'More actions',
        );
    });

    it('is removed with the outline when the feature is turned off', async () => {
        await startOutline({ [pageId]: pageData(pageId, sections) });
        await waitFor(() => expect(isOutlineShown()).toBe(true));

        displayOutline(false);

        expect(document.querySelector('.nb-outline')).toBeNull();
        expect(document.querySelector('.outlineToggleBtn')).toBeNull();
        // stays removed
        await sleep(600);
        expect(document.querySelector('.nb-outline')).toBeNull();
    });
});

describe('page content', () => {
    it('is observed again after Notion replaces it', async () => {
        await startOutline({ [pageId]: pageData(pageId, sections) });
        await waitFor(() => expect(outlineEntries()).toHaveLength(60));

        // same page, re-rendered page content
        const content = pageContent();
        content.outerHTML = content.outerHTML;
        await sleep(600);
        renderedBlock('h1-11').querySelector('[data-content-editable-leaf]')!.textContent = 'Edited after re-render';

        await waitFor(() => expect(outlineEntries()).toContain('h1 Edited after re-render'));
    });
});
