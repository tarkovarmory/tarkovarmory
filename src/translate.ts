import { get_search } from './search';
import { tr } from 'generated';
import { AmmoCaliberInterface } from 'data';

interface TranslationStrings {
    "Ammunition"          : string;
    "Ammo"                : string;
    "Armor"               : string;
    "Weapons"             : string;
    "Items"               : string;
    "Armor Class"         : string;
    "Caliber"             : string;
    "Name"                : string;
    "Min"                 : string;
    "Max"                 : string;
    "Avg"                 : string;
    "Damage"              : string;
    "Penetration"         : string;
    "Armor Damage"        : string;
    "Framentation Chance" : string;
    "Speed (m/s)"         : string;
    "Ricochet Chance"     : string;
    "Well Placed Shots to Kill": string;
    "These values represent the number of well placed shots to the thorax or head.": string;
    "In practice, your values will likely be higher unless you are standing directly infront of an unmoving target :)": string;
    "About"               : string;
}

let ru:TranslationStrings = {
    "Ammunition": "Аммуниция",
    "Ammo": "Аммуниция",
    "Armor": "Броня",
    "Weapons": "Оружие",
    "Items": "Предметы",
    "Armor Class": "Класс Брони",
    "Caliber": "Калибр",
    "Name": "Наименование",

    "Min": "Мин",
    "Max": "Макс",
    "Avg": "Срд",

    "Damage": "Урон",
    "Penetration": "Бронепробитие",
    "Armor Damage": "Повреждение брони",
    "Framentation Chance": "Вероятность фрагментации",
    "Speed (m/s)": "Cкорость (м/сек)",
    "Ricochet Chance": "Вероятность рикошета",

    "Well Placed Shots to Kill": "Количество точных выстрелов для убийства",
    "These values represent the number of well placed shots to the thorax or head.":
        "Эти значения представляют собой количество успешных попаданий в грудную клетку или голову.",
    "In practice, your values will likely be higher unless you are standing directly infront of an unmoving target :)":
        "Учтите, что на практике вам наверняка потребуется больше выстрелов, кроме случаев, когда цель находится прямо перед вами и совершенно неподвижна (;",
    "About": "Относительно",
}

let de:TranslationStrings = {
    "Ammunition": "Munition",
    "Ammo": "Munition",
    "Armor": "Rüstung",
    "Weapons": "Waffe",
    "Items": "Artikel",
    "Armor Class": "Rüstungsklasse",
    "Caliber": "Kaliber",
    "Name": "Name",

    "Min": "Min",
    "Max": "Max",
    "Avg": "Durchschn",

    "Damage": "Schaden",
    "Penetration": "Durchdringung",
    "Armor Damage": "Rüstungsschaden",
    "Framentation Chance": "Fragmentierungschance",
    "Speed (m/s)": "Geschwindigkeit (m/s)",
    "Ricochet Chance": "Ricochet-Chance",

    "Well Placed Shots to Kill": "Gut platzierte Schüsse zum Töten",
    "These values represent the number of well placed shots to the thorax or head.":
        "Diese Werte geben die Anzahl der gut platzierten Schüsse auf den Thorax oder den Kopf an.",
    "In practice, your values will likely be higher unless you are standing directly infront of an unmoving target :)":
        "In der Praxis sind Ihre Werte wahrscheinlich höher, wenn Sie sich nicht direkt vor einem sich bewegenden Ziel befinden :)",
    "About": "Omtrent",
}

let languages = {
    "en": {},
    "ru": ru,
    "de": de,
}

let ammo_translations = {
    "en": {
        "12x70"    : "12x70"    ,
        "20x70"    : "20x70"    ,
        "9x18"     : "9x18"     ,
        "9x19"     : "9x19"     ,
        "762x25"   : "7.62x25"  ,
        "9x21"     : "9x21"     ,
        "366"      : ".366"     ,
        "9x39"     : "9x39"     ,
        "545x39"   : "5.45x39"  ,
        "556x45"   : "5.56x45"  ,
        "762x39"   : "7.62x39"  ,
        "762x51"   : "7.62x51"  ,
        "762x54"   : "7.62x54"  ,
        "46x30"    : "4.6x30"   ,
        "40mm"     : "40mm"     ,
        "shrapnel" : "shrapnel" ,
        "127x108"  : "12.7x108"  ,
        "127x55"   : "12.7x55"  ,
        "26x75"    : "2.6x75"  ,
        "30x29"    : "3.0x29"  ,
        "57x28"    : "5.7x28"  ,
    },
    "ru": {
        "12x70"    : "12x70"    ,
        "20x70"    : "20x70"    ,
        "9x18"     : "9x18"     ,
        "9x19"     : "9x19"     ,
        "762x25"   : "7,62x25"  ,
        "9x21"     : "9x21"     ,
        "366"      : ",366"     ,
        "9x39"     : "9x39"     ,
        "545x39"   : "5,45x39"  ,
        "556x45"   : "5,56x45"  ,
        "762x39"   : "7,62x39"  ,
        "762x51"   : "7,62x51"  ,
        "762x54"   : "7,62x54"  ,
        "46x30"    : "4,6x30"   ,
        "40mm"     : "40mm"     ,
        "shrapnel" : "shrapnel" ,
        "127x108"  : "12,7x108"  ,
        "127x55"   : "12,7x55"  ,
        "26x75"    : "2,6x75"  ,
        "30x29"    : "3,0x29"  ,
        "57x28"    : "5,7x28"  ,
    },
    "de": {
        "12x70"    : "12x70"    ,
        "20x70"    : "20x70"    ,
        "9x18"     : "9x18"     ,
        "9x19"     : "9x19"     ,
        "762x25"   : "7,62x25"  ,
        "9x21"     : "9x21"     ,
        "366"      : ",366"     ,
        "9x39"     : "9x39"     ,
        "545x39"   : "5,45x39"  ,
        "556x45"   : "5,56x45"  ,
        "762x39"   : "7,62x39"  ,
        "762x51"   : "7,62x51"  ,
        "762x54"   : "7,62x54"  ,
        "46x30"    : "4,6x30"   ,
        "40mm"     : "40mm"     ,
        "shrapnel" : "shrapnel" ,
        "127x108"  : "12,7x108"  ,
        "127x55"   : "12,7x55"  ,
        "26x75"    : "2,6x75"  ,
        "30x29"    : "3,0x29"  ,
        "57x28"    : "5,7x28"  ,
    },
}


let auto_language = null;

/* This is used by the server to parse out language accept strings */
export function set_auto_language_from_accept(str:string):"en"|"ru"|"de" {
    let indicies = {
        'en': str.indexOf("en"),
        'ru': str.indexOf("ru"),
        'de': str.indexOf("de"),
    };
    let vals = Object.values(indicies).filter(x => x >= 0);
    vals.sort()

    if (vals.length === 0) {
        auto_language = 'en';
        return 'en';
    }

    for (let lang in indicies) {
        if (indicies[lang] === vals[0]) {
            auto_language = lang;
            return lang as "en"|"ru"|"de";
        }
    }

    auto_language = 'en';
    return 'en';
}

export function get_auto_language():"en"|"ru"|"de" {
    if (auto_language) {
        return auto_language;
    }

    try {
        for (let lang of navigator.languages) {
            if (lang.indexOf("ru") >= 0) {
                return "ru";
            }
            if (lang.indexOf("de") >= 0) {
                return "de";
            }
        }
    } catch (e) {
    }

    return "en";
}

export function get_interface_language():"en"|"ru"|"de" {
    if (get_search('lang').length) {
        switch (get_search('lang')[0]) {
            case 'ru': return 'ru';
            case 'de': return 'de';
            case 'en': return 'en';
        }
    }

    return get_auto_language();
}

export function _(str:keyof TranslationStrings | keyof AmmoCaliberInterface) {
    let lang = get_interface_language();
    if (str in languages[lang])  {
        return languages[lang][str];
    }
    if (str in ammo_translations[lang])  {
        return ammo_translations[lang][str];
    }
    if (lang !== "en") {
        console.log("Missing translation: ", str);
    }
    return str;
}

export function item_name(id:number):string {
    let lang = get_interface_language();
    try {
        return tr[lang][id].name;
    } catch (e) {
        console.error(e);
        return `[ERROR - item ${id}]`;
    }
}

export function item_long_name(id:number):string {
    let lang = get_interface_language();
    try {
        return tr[lang][id].lname || tr[lang][id].name;
    } catch (e) {
        console.error(`[ERROR - item ${id}]`, e);
        return `[ERROR - item ${id}]`;
    }
}
