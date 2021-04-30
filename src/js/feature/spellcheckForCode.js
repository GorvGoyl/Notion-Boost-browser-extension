import { getElement, onElementLoaded, isObserverType } from "../utility";

const notionAppInnerCls = ".notion-app-inner";
const notionPageContentCls = ".notion-page-content";

const DEBUG = false;

let docEditObserverObj = {};

export function spellcheckForCode(isEnabled) {
  try {
    console.log(`feature: enableSpellcheckForCode: ${isEnabled}`);

    // triggers on page load
    // it waits for doc to be loaded
    onElementLoaded(notionPageContentCls)
      .then((isPresent) => {
        if (isPresent) {
          if (isEnabled) {
            addSpellCheckForCode();
            docEditListener();
          } else {
            removeSpellCheckForCode();
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

// works for page change or window reload
function docEditListener() {
  console.log("listening for doc edit changes: enableSpellcheckForCode...");
  let isSpellcheckEnabled = false;

  docEditObserverObj = new MutationObserver((mutationList, obsrvr) => {
    DEBUG && console.log("found changes in doc content");

    for (let i = 0; i < mutationList.length; i++) {
      const m = mutationList[i];

      // case: check for div change
      if (m.type === "childList") {
        if (
          m.target &&
          m.addedNodes.length > 0 &&
          m.target.classList.contains("notion-code-block")
        ) {
          console.log("codeblok");
          isSpellcheckEnabled = true;
          // briefly pause listener to avoid recursive triggers
          // removeDocEditListener();

          m.target
            .querySelector("div[spellcheck]")
            .setAttribute("spellcheck", "true");
          // updateCodeline(block);
          // docEditListener();
        }
      }
    }

    if (isSpellcheckEnabled) {
      console.log("spellcheck enabled");
      isSpellcheckEnabled = false;
    }
  });

  // now add listener for doc text change
  const pageContentEl = getElement(notionAppInnerCls);

  docEditObserverObj.observe(pageContentEl, {
    childList: true,
    subtree: true,
  });
}
function addSpellCheckForCode() {
  const codeDivs = document.querySelectorAll(
    "div.notion-page-content > div.notion-selectable.notion-code-block div.notion-code-block > div"
  );
  codeDivs.forEach((x) => {
    x.setAttribute("spellcheck", "true");
  });
}

function removeSpellCheckForCode() {
  console.log("removing removeSpellCheckForCode feature...");

  removeDocEditListener();

  const codeDivs = document.querySelectorAll(
    "div.notion-page-content > div.notion-selectable.notion-code-block div.notion-code-block > div"
  );

  codeDivs.forEach((x) => {
    x.setAttribute("spellcheck", "false");
  });

  console.log("removeCodeLineNumbers feature done");
}
