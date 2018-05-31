/* eslint-env node */

var path = require('path');
// var webpack = require('webpack');

module.exports = {
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, 'public/build'),
        filename: 'main.bundle.js',
        publicPath: '/build/'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['env']
                }
            }
        }],
    },
    stats: {
        colors: true
    },
    mode: "development",
    devtool: 'source-map',
    devServer: {
        contentBase: './public',
        host: "0.0.0.0"
    }
};