let sidebarObserver = new MutationObserver(() => {
    if (reddit.root && reddit.isOld) {
        sidebarObserver.disconnect();
        return;
    }

    updateEnableAllShortcut();
});

function enableAllShortcutChangedCallback(newValue) {
    enableAllShortcut = newValue;

    updateEnableAllShortcut();
}

function updateEnableAllShortcut() {
    let leftTopNavSection = document.documentElement.querySelector("left-nav-top-section");
    if (!leftTopNavSection) return;

    if (enableAllShortcut) {
        leftTopNavSection.setAttribute("all", "");
    } else {
        leftTopNavSection.removeAttribute("all");
    }

}

function loadShortcutModule() {
    sidebarObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    stateChanged.addListener("enableAllShortcut", enableAllShortcutChangedCallback);
}