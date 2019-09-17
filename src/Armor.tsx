import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { _ } from "translate";
import { Component } from "react";
import { well_known_ids } from './generated';
import { chance, dup } from './util';
import { AmmoCaliber, AmmoCaliberValues, ammo_list, } from 'data';
import { Item, ConflictMap, items, caliber_to_type, id2slug, slug2item } from './data';
import { Armor, armor_list, helmet_list, vest_list, armor_by_slug, armor_sort_ac_name  } from './data';
import { get_search_all1, get_search1, update_search1 } from './search';
import { get_search, update_search } from './search';
import { shots_to_kill } from './simulations';


function ArmorSelect(props:{list:Array<Armor>, value:string, onChange:(ev)=>any}) {
    return (
        <select value={props.value} onChange={props.onChange}>
            {[0,2,3,4,5,6].map((ac, idx) =>
                props.list.filter(x => x.armor_class === ac).length === 0 ? null :
                <optgroup key={ac} label={_("Armor Class") + " - " + ac}>
                    {props.list.filter(x => x.armor_class === ac).map((armor, idx) =>
                        <option key={armor.slug} value={armor.slug}>{armor.name}</option>)}
                </optgroup>
            )}
        </select>
    );
}


export class ArmorAnalyzer extends Component<{}, any> {
    constructor(props) {
        super(props);

        this.state = {
            'selected_helmet': get_search1("helmet", helmet_list[0].slug),
            'selected_vest': get_search1("helmet", vest_list[0].slug),
            'selected_armor': get_search1("armor", armor_list[0].slug),
        };
    }

    selectHelmet = (e) => {
        let r = e.target.value;
        this.setState({"selected_helmet": r});
        update_search("helmet", [r]);
    }
    selectVest = (e) => {
        let r = e.target.value;
        this.setState({"selected_vest": r});
        update_search("vest", [r]);
    }
    selectArmor = (e) => {
        let r = e.target.value;
        this.setState({"selected_armor": r});
        update_search("armor", [r]);
    }

    public render() {
        let ammo = ammo_list.filter(ammo=>true);

        return (
            <div id='Armor'>

                <div id='builders-container'>
                <div id='builders'>
                    <div>
                        <h4>Helmet</h4>
                        <ArmorSelect list={helmet_list} value={this.state.selected_helmet} onChange={this.selectHelmet} />
                        <ItemBuilder />
                    </div>
                    <div>
                        <h4>Armor</h4>
                        <ArmorSelect list={armor_list} value={this.state.selected_armor} onChange={this.selectArmor} />
                        <ItemBuilder />
                    </div>
                    <div>
                        <h4>Vest</h4>
                        <ArmorSelect list={vest_list} value={this.state.selected_vest} onChange={this.selectVest} />
                        <ItemBuilder />
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

                                    let helmet = armor_by_slug(this.state.selected_helmet);
                                    let vest = armor_by_slug(this.state.selected_vest);
                                    let armor = armor_by_slug(this.state.selected_armor);
                                    let noarmor = armor_by_slug('noarmor');
                                    if (!vest) {
                                        vest = noarmor;
                                    }
                                    if (!helmet) {
                                        helmet = noarmor;
                                    }
                                    //let novest = armor_by_slug('novest');
                                    //let nohelm = armor_by_slug('novest');

                                    let thorax_stk = shots_to_kill(ammo, [
                                        vest.armor_zones.thorax ? vest : noarmor,
                                        armor.armor_zones.thorax ? armor : noarmor,
                                    ], 80, 0, simulations)
                                    let stomach_stk = shots_to_kill(ammo, [
                                        vest.armor_zones.thorax ? vest : noarmor,
                                        armor.armor_zones.thorax ? armor : noarmor,
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
}


export class ItemBuilder extends Component<{}, {}> {
    public render() {
        return <div>Item builder</div>
        /*
        return (
            <div className='ItemBuilder'>
                <select className='weapon-select' value={this.state.selected} onChange={this.select}>
                    {weapon_types.map((wt, idx) => (
                        <optgroup key={idx} label={wt.long_name}>
                            {weapons.filter(item => item.parent.id === wt.id).map((item, idx) => (
                                <option value={item.slug}>{item.name}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>

                <div className='attributes'>
                    {all_attributes.map((attr, idx) => (
                        <div className='calculated-attribute'>
                            <div className='name'>
                                {attr[1]}
                            </div>
                            <div className='value'>
                                {beautify(attr[0], computed[attr[0]])}
                            </div>
                        </div>
                    ))}
                    <div className='firing-modes'>
                        Firing modes: {item['weapFireType'].join(", ")}
                    </div>
                </div>
            </div>
        );
        */
    }
}


export default ArmorAnalyzer;
