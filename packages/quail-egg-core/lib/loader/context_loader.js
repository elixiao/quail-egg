const FileLoader = require('./file_loader')
const is = require('is-type-of')

class ClassLoader {
  constructor(options) {
    const target = options.target
    this.target = target
    this._ctx = options.ctx
    this._cache = new Map()
    for (const property in target) {
      this.defineProperty(property, target)
    }
  }

  defineProperty(property, target) {
    Object.defineProperty(this, property, {
      get() {
        const value = target[property]
        let instance = this._cache.get(property)
        if (!instance) {
          if (is.class(value)) {
            instance = new value(this._ctx)
          } else {
            instance = new ClassLoader({ target: value, ctx: this._ctx })
          }
          this._cache.set(property, instance)
        }
        return instance
      },
    })
  }
}

class ContextLoader extends FileLoader {
  // 先挂载到 app[fieldClass] 上，使用的时候再实例化到 app.ctx 中
  constructor(options) {
    const target = (options.target = {})
    if (options.fieldClass) {
      options.inject[options.fieldClass] = target
    }
    super(options)
    const app = this.options.inject
    const property = options.property
    Object.defineProperty(app.context, property, {
      // 这里实现了懒加载和请求环境中单例
      get() {
        if (!this._cache) this._cache = new Map()
        let instance = this._cache.get(property)
        if (!instance) {
          instance = new ClassLoader({ target, ctx: this })
          this._cache.set(property, instance)
        }
        return instance
      },
    })
  }
}

module.exports = ContextLoader
