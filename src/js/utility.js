import { defaultSettings } from "./settings";

export const twitterShareTxt =
  "https://twitter.com/intent/tweet?url=&text=%40NotionBoost%20by%20%40GorvGoyl%20adds%20tons%20of%20capabilities%20to%20%40NotionHQ%20like%20outline%2C%20scroll%20top%20button%2C%20hide%20slash%20command%20menu%20and%20many%20more!";
// stays on doc change
const notionFrameCls = ".notion-frame";

// these gets removed on doc change
const notionScrollerCls = ".notion-scroller.vertical.horizontal";
const notionPageContentCls = ".notion-page-content";

// add listener for page change or window reload event
// accepts array of functions
// callbacksAfterDocReady: call any function after notion doc is ready, it triggers for all pages
// callbacksAfterContentReady: call any function after notion doc content is loaded (async), this won't trigger in case of full length db
// return observer object which can be used to disconnect pageChangeListener
export function pageChangeListener(
  callbacksAfterDocReady,
  callbacksAfterContentReady
) {
  try {
    console.log(
      `listening to page change events for: ${callbacksAfterDocReady[0].name}`
    );
  } catch (e) {
    console.log(`Error: ${JSON.stringify(e)}`);
  }

  const pageChangeObserverObj = new MutationObserver((mutationList, obsrvr) => {
    console.log("new page opened");

    // check if scroller class is loaded
    if (getElement(notionScrollerCls)) {
      for (let i = 0; i < callbacksAfterDocReady.length; i++) {
        callbacksAfterDocReady[i]();
      }
      // now wait for page-content class to be loaded
      onElementLoaded(notionPageContentCls, notionScrollerCls)
        .then((isPresent) => {
          if (isPresent) {
            for (let i = 0; i < callbacksAfterContentReady.length; i++) {
              callbacksAfterContentReady[i]();
            }
          }
          return null;
        })
        .catch((e) => console.log(e));
    }
  });

  const docFrameEl = getElement(notionFrameCls);

  pageChangeObserverObj.observe(docFrameEl, {
    childList: true,
  });
  return pageChangeObserverObj;
}

export function removePageChangeListener(pageChangeObserverObj) {
  if (isObserverType(pageChangeObserverObj)) {
    console.log("disconnected pageChangeObserver");
    pageChangeObserverObj.disconnect();
  }
}

function isObserverType(obj) {
  return obj.disconnect !== undefined;
}

// return promise when div is loaded
// pass div and (optional) parent div class
// if parent class is not passed then `document` is used
export function onElementLoaded(divClassToObserve, ParentDivClass) {
  console.log(`waiting for element: ${divClassToObserve}`);
  const promise = new Promise((resolve, reject) => {
    try {
      if (getElement(divClassToObserve)) {
        console.log(`element already present: ${divClassToObserve}`);
        resolve(true);
        return;
      }
      const parentElement = ParentDivClass
        ? getElement(ParentDivClass)
        : document;

      const observer = new MutationObserver((mutationList, obsrvr) => {
        const divToCheck = getElement(divClassToObserve);
        // console.log("checking for div...");

        if (divToCheck) {
          console.log(`element loaded: ${divClassToObserve}`);
          obsrvr.disconnect(); // stop observing
          resolve(true);
        }
      });

      // start observing for dynamic div
      observer.observe(parentElement, {
        childList: true,
        subtree: true,
      });
    } catch (e) {
      console.log(e);
      reject(Error("some issue... promise rejected"));
    }
  });
  return promise;
}

// detect if css is changed for a div (once)
export function onElementCSSChanged(divClassToObserve, timeOut) {
  console.log(`waiting for element: ${divClassToObserve}`);
  const promise = new Promise((resolve, reject) => {
    try {
      const observer = new MutationObserver((mutationList, obsrvr) => {
        mutationList.forEach((mutation) => {
          if (mutation.attributeName === "style") {
            console.log("style change");
            obsrvr.disconnect(); // stop observing
            resolve(true);
          }
        });
      });

      // start observing for dynamic div
      observer.observe(divClassToObserve, {
        attributes: true,
        attributeFilter: ["style"],
      });

      if (timeOut) {
        setTimeout(() => {
          observer.disconnect();
          console.log(`observer disconnected after ${timeOut}`);
        }, timeOut);
      }
    } catch (e) {
      console.log(e);
      reject(Error("some issue... promise rejected"));
    }
  });
  return promise;
}

// create html node from string like $('div')
export function toElement(s) {
  let e = document.createElement("div");
  const r = document.createRange();
  r.selectNodeContents(e);
  const f = r.createContextualFragment(s);
  e.appendChild(f);
  e = e.firstElementChild;
  return e;
}
// export function toElement(
//   s = "",
//   c,
//   t = document.createElement("template"),
//   l = "length"
// ) {
//   t.innerHTML = s.trim();
//   c = [...t.content.childNodes];
//   return c[l] > 1 ? c : c[0] || "";
// }

// run func every x millisec and stop after y millisec
export function runMethod(func, runEvery, stopAfter) {
  const process = setInterval(func, runEvery);

  setTimeout(() => {
    console.log("stopped");
    clearInterval(process);
  }, stopAfter);
}

export function removeChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}
export function getElement(selector) {
  return document.querySelector(selector);
}
export function getElements(selector) {
  return document.querySelectorAll(selector);
}
// ugly method to check for empty
export function isEmpty(obj) {
  // boolean like false = non-empty
  if (obj === false || obj === true) return false;

  // empty string, null is empty
  if (!obj) return true;

  // empty object = empty
  if (Object.keys(obj).length === 0) return true;
  return false;
}

// 1. get from default settings 2. update it with saved settings 3. return
export function getLatestSettings() {
  const promise = new Promise((resolve, reject) => {
    try {
      const latestSet = { ...defaultSettings };
      chrome.storage.sync.get(["nb_settings"], (result) => {
        const savedSet = result.nb_settings;
        if (!isEmpty(savedSet)) {
          for (const k of Object.keys(defaultSettings)) {
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
