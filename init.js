function init() {
    document.documentElement.classList.add("rizz-filter-loading");

    waitFor(":is(shreddit-app, body:has(.content[role='main']))").then((root) => {
        reddit.root = root;
    });

    loadState().then(() => {
        loadCustomCssModule();
        loadFilterModule();
        loadTooltipsModule();
        loadShortcutModule();
        loadLinksModule();
    });
}

init();