import { Fragment, h, render } from "preact";
import { route, Router } from "preact-router";
import { useCallback, useEffect, useState } from "preact/hooks";
import { msgLocked, msgThanks, settingDetails } from "../settings";
import { getElement, getElements, getLatestSettings } from "../utility";

function isFuncEnabled(func) {
  const btnToDisable = getElement(`[data-func=${func}]`);

  if (btnToDisable.classList.contains("enable")) {
    return true;
  }
  return false;
}

export function SettingsTable({ isPaid }) {
  const [filterText, setFilterText] = useState("");
  const [settings, setSettings] = useState(settingDetails);

  useEffect(() => {
    refreshSettings();
  }, []);

  const refreshSettings = () => {
    console.log("refreshing settings");
    const obj = [...settingDetails];

    getLatestSettings()
      .then((set) => {
        console.log("LatestSettings: ", set);

        // add current status to settings object
        obj.forEach((e) => {
          e.status = set[e.func] ? "enable" : "disable";
        });

        setSettings([...obj]);

        return null;
      })
      .catch((e) => console.log(e));
  };

  const handleFeature = useCallback(
    (obj) => {
      console.log("obj", obj);

      console.log("clicked: ");
      if (!obj.pf || isPaid) {
        const func = obj.func;
        const funcToDisable = obj.disable_func;

        let toEnable = false;

        if (obj.status === "enable") {
          toEnable = false;
        } else {
          toEnable = true;
        }

        try {
          getLatestSettings()
            .then((set) => {
              console.log("getLatestSettings ->", set);
              set[func] = toEnable;
              set.call_func = {
                name: func,
                arg: toEnable,
              };

              // disable other related func if both are enabled
              if (funcToDisable && isFuncEnabled(funcToDisable) && toEnable) {
                set[funcToDisable] = false;
              }

              chrome.storage.sync.set({ nb_settings: set }, () => {
                refreshSettings();
              });
              return null;
            })
            .catch((e) => console.log(e));
        } catch (e) {
          console.log(e);
        }
      } else {
        route("/payment", true);
      }
    },
    [isPaid]
  );

  const filteredItems = settings.filter(
    (item) =>
      item.name.toLocaleLowerCase().includes(filterText) ||
      item.desc.toLocaleLowerCase().includes(filterText)
  );
  console.log("filtered items", filteredItems);

  const itemsToDisplay = filterText ? filteredItems : settings;

  const handleOnchange = (e) => {
    console.log("value changed");
    setFilterText(e.target.value.toLocaleLowerCase());
  };
  return (
    <>
      <input
        className="settings search"
        type="text"
        autoFocus
        value={filterText}
        placeholder="Search feature..."
        onInput={handleOnchange}
      />
      <div className="settings table">
        {!filteredItems.length && (
          <div className="no-setting">No setting found</div>
        )}
        {itemsToDisplay.map((obj, index) => (
          <Fragment key={obj.func}>
            <div
              className={`row ${obj.status}`}
              data-func={obj.func}
              data-disable_func={obj.disable_func}
              title={obj.pf ? (isPaid ? "" : msgLocked) : ""}
              onClick={() => handleFeature(obj)}
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
    </>
  );
}
