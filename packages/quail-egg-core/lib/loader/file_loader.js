const fs = require('fs')
const path = require('path')
const globby = require('globby')
const is = require('is-type-of')

class FileLoader {
  constructor(options) {
    this.options = options
  }

  // 将 parse 后的结果加载到指定对象上（options.target）
  load() {
    const items = this.parse()
    const target = this.options.target
    for (const item of items) {
      const { properties } = item
      properties.reduce((target, property, index) => {
        if (index < properties.length - 1) {
          target[property] = target[property] || {}
        } else {
          target[property] = item.exports
        }
        return target[property]
      }, target)
    }
    return target
  }

  // 解析指定目录（options.directory）下所有符合条件（options.match）的文件
  // 返回数组：[{fullpath, properties, exports}] （文件路径, 层级属性，导出内容）
  parse() {
    const { directory, match = '**/*.js', inject, initializer } = this.options
    const files = [].concat(match)
    const directories = [].concat(directory)
    const items = []
    const sep = /[/\\]/
    const suffix = /\..*/
    for (const directory of directories) {
      const filePaths = globby.sync(files, { cwd: directory })
      for (const filePath of filePaths) {
        
        const fullPath = path.join(directory, filePath)
        if (!fs.statSync(fullPath).isFile()) continue
        // foo/bar.js => ['foo', 'bar']
        const properties = filePath
          .split(sep)
          .map((it) => it.replace(suffix, ''))
        // app/service/foo/bar.js => service.foo.bar
        const pathName = directory
          .split(sep)
          .slice(-1)
          .concat(properties.join('.'))
        let exports = require(fullPath)
        if (exports === undefined) continue
        // 让调用方决定如何初始化导出模块
        if (initializer) {
          exports = initializer(exports, { fullPath, pathName })
        }
        if (is.class(exports)) {
          exports.prototype.pathName = pathName
          exports.prototype.fullPath = fullPath
        } else if (is.function(exports)) {
          exports = exports(inject)
        }
        items.push({ fullPath, properties, exports })
      }
    }
    return items
  }
}

module.exports = FileLoader
