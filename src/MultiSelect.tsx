import React from 'inferno-compat';
import ReactDOM from 'inferno-compat';
import { _ } from "translate";
import { Component } from "inferno";
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


export class MultiSelect extends Component<MultiSelectProps, any> {
    constructor(props) {
        super(props);
        this.state = MultiSelect.getState(this.props.name, this.props.defaultSelected || []);
    }

    static getValue(name:string, _default:Array<string>=[]) {
        return get_search(name, _default).join(",");
    }
    static getState(name:string, _default:Array<string>=[]) {
        return array_to_field_flags(get_search(name, _default))
    }

    toggle(val:string):void {
        let S = {};
        S[val] = !this.state[val];
        this.setState(S);
        update_search(this.props.name, field_flags_to_array(this.state));
        this.props.onChange(field_flags_to_array(this.state).join(","));
    }

    public render() {
        return (
            <div className='MultiSelect'>
            {this.props.values.map((val, idx) =>
                <span key={val}
                    className={'MultiSelect-value' + (this.state[val] ? ' active': '')}
                    onClick={() => this.toggle(val)} >
                    {_(val as any)}
                </span>
            )}
            </div>
        );
    }
}



export default MultiSelect;
