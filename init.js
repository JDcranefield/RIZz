function init() {
    document.documentElement.classList.add("rizz-loading",);

    loadState().then(() => {
        loadCustomCssModule();
        loadFilterModule();
        loadTooltipsModule();
        loadShortcutModule();
        loadLinksModule();

        waitFor(":is(shreddit-app, body:has(.content[role='main']))").then((root) => {
            reddit.root = root;
            document.documentElement.classList.remove("rizz-loading");
        });
    });
}

init();