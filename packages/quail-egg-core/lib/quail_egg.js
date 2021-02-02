'use strict'

const KoaApplication = require('koa')
const { QuailEggRouter } = require('quail-egg-router')
const ROUTER = Symbol('QuailEggCore#router')
const QUAIL_EGG_LOADER = Symbol.for('quail-egg#loader')
const BaseContextClass = require('./utils/base_context_class')

class QuailEggCore extends KoaApplication {
  constructor(options = {}) {
    options.baseDir = options.baseDir || process.cwd()
    options.type = options.type || 'application'
    super()
    this.BaseContextClass = BaseContextClass
    this.Controller = this.BaseContextClass
    this.Service = this.BaseContextClass
    const Loader = this[QUAIL_EGG_LOADER]
    this.loader = new Loader({
      baseDir: options.baseDir,
      app: this,
    })
  }

  get baseDir() {
    return this.options.baseDir
  }

  get type() {
    return this.options.type
  }

  get name() {
    return this.loader ? this.loader.pkg.name : ''
  }

  get config() {
    return this.loader ? this.loader.config : {}
  }

  get router() {
    if (this[ROUTER]) return this[ROUTER]
    const router = (this[ROUTER] = new QuailEggRouter({ sensitive: true }, this))
    this.use(router.middleware())
    return router
  }

  get [QUAIL_EGG_LOADER]() {
    return require('./loader/quail_egg_loader')
  }

  use(fn) {
    this.middleware.push(fn)
    return this
  }
}

;[
  'head',
  'options',
  'get',
  'put',
  'patch',
  'post',
  'delete',
  'all',
  'resources',
  'register',
  'redirect',
].forEach((method) => {
  QuailEggCore.prototype[method] = function (...args) {
    this.router[method](...args)
    return this
  }
})

module.exports = QuailEggCore
