import { h, render, Fragment } from "preact";
import { Router, route } from "preact-router";
import { useEffect } from "preact/hooks";
import { twitterShareTxt } from "./js/utility";

const StoreURL = process.env.STOREURL;
function goBack() {
  window.location.replace("/popup.html");
  // shit doesn't work after updating
  // route("/popup.html");
}

function Bullet({ txtS, url, urlTxt, txtE }) {
  return (
    <div style="width: 100%; font-size:13px; margin-top: 8px; margin-bottom: 8px;">
      <div style="display: flex; align-items: flex-start; width: 100%; padding-left: 2px; color: inherit; fill: inherit;">
        <div style="margin-right: 2px; width: 24px; display: flex; align-items: center; justify-content: center; flex-grow: 0; flex-shrink: 0; min-height: calc(1.5em + 3px + 3px);">
          <div style="font-size: 1.5em; line-height: 1; margin-bottom: 0.1em;">
            •
          </div>
        </div>
        <div style="flex: 1 1 0px; min-width: 1px; display: flex; flex-direction: column;">
          <div style="display: flex;">
            <div
              placeholder="List"
              data-root="true"
              class="notranslate"
              style="max-width: 100%; width: 100%; white-space: pre-wrap; word-break: break-word; caret-color: rgb(55, 53, 47); padding: 3px 2px; text-align: left;"
            >
              {txtS}
              {url && (
                <a
                  target="_blank"
                  className="external-link"
                  rel="noopener"
                  href={url}
                >
                  {urlTxt}
                </a>
              )}
              {txtE}{" "}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export function About() {
  return (
    <div>
      <div
        className="back button"
        style=""
        role="button"
        onClick={goBack}
        tabIndex={0}
      >
        <span className="arrow" />
      </div>
      <div className="title" style="display: flex;margin-bottom: 3px;">
        <span class="icon-nb" />
        Notion Boost
      </div>
      <div className="sub-title underline">
        Make Notion more productive and less distractive
      </div>

      <Bullet
        txtS="Visit "
        urlTxt="Homepage"
        url="https://gourav.io/notion-boost"
      />

      <Bullet
        txtS="Missing something? "
        urlTxt="suggest / feedback"
        url="https://github.com/GorvGoyl/Notion-Boost-browser-extension/issues/new"
      />

      {/* <Bullet
        txtS="Support Notion Boost by "
        urlTxt="tweeting 🖤"
        url={twitterShareTxt}
        txtE=" about it"
      /> */}

      {/* <Bullet
        txtS="See "
        urlTxt={<Fragment>what's new</Fragment>}
        url="https://gourav.io/notion-boost/whats-new"
        txtE=" in this update"
      /> */}
      <Bullet
        txtS="Follow "
        urlTxt={
          <Fragment>
            @NotionBoost <span className="twitter" />
          </Fragment>
        }
        url="https://twitter.com/notionboost"
        txtE=" for many amazing Notion tips & tricks."
      />

      <Bullet
        txtS="Support: hey@gourav.io"
        // urlTxt={<Fragment>hey@gourav.io</Fragment>}
        // url="hey@gourav.io"
      />
      <Bullet
        txtS="Made by "
        urlTxt={
          <Fragment>
            @GorvGoyl <span className="twitter" />
          </Fragment>
        }
        url="https://twitter.com/gorvgoyl"
      />
      <Bullet txtS={`Version: ${chrome.runtime.getManifest().version}`} />
    </div>
  );
}
