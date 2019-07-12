const path = require('path');
const glob = require("glob");
const { CheckerPlugin } = require("awesome-typescript-loader");
// const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const entries = {
    ...glob.sync('./src/**/*.ts')
        .reduce(
            (entries, entry) =>
                Object.assign(entries,
                    { [entry.replace('./src/', '').replace('.ts', '')]: entry }),
            {}),
    ...glob.sync('./demo/**/*.ts')
        .reduce(
            (entries, entry) =>
                Object.assign(entries,
                    { [entry.replace('./demo/', '').replace('.ts', '')]: entry }),
            {})
};
console.log("entries:", entries);

module.exports = {
    mode: "development",
    // devtool: false,
    // devtool: "eval",
    // devtool: "source-map",
    // devtool: "inline-source-map",
    // devtool: "eval-source-map",
    devtool: "cheap-source-map",
    // devtool: "inline-cheap-source-map",
    // devtool: "cheap-module-source-map",
    // devtool: "cheap-eval-source-map",
    // devtool: "hidden-source-map",
    // devtool: "nosources-source-map",
    // entry: {
    //     index: "./src/index.ts"
    // },
    entry: entries,
    // optimization: {
    //     minimizer: [
    //         new UglifyJsPlugin({
    //             uglifyOptions: {
    //                 output: {
    //                     comments: false
    //                 },
    //             },
    //             extractComments: true, // /(?:^!|@(?:license|preserve))/i
    //         })
    //     ]
    // },
    output: {
        // filename: '[name].[chunkhash].js',
        filename: '[name].js',
		path: path.resolve(__dirname, 'build')
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            // { test: /\.tsx?$/, loader: "ts-loader" }
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" }
            // { include: [path.resolve(__dirname, 'src')] }
        ]
    },
    plugins: [
        new CheckerPlugin()
    ]
};
