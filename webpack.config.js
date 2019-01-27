const path = require( 'path' );
const webpack = require( 'webpack' );
const nodeExternals = require( 'webpack-node-externals' );
const CleanWebpackPlugin = require( 'clean-webpack-plugin' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );

const DEV_MODE = process.env.NODE_ENV !== 'production';

const ROOT_DIR = path.resolve( __dirname, '.' ); // .. when we get into it
const resolvePath = ( ...args ) => path.resolve( ROOT_DIR, ...args );
const SRC_DIR = resolvePath( 'src' );
const BUILD_DIR = resolvePath( 'dist' );



const entryConfig_client = [
    '@babel/polyfill',
    DEV_MODE ? 'webpack-hot-middleware/client?name=client&reload=true&path=/__webpack_hmr' : null,
    path.resolve( path.join( __dirname, 'client.js' ) ),
].filter( Boolean );

const moduleConfig_client = {
	rules: [ {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
    }, {
		test: /\.(mjs|jsx?)$/,
		exclude: /node_modules/,
		use: {
			loader: 'babel-loader',
			options: {
                cacheDirectory: true,
			}
		}
    }, {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: {
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
            }
        }
	} ]
};

const pluginsConfig_client = [
    new webpack.DefinePlugin( {
		__DEV__: DEV_MODE,
		'process.env.BROWSER': true,
		'process.env.NODE_ENV': DEV_MODE ? '"development"' : '"production"'
	} ),
    new HtmlWebpackPlugin({
        title: 'PDF Analysis'
    }),
    DEV_MODE ? new webpack.HotModuleReplacementPlugin() : null,
    DEV_MODE ? null : new CleanWebpackPlugin( [ BUILD_DIR ] ),
].filter( Boolean );

const clientConfig = {
    name: 'client',
    target: 'web',
    mode: DEV_MODE ? "development" : "production",
    entry: entryConfig_client,
    module: moduleConfig_client,
    plugins: pluginsConfig_client,
    output: {
        path: BUILD_DIR,
        filename: '[name].bundle.js',
        publicPath: "/"
    },
	resolve: {
		modules: [
            SRC_DIR,
            resolvePath( 'node_modules' )
        ]
	},
};


// /*
const entryConfig_server = [
    '@babel/polyfill',
    DEV_MODE ? 'webpack-hot-middleware/client?name=server&reload=true' : null,
    path.resolve( path.join( __dirname, 'server.js' ) ),
].filter( Boolean );

const moduleConfig_server = {
	rules: [ {
		test: /\.(mjs|jsx?)$/,
		exclude: /node_modules/,
		use: {
			loader: 'babel-loader',
			options: {
                cacheDirectory: true,
			}
		}
	} ]
};

const pluginsConfig_server = [
    new webpack.DefinePlugin( {
		__DEV__: DEV_MODE,
		'process.env.BROWSER': false,
		'process.env.NODE_ENV': DEV_MODE ? '"development"' : '"production"'
	} ),
    DEV_MODE ? new webpack.HotModuleReplacementPlugin() : null,
    DEV_MODE ? null : new CleanWebpackPlugin( [ path.resolve(SRC_DIR, '*.bundle.js') ] ),
].filter( Boolean );

const serverConfig = {
    name: 'server',
    target: 'node',
    mode: DEV_MODE ? "development" : "production",
    entry: entryConfig_server,
    module: moduleConfig_server,
    plugins: pluginsConfig_server,
    output: {
        path: SRC_DIR,
        filename: 'server.bundle.js',
    },
    watch: DEV_MODE,
	resolve: {
		modules: [
            SRC_DIR,
            resolvePath( 'node_modules' )
        ]
	},
    externals: [ nodeExternals( { // i think we want to explictly exclude assets?
        whitelist: [] // i think we /want/ to include static files under node_modules?
    } ) ],
    node: {
		console: false,
		global: false,
		process: false,
		Buffer: false,
		__filename: false,
		__dirname: false,
	},
};
// */


module.exports = [clientConfig, serverConfig];
