import { Ammo, Armor, armor_list, ammo_list } from 'data';
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

export function shots_to_kill(bullet:Ammo, armor:Armor, simulations:number = 250):ShotsToKill {
    //let cache_key = `${bullet.id}.${armor.id}.${simulations}`;
    let cache_key = `${bullet.id}.${armor.id}`;
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
        let ct = _shots_to_kill(bullet, armor);
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

function _shots_to_kill(_bullet:Ammo, _armor:Armor):number {
    let armor = _armor.dup();
    let health = 80; /* thorax */
    let shot_count = 0;
    for (let i = 0; i < 200; ++i) {
        shot_count += 1;

        for (let i = 0; i < _bullet.bullets; ++i) {
            let bullet = _bullet.dup();
            simulate_hit(armor, bullet);
            health -= bullet.damage;
        }
        if (health <= 0) {
            return shot_count;
        }
    }
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
export function simulate_block(armor:Armor, bullet:Ammo):boolean {
//    if (Repairable.Durability > 0.0) {
    if (armor.durability > 0.0) {
//        float num = Repairable.Durability / Repairable.MaxDurability * 100f;
        let num = (armor.durability / armor.max_durability) * 100.0;

//        float num3 = (121f - 5000f / (45f + num * 2f)) * armor.resistance * 0.01f;
        let num3 = (121.0 - 5000.0 / (45.0 + num * 2.0)) * armor.resistance * 0.01;
//        float num4 = (num3 >= bullet.penetration_power + 15f) ? 0f : ((!(num3 >= bullet.penetration_power)) ? (100f + bullet.penetration_power / (0.9f * num3 - bullet.penetration_power)) : (0.4f * (num3 - bullet.penetration_power - 15f) * (num3 - bullet.penetration_power - 15f)));
        let num4 = (num3 >= bullet.penetration_power + 15.0) ? 0.0 : ((!(num3 >= bullet.penetration_power)) ? (100.0 + bullet.penetration_power / (0.9 * num3 - bullet.penetration_power)) : (0.4 * (num3 - bullet.penetration_power - 15.0) * (num3 - bullet.penetration_power - 15.0)));
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
export function simulate_hit(armor:Armor, bullet:Ammo):void {
    //   damage_to_armor = 0f;
    let damage_to_armor = 0;
    //   if (Repairable.Durability > 0f) {
    if (armor.durability > 0.0) {
    //       if (bullet.DeflectedBy == Item.Id) {
    //           bullet.Damage /= 2f;
    //           bullet.ArmorDamage /= 2f;
    //           bullet.PenetrationPower /= 2f;
    //       }
        /* Deflection not accounted for */

    //       float num = Repairable.Durability / Repairable.MaxDurability * 100f;
        let num = (armor.durability / armor.max_durability) * 100.0;
    //       float num3 = (121f - 5000f / (45f + num * 2f)) * armor.resistance * 0.01f;
        let num3 = (121.0 - 5000.0 / (45.0 + num * 2.0)) * armor.resistance * 0.01;

    //       if (bullet.BlockedBy == Item.Id || bullet.DeflectedBy == Item.Id) {
    //           damage_to_armor = bullet.PenetrationPower * bullet.ArmorDamage * Mathf.Clamp(bullet.PenetrationPower / armor.resistance, 0.6f, 1.1f) * Singleton<_E164>.Instance.ArmorMaterials[Template.ArmorMaterial].Destructibility;
    //           bullet.Damage *= Template.BluntThroughput * Mathf.Clamp(1f - 0.03f * (num3 - bullet.PenetrationPower), 0.2f, 1f);
     //           bullet.StaminaBurnRate *= ((!(Template.BluntThroughput > 0f)) ? 1f : (3f / Mathf.Sqrt(Template.BluntThroughput)));
        if (simulate_block(armor, bullet)) {
            damage_to_armor = bullet.penetration_power * bullet.armor_damage * clamp(bullet.penetration_power / armor.resistance, 0.6, 1.1) * armor.destructibility;
            bullet.damage *= armor.blunt_throughput * clamp(1.0 - 0.03 * (num3 - bullet.penetration_power), 0.2, 1.0);
            bullet.stamina_burn_per_damage *= ((!(armor.blunt_throughput > 0.0)) ? 1.0 : (3.0 / Math.sqrt(armor.blunt_throughput)));

        }
    //       } else {
    //           damage_to_armor = bullet.PenetrationPower * bullet.ArmorDamage * Mathf.Clamp(bullet.PenetrationPower / armor.resistance, 0.5f, 0.9f) * Singleton<_E164>.Instance.ArmorMaterials[Template.ArmorMaterial].Destructibility;
    //           float num4 = Mathf.Clamp(bullet.PenetrationPower / (num3 + 12f), 0.6f, 1f);
    //           bullet.Damage *= num4;
    //           bullet.PenetrationPower *= num4;
    //       }
        else {
            damage_to_armor = bullet.penetration_power * bullet.armor_damage * clamp(bullet.penetration_power / armor.resistance, 0.5, 0.9) * armor.destructibility;
            let num4 = clamp(bullet.penetration_power / (num3 + 12.0), 0.6, 1.0);
            bullet.damage *= num4;
            bullet.penetration_power *= num4;
        }
    //       damage_to_armor = Mathf.Max(1f, damage_to_armor);
    //       Repairable.Durability -= damage_to_armor;
    //       if (Repairable.Durability < 0f) {
    //           Repairable.Durability = 0f;
    //       }
           damage_to_armor = Math.max(1.0, damage_to_armor);
           armor.durability -= damage_to_armor;
           if (armor.durability < 0.0) {
               armor.durability = 0.0;
           }
    //       Item._E007(_E000_E0DD: false, _E000_E0DE: false);
    //   }
    //}
    }
}
