import { genitems as generated_items, well_known_ids, images, config } from 'generated';
import { item_name, item_long_name } from '../translate';
import { caliber_to_type } from './Ammo';
//import { dup } from '../util';

export let slug2id = {};
export let slug2item = {};
export let id2slug = {};
export let items:Array<Item> = [];

export type SlotMap = {[slot_name:string]:string}; /* ex: ["W.mod_gasblock.mod_handguard.mod_scope"] = "opk7_reflex_sight" */
export type ConflictMap = {[item_id:number]:number};

export class Item {
    public readonly raw:any;

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

    custom_durability:number; /* used when entering durabilty manually. This is updated by updateCustomDurability */

    /* these fields come directly from the item-database.json, complete with inconsistent casing. */
    readonly armorClass:number;
    readonly BluntThroughput:number;
    readonly Durability:number;
    readonly MaxDurability:number;
    readonly ArmorMaterial:string;

    /* we compute these */
    readonly armor_zones:{[zone:string]:boolean} = {};
    readonly armor_zones_string:string;
    readonly resistance:number;
    readonly destructibility:number;
    readonly min_repair_degradation:number;
    readonly max_repair_degradation:number;


    constructor(id:number, raw:any) {
        for (let field in raw) {
            //this[field] = dup(raw[field]);
            this[field] = raw[field];
        }

        this.id = id;
        this.raw = raw;
        this.children = [];


        this.armorClass = this.armorClass || 0;
        this.BluntThroughput = this.BluntThroughput || 1;
        this.Durability = this.Durability || 0;
        this.MaxDurability = this.MaxDurability || 0;
        this.ArmorMaterial = this.ArmorMaterial || null;

        this.armor_zones = extractArmorZones(raw);
        this.armor_zones_string = Object.keys(this.armor_zones).join(' ');
        this.resistance = this.compute_resistance();
        this.destructibility = this.compute_destructibility();
        this.min_repair_degradation = this.compute_min_repair_degradation();
        this.max_repair_degradation = this.compute_max_repair_degradation();
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

    /** Computes the attributes in attribute_map by recursivly looking at the item build */
    calculate_attributes(prefix:string, slot_map:SlotMap, attribute_map:{[attribute:string]:any}):void {
        if (!this.slots || Object.keys(this.slots).length === 0) {
            return;
        }

        for (let slot_name in this.slots) {
            let key = prefix + "." + slot_name;
            let val = slot_map[key] || (this.slots[slot_name].required ? id2slug[this.slots[slot_name].filter[0]] : "");
            let sel:Item = val.length > 0 ? slug2item[val] : null;

            if (sel) {
                for (let k in attribute_map) {
                    if (k in sel) {
                        switch(k) {
                            /* Overwritten attributes */
                            case 'CenterOfImpact':
                            case 'RecoilForceUp':
                            case 'RecoilForceBack':
                            case 'RecoilAngle':
                            case 'Convergence':
                            case 'bFirerate':
                            case 'bHearDist':       /* hearing distance */
                            case 'ammoCaliber':
                                attribute_map[k] = sel[k];
                                break;

                            /* Best of */
                            case 'SightingRange':
                            case 'bEffDist':      /* effective distance */
                                attribute_map[k] = Math.max(sel[k], attribute_map[k]);
                                break;

                            /* Additive */
                            case 'Weight':
                            case 'Accuracy':   /* accuracy modifier */
                            case 'Ergonomics':
                            case 'Recoil':     /* recoil modifier */
                            case 'Velocity':   /* velocity modifier */
                                attribute_map[k] += sel[k];
                                break;

                            /* No combination */
                            case 'armorClass':
                            case 'BluntThroughput':
                            case 'Durability':
                            case 'MaxDurability':
                            case 'resistance':
                            case 'destructibility':
                            case 'ArmorMaterial':
                            case 'armor_zones':
                            case 'armor_zones_string':
                                // no action
                                break;

                            default:
                                console.error(`Unhandled attribute incalculate_attributes: ${k}`);
                                attribute_map[k] = 'ERR';
                                break;
                        }

                    }
                }

                sel.calculate_attributes(key, slot_map, attribute_map);
            }
        }
    }

    /** Outputs a map of all conflicting item its as determined by recursivly looking at the item build */
    calculate_conflict_map(prefix:string, slot_map:SlotMap, conflict_map:ConflictMap = {}):ConflictMap {
        if (this.conflicting_items) {
            for (let id of this.conflicting_items) {
                conflict_map[id] = id;
            }
        }

        if (!this.slots || Object.keys(this.slots).length === 0) {
            return {};
        }

        for (let slot_name in this.slots) {
            let key = prefix + "." + slot_name;
            let val = slot_map[key] || (this.slots[slot_name].required ? id2slug[this.slots[slot_name].filter[0]] : "");
            let sel:Item = val.length > 0 ? slug2item[val] : null;

            if (sel) {
                sel.calculate_conflict_map(key, slot_map, conflict_map);
            }
        }

        return conflict_map;
    }

    /** Returns an array of the item along with all attached items **/
    public attached_items(prefix:string, slot_map:SlotMap):Array<Item> {
        let ret:Array<Item> = [];

        function get_items(prefix:string, root:Item):void {
            ret.push(root);

            if (!root.slots || Object.keys(root.slots).length === 0) {
                return;
            }

            for (let slot_name in root.slots) {
                let key = prefix + "." + slot_name;
                let val = slot_map[key] || (root.slots[slot_name].required ? id2slug[root.slots[slot_name].filter[0]] : "");
                let sel:Item = val.length > 0 ? slug2item[val] : null;

                if (sel) {
                    get_items(key, sel);
                }
            }
        }

        get_items(prefix, this);

        return ret;
    }

    /** Recursively updates custom_durability **/
    public updateCustomDurability(prefix:string, slot_map:SlotMap):void {
        function update(prefix:string, root:Item):void {
            root.custom_durability = parseFloat(slot_map[prefix + '~durability'] || root.MaxDurability.toString());

            if (!root.slots || Object.keys(root.slots).length === 0) {
                return;
            }

            for (let slot_name in root.slots) {
                let key = prefix + "." + slot_name;
                let val = slot_map[key] || (root.slots[slot_name].required ? id2slug[root.slots[slot_name].filter[0]] : "");
                let sel:Item = val.length > 0 ? slug2item[val] : null;

                if (sel) {
                    update(key, sel);
                }
            }
        }

        update(prefix, this);
    }


    private compute_resistance():number {
        /* This is defined in a lookup table in confg.json, but was a simple calculation */
        if (this.armorClass === 0) {
            return 1;
        }
        return this.armorClass * 10;
    }
    private compute_destructibility():number {
        if (this.ArmorMaterial in config['armor_materials']) {
            return config['armor_materials'][this.ArmorMaterial]['Destructibility'];
        } else {
            //return -1000;
            return 0;
        }
    }
    private compute_min_repair_degradation():number {
        if (this.ArmorMaterial in config['armor_materials']) {
            return config['armor_materials'][this.ArmorMaterial]['MinRepairDegradation'];
        }
    }
    private compute_max_repair_degradation():number {
        if (this.ArmorMaterial in config['armor_materials']) {
            return config['armor_materials'][this.ArmorMaterial]['MaxRepairDegradation'];
            return -1000;
        }
    }
};

for (let id in generated_items) {
    if (isNaN(parseInt(id))) {
        console.error("Fialed to parse id:", id);
    }
    items[parseInt(id)] = new Item(parseInt(id), generated_items[id]);
}

for (let item of items) {
    if (item) {
        item.children = [];
        item.slot_parents = [];
    }
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

function extractArmorZones(item:any):{[zone:string]:boolean} {
    let ret:{[zone:string]:boolean} = {};
    if (item.armorZone) {
        for (let z of item.armorZone) {
            if (z !== "Head") {
                if (z === "Chest") {
                    z = "thorax";
                }
                if (z === "LeftArm") {
                    z = "arms";
                }
                if (z === "RightArm") {
                    continue;
                }
                if (z === "LeftLeg") {
                    z = "legs";
                }
                if (z === "RightLeg") {
                    continue;
                }
                ret[z.toLowerCase()] = true;
            }
        }
    }
    if (item.headSegments) {
        for (let z of item.headSegments) {
            ret[z.toLowerCase()] = true;
        }
    }

    return ret;
}
