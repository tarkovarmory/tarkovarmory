import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useEffect } from 'react';
import { _ } from "translate";
import { Item, ConflictMap, items, caliber_to_type, id2slug, slug2item } from './data';
import { get_search_all1, get_search1, update_search1 } from './search';


interface ItemSelectorProps {
    options:Array<Item>;
    value:string;
    onChange:(HTMLEvent:any)=>void;
    required?:boolean;
}

interface ItemBuilderProps {
    'name': string;
    'header': string;
    'addClass': string;
    'options': Array<Item>;
    'attributes': Array<Array<string>>;
    'rootselector': (props:ItemSelectorProps)=>JSX.Element;
    'onChange': () => void;
    'required'?: boolean;
}


export function ItemBuilder(props:ItemBuilderProps):JSX.Element {
    let selected_slug = get_search1(props.name, props.options[0].slug);
    let item = slug2item[selected_slug] || props.options[0];

    let slot_map = get_search_all1();
    let conflicts = item.calculate_conflict_map(props.name, slot_map);


    return (
        <table className={'ItemBuilder rotated-title-table ' + props.addClass}>
            <thead>
                <tr>
                    <th>{props.header}</th>
                    {props.attributes.map(arr => (
                        <th className={'tilted' + (arr[0] === 'ArmorMaterial' ? ' armor-material' : '')} key={arr[0]}>
                            <span><span>{arr[1]}</span></span>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {ItemBuildRows(0, props, conflicts)}
            </tbody>
        </table>
    );
}

function ItemBuildRows(indent:number, props:ItemBuilderProps, conflicts:ConflictMap):JSX.Element {
    if (!props.options || !props.options.length) {
        return null;
    }
    let selected_slug = get_search1(props.name, props.required ? props.options[0].slug : '');

    //let item = slug2item[selected_slug] || props.options[0];
    let item = slug2item[selected_slug] || null;
    let computed = {};
    if (item) {
        props.attributes.map((attr, idx) => {
            computed[attr[0]] = item[attr[0]] || 0;
        });
        item.calculate_attributes(props.name, get_search_all1(), computed);
    }

    function setSelected(e) {
        let slug = e.target.value;
        update_search1(props.name, slug);
        props.onChange();
    }

    let rendered_rows:Array<JSX.Element> = [];

    return (
        <React.Fragment key={props.name}>
            <tr key={props.name}>

                <td>
                    {make_indents(indent)}
                    <props.rootselector options={props.options} value={selected_slug} onChange={setSelected} required={props.required} />
                </td>

                {props.attributes.map(arr => (
                    <td key={arr[0]}>{beautify(arr[0], computed[arr[0]])}</td>
                ))}
            </tr>
            {item && item.slots && Object.keys(item.slots).map(slot_name => {
                let name = props.name + "." + slot_name;
                let options = item.slots[slot_name].filter.map((id, idx) => items[id]);
                let sub_props = Object.assign(
                    {},
                    props,
                    {
                        name,
                        options,
                        rootselector: GenericSelector,
                        required: item.slots[slot_name].required,
                    }
                );
                return ItemBuildRows(indent+1, sub_props , conflicts);
            })}
        </React.Fragment>
    );
}

function GenericSelector(props:ItemSelectorProps):JSX.Element {
    return (
        <select value={props.value} onChange={props.onChange}>
            {!props.required &&
                <option value=''>-- none --</option>
            }
            {props.options.map((item, idx) =>
                <option key={item.slug} value={item.slug}>{item.name}</option>
            )}
        </select>
    );
}

export function beautify(name:string, n:any):string {
    switch (name) {
        case 'weapFireType':
            return n.join(",");

        case 'ammoCaliber':
            return _(caliber_to_type(n, ""));

        default:
            // else is number, fall trhough.
    }

    if (!n || (n > -0.0001 && n < 0.0001)) {
        return null;
    }
    let ret = typeof(n) === "number" ? n.toFixed(roughPrecision(n)) : n;

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

export function make_indents(indents:number) {
    let ret = [];
    for (let i=0; i < indents; ++i) {
        ret.push(<span className='indent' key={i} />);
    }
    return ret;
}
