import defaultSet from "../js/settings";

// create html node from string like $('div')
export function toElement(
  s = "",
  c,
  t = document.createElement("template"),
  l = "length"
) {
  t.innerHTML = s.trim();
  c = [...t.content.childNodes];
  return c[l] > 1 ? c : c[0] || "";
}

export function getDivByCls(cls) {
  return document.querySelector(cls);
}
// ugly method to check for empty
export function isEmpty(obj) {
  // boolean like false = non-empty
  if (obj === false || obj === true) return false;

  // empty string, null is empty
  if (!obj) return true;

  // empty object = empty
  if (Object.keys(obj).length == 0) return true;
  return false;
}

// 1. get from default settings 2. update it with saved settings 3. return
export function getLatestSettings() {
  const promise = new Promise((resolve, reject) => {
    try {
      var latestSet = { ...defaultSet };
      chrome.storage.sync.get(["nb_settings"], function (savedSet) {
        if (!isEmpty(savedSet)) {
          for (var k of Object.keys(defaultSet)) {
            if (!isEmpty(savedSet[k])) {
              latestSet[k] = savedSet[k];
            }
          }
        }
        resolve(latestSet);
      });
    } catch (e) {
      console.log(e);
      reject(Error("some issue... promise rejected"));
    }
  });
  return promise;
}
