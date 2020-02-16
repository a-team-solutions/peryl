const path = require('path');
const webpack = require('webpack');
const { CheckerPlugin } = require("awesome-typescript-loader");
const pkg = require('./package.json');

/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

const conf = {
    mode: 'production',

    // devtool: false,
    // devtool: "eval",
    devtool: "source-map",
    // devtool: "inline-source-map",
    // devtool: "eval-source-map",
    // devtool: "cheap-source-map",
    // devtool: "inline-cheap-source-map",
    // devtool: "cheap-module-source-map",
    // devtool: "cheap-eval-source-map",
    // devtool: "hidden-source-map",
    // devtool: "nosources-source-map",

    entry: {
        index: './' + pkg.typescript.main
    },
    // entry: entries,

    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    priority: -10,
                    test: /[\\/]node_modules[\\/]/
                }
            },
            chunks: 'async',
            minChunks: 1,
            minSize: 30000,
            name: true
        }
    },

    output: {
        library: pkg.library,
        // libraryTarget: 'global',
        libraryTarget: 'umd',
        // libraryTarget: 'var',
        // libraryTarget: 'window',
        // filename: '[name].[chunkhash].js',
        // filename: '[name].js',
        filename: pkg.name + '.js',
        path: path.resolve(__dirname, 'dist/umd')
    },

    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.tsx', '.ts', '.js']
    },

    externals: {
    },

    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            // { test: /.(ts|tsx)?$/, loader: 'ts-loader' },
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            { include: [path.resolve(__dirname, 'src')] },
            { exclude: [path.resolve(__dirname, "node_modules")] }
        ]
    },

    plugins: [
        new webpack.ProgressPlugin(),
        new CheckerPlugin()
    ]

};

module.exports = [conf];
