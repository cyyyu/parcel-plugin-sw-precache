# parcel-plugin-sw-precache

A Parcel plugin for generating a service worker that precaches resources.

### Installation

`npm install --save-dev parcel-plugin-sw-precache`

### Configurations

* `swCacheId`

> A string used to distinguish the caches created by different web applications that are served off of the same origin and path. While serving completely different sites from the same URL is not likely to be an issue in a production environment, it avoids cache-conflicts when testing various projects all served off of http://localhost. You may want to set it to, e.g., the name property from your package.json.

With `parcel-plugin-sw-precache`, you are able to specify the cacheId by setting `swCacheId` in your `package.json` to your desired value.

Default: 'parcel-plugin-sw-precache'

### License

MIT
