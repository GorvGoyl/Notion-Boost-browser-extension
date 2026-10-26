import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ['@wxt-dev/module-react'],
    manifestVersion: 3,
    outDir: 'build',
    // dev and production builds share build/chrome-mv3 (WXT's default puts dev builds in build/chrome-mv3-dev)
    outDirTemplate: '{{browser}}-mv{{manifestVersion}}',
    zip: {
        name: 'notion_boost',
        artifactTemplate: '{{name}}_{{browser}}.zip',
        sourcesTemplate: '{{name}}_sourcecode.zip',
        // the source zip goes to Firefox's reviewers: keep out the private key for packing .crx files
        excludeSources: ['**/*.pem'],
    },
    manifest: ({ browser }) => {
        // case: browser is firefox, add browser_specific_settings to avoid storage access error
        if (browser === 'firefox') {
            return {
                ...baseManifest,
                browser_specific_settings: {
                    gecko: {
                        id: '{0d49b33c-467a-4897-bea4-c82d6756e5c4}',
                        // Firefox's data consent: the extension sends no user data anywhere
                        data_collection_permissions: { required: ['none'] },
                    },
                },
            };
        }

        return baseManifest;
    },
});

// base manifest file
const baseManifest = {
    name: 'Notion Boost',
    short_name: 'Notion Boost',
    version: '3.3.8',
    description:
        'Boost Notion productivity with 20+ customizations like outline, small text full width for all, back to top button etc',
    author: 'Gourav Goyal',
    permissions: ['storage'],
    host_permissions: ['*://*.notion.so/*', '*://*.notion.site/*', '*://*.notion.com/*'],
    homepage_url: 'https://gourav.io/notion-boost',
    icons: {
        '16': '/icon/icon16.png',
        '48': '/icon/icon48.png',
        '128': '/icon/icon128.png',
    },
    action: {
        default_icon: {
            '16': '/icon/icon16.png',
            '24': '/icon/icon24.png',
            '32': '/icon/icon32.png',
        },
    },
};
