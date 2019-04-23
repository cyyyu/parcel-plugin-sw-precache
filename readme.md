# parcel-plugin-sw-precache

[![npm version](https://badge.fury.io/js/parcel-plugin-sw-precache.svg)](https://badge.fury.io/js/parcel-plugin-sw-precache)

A Parcel plugin for generating a service worker that precaches resources.

### Usage(Install)

`npm install --save-dev parcel-plugin-sw-precache`

### Configurations

You DON'T have to configure anything to get it work. It just works as you expected after you installed.

Every time you build resources with Parcel, it will generate a `service-worker.js` file for you.

Internally it is using [sw-precache](https://github.com/GoogleChromeLabs/sw-precache)

If you want to configure `sw-precache`, you can supply the configs by adding them in your `package.json` within the key `sw-precache`. See all available options at: https://github.com/GoogleChromeLabs/sw-precache#options-parameter

Additionally this plugin have the option "**additionalCodeFile**" if you want to add anything to your service-worker.js (for example a new event-handler). Add a filename relative to the entrypoint specified to Parcel.

For example:

```
{
  "name": "my-project",
  "version": "0.1.0",
  ...

  // my sw-precache configs
  "sw-precache": {
    "maximumFileSizeToCacheInBytes": 10485760,
    "additionalCodeFile": "addSome.js"
  }
}
```

### License

MIT
