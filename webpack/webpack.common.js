const { resolve, join } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const Autoprefixer = require('autoprefixer');
const Cssnano = require('cssnano');

const modifyVars = require('../src/static/template/antd-custom'); // antd 自定义主题
const template = 'src/static/template/index.html'; // 页面模板
const browsers = [ // css 自动补全作用的浏览器版本
  'last 10 Chrome versions',
  'last 5 Firefox versions',
  'Safari >= 6',
  'ie> 8',
];

module.exports = {
  entry: { // 入口文件
    index: resolve(__dirname, '../src/entry/index.tsx'),
  },

  output: {
    publicPath: '/', // 静态资源路径
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'], // 文件不写后缀时的寻找顺序
    alias: { '@': resolve(join(__dirname, '../src')) }, // 简化路径
  },

  plugins: [
    new HtmlWebpackPlugin({
      template, // 提供模板
      minify:{
        removeComments: true, // 移除 HTML 中的注释
        collapseWhitespace: true, // 删除空白符与换行符
        removeRedundantAttributes: true, // 当值匹配默认值时删除属性
        removeEmptyAttributes: true, // 移除空属性
      },
    }),
    new CleanWebpackPlugin(), // 编译前先删除原有文件夹
  ],

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'ts-loader'],
      }, {
        test: /\.tsx?$/,
        enforce: 'pre',
        use: [
          {
            loader: 'tslint-loader',
            options: { emitErrors: true, failOnHint: true, fix: true }
          }
        ]
      }, {
        test: /\.(css|less)$/,
        exclude: /src/, // 排除业务代码
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: { javascriptEnabled: true, modifyVars },
          }
        ],
      }, {
        test: /\.less$/,
        exclude: /node_modules/, // 排除 node_modules
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
              plugins: [
                Autoprefixer({ browsers }), // CSS 浏览器兼容
                Cssnano(), // 压缩css
              ]
            }
          }, {
            loader: 'less-loader',
            options: { javascriptEnabled: true },
          },
        ],
      }, {
        test: /\.(png|jpg|gif|woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: { limit: 100000 },
          }
        ],
      },
    ]
  },
};
