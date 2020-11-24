import { h, render, Fragment } from "preact";
import { Router, route } from "preact-router";
import { useEffect } from "preact/hooks";
import { About } from "./About";
import "./css/popup.scss";
import { getElements, getLatestSettings } from "./js/utility";
import { settingDetails } from "./js/settings";

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

// Build popup settings
function Home() {
  useEffect(() => {
    init();
  }, []);

  return (
    <div>
      <div className="wrapper">
        <div className="title underline">Notion Boost</div>
        <div className="settings table">
          {settingDetails.map((obj, index) => (
            <Fragment>
              <div
                className="row"
                data-func={obj.func}
                onClick={updateSettings}
              >
                <div className="text-wrapper">
                  {obj}
                  <div className="name">{obj.name}</div>
                  {obj.desc && <div className="desc">{obj.desc}</div>}
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
              {index === settingDetails.length - 1 ? (
                <div className="divider last" />
              ) : (
                <div className="divider">
                  <div className="border" />
                </div>
              )}
              {/* <div className="divider">
                {index !== settings.length - 1 && <div className="border" />}
              </div> */}
            </Fragment>
          ))}
        </div>
        <div className="footer topline">
          <a className="footer-item" href="/about">
            <div className="button" style="" role="button" tabIndex={0}>
              About
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
function App() {
  return (
    <Router>
      <Home path="/" default />
      <About path="/about" />
    </Router>
  );
}

render(<App />, document.body);
