import { well_known_ids, tr, config } from 'generated';
import { Ammo } from './Ammo';
import { items } from './Items';
import { item_name } from '../translate';

export type ArmorZones = "thorax" | "stomach" | "arms" | "legs" | "eyes" | "jaws" | "ears" | "nape" | "top";
export const armor_list:Array<Armor> = [];
export const vest_list:Array<Armor> = [];
export const helmet_list:Array<Armor> = [];

export function armor_by_slug(slug:string):Armor {
    for (let list of [armor_list, vest_list, helmet_list]) {
        for (let armor of list) {
            if (!armor) {
                console.log("Found null in armor list");
                continue;
            }
            if (armor.slug === slug) {
                return armor;
            }
        }
    }

    console.log("Failed to find slug: ", slug)
    return null;
}

export function armor_sort_ac_name(a:Armor, b:Armor):number {
    if (a.armor_class !== b.armor_class) {
        return a.armor_class - b.armor_class;
    }
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}

export class Armor {
    public raw:any;
    public id:number;
    public slug:string;
    public armor_class:number;
    public blunt_throughput:number;
    public durability:number;
    public max_durability:number;
    public material:string;
    public armor_zones:{[zone:string]:boolean} = {};

    constructor(
        obj:{
            raw:any,
            id:number,
            slug:string,
            armor_class:number,
            blunt_throughput:number,
            durability:number,
            max_durability:number,
            material:string,
            armor_zones: {[zone:string]:boolean},
        }
    ) {
        this.raw              = obj.raw;
        this.id               = obj.id;
        this.slug             = obj.slug;
        this.armor_class      = obj.armor_class;
        this.blunt_throughput = obj.blunt_throughput;
        this.durability       = obj.durability;
        this.max_durability   = obj.max_durability;
        this.material         = obj.material;
        this.armor_zones      = obj.armor_zones;
    }

    dup():Armor {
        return new Armor(this);
    }
    get name():string {
        return item_name(this.id);
    }
    get resistance():number {
        /* This is defined in a lookup table in confg.json, but was a simple calculation */
        if (this.armor_class === 0) {
            return 1;
        }
        return this.armor_class * 10;
    }
    get destructibility():number {
        return config['armor_materials'][this.material]['Destructibility'];
    }
    get min_repair_degradation():number {
        return config['armor_materials'][this.material]['MinRepairDegradation'];
    }
    get max_repair_degradation():number {
        return config['armor_materials'][this.material]['MaxRepairDegradation'];
    }
};


const NOARMOR = -1;  /* match with build_ts_files.py */
const NOHELMET = -2;  /* match with build_ts_files.py */
const NOVEST = -3;  /* match with build_ts_files.py */

armor_list.push(
    new Armor({
        raw              : {},
        id               : NOARMOR,
        slug             : "noarmor",
        armor_class      : 0,
        blunt_throughput : 1,
        durability       : 0,
        max_durability   : 0,
        material         : null,
        armor_zones      : {},
    })
);

helmet_list.push(
    new Armor({
        raw              : {},
        id               : NOHELMET,
        slug             : "nohelmet",
        armor_class      : 0,
        blunt_throughput : 1,
        durability       : 0,
        max_durability   : 0,
        material         : null,
        armor_zones      : {},
    })
);

vest_list.push(
    new Armor({
        raw              : {},
        id               : NOVEST,
        slug             : "novest",
        armor_class      : 0,
        blunt_throughput : 1,
        durability       : 0,
        max_durability   : 0,
        material         : null,
        armor_zones      : {},
    })
);

for (let id in items) {
    let item = items[id] as any;
    if (item.parent_id === well_known_ids['armor'] ||
        item.parent_id === well_known_ids['vest'] ||
        item.isDescendentOf(well_known_ids['headwear'])
    ) {
        if (item.armorClass == 0) {
            continue;
        }

        let armor =
            new Armor({
                raw              : item,
                id               : parseInt(id),
                slug             : item.slug,
                armor_class      : item.armorClass,
                blunt_throughput : item.BluntThroughput,
                durability       : item.Durability,
                max_durability   : item.MaxDurability,
                material         : item.ArmorMaterial,
                armor_zones      : extractArmorZones(item),
            });


        if (item.parent_id === well_known_ids['armor']) {
            armor_list.push(armor);
        }
        if (item.parent_id === well_known_ids['vest']) {
            vest_list.push(armor);
        }
        if (item.isDescendentOf(well_known_ids['headwear'])) {
            helmet_list.push(armor);
        }
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
