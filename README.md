# three-model-system

> 基于 THREE.JS 的 3D 建模系统（毕设项目）

- 技术栈

  React + TypeScript + Css-Module + Ant-Design + Three.js

- 目录结构

  ```
  three-model-system/
    │
    │── src/                         * 源文件
    │    |
    |    |—— common/                 * 公共文件
    |    |       |
    |    |       |—— constants/      * 常数
    |    |       |
    |    |       |—— helper/         * 工具方法
    |    |       |
    |    |       |—— models/         * 模型
    |    |
    |    |—— components/             * 组件
    |    |       |
    |    |       |—— home/           * 工作区
    |    |       |
    |    |       |—— operation/      * 模型控制区
    |    |       |
    |    |       |—— three-drawer/   * 外部模型库
    │    |
    |    |—— entry/                  * 入口文件
    │    |
    |    |—— static/                 * 静态文件
    |    |       |
    |    |       |—— 3D-files/       * 3D文件
    |    |       |
    |    |       |—— images/         * 图片
    |    |       |
    |    |       |—— template/       * 模板
    │
    │── webpack/
    │    |
    |    |—— webpack.common.js       * 公共配置
    │    |
    |    |—— webpack.dev.js          * 开发环境配置
    │    |
    |    |—— webpack.prod.js         * 生产环境配置
  ```

- 如何启动

  Step 1
  ```
  yarn install
  ```

  Step 2
  ```
  yarn start
  ```

  Step 3
  ```
  打开 http://localhost:3000/ 进行预览
  ```
