const fs = require('fs')
const path = require('path')
const FileLoader = require('./file_loader')
const ContextLoader = require('./context_loader')

class QuailEggLoader {
  constructor(options) {
    this.options = options
    this.app = this.options.app
    this.pkg = require(path.join(this.options.baseDir, 'package.json'))
    this.quailEggPaths = this.getQuailEggPaths()
  }

  getQuailEggPaths() {
    const QuailEggCore = require('../quail_egg')
    const quailEggPaths = []
    let proto = this.app
    while (proto) {
      proto = Object.getPrototypeOf(proto)
      if (proto === Object.prototype || proto === QuailEggCore.prototype) {
        break
      }
      const quailEggPath = proto[Symbol.for('quail-egg#quailEggPath')]
      const realpath = fs.realpathSync(quailEggPath)
      if (!quailEggPaths.includes(realpath)) quailEggPaths.unshift(realpath)
    }
    return quailEggPaths
  }

  loadFile(filepath) {
    const val = require(filepath)
    if (typeof val === 'function') return val(this.app)
    return val
  }

  // 获取加载单元路径
  getLoadUnits() {
    if (this.dirs) return this.dirs
    const dirs = (this.dirs = [])
    for (const path of this.quailEggPaths) {
      dirs.push({ path, type: 'framework' })
    }
    dirs.push({ path: this.options.baseDir, type: 'app' })
    return dirs
  }

  // 加载文件到 app 上：比如 app/controller/home.js 会加载到 app.controller.home
  loadToApp(directory, property, opt) {
    // console.log('loadToApp', directory, property, opt, this.app)
    const fileLoader = new FileLoader({
      directory,
      target: (this.app[property] = {}),
      inject: this.app,
      ...opt,
    })
    fileLoader.load()
  }

  // 懒加载到 app.ctx 上，即调用 ctx API 时才实例化对象，实例化后会被缓存
  loadToContext(directory, property, opt) {
    const contextLoader = new ContextLoader({
      directory,
      property,
      inject: this.app,
      ...opt,
    })
    contextLoader.load()
  }
}

const loaders = [
  require('./mixin/config'),
  require('./mixin/extend'),
  require('./mixin/service'),
  require('./mixin/middleware'),
  require('./mixin/controller'),
  require('./mixin/router'),
]

for (const loader of loaders) {
  Object.assign(QuailEggLoader.prototype, loader)
}

module.exports = QuailEggLoader
