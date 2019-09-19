import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Component } from "react";
import { Router } from 'react-router-dom';
import { hydrate } from "react-dom";
import { createBrowserHistory } from 'history';

import { set_shots_to_kill_cache } from './simulations';
//import { shots_to_kill_cache } from './precomputed';
import { sort_data } from './data';
//set_shots_to_kill_cache(shots_to_kill_cache);

import Main from "./Main";

export const browserHistory = createBrowserHistory();
browserHistory.listen(location => {
    //console.log(location);
})

window['browserHistory'] = browserHistory;

sort_data();

const wrapper = (
    <Router history={browserHistory}>
      <Main />
    </Router>
);
hydrate(wrapper, document.getElementById("root"));
