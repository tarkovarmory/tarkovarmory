import React from 'inferno-compat';
import ReactDOM from 'inferno-compat';

import { Component } from "inferno";
import { Router } from 'inferno-router';
import { hydrate } from "inferno-hydrate";
import { createBrowserHistory } from 'history';

import { set_shots_to_kill_cache } from './simulations';
import { shots_to_kill_cache } from './precomputed';
import { sort_data } from './data';
set_shots_to_kill_cache(shots_to_kill_cache);

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
