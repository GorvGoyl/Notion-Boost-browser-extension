// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//   // chrome.tabs.insertCSS(sender.tab.id, {
//   //   file: "css/content.css",
//   // });
//   if (message.type === "showPageAction") {
//     chrome.pageAction.show(sender.tab.id);
//   }
// });

function compareVer(previousVersion, currentVersion) {
  if (!previousVersion || !currentVersion) {
    return "some version is missing";
  }
  const [prevMajor, prevMinor = 0, prevPatch = 0] = previousVersion
    .split(".")
    .map(Number);
  const [curMajor, curMinor = 0, curPatch = 0] = currentVersion
    .split(".")
    .map(Number);

  if (curMajor > prevMajor) {
    return "major";
  }
  if (curMinor > prevMinor) {
    return "minor";
  }
  if (curPatch > prevPatch) {
    return "patch";
  }
  return "same or downgrade version";
}

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
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostContains: "notion.site" },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowAction()],
      },
    ]);
  });

  const currentVersion = chrome.runtime.getManifest().version;
  const { previousVersion } = details;
  const { reason } = details;

  console.log(`details: ${details}`);
  console.log(`Previous Version: ${previousVersion}`);
  console.log(`Current Version: ${currentVersion}`);
  const update = compareVer(previousVersion, currentVersion);

  if (process.env.NODE_ENV === "production") {
    switch (reason) {
      case "install":
        console.log("New User installed the extension.");
        chrome.tabs.create({ url: `https://gourav.io/notion-boost` });
        break;
      case "update":
        console.log("User has updated their extension.");
        // open 'whats new' page on major or minor update
        if (update === "major" || update === "minor") {
          chrome.tabs.create({
            url: `https://gourav.io/notion-boost/whats-new`,
          });
        }
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
