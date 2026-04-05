const PAGE_TYPES = ["home", "news", "popular", "all", "subreddit"];

const PAGE_DEFAULTS = {
    home: true,
    news: true,
    popular: true,
    all: true,
    subreddit: false
};

const RULE_TYPES = ["title", "subreddit", "linkflair", "userflair", "domain", "username"];

const TYPE_MAP = {
    postTitle: "title",
    subreddit: "subreddit",
    linkFlair: "linkflair",
    userFlair: "userflair",
    domain: "domain",
    username: "username"
};

const REVERSE_TYPE_MAP = Object.fromEntries(
    Object.entries(TYPE_MAP).map(([k, v]) => [v, k])
);

const deletedRules = [];

const enableAllShortcutCheck = document.querySelector("#enableAllShortcut");
const disableHovercardsCheck = document.querySelector("#disableHovercards");
const enableDesktopLinksCheck = document.querySelector("#enableDesktopLinks");

const customCssBox = document.querySelector("#customCss");

const undoBtn = document.querySelector("#undo");
const addBtn = document.querySelector("#add");
const rulesContainer = document.querySelector("#rules");

const importBox = document.querySelector("#importBox");
const importBtn = document.querySelector("#import");
const exportBtn = document.querySelector("#export");

function extractFromRES(data) {
    const rules = [];

    if (!data?.body?.of) return rules;

    for (const item of data.body.of) {
        const mappedType = TYPE_MAP[item.type];
        if (!mappedType) continue;

        const parsed = item.patt;
        if (!parsed) continue;

        rules.push({
            type: mappedType,
            pattern: parsed
        });
    }

    return rules;
}

function exportToRES(rules) {
    return {
        note: "",
        ver: 3,
        id: "customRule-" + Date.now(),
        body: {
            type: "group",
            op: "any",
            of: rules.map(f => ({
                type: REVERSE_TYPE_MAP[f.type],
                patt: `${f.pattern}`
            }))
        },
        opts: {
            name: "Exported rules",
            ondemand: false
        }
    };
}

function cleanRules(rules) {
    const seen = new Set();
    const result = [];

    for (const rule of rules) {
        const type = rule.type;
        const pattern = rule.pattern?.trim();

        if (!pattern) continue;

        const key = `${type}::${pattern}`;

        if (!seen.has(key)) {
            seen.add(key);
            result.push({
                ...rule,
                pattern
            });
        }
    }

    return result;
}

function updateUndoButton() {
    undoBtn.style.display = deletedRules.length ? "" : "none";
}

function createRuleRow(rule = {}) {
    const div = document.createElement("div");
    div.className = "rule";

    const type = document.createElement("select");
    RULE_TYPES.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        if (rule.type === t) opt.selected = true;
        type.appendChild(opt);
    });
    type.addEventListener("input", () => {
        saveRules();
    });

    const pattern = document.createElement("input");
    pattern.placeholder = "/example/i";
    pattern.value = rule.pattern || "";
    pattern.addEventListener("input", () => {
        saveRules();
    });

    const remove = document.createElement("button");
    remove.textContent = "X";
    remove.addEventListener("click", () => {
        let rule = {
            type: div.querySelector("select").value,
            pattern: div.querySelector("input").value
        };

        deletedRules.push(rule);
        div.remove();
        updateUndoButton();
        saveRules();
    });

    div.append(type, pattern, remove);
    return div;
}

function undoDelete() {
    const rule = deletedRules.pop();
    if (!rule) return;

    rulesContainer.prepend(createRuleRow(rule));

    updateUndoButton();
    saveRules();
}

function loadOptions() {
    browser.storage.local.get("enableAllShortcut").then((data) => {
        enableAllShortcutCheck.checked = data.enableAllShortcut;
    });
    browser.storage.local.get("disableHovercards").then((data) => {
        disableHovercardsCheck.checked = data.disableHovercards;
    });
    browser.storage.local.get("enableDesktopLinks").then((data) => {
        enableDesktopLinksCheck.checked = data.enableDesktopLinks;
    });
}

function saveOptions() {
    browser.storage.local.set({
        enableAllShortcut: enableAllShortcutCheck.checked,
        disableHovercards: disableHovercardsCheck.checked,
        enableDesktopLinks: enableDesktopLinksCheck.checked
    }).then(() => {
        console.log("Saved options!");
    });
}

function loadCustomCss() {
    browser.storage.local.get("customCss").then((data) => {
        customCssBox.value = data.customCss || "";
    });
}

function saveCustomCss() {
    browser.storage.local.set({
        customCss: customCssBox.value
    });
}

function loadRulePages() {
    browser.storage.local.get(
        PAGE_TYPES.map(k => `filter_${k}`)
    ).then((result) => {
        PAGE_TYPES.forEach(key => {
            const el = document.getElementById(`filter_${key}`);
            el.checked = result[`filter_${key}`] ?? PAGE_DEFAULTS[key];
        });
    });
}

function saveRulePages() {
    PAGE_TYPES.forEach(key => {
        const el = document.getElementById(`filter_${key}`);

        el.addEventListener("change", () => {
            browser.storage.local.set({
                [`filter_${key}`]: el.checked
            });
        });
    });
}

function loadRules() {
    browser.storage.local.get("rules").then((data) => {
        rulesContainer.innerHTML = "";
        const rules = data.rules || [];

        rules.forEach(rule => {
            rulesContainer.appendChild(createRuleRow(rule));
        });
    });
}

function saveRules() {
    const rows = document.querySelectorAll(".rule");

    let rules = [];

    rows.forEach(row => {
        const [type, pattern] = row.querySelectorAll("select, input");

        rules.push({
            type: type.value,
            pattern: pattern.value.trim()
        });
    });

    browser.storage.local.set({
        rules: rules
    }).then(() => {
        console.log("Saved rules!");
    });
}

function enableAllShortcutChangedCallback(newValue) {
    if (!document.hasFocus()) enableAllShortcutCheck.checked = newValue;
}

function disableHovercardsChangedCallback(newValue) {
    if (!document.hasFocus()) disableHovercardsCheck.checked = newValue;
}

function enableDesktopLinksChangedCallback(newValue) {
    if (!document.hasFocus()) enableDesktopLinksCheck.checked = newValue;
}

function rulePagesChangedCallback() {
    if (!document.hasFocus()) loadRulePages();
}

function rulesChangedCallback() {
    if (!document.hasFocus()) loadRules();
}

function customCssChangedCallback(newValue) {
    if (!document.hasFocus()) customCssBox.value = newValue;
}

enableAllShortcutCheck.addEventListener("change", () => {
    saveOptions();
});

disableHovercardsCheck.addEventListener("change", () => {
    saveOptions();
});

enableDesktopLinksCheck.addEventListener("change", () => {
    saveOptions();
});

customCssBox.addEventListener("input", () => {
    saveCustomCss();
});

addBtn.addEventListener("click", () => {
    rulesContainer.prepend(createRuleRow());
    saveRules();
});

undoBtn.addEventListener("click", () => {
    undoDelete();
});

importBtn.addEventListener("click", () => {
    let json;

    try {
        json = JSON.parse(importBox.value);
    } catch {
        alert("Invalid JSON");
        return;
    }

    let rules = [];

    const rows = document.querySelectorAll(".rule");

    rows.forEach(row => {
        const [type, pattern] = row.querySelectorAll("select, input");

        if (!pattern.value.trim()) return;

        rules.push({
            type: type.value,
            pattern: pattern.value.trim()
        });
    });

    const oldRulesLength = rules.length;
    const newRules = extractFromRES(json);

    if (!newRules.length) {
        alert("No valid rules found");
        return;
    }

    rules = rules.concat(newRules);
    rules = cleanRules(rules);
    rulesContainer.innerHTML = "";

    rules.forEach(rule => {
        rulesContainer.appendChild(createRuleRow(rule));
    });

    const rulesAddedCount = rules.length - oldRulesLength;

    alert(`Imported ${rulesAddedCount} rule${rulesAddedCount == 1 ? "" : "s"}`);
    saveRules();
});

exportBtn.addEventListener("click", () => {
    browser.storage.local.get("rules").then((result) => {
        const data = result;
        const resFormat = exportToRES(data.rules || []);
        importBox.value = JSON.stringify(resFormat, null, 0);
    });
});

PAGE_TYPES.forEach((key) => {
    const el = document.getElementById(`filter_${key}`);

    el.addEventListener("change", () => {
        browser.storage.local.set({
            [`filter_${key}`]: el.checked
        });
    });
});

loadOptions();
loadCustomCss();
loadRulePages();
loadRules();
updateUndoButton();

stateChanged.addListener("enableAllShortcut", enableAllShortcutChangedCallback);
stateChanged.addListener("disableHovercards", disableHovercardsChangedCallback);
stateChanged.addListener("enableDesktopLinks", enableDesktopLinksChangedCallback);
stateChanged.addListener("customCss", customCssChangedCallback);
stateChanged.addListener("rules", rulesChangedCallback);

PAGE_TYPES.forEach((key) => {
    stateChanged.addListener(`filter_${key}`, (newValue) => {
        rulePagesChangedCallback(`filter_${key}`, newValue);
    })
});