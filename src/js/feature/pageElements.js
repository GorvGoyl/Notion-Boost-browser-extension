import { getElement } from "../utility";

export default function hideHelpBtn(isHide) {
  console.log(`feature: hideHelpBtn: ${isHide}`);
  const el = getElement(".notion-help-button");
  if (isHide) {
    el.style.display = "none";
  } else {
    el.style.display = "flex";
  }
}
