import { describe, expect, it } from 'vitest';
import { getPageHeadings, headingLevel, pageIdFromPath, richTextToString } from '../components/features/outlineData';
import { heading, pageData, paragraph } from './notion';

const pageId = 'page-1';

describe('getPageHeadings', () => {
    it('lists headings in page order with their levels', () => {
        const blocks = pageData(pageId, [
            heading('a', 1, 'Intro'),
            paragraph('p1'),
            heading('b', 2, 'Details'),
            heading('c', 3, 'More details'),
        ]);

        expect(getPageHeadings(blocks, pageId)?.headings).toEqual([
            { id: 'a', level: 1, text: 'Intro' },
            { id: 'b', level: 2, text: 'Details' },
            { id: 'c', level: 3, text: 'More details' },
        ]);
    });

    it('includes headings inside columns, toggles and toggle headings', () => {
        const blocks = pageData(
            pageId,
            [
                { id: 'cols', type: 'column_list', content: ['col1', 'col2'] },
                { id: 'toggle', type: 'toggle', text: 'Toggle', content: ['in-toggle'] },
                { ...heading('toggle-heading', 1, 'Toggle heading'), content: ['under-toggle-heading'] },
            ],
            [
                { id: 'col1', type: 'column', content: ['in-col1'] },
                { id: 'col2', type: 'column', content: ['in-col2'] },
                heading('in-col1', 2, 'Left column'),
                heading('in-col2', 2, 'Right column'),
                heading('in-toggle', 3, 'Inside toggle'),
                heading('under-toggle-heading', 2, 'Under toggle heading'),
            ],
        );

        const result = getPageHeadings(blocks, pageId)!;

        expect(result.headings.map((h) => h.text)).toEqual([
            'Left column',
            'Right column',
            'Inside toggle',
            'Toggle heading',
            'Under toggle heading',
        ]);
        // nested headings belong to their top-level block
        expect(result.topBlockIds).toEqual(['cols', 'toggle', 'toggle-heading']);
        expect(result.headingTopIndex.get('in-col2')).toBe(0);
        expect(result.headingTopIndex.get('in-toggle')).toBe(1);
        expect(result.headingTopIndex.get('under-toggle-heading')).toBe(2);
    });

    it('skips sub-pages, databases and deleted blocks', () => {
        const blocks = pageData(
            pageId,
            [
                { id: 'sub-page', type: 'page', text: 'Sub page', content: ['sub-page-heading'] },
                { id: 'db', type: 'collection_view', content: ['db-row'] },
                { ...heading('deleted', 1, 'Deleted heading'), alive: false },
                heading('kept', 1, 'Kept heading'),
            ],
            [heading('sub-page-heading', 1, 'Heading of the sub page'), heading('db-row', 1, 'Database row')],
        );

        expect(getPageHeadings(blocks, pageId)?.headings.map((h) => h.text)).toEqual(['Kept heading']);
    });

    it('follows synced block copies to the original block', () => {
        const blocks = pageData(
            pageId,
            [
                {
                    id: 'copy',
                    type: 'transclusion_reference',
                    format: { transclusion_reference_pointer: { id: 'original' } },
                },
            ],
            [
                { id: 'original', type: 'transclusion_container', content: ['synced-heading'] },
                heading('synced-heading', 2, 'Synced heading'),
            ],
        );

        expect(getPageHeadings(blocks, pageId)?.headings.map((h) => h.text)).toEqual(['Synced heading']);
    });

    it('works with partly loaded page data and the older record format', () => {
        const blocks = {
            // older responses don't nest the block in a second `value`
            [pageId]: { role: 'editor', value: { id: pageId, type: 'page', content: ['a', 'not-loaded-yet'] } },
            a: { role: 'editor', value: { id: 'a', type: 'header', properties: { title: [['Loaded']] } } },
        };

        expect(getPageHeadings(blocks, pageId)?.headings).toEqual([{ id: 'a', level: 1, text: 'Loaded' }]);
    });

    it('returns null when the page record is not loaded', () => {
        expect(getPageHeadings({}, pageId)).toBeNull();
    });
});

describe('richTextToString', () => {
    it('joins formatted text', () => {
        const title = [['Bold', [['b']]], [' and '], ['link', [['a', 'https://example.com']]]];
        expect(richTextToString(title, {})).toBe('Bold and link');
    });

    it('shows mentions and inline equations as text', () => {
        const blocks = pageData('mentioned', []);
        const title = [
            ['See '],
            ['‣', [['p', 'mentioned']]],
            [' on '],
            ['‣', [['d', { type: 'date', start_date: '2026-10-24' }]]],
            [': '],
            ['⁍', [['e', 'E=mc^2']]],
        ];
        expect(richTextToString(title, blocks)).toBe('See Test page on 2026-10-24: E=mc^2');
    });

    it('names mentioned pages that are not loaded "Untitled"', () => {
        expect(richTextToString([['‣', [['p', 'unknown']]]], {})).toBe('Untitled');
    });

    it('handles missing titles', () => {
        expect(richTextToString(undefined, {})).toBe('');
    });
});

describe('headingLevel', () => {
    it.each([
        ['header', 1],
        ['sub_header', 2],
        ['sub_sub_header', 3],
        ['sub_sub_sub_header', 4],
        ['text', 0],
        [undefined, 0],
    ])('%s -> %i', (type, level) => {
        expect(headingLevel(type)).toBe(level);
    });
});

describe('pageIdFromPath', () => {
    it.each([
        ['/p/Getting-Started-134e4645cb5a805e98dbf8cac6566d76', '134e4645-cb5a-805e-98db-f8cac6566d76'],
        ['/my-workspace/Cafe-Notes-134e4645cb5a805e98dbf8cac6566d76', '134e4645-cb5a-805e-98db-f8cac6566d76'],
        ['/134e4645cb5a805e98dbf8cac6566d76', '134e4645-cb5a-805e-98db-f8cac6566d76'],
        ['/134e4645-cb5a-805e-98db-f8cac6566d76', '134e4645-cb5a-805e-98db-f8cac6566d76'],
        ['/settings', ''],
        ['/', ''],
    ])('%s', (path, id) => {
        expect(pageIdFromPath(path)).toBe(id);
    });
});
