const webpack = require('webpack')
const path = require("path");
const html = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const { GitRevisionPlugin } = require('git-revision-webpack-plugin')

const gitRevisionPlugin = new GitRevisionPlugin()

module.exports = {
  output: {
    filename: '[fullhash].js',
    chunkFilename: '[chunkhash].js',
    path: path.join(__dirname, "dist")
  },
  entry: {
    index: path.join(__dirname, "src", "index.ts"),
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: { appendTsSuffixTo: [/\.vue$/] }
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  plugins: [
    gitRevisionPlugin,
    new webpack.DefinePlugin({
      BUBISTAT_COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
      BUBISTAT_LASTCOMMITDATETIME: JSON.stringify(gitRevisionPlugin.lastcommitdatetime()),
      BUBISTAT_VERSION: JSON.stringify(gitRevisionPlugin.version())
    }),
    new VueLoaderPlugin(),
    new html({
      template: "src/index.html",
      filename: "index.html",
      chunks: ["index"]
    })
  ]
};
