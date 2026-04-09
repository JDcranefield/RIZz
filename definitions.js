const PAGE_TYPES = ["home", "news", "popular", "all", "subreddit"];

const PAGE_DEFAULTS = {
    home: true,
    news: true,
    popular: true,
    all: true,
    subreddit: false
};

const RULE_TYPES = ["title", "subreddit", "linkflair", "userflair", "domain", "username"];

const RES_TYPE_MAP = {
    postTitle: "title",
    subreddit: "subreddit",
    linkFlair: "linkflair",
    userFlair: "userflair",
    domain: "domain",
    username: "username"
};

const REVERSE_RES_TYPE_MAP = Object.fromEntries(
    Object.entries(RES_TYPE_MAP).map(([k, v]) => [v, k])
);

const FEED_SORT_TYPES = ["HOT", "NEW", "TOP", "RISING"];