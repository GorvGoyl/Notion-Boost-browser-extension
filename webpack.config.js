const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtensionReloader = require("webpack-extension-reloader");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");
const webpack = require("webpack");

module.exports = (env, argv) => {
  console.log("mode: ", argv.mode);

  const isDev = argv.mode === "development";
  const isChrome = argv.browser === "chrome";
  const isFirefox = argv.browser === "firefox";

  const entry = {
    content: path.join(__dirname, "src", "js", "content.js"),
    popup: path.join(__dirname, "src", "popup.jsx"),
  };
  const output = {
    filename: "[name].bundle.js",
  };
  const manifest = ["src/manifest.json"];
  let buildDist = "build";
  let storeURL = "";
  // CHROME SPECIFIC BUILD
  if (isChrome) {
    buildDist = "build_chrome";
    manifest.push("src/manifest.chrome.json");
    entry.background = path.join(__dirname, "src", "js", "background.js");
    storeURL =
      "https://chrome.google.com/webstore/detail/notion-boost/eciepnnimnjaojlkcpdpcgbfkpcagahd";
  }

  // FIREFOX SPECIFIC BUILD
  if (isFirefox) {
    buildDist = "build_firefox";
    manifest.push("src/manifest.firefox.json");
    storeURL = "https://addons.mozilla.org/en-US/firefox/addon/notion-boost/";
  }

  // COMMON PLUGINS
  const pluginsArr = [
    // loads html file and minifies it for production
    new HtmlWebpackPlugin({
      filename: "popup.html",
      // to manually add js
      inject: false,
      template: "src/popup.html",
    }),

    new MergeJsonWebpackPlugin({
      files: manifest,
      output: {
        fileName: "manifest.json",
      },
    }),

    new webpack.DefinePlugin({
      "process.env.STOREURL": JSON.stringify(storeURL),
    }),
    // copy files from A to B location
    new CopyWebpackPlugin({
      patterns: [
        // {
        //   from: "src/manifest.json",
        //   to: path.join(__dirname, "build"),
        //   force: true,
        //   transform(content, p) {
        //     // after setting env it'll generate manifest file using the package.json informations
        //     return Buffer.from(
        //       JSON.stringify({
        //         description: process.env.npm_package_description,
        //         version: process.env.npm_package_version,
        //         ...JSON.parse(content.toString()),
        //       })
        //     );
        //   },
        // },
        {
          from: "src/images",
          force: true,
          to: path.join(__dirname, `${buildDist}/images`),
        },
      ],
    }),
  ];

  const rules = [
    // {
    //   test: /\.svg$/,
    //   loader: "svg-inline-loader",
    // },
    {
      test: /\.svg$/,
      use: [
        {
          loader: "file-loader",
          options: {
            // name: "assets/[hash].[ext]",
            name: "[name].[ext]",
            outputPath: "images",
          },
        },
      ],
    },
    {
      test: /\.(css|scss)$/,
      // in the `src` directory
      use: [
        {
          loader: "style-loader",
        },
        {
          loader: "css-loader",
        },
        {
          loader: "sass-loader",
          options: {
            sourceMap: true,
          },
        },
      ],
    },
    {
      test: /\.jsx?$/,
      exclude: /(node_modules)/,
      use: {
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"],
          plugins: [
            [
              "@babel/plugin-transform-react-jsx",
              { pragma: "h", pragmaFrag: "Fragment" },
            ],
          ],
        },
      },
    },
  ];

  // DEV ENV
  // hot reload for extension and browser page
  if (isDev && isChrome) {
    pluginsArr.push(
      new ExtensionReloader({
        reloadPage: true, // Force the reload of the page also
        manifest: path.resolve(__dirname, buildDist, "manifest.json"),

        // entries: {
        //   contentScript: "./src/js/content",
        //   background: "./src/js/background",
        //   // The entries used for the content/background scripts or extension pages
        //   // contentScript: "content",
        // },
      })
    );
  }

  // PROD ENV
  let optimization = {};
  if (!isDev) {
    pluginsArr.push(
      // clean build folder before new build
      new CleanWebpackPlugin()
    );
    // lint before prod build
    rules.push({
      enforce: "pre",
      test: /\.js$/,
      exclude: /node_modules/,
      loader: "eslint-loader",
      options: {
        cache: true,
        failOnError: true,
        emitError: true,
        emitWarning: true,
        failOnWarning: true,
        // eslint options (if necessary)
      },
    });
    // remove logs for production and other optimization
    optimization = {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
    };
  }

  return {
    // devServer: {
    //   writeToDisk: true,
    // },
    entry,
    devtool: isDev ? "inline-source-map" : "", // other option: "eval-cheap-module-source-map";

    plugins: pluginsArr,
    output: {
      path: path.resolve(__dirname, buildDist),
      filename: "[name].bundle.js",
    },
    optimization,
    module: {
      rules,
    },
    resolve: {
      extensions: [".js", ".jsx"],
    },
  };
};
