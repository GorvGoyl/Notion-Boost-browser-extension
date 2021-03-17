import { getElement, onElementLoaded, onElementCSSChanged } from "../utility";

const notionHelpBtnCls = ".notion-help-button";
const notionBodyCls = ".notion-body";
const notionAppId = "#notion-app";
const notionAppInner = ".notion-app-inner";
const notionCursorListener = ".notion-cursor-listener";

export function hideComments(isEnabled) {
  try {
    console.log(`feature: hideComments: ${isEnabled}`);

    onElementLoaded(notionAppInner)
      .then((isPresent) => {
        if (isPresent) {
          const el = getElement(notionAppInner);
          if (isEnabled) {
            el.classList.add("hideComments-nb");
          } else {
            el.classList.remove("hideComments-nb");
          }
        }
        return null;
      })
      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
}

export function smallText(isEnabled) {
  try {
    console.log(`feature: smallText: ${isEnabled}`);

    onElementLoaded(notionAppInner)
      .then((isPresent) => {
        if (isPresent) {
          const el = getElement(notionAppInner);
          if (isEnabled) {
            el.classList.add("smallText");
          } else {
            el.classList.remove("smallText");
          }
        }
        return null;
      })
      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
}

export function fullWidth(isEnabled) {
  try {
    console.log(`feature: fullWidth: ${isEnabled}`);

    onElementLoaded(notionAppInner)
      .then((isPresent) => {
        if (isPresent) {
          const el = getElement(notionAppInner);
          if (isEnabled) {
            el.classList.add("fullWidth");
          } else {
            el.classList.remove("fullWidth");
          }
        }
        return null;
      })
      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
}

export function bolderTextInDark(isEnabled) {
  try {
    console.log(`feature: bolderTextInDark: ${isEnabled}`);

    onElementLoaded(notionAppInner)
      .then((isPresent) => {
        if (isPresent) {
          const el = getElement(notionAppInner);
          if (isEnabled) {
            el.classList.add("bolder");
          } else {
            el.classList.remove("bolder");
          }
          // console.log(`${notionAppInner} style is ${el.style.display}`);
        }
        return null;
      })
      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
}

export function hideHelpBtn(isHidden) {
  try {
    console.log(`feature: hideHelpBtn: ${isHidden}`);

    onElementLoaded(notionHelpBtnCls)
      .then((isPresent) => {
        if (isPresent) {
          const el = getElement(notionHelpBtnCls);
          if (isHidden) {
            el.style.display = "none";
          } else {
            el.style.display = "flex";
          }
          console.log(`${notionHelpBtnCls} style is ${el.style.display}`);
        }
        return null;
      })
      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
}

export function hideSlashMenuAfterSpace(isEnabled) {
  try {
    console.log(`feature: hideSlashMenuAfterSpace: ${isEnabled}`);

    onElementLoaded(notionAppId)
      .then((isPresent) => {
        if (isPresent) {
          if (isEnabled) {
            getElement(notionAppId).addEventListener(
              "keydown",
              hideSlashMenuAfterSpaceEvent
            );
          } else {
            getElement(notionAppId).removeEventListener(
              "keydown",
              hideSlashMenuAfterSpaceEvent
            );
          }
        }
        return null;
      })
      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
}

export function disableSlashMenu(isEnabled) {
  try {
    console.log(`feature: disableSlashMenu: ${isEnabled}`);

    onElementLoaded(notionAppId)
      .then((isPresent) => {
        if (isPresent) {
          if (isEnabled) {
            // this preceeds 'hideSlashMenuAfterSpaceEvent' so remove that first
            getElement(notionAppId).removeEventListener(
              "keydown",
              hideSlashMenuAfterSpaceEvent
            );

            // simulate click for both events to prevent menu from appearing
            getElement(notionAppId).addEventListener(
              "keydown",
              disableSlashMenuEvent
            );
            getElement(notionAppId).addEventListener(
              "keyup",
              disableSlashMenuEvent
            );
          } else {
            getElement(notionAppId).removeEventListener(
              "keydown",
              disableSlashMenuEvent
            );
            getElement(notionAppId).removeEventListener(
              "keyup",
              disableSlashMenuEvent
            );
          }
        }
        return null;
      })
      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
}

export function leftAlignImage(isEnabled) {
  try {
    console.log(`feature: leftAlignImage: ${isEnabled}`);

    onElementLoaded(notionAppInner)
      .then((isPresent) => {
        if (isPresent) {
          const el = getElement(notionAppInner);
          if (isEnabled) {
            el.classList.add("leftAlignImage");
          } else {
            el.classList.remove("leftAlignImage");
          }
          // console.log(`${notionBodyCls} style is ${el.style.display}`);
        }
        return null;
      })
      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
}

export function addMoreHeightToPage(isEnabled) {
  try {
    console.log(`feature: addMoreHeightToPage: ${isEnabled}`);

    onElementLoaded(notionAppInner)
      .then((isPresent) => {
        if (isPresent) {
          const el = getElement(notionAppInner);
          if (isEnabled) {
            el.classList.add("addMoreHeightToPage");
          } else {
            el.classList.remove("addMoreHeightToPage");
          }
          // console.log(`${notionBodyCls} style is ${el.style.display}`);
        }
        return null;
      })
      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
}
export function enableSpellcheckForCode(isEnabled) {
  try {
    console.log(`feature: showHoverText: ${isEnabled}`);

    onElementLoaded(notionAppInner)
      .then((isPresent) => {
        if (isPresent) {
          const codeDivs = document.querySelectorAll(
            "div.notion-page-content > div.notion-selectable.notion-code-block div.notion-code-block > div"
          );

          if (isEnabled) {
            codeDivs.forEach((x) => {
              x.setAttribute("spellcheck", "true");
            });
          } else {
            codeDivs.forEach((x) => {
              x.setAttribute("spellcheck", "false");
            });
          }
        }
        return null;
      })
      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
}

export function showHoverText(isEnabled) {
  try {
    console.log(`feature: showHoverText: ${isEnabled}`);

    // TODO: replace notionCursorListener with notionAppInner after fixing theme bug
    onElementLoaded(notionCursorListener)
      .then((isPresent) => {
        if (isPresent) {
          const el = getElement(notionCursorListener);
          if (isEnabled) {
            el.classList.add("showHoverText");
          } else {
            el.classList.remove("showHoverText");
          }
          // console.log(`${notionCursorListener} style is ${el.style.display}`);
        }
        return null;
      })
      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
}

export function hideHiddenColumns(isHidden) {
  try {
    console.log(`feature: hideHiddenColumns: ${isHidden}`);

    onElementLoaded(notionAppInner)
      .then((isPresent) => {
        if (isPresent) {
          const el = getElement(notionAppInner);
          if (isHidden) {
            el.classList.add("hideHiddenColumns");
          } else {
            el.classList.remove("hideHiddenColumns");
          }
          // console.log(`${notionBodyCls} style is ${el.style.display}`);
        }
        return null;
      })
      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
}

export function disablePopupOnURLPaste(isEnabled) {
  try {
    console.log(`feature: disablePopupOnURLPaste: ${isEnabled}`);

    onElementLoaded(notionAppId)
      .then((isPresent) => {
        if (isPresent) {
          if (isEnabled) {
            getElement(notionAppId).addEventListener(
              "paste",
              disablePopupOnURLPasteEvent
            );
          } else {
            getElement(notionAppId).removeEventListener(
              "paste",
              disablePopupOnURLPasteEvent
            );
          }
        }
        return null;
      })
      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
}

// #region ## ----------------- internal methods ----------------- ##

function disablePopupOnURLPasteEvent(e) {
  const content = e.clipboardData.getData("text/plain");

  // hide popup for external urls matching "xx.yy "
  if (
    (!content.includes(" ") || content.slice(-1) === " ") &&
    !content.includes("notion.so") &&
    content.includes(".")
  ) {
    onElementLoaded(
      "#notion-app > div > div.notion-overlay-container.notion-default-overlay-container > div:nth-child(2) > div > div > div:nth-child(2) > div > div > div > div > div"
    )
      .then((ex) => {
        document.querySelector(
          "#notion-app > div > div.notion-overlay-container.notion-default-overlay-container > div:nth-child(2)"
        ).style.display = "none";
        console.log("stopped");

        const ke = new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          keyCode: 13,
        });

        const doc = document.querySelector(
          "#notion-app > div > div.notion-cursor-listener.showHoverText > div.notion-frame > div.notion-scroller.vertical.horizontal"
        );

        onElementCSSChanged(doc, 2000)
          .then((ex2) => {
            doc.style.overflow = "auto";
            doc.style.marginRight = "0px";
            console.log("applied");
            return true;
          })
          .catch((ex2) => {
            console.log(ex2);
          });

        return true;
      })
      .catch((ex) => {
        console.log(ex);
      });
  }
}

function isSlashMenuVisible() {
  // this selector covers both scenario of slash menu when it appears in main doc or inside popup doc
  const slashMenuCls =
    "#notion-app > div > div.notion-overlay-container.notion-default-overlay-container > div > div > div > div:nth-child(2) > div > div > div > div > div.notion-scroller.vertical";
  const isVisible = getElement(slashMenuCls) !== null;
  return isVisible;
}

function hideSlashMenuAfterSpaceEvent(e) {
  try {
    const spaceKey = " ";
    if (e.key === spaceKey) {
      // const cursorPos = window.getSelection().getRangeAt(0).startOffset;
      // const lastChar = e.target.textContent[cursorPos - 1];
      // debugger;
      if (e.target.textContent.includes("/")) {
        if (isSlashMenuVisible()) {
          // hide slash menu by clicking
          e.target.click();
          console.info("slash menu hid");
        }
      }
    }
  } catch (x) {
    console.log(`Error: ${JSON.stringify(x)}`);
  }
}

function disableSlashMenuEvent(e) {
  const slashKey = "/";
  if (e.key === slashKey) {
    // hide menu before it's appearing
    e.target.click();
    console.info("slash menu hid");
  }
}

// #endregion
