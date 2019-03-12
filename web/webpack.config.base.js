'use strict';

const path = require('path');
const TSLintPlugin = require('tslint-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: ['core-js', path.join(__dirname, '/app/main.ts')],
    output: {
        filename: 'main.js',
        path: __dirname + '/../dist'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
        new TSLintPlugin({
            files: ['./web/**/*.ts']
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
