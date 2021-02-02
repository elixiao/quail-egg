const path = require('path')

module.exports = {
  loadService(opt) {
    // 获取所有加载单元下的 app/service 目录
    const directory = this.getLoadUnits().map((unit) =>
      path.join(unit.path, 'app/service')
    )
    // 将目录中的文件全部挂载到 app.serviceClasses 上
    opt = { directory, fieldClass: 'serviceClasses', ...opt }
    this.loadToContext(directory, 'service', opt)
  },
}
