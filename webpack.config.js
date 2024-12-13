const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/popup.js',
  output: {
    filename: 'popup.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
  resolve: {
    fallback: {
      "http": false,
      "https": false,
      "url": false,
      "util": false,
      "stream": false,
      "crypto": false,
      "buffer": require.resolve("buffer/"),
      "process": false 
    },
    alias: {
      process: "process/browser"
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
}; 