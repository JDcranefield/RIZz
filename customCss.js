function customCssChangedCallback(changes, area) {
  if (area !== "local") return;

  if (changes.customCss) {
    applyCustomCSS(changes.customCss.newValue);
  }
}

function applyCustomCSS(css) {
    let style = document.querySelector("#rizz-custom-css");

    if (!style) {
        style = document.createElement("style");
        style.id = "rizz-custom-css";
        document.documentElement.appendChild(style);
    }

    style.textContent = css;
}

function loadCustomCss() {
    return new Promise(resolve => {
        browser.storage.local.get("customCss", (data) => {
            resolve(data.customCss || "");
        });
    });
}

function loadCustomCssModule() {
    applyCustomCSS(customCss);
    browser.storage.onChanged.addListener(customCssChangedCallback);
}