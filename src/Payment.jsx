import { h, render } from "preact";
import { route, Router } from "preact-router";
import { nextPrice, price } from "./js/settings";
import { showPaymentPage } from "./popup";

const StoreURL = process.env.STOREURL;
function goBack() {
  window.location.replace("/popup.html");
  // shit doesn't work after updating
  // route("/popup.html");
}

export function Payment() {
  return (
    <div>
      <div className="back button" role="button" onClick={goBack} tabIndex={0}>
        <span className="arrow" />
      </div>
      <div className="title" style={{ display: "flex", marginBottom: "3px" }}>
        <span className="icon-nb" />
        Notion Boost
      </div>

      <div className="payment">
        {/* <div>
          Hey there, building high quality browser extension on top of
          ever-changing software requires a lot of skill and time. Please
          consider paying a one-time fee ($) to support the developer.
        </div> */}
        <div>
          Please upgrade to use all 'pro' features. <br /> One-time payment of{" "}
          {price} USD for lifetime access! <br />
          <i>Note: Price will go up to {nextPrice} after next update.</i>
        </div>
        <div className="pricing">
          <div className="features">
            <div>
              <CheckIcon /> Use exisiting 'pro' features.
            </div>
            <div>
              <CheckIcon /> All upcoming 'pro' features will be free.
            </div>
            <div>
              <CheckIcon /> Same account works on different Chrome profiles.
            </div>
            <div>
              <CheckIcon /> Same account works on different browsers i.e.
              Chrome, Firefox, Edge, Brave, etc. (not supported on Safari yet).
            </div>
            <div>
              <CheckIcon /> Works even when you uninstall/reinstall this
              extension.
            </div>
          </div>
          <div
            role="button"
            aria-disabled="false"
            tabIndex={0}
            className="payBtn"
            onClick={showPaymentPage}
          >
            Purchase for {price}
          </div>
          <div className="loginWrapper">
            Already paid?{"  "}
            <div
              role="button"
              aria-disabled="false"
              tabIndex={0}
              className="loginBtn"
              onClick={showPaymentPage}
            >
              Login
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      fill="inherit"
      className="thinCheck"
      color="#37352F"
      viewBox="0 0 16 16"
      style={{
        width: 12,
        height: 12,
        WebkitFlexShrink: "0",
        flexShrink: "0",
        backfaceVisibility: "hidden",
      }}
    >
      <path d="M6.385 14.162c.362 0 .642-.15.84-.444L13.652 3.71c.144-.226.205-.417.205-.602 0-.485-.341-.82-.833-.82-.335 0-.54.123-.746.444l-5.926 9.4L3.31 8.229c-.205-.267-.417-.376-.718-.376-.492 0-.848.348-.848.827 0 .212.075.417.253.629l3.541 4.416c.24.3.492.437.848.437z" />
    </svg>
  );
}
