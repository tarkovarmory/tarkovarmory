export function chance(n:number):string {
    return (n*100.0).toFixed(0) + '%';
}
export function clamp(num:number, a:number, b:number) {
    return Math.max(a, Math.min(b, num));
}
export function dup(obj: any): any { /* {{{ */
    let ret;
    if (typeof(obj) === "object") {
        if (Array.isArray(obj)) {
            ret = [];
            for (let i = 0; i < obj.length; ++i) {
                ret.push(dup(obj[i]));
            }
        } else {
            ret = {};
            for (let i in obj) {
                ret[i] = dup(obj[i]);
            }
        }
    } else {
        return obj;
    }
    return ret;
} /* }}} */

export function lsget(key, _default:any):any {
    try {
        let ret = localStorage.getItem(key);
        if (ret === null) {
            return _default;
        }
        return JSON.parse(ret);
    } catch (e) {
        //console.error(e);
        return _default;
    }
}
export function lsset(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        //console.error(e);
    }
}

export function is_descendent_of(item, ancestor_item_id) {
    let cur = item;
    while (cur) {
        if (cur.parent_id === ancestor_item_id) {
            return true;
        }
        cur = cur.parent;
    }
    return false;
}
