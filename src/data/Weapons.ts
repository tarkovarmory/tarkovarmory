import { AmmoCaliber } from './Ammo';
import { items, Item } from './Items';
import { is_descendent_of } from '../util';
import { item_name, item_long_name } from '../translate';

export type WeaponType = "rifle" | "carbine" | "light_mg" | "smg" | "shotgun" | "dmr" | "sniper" | "pistol";
export type FiringMode = "single" | "auto" | "burst";

class Weapon extends Item {
    constructor(id:number, raw:any) {
        super(id, raw);
    }
};

export const weapon_list:Array<Weapon> = [];

//console.log(items);

/*
for (let id in items) {
    let item = items[id];
    if (is_descendent_of(item, well_known_ids['weapon'])) {
        console.log(item);
    }
}

*/
