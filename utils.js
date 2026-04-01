function stringToRegExp(input) {
    if (typeof input !== "string") {
        return null;
    }

    let m = input.match(/(\/?)(.+)\1([a-z]*)/i);

    if (!m) {
        return null;
    }

    let validFlags = Array.from(new Set(m[3])).filter(function (flag) {
        return "gimsuy".includes(flag);
    }).join("");

    return new RegExp(m[2], validFlags);
}

function waitFor(selector, doc = document.documentElement, timeout = 5000) {
    return new Promise(resolve => {
        const start = Date.now();
        let existing = doc.querySelector(selector);
        if (existing) return resolve(existing);

        let observer = new MutationObserver(() => {
            let el = doc.querySelector(selector);
            if (el) {
                observer.disconnect();
                resolve(el);
            } else if (Date.now() - start > timeout) {
                observer.disconnect();
                resolve(null);
            }
        });

        observer.observe(doc, { childList: true, subtree: true });
    });
}

const stateChanged = {
    _listeners: new Map(),

    init() {
        browser.storage.onChanged.addListener((changes, area) => {
            if (area !== "local") return;

            for (const [key, change] of Object.entries(changes)) {
                const callbacks = this._listeners.get(key);
                if (!callbacks) continue;

                for (const cb of callbacks) {
                    cb(change.newValue, change.oldValue);
                }
            }
        });
    },

    addListener(key, callback) {
        if (!this._listeners.has(key)) {
            this._listeners.set(key, new Set());
        }
        this._listeners.get(key).add(callback);

        return () => {
            this._listeners.get(key)?.delete(callback);
        };
    }
};

stateChanged.init();