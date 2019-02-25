'use strict';

var webpack = require('webpack');
var webpackConfig = require('./webpack.config.base.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = function() {
    var myProdConfig = webpackConfig;
    myProdConfig.output.filename = '[name].[hash].js';
    myProdConfig.mode = 'production';
    myProdConfig.optimization.minimize = true;

    myProdConfig.plugins.push(
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    );

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

    myProdConfig.plugins.push(
        new HtmlWebpackPlugin({
            title: 'soda',
        })
    );

    return myProdConfig;
};