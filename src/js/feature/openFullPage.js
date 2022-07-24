import { getElement, isObserverType, onElementLoaded } from "../utility";

const notionDefaultOverlayCls = ".notion-default-overlay-container";

const DEBUG = true;

let docEditObserverObj = {};

export function openFullPage(isEnabled) {
  try {
    console.log(`feature: enableOpenFullPage: ${isEnabled}`);

    // triggers on page load
    // it waits for overlay to be loaded
    onElementLoaded(notionDefaultOverlayCls)
      .then((isPresent) => {
        if (isPresent) {
          if (isEnabled) {
            addOpenFullPage();
          } else {
            removeOpenFullPage();
          }
        }
        return true;
      })
      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
}

// Internal methods //

function removeDocEditListener() {
  if (isObserverType(docEditObserverObj)) {
    DEBUG && console.log("disconnected docEditObserver");
    docEditObserverObj.disconnect();
  }
}
let lastPageID;

/*
Algo:

case 1: open page and bypass preview
id -> id?p -> p

here lastPageID is id

 case 2: navigate back and bypass preview
id <- id?p  <- p

here lastPageID is p
 */
function docEditListener() {
  console.log("listening for doc edit changes for openFullPage...");

  docEditObserverObj = new MutationObserver((mutationList, obsrvr) => {
    DEBUG && console.log("found changes in doc content");
    const curUrl = window.location.href;

    // save last page url
    if (!curUrl.includes("&p=") && !curUrl.includes("?p=")) {
      // All credits goes to 'dragonwocky' for this approach
      lastPageID = (window.location.search
        .slice(1)
        .split("&")
        .map((opt) => opt.split("="))
        .find((opt) => opt[0] === "p") || [
        "",
        ...window.location.pathname.split(/(-|\/)/g).reverse(),
      ])[1];
    }
    for (let i = 0; i < mutationList.length; i++) {
      const m = mutationList[i];

      // case: check for div change
      if (m.type === "childList" && m.addedNodes.length > 0 && m.target) {
        const fullPageLink = m.target.querySelector(
          ".notion-peek-renderer [style*='height: 45px;'] a"
        );

        if (!fullPageLink) return;

        const previewPageID = (fullPageLink.href
          .slice(1)
          .split("&")
          .map((opt) => opt.split("="))
          .find((opt) => opt[0] === "p") || [
          "",
          ...fullPageLink.pathname.split(/(-|\/)/g).reverse(),
        ])[1];

        if (previewPageID) {
          if (previewPageID === lastPageID) {
            console.log("going back", lastPageID);
            window.history.back();
          } else {
            console.log("full page link found", fullPageLink.href);
            fullPageLink.click();
          }
        }
      }
    }
  });

  // now add listener for doc text change
  const defaultOverlayEl = getElement(notionDefaultOverlayCls);

  docEditObserverObj.observe(defaultOverlayEl, {
    childList: true,
    subtree: true,
  });
}
function addOpenFullPage() {
  docEditListener();
}

function removeOpenFullPage() {
  console.log("removing removeOpenFullPage feature...");

  removeDocEditListener();

  console.log("openFullPage feature removed");
}
