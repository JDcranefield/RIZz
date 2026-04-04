function preloadCss() {
    applyCustomCSS();
    updateRulePageCss();
    applyLinksStyle();
}

async function init() {
    await loadState();
    preloadCss();

    reddit.root = await waitFor(":is(shreddit-app, body:has(.content[role='main']))");

    if (!reddit.root) return;

    loadShortcutModule();
    loadTooltipsModule();
    loadLinksModule();
    loadFilterModule();
    loadCustomCssModule();
}

init();