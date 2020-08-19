import "../css/popup.scss";
import defaultSet from "../js/settings";
import {
  isEmpty,
  toElement,
  getDivByCls,
  getLatestSettings,
} from "../js/utility";

console.log("this is from popup: ");
console.log("sending msg to content: ");
// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   chrome.tabs.sendMessage(tabs[0].id, { outline: "off" }, function (response) {
//     console.log(response.msg);
//   });
// });

var latSet = {};
function init() {
  getLatestSettings().then((set) => {
    latSet = set;
    if (set.outline) {
      document.getElementById("myCheck").checked = true;
    } else {
      document.getElementById("myCheck").checked = false;
    }
  });
  document.querySelector(".myCheck").addEventListener("click", myFunction);
}
init();

function myFunction() {
  console.log("cb clicked: ");

  let value;
  // Get the checkbox
  var checkBox = document.getElementById("myCheck");
  // Get the output text

  // If the checkbox is checked, display the output text
  if (checkBox.checked == true) {
    value = true;

    //   console.log('enabling outline: ');
  } else {
    value = false;
  }

  getLatestSettings().then((set) => {
    set.setOutline = value;
    set.call_func = {
      name: "setOutline",
      arg: latSet.setOutline,
    };

    chrome.storage.sync.set({ nb_update: set }, function () {
      // Notify that we saved.
      // message("Settings saved");
    });
  });

  //   latSet.call_func = {
  //     name: "setOutline",
  //     arg: latSet.setOutline,
  //   };
}

// let tt = new Date().getTime();

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
