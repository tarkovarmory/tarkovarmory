const path = require("path");
const fs = require('fs');
import { get_shots_to_kill_cache, shots_to_kill } from './simulations';
import { ammo_list, armor_list, vest_list, helmet_list } from './data';

console.log("Building bullet armor cache");
let start = (new Date).getTime();
for (let ammo of ammo_list) {
    for (let armor of armor_list) {
        shots_to_kill(ammo, [armor], null, 80, 0, 10000);
    }
    for (let helmet of helmet_list) {
        shots_to_kill(ammo, [helmet], null, 35, 0, 10000);
    }
    for (let vest of vest_list) {
        shots_to_kill(ammo, [vest], null, 80, 0, 10000);
    }
}
let end = (new Date).getTime();

let stringified = `
export let shots_to_kill_cache = ${JSON.stringify(get_shots_to_kill_cache())}
`;

console.log("Built cache: ", stringified.length, " bytes in ", end-start, "ms");

fs.writeFileSync("src/precomputed.ts", stringified);
