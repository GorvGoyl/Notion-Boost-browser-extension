import { Fragment, h, render } from "preact";
import { msgLocked, msgThanks, settingDetails } from "../settings";

export function SettingsTable({ handleFeature, isPaid }) {
  return (
    <div className="settings table">
      {settingDetails.map((obj, index) => (
        <Fragment key={obj.func}>
          <div
            className="row"
            data-func={obj.func}
            data-disable_func={obj.disable_func}
            title={obj.pf ? (isPaid ? "" : msgLocked) : ""}
            onClick={handleFeature(obj.pf)}
          >
            <div className="text-wrapper">
              <div className="name">{obj.name}</div>
              {obj.pf && (
                <div
                  class="pro small"
                  role="button"
                  title={isPaid ? msgThanks : msgLocked}
                  aria-disabled="false"
                  tabindex="0"
                >
                  <div>Pro</div>
                </div>
              )}
              {obj.desc && <div className="desc">{obj.desc}</div>}
            </div>
            <div
              className="button toggle"
              role="button"
              aria-disabled="false"
              tabIndex={0}
            >
              <div className="knob">
                <div className="pos" />
              </div>
            </div>
          </div>
          {index === settingDetails.length - 1 ? (
            <div className="divider last" />
          ) : (
            <div className="divider">
              <div className="border" />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
