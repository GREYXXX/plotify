const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const babelLoaderConfig = {
    loader: 'babel-loader',
    query: {
        compact: false,
        presets: [["env", {
            targets: {
                browsers: ["last 2 versions"]
            }
        }]],
        babelrc: false
    }
};

const outputDir = path.resolve(__dirname, 'dist');
const resolvePaths = [
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'node_modules'),
];


const appConfig = {
    name: "plotify",
    entry: "./src/app.tsx",
    output: {
        path: outputDir,
        filename: "app.js",
        publicPath: "/",
        devtoolModuleFilenameTemplate: "webpack:///plotify/[resource-path]?[loaders]"
    },
    plugins: [
        new ExtractTextPlugin({
            filename: 'app.css',
            allChunks: true
        })
    ],
    devtool: 'source-map',
    resolve: {
        modules: resolvePaths,
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    'ts-loader'
                ]
            },
            {
                test: /\.js$/,
                use: [
                    babelLoaderConfig
                ],
                include: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            publicPath: '/dist'
                        }
                    }
                ]
            },
        ]
    }
};


module.exports = [
    appConfig
];
