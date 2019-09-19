import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as express from "express";
import { renderToString } from "react-dom/server";
import { StaticRouter } from 'react-router';
import path = require("path");
import Main from "./Main";
import { server_set_search } from './search';
import { set_auto_language_from_accept, get_interface_language } from './translate';

import { set_shots_to_kill_cache } from './simulations';
//import { shots_to_kill_cache } from './precomputed';
//set_shots_to_kill_cache(shots_to_kill_cache);

import { sort_data } from './data';



let md5  = require('md5');
let fs   = require('fs');
let util = require('util');

const server = express();
const port = process.argv.length > 2 ? parseInt(process.argv[2]) : 3388;
const hash = md5(fs.readFileSync(process.argv[1]));
const production = port < 1024;

var stats = fs.statSync(process.argv[1]);
var mtime = new Date(util.inspect(stats.mtime));
console.log(mtime);
var mdate = mtime.toISOString().replace(/T.*/, "");
let css = null;

server.use(express.json());
server.use(express.urlencoded({ extended: false }));
if (production) {
    server.use("/static", express.static(path.resolve("./static/"), {immutable:true, maxAge: '1y'}));
    css = fs.readFileSync(path.resolve("./static") + "/tarkovarmory.css");
    css = "<style>" + css + "</style>";
} else {
    server.use("/static", express.static(path.resolve("./assets")));
    server.use("/static", express.static(path.resolve("./dist")));
}

server.get("*", (req, res) => {
    let server_search:{[name:string]: Array<string>} = {};
    for (let k in req.query) {
        server_search[k] = req.query[k].split(",");
    }
    server_set_search(server_search);
    try {
        set_auto_language_from_accept(req.headers['accept-language']);
    } catch (e) {
        /* */
    }
    let lang = get_interface_language();

    sort_data();

    const wrapper = (
        <StaticRouter location={req.url} context={{}}>
            <Main />
        </StaticRouter>
    );

    let google_analytics = `
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-137859465-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'UA-137859465-1');
</script>
    `;


    res.writeHead(200, {'Content-Type': 'text/html'});

    res.write(`<!doctype html><html lang="${lang}"><head>
<meta charset="utf-8"/>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="format-detection" content="telephone=no">
<meta name="application-name" content="Tarkov Armory"/>
<meta http-equiv="last-modified" content="${mdate}">
<meta name="theme-color" content="#5A503C">
<link rel="icon" type="image/x-icon" href="/static/favicon.ico" />
<title>Tarkov Armory</title>
${production ? google_analytics : ""}
<script defer src='./static/client.js?${hash}'></script>
<link rel="stylesheet" type="text/css" href="/static/tarkovarmory.css?${hash}">
${!production ? '<script async src="//' + req.hostname + ':35708/livereload.js"></script>' : ''}
</head>`)

    res.write(`<body><div id='root'>${renderToString(wrapper)}</div></body></html>`);

    res.end();
});
let Server = server.listen(port, () => {
   console.log(`Tarkov Armory server started: http://localhost:${port}/   hash: ${hash}`);
});

// Used to restart server by fuseBox
/*
export async function shutdown() {
   Server.close();
   Server = undefined;
}
*/
