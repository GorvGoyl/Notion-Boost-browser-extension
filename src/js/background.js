// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//   // chrome.tabs.insertCSS(sender.tab.id, {
//   //   file: "css/content.css",
//   // });
//   if (message.type === "showPageAction") {
//     chrome.pageAction.show(sender.tab.id);
//   }
// });
import ExtPay from "./extPay";
// import * as ExtPay from "extpay";

const extpay = ExtPay("notion-boost");

chrome.runtime.onInstalled.addListener((details) => {
  // chrome.storage.sync.set({ color: "#3aa757" }, function () {
  //   console.log("The color is green.");
  // });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostContains: "notion.so" },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });

  const currentVersion = chrome.runtime.getManifest().version;
  const { previousVersion } = details;
  const { reason } = details;

  console.log(`details: ${details}`);
  console.log(`Previous Version: ${previousVersion}`);
  console.log(`Current Version: ${currentVersion}`);
  if (process.env.NODE_ENV === "production") {
    switch (reason) {
      case "install":
        console.log("New User installed the extension.");
        chrome.tabs.create({ url: `https://gourav.io/notion-boost` });
        break;
      case "update":
        console.log("User has updated their extension.");
        chrome.tabs.create({ url: `https://gourav.io/notion-boost/whats-new` });
        break;
      case "chrome_update":
      case "shared_module_update":
      default:
        console.log("Other install events within the browser");
        break;
    }
  }
});

// chrome.runtime.onInstalled.addListener(() => {});
