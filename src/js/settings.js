// settings and their default value
export const defaultSettings = {
  displayOutline: true,
  hideHelpBtn: false,
  bolderTextInDark: false,
  smallText: false,
  fullWidth: false,
  hideComments: false,
  hideBacklinks: false,
  scrollTopBtn: false,
  hideSlashMenuAfterSpace: false,
  disableSlashMenu: false,
  leftAlignImage: false,
  hideNotification: false,
  showHoverText: false,
  hideHiddenColumns: false,
  disablePopupOnURLPaste: false,
  addMoreHeightToPage: false,
  spellcheckForCode: false,
  codeLineNumbers: false,
  // step 1 of 2: add function name
  openFullPage: false,
};

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
    func: "openFullPage",
    name: "Open full page instead of preview",
    desc: "Bypass preview and open full page of table, board, etc",
    pf: false,
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
    desc: "Don't show popup menu i.e (dismiss, create bookmark, create embed) when pasting external links",
    pf: false,
  },
  {
    func: "leftAlignImage",
    name: "Left align images",
    desc: "Align document images to left instead of center",
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

  // step 2 of 2: add function name and description
];
