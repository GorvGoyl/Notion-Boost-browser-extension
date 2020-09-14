import {
  isEmpty,
  getElement,
  toElement,
  removeChildren,
  onElementLoaded,
} from "../utility";

let pageChangeObserver = {};
let docEditObserver = {};

// keep classes in hierarchy of DOM

// stays on page change
const notionFrameCls = ".notion-frame";

const outlineFrameCls = ".nb-outline";

// these gets removed on doc change
const notionScrollerCls = ".notion-scroller.vertical.horizontal";

const notionPageContentCls = ".notion-page-content";

export default function displayOutline(isShow) {
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
          pageChangeListener();
        }
        return null;
      })
      .catch((e) => console.log(e));
  } else {
    removeOutline();
  }
}

function addOutlineFrame() {
  getElement(notionScrollerCls).style.width = "80%";
}

function removeDocEditListener() {
  if (isObserverType(docEditObserver)) {
    console.log("disconnected docEditObserver");
    docEditObserver.disconnect();
  }
}

function removePageChangeListener() {
  if (isObserverType(pageChangeObserver)) {
    console.log("disconnected pageChangeObserver");
    pageChangeObserver.disconnect();
  }
}
function removeOutline() {
  console.log("removing outline feature...");

  removeDocEditListener();

  removePageChangeListener();

  clearOutline();

  console.log("removed outline feature");
}

function hideOutline() {
  const outline = getElement(outlineFrameCls);

  outline.style.display = "none";

  getElement(notionScrollerCls).style.width = "100%";
  const pageContent = getElement(notionPageContentCls);
  //  removal of := fix weird bug where inline table (if any) goes to the left if page width is 100%
  if (pageContent) {
    pageContent.childNodes.forEach((block) => {
      if (block.classList.contains("notion-collection_view-block")) {
        block.style.paddingLeft = "0";
      }
    });
  }
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
  console.log("adding/updating OUTLINE");

  const pageContent = getElement(notionPageContentCls);
  if (!pageContent) {
    console.log("no page content class");
    return;
  }

  const notionScrollerEl = getElement(notionScrollerCls);
  // make space for outline div
  notionScrollerEl.style.width = "80%";

  // check if it outline exist already
  let outlineEl = getElement(outlineFrameCls);

  if (!outlineEl || outlineEl.length === 0) {
    // do not add any space between closing and ending of ` otherwise $ will create multiple elements
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

  outlineEl.style.display = "block";

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

  //  fix weird bug where inline table (if any) goes to the left if page width is 100%
  pageContent.childNodes.forEach((block) => {
    if (block.classList.contains("notion-collection_view-block")) {
      if (pageContent.style.width === "100%") block.style.paddingLeft = "128px";
      // 96px
      else block.style.paddingLeft = "0";
    }
  });

  const blocks = pageContent.children;
  let block = "";
  // find headings and add it to outline
  for (let i = 0; i < blocks.length; i++) {
    let hCls = "";
    const b = blocks[i];
    if (b.classList.contains("notion-header-block")) {
      hCls = "nb-h1";
    } else if (b.classList.contains("notion-sub_header-block")) {
      hCls = "nb-h2";
    } else if (b.classList.contains("notion-sub_sub_header-block")) {
      hCls = "nb-h3";
    } else {
      hCls = "";
    }

    if (hCls) {
      block = toElement(tocBlockHTML);

      // add text
      const text = b.textContent;
      block.querySelector(".align").classList.add(hCls);
      block.querySelector(".text").textContent = text;

      // add href
      const blockId = b.getAttribute("data-block-id").replace(/-/g, "");
      block.setAttribute("hash", blockId);
      // evaluate href at runtime cuz notion url is not consistent
      block.addEventListener("click", (e) => {
        e.currentTarget.querySelector("a").href = `${
          window.location.pathname
        }#${e.currentTarget.getAttribute("hash")}`;
      });

      blockWrapperEl.appendChild(block);
    }
  }
}

// UTILITY FUNCTIONS

function docEditListener() {
  console.log("listening for doc edit changes...");

  // initialise it one time
  if (!isObserverType(docEditObserver)) {
    docEditObserver = new MutationObserver((mutationList, obsrvr) => {
      console.log("found changes in doc content");

      let isDocHeadingChanged = false;

      let placeholder = "";
      for (let i = 0; i < mutationList.length; i++) {
        const m = mutationList[i];

        // case: check for text change in headings
        if (!isHeading(placeholder) && m.type === "characterData") {
          console.log(`changed text: ${m.target.textContent}`);

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
          console.log("childList changed");

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
              console.log("empty block got removed: ");
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

              console.log("empty blocks got removed: ");
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
            console.log("empty block got added: ");
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
  }

  // now add listener for doc text change
  const pageContentEl = getElement(notionPageContentCls);

  docEditObserver.observe(pageContentEl, {
    childList: true,
    characterData: true,
    subtree: true,
  });
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
// add listener for page change or window reload
// triggers whenever new doc is opened in notion without full reload
function pageChangeListener() {
  console.log("listening for page change events...");

  // initialise it one time
  if (!isObserverType(pageChangeObserver)) {
    pageChangeObserver = new MutationObserver((mutationList, obsrvr) => {
      console.log("new page opened without full reload");
      removeDocEditListener();
      hideOutline();
      // check if scroller class is loaded
      if (getElement(notionScrollerCls)) {
        // wait for page-content class to be loaded
        onElementLoaded(notionPageContentCls, notionScrollerCls)
          .then((isPresent) => {
            if (isPresent) {
              addOutline();
              docEditListener();
            }
            return null;
          })
          .catch((e) => console.log(e));
      }
    });
  }

  const docFrameEl = getElement(notionFrameCls);

  pageChangeObserver.observe(docFrameEl, {
    childList: true,
  });
}

function isObserverType(obj) {
  return obj.constructor.name === "MutationObserver";
}
