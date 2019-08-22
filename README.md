# vue-instant-page

Make your site’s pages instant with this Vue Plugin and improve your conversion rate.

This is the VueJS Plugin equivalent of the <https://instant.page/> script.

## Installation

Install through npm

``` bash
npm install vue-instant-page --save

```

Add the plugin to Vue in ```main.js/app.js```:

``` javascript
// Require dependencies
var Vue = require('vue');
var VueInstantPage = require('vue-instant-page');
// Tell Vue to use the plugin
Vue.use(VueInstantPage);

```

### Options

``` javascript

Vue.use(VueInstantPage, {
    /** Delay of mouse hover in milliseconds after when the prefetching can begin */
    delayOnHover: 65,

    /** Use mousedown as a prefetch trigger */
    useMousedown: false,

    /** Only use mousedown as a prefetch trigger, and disabled mouse hover */
    useMousedownOnly: false,

    /** All pages with a query string be preloaded when set to true */
    allowQueryString: false,

    /** External links aren’t preloaded by default, to allow them all set this variable to true */
    allowExternalLinks: false,

    /** Only preload specific links when use whitelist is set to true */
    useWhitelist: false,
});
```

## Big thanks to instant.page and (Alexandre Dieulot)[https://github.com/dieulot]
I converted the instant.page script into a VueJS Plugin.

To view the original JS source: <https://github.com/instantpage/instant.page>
To get more info about the code: <https://instant.page/>
