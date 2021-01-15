/* eslint-disable promise/catch-or-return */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable consistent-return */
/* eslint-disable import/no-extraneous-dependencies */

// https://www.npmjs.com/package/zip-dir

const zipdir = require("zip-dir");
const https = require("https");
const fs = require("fs");

function getArgs() {
  return process.argv
    .slice(2)
    .map((arg) => arg.split("="))
    .reduce((args, [value, key]) => {
      args[value] = key;
      return args;
    }, {});
}
const args = getArgs();

const { browser } = args;
const path = `./build_${browser}/`;
const nbfile = `notion_boost_${browser}.zip`;

console.log(`RUNNING POSTBUILD SCRIPT:`);
console.log(`args: ${JSON.stringify(args)}`);
zipdir(path, { saveTo: path + nbfile }, (err, buffer) => {
  // `buffer` is the buffer of the zipped file
  // And the buffer was saved to `~/myzip.zip`
});

// Download repo for firefox submission
if (browser === "firefox") {
  downloadFile(
    "https://github.com/GorvGoyl/Notion-Boost-browser-extension/archive/master.zip",
    "./build_firefox/repo_notion-boost.zip"
  );
  // curl -L  http://github.com/GorvGoyl/Notion-Boost-browser-extension/archive/master.zip --output build_firefox/master.zip
}
console.log(`packed ${path}${nbfile}`);

// Use a filter option to prevent zipping other zip files!
// Keep in mind you have to allow a directory to descend into!
// zipdir(
//   "/path/to/be/zipped",
//   { filter: (path, stat) => !/\.zip$/.test(path) },
//   (err, buffer) => {}
// );

/* UTILITY FUNCTIONS */

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(dest, { flags: "wx" });
        file.on("finish", () => {
          console.log(`downloaded: ${dest}`);
          return resolve();
        });
        file.on("error", (err) => {
          file.close();
          if (err.code === "EEXIST") reject("File already exists");
          else fs.unlink(dest, () => reject(err.message)); // Delete temp file
        });
        response.pipe(file);
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Recursively follow redirects, only a 200 will resolve.
        downloadFile(response.headers.location, dest).then(() =>
          // console.log(`downloadedss: ${dest}`);
          resolve()
        );
      } else {
        reject(
          `Server responded with ${response.statusCode}: ${response.statusMessage}`
        );
      }
    });

    request.on("error", (err) => {
      reject(err.message);
    });
  });
}
