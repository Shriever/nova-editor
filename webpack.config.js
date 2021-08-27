const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require('webpack')

module.exports = {
    mode: "development",
    entry: {
        app: "./src/index.ts",
        "editor.worker": "monaco-editor/esm/vs/editor/editor.worker.js",
        "json.worker": "monaco-editor/esm/vs/language/json/json.worker",
        "css.worker": "monaco-editor/esm/vs/language/css/css.worker",
        "html.worker": "monaco-editor/esm/vs/language/html/html.worker",
        "ts.worker": "monaco-editor/esm/vs/language/typescript/ts.worker",
        "socket-connection.js": "./src/js/socket-connection.js"
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        globalObject: "self",
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.ttf$/,
                use: ["file-loader"],
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                      presets: ['@babel/preset-env'], //compatibility for older browsers
                      plugins: ["@babel/plugin-transform-object-assign"], // ensure compatibility with IE 11. 
                    }
                  }
            }
        ],
    },
    plugins: [
        new HtmlWebPackPlugin({
            hash: true,
            template: "./src/index.html",
            filename: "./index.html",
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            'process.env.DEBUG': JSON.stringify(false),
            'process.env.SERVER_PORT': JSON.stringify(5000),
            'process.env.SERVER_DOMAIN': JSON.stringify('http://localhost')
        })
    ],
    devtool: "inline-source-map",
    devServer: {
        proxy: {
            '/': 'http://localhost:5000', /**!!!FOR LOCAL DEV ONLY!!! The production version must run from a whitelisted domain using CORS and without a proxy!!!*/
          },
    }
};
