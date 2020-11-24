import { getElement, onElementLoaded } from "../utility";

const notionHelpBtnCls = ".notion-help-button";
const notionBodyCls = ".notion-body";

export function hideComments(isEnabled) {
  try {
    console.log(`feature: hideComments: ${isEnabled}`);

    onElementLoaded(notionBodyCls)
      .then((isPresent) => {
        if (isPresent) {
          const el = getElement(notionBodyCls);
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

export function smallTextFullWidth(isEnabled) {
  try {
    console.log(`feature: smallTextFullWidth: ${isEnabled}`);

    onElementLoaded(notionBodyCls)
      .then((isPresent) => {
        if (isPresent) {
          const el = getElement(notionBodyCls);
          if (isEnabled) {
            el.classList.add("smallTextFullWidth-nb");
          } else {
            el.classList.remove("smallTextFullWidth-nb");
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

    onElementLoaded(notionBodyCls)
      .then((isPresent) => {
        if (isPresent) {
          const el = getElement(notionBodyCls);
          if (isEnabled) {
            el.classList.add("bolder");
          } else {
            el.classList.remove("bolder");
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
