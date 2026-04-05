
let linkCommentsObserver = new MutationObserver((mutations) => {
    if (reddit.root && reddit.isOld) {
        sidebarObserver.disconnect();
        return;
    }

    for (const m of mutations) {
        for (const node of m.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;

            if (node.matches?.("shreddit-profile-comment")) {
                processLinkComment(node);
                continue;
            }

            const comments = node.querySelectorAll?.("shreddit-profile-comment");
            if (comments && comments.length) {
                comments.forEach(processLinkComment);
            }
        }
    }
});

let linkPostsObserver = new MutationObserver((mutations) => {
    if (reddit.root && reddit.isOld) {
        sidebarObserver.disconnect();
        return;
    }

    for (const m of mutations) {
        for (const node of m.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;

            if (node.matches?.("shreddit-post")) {
                processLinkPost(node);
                continue;
            }

            const comments = node.querySelectorAll?.("shreddit-post");
            if (comments && comments.length) {
                comments.forEach(processLinkPost);
            }
        }
    }
});

function enableDesktopLinksChangedCallback(newValue) {
    enableDesktopLinks = newValue;

    updateLinksStyle();
}

function processLinkComment(comment) {
    if (processedLinkComments.has(comment)) return;
    processedLinkComments.add(comment);

    comment.addEventListener("click", (e) => {
        if (enableDesktopLinks
            && !e.detail.isFake
            && e.target.tagName.toLowerCase() != "shreddit-comment-share-button"
            && e.target.tagName.toLowerCase() != "shreddit-overflow-menu") {
            e.stopPropagation();

            const fakeClick = new CustomEvent("click", {
                bubbles: true,
                detail: { isFake: true }
            });
            reddit.root.dispatchEvent(fakeClick);
        }
    }, true);
}

function processLinkPost(post) {
    if (processedLinkPosts.has(post)) return;
    processedLinkPosts.add(post);

    if (post.querySelector("div > a[slot='title']")) {
        post.querySelector("div > a[slot='title']").target = "_blank";
    }
}

function updateLinksStyle() {
    let style = document.querySelector("#rizz-links");

    if (!enableDesktopLinks) {
        if (style) {
            style.remove();
        }

        return;
    }

    if (style) return;

    style = document.createElement("style");
    style.id = "rizz-links";
    style.textContent =
        `
            shreddit-app {
                shreddit-post shreddit-join-button,
                shreddit-post community-status-tooltip {
                    display: none !important;
                }
            }

            shreddit-app {
                & shreddit-post {
                    & a[slot="full-post-link"] {
                        pointer-events: none !important;
                    }
                    & div[data-testid="post-thumbnail"]{
                        cursor: pointer !important;
                    }
                    & div[slot="title"] {
                        display: block !important;
                        margin-bottom: 0.5rem !important;
                    }
                    & div[slot="title"] > a {
                        &:hover {
                            text-decoration: none !important;
                        }

                        display: inline !important;
                    }

                    cursor: auto !important;
                    line-height:0 !important;
                }

                & shreddit-profile-comment {
                    & > div {
                        cursor: auto !important;
                    }
                    & > div > div {
                        pointer-events: auto !important;
                    }

                    pointer-events: none !important;
                }
            }
        `;

    document.documentElement.appendChild(style);
}

function loadLinksModule() {
    linkPostsObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    linkCommentsObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
    updateLinksStyle();
    stateChanged.addListener("enableDesktopLinks", enableDesktopLinksChangedCallback);
}