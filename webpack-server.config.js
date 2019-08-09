'use strict';

var path = require('path');
let fs = require('fs');
var webpack = require('webpack');
const pkg = require('./package.json');

const production = process.env.PRODUCTION ? true : false;

let plugins = [];

let defines = {
    PRODUCTION: production,
    CLIENT: true,
    SERVER: false,
};

plugins.push(new webpack.DefinePlugin(defines));
plugins.push(new webpack.BannerPlugin({
    banner: '#!/usr/bin/node\n try { require("source-map-support").install(); } catch (e) {console.error("source map support not installed");}',
    raw: true,
    entryOnly: false,
}));


module.exports = {
    mode: production ? 'production' : 'development',
    entry: {
        'server': './src/server.tsx',
        'precompute': './src/precompute.ts',
    },
    resolve: {
        modules: [
            'src/components',
            'src',
            'node_modules'
        ],
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
        alias: {
			'react': 'inferno-compat',
			'react-dom': 'inferno-compat'
		}
    },
    output: {
        path: __dirname + '/dist',
        filename: production ? '[name].min.js' : '[name].js'
    },
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            }
        ]
    },

    performance: {
        maxAssetSize: 1024 * 1024 * 2.5,
        maxEntrypointSize: 1024 * 1024 * 2.5,
    },

    optimization: {
    },


    plugins: plugins,

    //devtool: production ? 'source-map' : 'eval-source-map',
    /* NOTE: The default needs to be source-map for the i18n translation stuff to work. Specifically, using eval-source-map makes it impossible for our xgettext-js parser to parse the embedded source. */
    devtool: 'source-map',

    target: "node",
    node: {
        fs: "empty",
        module: "empty"
    },


    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
    },
};

if (!production) {
    module.exports.resolve.alias.inferno = __dirname + "/node_modules/inferno/dist/index.dev.esm.js";
    module.exports.resolve.alias["inferno-server"] = __dirname + "/node_modules/inferno-server/dist/index.dev.esm.js";
}
