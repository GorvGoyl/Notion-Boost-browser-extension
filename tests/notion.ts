// Builders for fake Notion pages: the page data returned by /api/v3/loadPageChunk, and the page's DOM
// the way Notion renders it (only the blocks near the viewport, inside a virtualized list).

export type Block = {
    id: string;
    type: string;
    text?: string;
    title?: unknown[];
    content?: string[];
    alive?: boolean;
    format?: Record<string, unknown>;
};

const headingTypes = ['header', 'sub_header', 'sub_sub_header'];

export const heading = (id: string, level: 1 | 2 | 3, text: string): Block => ({
    id,
    type: headingTypes[level - 1],
    text,
});
export const paragraph = (id: string, text = 'Some text'): Block => ({ id, type: 'text', text });

function toRecord(block: Block) {
    const { text, title, ...rest } = block;
    const value = { ...rest, alive: block.alive ?? true, properties: { title: title ?? [[text ?? '']] } };
    // current responses nest the block next to the user's role
    return { spaceId: 'space', value: { value, role: 'editor' } };
}

// block records keyed by id, as in recordMap.block
export function pageData(pageId: string, topLevel: Block[], nested: Block[] = []) {
    const blocks: Record<string, unknown> = {
        [pageId]: toRecord({ id: pageId, type: 'page', text: 'Test page', content: topLevel.map((b) => b.id) }),
    };
    [...topLevel, ...nested].forEach((block) => (blocks[block.id] = toRecord(block)));
    return blocks;
}

// loadPageChunk responses: the page record comes first, the other blocks in chunks of `chunkSize`
export function pageChunks(pageId: string, blocks: Record<string, unknown>, chunkSize = 100) {
    const ids = Object.keys(blocks).filter((id) => id !== pageId);
    const chunks = [];
    for (let i = 0; i < Math.max(ids.length, 1); i += chunkSize) {
        const chunkIds = ids.slice(i, i + chunkSize);
        const isLast = i + chunkSize >= ids.length;
        chunks.push({
            recordMap: { block: Object.fromEntries([pageId, ...chunkIds].map((id) => [id, blocks[id]])) },
            cursor: { stack: isLast ? [] : [[{ table: 'block', id: pageId, index: i + chunkSize }]] },
        });
    }
    return chunks;
}

// mock for fetch that answers loadPageChunk with the given pages' data
export function mockPageDataApi(pages: Record<string, Record<string, unknown>>, chunkSize = 100) {
    return async (_url: string, init?: RequestInit) => {
        const { pageId, chunkNumber } = JSON.parse(String(init?.body));
        const blocks = pages[pageId];
        if (!blocks) return new Response('{}', { status: 404 });
        const chunks = pageChunks(pageId, blocks, chunkSize);
        return new Response(JSON.stringify(chunks[chunkNumber] ?? chunks[chunks.length - 1]));
    };
}

export function blockHtml(block: Block): string {
    const level = headingTypes.indexOf(block.type) + 1;
    const leaf = level
        ? `<h${level + 1} data-content-editable-leaf="true" placeholder="Heading ${level}">${block.text}</h${level + 1}>`
        : `<div data-content-editable-leaf="true">${block.text}</div>`;
    return `<div data-block-id="${block.id}" class="notion-selectable notion-${block.type}-block"><div><div>${leaf}</div></div></div>`;
}

// top-level block wrapped the way Notion's virtualized list renders it
export const slotHtml = (block: Block) => `<div data-virtual-item-slot="true"><div>${blockHtml(block)}</div></div>`;

export function scrollerHtml(pageId: string, renderedBlocks: Block[]): string {
    return `
        <div class="notion-scroller vertical">
            <div class="notion-selectable notion-page-block" data-block-id="${pageId}"><h1>Test page</h1></div>
            <div class="notion-page-content"><div><div>${renderedBlocks.map(slotHtml).join('')}</div></div></div>
            <div class="notion-presence-container"></div>
        </div>`;
}

// a workspace page; public pages (notion.site) have no Share button, only unnamed topbar buttons
export function renderNotionPage(pageId: string, renderedBlocks: Block[], { isPublic = false } = {}) {
    const topbarButtons = isPublic
        ? `<div><div role="button" aria-haspopup="dialog" aria-label="Share site to socials"></div></div>
           <div><div role="button" aria-haspopup="dialog" aria-label="More actions"></div></div>
           <div role="button">Get Notion free</div>`
        : `<div><div role="button" class="notion-topbar-share-menu">Share</div></div>
           <div role="button" aria-haspopup="dialog" class="notion-topbar-more-button"></div>`;

    document.body.innerHTML = `
        <div id="notion-app">
            <div class="notion-app-inner notion-light-theme">
                <div class="notion-topbar"><div><div class="notion-topbar-action-buttons">${topbarButtons}</div></div></div>
                <main class="notion-frame">
                    <div class="notion-selectable-container">${scrollerHtml(pageId, renderedBlocks)}</div>
                </main>
            </div>
        </div>`;
}

export const pageContent = () => document.querySelector('.notion-frame .notion-page-content')!;
export const renderedBlock = (id: string) => document.querySelector(`[data-block-id="${id}"]`)!;

// text and indentation of each outline entry, e.g. "h1 Introduction"
export const outlineEntries = () =>
    [...document.querySelectorAll('.nb-outline .block')].map(
        (el) => `${el.querySelector('.align')!.className.match(/nb-(h\d)/)![1]} ${el.textContent!.trim()}`,
    );

export const isOutlineShown = () => !!document.querySelector('.nb-outline.show');
