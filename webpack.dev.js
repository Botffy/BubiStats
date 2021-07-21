const { merge } = require('webpack-merge');
const path = require("path");

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    filename: 'main.js',
    path: path.join(__dirname, "dev")
  },
  devServer: {
    contentBase: path.join(__dirname, 'dev'),
    compress: true,
    port: 9000,
  }
})
