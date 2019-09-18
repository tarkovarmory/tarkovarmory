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
    //['min_repair_degradation', 'Min Repair Degradation'],
    //['max_repair_degradation', 'Max Repair Degradation'],
    ['ArmorMaterial', 'Armor Material'],
    ['armor_zones_string', 'Armor Zones'],
];

export function ArmorAnalyzer(props:{}):JSX.Element {
    let ammo = ammo_list.filter(ammo=>true);

    const [ignored, _forceUpdate] = useReducer(x => x + 1, 0);

    let helmet = armor_by_slug(get_search1('helmet', helmet_list[0].slug));
    let armor = armor_by_slug(get_search1('armor', armor_list[0].slug));
    let vest = armor_by_slug(get_search1('vest', vest_list[0].slug));

    function forceUpdate() {
        _forceUpdate(0);
    }

    return (
        <div id='Armor'>

            <div id='builders-container'>
            <div id='builders'>
                <div>
                    <ItemBuilder name='helmet' options={helmet_list}
                        header={'Helmet'}
                        addClass={'armor-builder'}
                        attributes={attributes}
                        rootselector={ArmorSelect}
                        onChange={forceUpdate}
                    />
                </div>
                <div>
                    <ItemBuilder name='armor' options={armor_list}
                        header={'Armor'}
                        addClass={'armor-builder'}
                        attributes={attributes}
                        rootselector={ArmorSelect}
                        onChange={forceUpdate}
                    />
                </div>
                <div>
                    <ItemBuilder name='vest' options={vest_list}
                        header={'Vest'}
                        addClass={'armor-builder'}
                        attributes={attributes}
                        rootselector={ArmorSelect}
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
                                <th className='tilted'><span><span>Nape</span></span></th>
                                <th className='tilted'><span><span>Top</span></span></th>
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

                                let thorax_stk = shots_to_kill(ammo, [
                                    vest.armor_zones.thorax ? vest : noarmor,
                                    armor.armor_zones.thorax ? armor : noarmor,
                                ], 80, 0, simulations)
                                let stomach_stk = shots_to_kill(ammo, [
                                    vest.armor_zones.stomach ? vest : noarmor,
                                    armor.armor_zones.stomach ? armor : noarmor,
                                ], 70, 1.5, simulations)
                                let arm_stk = shots_to_kill(ammo, [
                                    vest.armor_zones.arms ? vest : noarmor,
                                    armor.armor_zones.arms ? armor : noarmor,
                                ], 60, 0.7, simulations)
                                let leg_stk = shots_to_kill(ammo, [
                                    vest.armor_zones.legs ? vest : noarmor,
                                    armor.armor_zones.legs ? armor : noarmor,
                                ], 65, 1.0, simulations)
                                let nape_stk = shots_to_kill(ammo, [
                                    helmet.armor_zones.nape ? helmet : noarmor,
                                ], 35, 0, simulations)
                                let top_stk = shots_to_kill(ammo, [
                                    helmet.armor_zones.top ? helmet : noarmor,
                                ], 35, 0, simulations)
                                let ears_stk = shots_to_kill(ammo, [
                                    helmet.armor_zones.ears ? helmet : noarmor,
                                ], 35, 0, simulations)
                                let eyes_stk = shots_to_kill(ammo, [
                                    helmet.armor_zones.eyes ? helmet : noarmor,
                                ], 35, 0, simulations)
                                let jaws_stk = shots_to_kill(ammo, [
                                    helmet.armor_zones.jaws ? helmet : noarmor,
                                ], 35, 0, simulations)


                                return (
                                    <tr key={ammo.slug}>
                                        <td>{thorax_stk.avg.toFixed(1)} </td>
                                        <td>{stomach_stk.avg.toFixed(1)} </td>
                                        <td>{leg_stk.avg.toFixed(1)} </td>
                                        <td>{arm_stk.avg.toFixed(1)} </td>
                                        <td>{nape_stk.avg.toFixed(1)} </td>
                                        <td>{top_stk.avg.toFixed(1)} </td>
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
