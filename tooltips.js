let tooltipsObserver = new MutationObserver((mutations) => {
    if (reddit.root && reddit.isOld) {
        tooltipsObserver.disconnect();
        return;
    }

    for (const m of mutations) {
        for (const node of m.addedNodes) {
            if (node.nodeType !== 1) continue;

            if (node.matches?.("faceplate-hovercard")) {
                processCard(node);
            }

            node.querySelectorAll?.("faceplate-hovercard").forEach(el => {
                processCard(el);
            });
        }
    }
});

function disableHovercardsChangedCallback(newValue) {
    disableHovercards = newValue;

    if (reddit.isOld) {
        oldTooltipsChecker();
    } else {
        processedHovercards.forEach((card) => {
            processCard(card, true);
        });
    }
}

function processCard(card, reprocess = false) {
    if ((!reprocess && processedHovercards.has(card)) ||
        (reprocess && !processedHovercards.has(card))) return;
    if (!reprocess) {
        processedHovercards.add(card);
    }

    if (disableHovercards) {
        card.setAttribute("enter-delay", "9999999999999");
    } else {
        card.setAttribute("enter-delay", "500");
    }
}

function oldTooltipsChecker() {
    let style = document.querySelector("#rizz-disable-hovercard");

    if (disableHovercards) {
        if (!style) {
            style = document.createElement("style");
            style.id = "rizz-disable-hovercard";
            style.textContent = "div.author-tooltip {display:none !important;}";
            document.documentElement.appendChild(style);
        }
    } else if ((style)) style.remove();
}

function loadTooltipsModule() {
    oldTooltipsChecker();
    tooltipsObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    stateChanged.addListener("disableHovercards", disableHovercardsChangedCallback);
}