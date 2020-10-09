# Notion-Boost-browser-extension

> Browser extension to add features like outline (table of contents), bolder text, and more to Notion.so website.

**Download**

- [Chrome extension](https://chrome.google.com/webstore/detail/notion-boost/eciepnnimnjaojlkcpdpcgbfkpcagahd)
- [Firefox extension](https://addons.mozilla.org/en-US/firefox/addon/notion-boost/)

**Add extra features to Notion:**

- Show outline (table of contents) for pages that have headings or sub-headings.
- Hide floating help button on the bottom-right corner of the document.
- Make bold text bolder when using Notion in dark mode.
- More features on the way :)

**How to enable/disable a feature:**

1. visit any notion page
2. click on the extension icon (clickable only when you are on a notion page)
3. a popup menu will appear, you can toggle features here.

This is a free and open-source browser extension.

- If you found this extension useful then please support it by rating ★★★★★ on chrome/firefox store.
- Follow [@NotionBoost](https://twitter.com/notionboost) on Twitter

## Contribution Guide

This extension uses webpack for module bundling and various other optimizations, ESLint for linting, Prettier for code formatting, and, VSCode for coding <3.  
If you're new to browser extensions, here's an official guide from chrome https://developer.chrome.com/extensions/getstarted

### Structure

`/src/content.js` - page DOM manipulation is done here.
`/src/popup.js` - Javascript related to extension popup

> File an issue if you're not able to setup or run

### Setup

`npm install`

### Run & Debug (for development)

- Run for Chrome

`npm run start:ch`

- Run for Firefox

`npm run start:ff`

Do your thing in `/src` folder
Raise PR if you would like to contribute something

For rather curious devs:

- Webpack HMR (webpack-extension-reloader) is being used so any changes made to js files will auto reload both extension and browser page to see latest changes.
- To understand run and build process in depth see plugins used in `webpack.config.js`

### Build (for production)

- Build for Chrome

`npm run build:ch`

Output will be in `/build_chrome` folder

- Build for Firefox

`npm run build:ff`

Output will be in `/build_firefox` folder
