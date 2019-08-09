import React from 'inferno-compat';
import ReactDOM from 'inferno-compat';
import { Component } from "inferno";
import { Route, Link } from 'inferno-router';
import { _, get_interface_language, get_auto_language } from "translate";
import { eft_version } from "./generated";
import { update_search } from "./search";


function set_language(e) {
    if (e.target.value === get_auto_language()) {
        update_search("lang", []);
    }
    else {
        update_search("lang", [e.target.value]);
    }
    //window.location.reload();
}

function lang_suffix() {
    if (get_interface_language() !== get_auto_language()) {
        return '?lang=' + get_interface_language();
    }
    return '';
}

export class Nav extends Component<{active:"ammo"|"weapons"|"armor"|"items"|"about"}, {}> {
   constructor(props) {
      super(props);
   }
   public render() {
      return (
        <div id='Main-Nav-Container'>
            <div className='version-language'>
                <div className='left'>
                    <div>{eft_version}</div>
                    <Link to='/about' className='about-link'>About</Link>
                </div>
                <span className='right'>
                    <span className='translate-icon' />
                    <select value={get_interface_language()} onChange={set_language}>
                        <option value="en">English</option>
                        <option value="ru">Русский</option>
                        <option value="de">Deutsch</option>
                    </select>
                </span>
            </div>

            <nav id='Main-Nav'>
                <Link className={this.props.active === "ammo" ? "active" : ""} to={"/ammo" + lang_suffix()}>{_("Ammo")}</Link>
                <Link className={this.props.active === "weapons" ? "active" : ""} to={"/weapons" + lang_suffix()}>{_("Weapons")}</Link>
                {/* <Link className={this.props.active === "items" ? "active" : ""} to={"/items" + lang_suffix()}>{_("Items")}</Link> */ }
                <Link className={this.props.active === "armor" ? "active" : ""} to={"/armor" + lang_suffix()}>{_("Armor")}</Link>
            </nav>
        </div>
      );
   }
}

export default Nav;
