import { getElement, onElementLoaded, toElement } from "../utility";

const notionAppInnerCls = ".notion-app-inner";
const notionPageContentCls = ".notion-page-content";
const notionCursorListenerCls = ".notion-cursor-listener";
const codeLineNumbersCls = "codeLineNumbers";

const DEBUG = false;

let docEditObserverObj = {};

export function codeLineNumbers(isEnabled) {
  try {
    console.log(`feature: codeLineNumbers: ${isEnabled}`);

    // triggers on page load
    // it waits for doc to be loaded
    onElementLoaded(notionPageContentCls)
      .then((isPresent) => {
        if (isPresent) {
          if (isEnabled) {
            addCodeLineNumbers();
            docEditListener();
          } else {
            removeCodeLineNumbers();
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

function isObserverType(obj) {
  return obj.disconnect !== undefined;
}

// add/update line if any code block change occurs
// works for page change or window reload
function docEditListener() {
  DEBUG && console.log("listening for doc edit changes...");
  let isCodeChanged = false;

  let block = "";
  docEditObserverObj = new MutationObserver((mutationList, obsrvr) => {
    DEBUG && console.log("found changes in doc content");

    for (let i = 0; i < mutationList.length; i++) {
      const m = mutationList[i];

      // case: check for text change in headings
      if (m.type === "childList") {
        if (
          m.target &&
          m.target.parentNode &&
          m.target.parentNode.classList.contains("line-numbers")
        ) {
          isCodeChanged = true;
          block = m.target.parentNode;
          // briefly pause listener to avoid recursive triggers
          removeDocEditListener();
          updateCodeline(block);
          docEditListener();
        }
      }
    }

    if (isCodeChanged) {
      console.log("code changed");
      isCodeChanged = false;
    }
  });

  // now add listener for doc text change
  const pageContentEl = getElement(notionAppInnerCls);

  docEditObserverObj.observe(pageContentEl, {
    childList: true,
    subtree: true,
  });
}

function addCodeLineNumbers() {
  const el1 = getElement(notionCursorListenerCls);

  el1.classList.add(codeLineNumbersCls);

  const el = document.querySelectorAll(
    "div.notion-page-content .notion-code-block.line-numbers"
  );

  el.forEach((x) => {
    updateCodeline(x);
    return true;
  });
}

function removeCodeLineNumbers() {
  console.log("removing removeCodeLineNumbers feature...");

  removeDocEditListener();

  const el = getElement(notionCursorListenerCls);

  el.classList.remove(codeLineNumbersCls);

  document.querySelectorAll(".code-line-numbers").forEach((x) => x.remove());

  // clearOutline();

  console.log("removed removeCodeLineNumbers feature");
}

// credit @CloudHill
function updateCodeline(block) {
  let lineNumbers = "";

  let numbers = block.querySelector(".code-line-numbers");
  if (!numbers) {
    numbers = toElement('<span class="code-line-numbers"></span>');

    const blockStyle = window.getComputedStyle(block.children[0]);
    numbers.style.top = blockStyle.paddingTop;
    numbers.style.bottom = blockStyle.paddingBottom;

    block.append(numbers);

    const temp = toElement("<span>A</span>");
    block.firstChild.append(temp);
    block.lineHeight = temp.getBoundingClientRect().height;
    temp.remove();
  }

  const lines = block.firstChild.innerText.split(/\r\n|\r|\n/);
  if (lines[lines.length - 1] === "") lines.pop();
  let lineCounter = 0;
  const wordWrap = block.firstChild.style.wordBreak === "break-all";

  for (let i = 0; i < lines.length; i++) {
    lineCounter++;
    lineNumbers += `${lineCounter}\n`;

    if (wordWrap) {
      const temp = document.createElement("span");
      temp.innerText = lines[i];
      block.firstChild.append(temp);
      const lineHeight = temp.getBoundingClientRect().height;
      temp.remove();

      for (let j = 1; j < lineHeight / block.lineHeight - 1; j++)
        lineNumbers += "\n";
    }
  }

  if (lineNumbers.length > 2) {
    block.firstChild.classList.add("code-numbered");
    numbers.innerText = lineNumbers;
  } else {
    block.firstChild.classList.remove("code-numbered");
    numbers.innerText = "";
  }
}
