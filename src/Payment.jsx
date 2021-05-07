import { h, render } from "preact";
import { Router, route } from "preact-router";
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
      <div className="sub-title underline">Support the developer</div>

      <div className="payment">
        {/* <div>
          Hey there, building high quality browser extension on top of
          ever-changing software requires a lot of skill and time. Please
          consider paying a one-time fee ($5) to support the developer.
        </div> */}
        <div>
          Please upgrade to use 'pro' features. <br /> One-time payment of $5
          USD for lifetime access!
        </div>
        <div className="pricing">
          <div className="features">
            <div>
              <CheckIcon /> Use all 'pro' features.
            </div>
            <div>
              <CheckIcon /> All upcoming 'pro' features will be free.
            </div>
            <div>
              <CheckIcon /> Same account works on different Chrome profiles.
            </div>
            <div>
              <CheckIcon /> Same account works on different browsers like
              Chrome, Firefox, Brave (extension for Safari and Microsoft edge is
              coming soon).
            </div>
            <div>
              <CheckIcon /> Works even when you uninstall/reinstall this
              extension.
            </div>
          </div>
          <div
            role="button"
            aria-disabled="false"
            tabindex="0"
            className="payBtn"
            onClick={showPaymentPage}
          >
            Purchase for $5
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
        webkitFlexShrink: "0",
        msFlexShrink: "0",
        flexShrink: "0",
        backfaceVisibility: "hidden",
      }}
    >
      <path d="M6.385 14.162c.362 0 .642-.15.84-.444L13.652 3.71c.144-.226.205-.417.205-.602 0-.485-.341-.82-.833-.82-.335 0-.54.123-.746.444l-5.926 9.4L3.31 8.229c-.205-.267-.417-.376-.718-.376-.492 0-.848.348-.848.827 0 .212.075.417.253.629l3.541 4.416c.24.3.492.437.848.437z" />
    </svg>
  );
}
