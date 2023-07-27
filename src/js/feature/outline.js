import {
  getElement,
  getElements,
  isObserverType,
  onElementLoaded,
  pageChangeListener,
  removeChildren,
  removePageChangeListener,
  toElement,
} from "../utility";

let pageChangeObserverObj = {};
let docEditObserverObj = {};

// ENABLE/DISABLE Console Logs
const DEBUG = false;

// keep classes in hierarchy of DOM

// stays on doc change
const notionFrameCls = ".notion-frame";
const outlineFrameCls = ".nb-outline";

// these gets removed on doc change
const notionScrollerCls = ".notion-frame .notion-scroller.vertical";
const notionPageContentCls = ".notion-page-content";

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

          addOutlineToggleBtn();
          addOutline();
          docEditListener();
          // add listener for page change or window reload
          // it detaches old listeners and adds new docEditListener and outline
          pageChangeObserverObj = pageChangeListener(
            [removeDocEditListener, hideOutline, removeOutlineToggleBtn],
            [addOutline, addOutlineToggleBtn, docEditListener]
          );
        }
        return null;
      })
      .catch((e) => console.log(e));
  } else {
    removeOutline();
  }
}

function addOutlineToggleBtn() {
  try {
    const outlineToggleBtn = "outlineToggleBtn";

    const addOutlineToNotion = () => {
      const siblingCls = ".notion-topbar-share-menu";
      console.log("add outline btn");
      onElementLoaded(siblingCls)
        .then((isPresent) => {
          const pageContent = getElement(notionPageContentCls);
          if (!pageContent) {
            console.log("no page content class");
            return;
          }

          // eslint-disable-next-line promise/always-return
          if (isPresent) {
            if (document.querySelector(`.${outlineToggleBtn}`)) {
              // btn already exist somehow
              return;
            }
            const sibling = document.querySelector(siblingCls);
            const btnEl = toElement(
              `<div class=${outlineToggleBtn} role="button" title="Show/hide outline" tabindex="-1">Outline</div>`
            );

            btnEl.onclick = () => {
              console.log("yup");
              const el = document.querySelector(".nb-outline");
              if (el) {
                el.classList.toggle("disableForPage");
                el.classList.toggle("show");
              }
            };

            sibling.parentNode.insertBefore(btnEl, sibling);
          }
        })
        .catch((e) => console.log(e));
    };

    const addOutlineToNotionSubdomain = () => {
      const siblingCls = ".notion-topbar > div > div.notion-focusable";
      console.log("add outline btn");
      onElementLoaded(siblingCls)
        .then((isPresent) => {
          const pageContent = getElement(notionPageContentCls);
          if (!pageContent) {
            console.log("no page content class");
            return;
          }

          // eslint-disable-next-line promise/always-return
          if (isPresent) {
            if (document.querySelector(`.${outlineToggleBtn}`)) {
              // btn already exist somehow
              return;
            }
            const sibling = document.querySelectorAll(siblingCls)[2];
            const btnEl = toElement(
              `<div class=${outlineToggleBtn} role="button" title="Show/hide outline" tabindex="-1">Outline</div>`
            );

            btnEl.onclick = () => {
              const el = document.querySelector(".nb-outline");
              if (el) {
                el.classList.toggle("disableForPage");
                el.classList.toggle("show");
              }
            };

            sibling.parentNode.insertBefore(btnEl, sibling);
          }
        })
        .catch((e) => console.log(e));
    };

    addOutlineToNotion();
    addOutlineToNotionSubdomain();
  } catch (e) {
    console.log("Error: ", e.message);
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

  removeOutlineToggleBtn();

  console.log("removed outline feature");
}

function removeOutlineToggleBtn() {
  const btn = document.querySelector(".outlineToggleBtn");

  if (btn) {
    btn.remove();
  }
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

  try {
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
      const script = `<script>
      function nbScrollToTop(){
        var doc = document.querySelector('.notion-frame > .notion-scroller'); doc.scroll({top: 0,left: 0});
      }
      </script>`;

      const scriptEl = document.createRange().createContextualFragment(script);
      document.body.append(scriptEl);

      // do not add any space between closing and ending of `
      outlineEl = toElement(`
      <div class="nb-outline">
        <div class="table_of_contents">
          <div class="title">
          <p title="Go to top" role="button" onClick="nbScrollToTop()">Outline</p>
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
    const pageHeadings = getElements(
      `${notionPageContentCls} [class$="header-block"]`
    );

    isHeadingsFound = pageHeadings.length > 0;

    const contains = {
      h1: false,
      h2: false,
      h3: false,
    };
    // add headings to outline view
    for (let i = 0; i < pageHeadings.length; i++) {
      let headingCls = "";
      const pageHeading = pageHeadings[i];
      if (pageHeading.classList.contains("notion-header-block")) {
        headingCls = "nb-h1";
        contains.h1 = true;
      } else if (pageHeading.classList.contains("notion-sub_header-block")) {
        headingCls = "nb-h2";
        contains.h2 = true;
      } else if (
        pageHeading.classList.contains("notion-sub_sub_header-block")
      ) {
        headingCls = "nb-h3";
        contains.h3 = true;
      } else {
        headingCls = "";
      }
      // @ts-ignore
      block = toElement(tocBlockHTML);
      // add text
      let text = "";
      pageHeading.querySelector("div").childNodes.forEach((hxEl) => {
        // heading is inside span
        if (["SPAN", "DIV"].includes(hxEl.nodeName)) {
          hxEl.childNodes.forEach((el) => {
            if (
              ["#text", "H1", "H2", "H3", "H4", "H5", "H6"].includes(
                el.nodeName
              )
            ) {
              // it's regualar text
              text += el.textContent;
            } else if (hxEl.nodeName === "A") {
              // it's link inside heading
              text += hxEl.textContent;
            } else if (el.nodeName === "IMG") {
              // emojis inside heading
              text += el.alt;
            }
            // handle toggle heading type
            else if (el.nodeName === "DIV") {
              const heading = el.querySelector("H1,H2,H3,H4,H5,H6");
              if (heading) {
                text += heading.textContent;
              }
            }
          });
        } else if (
          ["#text", "H1", "H2", "H3", "H4", "H5", "H6"].includes(hxEl.nodeName)
        ) {
          // it's regualar text
          text += hxEl.textContent;
        } else if (hxEl.nodeName === "A") {
          // it's link inside heading
          text += hxEl.textContent;
        } else if (hxEl.nodeName === "IMG") {
          // emojis inside heading
          text += hxEl.alt;
        }
      });
      // @ts-ignore
      block.querySelector(".align").classList.add(headingCls);
      // @ts-ignore
      block.querySelector(".text").textContent = text;
      // if (text.length > 20) {
      //   block.querySelector(".btn").title = text;
      // }

      // add href
      const blockId = pageHeading
        .getAttribute("data-block-id")
        .replace(/-/g, "");
      // @ts-ignore
      block.setAttribute("hash", blockId);
      // evaluate href at runtime cuz notion url is not consistent
      // @ts-ignore
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
      // if there's no h1 then reduce space from left
      if (!contains.h1) {
        if (contains.h2 && contains.h3) {
          // convert h2->h1 and h3->h2
          blockWrapperEl.querySelectorAll(".nb-h2").forEach((x) => {
            x.classList.add("nb-h1");
            x.classList.remove("nb-h2");
          });
          blockWrapperEl.querySelectorAll(".nb-h3").forEach((x) => {
            x.classList.add("nb-h2");
            x.classList.remove("nb-h3");
          });
        } else {
          // all are of same type i.e. h2 or h3 so convert to h1
          blockWrapperEl.querySelectorAll(".nb-h2").forEach((x) => {
            x.classList.add("nb-h1");
            x.classList.remove("nb-h2");
          });
          blockWrapperEl.querySelectorAll(".nb-h3").forEach((x) => {
            x.classList.add("nb-h1");
            x.classList.remove("nb-h3");
          });
        }
      }

      if (!outlineEl.classList.contains("disableForPage")) {
        outlineEl.classList.add("show");
      }
    }
  } catch (e) {
    console.error("Error: ", e.message);
  }
}

// UTILITY FUNCTIONS

// add/update outline if any heading change occurs
function docEditListener() {
  DEBUG && console.log("listening for doc edit changes...");

  docEditObserverObj = new MutationObserver((mutationList, obsrvr) => {
    DEBUG && console.log("found changes in doc content");

    let isDocHeadingChanged = false;

    let placeholder = "";
    for (let i = 0; i < mutationList.length; i++) {
      const m = mutationList[i];

      // case: check for text change in headings
      if (!isHeading(placeholder) && m.type === "characterData") {
        DEBUG && console.log(`changed text: ${m.target.textContent}`);

        if (!isHeading(placeholder) && m.target.parentNode) {
          // @ts-ignore
          placeholder = m.target.parentNode.getAttribute("placeholder");
        }

        // case: when styling (b/i) is added to heading
        if (
          !isHeading(placeholder) &&
          m.target.parentNode &&
          m.target.parentNode.parentNode
        ) {
          placeholder =
            // @ts-ignore
            m.target.parentNode.parentNode.getAttribute("placeholder");
        }
      }
      if (!isHeading(placeholder) && m.type === "childList") {
        // console.log("childList changed");

        // case: hitting backspace in headings
        // @ts-ignore
        placeholder = m.target.getAttribute("placeholder");

        // case: when empty heading is being removed
        if (
          !isHeading(placeholder) &&
          m.removedNodes.length > 0 &&
          // @ts-ignore
          m.removedNodes[0].firstElementChild
        ) {
          placeholder =
            // @ts-ignore
            m.removedNodes[0].firstElementChild.getAttribute("placeholder");

          if (placeholder) {
            // console.log("empty block got removed");
          }

          // case: when select and delete multiple headings
          if (
            !isHeading(placeholder) &&
            m.removedNodes.length > 0 &&
            // @ts-ignore
            m.removedNodes[0].firstElementChild.firstElementChild
          ) {
            placeholder =
              // @ts-ignore
              m.removedNodes[0].firstElementChild.firstElementChild.getAttribute(
                "placeholder"
              );

            // console.log("empty blocks got removed");
          }
        }

        // case: when empty heading is being added
        if (
          !isHeading(placeholder) &&
          m.addedNodes.length > 0 &&
          // @ts-ignore
          m.addedNodes[0].firstElementChild
        ) {
          placeholder =
            // @ts-ignore
            m.addedNodes[0].firstElementChild.getAttribute("placeholder");
          // console.log("empty block got added");
        }
      }

      // check if the change was related to headings
      if (isHeading(placeholder)) {
        DEBUG && console.log("heading changed");

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

  if (pageContentEl) {
    docEditObserverObj.observe(pageContentEl, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }
}

function isHeading(placeholder) {
  // check if the change was related to headings

  if (!placeholder || !placeholder.trim()) {
    return true;
  }
  const headings = ["Heading", "제목"];
  headings.forEach((x) => {
    if (placeholder.includes(x)) {
      return true;
    }
  });

  return false;
}
