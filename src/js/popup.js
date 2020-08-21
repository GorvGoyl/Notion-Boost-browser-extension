import "../css/popup.scss";
import { isEmpty, toElement, getElement, getLatestSettings } from "./utility";

console.log("this is from popup: ");
console.log("sending msg to content: ");
// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   chrome.tabs.sendMessage(tabs[0].id, { outline: "off" }, function (response) {
//     console.log(response.msg);
//   });
// });

function init() {
  getLatestSettings()
    .then((set) => {
      console.log("LatestSettings: ", set);

      const outlineEl = getElement(".outline");
      const helpBtnEl = getElement(".help-btn");
      outlineEl.checked = set[outlineEl.getAttribute("data-func")];
      helpBtnEl.checked = set[helpBtnEl.getAttribute("data-func")];

      outlineEl.addEventListener("click", updateSettings);
      helpBtnEl.addEventListener("click", updateSettings);
      return null;
    })
    .catch((e) => console.log(e));
}
init();

function updateSettings(el) {
  console.log("cb clicked: ");

  const func = el.target.getAttribute("data-func");
  console.log("updateSettings -> func", func);

  const isShow = el.target.checked;
  console.log("updateSettings -> isShow", isShow);

  getLatestSettings()
    .then((set) => {
      console.log("updateSettings -> set", set);
      set[func] = isShow;
      set.call_func = {
        name: func,
        arg: isShow,
      };

      chrome.storage.sync.set({ nb_settings: set }, () => {
        // Notify that we saved.
        // message("Settings saved");
      });
      return null;
    })
    .catch((e) => console.log(e));
}

// let obj = {
//   outline: {
//     width: 200,
//     hight: 500,
//     value: "on",
//   },
//   fab: "off",
//   time: 1,
//   def: "def",
// };
// setTimeout(function () {
//   console.log("saving: ");
//   obj.time = new Date().getTime();
//   obj.outline.hight = new Date().getTime();
//   chrome.storage.sync.set({ nb_settings: obj }, function () {
//     // Notify that we saved.
//     // message("Settings saved");
//   });
// }, 3000);
