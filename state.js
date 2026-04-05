const reddit = {
    root: null,
    get isOld() {
        return this.root.matches("body:has(.content[role='main'])");
    },
    get openInNewTab() {
        return Boolean(this.root.querySelector("shreddit-post[pdp-target='_blank']"));
    }
};

let enableAllShortcut = false;
let disableHovercards = false;
let enableDesktopLinks = false;

let customCss = "";

let filterPages = {};

let filterRules = [];

const processedByRulesPosts = new Set();
const processedHovercards = new Set();
const processedLinkPosts = new Set();
const processedLinkComments = new Set();

function loadState() {
    return new Promise((resolve) => {
        Promise.all([
            loadShortcutSettings(),
            loadTooltipsSettings(),
            loadLinksSettings(),
            loadCustomCss(),
            loadFilterPages(),
            loadFilterRules()
        ]).then(([
            shortcut,
            tooltips,
            links,
            css,
            pages,
            rules
        ]) => {
            enableAllShortcut = shortcut;
            disableHovercards = tooltips;
            enableDesktopLinks = links;
            customCss = css;
            filterPages = pages;
            filterRules = rules;
            resolve();
        });
    });
}