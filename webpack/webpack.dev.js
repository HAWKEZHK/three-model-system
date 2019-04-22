const merge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

const { HotModuleReplacementPlugin, NamedModulesPlugin, HashedModuleIdsPlugin } = require('webpack');

module.exports = merge(commonConfig, {
  mode: 'development', // 开发环境
  
  output: {
    filename: '[name].js', // 文件名
  },

  devtool: 'inline-source-map', // 生成 sourceMap 方式

  devServer: {
    host: 'localhost',
    port: 3000,
    hot: true, // 是否启用热更新
    inline: true, // 是否不使用 iframe
    disableHostCheck: true, // 是否关闭本地 host 检查
    compress: true, // 是否启用 gzip 压缩
  },

  plugins: [
    new HotModuleReplacementPlugin(), // 启动局部热更新的插件
    new NamedModulesPlugin(), // 显示局部热更新的相对路径
    new HashedModuleIdsPlugin(), // 不做改动 hash 保持不变
  ],
});
