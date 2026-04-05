function customCssChangedCallback(newValue) {
    customCss = newValue;
    updateCustomCSS();
}

function updateCustomCSS() {
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
    updateCustomCSS();
    stateChanged.addListener("customCss", customCssChangedCallback);
}