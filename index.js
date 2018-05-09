const { writeFileSync } = require('fs')
const path = require('path')
const swPrecache = require('sw-precache')
const UglifyJS = require('uglify-es')
const urlJoin = require('url-join')

const getServiceWorkder = options =>
  swPrecache.generate(options).catch(err => {
    throw err
  })

module.exports = bundler => {
  const { minify, publicURL, outDir } = bundler.options

  bundler.on('bundled', () => {
    let pkg
    if (
      bundler.mainAsset &&
      bundler.mainAsset.package &&
      bundler.mainAsset.package.pkgfile
    ) {
      // for parcel-bundler version@<1.8
      pkg = require(bundler.mainAsset.package.pkgfile)
    } else {
      pkg = bundler.mainBundle.entryAsset.package
    }

    const swPrecacheConfigs = pkg['sw-precache']
    const options = {
      cacheId: pkg.name, // default cacheId

      dontCacheBustUrlsMatching: /\.\w{8}\./,
      navigateFallback: urlJoin(publicURL, 'index.html'),
      staticFileGlobs: [
        outDir + '/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff,woff2}'
      ],
      staticFileGlobsIgnorePatterns: [
        /\.map$/,
        /asset-manifest\.json$/,
        /service-worker\.js$/
      ],

      stripPrefix: outDir + '/',
      replacePrefix: urlJoin(publicURL, '/'),

      // https://firebase.google.com/docs/hosting/reserved-urls#reserved_urls_and_service_workers
      navigateFallbackWhitelist: [/^(?!\/__).*/],

      // merge user configs
      ...swPrecacheConfigs
    }

    getServiceWorkder(options).then(codes => {
      const fileName = 'service-worker.js'
      if (minify) {
        const compressedCodes = {}
        compressedCodes[fileName] = codes
        codes = UglifyJS.minify(compressedCodes).code
      }

      const serviceWorkerFilePath = path.resolve(outDir, fileName)
      writeFileSync(serviceWorkerFilePath, codes)
    })
  })
}
