'use strict'

const is = require('is-type-of')
const KoaRouter = require('@koa/router')
const assert = require('assert')

const METHODS = ['head', 'options', 'get', 'put', 'patch', 'post', 'delete']

const REST_MAP = {
  index: {
    suffix: '',
    method: 'GET',
  },
  new: {
    namePrefix: 'new_',
    suffix: 'new',
    method: 'GET',
  },
  create: {
    suffix: '',
    method: 'POST',
  },
  show: {
    suffix: ':id',
    method: 'GET',
  },
  edit: {
    namePrefix: 'edit_',
    suffix: ':id/edit',
    method: 'GET',
  },
  update: {
    namePrefix: '',
    suffix: ':id',
    method: ['PATCH', 'PUT'],
  },
  destroy: {
    namePrefix: 'destroy_',
    suffix: ':id',
    method: 'DELETE',
  },
}

class QuailEggRouter extends KoaRouter {
  constructor(opts, app) {
    super(opts)
    this.app = app
    this.patchRouterMethod()
  }

  patchRouterMethod() {
    METHODS.concat(['all']).forEach((method) => {
      this[method] = (...args) => {
        const splited = spliteAndResolveRouterParams({ args, app: this.app })
        args = splited.prefix.concat(splited.middlewares)
        return super[method](...args)
      }
    })
  }

  register(path, methods, middlewares, opts) {
    middlewares = Array.isArray(middlewares) ? middlewares : [middlewares]
    middlewares = convertMiddlewares(middlewares, this.app)
    path = Array.isArray(path) ? path : [path]
    path.forEach((p) => super.register(p, methods, middlewares, opts))
    return this
  }

  resources(...args) {
    const splited = spliteAndResolveRouterParams({ args, app: this.app })
    const middlewares = splited.middlewares
    // last argument is Controller object
    const controller = splited.middlewares.pop()

    let name = ''
    let prefix = ''
    if (splited.prefix.length === 2) {
      // router.get('users', '/users')
      name = splited.prefix[0]
      prefix = splited.prefix[1]
    } else {
      // router.get('/users')
      prefix = splited.prefix[0]
    }

    for (const key in REST_MAP) {
      const action = controller[key]
      if (!action) continue

      const opts = REST_MAP[key]
      let formatedName = name
      if (opts.namePrefix) {
        formatedName = opts.namePrefix + formatedName
      }
      prefix = prefix.replace(/\/$/, '')
      const path = opts.suffix ? `${prefix}/${opts.suffix}` : prefix
      const method = Array.isArray(opts.method) ? opts.method : [opts.method]
      this.register(path, method, middlewares.concat(action), {
        name: formatedName,
      })
    }
    return this
  }

  url(name, params) {
    const route = this.route(name)
    if (!route) return ''

    const args = params
    let url = route.path
    
    assert(
      !is.regExp(url),
      `Can't get the url for regExp ${url} for by name '${name}'`
    )

    const queries = []
    if (typeof args === 'object' && args !== null) {
      const replacedParams = []
      url = url.replace(/:([a-zA-Z_]\w*)/g, function ($0, key) {
        if (args.hasOwnProperty(key)) {
          const values = args[key]
          replacedParams.push(key)
          return encodeURIComponent(Array.isArray(values) ? values[0] : values)
        }
        return $0
      })

      for (const key in args) {
        if (replacedParams.includes(key)) {
          continue
        }

        const values = args[key]
        const encodedKey = encodeURIComponent(key)
        if (Array.isArray(values)) {
          for (const val of values) {
            queries.push(`${encodedKey}=${encodeURIComponent(val)}`)
          }
        } else {
          queries.push(`${encodedKey}=${encodeURIComponent(values)}`)
        }
      }
    }

    if (queries.length > 0) {
      const queryStr = queries.join('&')
      if (!url.includes('?')) {
        url = `${url}?${queryStr}`
      } else {
        url = `${url}&${queryStr}`
      }
    }

    return url
  }

  pathFor(name, params) {
    return this.url(name, params)
  }
}

function spliteAndResolveRouterParams({ args, app }) {
  let prefix
  let middlewares
  if (args.length >= 3 && (is.string(args[1]) || is.regExp(args[1]))) {
    // app.get(name, url, [...middleware], controller)
    prefix = args.slice(0, 2)
    middlewares = args.slice(2)
  } else {
    // app.get(url, [...middleware], controller)
    prefix = args.slice(0, 1)
    middlewares = args.slice(1)
  }
  // resolve controller
  const controller = middlewares.pop()
  middlewares.push(resolveController(controller, app))
  return { prefix, middlewares }
}

function resolveController(controller, app) {
  if (is.string(controller)) {
    const actions = controller.split('.')
    let obj = app.controller
    actions.forEach((key) => {
      obj = obj[key]
      if (!obj) throw new Error(`controller '${controller}' not exists`)
    })
    controller = obj
  }
  if (!controller) throw new Error('controller not exists')
  return controller
}

function convertMiddlewares(middlewares, app) {
  const controller = resolveController(middlewares.pop(), app)
  const wrappedController = (ctx, next) => {
    return controller.call(ctx, ctx, next)
  }
  return middlewares.concat([wrappedController])
}

module.exports = QuailEggRouter
