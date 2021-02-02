const path = require('path')
const is = require('is-type-of')

module.exports = {
  loadController(opt) {
    // 获取所有加载单元下的 app/controller 目录
    const directory = this.getLoadUnits().map((unit) =>
      path.join(unit.path, 'app/controller')
    )
    const initializer = controllerInitializer.bind(this)
    // 将目录中的文件全部挂载到 app.controller 上
    this.loadToApp(directory, 'controller', { initializer, ...opt })
  },
}

// 控制器初始化函数
function controllerInitializer(controller, opt) {
  // 如果控制器是函数则执行
  if (is.function(controller) && !is.class(controller)) {
    controller = controller(this.app)
  }
  // 如果控制器是类则new
  if (is.class(controller)) {
    return wrapClass(controller, opt)
  }
  // 如果控制器是对象 TODO
  if (is.object(controller)) {
    return wrapObject(controller, opt)
  }
  return controller
}

// 遍历原型链
function wrapClass(Controller, opt) {
  let proto = Controller.prototype
  const ret = {}
  while (proto !== Object.prototype) {
    const keys = Object.getOwnPropertyNames(proto)
    for (const key of keys) {
      // 跳过 contructor 函数
      if (key === 'constructor') continue
      // 跳过 getter, setter 等访问器属性
      if (!is.function(Object.getOwnPropertyDescriptor(proto, key).value))
        continue
      // 跳过同名属性，防止覆盖子类的方法
      if (ret.hasOwnProperty(key)) continue
      ret[key] = methodToMiddleware(Controller, key)
      ret[key]['fullPath'] = `${opt.fullPath}#${Controller.name}.${key}()`
    }
    proto = Object.getPrototypeOf(proto)
  }
  return ret
}

// 把实例原型链上的方法转换成中间件
function methodToMiddleware(Controller, key) {
  return function classControllerMiddleware(...args) {
    const controller = new Controller(this)
    const ctrlConfig = this.app.config.controller || {}
    if (!ctrlConfig.supportParams) args = [this]
    return controller[key].call(controller, ...args)
  }
}
