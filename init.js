let init = async () => {
    await loadState();

    reddit.root = await waitFor(":is(shreddit-app, body:has(.content[role='main']))");

    if (!reddit.root) return;

    loadShortcutModule();
    loadTooltipsModule();
    loadLinksModule();
    loadFilterModule();
    loadCustomCssModule();
}

init();