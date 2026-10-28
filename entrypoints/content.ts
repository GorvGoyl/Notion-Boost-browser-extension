import '../styles/content.scss';
import { codeLineNumbers } from '../components/features/codeLineNumbers';
import { openFullPage } from '../components/features/openFullPage';
import { displayOutline } from '../components/features/outline';
import * as features from '../components/features/pageElements';
import { scrollTopBtn } from '../components/features/scrollToTopBtn';
// step 1 of 2: import feature
import { spellcheckForCode } from '../components/features/spellCheckForCode';
import { getLatestSettings } from '../components/utils';
import { hideAiBtn, hideTableOfContents } from '../components/features/pageElements';

let featureList: any = {};

featureList = { ...features };

// step 2 of 2: add that feature to featureList object
featureList.displayOutline = displayOutline;
featureList.scrollTopBtn = scrollTopBtn;
featureList.codeLineNumbers = codeLineNumbers;
featureList.spellcheckForCode = spellcheckForCode;
featureList.openFullPage = openFullPage;
featureList.hideAiBtn = hideAiBtn;
featureList.hideTableOfContents = hideTableOfContents;

export default defineContentScript({
    matches: ['*://*.notion.so/*', '*://*.notion.site/*', '*://*.notion.com/*'],
    // Notion Calendar and Notion Mail are separate apps that none of the features are for
    excludeMatches: [
        '*://calendar.notion.so/*',
        '*://calendar.notion.com/*',
        '*://mail.notion.so/*',
        '*://mail.notion.com/*',
    ],
    main() {
        init();

        browser.storage.onChanged.addListener((changes, namespace) => {
            console.debug(changes);
            console.debug(namespace);
            const func = (changes.nb_settings.newValue as any).call_func;
            // an older version of the extension on another synced device can still name a removed feature
            featureList[func.name]?.(func.arg);
        });

        if (document.readyState !== 'loading') {
            console.debug('document is already ready');
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                console.debug('document was not ready');
            });
        }

        window.onload = () => {
            // same as window.addEventListener('load', (event) => {
            console.debug('window is ready');
        };
    },
});

function init() {
    getLatestSettings()
        .then((set: any) => {
            console.debug('LatestSettings: ', set);

            console.debug('enabling features...');
            // on page load, execute only enabled features
            for (const func of Object.keys(set)) {
                const isEnabled = set[func];
                if (isEnabled) {
                    featureList[func](isEnabled);
                }
            }
            return null;
        })
        .catch((e) => console.debug(e));
}
