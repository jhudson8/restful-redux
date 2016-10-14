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
        test: /\.jsx?$/,
        include: __dirname,
        loader: 'babel',
        query: {
          // https://github.com/babel/babel-loader#options
          cacheDirectory: true,
          presets: ['react', 'es2015', 'stage-2']
        }
      },
      { test: /\.css/, loaders: ['style-loader', 'css-loader'] },
      { test: /\.less$/,
        loader: 'style!css!less' },
      { test: /\.woff(2)?$/,
        loader: 'url-loader?limit=10000&minetype=application/font-woff' },
      { test: /\.(ttf|eot|svg|png|jpg)$/,
        loader: 'file-loader' },
      { test: /\.json$/,
        loader: 'json-loader' }
    ]
  },
  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    // Clean
    new CleanPlugin(['dist']),
    new HtmlWebpackPlugin({
      inject: 'body',
      template: path.join(__dirname, 'lib', 'index.html')
    }),
    // if we're using moment, only include en bundle
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en\.js$/)
  ],

  devServer: {
    port: 8080,
    historyApiFallback: true
  }
};
