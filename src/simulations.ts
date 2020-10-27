import { Ammo, Item, armor_list, ammo_list } from 'data';
import { clamp } from './util';

interface ShotsToKill {
    min: number;
    max: number;
    avg: number;
}

let cache = {}

export function get_shots_to_kill_cache():any {
    return cache;
}

export function set_shots_to_kill_cache(_cache:any):void {
    cache = _cache;
}


export function shots_to_kill(bullet:Ammo, armor_list:Array<Item>, _armor_durabilities:Array<number> = null, health:number=80, blowthrough_rate:number = 0.0, simulations:number=250):ShotsToKill {
    if (armor_list.length === 0 || !armor_list[0]) {
        return {
            min: -1,
            avg: -1,
            max: -1,
        };
    }

    //let cache_key = `${bullet.id}.${armor.id}.${simulations}`;

    let armor_durabilities = _armor_durabilities ? _armor_durabilities.map(x => x || 0) : armor_list.map(armor => armor.Durability);
    let cache_key = `${bullet.id}.${health}.${blowthrough_rate}`;
    for (let armor_idx = 0; armor_idx < armor_list.length; ++armor_idx) {
        let armor = armor_list[armor_idx];
        let durability = armor_durabilities[armor_idx];
        cache_key += `.${armor.id}@${durability}`;
    }
    if (cache_key in cache) {
        return {
            min: cache[cache_key][0],
            avg: cache[cache_key][1],
            max: cache[cache_key][2],
        };
    }

    let ret:ShotsToKill = {
        min: 999999,
        max: 0,
        avg: 0,
    };

    for (let i = 0; i < simulations; ++i) {
        let ct = _shots_to_kill(bullet, armor_list, armor_durabilities, health, blowthrough_rate);
        ret.min = Math.min(ret.min, ct);
        ret.max = Math.max(ret.max, ct);
        ret.avg += ct;
    }

    ret.avg /= simulations;

    cache[cache_key] = [
        ret.min,
        ret.avg,
        ret.max,
    ];

    return ret;
}

function _shots_to_kill(bullet:Ammo, armor_list:Array<Item>, _armor_durabilities:Array<number>, health:number, blowthrough_rate:number):number {
    let head_health = 35;

    let shot_count = 0;
    let armor_durabilities = _armor_durabilities.map(x => x);

    for (let i = 0; i < 400; ++i) {
        shot_count += 1;

        for (let j = 0; j < bullet.bullets; ++j) {
            /* armor durabilties get's modified by this call */
            let bullet_damage = simulate_hit(armor_list, bullet, bullet.damage, bullet.penetration_power, armor_durabilities);
            health -= bullet_damage;
        }
        if (health <= 0) {
            if (blowthrough_rate === 0) {
                return shot_count;
            } else {
                let hh = head_health;

                // 1/6 spreading damage accross other parts of the body
                head_health += (health * blowthrough_rate * (1/6.0));
                health = 0;
                if (head_health <= 0) {
                    return shot_count;
                }
            }

        }
    }

    //throw new Error("Shots to kill simulation failed to terminate");
    return Infinity;
}

/*
public simulate_deflection():boolean {
public bool _E000(Vector3 _F7C2, Vector3 _F7C3, _E507 _F7C4)
{
    Vector3 ricochetVals = Template.RicochetVals;
    if (ricochetVals.x > 0f)
    {
        float num = Vector3.Angle(-_F7C2, _F7C3);
        if (num > ricochetVals.z)
        {
            float t = Mathf.InverseLerp(90f, ricochetVals.z, num);
            float num2 = Mathf.Lerp(ricochetVals.x, ricochetVals.y, t);
            if (_F7C4.Randoms._E10A(_F7C4.RandomSeed) < num2)
            {
                _F7C4.DeflectedBy = Item.Id;
                return true;
            }
        }
    }
    return false;
}
*/


//public void _E001(_E507 bullet) {
export function simulate_block(armor_durability:number, bullet_penetration_power:number, armor:Item, bullet:Ammo):boolean {
//    if (Repairable.Durability > 0.0) {
    if (armor_durability > 0.0) {
//        float num = Repairable.Durability / Repairable.MaxDurability * 100f;
        let num = (armor_durability / armor.MaxDurability) * 100.0;

//        float num3 = (121f - 5000f / (45f + num * 2f)) * armor.resistance * 0.01f;
        let num3 = (121.0 - 5000.0 / (45.0 + num * 2.0)) * armor.resistance * 0.01;
//        float num4 = (num3 >= bullet.penetration_power + 15f) ? 0f : ((!(num3 >= bullet.penetration_power)) ? (100f + bullet.penetration_power / (0.9f * num3 - bullet.penetration_power)) : (0.4f * (num3 - bullet.penetration_power - 15f) * (num3 - bullet.penetration_power - 15f)));
        let num4 = (num3 >= bullet_penetration_power + 15.0) ? 0.0 : ((!(num3 >= bullet_penetration_power)) ? (100.0 + bullet_penetration_power / (0.9 * num3 - bullet_penetration_power)) : (0.4 * (num3 - bullet_penetration_power - 15.0) * (num3 - bullet_penetration_power - 15.0)));
//        if (num4 - bullet.Randoms._E10A(bullet.RandomSeed) * 100f < 0f) {
//            bullet.BlockedBy = Item.Id;
//            return true;
//        }
        if (num4 - Math.random() * 100.0 < 0.0) {
            return true;
        }
//    }
    }
//    return false;
    return false;
}




//public void _E002(ref _E506 bullet, EBodyPart _F7C7, EDamageType _F7C8, out float damage_to_armor) {
export function simulate_hit(
    armor_list:Array<Item>,
    bullet:Ammo,
    bullet_damage:number,
    bullet_penetration_power:number,
    armor_durabilities:Array<number> /* read/write */)
    : number /* bullet damage */
{
    let blocked = false;

    for (let armor_idx = 0; armor_idx < armor_list.length; ++armor_idx) {
        let armor = armor_list[armor_idx];
        let armor_durability = armor_durabilities[armor_idx];

        //   damage_to_armor = 0f;
        let damage_to_armor = 0;
        //   if (Repairable.Durability > 0f) {
        if (armor_durability > 0.0) {
        //       if (bullet.DeflectedBy == Item.Id) {
        //           bullet.Damage /= 2f;
        //           bullet.ArmorDamage /= 2f;
        //           bullet.PenetrationPower /= 2f;
        //       }
            /* NOTE: Deflection not accounted for. Would probably be cool to do this.  */

        //       float num = Repairable.Durability / Repairable.MaxDurability * 100f;
            let num = (armor_durability / armor.MaxDurability) * 100.0;
        //       float num3 = (121f - 5000f / (45f + num * 2f)) * armor.resistance * 0.01f;
            let num3 = (121.0 - 5000.0 / (45.0 + num * 2.0)) * armor.resistance * 0.01;

        //       if (bullet.BlockedBy == Item.Id || bullet.DeflectedBy == Item.Id) {
        //           damage_to_armor = bullet.PenetrationPower * bullet.ArmorDamage * Mathf.Clamp(bullet.PenetrationPower / armor.resistance, 0.6f, 1.1f) * Singleton<_E164>.Instance.ArmorMaterials[Template.ArmorMaterial].Destructibility;
        //           bullet.Damage *= Template.BluntThroughput * Mathf.Clamp(1f - 0.03f * (num3 - bullet.PenetrationPower), 0.2f, 1f);
         //           bullet.StaminaBurnRate *= ((!(Template.BluntThroughput > 0f)) ? 1f : (3f / Mathf.Sqrt(Template.BluntThroughput)));
            if (simulate_block(armor_durability, bullet_penetration_power, armor, bullet)) {
                damage_to_armor = bullet_penetration_power * bullet.armor_damage * clamp(bullet_penetration_power / armor.resistance, 0.6, 1.1) * armor.destructibility;
                bullet_damage *= armor.BluntThroughput * clamp(1.0 - 0.03 * (num3 - bullet_penetration_power), 0.2, 1.0);

                //bullet_stamina_burn_per_damage *= ((!(armor.blunt_throughput > 0.0)) ? 1.0 : (3.0 / Math.sqrt(armor.blunt_throughput)));

                blocked = true;

            }
        //       } else {
        //           damage_to_armor = bullet.PenetrationPower * bullet.ArmorDamage * Mathf.Clamp(bullet.PenetrationPower / armor.resistance, 0.5f, 0.9f) * Singleton<_E164>.Instance.ArmorMaterials[Template.ArmorMaterial].Destructibility;
        //           float num4 = Mathf.Clamp(bullet.PenetrationPower / (num3 + 12f), 0.6f, 1f);
        //           bullet.Damage *= num4;
        //           bullet.PenetrationPower *= num4;
        //       }
            else {
                damage_to_armor = bullet_penetration_power * bullet.armor_damage * clamp(bullet_penetration_power / armor.resistance, 0.5, 0.9) * armor.destructibility;
                let num4 = clamp(bullet_penetration_power / (num3 + 12.0), 0.6, 1.0);
                bullet_damage *= num4;
                bullet_penetration_power *= num4;
            }
        //       damage_to_armor = Mathf.Max(1f, damage_to_armor);
        //       Repairable.Durability -= damage_to_armor;
        //       if (Repairable.Durability < 0f) {
        //           Repairable.Durability = 0f;
        //       }
           damage_to_armor = Math.max(1.0, damage_to_armor);
           armor_durability -= damage_to_armor;
           if (armor_durability < 0.0) {
               armor_durability = 0.0;
           }
        //       Item._E007(_E000_E0DD: false, _E000_E0DE: false);
        //   }
        //}

            armor_durabilities[armor_idx] = armor_durability;
        }

        if (blocked) {
            return bullet_damage;
        }
    }

    return bullet_damage;
}
