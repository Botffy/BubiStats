const path = require("path");
const html = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')


module.exports = {
  mode: 'development',
  devtool: 'source-map',
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
    new VueLoaderPlugin(),
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
