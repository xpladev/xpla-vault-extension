const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

// util@0.11.1: process를 typeof 체크 후 함수 내부에서만 사용 → 안전한 브라우저 폴리필
const utilPolyfillPath = path.resolve(
  __dirname,
  '../node_modules/util/util.js'
);

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: 'inline-source-map',
  bail: true,
  entry: {
    contentScript: path.join(__dirname, 'contentScript.js'),
    background: path.join(__dirname, 'background.js'),
    inpage: path.join(__dirname, 'inpage.js'),
  },
  output: {
    path: path.join(__dirname, '..', 'build'),
    filename: '[name].js',
  },
  plugins: [
    new NodePolyfillPlugin({
      excludeAliases: ['util'],
    }),
    // readable-stream이 모듈 초기화 시 util.debuglog()를 호출하므로 process 전역 주입 필요
    new webpack.ProvidePlugin({
      process: require.resolve('process/browser'),
    }),
  ],
  resolve: {
    alias: {
      util: utilPolyfillPath,
    },
  },
};
