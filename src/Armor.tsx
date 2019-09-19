import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useState, useEffect, useReducer } from 'react';
import { _ } from "translate";
import { well_known_ids } from './generated';
import { chance } from './util';
import { AmmoCaliber, AmmoCaliberValues, ammo_list, } from 'data';
import { ItemBuilder } from './ItemBuilder';
import { Item, ConflictMap, items, caliber_to_type, id2slug, slug2item } from './data';
import { armor_list, helmet_list, vest_list, armor_by_slug, armor_sort_ac_name  } from './data';
import { get_search_all1, get_search1, update_search1 } from './search';
import { get_search, update_search } from './search';
import { shots_to_kill } from './simulations';



const attributes = [
    ['armorClass', 'Armor Class'],
    ['BluntThroughput', 'Blunt Throughput'],
    ['Durability', 'Durability'],
    ['MaxDurability', 'Max Durability'],
    ['resistance', 'Resistance'],
    ['destructibility', 'Destructibility'],
    ['bHearDist', 'Hearing Distance'],
    //['min_repair_degradation', 'Min Repair Degradation'],
    //['max_repair_degradation', 'Max Repair Degradation'],
    ['ArmorMaterial', 'Armor Material'],
    ['armor_zones_string', 'Armor Zones'],
];

export function ArmorAnalyzer(props:{}):JSX.Element {
    let ammo = ammo_list.filter(ammo=>true);

    const [ignored, _forceUpdate] = useReducer(x => x + 1, 0);

    function forceUpdate() {
        _forceUpdate(0);
    }

    let helmet = armor_by_slug(get_search1('helmet', 'nohelmet'));
    let armor = armor_by_slug(get_search1('armor', 'noarmor'));
    let vest = armor_by_slug(get_search1('vest', 'novest'));

    let nohelmet = armor_by_slug('nohelmet');
    let noarmor = armor_by_slug('noarmor');
    let novest = armor_by_slug('novest');

    let slot_map = get_search_all1();


    helmet.updateCustomDurability('helmet', slot_map);
    armor.updateCustomDurability('armor', slot_map);
    vest.updateCustomDurability('vest', slot_map);

    /* Get all armor and attached items. The reverse() is to make sure
     * sub-items are hit first before the main entity (ie, visor is hit before
     * helmet, if there is any duplicate coverage area. This is probably not
     * perfect, sub-item ordering might be different in game, but it should
     * be a fine result I think. */

    let thorax_armor = [noarmor]
        .concat(vest.attached_items('vest', slot_map).filter(x => x.armor_zones.thorax).reverse())
        .concat(armor.attached_items('armor', slot_map).filter(x => x.armor_zones.thorax).reverse());
    let stomach_armor = [noarmor]
        .concat(vest.attached_items('vest', slot_map).filter(x => x.armor_zones.stomach).reverse())
        .concat(armor.attached_items('armor', slot_map).filter(x => x.armor_zones.stomach).reverse());
    let arms_armor = [noarmor]
        .concat(vest.attached_items('vest', slot_map).filter(x => x.armor_zones.arms).reverse())
        .concat(armor.attached_items('armor', slot_map).filter(x => x.armor_zones.arms).reverse());
    let legs_armor = [noarmor]
        .concat(vest.attached_items('vest', slot_map).filter(x => x.armor_zones.legs).reverse())
        .concat(armor.attached_items('armor', slot_map).filter(x => x.armor_zones.legs).reverse());

    let top_armor = [nohelmet]
        .concat(helmet.attached_items('helmet', slot_map).filter(x => x.armor_zones.top).reverse())
    let nape_armor = [nohelmet]
        .concat(helmet.attached_items('helmet', slot_map).filter(x => x.armor_zones.nape).reverse())
    let ears_armor = [nohelmet]
        .concat(helmet.attached_items('helmet', slot_map).filter(x => x.armor_zones.ears).reverse())
    let eyes_armor = [nohelmet]
        .concat(helmet.attached_items('helmet', slot_map).filter(x => x.armor_zones.eyes).reverse())
    let jaws_armor = [nohelmet]
        .concat(helmet.attached_items('helmet', slot_map).filter(x => x.armor_zones.jaws).reverse())

    /*
    console.log('-------------------------------------');
    console.log('thorax', thorax_armor);
    console.log('stomach', stomach_armor);
    console.log('arms', arms_armor);
    console.log('legs', legs_armor);

    console.log('top', thorax_armor);
    console.log('nape', nape_armor);
    console.log('ears', ears_armor);
    console.log('eyes', eyes_armor);
    console.log('jaws', jaws_armor);
    console.log('-------------------------------------');
    */


    return (
        <div id='Armor'>

            <div id='builders-container'>
            <div id='builders'>
                <div>
                    <ItemBuilder name='helmet' options={helmet_list}
                        header={'Helmet'}
                        addClass={'armor-builder'}
                        attributes={attributes}
                        rootSelector={ArmorSelect}
                        modifiableDurability={true}
                        onChange={forceUpdate}
                    />
                </div>
                <div>
                    <ItemBuilder name='armor' options={armor_list}
                        header={'Armor'}
                        addClass={'armor-builder'}
                        attributes={attributes}
                        rootSelector={ArmorSelect}
                        modifiableDurability={true}
                        onChange={forceUpdate}
                    />
                </div>
                <div>
                    <ItemBuilder name='vest' options={vest_list}
                        header={'Vest'}
                        addClass={'armor-builder'}
                        attributes={attributes}
                        rootSelector={ArmorSelect}
                        modifiableDurability={true}
                        onChange={forceUpdate}
                    />
                </div>
            </div>
            </div>

            <div className='adjoined-tables'>
                {/* ammo names */}
                <div className='horizontal-scroll'>
                    <table className='ammo-names'>
                        <thead>
                            <tr>
                                <th>Ammo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* render_slots(0, "W", item, conflicts, []) */}
                            {ammo.map((ammo, idx) => (
                                <tr key={ammo.slug}>
                                    <td><span title={ammo.long_name}>{ammo.name}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className='horizontal-scroll'>
                    <table className='stk-values rotated-title-table'>
                        <thead>
                            <tr>
                                <th className='tilted'><span><span>Thorax</span></span></th>
                                <th className='tilted'><span><span>Stomach</span></span></th>
                                <th className='tilted'><span><span>Leg</span></span></th>
                                <th className='tilted'><span><span>Arm</span></span></th>
                                <th className='tilted'><span><span>Top</span></span></th>
                                <th className='tilted'><span><span>Nape</span></span></th>
                                <th className='tilted'><span><span>Ears</span></span></th>
                                <th className='tilted'><span><span>Eyes</span></span></th>
                                <th className='tilted'><span><span>Jaws</span></span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* render_slots(0, "W", item, conflicts, []) */}
                            {ammo.map((ammo, idx) => {
                                const simulations = 250;

                                let noarmor = armor_by_slug('noarmor');
                                //let novest = armor_by_slug('novest');
                                //let nohelm = armor_by_slug('novest');

                                let thorax_stk  = shots_to_kill(ammo, thorax_armor, thorax_armor.map(a => a.custom_durability || 0), 80, 0, simulations)
                                let stomach_stk = shots_to_kill(ammo, stomach_armor, stomach_armor.map(a => a.custom_durability || 0), 70, 1.5, simulations)
                                let arms_stk     = shots_to_kill(ammo, arms_armor, arms_armor.map(a => a.custom_durability || 0), 60, 0.7, simulations)
                                let legs_stk     = shots_to_kill(ammo, legs_armor, legs_armor.map(a => a.custom_durability || 0), 65, 1.0, simulations)
                                let top_stk     = shots_to_kill(ammo, top_armor, top_armor.map(a => a.custom_durability || 0), 35, 0, simulations)
                                let nape_stk    = shots_to_kill(ammo, nape_armor, nape_armor.map(a => a.custom_durability || 0), 35, 0, simulations)
                                let ears_stk    = shots_to_kill(ammo, ears_armor, ears_armor.map(a => a.custom_durability || 0), 35, 0, simulations)
                                let eyes_stk    = shots_to_kill(ammo, eyes_armor, eyes_armor.map(a => a.custom_durability || 0), 35, 0, simulations)
                                let jaws_stk    = shots_to_kill(ammo, jaws_armor, jaws_armor.map(a => a.custom_durability || 0), 35, 0, simulations)

                                return (
                                    <tr key={ammo.slug}>
                                        <td>{thorax_stk.avg.toFixed(1)} </td>
                                        <td>{stomach_stk.avg.toFixed(1)} </td>
                                        <td>{legs_stk.avg.toFixed(1)} </td>
                                        <td>{arms_stk.avg.toFixed(1)} </td>
                                        <td>{top_stk.avg.toFixed(1)} </td>
                                        <td>{nape_stk.avg.toFixed(1)} </td>
                                        <td>{ears_stk.avg.toFixed(1)} </td>
                                        <td>{eyes_stk.avg.toFixed(1)} </td>
                                        <td>{jaws_stk.avg.toFixed(1)} </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>


            </div>
        </div>
    );
}

function ArmorSelect(props:{options:Array<Item>, value:string, onChange:(ev)=>any}):JSX.Element {
    return (
        <select value={props.value} onChange={props.onChange}>
            {[0,2,3,4,5,6].map((ac, idx) =>
                props.options.filter(x => x.armorClass === ac).length === 0 ? null :
                <optgroup key={ac} label={_("Armor Class") + " - " + ac}>
                    {props.options.filter(x => x.armorClass === ac).map((armor, idx) =>
                        <option key={armor.slug} value={armor.slug}>{armor.name}</option>)}
                </optgroup>
            )}
        </select>
    );
}


export default ArmorAnalyzer;
