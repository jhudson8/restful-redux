/*globals __dirname:false */
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanPlugin = require('clean-webpack-plugin');

module.exports = {
  cache: true,
  entry: path.join(__dirname, 'lib', 'index.js'),
  context: __dirname,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.[hash].js',
    publicPath: '/'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: __dirname,
        loader: 'babel',
        query: {
          // https://github.com/babel/babel-loader#options
          cacheDirectory: true,
          presets: ['react', 'es2015', 'stage-2']
        }
      }
    ]
  },
  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js']
  },
  plugins: [
    // Clean
    new CleanPlugin(['dist']),
    new HtmlWebpackPlugin({
      inject: 'body',
      template: path.join(__dirname, 'lib', 'index.html')
    })
  ],

  devServer: {
    port: 8080,
    historyApiFallback: true
  }
};
