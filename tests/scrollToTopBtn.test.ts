import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { heading, paragraph, renderNotionPage, scrollerHtml } from './notion';

let scrollTopBtn: (isEnabled: boolean) => void;

const scroller = () => document.querySelector<HTMLElement>('.notion-frame .notion-scroller.vertical')!;
const button = () => document.querySelector<HTMLElement>('.scroll-top-btn');
const isButtonShown = () => !!document.querySelector('.scroll-top-btn.show');

const waitFor = (assertion: () => void) => vi.waitFor(assertion, { timeout: 2000, interval: 20 });
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// happy-dom has no layout: give the page scroller a height, and fire scroll events like a browser does
function makeScrollable(el: HTMLElement) {
    let top = 0;
    Object.defineProperties(el, {
        clientHeight: { configurable: true, value: 800 },
        scrollTop: {
            configurable: true,
            get: () => top,
            set: (value: number) => {
                top = value;
                el.dispatchEvent(new Event('scroll'));
            },
        },
    });
    return el;
}

// Notion opens another page: it replaces the page scroller
function openOtherPage() {
    scroller().outerHTML = scrollerHtml('page-2', [heading('other-h', 1, 'Other page'), paragraph('other-p')]);
    makeScrollable(scroller());
}

async function turnOn() {
    // fresh module state for every test
    vi.resetModules();
    ({ scrollTopBtn } = await import('../components/features/scrollToTopBtn'));
    scrollTopBtn(true);
    await waitFor(() => expect(button()).not.toBeNull());
}

beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    renderNotionPage('page-1', [heading('h', 1, 'First page'), paragraph('p')]);
    makeScrollable(scroller());
});

afterEach(async () => {
    scrollTopBtn?.(false);
    await sleep(10);
    vi.restoreAllMocks();
    document.body.innerHTML = '';
});

describe('scroll to top button', () => {
    it('shows once the page is scrolled down a screen, and scrolls back to the top', async () => {
        await turnOn();
        expect(isButtonShown()).toBe(false);

        scroller().scrollTop = 500;
        await sleep(50);
        expect(isButtonShown()).toBe(false);
        scroller().scrollTop = 1600;
        await waitFor(() => expect(isButtonShown()).toBe(true));

        button()!.click();

        expect(scroller().scrollTop).toBe(0);
        await waitFor(() => expect(isButtonShown()).toBe(false));
    });

    it('keeps working after opening another page', async () => {
        await turnOn();
        scroller().scrollTop = 1600;
        await waitFor(() => expect(isButtonShown()).toBe(true));

        openOtherPage();

        // the other page opens at its top
        await waitFor(() => expect(isButtonShown()).toBe(false));
        scroller().scrollTop = 2400;
        await waitFor(() => expect(isButtonShown()).toBe(true));
        button()!.click();
        expect(scroller().scrollTop).toBe(0);
        await waitFor(() => expect(isButtonShown()).toBe(false));
        expect(document.querySelectorAll('.scroll-top-btn')).toHaveLength(1);
    });

    it('works when the page scroller is rendered after the frame', async () => {
        document.querySelector('.notion-selectable-container')!.innerHTML = '';
        await turnOn();

        document.querySelector('.notion-selectable-container')!.innerHTML = scrollerHtml('page-1', [paragraph('p')]);
        makeScrollable(scroller());
        await sleep(50);
        scroller().scrollTop = 1600;

        await waitFor(() => expect(isButtonShown()).toBe(true));
    });

    it('shows its arrow as an icon, not as a character that a font may lack', async () => {
        await turnOn();

        expect(button()!.querySelector('svg')).not.toBeNull();
        expect(button()!.textContent).toBe('');
    });

    it('is added once when turned on twice', async () => {
        await turnOn();
        scrollTopBtn(true);
        await sleep(50);

        expect(document.querySelectorAll('.scroll-top-btn')).toHaveLength(1);
    });

    it('is removed when turned off, also from pages opened later', async () => {
        await turnOn();

        scrollTopBtn(false);
        await waitFor(() => expect(button()).toBeNull());
        openOtherPage();
        scroller().scrollTop = 1600;
        await sleep(50);

        expect(button()).toBeNull();
    });
});
