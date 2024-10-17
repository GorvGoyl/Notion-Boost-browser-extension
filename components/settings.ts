// settings and their default value
export const defaultSettings = {
    displayOutline: true,
    hideAiBtn: false,
    bolderTextInDark: false,
    smallText: false,
    fullWidth: false,
    hideComments: false,
    hideBacklinks: false,
    scrollTopBtn: false,
    hideSlashMenuAfterSpace: false,
    disableSlashMenu: false,
    leftAlignMedia: false,
    hideNotification: false,
    showHoverText: false,
    hideHiddenColumns: false,
    disablePopupOnURLPaste: false,
    addMoreHeightToPage: false,
    spellcheckForCode: false,
    codeLineNumbers: false,
    // step 1 of 2: add function name
    openFullPage: false,
    narrowListItems: false,
    indentationLines: false,
    rollupUrlClickable: false,
    borderOnImages: false,
    disableSlashCommandPlaceholder: false,
    disableAiAfterSpaceKey: false,
};

export const settingDetails = [
    {
        func: 'displayOutline',
        name: 'Show Outline',
        desc: 'Show sticky outline (table of contents) for pages that have headings',
    },
    {
        func: 'hideAiBtn',
        name: 'Hide AI button from pages',
        desc: 'Hide floating AI button (bottom-right corner) from pages',
    },
    {
        func: 'fullWidth',
        name: 'Full width for all pages',
        desc: 'Set full width for all pages by default',
    },
    {
        func: 'smallText',
        name: 'Small text for all pages',
        desc: 'Set small text for all pages by default',
    },
    {
        func: 'disableAiAfterSpaceKey',
        name: 'Disable AI menu when pressing space',
        desc: "Don't show AI command menu when pressing space key",
        disable_func: 'disableAiAfterSpaceKey',
    },
    {
        func: 'leftAlignMedia',
        name: 'Left align media',
        desc: 'Align document images and videos to the left instead of center',
    },

    {
        func: 'addMoreHeightToPage',
        name: 'Add more height to page',
        desc: 'Add more height to page by hiding top padding, image cover, & icon',
        pf: true,
    },
    {
        func: 'openFullPage',
        name: 'Open full page instead of preview',
        desc: 'Bypass preview and open full page of table, board, etc',
    },
    {
        func: 'rollupUrlClickable',
        name: 'Make Rollup URLs clickable',
        desc: 'Make URLs in Rollup property clickable',
    },
    {
        func: 'scrollTopBtn',
        name: "'Scroll to top' button",
        desc: 'Add button at bottom-right corner for scrolling back to top',
    },
    {
        func: 'hideSlashMenuAfterSpace',
        name: 'Close slash command menu after space',
        desc: "Close slash command popup menu '/' by pressing space key",
        disable_func: 'disableSlashMenu',
    },
    {
        func: 'disableSlashMenu',
        name: "Don't show slash command menu when pressing '/'",
        desc: "Don't show slash command popup menu when pressing '/'",
        disable_func: 'hideSlashMenuAfterSpace',
    },
    {
        func: 'disableSlashCommandPlaceholder',
        name: 'Hide slash command placeholder',
        desc: "Hide placeholder: Press '/' for commands…",
    },
    {
        func: 'showHoverText',
        name: 'Show full text on hover',
        desc: 'Show full text in table cells on mouse hover',
    },
    {
        func: 'codeLineNumbers',
        name: 'Show code line numbers',
        desc: 'Show line numbers for code blocks',
    },
    {
        func: 'spellcheckForCode',
        name: 'Enable spellcheck inside code blocks',
        desc: 'Show squiggly red lines for any spelling mistakes inside code blocks',
    },
    {
        func: 'disablePopupOnURLPaste',
        name: "Don't show popup menu when pasting external links",
        desc: "Don't show popup menu (i.e. dismiss, create bookmark, create embed) when pasting external URLs",
    },

    {
        func: 'hideNotification',
        name: 'Hide notification icon',
        desc: "Hide red notification icon from sidebar when it's in closed state and hide notification number from tab title",
    },
    {
        func: 'narrowListItems',
        name: 'Narrow spacing between items',
        desc: 'Fit more content on screen by reducing space between items i.e. headings, lists, etc.',
    },
    {
        func: 'indentationLines',
        name: 'Add indentation lines to lists',
        desc: 'Add vertical indentation lines to bullet and to-do lists',
    },
    {
        func: 'bolderTextInDark',
        name: 'Bolder text in dark mode',
        desc: 'Fix poorly recognizable bold text in dark mode',
    },
    {
        func: 'hideHiddenColumns',
        name: "Hide 'Hidden columns' in board view",
        desc: "Truly hide 'Hidden columns' in Kanban board view",
    },
    {
        func: 'hideComments',
        name: 'Hide comments section from all pages',
        desc: '',
    },
    {
        func: 'hideBacklinks',
        name: 'Hide backlinks section from all pages',
        desc: '',
    },
    {
        func: 'borderOnImages',
        name: 'Add frame to images',
        desc: 'Add frame around images to make them easily noticeable on page',
    },

    // step 2 of 2: add function name and description
];
