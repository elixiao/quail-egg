module.exports = (options) => {
  return async function notfound(ctx, next) {
    await next()
    if (ctx.status !== 404 || ctx.body) return
    ctx.status = 404
    ctx.body = ctx.acceptJSON
      ? { message: 'Not Found' }
      : '<h1>404 Not Found</h1>'
  }
}
