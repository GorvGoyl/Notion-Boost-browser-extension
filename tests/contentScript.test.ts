import { describe, expect, it } from 'vitest';
import { MatchPattern } from 'wxt/utils/match-patterns';
import contentScript from '../entrypoints/content';

// the browser runs the content script on a page whose URL matches `matches` and none of `excludeMatches`
function runsOn(url: string) {
    const matchesAny = (patterns: string[] = []) => patterns.some((pattern) => new MatchPattern(pattern).includes(url));
    return matchesAny(contentScript.matches as string[]) && !matchesAny(contentScript.excludeMatches as string[]);
}

describe('content script', () => {
    it('runs on Notion pages', () => {
        expect(runsOn('https://www.notion.so/Page-0123456789abcdef0123456789abcdef')).toBe(true);
        expect(runsOn('https://app.notion.com/p/Page-0123456789abcdef0123456789abcdef')).toBe(true);
        expect(runsOn('https://example.notion.site/Page-0123456789abcdef0123456789abcdef')).toBe(true);
    });

    it("stays off Notion's Calendar and Mail apps", () => {
        expect(runsOn('https://calendar.notion.so/')).toBe(false);
        expect(runsOn('https://calendar.notion.com/')).toBe(false);
        expect(runsOn('https://mail.notion.so/inbox')).toBe(false);
        expect(runsOn('https://mail.notion.com/inbox')).toBe(false);
    });
});
