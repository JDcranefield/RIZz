function customCssChangedCallback(newValue) {
    customCss = newValue;
    applyCustomCSS();
}

function applyCustomCSS() {
    let style = document.querySelector("#rizz-custom-css");

    if (!style) {
        style = document.createElement("style");
        style.id = "rizz-custom-css";
        document.documentElement.appendChild(style);
    }

    style.textContent = customCss;
}

function loadCustomCss() {
    return new Promise(resolve => {
        browser.storage.local.get("customCss", (data) => {
            resolve(data.customCss || "");
        });
    });
}

function loadCustomCssModule() {
    applyCustomCSS();
    stateChanged.addListener("customCss", customCssChangedCallback);
}