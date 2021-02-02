const { Controller } = require('quail-egg')

class ArticleController extends Controller {
  async index() {
    const res = await this.ctx.service.article.find()
    this.ctx.body = res
  }
}

module.exports = ArticleController
