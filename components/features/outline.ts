import { getElement, toElement } from '../utils';
import { getPageHeadings, type Heading, pageIdFromPath } from './outlineData';

// ENABLE/DISABLE Console Logs
const DEBUG = false;

// keep classes in hierarchy of DOM

// stays on page change
const outlineFrameCls = '.nb-outline';
const outlineToggleBtnCls = 'outlineToggleBtn';

// these get replaced on page change
const notionScrollerCls = '.notion-frame .notion-scroller.vertical';
const notionPageContentCls = '.notion-frame .notion-page-content';
const headingBlockSel = '[data-block-id][class*="header-block"]';

// Notion only renders the blocks around the viewport (a virtualized list), so the headings are read
// from the page data (the same API Notion itself uses) and then kept in sync with the rendered blocks.
let pageId = '';
let headings: Heading[] = [];
let isPageDataLoaded = false; // false: the page data isn't available, so only rendered headings are shown
let isLoadingPageData = false;
let pageDataRequest = 0; // bumped on every load so that stale responses are dropped
let topBlockIds: string[] = []; // top-level blocks of the page, in order
let topBlockIndex = new Map<string, number>(); // top-level block id -> its position on the page
let headingTopIndex = new Map<string, number>(); // heading id -> position of its top-level block

let checkPageTimer: number | undefined;
let docEditObserver: MutationObserver | undefined;
let observedPageContent: Element | null = null;
let syncTimer: number | undefined;
let refreshTimer: number | undefined;
let removedHeadingIds = new Set<string>();
let isHiddenByUser = false;
let renderedKey = '';
let scrollRequest = 0;

// starting point
export function displayOutline(isShow: boolean) {
    console.log(`feature: displayOutline: ${isShow}`);

    if (isShow) {
        if (checkPageTimer) return;
        console.log('setting up outline feature');

        // Notion swaps the page content on navigation without reloading, so keep checking which page is open
        checkPage();
        checkPageTimer = window.setInterval(checkPage, 500);
    } else {
        removeOutline();
    }
}

function checkPage() {
    const pageContent = getElement(notionPageContentCls);
    const currentPageId = pageContent ? getPageId() : '';

    if (!currentPageId) {
        // no page content, e.g. a full page database
        if (pageId) closePage();
        return;
    }

    if (currentPageId !== pageId) openPage(currentPageId);
    if (pageContent !== observedPageContent) docEditListener(pageContent);
    addOutlineToggleBtn();
    render();
}

function openPage(id: string) {
    DEBUG && console.log(`outline: opened page ${id}`);

    pageId = id;
    headings = [];
    isPageDataLoaded = false;
    topBlockIds = [];
    topBlockIndex = new Map();
    headingTopIndex = new Map();
    removedHeadingIds = new Set();
    window.clearTimeout(refreshTimer);
    loadPageData(true);
}

function closePage() {
    pageId = '';
    headings = [];
    pageDataRequest++;
    removeDocEditListener();
    window.clearTimeout(syncTimer);
    window.clearTimeout(refreshTimer);
    hideOutline();
    removeOutlineToggleBtn();
}

function removeOutline() {
    console.log('removing outline feature...');

    window.clearInterval(checkPageTimer);
    checkPageTimer = undefined;
    closePage();
    getElement(outlineFrameCls)?.remove();
    renderedKey = '';

    console.log('removed outline feature');
}

// id of the page that is open: from the URL, or else from its title block above the page content.
// Hovering a block shows its drag handle, a copy of the block that's also outside the page content,
// so for a link to another page the title block lookup would find that page instead.
function getPageId(): string {
    const idFromPath = pageIdFromPath(location.pathname);
    if (idFromPath) return idFromPath;

    const titleBlock = [...document.querySelectorAll('.notion-frame .notion-page-block[data-block-id]')].find(
        (el) => !el.closest('.notion-page-content, .notion-selectable-hover-menu-item'),
    );
    return titleBlock?.getAttribute('data-block-id') ?? '';
}

// PAGE DATA

async function loadPageData(isFirstLoad: boolean) {
    const request = ++pageDataRequest;
    const id = pageId;
    const blocks: Record<string, any> = {};
    isLoadingPageData = true;

    try {
        // long pages come in chunks of ~100 blocks
        let cursor = { stack: [] as unknown[] };
        for (let chunkNumber = 0; chunkNumber < 100; chunkNumber++) {
            const res = await fetch(`${location.origin}/api/v3/loadPageChunk`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ pageId: id, limit: 100, cursor, chunkNumber, verticalColumns: false }),
            });
            if (!res.ok) throw new Error(`loadPageChunk failed: ${res.status}`);
            const data = await res.json();
            if (request !== pageDataRequest) return;

            Object.assign(blocks, data?.recordMap?.block);
            cursor = data?.cursor;
            const isLastChunk = !cursor?.stack?.length;
            if (isLastChunk) isLoadingPageData = false;

            // on first load show the headings of a long page as its chunks arrive
            if ((isFirstLoad || isLastChunk) && !applyPageData(blocks, id)) {
                throw new Error('page not found in page data');
            }
            if (isLastChunk) return;
        }
    } catch (e) {
        if (request !== pageDataRequest) return;
        console.log('outline: could not load page data, showing rendered headings only', e);
        isLoadingPageData = false;
        isPageDataLoaded = false;
        syncWithDom();
    }
}

function applyPageData(blocks: Record<string, any>, id: string): boolean {
    const pageHeadings = getPageHeadings(blocks, id);
    if (!pageHeadings) return false;

    ({ headings, topBlockIds, headingTopIndex } = pageHeadings);
    topBlockIndex = new Map(topBlockIds.map((blockId, i) => [blockId, i]));
    isPageDataLoaded = true;
    syncWithDom();
    return true;
}

// RENDERED HEADINGS

function getRenderedHeadings(pageContent: Element): Heading[] {
    return [...pageContent.querySelectorAll(headingBlockSel)]
        .map((el) => ({
            id: el.getAttribute('data-block-id') ?? '',
            level: headingLevelOfBlock(el),
            text: headingText(el),
        }))
        .filter((h) => h.id && h.level);
}

// notion-header-block, notion-sub_header-block, notion-sub_sub_header-block -> 1, 2, 3
function headingLevelOfBlock(el: Element): number {
    for (const cls of el.classList) {
        const match = cls.match(/^notion-((?:sub_)*)header-block$/);
        if (match) return match[1].length / 4 + 1;
    }
    return 0;
}

function headingText(blockEl: Element): string {
    // the first editable text is the heading itself; toggle headings also contain their children
    const textEl = blockEl.querySelector('[data-content-editable-leaf], h1, h2, h3, h4, h5, h6');
    return textEl ? nodeText(textEl) : '';
}

function nodeText(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    if (!(node instanceof Element)) return '';
    // emojis
    if (node.tagName === 'IMG') return node.getAttribute('alt') ?? '';
    // hidden copy of an inline equation
    if (node.classList.contains('katex-mathml')) return '';
    return [...node.childNodes].map(nodeText).join('');
}

// update headings with what's rendered: text edits, new headings, and headings turned into other blocks
function syncWithDom() {
    const pageContent = getElement(notionPageContentCls);
    if (!pageContent || getPageId() !== pageId) return;

    const rendered = getRenderedHeadings(pageContent);

    if (!isPageDataLoaded) {
        headings = rendered;
        render();
        return;
    }

    let needsRefresh = false;
    const byId = new Map(headings.map((h) => [h.id, h]));
    const renderedBlocks = getRenderedBlocks(pageContent);

    rendered.forEach((heading, i) => {
        const known = byId.get(heading.id);
        if (known) {
            known.level = heading.level;
            known.text = heading.text;
            return;
        }

        // added after the page data was loaded: put it next to the closest rendered heading
        const before = rendered
            .slice(0, i)
            .reverse()
            .find((h) => byId.has(h.id));
        const after = rendered.slice(i + 1).find((h) => byId.has(h.id));
        let index = headings.length;
        if (before) index = headings.indexOf(byId.get(before.id)!) + 1;
        else if (after) index = headings.indexOf(byId.get(after.id)!);
        headings.splice(index, 0, heading);
        byId.set(heading.id, heading);
        needsRefresh = true;
    });

    // headings turned into another block type
    headings = headings.filter((h) => {
        const el = renderedBlocks.get(h.id);
        return !el || headingLevelOfBlock(el) > 0;
    });

    // Notion also removes blocks that scroll out of view, so a removed heading only counts as deleted
    // when its top-level block lies within the part of the page that's rendered
    if (!isLoadingPageData && removedHeadingIds.size) {
        const { first, last } = getRenderedTopRange(renderedBlocks);
        for (const id of removedHeadingIds) {
            const topIndex = headingTopIndex.get(id);
            if (!renderedBlocks.has(id) && topIndex !== undefined && topIndex >= first && topIndex <= last) {
                needsRefresh = true;
            }
        }
        removedHeadingIds.clear();
    }

    if (needsRefresh && !isLoadingPageData) scheduleRefresh();
    render();
}

function getRenderedBlocks(pageContent: Element): Map<string, Element> {
    return new Map(
        [...pageContent.querySelectorAll('[data-block-id]')].map((el) => [el.getAttribute('data-block-id') ?? '', el]),
    );
}

// positions of the first and last rendered top-level blocks
function getRenderedTopRange(renderedBlocks: Map<string, Element>) {
    const indexes = [...renderedBlocks.keys()]
        .map((id) => topBlockIndex.get(id))
        .filter((i): i is number => i !== undefined);
    return { first: Math.min(...indexes), last: Math.max(...indexes) };
}

function scheduleSync() {
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(syncWithDom, 200);
}

// reload the page data after headings were added, deleted or moved; wait a bit so Notion has saved the change
function scheduleRefresh() {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => loadPageData(false), 1500);
}

// add/update outline if any heading change occurs
function docEditListener(pageContent: Element) {
    DEBUG && console.log('listening for doc edit changes...');

    removeDocEditListener();
    observedPageContent = pageContent;

    const hasHeading = (node: Node) =>
        node instanceof Element && (node.matches(headingBlockSel) || !!node.querySelector(headingBlockSel));

    docEditObserver = new MutationObserver((mutationList) => {
        let isHeadingChanged = false;

        for (const m of mutationList) {
            const target = m.target instanceof Element ? m.target : m.target.parentElement;

            // text typed into a heading, or a block turned into/from a heading
            if (target?.closest(headingBlockSel) || (m.type === 'attributes' && m.oldValue?.includes('header-block'))) {
                isHeadingChanged = true;
            }

            m.addedNodes.forEach((node) => {
                if (hasHeading(node)) isHeadingChanged = true;
            });

            m.removedNodes.forEach((node) => {
                if (!hasHeading(node)) return;
                isHeadingChanged = true;
                const el = node as Element;
                [el, ...el.querySelectorAll(headingBlockSel)].forEach((heading) => {
                    const id = heading.getAttribute('data-block-id');
                    if (id) removedHeadingIds.add(id);
                });
            });
        }

        if (isHeadingChanged) {
            DEBUG && console.log('heading changed');
            scheduleSync();
        }
    });

    docEditObserver.observe(pageContent, {
        childList: true,
        characterData: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
        attributeOldValue: true,
    });

    scheduleSync();
}

function removeDocEditListener() {
    if (docEditObserver) {
        console.log('disconnected docEditObserver');
        docEditObserver.disconnect();
        docEditObserver = undefined;
    }
    observedPageContent = null;
}

// OUTLINE

function render() {
    const scroller = getElement(notionScrollerCls);
    if (!scroller) return;

    let outlineEl = getElement(outlineFrameCls);
    if (!outlineEl) {
        // do not add any space between closing and ending of `
        outlineEl = toElement(`
        <div class="nb-outline">
          <div class="table_of_contents">
            <div class="title">
            <p id="nbScrollToTop" title="Go to top" role="button">Outline</p>
            </div>
            <div class="block-wrapper">
            </div>
          </div>
          </div>`);

        outlineEl.querySelector('#nbScrollToTop')?.addEventListener('click', () => {
            getElement(notionScrollerCls)?.scroll({ top: 0, left: 0 });
        });
        renderedKey = '';
    }

    // css expects the outline right before the page scroller, which is replaced on page change
    if (outlineEl.nextElementSibling !== scroller) {
        scroller.parentNode.insertBefore(outlineEl, scroller);
    }

    const visibleHeadings = headings.filter((h) => h.text.trim());
    const key = visibleHeadings.map((h) => `${h.id} ${h.level} ${h.text}`).join('\n');
    if (key !== renderedKey) {
        renderedKey = key;
        renderHeadings(outlineEl.querySelector('.block-wrapper'), visibleHeadings);
    }

    // hide outline if there is no heading
    outlineEl.classList.toggle('show', visibleHeadings.length > 0 && !isHiddenByUser);

    // page width next to the outline, used by css to fit wide tables
    if (outlineEl.classList.contains('show')) {
        const scrollerWidth = `${scroller.clientWidth}px`;
        if (document.documentElement.style.getPropertyValue('--nb-scroller-width') !== scrollerWidth) {
            document.documentElement.style.setProperty('--nb-scroller-width', scrollerWidth);
        }
    }
}

function renderHeadings(blockWrapperEl: Element, visibleHeadings: Heading[]) {
    const tocBlockEl = toElement(`<div class="block">
         <a role="link">
           <div role="button" tabindex="0" class="btn">
             <div class="align">
               <div class="text">
               </div>
             </div>
           </div>
         </a>
       </div>`);

    // if there's no h1 then reduce space from left
    const minLevel = Math.min(...visibleHeadings.map((h) => h.level));

    const blockEls = visibleHeadings.map((heading) => {
        const blockEl = tocBlockEl.cloneNode(true) as Element;
        blockEl.querySelector('.align')?.classList.add(`nb-h${heading.level - minLevel + 1}`);
        blockEl.querySelector('.text')!.textContent = heading.text;
        blockEl.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToHeading(heading.id);
        });
        return blockEl;
    });

    blockWrapperEl.replaceChildren(...blockEls);
}

function hideOutline() {
    getElement(outlineFrameCls)?.classList.remove('show');
}

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

// scroll a heading into view; if it isn't rendered, jump to where it should be until Notion renders it
async function scrollToHeading(id: string) {
    const request = ++scrollRequest;
    // range of scroll positions the heading is known to be between
    let low = 0;
    let high = Infinity;

    for (let step = 0; step < 50; step++) {
        const scroller = getElement(notionScrollerCls);
        const pageContent = getElement(notionPageContentCls);
        if (!scroller || !pageContent || request !== scrollRequest) return;

        // a heading in a collapsed toggle isn't rendered, so go to its top-level block instead
        const topIndex = headingTopIndex.get(id);
        const targetEl =
            pageContent.querySelector(`[data-block-id="${id}"]`) ??
            (topIndex === undefined ? null : pageContent.querySelector(`[data-block-id="${topBlockIds[topIndex]}"]`));
        if (targetEl) {
            scrollToElement(scroller, targetEl);
            // blocks rendered above it can change height, so check again
            await sleep(150);
            if (request === scrollRequest && targetEl.isConnected) scrollToElement(scroller, targetEl);
            return;
        }

        const estimate = estimateScrollTop(scroller, pageContent, id);
        if (!estimate) return;

        if (estimate.isAbove) high = Math.min(high, scroller.scrollTop);
        else low = Math.max(low, scroller.scrollTop);

        let next = estimate.scrollTop;
        if (next <= low || next >= high) {
            next = Number.isFinite(high) ? (low + high) / 2 : low + scroller.clientHeight;
        }
        scroller.scrollTop = next;
        await sleep(80);
    }
}

function scrollToElement(scroller: Element, el: Element) {
    // leave some room above the heading
    scroller.scrollTop += el.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 80;
}

// estimate the scroll position of a heading that isn't rendered, from the top-level blocks that are
function estimateScrollTop(scroller: Element, pageContent: Element, id: string) {
    const targetIndex = headingTopIndex.get(id);
    if (targetIndex === undefined) return null;

    const rendered = [...getRenderedBlocks(pageContent)]
        .map(([blockId, el]) => ({ index: topBlockIndex.get(blockId), top: el.getBoundingClientRect().top }))
        .filter((block): block is { index: number; top: number } => block.index !== undefined)
        .sort((a, b) => a.index - b.index);
    if (!rendered.length) return null;

    const first = rendered[0];
    const last = rendered[rendered.length - 1];
    const blockHeight = last.index > first.index ? (last.top - first.top) / (last.index - first.index) : 50;
    const isAbove = targetIndex < first.index;
    const ref = isAbove ? first : last;
    const targetTop = ref.top + (targetIndex - ref.index) * blockHeight;

    return {
        isAbove,
        scrollTop: scroller.scrollTop + targetTop - scroller.getBoundingClientRect().top - scroller.clientHeight / 3,
    };
}

// OUTLINE TOGGLE BUTTON

function addOutlineToggleBtn() {
    try {
        if (document.querySelector(`.${outlineToggleBtnCls}`)) return;

        const sibling = getToggleBtnSibling();
        if (!sibling?.parentNode) return;

        console.log('add outline btn');
        const btnEl = toElement(
            `<div class=${outlineToggleBtnCls} role="button" title="Show/hide outline" tabindex="-1">Outline</div>`,
        );
        btnEl.addEventListener('click', () => {
            isHiddenByUser = !isHiddenByUser;
            render();
        });
        sibling.parentNode.insertBefore(btnEl, sibling);
    } catch (e: any) {
        console.log('Error: ', e.message);
    }
}

function getToggleBtnSibling(): Element | null {
    // workspace pages: next to the Share button
    const shareBtn = getElement('.notion-topbar-share-menu');
    if (shareBtn) return shareBtn;

    // public pages (notion.site) have no named topbar buttons: use the "•••" menu, the last button with a popup
    const popupBtns = document.querySelectorAll('.notion-topbar [role="button"][aria-haspopup]');
    return popupBtns[popupBtns.length - 1] ?? null;
}

function removeOutlineToggleBtn() {
    document.querySelector(`.${outlineToggleBtnCls}`)?.remove();
}
