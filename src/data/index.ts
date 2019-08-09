export * from './Ammo';
export * from './Armor';
export * from './Weapons';
export * from './Items';

import {ammo_list, ammo_sort_caliber_name} from './Ammo';
import {armor_list, armor_sort_ac_name} from './Armor';


export function sort_data() {
    ammo_list.sort(ammo_sort_caliber_name);
    armor_list.sort(armor_sort_ac_name);
}
