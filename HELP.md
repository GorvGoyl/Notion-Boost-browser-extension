# Add new Feature

- add feature info to `src\js\settings.js`
- add code to relevant file in `src\js\feature\` like `pageElements.js`
- add CSS if any to `src\css\content.scss`
- Add feature info to [`CHANGELOG.md`](./CHANGELOG.md)

---

# Doc HTML Structure

- notion-body
  - #notion-app
    - notion-app-inner notion-light-theme
      - notion-cursor-listener _resets when dragging some bullet point_
        - notion-sidebar-container
          - notion-frame _stays on doc change_
            - notion-scroller vertical horizontal _resets_
              - `notion-page-content`
                - blocks
      - notion-overlay-container notion-default-overlay-container (_stays_)
        - notion-peek-renderer
      - notion-overlay-container

# Run in FF

- run command from package.json
- open url in firefox
  - about:debugging#/runtime/this-firefox
    - pick manifest.json from folder `build_firefox`

# Theme

## Dark

- notion-body dark
  - notion-app
    - notion-app-inner notion-dark-theme

## Light

- notion-body
  - notion-app
    - notion-app-inner notion-light-theme

---

# Tables

## Full page table

- notion-app-inner notion-light-theme
  - notion-cursor-listener
    - notion-sidebar-container
      - notion-frame
        - notion-scroller vertical horizontal
          - notion-scroller
            - notion-board-view
              - notion-selectable notion-collection_view_page-block

### new cell in full page table

- notion-app-inner notion-light-theme
  - notion-overlay-container notion-default-overlay-container
    - notion-peek-renderer
      - notion-scroller vertical
        - `notion-page-content`
          - notion-selectable notion-page-block
          -

## Width - half

- notion-scroller vertical horizontal
  - div
    - div (width: 900px)
  - div
    - div (width: 900px)
  - notion-page-content (width: 900px)
  - table

## Width - Full

- notion-scroller vertical horizontal
  - div
    - div (width: 100%;)
  - div
    - div (width: 100%;)
  - notion-page-content (width: 100%)
  - table

## Font

- notion-selectable notion-page-block (32px / 40px)
- notion-page-content (14px / 16px)
-

## Inline Tables

### Not Full width inline

- notion-page-content (width: 900px;) -diff
  - notion-selectable notion-collection_view-block (width: 1263px;) (full page horz scrollbar) -dynamic
    - div (padding-left: 277.5px;padding-right: 277.5px;) -diff
    - notion-scroller horizontal
      - notion-table-view (padding-left: 277.5px;padding-right: 277.5px;) / notion-board-view -diff
        - notion-selectable notion-collection_view-block
          - div (min-width: 708px;) -diff

### Full width inline

- notion-page-content (width: 100%;) -diff
  - notion-selectable notion-collection_view-block (width: 1263px;) (full page horz scrollbar) -dynamic
    - div (padding-left: 96px;padding-right: 96px;) -diff
    - notion-scroller horizontal
      - notion-table-view (padding-left: 96px;padding-right: 96px;) / notion-board-view -diff
        - notion-selectable notion-collection_view-block
          - div (min-width: calc(100% - 192px);) -diff
