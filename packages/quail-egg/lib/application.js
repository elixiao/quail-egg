'use strict'
const QuailEggApplication = require('./quail_egg')
const QUAIL_EGG_LOADER = Symbol.for('quail-egg#loader')
const QUAIL_EGG_PATH = Symbol.for('quail-egg#eggPath')
const AppWorkerLoader = require('./loader/app_worker_loader')

class Application extends QuailEggApplication {
  constructor(options = {}) {
    options.type = 'application'
    super(options)

    try {
      this.loader.load()
    } catch (e) {
      throw e
    }
  }

  get [QUAIL_EGG_LOADER]() {
    return AppWorkerLoader
  }

  get [QUAIL_EGG_PATH]() {
    return path.join(__dirname, '..')
  }

  get Helper() {
    if (!this[HELPER]) {
      class Helper extends this.BaseContextClass {}
      this[HELPER] = Helper
    }
    return this[HELPER]
  }
}

module.exports = Application
