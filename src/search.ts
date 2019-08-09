const queryString = require('query-string');
import { dup } from './util';
declare var browserHistory;

let server_search:{[name:string]: Array<string>} = {};

export function server_set_search(obj:{[name:string]: Array<string>}) {
    server_search = obj;
}

export function update_search(name:string, values:Array<string>):void {
    let S = get_search_all();
    S[name] = values;
    let qs = "";
    for (let key in S) {
        if (S[key] && S[key].length > 0) {
            if (qs !== "") {
                qs += "&";
            }
            qs +=key + "=" + S[key].join(",");
        }
    }
    if (qs.length) {
        browserHistory.replace(browserHistory.location.pathname + "?" + qs);
    } else {
        browserHistory.replace(browserHistory.location.pathname);
    }
}

export function field_flags_to_array(obj:{[name:string]: any}):Array<string> {
    return Object.keys(obj).filter(x=>obj[x]);
}

export function array_to_field_flags(vals:Array<string>):{[name:string]: boolean} {
    let ret:{[name:string]: boolean} = {};
    vals.map(x => ret[x] = true);
    return ret;
}

export function get_search_all():{[name:string]: Array<string>} {
    try {
        let q = queryString.parse(browserHistory.location.search);
        let ret:{[name:string]: Array<string>} = {};
        for (let k in q) {
            ret[k] = q[k].split(",");
        }
        return ret;
    } catch (e) {

    }
    return server_search;
}
export function get_search(name:string, _default:Array<string> = []):Array<string> {
    let S = get_search_all();
    if (name in S) {
        return S[name];
    }
    return dup(_default);
}
export function get_search1(name:string, _default:string = null):string {
    return get_search(name, [_default])[0];
}
export function update_search1(name:string, _val:string){
    update_search(name, [_val]);
}
