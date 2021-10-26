/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context: __dirname,
  entry: "./src/main.ts",
  devtool: "inline-source-map",
  devServer: {
    open: false,
    static: "./dist",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          // type checking done with fork-ts-checker-webpack-plugin
          transpileOnly: true,
        },
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
};
