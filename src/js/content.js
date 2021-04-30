import "../css/content.scss";
import { defaultSettings } from "./settings";
import { isEmpty, getLatestSettings } from "./utility";
import { displayOutline } from "./feature/outline";
import { scrollTopBtn } from "./feature/scrollToTopBtn";
import { codeLineNumbers } from "./feature/codeLineNumbers";
import { spellcheckForCode } from "./feature/spellcheckForCode.js";
import * as features from "./feature/pageElements";

let featureList = {};

featureList = features;
featureList.displayOutline = displayOutline;
featureList.scrollTopBtn = scrollTopBtn;
featureList.codeLineNumbers = codeLineNumbers;
featureList.spellcheckForCode = spellcheckForCode;
function init() {
  let syncSet = {};
  const updatedSet = { ...defaultSettings };

  getLatestSettings()
    .then((set) => {
      console.log("LatestSettings: ", set);

      console.log("enabling features...");
      // on page load, execute only enabled features
      for (const func of Object.keys(set)) {
        const isEnabled = set[func];
        if (isEnabled) {
          featureList[func](isEnabled);
        }
      }
      return null;
    })
    .catch((e) => console.log(e));

  chrome.storage.sync.get(["nb_settings"], (result) => {
    syncSet = result;

    // merge synced settings with default settings and then apply updated settings
    if (!isEmpty(syncSet)) {
      for (const k of Object.keys(defaultSettings)) {
        if (!isEmpty(syncSet[k]) && syncSet[k] !== defaultSettings[k]) {
          updatedSet[k] = syncSet[k];
        }
      }
    }
  });
}

init();

chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log(changes);
  console.log(namespace);
  const func = changes.nb_settings.newValue.call_func;
  featureList[func.name](func.arg);
});

if (document.readyState !== "loading") {
  console.log("document is already ready");
} else {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("document was not ready");
  });
}

window.onload = () => {
  // same as window.addEventListener('load', (event) => {
  console.log("window is ready");
};

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   console.log(
//     sender.tab
//       ? "from a content script:" + sender.tab.url
//       : "from the extension"
//   );
//   if (request.outline == "off") {
//     console.log("turning off outline: ");
//     sendResponse({ msg: "outline is off" });
//   } else {
//     console.log("turning on outline: ");
//     sendResponse({ msg: "outline is on" });
//   }
// });
