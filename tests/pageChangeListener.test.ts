import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pageChangeListener, removePageChangeListener } from '../components/utils';
import { blockHtml, heading, pageContent, paragraph, renderNotionPage, scrollerHtml } from './notion';

const otherPage = [heading('other-h', 1, 'Other page'), paragraph('other-p')];

let onDocReady: ReturnType<typeof vi.fn>;
let onContentReady: ReturnType<typeof vi.fn>;
let observer: MutationObserver | undefined;

function listen() {
    observer = pageChangeListener([onDocReady], [onContentReady]);
}

const waitFor = (assertion: () => void) => vi.waitFor(assertion, { timeout: 2000, interval: 20 });
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    renderNotionPage('page-1', [heading('h', 1, 'First page'), paragraph('p')]);
    onDocReady = vi.fn();
    onContentReady = vi.fn();
});

afterEach(() => {
    if (observer) removePageChangeListener(observer);
    observer = undefined;
    vi.restoreAllMocks();
    document.body.innerHTML = '';
});

describe('page change listener', () => {
    it('notices a new page when Notion replaces only the page scroller', async () => {
        listen();

        // Notion keeps .notion-frame and its wrapper
        document.querySelector('.notion-scroller.vertical')!.outerHTML = scrollerHtml('page-2', otherPage);

        await waitFor(() => expect(onContentReady).toHaveBeenCalledTimes(1));
        expect(onDocReady).toHaveBeenCalledTimes(1);
    });

    it('notices a new page when Notion replaces the wrapper of the page scroller', async () => {
        listen();

        document.querySelector('.notion-selectable-container')!.outerHTML =
            `<div class="notion-selectable-container">${scrollerHtml('page-2', otherPage)}</div>`;

        await waitFor(() => expect(onContentReady).toHaveBeenCalledTimes(1));
        expect(onDocReady).toHaveBeenCalledTimes(1);
    });

    it('notices a new page when Notion replaces the whole frame', async () => {
        listen();

        document.querySelector('.notion-frame')!.outerHTML =
            `<main class="notion-frame"><div class="notion-selectable-container">${scrollerHtml('page-2', otherPage)}</div></main>`;

        await waitFor(() => expect(onContentReady).toHaveBeenCalledTimes(1));
        expect(onDocReady).toHaveBeenCalledTimes(1);
    });

    it('notices every page change, not only the first', async () => {
        listen();

        document.querySelector('.notion-scroller.vertical')!.outerHTML = scrollerHtml('page-2', otherPage);
        await waitFor(() => expect(onContentReady).toHaveBeenCalledTimes(1));
        document.querySelector('.notion-scroller.vertical')!.outerHTML = scrollerHtml('page-1', [paragraph('p')]);

        await waitFor(() => expect(onContentReady).toHaveBeenCalledTimes(2));
        expect(onDocReady).toHaveBeenCalledTimes(2);
    });

    it('ignores changes within the page that is open', async () => {
        listen();

        pageContent()
            .querySelector('div > div')!
            .insertAdjacentHTML('beforeend', blockHtml(paragraph('new')));
        document.querySelector('[data-block-id="h"] h2')!.textContent = 'Renamed';
        document.querySelector('.notion-topbar')!.append(document.createElement('div'));
        await sleep(100);

        expect(onDocReady).not.toHaveBeenCalled();
        expect(onContentReady).not.toHaveBeenCalled();
    });

    it('calls the content callbacks once the new page content has loaded', async () => {
        listen();

        // Notion shows the new page scroller before its content
        document.querySelector('.notion-scroller.vertical')!.outerHTML = '<div class="notion-scroller vertical"></div>';
        await waitFor(() => expect(onDocReady).toHaveBeenCalledTimes(1));
        await sleep(100);
        expect(onContentReady).not.toHaveBeenCalled();

        document.querySelector('.notion-scroller.vertical')!.outerHTML = scrollerHtml('page-2', otherPage);

        await waitFor(() => expect(onContentReady).toHaveBeenCalledTimes(1));
    });

    it('notices the first page when it started listening before Notion rendered one', async () => {
        document.querySelector('.notion-selectable-container')!.innerHTML = '';
        listen();

        document.querySelector('.notion-selectable-container')!.innerHTML = scrollerHtml('page-1', otherPage);

        await waitFor(() => expect(onContentReady).toHaveBeenCalledTimes(1));
        expect(onDocReady).toHaveBeenCalledTimes(1);
    });

    it('stops after it is removed', async () => {
        listen();
        removePageChangeListener(observer);

        document.querySelector('.notion-scroller.vertical')!.outerHTML = scrollerHtml('page-2', otherPage);
        await sleep(100);

        expect(onDocReady).not.toHaveBeenCalled();
        expect(onContentReady).not.toHaveBeenCalled();
    });
});
