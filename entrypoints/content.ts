import '../styles/content.scss';
import { codeLineNumbers } from '../components/features/codeLineNumbers';
import { openFullPage } from '../components/features/openFullPage';
import { displayOutline } from '../components/features/outline';
import * as features from '../components/features/pageElements';
import { rollupUrlClickable } from '../components/features/rollupUrlClickable';
import { scrollTopBtn } from '../components/features/scrollToTopBtn';
// step 1 of 2: import feature
import { spellcheckForCode } from '../components/features/spellCheckForCode';
import { defaultSettings } from '../components/settings';
import { getLatestSettings, isEmpty } from '../components/utils';

let featureList: any = {};

featureList = { ...features };

// step 2 of 2: add that feature to featureList object
featureList.displayOutline = displayOutline;
featureList.scrollTopBtn = scrollTopBtn;
featureList.codeLineNumbers = codeLineNumbers;
featureList.spellcheckForCode = spellcheckForCode;
featureList.openFullPage = openFullPage;
featureList.rollupUrlClickable = rollupUrlClickable;

export default defineContentScript({
    matches: ['*://*.notion.so/*', '*://*.notion.site/*'],
    main() {
        init();

        browser.storage.onChanged.addListener((changes, namespace) => {
            console.log(changes);
            console.log(namespace);
            const func = changes.nb_settings.newValue.call_func;
            featureList[func.name](func.arg);
        });

        if (document.readyState !== 'loading') {
            console.log('document is already ready');
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('document was not ready');
            });
        }

        window.onload = () => {
            // same as window.addEventListener('load', (event) => {
            console.log('window is ready');
        };
    },
});

function init() {
    let syncSet: any = {};
    const updatedSet = { ...defaultSettings };

    getLatestSettings()
        .then((set: any) => {
            console.log('LatestSettings: ', set);

            console.log('enabling features...');
            // on page load, execute only enabled features
            for (const func of Object.keys(set)) {
                const isEnabled = set[func];
                if (isEnabled) {
                    featureList[func](isEnabled);
                }
            }
            return null;
        })
        .catch((e) => console.log(e));

    browser.storage.sync.get(['nb_settings']).then((result) => {
        syncSet = result;

        // merge synced settings with default settings and then apply updated settings
        if (!isEmpty(syncSet)) {
            for (const k of Object.keys(defaultSettings)) {
                if (
                    k in syncSet &&
                    !isEmpty(syncSet[k as keyof typeof syncSet]) &&
                    syncSet[k as keyof typeof syncSet] !== defaultSettings[k as keyof typeof defaultSettings]
                ) {
                    updatedSet[k as keyof typeof updatedSet] = syncSet[k as keyof typeof syncSet];
                }
            }
        }
    });
}
