import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { _ } from "translate";
import { Component } from "react";
import { Redirect, Route, Link } from 'react-router-dom';
import { ammo_list, armor_list, weapon_list } from 'data';
import { Nav } from "./Nav";
import Ammunition from "./Ammunition";
import Weapons from "./Weapons";
import ArmorAnalyzer from "./Armor";
import About from "./About";

function _About() { return <div><Nav active='about' /><About /></div>; }
function _Ammunition() { return <div><Nav active='ammo' /><Ammunition /></div>; }
function _Weapons() { return <div><Nav active='weapons' /><Weapons /></div>; }
function _Armor() { return <div><Nav active='armor' /><ArmorAnalyzer /></div>; }

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
