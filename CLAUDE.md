# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Notion Boost is a browser extension (Chrome MV3 and Firefox) that adds 20+ toggleable tweaks to the Notion web app on notion.so, notion.site and notion.com: a sticky outline, full width and small text by default, a scroll-to-top button and more. It's built with [WXT](https://wxt.dev) 0.21, TypeScript, SCSS and React (popup only), using pnpm.

## Commands

```bash
pnpm install       # also runs `wxt prepare`, which generates .wxt/ (read by tsconfig.json and eslint.config.js); run it in every fresh worktree and after dependency changes
pnpm dev           # watch build into build/chrome-mv3; it opens no browser (web-ext.config.ts), so load that folder unpacked
pnpm dev:firefox   # the same for Firefox, as MV2 in build/firefox-mv2 (the Firefox zip from `pnpm package` is MV3)
pnpm build         # production build, into the same build/chrome-mv3
pnpm compile       # type check (tsc --noEmit)
pnpm lint          # ESLint (eslint.config.js); it doesn't check formatting
pnpm test          # unit tests: Vitest + happy-dom, tests/**/*.test.ts, about 10 s
pnpm test tests/outlineData.test.ts -t pageIdFromPath   # one file, only the tests whose name matches
pnpm test:e2e      # builds, then runs the extension in Playwright's Chromium on live Notion pages (e2e/)
pnpm exec playwright test e2e/outline.spec.ts           # one spec against the current build, without rebuilding
pnpm package       # store zips for Chrome and Firefox (plus a source zip for Firefox's review), written to build/
```

- There's no CI: `pnpm compile`, `pnpm lint` and `pnpm test` are the checks to run.
- Prettier settings are in `prettier.config.cjs` (4 spaces, single quotes, 120 columns), with no script: run `pnpm exec prettier --write` on the files you change, never on the whole repo. `pnpm exec prettier --check .` lists the files that aren't formatted yet (e.g. `components/utils.ts`, still indented with 2 spaces, and `pnpm-lock.yaml`); don't reformat them in unrelated changes.
- `pnpm dev` may log "Failed to run dependency scan … Cannot resolve entry module build/chrome-mv3/popup.html": Vite scans the previous build's HTML. It's harmless: the extension still builds.

## How a feature is wired

A feature is a function named exactly like its setting key, taking one boolean: `true` turns it on, `false` has to undo everything it did (classes, listeners, observers, added elements), because the popup turns features on and off in open tabs without a reload. Turning it on twice mustn't add anything twice. A new feature uses that name in four places (look for the `step 1 of 2` / `step 2 of 2` comments):

1. `defaultSettings` in `components/settings.ts`: the key and its default.
2. `settingDetails` in the same file: its name and description in the popup, which lists the features in this order.
3. The function itself, in `components/features/`.
4. `featureList` in `entrypoints/content.ts`. Everything `pageElements.ts` exports is added by `import * as`; functions from other files are added one by one. A key of `defaultSettings` that's missing here throws when its setting is on, and the features after it never start.

Settings are kept in `browser.storage.sync` under a single key, `nb_settings`; `getLatestSettings()` (`components/utils.ts`) lays the saved values over `defaultSettings`. On page load the content script calls each enabled feature with `true`. When a toggle is clicked, the popup (`components/SettingsTable.tsx`) saves `nb_settings` with an extra `call_func: { name, arg }`, and the content script's `storage.onChanged` listener runs `featureList[name](arg)` in every open Notion tab. There's no background script and no messaging.

- `disable_func` in `settingDetails` names a conflicting feature. Turning a feature on only switches the other one's saved value off; the other function isn't called, so the feature being turned on has to undo the other's effect itself (as `disableSlashMenu` does).
- `storage.sync` carries the settings to the user's other browsers, which may run an older version of the extension: a renamed or removed key can still arrive from them.

## Working with Notion's page

- Notion's class names and inline styles aren't a public API and change without notice, which is what usually breaks features. `HELP.md` has notes on Notion's DOM (page structure, light and dark theme classes, table widths); its "Add new Feature" and "Run in Firefox" sections predate WXT, so follow this file instead.
- Most features in `pageElements.ts` are CSS only: they wait for `#notion-app` with `onElementLoaded()` and add or remove a class on it, usually named after the setting (`fullWidth`, `smallText`, …). Their rules are in `styles/content.scss`, nested under that class. For colors that differ between Notion's light and dark themes, use the `themify` mixin and `themed()` from `styles/theme.scss`.
- Notion is a single-page app: opening another page replaces the page's scroller and content without a reload. A feature holding on to elements of the page has to attach again after navigation, through `pageChangeListener()` in `components/utils.ts` (as `scrollToTopBtn.ts` does), or observe an element that stays, such as `.notion-app-inner`.

## Outline

The outline (`components/features/outline.ts`) is the largest feature. Notion only renders the blocks near the viewport, so the outline can't read the headings from the page: it loads the page's blocks from Notion's internal `POST /api/v3/loadPageChunk` (same origin, the user's cookies, about 100 blocks per request), gets the headings with the pure functions in `outlineData.ts`, then follows the rendered blocks with a MutationObserver. Edited heading text shows at once; an added or deleted heading makes it load the page data again. It checks for navigation every 500 ms, and when the page data can't be loaded it lists only the rendered headings. `content.scss` expects `.nb-outline` right before `.notion-scroller.vertical`, and `outline.ts` sets `--nb-scroller-width` so wide tables fit next to the outline.

## Tests

- Unit tests build fake Notion pages with `tests/notion.ts`: `pageData()` for the API's block records, `renderNotionPage()` for the page as Notion renders it, and `mockPageDataApi()` to stub `fetch`. Features keep their state in module variables, so the tests call `vi.resetModules()` and import the feature again for each test. happy-dom has no layout: `scrollToTopBtn.test.ts` shows how to fake a scrollable page.
- E2E tests (`e2e/`, see `e2e/README.md`) load `build/chrome-mv3` into Chromium. `outline.spec.ts` uses a public page and needs no login. `workspace.spec.ts` (which edits a page and undoes the edits) and `scrollTopBtn.spec.ts` use a page in a Notion test account; they're skipped until `pnpm test:e2e:login` has saved a login, which a person has to enter in the browser window it opens. The login goes to `e2e/.auth/` (git-ignored); set `NOTION_E2E_AUTH_DIR` for both commands to keep it outside the repo, e.g. for worktrees. Specs turn features on with `setSettings()` from `e2e/fixtures.ts`, before opening a Notion page.
- Notion throttles page loads, which is why there's one worker. If pages come up empty or show a Cloudflare check, stop loading Notion pages for about ten minutes.

## WXT

- Auto-imports: `browser`, `defineContentScript`, the React hooks and the exports of the files directly in `components/` (`settings.ts`, `utils.ts`, `SettingsTable.tsx`) are globals, so some files use them without an import (full list in `.wxt/types/imports.d.ts`). Files in `components/features/` aren't auto-imported.
- `@/` is the repo root.
- The manifest is defined in `wxt.config.ts` (`baseManifest`, plus a Gecko id for Firefox). The extension's version is `baseManifest.version`; `package.json`'s version isn't used. A release bumps it in a `release: x.y.z` commit; uploading the `pnpm package` zips to the stores isn't scripted.
