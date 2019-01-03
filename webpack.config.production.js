'use strict';

var webpack = require('webpack');
var webpackFailPlugin = require('webpack-fail-plugin');
var webpackConfig = require('./webpack.config.base.js');

module.exports = function() {
    var myProdConfig = webpackConfig;
    myProdConfig.output.filename = '[name].[hash].js';
    myProdConfig.mode = 'production';
    myProdConfig.optimization.minimize = true;

    myProdConfig.plugins = [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        webpackFailPlugin
    ];

    myProdConfig.optimization = {
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

    return myProdConfig;
};