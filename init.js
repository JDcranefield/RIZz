function init() {
    loadState().then(() => {
        loadCustomCssModule();
        loadFilterModule();
        loadTooltipsModule();
        loadShortcutModule();
        loadLinksModule();

        waitFor(":is(shreddit-app, body:has(.content[role='main']))").then((root) => {
            reddit.root = root;
        });
    });
}

init();