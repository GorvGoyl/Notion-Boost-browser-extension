import { h, render, Fragment } from "preact";
import { useEffect } from "preact/hooks";
import "./css/popup.scss";
import { getElement, getElements, getLatestSettings } from "./js/utility";

const settings = [
  {
    func: "displayOutline",
    name: "Show Outline",
    desc:
      "Show outline (table of contents) on the right side of opened document.",
  },
  {
    func: "hideHelpBtn",
    name: "Hide Help button",
    desc: "Hide floating help button on the bottom-right corner of document.",
  },
  {
    func: "bolderTextInDark",
    name: "Bolder text in dark mode",
    desc:
      "Bold text isn't properly recognizable in dark mode, this fixes that.",
  },
];
function init() {
  // set buttons state
  getLatestSettings()
    .then((set) => {
      console.log("LatestSettings: ", set);

      const rows = getElements(".row");
      rows.forEach((e) => {
        const cls = set[e.getAttribute("data-func")] ? "enable" : "disable";
        e.classList.add(cls);
      });

      return null;
    })
    .catch((e) => console.log(e));
}

function updateSettings(el) {
  console.log("cb clicked: ");
  const func = el.currentTarget.getAttribute("data-func");
  console.log("updateSettings -> func", func);

  let isEnabled = false;
  const { classList } = el.currentTarget;
  if (classList.contains("enable")) {
    isEnabled = false;
    classList.remove("enable");
    classList.add("disable");
  } else if (classList.contains("disable")) {
    isEnabled = true;
    classList.remove("disable");
    classList.add("enable");
  }

  console.log("updateSettings -> isEnabled", isEnabled);

  getLatestSettings()
    .then((set) => {
      console.log("updateSettings -> set", set);
      set[func] = isEnabled;
      set.call_func = {
        name: func,
        arg: isEnabled,
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
        {settings.map((obj, index) => (
          <Fragment>
            <div className="row" data-func={obj.func} onClick={updateSettings}>
              <div style={{ flex: "1 1 0%" }}>
                {obj}
                <div className="name">{obj.name}</div>
                <div className="desc">{obj.desc}</div>
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
          </Fragment>
        ))}

        {/* <div style={{ marginTop: 4 }} className="footer">
          <a
            className="footer"
            href="https://www.notion.so"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="button" style="" role="button" tabIndex={0}>
              Learn about mobile and desktop notifications
            </div>
          </a>
        </div> */}
      </div>
    </div>
  );
}

render(<App />, document.body);
