const { QuailEggCore } = require('quail-egg-core')
const BaseContextClass = require('./core/base_context_class')
const path = require('path')
const QUAIL_EGG_PATH = Symbol.for('quail-egg#quailEggPath')

class QuailEggApplication extends QuailEggCore {
  constructor(options = {}) {
    super(options)
    this.loader.loadConfig()
    this.BaseContextClass = BaseContextClass
    this.Controller = BaseContextClass
    this.Service = BaseContextClass
  }

  get [QUAIL_EGG_PATH]() {
    return path.join(__dirname, '..')
  }

  createContext(req, res) {
    const app = this
    const context = Object.create(app.context)
    const request = (context.request = Object.create(app.request))
    const response = (context.response = Object.create(app.response))
    context.app = request.app = response.app = app
    context.req = request.req = response.req = req
    context.res = request.res = response.res = res
    request.ctx = response.ctx = context
    request.response = response
    response.request = request
    context.onerror = context.onerror.bind(context)
    context.originalUrl = request.originalUrl = req.url
    return context
  }
}

module.exports = QuailEggApplication
