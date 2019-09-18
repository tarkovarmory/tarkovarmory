import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { _ } from "translate";
import { Component } from "react";
import { AmmoCaliber, AmmoCaliberValues, ammo_list, armor_list, armor_by_slug, armor_sort_ac_name } from 'data';
import { MultiSelect, getMultiSelectValue, getMultiSelectState } from './MultiSelect';
import { chance, dup } from './util';
import { shots_to_kill } from 'simulations';
import { get_search, update_search } from './search';
//import Select from 'react-select';


function Sort() {
    return (<span>&#x25B2; &#x25BC;</span>);
}

export function std_option_renderer(item:{name:string, slug:string}) {
    return <span>{item.slug}</span>;
}

function ArmorSelect(props:{value:string, onChange:(ev)=>any}) {
    return (
        <select value={props.value} onChange={props.onChange}>
            {[0,2,3,4,5,6].map((ac, idx) =>
                <optgroup key={ac} label={_("Armor Class") + " - " + ac}>
                    {armor_list.filter(x => x.armorClass === ac).map((armor, idx) =>
                        <option key={armor.slug} value={armor.slug}>{armor.name}</option>)}
                </optgroup>
            )}
        </select>
    );
}

function sorter(extract:(o)=>any, elif?:(a,b)=>number) {
    return function(a,b) {
        if (extract(a) < extract(b)) {
            return -1;
        }
        if (extract(a) > extract(b)) {
            return 1;
        }

        if (elif) {
            return elif(a,b);
        }

        return 0;
    }
}

export class Ammunition extends Component<{}, any> {
    constructor(props) {
        super(props);

        this.state = {
            "calibers_selected": getMultiSelectValue("calibers"),
            "armor_selected": get_search("armor_selected", ["notHeavy", "item_equipment_armor_iotv_1", "item_equipment_armor_zhuk6a"]),
            "selected": "",
            "sort": get_search("sort", ["caliber"])[0],
        }
    }

    select(ammo_slug):void {
        this.setState({selected: ammo_slug});
    }

    setArmor1 = (e) => {
        let r = dup(this.state.armor_selected);
        r[0] = e.target.value;
        this.setState({"armor_selected": r});
        update_search("armor_selected", r);
    }
    setArmor2 = (e) => {
        let r = dup(this.state.armor_selected);
        r[1] = e.target.value;
        this.setState({"armor_selected": r});
        update_search("armor_selected", r);
    }
    setArmor3 = (e) => {
        let r = dup(this.state.armor_selected);
        r[2] = e.target.value;
        this.setState({"armor_selected": r});
        update_search("armor_selected", r);
    }

    setSort = (sort) => {
        if (this.state.sort === sort) {
            sort = "-" + sort;
        }
        update_search("sort", [sort]);
        this.setState({'sort': sort});
    }

    public render() {
        let lst = ammo_list.filter(ammo=>this.state.calibers_selected.indexOf(ammo.caliber) >= 0 || this.state.calibers_selected === "");
        let odd = false;
        let last_caliber = null;

        let armor1 = armor_by_slug(this.state.armor_selected[0]) || armor_list[0];
        let armor2 = armor_by_slug(this.state.armor_selected[1]) || armor_list[1];
        let armor3 = armor_by_slug(this.state.armor_selected[2]) || armor_list[2];
        armor_list.sort(armor_sort_ac_name);

        let sort = this.state.sort;
        let reverse = sort[0] === '-';
        sort = sort.replace('-', '');

        switch (sort) {
            case 'name'                 : lst.sort(sorter(x=>x.name)); break;
            case 'caliber'              : lst.sort(sorter((x=>x.caliber), sorter(x=>x.name))); break;
            case 'damage'               : lst.sort(sorter(x=>x.bullets * -x.damage)); break;
            case 'penetration'          : lst.sort(sorter(x=>-x.penetration_power)); break;
            case 'armor_damage'         : lst.sort(sorter(x=>-x.armor_damage)); break;
            case 'fragmentation_chance' : lst.sort(sorter(x=>-x.fragmentation_chance)); break;
            case 'speed'                : lst.sort(sorter(x=>-x.speed)); break;
            case 'ricochet_chance'      : lst.sort(sorter(x=>-x.ricochet_chance)); break;
            case 'armor1_min'           : lst.sort(sorter(x=>shots_to_kill(x, [armor1]).min)); break;
            case 'armor1_avg'           : lst.sort(sorter(x=>shots_to_kill(x, [armor1]).avg)); break;
            case 'armor1_max'           : lst.sort(sorter(x=>shots_to_kill(x, [armor1]).max)); break;
            case 'armor2_min'           : lst.sort(sorter(x=>shots_to_kill(x, [armor2]).min)); break;
            case 'armor2_avg'           : lst.sort(sorter(x=>shots_to_kill(x, [armor2]).avg)); break;
            case 'armor2_max'           : lst.sort(sorter(x=>shots_to_kill(x, [armor2]).max)); break;
            case 'armor3_min'           : lst.sort(sorter(x=>shots_to_kill(x, [armor3]).min)); break;
            case 'armor3_avg'           : lst.sort(sorter(x=>shots_to_kill(x, [armor3]).avg)); break;
            case 'armor3_max'           : lst.sort(sorter(x=>shots_to_kill(x, [armor3]).max)); break;
            default:
                console.error("Invalid sort: ", sort)
        }

        if (reverse) {
            lst.reverse();
        }

        return (
            <div id='Ammunition'>
                <MultiSelect
                    name="calibers"
                    values={AmmoCaliberValues}
                    onChange={values => this.setState({"calibers_selected": values})}
                />

                <div className='adjoined-tables'>
                <div className='horizontal-scroll'>
                    <table className='name-table'>
                        <thead><tr><th className='clickable' onClick={() => this.setSort('name')} ><span><span>{_("Name")}</span></span></th></tr></thead>
                        <tbody>
                            {(last_caliber=null, odd=false, lst.map((ammo, idx) => {
                                if (sort === 'caliber') {
                                    if (last_caliber !== ammo.caliber) {
                                        last_caliber = ammo.caliber;
                                        odd = !odd;
                                    }
                                } else {
                                    odd = !odd;
                                }

                                return (
                                    <tr key={ammo.slug} onClick={() => this.select(ammo.slug)} className={(this.state.selected === ammo.slug ? 'selected' : '') + (odd ? 'odd' : 'even')}>
                                        <td><span title={ammo.long_name}>{ammo.name}</span></td>
                                    </tr>
                                );
                            }))}
                        </tbody>
                    </table>
                </div>

                <div className='horizontal-scroll'>
                    <table className='value-table rotated-title-table'>
                        <thead>
                            <tr>
                                <th colSpan={9} className='spacer'></th>
                                <th colSpan={11} className='stk'>{_("Well Placed Shots to Kill")}
                                    <div className='question-icon ' id='shots-to-kill-help'>
                                        <div>
                                            <p>
                {_("These values represent the number of well placed shots to the thorax or head.")}
                                            </p>
                                            <p>
                {_("In practice, your values will likely be higher unless you are standing directly infront of an unmoving target :)")}
                                            </p>
                                        </div>
                                    </div>
                                </th>
                            </tr>

                            <tr>
                                <th rowSpan={2} className='clickable' onClick={() => this.setSort('caliber')} ><span><span>{_("Caliber")}</span></span></th>
                                <th rowSpan={2} onClick={() => this.setSort('damage')} className='clickable tilted'><span><span>{_("Damage")}</span></span></th>
                                <th rowSpan={2} onClick={() => this.setSort('penetration')} className='clickable tilted'><span><span>{_("Penetration")}</span></span></th>
                                <th rowSpan={2} onClick={() => this.setSort('armor_damage')} className='clickable tilted'><span><span>{_("Armor Damage")}</span></span></th>
                                <th rowSpan={2} onClick={() => this.setSort('fragmentation_chance')} className='clickable tilted'><span><span>{_("Framentation Chance")}</span></span></th>
                                <th rowSpan={2} onClick={() => this.setSort('speed')} className='clickable tilted'><span><span>{_("Speed (m/s)")}</span></span></th>
                                <th rowSpan={2} onClick={() => this.setSort('ricochet_chance')} className='clickable tilted'><span><span>{_("Ricochet Chance")}</span></span></th>
                                <th rowSpan={2} className='spacer'></th>

                                <th colSpan={3}>
                                    <ArmorSelect value={armor1.slug} onChange={this.setArmor1} />
                                </th>

                                <th rowSpan={2} className='smallspacer'></th>

                                <th colSpan={3}>
                                    <ArmorSelect value={armor2.slug} onChange={this.setArmor2} />
                                 </th>
                                <th rowSpan={2} className='smallspacer'></th>

                                <th colSpan={3}>
                                    <ArmorSelect value={armor3.slug} onChange={this.setArmor3} />
                                </th>
                            </tr>
                            <tr>
                                <th className='clickable' onClick={() => this.setSort('armor1_min')}>{_("Min")}</th>
                                <th className='clickable' onClick={() => this.setSort('armor1_avg')}>{_("Avg")}</th>
                                <th className='clickable' onClick={() => this.setSort('armor1_max')}>{_("Max")}</th>

                                <th className='clickable' onClick={() => this.setSort('armor2_min')}>{_("Min")}</th>
                                <th className='clickable' onClick={() => this.setSort('armor2_avg')}>{_("Avg")}</th>
                                <th className='clickable' onClick={() => this.setSort('armor2_max')}>{_("Max")}</th>

                                <th className='clickable' onClick={() => this.setSort('armor3_min')}>{_("Min")}</th>
                                <th className='clickable' onClick={() => this.setSort('armor3_avg')}>{_("Avg")}</th>
                                <th className='clickable' onClick={() => this.setSort('armor3_max')}>{_("Max")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(last_caliber=null, odd=false, lst.map((ammo, idx) => {
                                if (sort === 'caliber') {
                                    if (last_caliber !== ammo.caliber) {
                                        last_caliber = ammo.caliber;
                                        odd = !odd;
                                    }
                                } else {
                                    odd = !odd;
                                }


                                let stk1 = shots_to_kill(ammo, [armor1]);
                                let stk2 = shots_to_kill(ammo, [armor2]);
                                let stk3 = shots_to_kill(ammo, [armor3]);

                                return (
                                <tr key={ammo.slug} className={odd ? 'odd' : 'even'}>
                                    <td className='right'>{_(ammo.caliber)}</td>
                                    <td className='right'>{ammo.bullets > 1 ? `${ammo.bullets}x${ammo.damage}` : ammo.damage}</td>
                                    <td className='right'>{ammo.penetration_power}</td>
                                    <td className='right'>{chance(ammo.armor_damage)}</td>
                                    <td className='right'>{chance(ammo.fragmentation_chance)}</td>
                                    <td className='right'>{ammo.speed}</td>
                                    <td className='right'>{chance(ammo.ricochet_chance)}</td>
                                    <td className='spacer'></td>

                                    <td className='right'>{stk1.min}</td>
                                    <td className='right'>{stk1.avg.toFixed(1)}</td>
                                    <td className='right'>{stk1.max}</td>

                                    <td className='smallspacer'></td>

                                    <td className='right'>{stk2.min}</td>
                                    <td className='right'>{stk2.avg.toFixed(1)}</td>
                                    <td className='right'>{stk2.max}</td>

                                    <td className='smallspacer'></td>

                                    <td className='right'>{stk3.min}</td>
                                    <td className='right'>{stk3.avg.toFixed(1)}</td>
                                    <td className='right'>{stk3.max}</td>
                                </tr>
                                );
                            }))}
                        </tbody>
                    </table>
                </div>
                </div>
            </div>
        );
    }
}

export default Ammunition;
