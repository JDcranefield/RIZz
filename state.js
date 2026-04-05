const reddit = {
    root: null,
    get isOld() {
        return this.root.matches("body:has(.content[role='main'])");
    },
    get openInNewTab() {
        return Boolean(this.root.querySelector("shreddit-post[pdp-target='_blank']"));
    }
};

let enableAllShortcut;
let disableHovercards;
let enableDesktopLinks;

let customCss = "";

let filterPages = {};

let filterRules = [];

const processedByRulesPosts = new Set();
const processedHovercards = new Set();
const processedLinkPosts = new Set();
const processedLinkComments = new Set();

function loadState() {
    return new Promise((resolve) => {
        browser.storage.local.get([
            "enableAllShortcut",
            "disableHovercards",
            "enableDesktopLinks",
            "customCss",
            ...(PAGE_TYPES.map(key => `filter_${key}`)),
            "rules"
        ]).then((data) => {
            enableAllShortcut = data.enableAllShortcut ?? enableAllShortcut;
            disableHovercards = data.disableHovercards ?? disableHovercards;
            enableDesktopLinks = data.enableDesktopLinks ?? enableDesktopLinks;
            customCss = data.customCss ?? customCss;
            PAGE_TYPES.forEach(key => {
                filterPages[`filter_${key}`] = data[`filter_${key}`] ?? PAGE_DEFAULTS[key];
            });
            filterRules = data.rules ?? filterRules;
            resolve();
        });
    });
}