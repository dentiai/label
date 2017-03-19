export const copyJSON = (json) => JSON.parse(JSON.stringify(json));

export const qs = (function (a) {
    if (a === "") {
        return {}
    }
    const b = {};
    for (let i = 0; i < a.length; ++i) {
        const p = a[i].split('=', 2);
        if (p.length === 1) {
            b[p[0]] = "";
        } else {
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
    }
    return b;
})(window.location.search.substr(1).split('&'));