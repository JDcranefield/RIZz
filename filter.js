const processedByRulesPosts = new Set();

let feedObserver = new MutationObserver((mutations) => {
    const postSelector = ":is(article[data-post-id], #siteTable > div[data-fullname])";
    for (const m of mutations) {
        for (const node of m.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;

            if (node.matches?.(postSelector)) {
                processPost(node);
                continue;
            }

            let posts = node.querySelectorAll?.(postSelector);
            if (posts && posts.length) {
                posts.forEach((post) => {
                    processPost(post);
                });
            }
        }
    }
});

function fallbackFeedChecker() {
    const postSelector = ":is(article[data-post-id], #siteTable > div[data-fullname])";

    let posts = document.documentElement.querySelectorAll(postSelector);
    if (posts && posts.length) {
        posts.forEach((post) => {
            processPost(post);
        });
    }
}

function rulePagesChangedCallback(key, newValue) {
    filterPages[key] = newValue;
    updateRulePageCss();
}

function rulesChangedCallback(newValue) {
    filterRules = newValue;

    processedByRulesPosts.forEach((post) => {
        processPost(post, true);
    });
}

function updateRulePageCss() {
    let style = document.querySelector("#rizz-page-filters");
    if (style) style.remove();
    style = document.createElement("style");
    style.id = "rizz-page-filters";
    style.textContent =
        `
            shreddit-feed:is([absenceMakesTheHeartGrowFonder],
                ${filterPages["filter_home"] ? "[reload-url^='/svc/shreddit/feeds/home-feed']:not([is-rizzed])," : ""}
                ${filterPages["filter_news"] ? "[reload-url^='/svc/shreddit/feeds/news-feed']," : ""}
                ${filterPages["filter_popular"] ? "[reload-url^='/svc/shreddit/feeds/popular-feed']," : ""}
                ${filterPages["filter_all"] ? "[reload-url^='/svc/shreddit/feeds/all-feed'], [is-rizzed]," : ""}
                ${filterPages["filter_subreddit"] ? "[reload-url^='/svc/shreddit/community-more-posts']," : ""}
            ) {
                & .rizz-filtered {
                    & + hr {
                        display: none !important;
                    }

                    display: none !important;
                }
            }

            body.listing-page:is(:has(.pagename > a:is([absenceMakesTheHeartGrowFonder],
                ${filterPages["filter_popular"] ? "[href$='/r/popular'], [href$='/r/popular/']," : ""}
                ${filterPages["filter_all"] ? "[href$='/r/all'], [href$='/r/all/']," : ""}
                ${filterPages["filter_subreddit"] ? ":not(:is([href$='/r/all'], [href$='/r/all/'], [href$='/r/popular'], [href$='/r/popular/']))," : ""}
                )), [absenceMakesTheHeartGrowFonder],
                ${filterPages["filter_home"] ? `:not(:has(#header-bottom-left > .pagename)):not(:has(.sr-list li.selected > a:is([href$='/r/popular'], [href$='/r/popular/']))),` : ""}
                ${filterPages["filter_popular"] ? ":has(.sr-list li.selected > a:is([href$='/r/popular'], [href$='/r/popular/']))," : ""}
                ) {
                & .rizz-filtered {
                    & + div.clearleft {
                        display: none !important;
                    }

                    display: none !important;
                }
            }
        `;

    document.documentElement.appendChild(style);
}

function shouldFilter(postOuter) {
    let post = {};

    if (postOuter.matches("article")) {
        post.element = postOuter.querySelector("shreddit-post");
        post.title = post.element.getAttribute("post-title");
        post.subreddit = post.element.getAttribute("subreddit-name");
        post.linkflair = post.element.querySelector("shreddit-post-flair div.flair-content")?.innerText;
        post.userflair = post.element.querySelector("author-flair-event-handler > span")?.innerText;
        post.domain = post.element.getAttribute("domain");
        post.username = post.element.getAttribute("author");
    } else {
        post.element = postOuter;
        post.title = post.element.querySelector("[data-event-action='title']")?.innerText;
        post.subreddit = post.element.getAttribute("data-subreddit");
        post.linkflair = post.element.querySelector(".linkflairlabel > span")?.innerText;
        post.userflair = post.element.querySelector(".flair")?.getAttribute("title");
        post.domain = post.element.getAttribute("data-domain");
        post.username = post.element.getAttribute("data-author");


    }

    return filterRules.some(rule => {
        let regex = stringToRegExp(rule.pattern);
        if (!regex) return false;
        switch (rule.type) {
            case "title":
                return regex.test(post.title);

            case "subreddit":
                return regex.test(post.subreddit);

            case "linkflair":
                return regex.test(post.linkflair);

            case "userflair":
                return regex.test(post.userflair);

            case "domain":
                return regex.test(post.domain);

            case "username":
                return regex.test(post.username);

            default:
                return false;
        }
    });
}

function processPost(post, reprocess = false) {
    if ((!reprocess && processedByRulesPosts.has(post)) ||
        (reprocess && !processedByRulesPosts.has(post))) return;
    if (!reprocess) {
        processedByRulesPosts.add(post);
    }

    if (shouldFilter(post)) {
        post.classList.add("rizz-filtered");
    } else {
        post.classList.remove("rizz-filtered");
    }
}

function loadFilterModule() {
    feedObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    fallbackFeedChecker();

    document.documentElement.classList.remove("rizz-filter-loading");

    stateChanged.addListener("rules", rulesChangedCallback);
    PAGE_TYPES.forEach((key) => {
        stateChanged.addListener(`filter_${key}`, (newValue) => {
            rulePagesChangedCallback(`filter_${key}`, newValue);
        });
    });
    updateRulePageCss();
}