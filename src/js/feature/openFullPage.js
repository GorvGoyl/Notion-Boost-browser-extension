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
let previousUrl = "";
/*
Algo:

case 1: open page and bypass preview
id -> id?p / id&p -> p

here lastPageID is id

 case 2: navigate back and bypass preview
id <- id?p / id&p  <- p

here lastPageID is p
 */
function docEditListener() {
  console.log("listening for doc edit changes for openFullPage...");

  docEditObserverObj = new MutationObserver((mutationList, obsrvr) => {
    DEBUG && console.log("found changes in doc content");

    const currentUrl = window.location.href;
    if (window.location.href !== previousUrl) {
      DEBUG && console.log(`URL changed from ${previousUrl} to ${currentUrl}`);
      previousUrl = currentUrl;

      // save last page url
      const isPreviewPage =
        currentUrl.includes("&p=") || currentUrl.includes("?p=");
      if (!isPreviewPage) {
        // Credits: @dragonwocky
        lastPageID = (window.location.search
          .slice(1)
          .split("&")
          .map((opt) => opt.split("="))
          .find((opt) => opt[0] === "p") || [
          "",
          ...window.location.pathname.split(/(-|\/)/g).reverse(),
        ])[1];
      }
      // case: check for div change
      const fullPageLink = document.querySelector(
        ".notion-peek-renderer [style*='display: grid'] > a"
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

      if (isPreviewPage) {
        if (previewPageID === lastPageID) {
          DEBUG && console.log("going back", lastPageID);
          window.history.back();
        } else {
          DEBUG && console.log("full page link found", fullPageLink.href);
          fullPageLink.click();
        }
      }
    }
  });

  // now add listener for doc text change

  docEditObserverObj.observe(document, {
    childList: true,
    subtree: true,
    // attributes: true,
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
