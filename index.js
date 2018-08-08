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

  bundler.on('bundled', async () => {
    let pkg
    let mainAssetPackage

    if (bundler.mainAsset) {
      if (bundler.mainAsset.getPackage) {
        mainAssetPackage = await bundler.mainAsset.getPackage()
      } else {
        mainAssetPackage = bundler.mainAsset.package
      }
    }

    if (
      mainAssetPackage &&
      mainAssetPackage.pkgfile
    ) {
      // for parcel-bundler version@<1.8
      pkg = require(mainAssetPackage.pkgfile)
    } else {
      let mainBundlePackage

      if (bundler.mainBundle &&
        bundler.mainBundle.entryAsset) {
        if (bundler.mainBundle.entryAsset.getPackage) {
          mainBundlePackage = await bundler.mainBundle.entryAsset.getPackage()
        } else {
          mainBundlePackage = bundler.mainBundle.entryAsset.package
        }
      }
      pkg = await mainBundlePackage
    }

    const swPrecacheConfigs = pkg['sw-precache']

    // Update default stripPrefix for Windows file path format
    const isWin = /^win/.test(process.platform)
    let stripPrefixDefault = outDir + '/'
    if (isWin) {
      stripPrefixDefault = stripPrefixDefault.replace(/\\/g, '/')
    }

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

      stripPrefix: stripPrefixDefault,
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
