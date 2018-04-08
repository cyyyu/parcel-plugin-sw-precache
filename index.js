const { writeFileSync } = require('fs')
const path = require('path')
const swPrecache = require('sw-precache')
const UglifyJS = require('uglify-es')

const DEFAULT_CACHE_ID = 'parcel-plugin-sw-precache'
const DEFAULT_SW_PRECACHE_CONFIGS = {}

const getServiceWorkder = (
  targetDir,
  cacheId = DEFAULT_CACHE_ID,
  options = DEFAULT_SW_PRECACHE_CONFIGS
) =>
  swPrecache
    .generate({
      cacheId,
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      navigateFallback: '/index.html',
      staticFileGlobs: [
        targetDir + '/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff,woff2}'
      ],
      staticFileGlobsIgnorePatterns: [
        /\.map$/,
        /asset-manifest\.json$/,
        /service-worker\.js$/
      ],
      stripPrefix: targetDir,

      // https://firebase.google.com/docs/hosting/reserved-urls#reserved_urls_and_service_workers
      navigateFallbackWhitelist: [/^(?!\/__).*/],

      // merge user configs
      ...options
    })
    .catch(err => {
      throw err
    })

module.exports = bundler => {
  const targetDir = bundler.options.outDir
  const { minify, rootDir } = bundler.options

  bundler.on('bundled', () => {
    const pkg = require(bundler.mainAsset.package.pkgfile)
    const swPrecacheConfigs = pkg['sw-precache']
    const fileName = 'service-worker.js'
    const serviceWorkerFilePath = path.resolve(targetDir, fileName)

    getServiceWorkder(targetDir, pkg.name, swPrecacheConfigs).then(codes => {
      if (minify) {
        const compressedCodes = {}
        compressedCodes[fileName] = codes
        codes = UglifyJS.minify(compressedCodes).code
      }
      writeFileSync(serviceWorkerFilePath, codes)
    })
  })
}
