import { well_known_ids, tr, config } from 'generated';
import { Ammo } from './Ammo';
import { Item, items } from './Items';
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
    if (a.armorClass !== b.armorClass) {
        return a.armorClass - b.armorClass;
    }
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}

export class Armor extends Item {
    /* these fields come directly from the item-database.json, complete with inconsistent casing. */
    readonly armorClass:number;
    readonly BluntThroughput:number;
    readonly Durability:number;
    readonly MaxDurability:number;
    readonly ArmorMaterial:string;

    readonly armor_zones:{[zone:string]:boolean} = {};
    readonly resistance:number;
    readonly destructibility:number;
    readonly min_repair_degradation:number;
    readonly max_repair_degradation:number;

    constructor(id:number, raw: any) {
        super(id, raw);

        this.armorClass = this.armorClass || 0;
        this.BluntThroughput = this.BluntThroughput || 1;
        this.Durability = this.Durability || 0;
        this.MaxDurability = this.MaxDurability || 0;
        this.ArmorMaterial = this.ArmorMaterial || null;

        this.armor_zones = extractArmorZones(raw);
        this.resistance = this.compute_resistance();
        this.destructibility = this.compute_destructibility();
        this.min_repair_degradation = this.compute_min_repair_degradation();
        this.max_repair_degradation = this.compute_max_repair_degradation();
    }

    /*
    dup():Armor {
        return new Armor(this.id, this.raw);
    }
    */
    get name():string {
        return item_name(this.id);
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
            return -1000;
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


const NOARMOR = -1;  /* match with build_ts_files.py */
const NOHELMET = -2;  /* match with build_ts_files.py */
const NOVEST = -3;  /* match with build_ts_files.py */

armor_list.push(
    new Armor(NOARMOR, {
        id               : NOARMOR,
        slug             : "noarmor",
    })
);

helmet_list.push(
    new Armor(NOHELMET, {
        id               : NOHELMET,
        slug             : "nohelmet",
    })
);

vest_list.push(
    new Armor(NOVEST, {
        id               : NOVEST,
        slug             : "novest",
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

        let armor = new Armor(parseInt(id), item.raw);

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
