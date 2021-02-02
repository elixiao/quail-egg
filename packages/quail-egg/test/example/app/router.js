module.exports = (app) => {
  const { router, controller } = app
  router.get('/articles', controller.article.index)
  router.post('/login', controller.account.login.create)
  router.delete('/logout', controller.account.logout.delete)
}