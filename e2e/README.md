# Tests

Notion changes its page markup without notice, which is what usually breaks features like the outline.
There are two kinds of tests:

| Command         | What it runs                                                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`     | Unit tests (`tests/`, Vitest + happy-dom): features on a fake Notion page, e.g. the outline with mocked page data. Fast, no network.         |
| `pnpm test:e2e` | Builds the extension and runs it in Chromium on live Notion pages (`e2e/`, Playwright). This is what notices when Notion changes its markup. |

## End-to-end tests

- `e2e/outline.spec.ts` uses a public Notion page, so it needs no login. Set `NOTION_PUBLIC_PAGE_URL` to use another page.
- `e2e/workspace.spec.ts` uses a long page in a Notion **test account**: it checks the outline on a page where
  Notion renders only some of the blocks, edits headings (and undoes the edits), checks wide tables and navigation,
  and that hovering a link to a sub-page doesn't switch the outline to it (skipped if the page has no sub-page).
  It's skipped until a login is saved:

  ```bash
  pnpm test:e2e:login
  ```

  This opens a browser window: log in to the test account (email login works best, Google may refuse an
  automated browser). The session is saved to `e2e/.auth/` (git-ignored, keep it private) and a test page is
  created in the account. To use an existing page instead, set `NOTION_TEST_PAGE_URL`.
  Run it again when the session expires. To keep the login outside the repo (e.g. when working in temporary
  git worktrees), set `NOTION_E2E_AUTH_DIR` for both commands.

- `e2e/scrollTopBtn.spec.ts` turns on the 'Scroll to top' button and checks it on the same test page, also after
  opening another page from the sidebar and coming back. It needs the saved login too. Specs turn features on with
  `setSettings()` from `e2e/fixtures.ts`.

Notes:

- `pnpm test:e2e` replaces the build in `build/chrome-mv3`. While `pnpm dev` is running, `pnpm exec playwright test`
  tests the dev build instead.
- Notion throttles bursts of page loads, so each spec opens its page once and runs its tests in order on it.
  If pages stop loading (empty Notion error page), wait a few minutes.
- Failure details (page snapshot) are in `test-results/`.
