import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifestVersion: 3,
  outDir: "build",
  manifest: ({ browser }) => {
    // case: browser is firefox, add browser_specific_settings to avoid storage access error
    if (browser === "firefox") {
      return {
        ...baseManifest,
        browser_specific_settings: {
          gecko: {
            id: "{0d49b33c-467a-4897-bea4-c82d6756e5c4}",
          },
        },
      };
    }

    return baseManifest;
  },
});

// base manifest file
const baseManifest = {
  name: "Notion Boost",
  short_name: "Notion Boost",
  version: "3.3.2",
  description:
    "Boost Notion productivity with 20+ customizations like outline, small text full width for all, back to top button etc",
  author: "Gourav Goyal",
  permissions: ["storage", "activeTab"],
  host_permissions: ["*://*.notion.so/*", "*://*.notion.site/*"],
  homepage_url: "https://gourav.io/notion-boost",
  icons: {
    "16": "/icon/icon16.png",
    "48": "/icon/icon48.png",
    "128": "/icon/icon128.png",
  },
  action: {
    default_icon: {
      "16": "/icon/icon16.png",
      "24": "/icon/icon24.png",
      "32": "/icon/icon32.png",
    },
  },
};
