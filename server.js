'use strict';

import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';

import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpack from 'webpack';

import config from './webpack.config.js';

const DEV_MODE = process.env.NODE_ENV !== 'production';
const ROOT_DIR = path.resolve( __dirname, '.' ); // .. when we get into it
const resolvePath = ( ...args ) => path.resolve( ROOT_DIR, ...args );
const SRC_DIR = resolvePath( 'src' );
const BUILD_DIR = resolvePath( 'dist' );

const compiler = webpack(config);

const options = DEV_MODE ? {
    port: process.env.BIND_PORT || 3000,
    host: process.env.BIND_HOST || '0.0.0.0',
} : {
    port: process.env.BIND_PORT || 80,
    host: process.env.BIND_HOST || '0.0.0.0',
};

express.static.mime.define({'application/json': ['json']});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

let compilerOpts = compiler.options;

if (compiler.compilers) {
    let d = compiler.compilers.filter( el => { return el.options.name == 'client'; })[0];
    compilerOpts = d.options;
}

if (DEV_MODE) {
    app.use(webpackDevMiddleware(compiler, {
        noInfo: true,
        publicPath: compilerOpts.output.publicPath || '/',
        watchOptions: { poll: true },
        serverSideRender: true,
        index: true,
        hot: true, // should this be here?
    }));

    app.use(webpackHotMiddleware(compiler, {
        log: console.log,
        path: '/__webpack_hmr',
        heartbeat: 2000,
    }));
} else {
    app.use(compilerOpts.output.publicPath || '/', express.static('dist'));
}


import Api from './src/Api';

app.use(Api);

app.listen(options.port, options.host, (err) => {
    if (err) {
        throw err;
    }
    console.log(( DEV_MODE ? '[DEV] ' : '' ) + `Listening on ${options.host}:${options.port}`);
});
