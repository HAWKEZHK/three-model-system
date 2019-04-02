const { resolve, join } = require('path');
const { HotModuleReplacementPlugin, NamedModulesPlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: "development", // 开发环境
  devtool: 'cheap-module-source-map', // 生成 sourceMap 方式

  entry: './src/entry/index.tsx', // 入口文件
  output: {
    filename: 'index.js', // 文件名
    path: resolve('./output'), // 导出的本地路径
    publicPath: '/', // devSever 上的路径
  },

  devServer: {
    host: 'localhost',
    port: 3000,
    hot: true, // 是否启用热更新
    inline: true, // 是否不使用 iframe
    disableHostCheck: true, // 是否关闭本地 host 检查
    compress: true, // 是否启用 gzip 压缩
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'], // 文件不写后缀时的寻找顺序
    alias: { '@': resolve(join(__dirname, '../src')) }, // 简化路径
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'static/template/index.html', // 提供模板
      minify:{
        removeComments: true, // 移除 HTML 中的注释
        collapseWhitespace: true, // 删除空白符与换行符
      },
    }),
    new HotModuleReplacementPlugin(), // 启动局部热更新的插件
    new NamedModulesPlugin(), // 显示局部热更新的相对路径
  ],

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: ['babel-loader', 'ts-loader'],
        exclude: /node_modules/, // 排除
      }, {
        test: /\.tsx?$/,
        enforce: 'pre',
        use: [
          {
            loader: 'tslint-loader',
            options: {
              emitErrors: true,
              failOnHint: true,
              fix: true,
            }
          }
        ]
      }, {
        test: /\.less$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true, // 是否开启 css-modules 模式
              localIdentName: '[path][name]-[local]', // 设置 css-modules 模式下类名的命名
            }
          }, {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                require('autoprefixer')({ browsers: ['FireFox > 1', 'Chrome > 1', 'ie >= 8'] }), // CSS浏览器兼容
                require('cssnano')(), // 压缩css
              ]
            }
          },
          'less-loader',
        ],
      }, {
        test: /\.(png|jpg|gif|woff|woff2|eot|ttf)$/,
        use: [{ loader: 'url-loader', options: { limit: 100000 } }],
      }, {
        test: /\.svg/,
        use: [{ loader: 'url-loader', options: { limit: 100000, minetype: 'image/svg+xml' } }],
      },
    ]
  },
};
