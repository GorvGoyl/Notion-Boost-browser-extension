import $c from "../../lib/cash.min";

import { isEmpty, getDivByCls } from "../utility";

var pageChangeObserver = {};
var docEditObserver = {};

// keep classes in hierarchy of DOM

// stays on page change
const notionFrameCls = ".notion-frame";

const olFrameCls = ".nb-outline";

// these gets removed on doc change
const notionScrollerCls = ".notion-scroller.vertical.horizontal";

const notionPageContentCls = ".notion-page-content";

export function setOutline(enable) {
  if (enable) {
    console.log("setting up outline feature");

    // triggers on page load
    // it waits for doc to be loaded
    onElementLoaded(notionPageContentCls)
      .then((isPresent) => {
        if (isPresent) {
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

function removeOutline() {
  if (!isEmpty(pageChangeObserver)) {
    console.log("disconnected pageChangeObserver");
    pageChangeObserver.disconnect();
  }
  if (!isEmpty(docEditObserver)) {
    console.log("disconnected docEditObserver");
    pageChangeObserver.disconnect();
  }
  let outline = getDivByCls(olFrameCls);
  if (outline) {
    console.log("removed outline div");

    outline.remove();
  }

  console.log("removed outline feature");
}

function addOutline() {
  console.log("adding/updating OUTLINE");

  let pageContent = getDivByCls(notionPageContentCls);
  if (!pageContent) {
    console.log("no page content class");
    return;
  }

  // check if it outline exist already
  let tocEl = $c(olFrameCls);

  if (!tocEl || tocEl.length == 0) {
    // do not add any space between closing and ending of ` otherwise $ will create multiple elements
    tocEl = $c(`<div class="nb-outline">
      <div class="table_of_contents">
        <div class="title">
          <p>Outline</p>
        </div>
        <div class="block-wrapper">
        </div>
      </div>
      </div>`);

    // add toc container
    tocEl.insertBefore(notionScrollerCls);
  }

  // empty any previous bocks
  tocEl.find(".block-wrapper").empty();
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

  let blocks = pageContent.children;
  let block = "";
  for (let i = 0; i < blocks.length; i++) {
    let hCls = "";
    let b = blocks[i];
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
      block = $c(tocBlockHTML);

      // add text
      let text = b.textContent;
      block.find(".align").addClass(hCls);
      block.find(".text").text(text);

      // add href
      let blockId = b.getAttribute("data-block-id").replace(/-/g, "");
      block.attr("hash", blockId);
      // evaluate href at runtime cuz notion url is not consistent
      block.on("click", function () {
        $c(this).find("a")[0].href =
          window.location.pathname + "#" + $c(this).attr("hash");
      });

      tocEl.find(".block-wrapper").append(block);
    }
  }
}

// UTILITY FUNCTIONS

// return promise when div is loaded
// pass div and parent div class
function onElementLoaded(divClass, ParentDivClass) {
  console.log("waiting for element: " + divClass);
  const promise = new Promise((resolve, reject) => {
    try {
      if (getDivByCls(divClass)) {
        console.log("element already present: " + divClass);
        resolve(true);
      }
      const parentElement = ParentDivClass
        ? getDivByCls(ParentDivClass)
        : document;

      const observer = new MutationObserver((mutationList, obsrvr) => {
        const divToCheck = getDivByCls(divClass);
        // console.log("checking for div...");

        if (divToCheck) {
          console.log("element loaded: " + divClass);
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

function docEditListener() {
  if (!isEmpty(docEditObserver)) {
    console.log("already listening for doc edit changes");
    return;
  }
  console.log("listening for doc edit changes...");
  docEditObserver = new MutationObserver(function (mutationList, obsrvr) {
    console.log("found changes in doc content");

    let isDocHeadingChanged = false;

    let placeholder = "";
    for (let i = 0; i < mutationList.length; i++) {
      let m = mutationList[i];

      // case: check for text change in headings
      if (!isHeading(placeholder) && m.type === "characterData") {
        console.log("changed text: " + m.target.textContent);

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
      if (!isHeading(placeholder) && m.type == "childList") {
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

  // now add listener for doc text change
  var pageContentEl = getDivByCls(notionPageContentCls);

  docEditObserver.observe(pageContentEl, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}

function isHeading(placeholder) {
  // check if the change was related to headings
  if (
    placeholder == "Heading 1" ||
    placeholder == "Heading 2" ||
    placeholder == "Heading 3"
  ) {
    return true;
  }
  return false;
}
// add listener for page change or window reload
function pageChangeListener() {
  if (!isEmpty(pageChangeObserver)) {
    console.log("already listening for page change events");
    return;
  }
  console.log("listening for page change events...");
  // triggers whenever new doc is opened in notion without full reload
  pageChangeObserver = new MutationObserver(function (mutationList, obsrvr) {
    console.log("new page opened without full reload");

    // check if scroller class is loaded
    if (getDivByCls(notionScrollerCls)) {
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

  var docFrameEl = getDivByCls(notionFrameCls);

  pageChangeObserver.observe(docFrameEl, {
    childList: true,
  });
}
