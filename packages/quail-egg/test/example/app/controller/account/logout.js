const { Controller } = require('quail-egg')

class LogoutController extends Controller {
  delete() {
    this.ctx.body = { success: true }
  }
}

module.exports = LogoutController
