const { QuailEggLoader } = require('quail-egg-core')

class AppWorkerLoader extends QuailEggLoader {
  loadConfig() {
    // this.loadPlugin()
    super.loadConfig()
  }

  load() {
    // app > plugin > core
    // this.loadApplicationExtend()
    // this.loadRequestExtend()
    // this.loadResponseExtend()
    // this.loadContextExtend()
    // this.loadHelperExtend()

    // this.loadCustomLoader()

    // app > plugin
    // this.loadCustomApp()
    // app > plugin
    this.loadService()
    // app > plugin > core
    this.loadMiddleware()
    // app
    this.loadController()
    // app
    this.loadRouter() // Dependent on controllers
  }
}

module.exports = AppWorkerLoader
