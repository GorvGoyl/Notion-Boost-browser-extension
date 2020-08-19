import "../css/content.scss";
import defaultSet from "../js/settings";
import $c from "../lib/cash.min";
import {
  isEmpty,
  toElement,
  getDivByCls,
  getLatestSettings,
} from "../js/utility";
import { setOutline } from "../js/feature/outline";

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

function getChangedSettings() {
  var syncSet = {};
  var updatedSet = { ...defaultSet };
  chrome.storage.sync.get(["nb_settings"], function (result) {
    syncSet = result;

    // merge synced settings with default settings and then apply updated settings
    if (!isEmpty(syncSet)) {
      for (var k of Object.keys(defaultSet)) {
        if (!isEmpty(syncSet[k]) && syncSet[k] !== defaultSet[k]) {
          updatedSet[k] = syncSet[k];
        }
      }
    }
  });
}
function init() {
  var syncSet = {};
  var updatedSet = { ...defaultSet };
  chrome.storage.sync.get(["nb_settings"], function (result) {
    syncSet = result;

    // merge synced settings with default settings and then apply updated settings
    if (!isEmpty(syncSet)) {
      for (var k of Object.keys(defaultSet)) {
        if (!isEmpty(syncSet[k]) && syncSet[k] !== defaultSet[k]) {
          updatedSet[k] = syncSet[k];
        }
      }
    }
  });

  setOutline(updatedSet.outline);
}
init();

var Handler = {};

Handler = { setOutline };
chrome.storage.onChanged.addListener(function (changes, namespace) {
  console.log(changes);
  console.log(namespace);
  // setOutline(changes.nb_update.newValue.outline);
  var func = changes.nb_update.newValue.call_func;
  Handler[func.name](func.arg);
  //  chrome.storage.sync.set({ nb_update: obj }, function () {
  //   // Notify that we saved.
  //   // message("Settings saved");
  // });
  // for (var key in changes) {
  //   var storageChange = changes[key];
  //   console.log(
  //     'Storage key "%s" in namespace "%s" changed. ' +
  //       'Old value was "%s", new value is "%s".',
  //     key,
  //     namespace,
  //     storageChange.oldValue,
  //     storageChange.newValue
  //   );
  // }
});

$c(() => {
  console.log("dom ready");
});

$c(window).on("load", () => {
  console.log("window ready");
});
