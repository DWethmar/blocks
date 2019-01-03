'use strict';

var webpack = require('webpack');
var webpackFailPlugin = require('webpack-fail-plugin');
var webpackConfig = require('./webpack.config.base.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function() {
    var myDevConfig = webpackConfig;
    myDevConfig.mode = 'development';
    myDevConfig.devtool = 'inline-source-map';

    myDevConfig.plugins = [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('develop')
            }
        }),
        webpackFailPlugin
    ];

    myDevConfig.optimization = {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                        name: 'vendor',
                        chunks: 'all'
                }
            }
        }
    };

    myDevConfig.plugins.push(
        new HtmlWebpackPlugin({
            title: 'soda',
        })
    );

    return myDevConfig;
};