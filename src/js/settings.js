// settings and their default value
export const defaultSettings = {
  displayOutline: true,
  hideHelpBtn: false,
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

export const price = "$69";
export const nextPrice = "$99";
export const msgThanks = "Unlocked! Thank you for supporting developer :)";
export const msgLocked = `Please upgrade to use all 'pro' features. One-time payment of ${price} for lifetime access! Click to learn more.`;

export const settingDetails = [
  {
    func: "displayOutline",
    name: "Show Outline",
    desc: "Show sticky outline (table of contents) for pages that have headings",
    pf: false,
  },
  {
    func: "fullWidth",
    name: "Full width for all pages",
    desc: "Set full width for all pages by default",
    pf: false,
  },
  {
    func: "smallText",
    name: "Small text for all pages",
    desc: "Set small text for all pages by default",
    pf: false,
  },
  {
    func: "disableAiAfterSpaceKey",
    name: "Disable AI menu when pressing space",
    desc: "Don't show AI command menu when pressing space key",
    disable_func: "disableAiAfterSpaceKey",
    pf: false,
  },
  {
    func: "openFullPage",
    name: "Open full page instead of preview",
    desc: "Bypass preview and open full page of table, board, etc",
    pf: false,
  },
  {
    func: "rollupUrlClickable",
    name: "Make Rollup URLs clickable",
    desc: "Make URLs in Rollup property clickable",
    pf: true,
  },
  {
    func: "scrollTopBtn",
    name: "'Scroll to top' button",
    desc: "Add button at bottom-right corner for scrolling back to top",
    pf: false,
  },
  {
    func: "hideSlashMenuAfterSpace",
    name: "Close slash command menu after space",
    desc: "Close slash command popup menu '/' by pressing space key",
    disable_func: "disableSlashMenu",
    pf: false,
  },
  {
    func: "disableSlashMenu",
    name: "Don't show slash command menu when pressing '/'",
    desc: "Don't show slash command popup menu when pressing '/'",
    disable_func: "hideSlashMenuAfterSpace",
    pf: false,
  },
  {
    func: "showHoverText",
    name: "Show full text on hover",
    desc: "Show full text in table cells on mouse hover",
    pf: false,
  },
  {
    func: "codeLineNumbers",
    name: "Show code line numbers",
    desc: "Show line numbers for code blocks",
    pf: false,
  },
  {
    func: "spellcheckForCode",
    name: "Enable spellcheck inside code blocks",
    desc: "Show squiggly red lines for any spelling mistakes inside code blocks",
    pf: false,
  },
  {
    func: "disablePopupOnURLPaste",
    name: "Don't show popup menu when pasting external links",
    desc: "Don't show popup menu (i.e. dismiss, create bookmark, create embed) when pasting external URLs",
    pf: false,
  },
  {
    func: "leftAlignMedia",
    name: "Left align media",
    desc: "Align document images and videos to the left instead of center",
    pf: false,
  },

  {
    func: "addMoreHeightToPage",
    name: "Add more height to page",
    desc: "Add more height to page by hiding top padding, image cover, & icon",
    pf: true,
  },
  {
    func: "hideNotification",
    name: "Hide notification icon",
    desc: "Hide red notification icon from sidebar when it's in closed state and hide notification number from tab title",
    pf: true,
  },
  {
    func: "hideHelpBtn",
    name: "Hide Help button from pages",
    desc: "",
    pf: false,
  },
  {
    func: "hideAiBtn",
    name: "Hide AI Assistant Q&A button from pages",
    desc: "",
    pf: false,
  },
  {
    func: "narrowListItems",
    name: "Narrow spacing between items",
    desc: "Fit more content on screen by reducing space between items i.e. headings, lists, etc.",
    pf: true,
  },
  {
    func: "indentationLines",
    name: "Add indentation lines to lists",
    desc: "Add vertical indentation lines to bullet and to-do lists",
    pf: false,
  },
  {
    func: "bolderTextInDark",
    name: "Bolder text in dark mode",
    desc: "Fix poorly recognizable bold text in dark mode",
    pf: false,
  },
  {
    func: "hideHiddenColumns",
    name: "Hide 'Hidden columns' in board view",
    desc: "Truly hide 'Hidden columns' in Kanban board view",
    pf: false,
  },

  {
    func: "hideComments",
    name: "Hide comments section from all pages",
    desc: "",
    pf: false,
  },
  {
    func: "hideBacklinks",
    name: "Hide backlinks section from all pages",
    desc: "",
    pf: false,
  },
  {
    func: "borderOnImages",
    name: "Add frame to images",
    desc: "Add frame around images to make them easily noticeable on page",
    pf: true,
  },

  {
    func: "disableSlashCommandPlaceholder",
    name: "Hide slash command placeholder",
    desc: "Hide placeholder: Press '/' for commands…",
    pf: true,
  },

  // step 2 of 2: add function name and description
];
