let sidebarObserver = new MutationObserver(() => {
    if (reddit.root && reddit.isOld) {
        sidebarObserver.disconnect();
        return;
    }

    updateEnableAllShortcut();
});

let rizzAllObserver = new MutationObserver(() => {
    let params = new URLSearchParams(window.location.search);
    let allSelected = params.get("rizz");

    if (!allSelected) return;

    waitFor("shreddit-feed").then((feed) => {
        if (!feed.hasAttribute("is-rizzed") && !feed.hasAttribute("rizz-all-loading")) {
            feed.setAttribute("rizz-all-loading", "");
            buildRizzedFeed();
        }
    });
});

function buildRizzedFeed() {
    let params = new URLSearchParams(window.location.search);
    let sort = params.get("sort")?.toUpperCase() ?? "HOT";
    let feed = document.querySelector("shreddit-feed");
    let sortEl = document.querySelector("shreddit-async-loader[bundlename='shreddit_sort_dropdown'] > div");
    let sortElChild = sortEl.querySelector("div:has(> shreddit-sort-dropdown)");

    let wrapper = document.createElement("div");
    wrapper.className = "flex items-center";

    let dropdown = document.createElement("shreddit-sort-dropdown");
    dropdown.setAttribute("header-text", "Sort by");
    dropdown.className = "nd:max-h-[32px] nd:h-[32px] nd:w-[54px] nd:invisible";
    dropdown.setAttribute("telemetry-source", "sort_switch");
    dropdown.setAttribute("sort-event", "feed-sort-change");
    dropdown.setAttribute("tooltip-placement", "bottom");

    let selected = document.createElement("div");
    selected.slot = "selected-item";
    selected.textContent =
        sort.charAt(0).toUpperCase() + sort.slice(1).toLowerCase();

    let tooltip = document.createElement("div");
    tooltip.slot = "tooltip-content";
    tooltip.textContent = "Open sort options";

    let items = document.createElement("div");
    items.slot = "dropdown-items";

    items.append(
        ...FEED_SORT_TYPES.map(s =>
            createSortOption(s, s[0].toUpperCase() + s.slice(1).toLowerCase(), sort)
        )
    );

    dropdown.append(selected, tooltip, items);
    wrapper.appendChild(dropdown);

    if (sortElChild) sortElChild.remove();
    sortEl.prepend(wrapper);

    document.documentElement.querySelectorAll('a[href*="feedViewType"]').forEach((link) => {
        link.href += `&rizz=all&sort=${sort.toLowerCase()}`;
    });

    feed.classList.add("rizz-hide");

    // Reddit's internal /r/all feed endpoint, is trusted, returns HTML
    fetch(`/svc/shreddit/feeds/all-feed${FEED_SORT_TYPES.includes(sort.toUpperCase()) ? `?sort=${encodeURIComponent(sort.toLowerCase())}` : ""}`, {
        "credentials": "include",
        "headers": {
            "Accept": "text/vnd.reddit.partial+html, text/html;q=0.9",
            "content-type": "application/x-www-form-urlencoded",
            "x-reddit-retry": "attempt=0, max=2",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Priority": "u=4"
        },
        "method": "GET",
        "mode": "cors"
    })
        .then(res => res.text())
        .then((html) => {
            // Replaces existing reddit feed with /r/all feed
            feed.setHTMLUnsafe(html);
            feed.setAttribute("is-rizzed", "");
            feed.removeAttribute("rizz-all-loading");
            document.title = "r/all";
            feed.classList.remove("rizz-hide");
        });
}

function createSortOption(value, label, currentSort) {
    const data = document.createElement("data");
    data.value = value;

    const li = document.createElement("li");
    li.setAttribute("rpl", "");
    li.className = "relative list-none mt-0";
    li.setAttribute("role", "presentation");

    if (currentSort === value) {
        li.setAttribute("rpl-selected", "");
    }

    const a = document.createElement("a");
    a.className =
        currentSort === value
            ? "flex justify-between relative px-md gap-[0.5rem] text-secondary-onBackground bg-neutral-background-selected hover:bg-neutral-background-selected hover:bg-neutral-background-hover hover:no-underline cursor-pointer  py-xs  -outline-offset-1   no-underline"
            : "flex justify-between relative px-md gap-[0.5rem] text-secondary hover:text-secondary-hover active:bg-interactive-pressed hover:bg-neutral-background-hover hover:no-underline cursor-pointer  py-xs  -outline-offset-1   no-underline";

    a.href = `/?feed=home&rizz=all&sort=${value.toLowerCase()}`;
    a.style.paddingInlineEnd = "16px";
    a.tabIndex = -1;

    const spanOuter = document.createElement("span");
    spanOuter.className = "flex items-center gap-xs min-w-0 shrink";

    const spanInner = document.createElement("span");
    spanInner.className =
        "flex flex-col justify-center min-w-0 shrink py-[var(--rem6)]";

    const title = document.createElement("span");
    title.className = "text-body-2";
    title.textContent = label;

    const subtitle = document.createElement("span");
    subtitle.className = "text-caption-1 text-secondary-weak";

    spanInner.append(title, subtitle);
    spanOuter.appendChild(spanInner);

    const right = document.createElement("span");
    right.className = "flex items-center shrink-0";

    const rightInner = document.createElement("span");
    rightInner.className = "flex items-center justify-center h-lg";

    right.appendChild(rightInner);

    a.append(spanOuter, right);
    li.appendChild(a);
    data.appendChild(li);

    return data;
}


function enableAllShortcutChangedCallback(newValue) {
    enableAllShortcut = newValue;

    updateEnableAllShortcut();
}

function updateEnableAllShortcut() {
    let leftTopNavSection = document.documentElement.querySelector("left-nav-top-section");
    if (!leftTopNavSection) return;

    if (enableAllShortcut) {
        if (!leftTopNavSection.shadowRoot) return;
        waitFor(":is(a[href='/r/all/'], a[href='/?feed=home&rizz=all'])", leftTopNavSection.shadowRoot).then((shortcut) => {
            shortcut.setAttribute("href", "/?feed=home&rizz=all");
            let params = new URLSearchParams(window.location.search);
            let allSelected = params.get("rizz");
            if (allSelected == "all") {
                leftTopNavSection.setAttribute("selectedpagetype", "all");
            }
        });
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

    rizzAllObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    })

    stateChanged.addListener("enableAllShortcut", enableAllShortcutChangedCallback);
}