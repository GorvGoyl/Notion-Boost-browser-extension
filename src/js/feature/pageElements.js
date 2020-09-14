import { getElement, onElementLoaded } from "../utility";

const notionHelpBtnCls = ".notion-help-button";

export default function hideHelpBtn(isHide) {
  try {
    console.log(`feature: hideHelpBtn: ${isHide}`);

    onElementLoaded(notionHelpBtnCls)
      .then((isPresent) => {
        if (isPresent) {
          const el = getElement(notionHelpBtnCls);
          if (isHide) {
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
