import { h, render } from "preact";
import { useEffect } from "preact/hooks";
import "./css/popup.scss";
import { getElement, getLatestSettings } from "./js/utility";

function init() {
  getLatestSettings()
    .then((set) => {
      console.log("LatestSettings: ", set);

      const outlineEl = getElement(".outline");
      const helpBtnEl = getElement(".help-btn");
      let cls = set[outlineEl.getAttribute("data-func")] ? "enable" : "disable";
      outlineEl.classList.add(cls);
      cls = set[helpBtnEl.getAttribute("data-func")] ? "enable" : "disable";
      helpBtnEl.classList.add(cls);
      outlineEl.addEventListener("click", updateSettings);
      helpBtnEl.addEventListener("click", updateSettings);
      return null;
    })
    .catch((e) => console.log(e));
}

function updateSettings(el) {
  console.log("cb clicked: ");
  const func = el.currentTarget.getAttribute("data-func");
  console.log("updateSettings -> func", func);

  let isShow = false;
  const { classList } = el.currentTarget;
  if (classList.contains("enable")) {
    isShow = false;
    classList.remove("enable");
    classList.add("disable");
  } else if (classList.contains("disable")) {
    isShow = true;
    classList.remove("disable");
    classList.add("enable");
  }

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

function App() {
  useEffect(() => {
    init();
  }, []);

  return (
    <div className="wrapper">
      <div className="popup title">Notion Boost</div>
      <div className="settings table">
        <div className="row outline" data-func="displayOutline">
          <div style={{ flex: "1 1 0%" }}>
            <div className="name">Show Outline</div>
            <div className="desc">
              Show outline (table of contents) on the right side of opened
              document.
            </div>
          </div>
          <div
            className="button toggle"
            role="button"
            aria-disabled="false"
            tabIndex={0}
          >
            <div className="knob">
              <div className="pos" />
            </div>
          </div>
        </div>
        <div className="divider">
          <div className="border" />
        </div>
        <div className="row help-btn" data-func="hideHelpBtn">
          <div style={{ flex: "1 1 0%" }}>
            <div className="name">Hide Help button</div>
            <div className="desc">
              Hide floating help button on the bottom-right corner of document.
            </div>
          </div>
          <div
            className="button toggle"
            role="button"
            aria-disabled="false"
            tabIndex={0}
          >
            <div className="knob">
              <div className="pos" />
            </div>
          </div>
        </div>
        <div className="divider">
          <div className="border" />
        </div>
        <div style={{ marginTop: 4 }} className="footer">
          <a
            className="footer"
            href="https://www.notion.so/bef80feafec64c789e631c85a16f2d5b#c4d40cecfa654dadb67992b981a12aed"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="button" role="button" tabIndex={0}>
              Learn about mobile and desktop notifications
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

render(<App />, document.body);
