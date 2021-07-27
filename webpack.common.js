const webpack = require('webpack')
const path = require("path");
const html = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const favicons = require('favicons-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const { GitRevisionPlugin } = require('git-revision-webpack-plugin')

const gitRevisionPlugin = new GitRevisionPlugin()

module.exports = {
  output: {
    filename: '[name].[hash:8].js',
    sourceMapFilename: '[name].[hash:8].map',
    chunkFilename: '[name].[hash:8].js',
    path: path.join(__dirname, "dist")
  },
  entry: {
    index: path.join(__dirname, "src", "index.ts"),
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /node_modules/,
          chunks: 'initial',
          filename: 'vendors.[contenthash].js',
          priority: 1,
          maxInitialRequests: 2,
          minChunks: 1
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.(gif|svg|jpg|png)$/i,
        type: 'asset/resource'
      },
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
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
    gitRevisionPlugin,
    new favicons({
      logo: 'src/assets/logos/favico.png',
      appName: 'bubistats',
      appDescription: 'BubiStats'
    }),
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
