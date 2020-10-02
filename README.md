# Notion-Boost-browser-extension

## Contribution Guide

This extension uses webpack for module bundling and various other optimizations, ESLint for linting, Prettier for code formatting, and, VSCode for coding <3.  
If you're new to browser extensions, here's an official guide from chrome https://developer.chrome.com/extensions/getstarted

### Structure

- `/src/content.js` - page DOM manipulation is done here.
- `/src/popup.js` - Javascript related to extension popup

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
