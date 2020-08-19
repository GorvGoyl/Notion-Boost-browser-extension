// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//   // chrome.tabs.insertCSS(sender.tab.id, {
//   //   file: "css/content.css",
//   // });
//   if (message.type === "showPageAction") {
//     chrome.pageAction.show(sender.tab.id);
//   }
// });

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ color: "#3aa757" }, function () {
    console.log("The color is green.");
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
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
});
