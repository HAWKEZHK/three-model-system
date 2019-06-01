const merge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

const { resolve } = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const Cssnano = require('cssnano');
const copyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge(commonConfig, {
  mode: 'production', // 生产环境

  output: {
    filename: '[name].[contenthash:8].js', // 文件名
    path: resolve('./output'), // 导出的本地路径
	},

	devtool: 'hidden-source-map', // 生成 sourceMap 方式（不会在 bundle 末尾追加注释）

	performance: {
		hints: 'warning',
		maxEntrypointSize: 5000000, 
		maxAssetSize: 3000000,
	},

  plugins: [
    new MiniCssExtractPlugin({ filename: '[name].[contenthash:8].css' }),
		new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.optimize\.css$/g,
      cssProcessor: Cssnano,
      cssProcessorOptions: { safe: true, discardComments: { removeAll: true } },
      canPrint: true,
    }),
    new CompressionWebpackPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp('\\.(js|css)$'), // 压缩 js 与 css
      threshold: 10240,
      minRatio: 0.8,
    }),
    new copyWebpackPlugin([{ // 处理静态资源
      from: resolve(__dirname, '../src/static'),
      to: './src/static',
    }]),
	],

  optimization: {
    splitChunks: { chunks: 'all' }, // 打包 node_modules 里的代码
    runtimeChunk: true, // 打包 runtime 代码
    minimizer: [ // 使用 minimizer 会取消 webpack 的默认配置，所以需要用 UglifyJsPlugin
      new OptimizeCssAssetsPlugin(), // 压缩 css
      new UglifyJsPlugin({ uglifyOptions: { ecma: 6, cache: true, parallel: true } }), // 压缩 js
    ],
  },
});
