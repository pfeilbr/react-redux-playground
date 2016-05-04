var webpack = require('webpack')

module.exports = {
  devtool: 'eval-source-map',
  entry: [
    './index.js'
  ],
  output: {
    path: './',
    filename: 'bundle.js'
  },
  plugins: [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin()
    ],
  module: {
      loaders: [
        {
          test: /\.js$/,
          loaders: [ 'babel' ],
          exclude: /node_modules/,
          include: __dirname
        },
        {
          test: /\.css?$/,
          loaders: [ 'style', 'raw' ],
          include: __dirname
        }
      ]
    },
    devServer: {
        contentBase: "./",
        colors: true,
        historyApiFallback: true,
        inline: true
      }
};
