# Full page table

- notion-app-inner notion-light-theme
  - notion-cursor-listener
    - notion-sidebar-container
      - notion-frame
        - notion-scroller vertical horizontal
          - notion-scroller
            - notion-board-view
              - notion-selectable notion-collection_view_page-block

# new cell in full page table

- notion-app-inner notion-light-theme
  - notion-overlay-container notion-default-overlay-container
    - notion-peek-renderer
      - notion-scroller vertical
        - `notion-page-content`
          - notion-selectable notion-page-block

# Doc

- notion-app-inner notion-light-theme
  - notion-cursor-listener
    - notion-sidebar-container
      - notion-frame
        - notion-scroller vertical horizontal
          - `notion-page-content`
            - blocks
