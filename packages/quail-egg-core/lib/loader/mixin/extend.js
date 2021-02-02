const path = require('path')
const is = require('is-type-of')

module.exports = {
  loadAgentExtend() {
    this.loadExtend('agent', this.app)
  },

  loadApplicationExtend() {
    this.loadExtend('application', this.app)
  },

  loadRequestExtend() {
    this.loadExtend('request', this.app.request)
  },

  loadResponseExtend() {
    this.loadExtend('response', this.app.response)
  },

  loadContextExtend() {
    this.loadExtend('context', this.app.context)
  },

  loadHelperExtend() {
    if (this.app && this.app.Helper) {
      this.loadExtend('helper', this.app.Helper.prototype)
    }
  },

  getExtendFilePaths(name) {
    return this.getLoadUnits().map((unit) =>
      path.join(unit.path, 'app/extend', name)
    )
  },

  loadExtend(name, proto) {
    const filePaths = this.getExtendFilePaths(name)
  },
}
