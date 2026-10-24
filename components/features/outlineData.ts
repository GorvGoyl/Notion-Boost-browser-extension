// Reads the headings of a Notion page from its page data, i.e. the block records returned by
// Notion's /api/v3/loadPageChunk (the same data the Notion client renders the page from).

export type Heading = { id: string; level: number; text: string };

export type PageHeadings = {
    headings: Heading[];
    // top-level blocks of the page, in order
    topBlockIds: string[];
    // heading id -> position of its top-level block in topBlockIds
    headingTopIndex: Map<string, number>;
};

// headings of a page in page order; null if the page's own record isn't in `blocks`
export function getPageHeadings(blocks: Record<string, any>, pageId: string): PageHeadings | null {
    const page = blockValue(blocks, pageId);
    if (!page) return null;

    const topBlockIds: string[] = page.content ?? [];
    const headings: Heading[] = [];
    const headingTopIndex = new Map<string, number>();

    const visit = (blockId: string, topIndex: number, depth: number) => {
        const block = blockValue(blocks, blockId);
        if (!block || block.alive === false || depth > 20) return;

        const level = headingLevel(block.type);
        if (level) {
            headings.push({ id: block.id, level, text: richTextToString(block.properties?.title, blocks) });
            headingTopIndex.set(block.id, topIndex);
        }

        // sub-pages and databases have their own content
        if (['page', 'collection_view', 'collection_view_page'].includes(block.type)) return;

        // a synced block copy points to the original block
        const children =
            block.type === 'transclusion_reference'
                ? [block.format?.transclusion_reference_pointer?.id]
                : block.content;
        children?.forEach((childId: string) => visit(childId, topIndex, depth + 1));
    };
    topBlockIds.forEach((blockId, i) => visit(blockId, i, 1));

    return { headings, topBlockIds, headingTopIndex };
}

export function blockValue(blocks: Record<string, any>, id: string) {
    const value = blocks[id]?.value;
    // newer responses wrap the block once more, next to the user's role
    return value?.value?.id ? value.value : value;
}

// header, sub_header, sub_sub_header -> 1, 2, 3
export function headingLevel(type: string | undefined): number {
    const match = type?.match(/^((?:sub_)*)header$/);
    return match ? match[1].length / 4 + 1 : 0;
}

// rich text is a list of [text, annotations]; mentions and inline equations have placeholder text
export function richTextToString(title: any, blocks: Record<string, any>): string {
    if (!Array.isArray(title)) return '';

    return title
        .map(([text, annotations]: [string, any[]?]) => {
            if (text !== '‣' && text !== '⁍') return text;

            for (const [type, value] of annotations ?? []) {
                if (type === 'p') return plainText(blockValue(blocks, value)?.properties?.title) || 'Untitled';
                if (type === 'd') return value?.start_date ?? '';
                if (type === 'e') return value ?? '';
            }
            return '';
        })
        .join('');
}

function plainText(title: any): string {
    return Array.isArray(title) ? title.map(([text]: [string]) => text).join('') : '';
}

// page url ends with the page id, e.g. /Page-title-1234567890abcdef1234567890abcdef
export function pageIdFromPath(pathname: string): string {
    const match = (pathname.split('/').pop() ?? '').replace(/-/g, '').match(/[0-9a-f]{32}$/i);
    if (!match) return '';
    const hex = match[0].toLowerCase();
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
