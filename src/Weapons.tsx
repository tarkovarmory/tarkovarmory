import React from 'inferno-compat'; import ReactDOM from 'inferno-compat';
import { _ } from "translate"; import { Component } from "inferno";
import { well_known_ids } from './generated';
import { Item, items, caliber_to_type, id2slug, slug2item } from './data';
import { get_search1, update_search1 } from './search';
import { dup } from './util';

const weapons = items.filter(item => item.isDescendentOf(well_known_ids['weapon']) && item.children.length === 0)
const weapon_types = items.filter(item => item.isDescendentOf(well_known_ids['weapon']) && item.children.length > 0)

const attributes = [
    ['Weight', 'Weight'],
    ['Accuracy', 'Accuracy Mod'],
    ['CenterOfImpact', 'Accuracy'],
    ['Ergonomics', 'Ergonomics'],
    ['Velocity', 'Velocity'],
    ['Recoil', 'Recoil'],
    ['SightingRange', 'Sighting Range'],
];

const all_attributes = [
    ['Weight', 'Weight', 'How much the gun weighs',],
    ['Accuracy', 'Accuracy Mod.'],
    ['CenterOfImpact', 'Accuracy'],
    ['Ergonomics', 'Ergonomics'],
    ['bEffDist', 'Effective Distance'],
    ['RecoilForceUp', 'Vertical Recoil'],
    ['RecoilForceBack', 'Horizontal Recoil'],
    ['Recoil', 'Recoil'],
    ['Velocity', 'Velocity Mod.'],
    ['Convergence', 'Convergence'],
    ['RecoilAngle', 'Recoil Angle'],
    ['SightingRange', 'Sighting Range'],
    ['bFirerate', 'Fire Rate'],
    ['bHearDist', 'Hearing Distance'],
    ['ammoCaliber', 'Caliber'],
];


function roughPrecision(a:number):number {
    let ct = 0;
    a -= Math.floor(a);
    while (a > 0.01) {
        a -= Math.floor(a);
        a *= 10;
        ct += 1;
    }
    return Math.min(3, ct);
}

function beautify(name:string, n:any) {
    switch (name) {
        case 'weapFireType':
            return n.join(",");

        case 'ammoCaliber':
            return _(caliber_to_type(n, ""));
    }

    //
    // else, is number
    //

    if (!n || (n > -0.0001 && n < 0.0001)) {
        return null;
    }
    let ret = n.toFixed(roughPrecision(n));


    switch (name) {
        case 'Velocity':
        case 'Recoil':
        case 'Accuracy':
            ret += ' %';
            break;

        case 'SightingRange':
        case 'bEffDist':
        case 'bHearDist':
            ret += ' m';
            break;

        case 'Weight':
            ret += ' Kg';
            break;

        case 'Convergence':
            ret += ' s';
            break;

        case 'bFirerate':
            ret += ' rpm';
            break;
    }

    return ret;
}

export class Weapons extends Component<{}, any> {
    constructor(props) {
        super(props);

        this.state = {
            'selected': get_search1("weapon", weapons[0].slug)
        }
    }

    select = (ev) => {
        let slug = ev.target.value;
        this.setState({
            'selected': slug
        });
        update_search1("weapon", slug)
    }

    public render() {
        let item = slug2item[this.state.selected] || weapons[0];
        let computed = {};
        all_attributes.map((attr, idx) => {
            computed[attr[0]] = item[attr[0]] || 0;
        });
        calculate_attributes("W", item, computed);

        computed['RecoilForceUp']   += computed['RecoilForceUp'] * computed['Recoil'] * 0.01
        computed['RecoilForceBack'] += computed['RecoilForceBack'] * computed['Recoil'] * 0.01
        computed['CenterOfImpact']  -= computed['CenterOfImpact'] * computed['Accuracy'] * 0.01
        computed['RecoilForceUp']   = Math.round(computed['RecoilForceUp'])
        computed['RecoilForceBack'] = Math.round(computed['RecoilForceBack'])

        let conflicts = {};
        calculate_conflicts("W", item, conflicts);

        return (
        <div id='Weapons'>
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


            <div className='main-slots horizontal-scroll'>
                <table className='rotated-title-table'>
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>Item</th>
                            {attributes.map((v, idx) => (
                                <th key={idx} className='tilted'><span><span>{v[1]}</span></span></th>
                            )) }
                        </tr>
                    </thead>
                    <tbody>
                        {render_slots(0, "W", item, [], conflicts)}
                    </tbody>
                </table>
            </div>
        </div>
        );
    }
}



function tr_slot(slot_name:string):string {
    switch (slot_name) {
        case 'mod_scope': return 'Scope';
        case 'mod_magazine': return 'Magazine';
        case 'mod_stock': return 'Stock';
        case 'mod_muzzle': return 'Muzzle';
        case 'mod_sight_front': return 'Front sight';
        case 'mod_sight_rear': return 'Rear sight';
        case 'mod_mount': return 'Mount';
        case 'mod_barrel': return 'Barrel';
        case 'mod_flashlight': return 'Flashlight';
        case 'mod_pistol_grip': return 'Pistol grip';
        case 'mod_gas_block': return 'Gas Block';
        case 'mod_hand_guard': return 'Hand Guard';
        case 'mod_handguard': return 'Hand Guard';
        case 'mod_charge': return 'Charge';
        case 'mod_reciever': return 'Reciever';
        case 'mod_foregrip': return 'Foregrip';
        case 'mod_launcher': return 'Launcher';
        case 'launcher_0_grenade': return 'Grenade';
        case 'mod_bipod': return 'Bipod';
    }

    if (slot_name.indexOf('tactical') >= 0) {
        return 'Tactical';
    }
    if (slot_name.indexOf('mount') >= 0) {
        return 'Mount';
    }
    if (slot_name.indexOf('stock') >= 0) {
        return 'Stock';
    }
    if (slot_name.indexOf('pistol_grip') >= 0) {
        return 'Pistol Grip';
    }

    console.error("Unmapped slot name: ", slot_name);

    return slot_name;
}


function make_indents(indents:number) {
    let ret = [];
    for (let i=0; i < indents; ++i) {
        ret.push(<span className='indent' key={i} />);
    }
    return ret;
}

function render_slots(indent:number, prefix:string, item:Item, out:Array<any>, conflicts:any) {
    if (!item.slots || Object.keys(item.slots).length === 0) {
        return out;
    }

    for (let slot_name in item.slots) {
        let key = prefix + "." + slot_name;
        let val = get_search1(key, (item.slots[slot_name].required ? id2slug[item.slots[slot_name].filter[0]] : ""));
        let sel = val.length > 0 ? slug2item[val] : null;

        out.push(
            <tr key={key}>
                <td>
                    {make_indents(indent)}
                    <span className='slot-type'>{tr_slot(slot_name)}</span>
                </td>
                <td>
                    <select
                        value={val}
                        className={sel && sel.id in conflicts ? 'in-conflict' : ''}
                        onChange={(ev) => update_search1(key, ev.target.value)}>
                        {(!item.slots[slot_name].required || null) &&
                            <option value={""}>-- none --</option>}
                        {item.slots[slot_name].filter.map((id, idx) => (
                            <option value={id2slug[id]} disabled={id in conflicts}>{items[id].long_name}</option>
                        ))}
                    </select>
                </td>
                {sel && attributes.map((v, idx) => (
                    <td className='numeric'>
                        {beautify(v[0], sel[v[0]])}
                    </td>
                ))}
            </tr>
        );

        if (sel) {
            render_slots(indent+1, key, sel, out, conflicts);
        }
    }

    return out;
}

function calculate_attributes(prefix:string, item:Item, out:any) {
    if (!item.slots || Object.keys(item.slots).length === 0) {
        return;
    }


    for (let slot_name in item.slots) {
        let key = prefix + "." + slot_name;
        let val = get_search1(key, (item.slots[slot_name].required ? id2slug[item.slots[slot_name].filter[0]] : ""));
        let sel = val.length > 0 ? slug2item[val] : null;

        if (sel) {
            for (let k in out) {
                if (k in sel) {
                    switch(k) {
                        case 'CenterOfImpact':
                            out[k] = sel[k];
                            break;

                        case 'SightingRange':
                            out[k] = Math.max(sel[k], out[k]);
                            break;

                        default:
                            out[k] += sel[k];
                            break;
                    }

                }
            }

            calculate_attributes(key, sel, out);
        }
    }

    return out;
}

function calculate_conflicts(prefix:string, item:Item, out:any) {
    if (item.conflicting_items) {
        for (let id of item.conflicting_items) {
            out[id] = id;
        }
    }

    if (!item.slots || Object.keys(item.slots).length === 0) {
        return;
    }

    for (let slot_name in item.slots) {
        let key = prefix + "." + slot_name;
        let val = get_search1(key, (item.slots[slot_name].required ? id2slug[item.slots[slot_name].filter[0]] : ""));
        let sel = val.length > 0 ? slug2item[val] : null;

        if (sel) {
            calculate_conflicts(key, sel, out);
        }
    }

    return out;
}

export default Weapons;
