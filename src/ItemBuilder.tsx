import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';
import { _ } from "translate";
import { Item } from './data';


interface ItemBuilderProps {
    'name': string;
    'default': Item;
    'options': Array<Item>;
}


export function ItemBuilder(props:ItemBuilderProps) {


    return (
        <div>
            Item buildz
        </div>
    );
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
