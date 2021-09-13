import {
  getElement,
  isObserverType,
  onElementLoaded,
  pageChangeListener,
  removePageChangeListener,
  toElement,
} from "../utility";

const notionAppInnerCls = ".notion-app-inner";

// this works for both full page table and full page content
const notionPresenceContainerCls = ".notion-presence-container";

const DEBUG = true;

const docEditObserverObj = {};
let pageChangeObserverObj = {};

export function rollupUrlClickable(isEnabled) {
  try {
    console.log(`feature: enablerollupUrlClickable: ${isEnabled}`);

    // triggers on page load
    // it waits for doc to be loaded
    onElementLoaded(notionPresenceContainerCls)
      .then((isPresent) => {
        if (isPresent) {
          if (isEnabled) {
            console.log("calling addrollupUrlClickable");
            bindRollupClickableEvent();
            // docEditListener();
          } else {
            removerollupUrlClickable();
          }
        }
        return true;
      })
      .catch((e) => console.error(e));
  } catch (e) {
    console.error(e);
  }
}

// Internal methods //

function removeDocEditListener() {
  if (isObserverType(docEditObserverObj)) {
    DEBUG && console.log("disconnected docEditObserver");
    docEditObserverObj.disconnect();
  }
}

function bindRollupClickableEvent() {
  // add event
  addrollupUrlClickable();

  // re-add event on page change
  pageChangeObserverObj = pageChangeListener([], [addrollupUrlClickable]);
}

function getUrl(textParam) {
  if (!textParam) {
    return null;
  }
  let text = textParam.trim();

  if (text.indexOf(" ") === -1 && text.indexOf(".") > 0 && text.length > 3) {
    // href needs http(s) in url
    if (!/^https?:\/\//i.test(text)) {
      text = `http://${text}`;
    }
    return text;
  }
  return null;
}

let linkComponentEl = "";
let rollupCellEl = "";

function createLinkComponent(url) {
  return toElement(
    `<div class="linkComponent">
    <div>
      <a
        title="Open URL in new tab"
        href="${url}"
        target="_blank"
        rel="noopener noreferrer"
        class="notion-focusable"
      >
            <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"
        />
        <path
          d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"
        />
      </svg>
      </a>
    </div>
  </div>
  `
  );
}

function handleTableHover(e) {
  // console.log("hover over table", e.target);
  let nestedLevel = 0;
  const path = e.composedPath();
  for (let i = 0; i < path.length; i++) {
    const x = path[i];
    // console.log(x);
    nestedLevel++;
    // return if hovering over link component
    if (x.className === "linkComponent") {
      return;
    }
    if (nestedLevel > 5) {
      // linkComponent not found
      break;
    }
  }
  if (linkComponentEl) {
    linkComponentEl.remove();
  }
  if (rollupCellEl) {
    rollupCellEl.style.position = null;
    rollupCellEl = "";
  }
  //   onhover: background: rgb(239, 239, 238)

  let urlSpan = "";
  const rollupCellStyle = "display: flex;";

  for (const x of path) {
    if (x.getAttribute("style") === rollupCellStyle) {
      // console.log(x.getAttribute("style"));
      urlSpan = x.querySelector(
        'div[style*="display: block;"] div[style*="display: flex; flex-wrap: nowrap;"] span'
      );
      if (urlSpan) {
        // console.log("it's rollup cell");
        rollupCellEl = x;
        break;
      }
    }

    // break if it reaches original eventListener element
    if (x === e.currentTarget) {
      break;
    }
  }

  if (rollupCellEl) {
    // debugger;
    // console.log("inside rollupcell");
    let text = "";
    // see if it contains actual link
    const anchor = urlSpan.querySelector("a");
    if (anchor) {
      text = anchor.href;
    } else {
      // nope it's just a span
      text = urlSpan.textContent;
    }
    const url = getUrl(text);
    if (url) {
      rollupCellEl.style.position = "relative";

      linkComponentEl = createLinkComponent(url);

      rollupCellEl.appendChild(linkComponentEl);

      // console.log(url);
    } else {
      // console.log("empty text");
    }
  }
}

function handletableRowAsPageHover(e) {
  //   console.log("relatedTarget", e.relatedTarget);

  //   debugger;

  let nestedLevel = 0;
  const path = e.composedPath();

  for (const x of path) {
    nestedLevel++;
    // return if hovering over link component
    if (x.className === "linkComponent") {
      // console.log("ignoring link hover");
      return;
    }
    if (nestedLevel > 5) {
      // linkComponent not found
      break;
    }
  }
  if (linkComponentEl) {
    linkComponentEl.remove();
  }
  if (rollupCellEl) {
    rollupCellEl.style.position = null;
    rollupCellEl = "";
  }
  //   onhover: background: rgb(239, 239, 238)

  let urlSpan = "";
  const rollupCellStyle = "display: flex; flex: 1 1 0%; min-width: 0px;";

  for (let i = 0; i < path.length; i++) {
    const x = path[i];
    if (x.getAttribute("style") === rollupCellStyle) {
      urlSpan = x.querySelector(
        'div.notion-focusable div[style*="display: flex; flex-wrap:"] > span[style*="word-break: break-word;"]'
      );
      console.log(urlSpan);
      if (urlSpan) {
        rollupCellEl = x;
        break;
      }
    }

    // break if it reaches original eventListener element
    if (x === e.currentTarget) {
      break;
    }
  }

  if (rollupCellEl) {
    // debugger;
    let text = "";
    // see if it contains actual link
    const anchor = urlSpan.querySelector("a");
    if (anchor) {
      text = anchor.href;
    } else {
      // nope it's just a span
      text = urlSpan.textContent;
    }
    const url = getUrl(text);
    if (url) {
      rollupCellEl.style.position = "relative";

      linkComponentEl = createLinkComponent(url);

      rollupCellEl.appendChild(linkComponentEl);
    }
  }
}

function addrollupUrlClickable() {
  console.log("adding addrollupUrlClickable feature...");

  // console.log(
  //   "notion-table-view count",
  //   document.querySelectorAll(".notion-table-view").length
  // );

  const tables = document.querySelectorAll(".notion-table-view");
  if (tables) {
    tables.forEach((x) => {
      x.addEventListener("mouseover", handleTableHover);
    });
  }

  const tableRowAsPage = document.querySelector(
    '.notion-scroller.vertical.horizontal > div:nth-of-type(2)[style*="width: 100%; display: flex; flex-direction: column;"] div[style="margin: 0px;"]'
  );
  if (tableRowAsPage) {
    tableRowAsPage.addEventListener("mouseover", handletableRowAsPageHover);
  }
}

function removerollupUrlClickable() {
  console.log("removing removerollupUrlClickable feature...");

  removePageChangeListener(pageChangeObserverObj);

  // removeDocEditListener();
  const tables = document.querySelectorAll(".notion-table-view");
  if (tables) {
    tables.forEach((x) => {
      x.removeEventListener("mouseover", handleTableHover);
    });
  }

  const tableRowAsPage = document.querySelector(
    '.notion-scroller.vertical.horizontal > div:nth-of-type(2)[style*="width: 100%; display: flex; flex-direction: column;"] div[style="margin: 0px;"]'
  );
  if (tableRowAsPage) {
    tableRowAsPage.removeEventListener("mouseover", handletableRowAsPageHover);
  }

  console.log("removerollupUrlClickable feature done");
}
