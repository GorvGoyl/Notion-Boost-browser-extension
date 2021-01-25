import {
  getElement,
  onElementLoaded,
  toElement,
  pageChangeListener,
  removePageChangeListener,
} from "../utility";

const notionFrameCls = ".notion-frame";
let pageChangeObserverObj = {};
let ticking = false;
let isBtnVisible = false;
let scrollBtn = "";
let docElement = "";

export function scrollTopBtn(isEnabled) {
  try {
    console.log(`feature: scrollTopBtn: ${isEnabled}`);

    onElementLoaded(notionFrameCls)
      .then((isPresent) => {
        if (isPresent) {
          if (isEnabled) {
            addScrollTopBtn();
          } else {
            removeScrollTopBtn();
          }
        }
        return null;
      })

      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
}

// Internal methods //

function bindScrollEventToDoc() {
  docElement = getElement(".notion-frame > .notion-scroller");
  docElement.addEventListener("scroll", handleScrollEvent);
  adjustBtnVisibilty();
  console.log("added bindScrollEventToDoc");
}
function scrollToTop() {
  docElement.scroll({
    top: 0,
    left: 0,
    // behavior: "auto",
  });
}
function addScrollTopBtn() {
  // add btn div to HTML
  const btnHTML = `<div class="scroll-top-btn" title="Scroll back to top" role="button" tabindex="0">⭡</div>`;
  getElement(notionFrameCls).after(toElement(btnHTML));
  console.log("inserted scroll btn div");
  scrollBtn = getElement(".scroll-top-btn");
  // scrollTopBtn.classList.add(btnCls);
  // add onclick event
  scrollBtn.addEventListener("click", scrollToTop);
  adjustBtnVisibilty();

  // add scroll event to doc
  bindScrollEventToDoc();

  // re-add scroll event on page change
  pageChangeObserverObj = pageChangeListener([bindScrollEventToDoc], []);
}

function handleScrollEvent() {
  // console.log("scroll event fired");

  if (!ticking) {
    // optimizing scroll event
    window.requestAnimationFrame(() => {
      // console.log("requestAnimationFrame fired");
      adjustBtnVisibilty();
    });

    ticking = true;
  }
}

function adjustBtnVisibilty() {
  // show scroll btn when user scroll down 100% of window height
  const didUserScrollDown = docElement.scrollTop >= docElement.clientHeight;

  if (didUserScrollDown) {
    // Show button if it's not shown
    if (!isBtnVisible) {
      scrollBtn.classList.add("show");
      isBtnVisible = true;
      console.log("btn shown");
    }
  } else if (isBtnVisible) {
    // Hide button if it's not hidden
    scrollBtn.classList.remove("show");
    isBtnVisible = false;
    console.log("btn hidden");
  }
  ticking = false;
}
function removeScrollTopBtn() {
  removePageChangeListener(pageChangeObserverObj);

  isBtnVisible = false;
  if (scrollBtn) {
    scrollBtn.remove();
    console.log("scrollTopBtn removed");
  }
}
