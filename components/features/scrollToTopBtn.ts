import {
  getElement,
  onElementLoaded,
  toElement,
  pageChangeListener,
  removePageChangeListener,
} from '../utils';

const notionFrameCls = '.notion-frame';
// replaced on page change
const notionScrollerCls = '.notion-frame .notion-scroller.vertical';
let pageChangeObserverObj = {};
let ticking = false;
let isBtnVisible = false;
let scrollBtn: HTMLElement | undefined;
let docElement: HTMLElement | undefined;
// an SVG, not a character: fonts on Linux lack the ⭡ the button used to show, which came out as an empty box
const arrowIcon = `<svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"/></svg>`;

export function scrollTopBtn(isEnabled: boolean) {
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

// listen to the scroller of the page that's open; without one yet, the page change listener calls this again
function bindScrollEventToDoc() {
  const scrollerEl = getElement(notionScrollerCls);
  if (!scrollerEl) return;

  if (scrollerEl !== docElement) {
    docElement?.removeEventListener('scroll', handleScrollEvent);
    docElement = scrollerEl;
    scrollerEl.addEventListener('scroll', handleScrollEvent);
    console.log('added bindScrollEventToDoc');
  }
  adjustBtnVisibilty();
}
function scrollToTop() {
  docElement?.scroll({
    top: 0,
    left: 0,
    // behavior: "auto",
  });
}
function addScrollTopBtn() {
  // already added
  if (scrollBtn) return;

  // add btn div to HTML
  const btnHTML = `<div class="scroll-top-btn" title="Scroll back to top" role="button" tabindex="0">${arrowIcon}</div>`;
  const btnEl = toElement(btnHTML);
  getElement(notionFrameCls).after(btnEl);
  console.log('inserted scroll btn div');
  // add onclick event
  btnEl.addEventListener('click', scrollToTop);
  scrollBtn = btnEl;

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
  ticking = false;
  if (!docElement || !scrollBtn) return;

  // show scroll btn when user scroll down 100% of window height
  const didUserScrollDown = docElement.scrollTop >= docElement.clientHeight;

  if (didUserScrollDown) {
    // Show button if it's not shown
    if (!isBtnVisible) {
      scrollBtn.classList.add('show');
      isBtnVisible = true;
      console.log('btn shown');
    }
  } else if (isBtnVisible) {
    // Hide button if it's not hidden
    scrollBtn.classList.remove('show');
    isBtnVisible = false;
    console.log('btn hidden');
  }
}
function removeScrollTopBtn() {
  removePageChangeListener(pageChangeObserverObj);
  pageChangeObserverObj = {};

  docElement?.removeEventListener('scroll', handleScrollEvent);
  docElement = undefined;
  isBtnVisible = false;
  if (scrollBtn) {
    scrollBtn.remove();
    scrollBtn = undefined;
    console.log('scrollTopBtn removed');
  }
}
