const { Controller } = require('quail-egg')

class LoginController extends Controller {
  create() {
    this.ctx.body = { success: true }
  }
}

module.exports = LoginController
