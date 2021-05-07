import { h, render, Fragment } from "preact";
import { Router, route } from "preact-router";
import { useEffect, useState } from "preact/hooks";
// import * as ExtPay from "extpay";
import ExtPay from "./js/extPay";
import { About } from "./About";
import { Payment } from "./Payment";
import "./css/popup.scss";
import { getElement, getElements, getLatestSettings } from "./js/utility";
import { settingDetails } from "./js/settings";

const extpay = ExtPay("notion-boost");

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

export function showPaymentPage() {
  try {
    extpay.openPaymentPage();
  } catch (e) {
    console.log(`Error: ${JSON.stringify(e)}`);
  }
}

// Build popup settings
function Home() {
  const [isPaid, setPaidHook] = useState(false);
  useEffect(() => {
    init();

    // listener
    extpay.onPaid.addListener((user) => {
      setPayment(true);
      route("/popup", true);
      console.log("user paid!");
    });
  }, []);

  const msgThanks = "Unlocked! Thank you for supporting developer :)";
  const msgLocked =
    "Please upgrade to use 'pro' features. One-time payment of $5 for lifetime access! Click to learn more.";

  // runs at init
  extpay
    .getUser()
    .then((user) => {
      setPayment(user.paid);
      return true;
    })
    .catch((e) => {
      console.log(`Error: ${JSON.stringify(e)}`);
    });

  function handleProBtn() {
    // window.location.href = "/Payment";
    if (!isPaid) {
      route("/payment", true);
    } else {
      showPaymentPage();
    }
  }

  const handleFeature = (pf) => (ev) => {
    if (!pf || isPaid) {
      updateSettings(ev);
    } else {
      route("/payment", true);
    }
  };

  function setPayment(status) {
    chrome.storage.sync.set({ nb_settings_pd: status }, () => {});
    setPaidHook(status);
  }
  chrome.storage.sync.get(["nb_settings_pd"], (obj) => {
    console.log(`isPaid: ${JSON.stringify(obj)}`);
    try {
      if (obj.nb_settings_pd === true) {
        setPaidHook(true);
      }
    } catch (e) {
      console.log(`Error: ${JSON.stringify(e)}`);
    }
  });

  return (
    <div>
      <div className="wrapper">
        <div className="title underline">
          Notion Boost{" "}
          <div
            class="pro big"
            role="button"
            title={msgLocked}
            aria-disabled="false"
            tabindex="0"
          >
            <div
              role="button"
              title={isPaid ? msgThanks : msgLocked}
              aria-disabled="false"
              tabindex="0"
              onClick={handleProBtn}
            >
              Pro {isPaid ? <TickIcon /> : <LockIcon />}
            </div>
          </div>
          {/* <div>
            {" "}
            <a
              className="sub-link"
              href="https://gourav.io/notion-boost#-currently-added-features"
            >
              Feature details
            </a>
          </div> */}
        </div>

        <div className="settings table">
          {settingDetails.map((obj, index) => (
            <Fragment>
              <div
                className="row"
                data-func={obj.func}
                data-disable_func={obj.disable_func}
                title={obj.pf ? (isPaid ? "" : msgLocked) : ""}
                onClick={handleFeature(obj.pf)}
              >
                <div className="text-wrapper">
                  <div className="name">{obj.name}</div>
                  {obj.pf && (
                    <div
                      class="pro small"
                      role="button"
                      title={isPaid ? msgThanks : msgLocked}
                      aria-disabled="false"
                      tabindex="0"
                    >
                      <div>Pro</div>
                    </div>
                  )}
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
          <a
            className="footer-item"
            rel="noopener"
            href="https://gourav.io/notion-boost#-currently-added-features"
            target="_blank"
          >
            <div className="button" style="" role="button" tabIndex={0}>
              Features info <NewTabIcon />
            </div>
          </a>
          {/* <a className="footer-item" href={twitterShareTxt} target="_blank">
            <div className="button" style="" role="button" tabIndex={0}>
              Share&nbsp;
              <span className="twitter" />
            </div>
          </a> */}
          <a className="footer-item" href="/about">
            <div className="button" style="" role="button" tabIndex={0}>
              About
              {/* <AboutIcon /> */}
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
      <Payment path="/payment" />
    </Router>
  );
}

render(<App />, document.body);

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      x="0"
      y="0"
      fill="currentColor"
      version="1.1"
      viewBox="0 0 401.998 401.998"
      xmlSpace="preserve"
    >
      <path d="M357.45 190.721c-5.331-5.33-11.8-7.993-19.417-7.993h-9.131v-54.821c0-35.022-12.559-65.093-37.685-90.218C266.093 12.563 236.025 0 200.998 0c-35.026 0-65.1 12.563-90.222 37.688-25.126 25.126-37.685 55.196-37.685 90.219v54.821h-9.135c-7.611 0-14.084 2.663-19.414 7.993-5.33 5.326-7.994 11.799-7.994 19.417V374.59c0 7.611 2.665 14.086 7.994 19.417 5.33 5.325 11.803 7.991 19.414 7.991H338.04c7.617 0 14.085-2.663 19.417-7.991 5.325-5.331 7.994-11.806 7.994-19.417V210.135c.004-7.612-2.669-14.084-8.001-19.414zm-83.363-7.993H127.909v-54.821c0-20.175 7.139-37.402 21.414-51.675 14.277-14.275 31.501-21.411 51.678-21.411 20.179 0 37.399 7.135 51.677 21.411 14.271 14.272 21.409 31.5 21.409 51.675v54.821z" />
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0"
      y="0"
      width="11"
      height="11"
      enableBackground="new 0 0 330 330"
      fill="currentColor"
      style={"margin-left: 5px"}
      version="1.1"
      viewBox="0 0 330 330"
      xmlSpace="preserve"
    >
      <path d="M165 .008C74.019.008 0 74.024 0 164.999c0 90.977 74.019 164.992 165 164.992s165-74.015 165-164.992C330 74.024 255.981.008 165 .008zm0 299.984c-74.439 0-135-60.557-135-134.992S90.561 30.008 165 30.008s135 60.557 135 134.991c0 74.437-60.561 134.993-135 134.993z" />
      <path d="M165 130.008c-8.284 0-15 6.716-15 15v99.983c0 8.284 6.716 15 15 15s15-6.716 15-15v-99.983c0-8.283-6.716-15-15-15zM165 70.011c-3.95 0-7.811 1.6-10.61 4.39-2.79 2.79-4.39 6.66-4.39 10.61s1.6 7.81 4.39 10.61c2.79 2.79 6.66 4.39 10.61 4.39s7.81-1.6 10.609-4.39c2.79-2.8 4.391-6.66 4.391-10.61s-1.601-7.82-4.391-10.61A15.12 15.12 0 00165 70.011z" />
    </svg>
  );
}

function NewTabIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="11"
      height="11"
      style={"margin-left: 5px"}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M18 23H4c-1.654 0-3-1.346-3-3V6c0-1.654 1.346-3 3-3h8a1 1 0 110 2H4c-.551 0-1 .448-1 1v14c0 .552.449 1 1 1h14c.551 0 1-.448 1-1v-8a1 1 0 112 0v8c0 1.654-1.346 3-3 3z" />
      <path d="M22 1h-6a1 1 0 00-.707 1.707L17.586 5l-7.293 7.293a.999.999 0 101.414 1.414L19 6.414l2.293 2.293A1 1 0 0023 8V2a1 1 0 00-1-1z" />
    </svg>
  );
}

function TickIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0"
      y="0"
      width="10"
      height="10"
      fill="currentColor"
      version="1.1"
      viewBox="0 0 408.576 408.576"
      xmlSpace="preserve"
    >
      <path d="M204.288 0C91.648 0 0 91.648 0 204.288s91.648 204.288 204.288 204.288 204.288-91.648 204.288-204.288S316.928 0 204.288 0zm114.176 150.528l-130.56 129.536c-7.68 7.68-19.968 8.192-28.16.512L90.624 217.6c-8.192-7.68-8.704-20.48-1.536-28.672 7.68-8.192 20.48-8.704 28.672-1.024l54.784 50.176L289.28 121.344c8.192-8.192 20.992-8.192 29.184 0s8.192 20.992 0 29.184z" />
    </svg>
  );
}
