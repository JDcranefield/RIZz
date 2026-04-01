let sidebarObserver = new MutationObserver(() => {
    updateEnableAllShortcut();
});

function enableAllShortcutChangedCallback(newValue) {
    enableAllShortcut = newValue;

    updateEnableAllShortcut();
}

function updateEnableAllShortcut() {
    let leftTopNavSection = reddit.root.querySelector("left-nav-top-section");
    if (!leftTopNavSection) return;

    if(enableAllShortcut) {
        leftTopNavSection.setAttribute("all", "");
    } else {
        leftTopNavSection.removeAttribute("all");
    }
    
}

function loadShortcutSettings() {
    return new Promise(resolve => {
        browser.storage.local.get("enableAllShortcut", (data) => {
            resolve(data.enableAllShortcut);
        });
    });
}

function loadShortcutModule() {
    if(reddit.isOld) return;
    sidebarObserver.observe(reddit.root, {
        childList: true,
        subtree: true
    });

    stateChanged.addListener("enableAllShortcut", enableAllShortcutChangedCallback);
}