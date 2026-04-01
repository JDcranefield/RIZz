const reddit = {
    root:null,
    get isOld(){
        return this.root.matches("body:has(.content[role='main'])");
    },
    get openInNewTab(){
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

async function loadState() {
    enableAllShortcut = await loadShortcutSettings();
    disableHovercards = await loadTooltipsSettings();
    enableDesktopLinks = await loadLinksSettings();
    customCss = await loadCustomCss();
    filterPages = await loadFilterPages();
    filterRules = await loadFilterRules();
}