const baseDir = `${__dirname}/example`

function testFileLoader() {
  const FileLoader = require('quail-egg-core/lib/loader/file_loader')
  const fileLoader = new FileLoader({
    directory: baseDir,
    target: {},
  })
  console.log(fileLoader.load())
}

function testQuailEggLoader() {
  const QuailEggLoader = require('quail-egg-core/lib/loader/quail_egg_loader')
  const quailEggLoader = new QuailEggLoader({ baseDir, app: {} })
  console.log(quailEggLoader.getQuailEggPaths())
}

function testQuailEgg() {
  const Application = require('quail-egg/lib/application')
  const app = new Application({ baseDir })
  app.listen(7001, () => console.log('监听7001端口'))
}

// testFileLoader()
// testQuailEggLoader()
testQuailEgg()
