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

function handleTableHover(e) {
  let nestedLevel = 0;
  for (const x of e.path) {
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

  for (const x of e.path) {
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

      linkComponentEl = toElement(
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
            fill-rule="evenodd"
            d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
            clip-rule="evenodd"
          />
        </svg>
          </a>
        </div>
      </div>
      `
      );

      rollupCellEl.appendChild(linkComponentEl);

      // console.log(url);
    } else {
      // console.log("empty text");
    }
  }
}

function handletableRowAsPageHover(e) {
  // console.log("target", e.target);
  //   console.log("relatedTarget", e.relatedTarget);

  //   debugger;

  let nestedLevel = 0;
  for (const x of e.path) {
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

  for (let i = 0; i < e.path.length; i++) {
    const x = e.path[i];
    if (x.getAttribute("style") === rollupCellStyle) {
      // console.log(i, x);
      urlSpan = x.querySelector(
        'div.notion-focusable div[style*="display: flex; flex-wrap:"] > span[style*="word-break: break-word;"]'
      );
      // console.log(urlSpan);
      if (urlSpan) {
        // console.log("it's rollup cell");
        rollupCellEl = x;
        break;
      }
    }

    // break if it reaches original eventListener element
    if (x === e.currentTarget) {
      // console.log(i, "breaking due to reached currentTarget");
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

      linkComponentEl = toElement(
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
            fill-rule="evenodd"
            d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
            clip-rule="evenodd"
          />
        </svg>
          </a>
        </div>
      </div>
      `
      );

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
