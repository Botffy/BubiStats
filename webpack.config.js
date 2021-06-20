const path = require("path");
const html = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  watch: true,
  output: {
    filename: 'main.js',
    path: path.join(__dirname, "dist")
  },
  entry: {
    index: path.join(__dirname, "src", "index.ts"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  plugins: [
    new html({
      template: "src/index.html",
      filename: "index.html",
      chunks: ["index"]
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  }
};
