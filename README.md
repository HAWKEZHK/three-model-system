# three-model-system

> 基于 THREE.JS 的 3D 建模系统（毕设项目）

- 预览
  
  https://hawkezhk.github.io/three-model-system/

- 技术栈

  React + TypeScript + Css-Module + Ant-Design + Three.js

- 目录结构

  ```
  three-model-system/
    │
    │── src/                         * 源文件
    │    |
    |    |—— common/                 * 公共文件
    |    |    |
    |    |    |—— constants/         * 常数
    |    |    |
    |    |    |—— helper/            * 工具方法
    |    |    |
    |    |    |—— models/            * 模型
    |    |
    |    |—— components/             * 组件
    |    |    |
    |    |    |—— home/              * 工作区
    |    |    |
    |    |    |—— operation/         * 模型控制区
    |    |    |
    |    |    |—— three-drawer/      * 外部模型库
    │    |
    |    |—— entry/                  * 入口文件
    │    |
    |    |—— static/                 * 静态文件
    |    |    |
    |    |    |—— 3D-files/          * 3D文件
    |    |    |
    |    |    |—— images/            * 图片
    |    |    |
    |    |    |—— template/          * 模板
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

- BTW

> 这是毕设做的小项目，受到在公司一个大佬的启发而选的这个题目，正好也让我学习了一下 three.js。由于时间和精力问题没有将这个项目做到太完美，有几个可以优化的地方在这稍微列一下 ~（基本上是因为没有精力去写后台导致的 hh）

+ 可以增加一个账号体系
+ 项目中的“外部模型导入”功能就可以做成直接上传本地文件的形式，带进度条之类的。（目前这个功能在生产环境体验会比较差，因为要下载比较大的文件，代码 clone 下来在开发环境体验会好一些~）
+ 缓存功能可以将数据存在后台，配合账号体系保存草稿。现在为了简单是直接缓存在 localstorage 中
+ 还有一些建模功能上的优化比如扫描、镜像还有爆炸图这些，有兴趣的可以探索探索，这些功能比较复杂但应该是可以实现的
