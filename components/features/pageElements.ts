import { getElement, isObserverType, onElementLoaded, simulateKey } from '../utils';

const notionAiBtnCls = '[role=button].notion-ai-button';
const notionAppId = '#notion-app';

// To add theme based color: check indentationLines sass class

const notionCursorListenerCls = '.notion-cursor-listener';
let titleObserver = {};
export function hideComments(isEnabled: boolean) {
    try {
        console.log(`feature: hideComments: ${isEnabled}`);

        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    const el = getElement(notionAppId);
                    if (isEnabled) {
                        el.classList.add('hideComments-nb');
                    } else {
                        el.classList.remove('hideComments-nb');
                    }
                }
                return null;
            })
            .catch((e) => console.error(e));
    } catch (e) {
        console.error(e);
    }
}

export function hideBacklinks(isEnabled: boolean) {
    try {
        console.log(`feature: hideBacklinks: ${isEnabled}`);

        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    const el = getElement(notionAppId);
                    if (isEnabled) {
                        el.classList.add('hideBacklinks');
                    } else {
                        el.classList.remove('hideBacklinks');
                    }
                }
                return null;
            })
            .catch((e) => console.error(e));
    } catch (e) {
        console.error(e);
    }
}

export function disableSlashCommandPlaceholder(isEnabled: boolean) {
    try {
        console.log(`feature: disableSlashCommandPlaceholder: ${isEnabled}`);

        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    const el = getElement(notionAppId);
                    if (isEnabled) {
                        el.classList.add('disableSlashCommandPlaceholder');
                    } else {
                        el.classList.remove('disableSlashCommandPlaceholder');
                    }
                }
                return null;
            })
            .catch((e) => console.error(e));
    } catch (e) {
        console.error(e);
    }
}

export function smallText(isEnabled: boolean) {
    try {
        console.log(`feature: smallText: ${isEnabled}`);

        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    const el = getElement(notionAppId);
                    if (isEnabled) {
                        el.classList.add('smallText');
                    } else {
                        el.classList.remove('smallText');
                    }
                }
                return null;
            })
            .catch((e) => console.error(e));
    } catch (e) {
        console.error(e);
    }
}

export function fullWidth(isEnabled: boolean) {
    try {
        console.log(`feature: fullWidth: ${isEnabled}`);

        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    const el = getElement(notionAppId);
                    if (isEnabled) {
                        el.classList.add('fullWidth');
                    } else {
                        el.classList.remove('fullWidth');
                    }
                }
                return null;
            })
            .catch((e) => console.log(e));
    } catch (e) {
        console.log(e);
    }
}

export function borderOnImages(isEnabled: boolean) {
    try {
        console.log(`feature: borderOnImages: ${isEnabled}`);

        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    const el = getElement(notionAppId);
                    if (isEnabled) {
                        el.classList.add('borderOnImages');
                    } else {
                        el.classList.remove('borderOnImages');
                    }
                }
            })
            .catch((e) => console.log(e));
    } catch (e) {
        console.log(e);
    }
}

export function bolderTextInDark(isEnabled: boolean) {
    try {
        console.log(`feature: bolderTextInDark: ${isEnabled}`);

        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    const el = getElement(notionAppId);
                    if (isEnabled) {
                        el.classList.add('bolder');
                    } else {
                        el.classList.remove('bolder');
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

export function hideAiBtn(isHidden: boolean) {
    try {
        console.debug(`feature: hideAiBtn: ${isHidden}`);

        onElementLoaded(notionAiBtnCls)
            .then((isPresent) => {
                if (isPresent) {
                    const el = getElement(notionAiBtnCls);
                    if (isHidden) {
                        el.style.display = 'none';
                    } else {
                        el.style.display = 'flex';
                    }
                    console.log(`${notionAiBtnCls} style is ${el.style.display}`);
                }
                return null;
            })
            .catch((e) => console.log(e));
    } catch (e) {
        console.log(e);
    }
}

export function hideSlashMenuAfterSpace(isEnabled: boolean) {
    try {
        console.log(`feature: hideSlashMenuAfterSpace: ${isEnabled}`);

        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    if (isEnabled) {
                        getElement(notionAppId).addEventListener('keydown', hideSlashMenuAfterSpaceEvent);
                    } else {
                        getElement(notionAppId).removeEventListener('keydown', hideSlashMenuAfterSpaceEvent);
                    }
                }
                return null;
            })
            .catch((e) => console.log(e));
    } catch (e) {
        console.log(e);
    }
}

export function disableSlashMenu(isEnabled: boolean) {
    try {
        console.log(`feature: disableSlashMenu: ${isEnabled}`);

        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    if (isEnabled) {
                        // this preceeds 'hideSlashMenuAfterSpaceEvent' so remove that first
                        getElement(notionAppId).removeEventListener('keydown', hideSlashMenuAfterSpaceEvent);

                        window.addEventListener('keyup', disableSlashMenuEvent, {});
                    } else {
                        window.removeEventListener('keyup', disableSlashMenuEvent, {});
                    }
                }
                return null;
            })
            .catch((e) => console.log(e));
    } catch (e) {
        console.log(e);
    }
}

export function disableAiAfterSpaceKey(isEnabled: boolean) {
    try {
        console.log(`feature: disableAiAfterSpaceKey: ${isEnabled}`);

        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    if (isEnabled) {
                        // simulate esc key to prevent menu from appearing
                        window.addEventListener('keydown', disableAiAfterSpaceKeyHandler);
                    } else {
                        window.removeEventListener('keydown', disableAiAfterSpaceKeyHandler);
                    }
                }
                return null;
            })
            .catch((e) => console.log(e));
    } catch (e) {
        console.log(e);
    }
}

export function hideNotification(isEnabled: boolean) {
    try {
        console.log(`feature: hideNotification: ${isEnabled}`);

        const removeBadgeFromTitle = () => {
            if (document.title.indexOf(')') > -1) {
                document.title = document.title.substring(document.title.indexOf(')') + 2);
            }
        };
        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    const el = getElement(notionAppId);
                    if (isEnabled) {
                        el.classList.add('hideNotification');
                        removeBadgeFromTitle();
                        // select the target node
                        const target = document.querySelector('title') as Node;

                        // create an observer instance
                        titleObserver = new MutationObserver((mutations) => {
                            removeBadgeFromTitle();
                        });

                        // configuration of the observer:
                        const config = {
                            subtree: true,
                            characterData: true,
                            childList: true,
                        };

                        // pass in the target node, as well as the observer options
                        (titleObserver as MutationObserver).observe(target, config);
                    } else {
                        el.classList.remove('hideNotification');
                        if (isObserverType(titleObserver)) {
                            console.log('disconnected docEditObserver');
                            (titleObserver as MutationObserver).disconnect();
                        }
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

export function leftAlignMedia(isEnabled: boolean) {
    try {
        console.log(`feature: leftAlignMedia: ${isEnabled}`);

        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    const el = getElement(notionAppId);
                    if (isEnabled) {
                        el.classList.add('leftAlignMedia');
                    } else {
                        el.classList.remove('leftAlignMedia');
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

export function addMoreHeightToPage(isEnabled: boolean) {
    try {
        console.log(`feature: addMoreHeightToPage: ${isEnabled}`);

        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    const el = getElement(notionAppId);
                    if (isEnabled) {
                        el.classList.add('addMoreHeightToPage');
                    } else {
                        el.classList.remove('addMoreHeightToPage');
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

export function narrowListItems(isEnabled: boolean) {
    try {
        console.log(`feature: narrowListItems: ${isEnabled}`);

        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    const el = getElement(notionAppId);
                    if (isEnabled) {
                        el.classList.add('narrowListItems');
                    } else {
                        el.classList.remove('narrowListItems');
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

// export function enableSpellcheckForCode(isEnabled) {
//   try {
//     console.log(`feature: enableSpellcheckForCode: ${isEnabled}`);

//     onElementLoaded(notionAppInnerCls)
//       .then((isPresent) => {
//         if (isPresent) {
//           const codeDivs = document.querySelectorAll(
//             "div.notion-page-content > div.notion-selectable.notion-code-block div.notion-code-block > div"
//           );

//           if (isEnabled) {
//             codeDivs.forEach((x) => {
//               x.setAttribute("spellcheck", "true");
//             });
//           } else {
//             codeDivs.forEach((x) => {
//               x.setAttribute("spellcheck", "false");
//             });
//           }
//         }
//         return null;
//       })
//       .catch((e) => console.log(e));
//   } catch (e) {
//     console.log(e);
//   }
// }

export function showHoverText(isEnabled: boolean) {
    try {
        console.log(`feature: showHoverText: ${isEnabled}`);

        // TODO: replace notionCursorListener with notionAppInner after fixing theme bug
        onElementLoaded(notionCursorListenerCls)
            .then((isPresent) => {
                if (isPresent) {
                    const el = getElement(notionCursorListenerCls);
                    if (isEnabled) {
                        el.classList.add('showHoverText');
                    } else {
                        el.classList.remove('showHoverText');
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

export function hideHiddenColumns(isHidden: boolean) {
    try {
        console.log(`feature: hideHiddenColumns: ${isHidden}`);

        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    const el = getElement(notionAppId);
                    if (isHidden) {
                        el.classList.add('hideHiddenColumns');
                    } else {
                        el.classList.remove('hideHiddenColumns');
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

export function disablePopupOnURLPaste(isEnabled: boolean) {
    try {
        console.log(`feature: disablePopupOnURLPaste: ${isEnabled}`);

        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    if (isEnabled) {
                        getElement(notionAppId).addEventListener('paste', disablePopupOnURLPasteEvent);
                    } else {
                        getElement(notionAppId).removeEventListener('paste', disablePopupOnURLPasteEvent);
                    }
                }
                return null;
            })
            .catch((e) => console.log(e));
    } catch (e) {
        console.log(e);
    }
}

export function indentationLines(isHidden: boolean) {
    try {
        console.log(`feature: indentationLines: ${isHidden}`);

        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    const el = getElement(notionAppId);
                    if (isHidden) {
                        el.classList.add('indentationLines');
                    } else {
                        el.classList.remove('indentationLines');
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

// #region ## ----------------- internal methods ----------------- ##

function disablePopupOnURLPasteEvent(e: any) {
    const content = e.clipboardData.getData('text/plain');

    // hide popup for external urls matching "xx.yy "
    if (
        (!content.includes(' ') || content.slice(-1) === ' ') &&
        !content.includes('notion.so') &&
        content.includes('.')
    ) {
        console.log('inside disablePopupOnURLPasteEvent');
        const dismissBtn =
            '#notion-app .notion-overlay-container.notion-default-overlay-container .notion-embed-menu .notion-scroller.vertical > div > div > div:nth-child(1)';
        onElementLoaded(dismissBtn)
            .then((ex) => {
                simulateKey('esc');
            })
            .catch((ex) => {
                console.log(ex);
            });
    }
}

function isSlashMenuVisible() {
    // this selector covers both scenario of slash menu when it appears in main doc or inside popup doc
    const slashMenuCls =
        '#notion-app > div > div.notion-overlay-container.notion-default-overlay-container > div > div > div > div:nth-child(2) > div > div > div > div > div.notion-scroller.vertical';
    const isVisible = getElement(slashMenuCls) !== null;
    return isVisible;
}

function hideSlashMenuAfterSpaceEvent(e: any) {
    try {
        const spaceKey = ' ';
        // console.log(e);
        if (e.key === spaceKey) {
            if (e.target.textContent.includes('/')) {
                if (isSlashMenuVisible()) {
                    // hide slash menu by simulating ESC key
                    simulateKey('esc');
                    console.info('slash menu hid');
                }
            }
        }
    } catch (x) {
        console.error(e);
    }
}

function disableAiAfterSpaceKeyHandler(e: any) {
    if (e.code === 'Space') {
        e.preventDefault();
        document.execCommand('insertText', false, ' ');
    }
}

function disableSlashMenuEvent(e: any) {
    const slashKey = '/';

    const insideTable = e?.path?.some((x: any) => {
        if (
            e?.target?.classList?.contains('notranslate') && // select only cells and not preview window
            x?.classList?.contains('notion-default-overlay-container') &&
            x?.classList?.contains('notion-overlay-container')
        ) {
            return true;
        }
        return false;
    });

    // don't simulate esc when using slash key inside table cell becuz it'll exit the table
    // If the slash key is pressed, without the ctrl/cmd key (would be intent to modify selected block)
    //   https://notion.notion.site/Learn-the-shortcuts-66e28cec810548c3a4061513126766b0#5c679ece35ee4e81b1217333a4cf35b3
    if (e.code === 'Slash' && !insideTable && !(e.ctrlKey || e.metaKey)) {
        // hide popup menu as soon as it's added to DOM
        onElementLoaded(
            'div.notion-scroller.vertical',
            // @ts-ignore
            'div.notion-overlay-container.notion-default-overlay-container',
        )
            .then(() => {
                console.log('popup found');
                simulateKey('esc');
                console.log('hid menu');
            })
            .catch((e2) => {
                console.error(e2);
            });
    }
}

export function hideTableOfContents(isEnabled: boolean) {
    try {
        console.debug(`feature: hideTableOfContents: ${isEnabled}`);

        onElementLoaded(notionAppId)
            .then((isPresent) => {
                if (isPresent) {
                    const el = getElement(notionAppId);
                    if (isEnabled) {
                        el.classList.add('hideTableOfContents');
                    } else {
                        el.classList.remove('hideTableOfContents');
                    }
                }
                return null;
            })
            .catch((e) => console.error(e));
    } catch (e) {
        console.error(e);
    }
}
