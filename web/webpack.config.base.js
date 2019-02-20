'use strict';

const path = require('path');
const TSLintPlugin = require('tslint-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: ["babel-polyfill", path.join(__dirname, '/app/main.ts')],
    output: {
        filename: 'main.js',
        path: __dirname + '/../dist'
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    plugins: [
        new TSLintPlugin({
            files: ['./src/**/*.ts']
        }),
        new CopyWebpackPlugin([
            { from: __dirname + '/assets', to: __dirname + '/../dist' },
        ])
    ],
    node: {
        fs: 'empty'
    },
    optimization: {},
};
