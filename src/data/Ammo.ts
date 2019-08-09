import { well_known_ids } from 'generated';
import { items } from './Items';
import { item_name, item_long_name } from '../translate';

export interface AmmoCaliberInterface {
    "12x70"    : string ;
    "20x70"    : string ;
    "9x18"     : string ;
    "9x19"     : string ;
    "762x25"   : string ;
    "9x21"     : string ;
    "366"      : string ;
    "9x39"     : string ;
    "545x39"   : string ;
    "556x45"   : string ;
    "762x39"   : string ;
    "762x51"   : string ;
    "762x54"   : string ;
    "46x30"    : string ;
    "40mm"     : string ;
    "shrapnel" : string ;
}
export type AmmoCaliber = keyof AmmoCaliberInterface;
export const AmmoCaliberValues = ["12x70", "20x70",  "9x18", "9x19", "762x25", "9x21", "366", "9x39", "545x39", "556x45", "762x39", "762x51", "762x54", "46x30"/*, "40mm"*/].sort();

export let ammo_list:Array<Ammo> = [];

export class Ammo {
    /*
    Official source, though somewhat out of date.

    https://docs.google.com/spreadsheets/d/1l_8zSZg-viVTZ2bavMEIIKhix6mFTXuVHWcNKZgBrjQ/edit#gid=89253918

    This has the definition of "Usefulness" and meta value with frag chance
    */

    public raw:any;
    public id:number;
    public slug:string;
    public caliber:AmmoCaliber;
    public bullets:number;
    public damage:number;
    public penetration_power:number;
    public penetration_power_deviation:number;
    public misfire_chance:number;
    public speed:number;
    public ricochet_chance:number;
    public fragmentation_chance:number;
    public ballistic_coeficient:number;
    public speed_retardation:number;
    public armor_damage:number;
    public stamina_burn_per_damage:number;

    constructor(
        obj:{
            raw:any,
            id:number,
            slug:string,
            caliber:AmmoCaliber,
            bullets:number,
            damage:number,
            penetration_power:number,
            penetration_power_deviation:number,
            misfire_chance:number,
            speed:number,
            ricochet_chance:number,
            fragmentation_chance:number,
            ballistic_coeficient:number,
            speed_retardation:number,
            armor_damage:number,
            stamina_burn_per_damage:number
        }
    ) {
        this.raw = obj.raw;
        this.id = obj.id;
        this.slug = obj.slug;
        this.caliber = obj.caliber;
        this.bullets = obj.bullets;
        this.damage = obj.damage;
        this.penetration_power = obj.penetration_power;
        this.penetration_power_deviation = obj.penetration_power_deviation;
        this.misfire_chance = obj.misfire_chance;
        this.speed = obj.speed;
        this.ricochet_chance = obj.ricochet_chance;
        this.fragmentation_chance = obj.fragmentation_chance;
        this.ballistic_coeficient = obj.ballistic_coeficient;
        this.speed_retardation = obj.speed_retardation;
        this.armor_damage = obj.armor_damage;
        this.stamina_burn_per_damage = obj.stamina_burn_per_damage;
    }

    dup():Ammo {
        return new Ammo(this);
    }

    get name():string {
        return item_name(this.id);
    }

    get long_name():string {
        return item_long_name(this.id);
    }

    usefulness():number {
        return (
            (this.damage + this.penetration_power * 2)
            * ((this.speed / 1100)+1)
            * 8
        );
    }

    usefulness_with_frag():number {
        return this.usefulness() * (this.fragmentation_chance / 2 + 1);
    }
};



for (let id in items) {
    let item = items[id] as any;
    if (item.parent_id === well_known_ids['ammo']) {

        if (caliber_to_type(item.Caliber, item.slug) == "40mm") {
            /* These aren't in use yet */
            continue;
        }

        if (caliber_to_type(item.Caliber, item.slug) == "shrapnel") {
            /* Grenade shrapnel is listed in here, but I don't think it's particularly useful to include it in the normal ammo */
            continue;
        }

        //console.log(item);
        ammo_list.push(
            new Ammo({
                raw: item,
                id: parseInt(id),
                slug: item.slug,
                caliber: caliber_to_type(item.Caliber, item.slug),
                bullets: item.ProjectileCount,
                damage: item.Damage,
                penetration_power: item.PenetrationPower,
                penetration_power_deviation: item.PenetrationPowerDiviation, /* yes diviation is spelled incorrectly */
                misfire_chance: item.MisfireChance,
                speed: item.InitialSpeed,
                ricochet_chance: item.RicochetChance,
                fragmentation_chance: item.FragmentationChance,
                ballistic_coeficient: item.BallisticCoeficient,
                speed_retardation: item.SpeedRetardation,
                armor_damage: item.ArmorDamage / 100.0,
                stamina_burn_per_damage: item.StaminaBurnPerDamage,
            })
        );
    }

}


export function caliber_to_type(caliber, slug):AmmoCaliber {
    switch (caliber) {
        case "Caliber12g":
            return "12x70";
        case "Caliber20g":
            return "20x70";
        case "Caliber366TKM":
            return "366";
        case "Caliber40mmRU":
            return "40mm";
        case "Caliber545x39":
            return "545x39";
        case "Caliber556x45NATO":
            return "556x45";
        case "Caliber762x25TT":
            return "762x25";
        case "Caliber762x39":
            return "762x39";
        case "Caliber762x51":
            return "762x51";
        case "Caliber762x54R":
            return "762x54";
        case "Caliber9x18PM":
            if (slug.indexOf("shrapnel") >= 0) {
                /* This are mis-categorized */
                return "shrapnel";
            }
            if (slug.indexOf("46x30") >= 0) {
                /* This are mis-categorized */
                return "46x30";
            }
            return "9x18";
        case "Caliber46x30":
            return "46x30";
        case "Caliber9x19PARA":
            return "9x19";
        case "Caliber9x21":
            return "9x21";
        case "Caliber9x39":
            return "9x39";
    }
    throw new Error("Error converting caliber: " + caliber);
}

export function ammo_sort_caliber_name(a:Ammo, b:Ammo):number {
    if (a.caliber < b.caliber) {
        return -1;
    }
    if (a.caliber > b.caliber) {
        return 1;
    }

    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }

    return 0;
}
