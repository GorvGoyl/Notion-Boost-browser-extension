![Notion Boost](./src/images/readme/header.jpg)

# Notion Boost browser extension

> Browser extension to add features like sticky outline (table of contents), small text & full width by default,scroll to top button, hide slash command menu, hide help button, bolder text and more to Notion.so website.

## 🏠 [Homepage](https://gourav.io/notion-boost)

## ⬇ Download

- [Chrome extension](https://chrome.google.com/webstore/detail/notion-boost/eciepnnimnjaojlkcpdpcgbfkpcagahd)
- [Firefox addon](https://addons.mozilla.org/en-US/firefox/addon/notion-boost/)

## ✅ Currently added features

- Show sticky outline
- Set small text & full width for all pages
- 'Scroll to top' button
- Show full text on hover
- Close Slash command menu after space
- Don't show Slash command menu when pressing '/'
- Hide floating help button from all pages
- Hide 'Hidden columns' in board view
- Left align images
- Bolder text in dark mode
- Hide comments section from all pages

- ❓ Missing some feature? Create [new issue](https://github.com/GorvGoyl/Notion-Boost-browser-extension/issues/new)

### See [detailed info and GIF](https://gourav.io/notion-boost#-currently-added-features) of these features.

## ⚙ How to enable/disable a feature

1. visit any notion page
2. click on the extension icon (clickable only when you are on a notion page)
3. a popup menu will appear, you can toggle features from there.
4.

---

#### ❤ Support continuous development [Buy me a Coffee](https://ko-fi.com/gorvgoyl)

<p align="center">
  <a href="https://ko-fi.com/gorvgoyl">
  <img src="./src/images/readme/bmc.png" width="200" alt="Buy me a Coffee"/>
  </a>
</p>

#### 👍 Liked this extension? express your love by rating [★★★★★](https://chrome.google.com/webstore/detail/notion-boost/eciepnnimnjaojlkcpdpcgbfkpcagahd) on chrome/firefox store.

#### ✨ Follow [@NotionBoost](https://twitter.com/intent/follow?user_id=1312809481240154112) on Twitter for upcoming features and other Notion tips.

#### 👨‍💻 Follow the maker [@GorvGoyl](https://twitter.com/intent/follow?user_id=325435736) behind this extension.

---

---

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

#### Run for Chrome

- `npm run start:ch`
- visit _chrome://extensions/_
- load unpacked extension from folder `\build_chrome`

#### Run for Firefox

- `npm run start:ff`
- visit _about:debugging#/runtime/this-firefox_
- load temp add-on from folder `\build_firefox`

Do your thing in `/src` folder
Raise PR if you would like to contribute something

For rather curious devs:

- Webpack HMR (webpack-extension-reloader) is being used so any changes made to js files will auto reload both extension and browser page to see latest changes.
- To understand run and build process in depth see plugins used in `webpack.config.js`

### Build (for production)

#### Build for Chrome

- `npm run build:ch`
- Output & zip will be in `/build_chrome` folder
- submit extension zip to https://chrome.google.com/webstore/devconsole

#### Build for Firefox

- `npm run build:ff`
- Output, zip, source code zip will be in `/build_firefox` folder
- submit extension zip https://addons.mozilla.org/en-US/developers/addon/notion-boost/versions/submit/
- submit source code zip
