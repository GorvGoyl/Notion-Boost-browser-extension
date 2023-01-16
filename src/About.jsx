import { Fragment, h, render } from "preact";
import { route, Router } from "preact-router";
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
    <div
      style={{
        width: "100%",
        fontSize: "13px",
        marginTop: "8px",
        marginBottom: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          width: "100%",
          paddingLeft: "2px",
          color: "inherit",
          fill: "inherit",
        }}
      >
        <div
          style={{
            marginRight: "2px",
            width: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 0,
            flexShrink: 0,
          }}
        >
          <div
            style={{ fontSize: "1.5em", lineHeight: 1, marginBottom: "0.1em" }}
          >
            •
          </div>
        </div>
        <div
          style={{
            flex: "1 1 0px",
            minWidth: "1px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex" }}>
            <div
              placeholder="List"
              data-root="true"
              className="notranslate"
              style={{
                maxWidth: "100%",
                width: "100%",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                caretColor: "rgb(55, 53, 47)",
                padding: "3px 2px",
                textAlign: "left",
              }}
            >
              {txtS}
              {url && (
                <a
                  target="_blank"
                  className="external-link"
                  rel="noopener"
                  href={url}
                  title={url}
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
      <div className="back button" role="button" onClick={goBack} tabIndex={0}>
        <span className="arrow" />
      </div>
      <div className="title" style={{ display: "flex", marginBottom: "3px" }}>
        <span className="icon-nb" />
        Notion Boost
      </div>
      <div className="sub-title underline">
        Make Notion more productive and less distractive
      </div>

      <Bullet
        txtS="Visit "
        txtE=""
        urlTxt="Homepage"
        url="https://gourav.io/notion-boost"
      />

      <Bullet
        txtE=""
        txtS="Missing something? "
        urlTxt="suggest / feedback"
        url="https://github.com/GorvGoyl/Notion-Boost-browser-extension/issues"
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
      {/* <Bullet
        txtS="Follow "
        urlTxt={
          <Fragment>
            @NotionBoost <span className="twitter" />
          </Fragment>
        }
        url="https://twitter.com/notionboost"
        txtE=" for unique tips, tricks, and free goodies."
      /> */}

      {/* <Bullet
        txtS="Support: hey@gourav.io"
        // urlTxt={<Fragment>hey@gourav.io</Fragment>}
        // url="hey@gourav.io"
      /> */}
      <Bullet
        txtE=""
        txtS="Made by "
        urlTxt={<Fragment>Gourav Goyal</Fragment>}
        url="https://gourav.io"
      />
      <Bullet
        txtE=""
        url={""}
        urlTxt=""
        txtS={`Version: ${chrome.runtime.getManifest().version}`}
      />
    </div>
  );
}
