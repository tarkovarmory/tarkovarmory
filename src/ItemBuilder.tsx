import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';
import { _ } from "translate";
import { Item, ConflictMap, items, caliber_to_type, id2slug, slug2item } from './data';
import { get_search_all1, get_search1, update_search1 } from './search';


interface ItemBuilderProps {
    'name': string;
    'header': string;
    'addClass': string;
    'options': Array<Item>;
    'attributes': Array<Array<string>>;
    'rootselector': (props:{options, value, onChange})=>JSX.Element;
    'onChange': () => void;
}


export function ItemBuilder(props:ItemBuilderProps):JSX.Element {
    return (
        <table className={'rotated-title-table ' + props.addClass}>
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
                {ItemBuildRows(props)}
            </tbody>
        </table>
    );
}

function ItemBuildRows(props:ItemBuilderProps):JSX.Element {
    let [selected_slug, setSelectedSlug] = useState(get_search1(props.name, props.options[0].slug));

    let item = slug2item[selected_slug] || props.options[0];
    let computed = {};
    props.attributes.map((attr, idx) => {
        computed[attr[0]] = item[attr[0]] || 0;
    });
    item.calculate_attributes(props.name, get_search_all1(), computed);

    function setSelected(e) {
        let slug = e.target.value;
        setSelectedSlug(slug);
        update_search1(props.name, slug);
        props.onChange();
    }

    return (
        <tr key={props.name}>
            <td>
                <props.rootselector options={props.options} value={selected_slug} onChange={setSelected}/>
            </td>

            {props.attributes.map(arr => (
                <td key={arr[0]}>{beautify(arr[0], computed[arr[0]])}</td>
            ))}
        </tr>
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
