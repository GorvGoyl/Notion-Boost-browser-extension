import { h, render, Fragment } from "preact";
import { Router, route } from "preact-router";
import { useEffect } from "preact/hooks";
import { About } from "./About";
import "./css/popup.scss";
import { getElement, getElements, getLatestSettings } from "./js/utility";
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
// enable/disable function
function setFuncState(funcName, state) {
  const promise = new Promise((resolve, reject) => {
    try {
      console.log(`${funcName} setting to ${state}`);

      const btn = getElement(`[data-func=${funcName}]`);
      toggleBtnUI(btn);

      getLatestSettings()
        .then((set) => {
          console.log("getLatestSettings ->", set);
          set[funcName] = state;
          set.call_func = {
            name: funcName,
            arg: state,
          };

          chrome.storage.sync.set({ nb_settings: set }, () => {
            console.log(`${funcName} set to ${state}`);
            resolve();
          });
          return null;
        })
        .catch((e) => console.log(e));
    } catch (e) {
      console.log(e);
      reject(Error("some issue... promise rejected"));
    }
  });
  return promise;
}

function toggleBtnUI(el) {
  if (el.classList.contains("enable")) {
    el.classList.remove("enable");
    el.classList.add("disable");
  } else if (el.classList.contains("disable")) {
    el.classList.remove("disable");
    el.classList.add("enable");
  }
}

function isFuncEnabled(func) {
  const btnToDisable = getElement(`[data-func=${func}]`);

  if (btnToDisable.classList.contains("enable")) {
    return true;
  }
  return false;
}
function updateSettings(ev) {
  console.log("clicked: ");
  const func = ev.currentTarget.getAttribute("data-func");
  const btnEl = getElement(`[data-func=${func}]`);
  const funcToDisable = btnEl.getAttribute("data-disable_func");

  console.log("updateSettings -> func", func);
  console.log("updateSettings -> disableFunc", funcToDisable);

  let toEnable = false;
  const { classList } = btnEl;

  if (classList.contains("enable")) {
    toEnable = false;
  } else if (classList.contains("disable")) {
    toEnable = true;
  }

  // disable other related func if both are enabled
  if (funcToDisable && isFuncEnabled(funcToDisable) && toEnable) {
    setFuncState(funcToDisable, false)
      .then(() => {
        setFuncState(func, toEnable);
        return null;
      })
      .catch((e) => console.log(e));
  } else {
    setFuncState(func, toEnable);
  }
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
                data-disable_func={obj.disable_func}
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
