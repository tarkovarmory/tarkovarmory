import React from 'inferno-compat';
import ReactDOM from 'inferno-compat';

import { _ } from "translate";
import { Component } from "inferno";
import { Redirect, Route, Link } from 'inferno-router';
import { ammo_list, armor_list, weapon_list } from 'data';
import Nav from "./Nav";
import Ammunition from "./Ammunition";
import Weapons from "./Weapons";
import ArmorAnalyzer from "./Armor";
import About from "./About";

const _About       = () => (<div><Nav active='about' /><About /></div>);
const _Ammunition = () => (<div><Nav active='ammo' /><Ammunition /></div>);
const _Weapons    = () => (<div><Nav active='weapons' /><Weapons /></div>);
const _Armor      = () => (<div><Nav active='armor' /><ArmorAnalyzer /></div>);

export class Main extends Component<{}, {}> {
   constructor(props) {
      super(props);
   }
   public render() {
      return (
         <div id='Main'>
              <Route exact path="/" render={() => <Redirect to="/ammo" />}/>
              <Route path="/about" component={_About}/>
              <Route path="/ammo" component={_Ammunition}/>
              <Route path="/weapons" component={_Weapons}/>
              <Route path="/armor" component={_Armor}/>
         </div>
      );
   }
}


export default Main;
