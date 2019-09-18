import { well_known_ids, tr, config } from 'generated';
import { Ammo } from './Ammo';
import { Item, items } from './Items';
import { item_name } from '../translate';

export type ArmorZones = "thorax" | "stomach" | "arms" | "legs" | "eyes" | "jaws" | "ears" | "nape" | "top";
export const armor_list:Array<Item> = [];
export const vest_list:Array<Item> = [];
export const helmet_list:Array<Item> = [];

export function armor_by_slug(slug:string):Item {
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

export function armor_sort_ac_name(a:Item, b:Item):number {
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



const NOARMOR = -1;  /* match with build_ts_files.py */
const NOHELMET = -2;  /* match with build_ts_files.py */
const NOVEST = -3;  /* match with build_ts_files.py */

armor_list.push(
    new Item(NOARMOR, {
        id               : NOARMOR,
        slug             : "noarmor",
    })
);

helmet_list.push(
    new Item(NOHELMET, {
        id               : NOHELMET,
        slug             : "nohelmet",
    })
);

vest_list.push(
    new Item(NOVEST, {
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

        let armor = new Item(parseInt(id), item.raw);
        items[id] = armor;

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

