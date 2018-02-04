const { writeFileSync } = require("fs");
const path = require("path");
const swPrecache = require("sw-precache");

const getServiceWorkder = dir =>
  swPrecache
    .generate({
      cacheId: "parcel-plugin-sw-precache",
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      navigateFallback: "/index.html",
      staticFileGlobs: [
        dir + "/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}"
      ],
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/, /service-worker\.js$/],
      stripPrefix: dir
    })
    .catch(err => {
      throw err;
    });

module.exports = bundler => {
  const targetDir = bundler.options.outDir;
  bundler.on("bundled", () => {
    const serviceWorkerFilePath = path.resolve(targetDir, "service-worker.js");
    getServiceWorkder(targetDir).then(codes => {
      writeFileSync(serviceWorkerFilePath, codes);
    });
  });
};
