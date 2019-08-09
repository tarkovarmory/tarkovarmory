import { genitems as generated_items, well_known_ids, images } from 'generated';
import { item_name, item_long_name } from '../translate';
import { dup } from '../util';

export let slug2id = {};
export let slug2item = {};
export let id2slug = {};

export let items:Array<Item> = [];

export class Item {
    id:number;
    parent_id:number;
    slug:string;
    children:Array<Item>;
    parent:Item;
    conflicting_items:Array<number>;
    slots:{[id:string]: {required: boolean, filter: Array<number>}};
    slot_parents:Array<Item> = [];
    //all_possible_attachments:{[id:string]: Array<Item>} = {};

    match:boolean; /* used for searching */

    constructor(id:number, raw:any) {
        this.children = [];
        for (let field in raw) {
            this[field] = dup(raw[field]);
        }
        this.id = id;
    }

    get name():string {
        return item_name(this.id);
    }
    get long_name():string {
        return item_long_name(this.id);
    }
    get image_url():string {
        if (this.id in images) {
            return `/static/images/${images[this.id]}.png`;
        }

        if (this.parent) {
            return this.parent.image_url;
        }

        return null;
    }
    isDescendentOf(id:number):boolean {
        if (this.parent) {
            if (this.parent.id === id) {
                return true;
            }
            return this.parent.isDescendentOf(id);
        }
        return false;
    }
};

for (let id in generated_items) {
    if (isNaN(parseInt(id))) {
        console.error("Fialed to parse id:", id);
    }
    items[parseInt(id)] = new Item(parseInt(id), generated_items[id]);
}

/* compute parent and children */
for (let item of items) {
    if (item && item.parent_id) {
        item.parent=items[item.parent_id];
        if (item.parent) {
            item.parent.children.push(item);
        }
    }
}

/* compute slot parents */
for (let item of items) {
    if (item && item.slots) {
        for (let slot_name in item.slots) {
            for (let id of item.slots[slot_name].filter) {
                items[id].slot_parents.push(item);
            }
        }
    }
}

for (let item of items) {
    if (item) {
        slug2id[item.slug] = item.id;
        slug2item[item.slug] = item;
        id2slug[item.id] = item.slug;
    }
}
