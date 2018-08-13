const { writeFileSync } = require('fs')
const path = require('path')
const swPrecache = require('sw-precache')
const UglifyJS = require('uglify-es')
const urlJoin = require('url-join')

const getServiceWorkder = options =>
  swPrecache.generate(options).catch(err => {
    throw err
  })

const getValue = function(obj, key) {
  return key.split('.').reduce(function(o, x) {
    return typeof o == 'undefined' || o === null ? o : o[x]
  }, obj)
}

// These configs are supplied as array of strings and should be converted to array of regexps
const regexpConfigs = [
  'dontCacheBustUrlsMatching',
  'ignoreUrlParametersMatching',
  'navigateFallbackWhitelist'
]

module.exports = bundler => {
  const { minify, publicURL, outDir } = bundler.options

  bundler.on('bundled', async () => {
    let pkg
    const entryAsset = getValue(bundler, 'mainBundle.entryAsset')

    try {
      pkg = await entryAsset.getPackage()
    } catch (err) {
      throw new Error(
        'The bundler properties/sub-properties (mainBundle / entryAsset) seems to be not present'
      )
    }

    const swPrecacheConfigs = pkg['sw-precache']

    if (swPrecacheConfigs) {
      // Respect regexp configs
      regexpConfigs.forEach(config => {
        if (swPrecacheConfigs[config]) {
          swPrecacheConfigs[config] = swPrecacheConfigs[config].map(
            strValue => new RegExp(strValue)
          )
        }
      })
    }

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
