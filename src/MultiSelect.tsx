import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';
import { _ } from "translate";
import { Component } from "react";
import { update_search, field_flags_to_array, array_to_field_flags, get_search } from './search';


interface MultiSelectProps {
    name:string;
    defaultSelected?:Array<string>;
    values:Array<string>;
    onChange:(value:string)=>void;
    location?:any;
    history?:any;
}

declare var browserHistory;

export function getMultiSelectValue(name:string, _default:Array<string>=[]) {
    return get_search(name, _default).join(",");
}
export function getMultiSelectState(name:string, _default:Array<string>=[]) {
    return array_to_field_flags(get_search(name, _default))
}

export function MultiSelect(props:MultiSelectProps) {
    const [S, setS] = useState(getMultiSelectState(props.name, props.defaultSelected || []));

    function toggle(val:string):void {
        S[val] = !S[val];
        setS(S);
        update_search(props.name, field_flags_to_array(S));
        props.onChange(field_flags_to_array(S).join(","));
    }

    return (
        <div className='MultiSelect'>
        {props.values.map((val, idx) =>
            <span key={val}
                className={'MultiSelect-value' + (S[val] ? ' active': '')}
                onClick={() => toggle(val)} >
                {_(val as any)}
            </span>
        )}
        </div>
    );
}

export default MultiSelect;
