import React from 'inferno-compat';
import ReactDOM from 'inferno-compat';

import { Component } from "inferno";
import { _, item_name, item_long_name } from "translate";
import { well_known_ids } from 'generated';
import { dup, lsget, lsset } from './util';
import { items } from './data';

const root = items.filter(item => !item.parent_id)[0];
const MAX_RESULTS = 25;

let _search_count = 0;
function search(re, node) {
    if (!node) {
        return false;
    }

    if (node.parent === null) {
        _search_count = 0;
    }

    node.match = false;
    if (re.test(item_long_name(node.id))) {
        node.match = true;
        re = new RegExp(""); /* this makes us fall through and flag all child nodes as matching */
    }

    if (node.children) {
        for (let child of node.children) {
            node.match |= search(re, child);
        }
    } else {
        if (node.match) {
            _search_count += 1;
        }
    }

    return node.match;
}

let _render_limit:number = 0;
function render(node, limit:number=0, skipTop:boolean=false) {
    if (limit) {
        _render_limit = limit;
    }

    --_render_limit;
    if (_render_limit <= 0) {
        return null;
    }

    let image_source = node ? node.image_url : null;

    return (
        <div className={skipTop ? '' : 'item-node'}>
            {skipTop
                ? null
                : <div data-id={node.id} data-leaf={!node.children ? 1 : 0} className={'item-node-name' + (!node.children ? ' leaf' : '')}>
                    {!node.children  /* only do images for leaf nodes */
                        ?  <span>
                            {image_source
                                ? <img src={image_source} />
                                : <span className='image-filler' />
                            }
                            </span>
                        : null }
                    {item_long_name(node.id)}
                  </div>
            }
            {(node.children  && node.children.filter(x=>x.match).length > 0)
                ?  <div className='item-node-children'>
                        {node.children.filter(x=>x.match).map((n, idx) => (
                            <div key={n.slug}>
                                {render(n)}
                            </div>
                        ))}
                   </div>
                :  null
            }
        </div>
    );
}

function get_first_matching_leaf_id(node) {
    if (!node) {
        return 0;
    }

    if (node.children) {
        for (let c of node.children) {
            let res = get_first_matching_leaf_id(c);
            if (res) {
                return res;
            }
        }
    } else {
        if (node.match) {
            return node.id;
        }
    }
    return 0;
}


export class Items extends Component<{}, any> {
    constructor(props) {
        super(props);

        this.state = {
            "search": lsget("item-search", ""),
            "selected": lsget("item-selected", 0),
            "backpack": lsget("item-backpack", {}),
        };

        let re = new RegExp(this.state.search, "iu");
        search(re, root);
        let first_id = get_first_matching_leaf_id(root);
        lsset("item-search", this.state.search);
        lsset("item-selected", first_id);
        this.state["selected"] = first_id;
    }

    updateSearch = (ev_or_str) => {
        let search_string = typeof(ev_or_str) === "string" ? ev_or_str : ev_or_str.target.value;

        let re = new RegExp(search_string, "iu");
        search(re, root);
        let first_id = get_first_matching_leaf_id(root);
        lsset("item-search", search_string);
        lsset("item-selected", first_id);
        this.setState({
            "search": search_string,
            "selected": first_id,
        });
    }

    selectItem = (ev) => {
        let cur = ev.target;
        while (!('id' in cur.dataset)) {
            cur = cur.parentNode;
        }

        if (parseInt(cur.dataset.leaf)) {
            console.log("LEAF: ", cur.dataset.id);
            this.setState({"selected": parseInt(cur.dataset.id)});
            lsset("item-selected", parseInt(cur.dataset.id));
        }
    }

    toggleBackpack(item_id) {
        let backpack = dup(this.state.backpack);
        if (item_id in backpack) {
            delete backpack[item_id];
        } else {
            backpack[item_id] = item_id;
        }
        this.setState({"backpack": backpack});
        lsset("item-backpack", backpack);
    }

    onSearchKeyDown = (ev) => {
        if (ev.keyCode === 13) {
            if (this.state.selected) {
                this.toggleBackpack(this.state.selected);
            }
        }
    }

    clearBackpack = () => {
        this.setState({"backpack": {}});
        lsset("item-backpack", {});
    }

    public render() {

        let item = this.state.selected > 0 ? items[this.state.selected] : null;

        let backpack_items = Object.keys(this.state.backpack).map(id => items[id]);
        backpack_items.sort((a,b) => {
            let aval = 0;
            let bval = 0;
            try {
                aval = a['CreditsPrice'] / (a['Width'] * a['Height']);
            } catch (e) {
                console.error(e);
            }
            try {
                bval = b['CreditsPrice'] / (b['Width'] * b['Height']);
            } catch (e) {
                console.error(e);
            }

            if (aval === bval) {
                console.log("wtf", aval, bval, a, b);
                let aname = item_long_name(a.id);
                let bname = item_long_name(b.id);
                if (aname < bname) {
                    return -1;
                }
                if (aname > bname) {
                    return 1;
                }
                return 0;
            }

            return aval - bval;
        });

        return (
            <div id='Items'>
                <div id='Item-search-container'>
                    <input id='Item-search' value={this.state.search}
                        onChange={this.updateSearch}
                        onKeyDown={this.onSearchKeyDown}
                        placeholder={"Search..."}
                        autoFocus={true} />
                </div>

                <div id='Items-results-backpack-split'>
                    <div id='Items-search-results' onClick={this.selectItem}>
                        {root && root.match
                            ? render(root, MAX_RESULTS, true)
                            : (this.state.search.length > 0
                                ? <div>No items found</div>
                                : null)
                        }
                        {_search_count > MAX_RESULTS ? <div>{_search_count - MAX_RESULTS} more results</div> : null}
                    </div>

                    <div id='Items-selected-backpack-split'>
                        {item &&
                            <div id='Items-selected'>
                                {RenderItem(item)}
                                {item.id in this.state.backpack
                                    ? <button onClick={() => this.toggleBackpack(item.id)}>Remove from Backpack</button>
                                    : <button onClick={() => this.toggleBackpack(item.id)}>Add to Backpack</button>
                                }
                            </div>
                        }

                        <div id='Items-backpack' onClick={this.selectItem}>
                            <div className='backpack-label'>
                                Backpack
                                <button className='clear-backpack' onClick={this.clearBackpack}>clear</button>
                            </div>
                            {backpack_items.length === 0
                                ? <div className='center'>Nothing added yet</div>
                                : <div className='backpack-item space-after'>
                                    <span className='remove'>&nbsp;</span>
                                    <span className='slot-price'>Price / size</span>
                                    <span className='name'>Item</span>
                                  </div>
                            }
                            {backpack_items.map((item) =>
                                <div data-leaf={1} data-id={item.id} className='backpack-item leaf'>
                                    <span className='remove'>
                                        <span className='remove-button' onClick={() => this.toggleBackpack(item.id)}>-</span>
                                    </span>
                                    <span className='slot-price'>{Math.round(item['CreditsPrice'] / (item['Width'] * item['Height']))}</span>
                                    <span className='name'>{item_long_name(item.id)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


function RenderItem(item) {
    let image_source = item ? item.image_url : null;
    console.log(item.id, image_source);

    return (
        <div className='Item'>
            {image_source ? <img src={image_source} /> : null}
            <h2>{item_long_name(item.id)}</h2>
            {Object.keys(item).map((attr, idx) => {
                let attrname;
                let value;
                let size;
                try {
                    size = item['Width'] * item['Height'];
                } catch (e) {
                    size = 1;
                }
                if (size <= 0) {
                    size = 1;
                }


                switch (attr) {
                    case 'Rarity':
                    case 'SpawnChance':
                        attrname = attr;
                        value=item[attr];
                        break;

                    case 'Height':
                        break;
                    case 'Width':
                        attrname = 'Size';
                        value= `${item['Width']}x${item['Height']}`;
                        break;
                    case 'CreditsPrice':
                        attrname = "Price";
                        if (size > 1) {
                            value= `${item[attr]} (${(parseFloat(item[attr])/size).toFixed(0)} / size)`;
                        } else {
                            value= `${item[attr]}`
                        }
                }

                if (attrname) {
                    return (
                        <div className='item-attribute' key={attr}>
                            <span className='attr'>{attrname}</span>
                            <span className='value'>{value}</span>
                        </div>
                    )
                }

                return null;
            })}

        </div>
    );
}

export default Items;
