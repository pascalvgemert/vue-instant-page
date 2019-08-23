'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var prefetcher = document.createElement('link');
var isSupported = prefetcher.relList && prefetcher.relList.supports && prefetcher.relList.supports('prefetch');
var isDataSaverEnabled = navigator.connection && navigator.connection.saveData;

exports.default = {
    lastTouchTimestamp: undefined,
    mouseoverTimer: undefined,
    urlToPreload: undefined,

    finalOptions: {
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
        useWhitelist: false
    },

    /**
     * Install the plugin
     *
     * @param Vue
     * @param options
     */
    install: function install(Vue, options) {
        // If prefetch is not support or data saver is enabled, do not run this plugin at all.
        if (!isSupported || isDataSaverEnabled) {
            return;
        }

        // Update final options / settings
        this.finalOptions = Object.assign(this.finalOptions, options);

        this.buildPrefetcher();
        this.initializeEventListeners();
    },


    /**
     * Build the prefetcher node
     */
    buildPrefetcher: function buildPrefetcher() {
        prefetcher.rel = 'prefetch';

        // Append prefetcher to head of the document
        document.head.appendChild(prefetcher);
    },


    /**
     * Set event listeners based on options
     */
    initializeEventListeners: function initializeEventListeners() {
        var eventListenersOptions = {
            capture: true,
            passive: true
        };

        if (!this.finalOptions.useMousedownOnly) {
            document.addEventListener('touchstart', this.touchstartListener.bind(this), eventListenersOptions);
        }

        if (!this.finalOptions.useMousedown) {
            document.addEventListener('mouseover', this.mouseoverListener.bind(this), eventListenersOptions);
        } else {
            document.addEventListener('mousedown', this.mousedownListener.bind(this), eventListenersOptions);
        }
    },


    /**
     * Touch start event listener method
     *
     * @param event
     */
    touchstartListener: function touchstartListener(event) {
        /* Chrome on Android calls mouseover before touchcancel so `lastTouchTimestamp`
         * must be assigned on touchstart to be measured on mouseover. */
        this.lastTouchTimestamp = performance.now();

        var linkElement = event.target.closest('a');

        if (!this.isPreloadable(linkElement)) {
            return;
        }

        linkElement.addEventListener('touchcancel', this.touchendAndTouchcancelListener.bind(this), { passive: true });
        linkElement.addEventListener('touchend', this.touchendAndTouchcancelListener.bind(this), { passive: true });

        this.urlToPreload = linkElement.href;

        this.preload(linkElement.href);
    },


    /**
     * Stop preloading when touch ends or is cancelled
     */
    touchendAndTouchcancelListener: function touchendAndTouchcancelListener() {
        this.urlToPreload = undefined;

        this.stopPreloading();
    },


    /**
     * Start measuring the mouseover on an element's a tag.
     *
     * @param event
     */
    mouseoverListener: function mouseoverListener(event) {
        var _this = this;

        // Not sure what this does though
        if (performance.now() - this.lastTouchTimestamp < 1100) {
            return;
        }

        var linkElement = event.target.closest('a');

        if (!this.isPreloadable(linkElement)) {
            return;
        }

        linkElement.addEventListener('mouseout', this.mouseoutListener.bind(this), { passive: true });

        this.urlToPreload = linkElement.href;

        this.mouseoverTimer = setTimeout(function () {
            _this.preload(linkElement.href);

            _this.mouseoverTimer = undefined;
        }, this.finalOptions.delayOnHover);
    },


    /**
     * Mouse down event is trigger, so start preloading the element's a tag.
     *
     * @param event
     */
    mousedownListener: function mousedownListener(event) {
        var linkElement = event.target.closest('a');

        if (!this.isPreloadable(linkElement)) {
            return;
        }

        linkElement.addEventListener('mouseout', this.mouseoutListener.bind(this), { passive: true });

        this.urlToPreload = linkElement.href;

        this.preload(linkElement.href);
    },


    /**
     * The mouse over event is being cancelled, stop preloading at once.
     *
     * @param event
     */
    mouseoutListener: function mouseoutListener(event) {
        if (event.relatedTarget && event.target.closest('a') === event.relatedTarget.closest('a')) {
            return;
        }

        if (this.mouseoverTimer) {
            clearTimeout(this.mouseoverTimer);

            this.mouseoverTimer = undefined;
        }

        this.urlToPreload = undefined;

        this.stopPreloading();
    },


    /**
     * Check if the given link element is up for preloading
     *
     * @param linkElement
     * @returns {boolean}
     */
    isPreloadable: function isPreloadable(linkElement) {
        // No element with href is found to preload
        if (!linkElement || !linkElement.href) {
            return false;
        }

        // Do not preload the current page
        if (this.urlToPreload === linkElement.href) {
            return false;
        }

        // When use whitelist is set to true, only load elements which contain the data-instant attribute
        if (this.useWhitelist && !('instant' in linkElement.dataset)) {
            return false;
        }

        // When query strings are not allow, return false unless the link element contains the data-instant attribute
        if (!this.allowExternalLinks && linkElement.origin !== location.origin && !('instant' in linkElement.dataset)) {
            return false;
        }

        // Only preload links when protocol / scheme is present
        if (!['http:', 'https:'].includes(linkElement.protocol)) {
            return false;
        }

        // Do not preload insecure link from secure website
        if (linkElement.protocol === 'http:' && location.protocol === 'https:') {
            return false;
        }

        // When query strings are not allow, return false unless the link element contains the data-instant attribute
        if (!this.allowQueryString && linkElement.search && !('instant' in linkElement.dataset)) {
            return false;
        }

        // Skip hash changes
        if (linkElement.hash && linkElement.pathname + linkElement.search === location.pathname + location.search) {
            return false;
        }

        // If data-noInstant attribute is found for a linkelement, do not preload
        if ('noInstant' in linkElement.dataset) {
            return false;
        }

        return true;
    },


    /**
     * Start the preloading by adding the href attribute to the prefetch node
     */
    preload: function preload(url) {
        prefetcher.href = url;
    },


    /**
     * Stop the preloading by removing the href attribute from the prefetch node
     */
    stopPreloading: function stopPreloading() {
        prefetcher.removeAttribute('href');
    }
};
//# sourceMappingURL=vue-instant-page.js.map