import {
  getElement,
  toElement,
  removeChildren,
  onElementLoaded,
  pageChangeListener,
  removePageChangeListener,
  getElements,
} from "../utility";

let pageChangeObserverObj = {};
let docEditObserverObj = {};

const DEBUG = false;
// ENABLE/DISABLE Console Logs
// if (!DEBUG) {

//   console.log = () => {};
// }

// keep classes in hierarchy of DOM

// stays on doc change
const notionFrameCls = ".notion-frame";
const outlineFrameCls = ".nb-outline";

// these gets removed on doc change
const notionScrollerCls = ".notion-scroller.vertical.horizontal";
const notionPageContentCls = ".notion-page-content";
const notionContent = ".notion-page-content div[data-root=true]"

// starting point
export function displayOutline(isShow) {
  console.log(`feature: displayOutline: ${isShow}`);

  if (isShow) {
    console.log("setting up outline feature");

    // triggers on page load
    // it waits for doc to be loaded
    onElementLoaded(notionPageContentCls)
      .then((isPresent) => {
        if (isPresent) {
          // addOutlineFrame();
          addOutline();
          docEditListener();
          docClinkListener();
          // add listener for page change or window reload
          // it detaches old listeners and adds new doceditlistener and outline
          pageChangeObserverObj = pageChangeListener(
            [removeDocEditListener, hideOutline],
            [addOutline, docEditListener]
          );
        }
        return null;
      })
      .catch((e) => console.log(e));
  } else {
    removeOutline();
  }
}

function removeDocEditListener() {
  if (isObserverType(docEditObserverObj)) {
    console.log("disconnected docEditObserver");
    docEditObserverObj.disconnect();
  }
}

function removeOutline() {
  console.log("removing outline feature...");

  removeDocEditListener();

  removePageChangeListener(pageChangeObserverObj);

  clearOutline();

  console.log("removed outline feature");
}

function hideOutline() {
  const outline = getElement(outlineFrameCls);

  if (!outline) return;
  outline.classList.remove("show");
}

function clearOutline() {
  hideOutline();

  const outline = getElement(outlineFrameCls);
  if (outline) {
    console.log("removed outline div");
    outline.remove();
  }
}

function addOutline() {
  DEBUG && console.log("adding/updating OUTLINE");

  const pageContent = getElement(notionPageContentCls);
  if (!pageContent) {
    console.log("no page content class");
    return;
  }

  const fullPageTable = getElement(".notion-peek-renderer");
  if (fullPageTable && fullPageTable.querySelector(notionPageContentCls)) {
    console.log("don't show outline for full page tables");
    return;
  }

  const notionScrollerEl = getElement(notionScrollerCls);

  // check if it outline exist already
  let outlineEl = getElement(outlineFrameCls);

  if (!outlineEl || outlineEl.length === 0) {
    // do not add any space between closing and ending of `
    outlineEl = toElement(`<div class="nb-outline">
      <div class="table_of_contents">
        <div class="title">
          <p>Outline</p>
        </div>
        <div class="block-wrapper">
        </div>
      </div>
      </div>`);

    // add toc container
    getElement(notionFrameCls).insertBefore(outlineEl, notionScrollerEl);
  }

  const blockWrapperEl = outlineEl.querySelector(".block-wrapper");

  // empty any previous headings
  removeChildren(blockWrapperEl);

  const tocBlockHTML = `<div class="block">
     <a
       href=""
       rel="noopener noreferrer"
     >
       <div role="button" tabindex="0" class="btn">
         <div class="align">
           <div class="text">
           </div>
         </div>
       </div>
     </a>
   </div>`;

  let block = "";

  let isHeadingsFound = false;

  // select all divs containing headings
  const headings = getElements(
    `${notionPageContentCls} [class$="header-block"]`
  );

  isHeadingsFound = headings.length > 0;

  // add headings to outline view
  for (let i = 0; i < headings.length; i++) {
    let headingCls = "";
    const h = headings[i];
    if (h.classList.contains("notion-header-block")) {
      headingCls = "nb-h1";
    } else if (h.classList.contains("notion-sub_header-block")) {
      headingCls = "nb-h2";
    } else if (h.classList.contains("notion-sub_sub_header-block")) {
      headingCls = "nb-h3";
    } else {
      headingCls = "";
    }

    block = toElement(tocBlockHTML);

    // add text
    const text = h.textContent;
    block.querySelector(".align").classList.add(headingCls);
    block.querySelector(".text").textContent = text;

    // add href
    const blockId = h.getAttribute("data-block-id").replace(/-/g, "");
    block.setAttribute("hash", blockId);
    // evaluate href at runtime cuz notion url is not consistent
    block.addEventListener("click", (e) => {
      e.currentTarget.querySelector("a").href = `${
        window.location.pathname
      }#${e.currentTarget.getAttribute("hash")}`;
    });

    blockWrapperEl.appendChild(block);
  }

  // hide outline if there is no heading
  if (!isHeadingsFound) {
    console.log("no heading found so removing outline frame");
    hideOutline();
  } else {
    outlineEl.classList.add("show");
  }
}

// UTILITY FUNCTIONS

// add/update outline if any heading change occurs
function docEditListener() {
  DEBUG && console.log("listening for doc edit changes...");

  docEditObserverObj = new MutationObserver((mutationList, obsrvr) => {
    DEBUG && console.log("found changes in doc content");

    docClinkListener();

    let isDocHeadingChanged = false;

    let placeholder = "";
    for (let i = 0; i < mutationList.length; i++) {
      const m = mutationList[i];

      // case: check for text change in headings
      if (!isHeading(placeholder) && m.type === "characterData") {
        DEBUG && console.log(`changed text: ${m.target.textContent}`);

        if (!isHeading(placeholder) && m.target.parentNode) {
          placeholder = m.target.parentNode.getAttribute("placeholder");
        }

        // case: when styling (b/i) is added to heading
        if (
          !isHeading(placeholder) &&
          m.target.parentNode &&
          m.target.parentNode.parentNode
        ) {
          placeholder = m.target.parentNode.parentNode.getAttribute(
            "placeholder"
          );
        }
      }
      if (!isHeading(placeholder) && m.type === "childList") {
        // console.log("childList changed");

        // case: hitting backspace in headings
        placeholder = m.target.getAttribute("placeholder");

        // case: when empty heading is being removed
        if (
          !isHeading(placeholder) &&
          m.removedNodes.length > 0 &&
          m.removedNodes[0].firstElementChild
        ) {
          placeholder = m.removedNodes[0].firstElementChild.getAttribute(
            "placeholder"
          );

          if (placeholder) {
            // console.log("empty block got removed");
          }

          // case: when select and delete multiple headings
          if (
            !isHeading(placeholder) &&
            m.removedNodes.length > 0 &&
            m.removedNodes[0].firstElementChild.firstElementChild
          ) {
            placeholder = m.removedNodes[0].firstElementChild.firstElementChild.getAttribute(
              "placeholder"
            );

            // console.log("empty blocks got removed");
          }
        }

        // case: when empty heading is being added
        if (
          !isHeading(placeholder) &&
          m.addedNodes.length > 0 &&
          m.addedNodes[0].firstElementChild
        ) {
          placeholder = m.addedNodes[0].firstElementChild.getAttribute(
            "placeholder"
          );
          // console.log("empty block got added");
        }
      }

      // check if the change was related to headings
      if (isHeading(placeholder)) {
        console.log("heading changed");

        isDocHeadingChanged = true;
        break;
      }
    }

    if (isDocHeadingChanged) {
      addOutline();
    }
  });

  // now add listener for doc text change
  const pageContentEl = getElement(notionPageContentCls);

  docEditObserverObj.observe(pageContentEl, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}

function isHeaderBlock(element){
  return element.classList.contains("notion-header-block")
  || element.classList.contains("notion-sub_header-block")
  || element.classList.contains("notion-sub_sub_header-block")
}

function onBlockClick(evt) {
  DEBUG && console.debug(evt)

  var porintELement = null

  for (const index in evt.path) {
    if (evt.path[index].classList.contains("notion-page-content") && index > 0) {
        porintELement = evt.path[index - 1]
      break
    }
  }

  if(!porintELement)
    return
  

  while (!isHeaderBlock(porintELement) && porintELement.previousElementSibling) {
      porintELement = porintELement.previousElementSibling
  }

  if(!isHeaderBlock(porintELement))
    return

  for(const block of document.querySelectorAll(".nb-outline div.block")){
    block.style.backgroundColor = null
  }  

  const blockId = porintELement.getAttribute("data-block-id").replace(/-/g, "");
  document.querySelector(`.nb-outline div.block[hash="${blockId}"]`).style.backgroundColor = "rgba(45, 170, 219, 0.3)"
}

function docClinkListener() {
  const contentBlocks = getElements(notionContent)
  for (const block of contentBlocks) {
    block.addEventListener("click", onBlockClick)
  }
}

function isObserverType(obj) {
  return obj.disconnect !== undefined;
}

function isHeading(placeholder) {
  // check if the change was related to headings
  if (
    placeholder === "Heading 1" ||
    placeholder === "Heading 2" ||
    placeholder === "Heading 3"
  ) {
    return true;
  }
  return false;
}
