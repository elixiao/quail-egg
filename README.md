## 手写简易版 egg

今天我们来实现一个简易版的 egg 框架，不妨叫这个项目为 quail-egg ，即鹌鹑蛋，只实现 egg 的最基本功能（Controller、Service 和 Router）。此项目我们采用 monorepo 的方式来管理仓库，首先全局安装 lerna：

```sh
npm i lerna -g
# 或者 yarn global add lerna
```

然后选择一个合适的目录，创建并进入名叫 `quail-egg` 空的文件夹：

```sh
lerna init # 初始化项目
npm i # 或者 yarn 安装依赖
```

然后修改 package.json，添加 workspaces：

```
"workspaces": [
  "packages/*"
]
```

> yarn workspace 允许我们使用 monorepo 的方式管理项目，子项目也会被 link 到 node_modules 里面，从而能够互相引用。

接下来我们创建四个子项目：

```js
lerna create quail-egg # 鹌鹑蛋主项目
lerna create quail-egg-core  # 鹌鹑蛋核心项目
lerna create quail-egg-router # 鹌鹑蛋路由项目
```

然后查看子项目：

```sh
$ yarn workspaces info
{
  "quail-egg-core": {
    "location": "packages/quail-egg-core",
    "workspaceDependencies": [],
    "mismatchedWorkspaceDependencies": []
  },
  "quail-egg-router": {
    "location": "packages/quail-egg-router",
    "workspaceDependencies": [],
    "mismatchedWorkspaceDependencies": []
  },
  "quail-egg": {
    "location": "packages/quail-egg",
    "workspaceDependencies": [],
    "mismatchedWorkspaceDependencies": []
  }
}
```

运行方式：

```js
const Application = require('quail-egg/lib/application')
const app = new Application({ baseDir }) // baseDir 是项目根目录
app.listen(7001, () => console.log('监听7001端口'))
```


