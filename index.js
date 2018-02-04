const { writeFileSync } = require('fs')
const path = require('path')
const swPrecache = require('sw-precache')
const UglifyJS = require('uglify-es')

const getServiceWorkder = dir =>
  swPrecache
    .generate({
      cacheId: 'parcel-plugin-sw-precache',
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      navigateFallback: '/index.html',
      staticFileGlobs: [
        dir + '/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}'
      ],
      staticFileGlobsIgnorePatterns: [
        /\.map$/,
        /asset-manifest\.json$/,
        /service-worker\.js$/
      ],
      stripPrefix: dir
    })
    .catch(err => {
      throw err
    })

module.exports = bundler => {
  const targetDir = bundler.options.outDir
  const { minify } = bundler.options
  bundler.on('bundled', () => {
    const fileName = 'service-worker.js'
    const serviceWorkerFilePath = path.resolve(targetDir, fileName)
    getServiceWorkder(targetDir).then(codes => {
      if (minify) {
        const compressedCodes = {}
        compressedCodes[fileName] = codes
        codes = UglifyJS.minify(compressedCodes).code
      }
      writeFileSync(serviceWorkerFilePath, codes)
    })
  })
}
