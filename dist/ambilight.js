(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    var hasDocument = typeof document !== 'undefined';
    var hasWindow = typeof window !== 'undefined';
    var hasNavigator = typeof navigator != 'undefined';
    var hasScreen = typeof screen != 'undefined';
    function getCharset() {
        return hasDocument && typeof document.charset === 'string' ?
            document.charset.toLowerCase() :
            '';
    }
    function getPageUrl() {
        return hasWindow && window.location ? window.location.href : '';
    }
    function getReferrer() {
        return hasDocument ? document.referrer : '';
    }
    function getTitle() {
        return hasDocument ? document.title : '';
    }
    function cookieEnabled() {
        return hasNavigator ? navigator.cookieEnabled : false;
    }
    function getScreenSize() {
        return hasScreen ? [
            screen.width,
            screen.height,
            screen.colorDepth
        ].join('x') : '';
    }
    function getClientSize() {
        return hasWindow ? [
            window.innerWidth,
            window.innerHeight
        ].join('x') : '';
    }

    function truncate(str, len) {
        return (str || '').slice(0, len);
    }

    function getRandom() {
        return Math.floor(Math.random() * (1 << 31 - 1));
    }

    function getSeconds() {
        return Math.round(Date.now() / 1000);
    }

    var MAX_TITLE_LEN = 512;
    function addParam(result, name, value) {
        if (value || value === 0) {
            result.push(name + ':' + (value === true ? '1' : value));
        }
    }
    function getBrowserInfo(params, title) {
        var result = [];
        if (params) {
            Object.keys(params).forEach(function (key) { return addParam(result, key, params[key]); });
        }
        addParam(result, 'rn', getRandom());
        addParam(result, 'c', cookieEnabled());
        addParam(result, 's', getScreenSize());
        addParam(result, 'w', getClientSize());
        addParam(result, 'en', getCharset());
        var time = getSeconds();
        addParam(result, 'et', time);
        addParam(result, 'st', time);
        addParam(result, 't', truncate(title, MAX_TITLE_LEN));
        return result.join(':');
    }

    function queryStringify(params) {
        return Object.keys(params)
            .filter(function (key) { return params[key] || params[key] === 0; })
            .map(function (key) { return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]); })
            .join('&');
    }
    var MAX_URL_LEN = 1024;
    function prepareUrl(url) {
        return truncate(url, MAX_URL_LEN);
    }

    function sendData(counterId, queryParams) {
        var url = 'https://mc.yandex.ru/watch/' + counterId + '?' + queryStringify(queryParams);
        var hasBeacon = typeof navigator !== 'undefined' && navigator.sendBeacon;
        if (!hasBeacon || !navigator.sendBeacon(url, ' ')) {
            if (typeof fetch !== 'undefined') {
                fetch(url, { credentials: 'include' });
            }
            else if (typeof Image !== 'undefined') {
                new Image().src = url;
            }
        }
    }

    function hitExt(params) {
        var browserInfo = params.browserInfo, counterId = params.counterId, pageParams = params.pageParams, userVars = params.userVars;
        var data = {
            'browser-info': getBrowserInfo(browserInfo, pageParams.title),
            rn: getRandom(),
            ut: pageParams.ut
        };
        if (pageParams.url) {
            data['page-url'] = prepareUrl(pageParams.url);
        }
        if (pageParams.referrer) {
            data['page-ref'] = prepareUrl(pageParams.referrer);
        }
        if (userVars) {
            data['site-info'] = JSON.stringify(userVars);
        }
        sendData(counterId, data);
    }
    /**
     * Отправка хита.
     *
     * @param counterId - Номер счётчика.
     * @param hitParams -  Параметры страницы.
     * @param userVars - Параметры визитов.
     *
     * @example
     * hit('123456');
     *
     * hit('123456', {
     *     referer: document.referer,
     *     title: document.title,
     *     url: window.location.href
     * }, {
     *     myParam: 'value'
     * });
     */
    function hit(counterId, hitParams, userVars) {
        var referrer = hitParams && hitParams.referrer !== undefined ?
            hitParams.referrer :
            getReferrer();
        var title = hitParams && hitParams.title !== undefined ?
            hitParams.title :
            getTitle();
        var url = hitParams && hitParams.url !== undefined ?
            hitParams.url :
            getPageUrl();
        hitExt({
            browserInfo: { pv: true, ar: true },
            counterId: counterId,
            pageParams: {
                referrer: referrer,
                title: title,
                url: url
            },
            userVars: userVars
        });
    }

    window.addEventListener('load', function () {
        var pages = [
            'background',
            'gradient',
            'gradient_stripes',
            'border',
            'gallery',
            'box-shadow',
            'box-shadow-4-sides',
            'ambilight',
            'text-photo',
            'canvas',
            'define'
        ];
        var prev = pages[pages.length - 1];
        var next = pages[1];
        pages.some(function (item, i) {
            prev = pages[i - 1] || pages[pages.length - 1];
            next = pages[i + 1] || pages[0];
            return location.pathname.search('/' + item + '\\.') > -1;
        });
        var nav = document.createElement('div');
        nav.innerHTML = '<div class="nav">\
        <a href="https://github.com/hcodes/fast-average-color" class="button back">🏠</a>\
        <a href="./' + prev + '.html" class="button prev">◀</a>\
        <a href="./' + next + '.html" class="button next">▶</a>\
        </div>';
        document.body.appendChild(nav);
        hit('49603183');
    }, false);

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /*! Fast Average Color | © 2021 Denis Seleznev | MIT License | https://github.com/fast-average-color/fast-average-color */
    function toHex(num) {
        const str = num.toString(16);

        return str.length === 1 ? '0' + str : str;
    }

    function arrayToHex(arr) {
        return '#' + arr.map(toHex).join('');
    }

    function isDark(color) {
        // http://www.w3.org/TR/AERT#color-contrast
        const result = (color[0] * 299 + color[1] * 587 + color[2] * 114) / 1000;

        return result < 128;
    }

    function prepareIgnoredColor(color) {
        if (!color) { return color; }

        if (Array.isArray(color)) {
            return typeof color[0] === 'number' ? [color.slice()] : color;
        }

        return [color];
    }

    function isIgnoredColor(data, index, ignoredColor) {
        for (let i = 0; i < ignoredColor.length; i++) {
            if (isIgnoredColorAsNumbers(data, index, ignoredColor[i])) {
                return true;
            }
        }

        return false;
    }

    function isIgnoredColorAsNumbers(data, index, ignoredColor) {
        switch (ignoredColor.length) {
            case 3:
                // [red, green, blue]
                if (isIgnoredRGBColor(data, index, ignoredColor)) {
                    return true;
                }

                break;
            case 4:
                // [red, green, blue, alpha]
                if (isIgnoredRGBAColor(data, index, ignoredColor)) {
                    return true;
                }

                break;
            case 5:
                // [red, green, blue, alpha, threshold]
                if (isIgnoredRGBAColorWithThreshold(data, index, ignoredColor)) {
                    return true;
                }

                break;
            default:
                return false;
        }
    }

    function isIgnoredRGBColor(data, index, ignoredColor) {
        // Ignore if the pixel are transparent.
        if (data[index + 3] !== 255) {
            return true;
        }

        if (data[index] === ignoredColor[0] &&
            data[index + 1] === ignoredColor[1] &&
            data[index + 2] === ignoredColor[2]
        ) {
            return true;
        }

        return false;
    }

    function isIgnoredRGBAColor(data, index, ignoredColor) {
        if (data[index + 3] && ignoredColor[3]) {
            return data[index] === ignoredColor[0] &&
                data[index + 1] === ignoredColor[1] &&
                data[index + 2] === ignoredColor[2] &&
                data[index + 3] === ignoredColor[3];
        }

        // Ignore rgb components if the pixel are fully transparent.
        return data[index + 3] === ignoredColor[3];
    }

    function inRange(colorComponent, ignoredColorComponent, value) {
        return colorComponent >= (ignoredColorComponent - value) &&
            colorComponent <= (ignoredColorComponent + value);
    }

    function isIgnoredRGBAColorWithThreshold(data, index, ignoredColor) {
        const redIgnored = ignoredColor[0];
        const greenIgnored = ignoredColor[1];
        const blueIgnored = ignoredColor[2];
        const alphaIgnored = ignoredColor[3];
        const threshold = ignoredColor[4];
        const alphaData = data[index + 3];

        const alphaInRange = inRange(alphaData, alphaIgnored, threshold);
        if (!alphaIgnored) {
            return alphaInRange;
        }

        if (!alphaData && alphaInRange) {
            return true;
        }

        if (inRange(data[index], redIgnored, threshold) &&
            inRange(data[index + 1], greenIgnored, threshold) &&
            inRange(data[index + 2], blueIgnored, threshold) &&
            alphaInRange
        ) {
            return true;
        }

        return false;
    }

    function dominantAlgorithm(arr, len, options) {
        const colorHash = {};
        const divider = 24;
        const ignoredColor = options.ignoredColor;
        const step = options.step;
        let max = [0, 0, 0, 0, 0];
        
        for (let i = 0; i < len; i += step) {
            const red = arr[i];
            const green = arr[i + 1];
            const blue = arr[i + 2];
            const alpha = arr[i + 3];

            if (ignoredColor && isIgnoredColor(arr, i, ignoredColor)) {
                continue;
            }

            const key = Math.round(red / divider) + ',' +
                    Math.round(green / divider) + ',' +
                    Math.round(blue / divider);

            if (colorHash[key]) {
                colorHash[key] = [
                    colorHash[key][0] + red * alpha,
                    colorHash[key][1] + green * alpha,
                    colorHash[key][2] + blue * alpha,
                    colorHash[key][3] + alpha,
                    colorHash[key][4] + 1
                ];
            } else {
                colorHash[key] = [red * alpha, green * alpha, blue * alpha, alpha, 1];
            }
            
            if (max[4] < colorHash[key][4]) {
                max = colorHash[key];
            }
        }

        const redTotal = max[0];
        const greenTotal = max[1];
        const blueTotal = max[2];

        const alphaTotal = max[3];
        const count = max[4];

        return alphaTotal ? [
            Math.round(redTotal / alphaTotal),
            Math.round(greenTotal / alphaTotal),
            Math.round(blueTotal / alphaTotal),
            Math.round(alphaTotal / count)
        ] : options.defaultColor;
    }

    function simpleAlgorithm(arr, len, options) {
        let redTotal = 0;
        let greenTotal = 0;
        let blueTotal = 0;
        let alphaTotal = 0;
        let count = 0;

        const ignoredColor = options.ignoredColor;
        const step = options.step;

        for (let i = 0; i < len; i += step) {
            const alpha = arr[i + 3];
            const red = arr[i] * alpha;
            const green = arr[i + 1] * alpha;
            const blue = arr[i + 2] * alpha;

            if (ignoredColor && isIgnoredColor(arr, i, ignoredColor)) {
                continue;
            }

            redTotal += red;
            greenTotal += green;
            blueTotal += blue;
            alphaTotal += alpha;

            count++;
        }

        return alphaTotal ? [
            Math.round(redTotal / alphaTotal),
            Math.round(greenTotal / alphaTotal),
            Math.round(blueTotal / alphaTotal),
            Math.round(alphaTotal / count)
        ] : options.defaultColor;
    }

    function sqrtAlgorithm(arr, len, options) {
        let redTotal = 0;
        let greenTotal = 0;
        let blueTotal = 0;
        let alphaTotal = 0;
        let count = 0;

        const ignoredColor = options.ignoredColor;
        const step = options.step;

        for (let i = 0; i < len; i += step) {
            const red = arr[i];
            const green = arr[i + 1];
            const blue = arr[i + 2];
            const alpha = arr[i + 3];

            if (ignoredColor && isIgnoredColor(arr, i, ignoredColor)) {
                continue;
            }

            redTotal += red * red * alpha;
            greenTotal += green * green * alpha;
            blueTotal += blue * blue * alpha;
            alphaTotal += alpha;

            count++;
        }

        return alphaTotal ? [
            Math.round(Math.sqrt(redTotal / alphaTotal)),
            Math.round(Math.sqrt(greenTotal / alphaTotal)),
            Math.round(Math.sqrt(blueTotal / alphaTotal)),
            Math.round(alphaTotal / count)
        ] : options.defaultColor;
    }

    function getDefaultColor(options) {
        return getOption(options, 'defaultColor', [0, 0, 0, 0]);
    }

    function getOption(options, name, defaultValue) {
        return typeof options[name] === 'undefined' ? defaultValue : options[name];
    }

    const MIN_SIZE = 10;
    const MAX_SIZE = 100;

    function isSvg(filename) {
        return filename.search(/\.svg(\?|$)/i) !== -1;
    }

    function getOriginalSize(resource) {
        if (resource instanceof HTMLImageElement) {
            let width = resource.naturalWidth;
            let height = resource.naturalHeight;

            // For SVG images with only viewBox attr.
            if (!resource.naturalWidth && isSvg(resource.src)) {
                width = height = MAX_SIZE;
            }

            return {
                width,
                height,
            };
        }

        if (resource instanceof HTMLVideoElement) {
            return {
                width: resource.videoWidth,
                height: resource.videoHeight
            };
        }

        return {
            width: resource.width,
            height: resource.height
        };
    }

    function prepareSizeAndPosition(originalSize, options) {
        const srcLeft = getOption(options, 'left', 0);
        const srcTop = getOption(options, 'top', 0);
        const srcWidth = getOption(options, 'width', originalSize.width);
        const srcHeight = getOption(options, 'height', originalSize.height);

        let destWidth = srcWidth;
        let destHeight = srcHeight;

        if (options.mode === 'precision') {
            return {
                srcLeft,
                srcTop,
                srcWidth,
                srcHeight,
                destWidth,
                destHeight
            };
        }

        let factor;

        if (srcWidth > srcHeight) {
            factor = srcWidth / srcHeight;
            destWidth = MAX_SIZE;
            destHeight = Math.round(destWidth / factor);
        } else {
            factor = srcHeight / srcWidth;
            destHeight = MAX_SIZE;
            destWidth = Math.round(destHeight / factor);
        }

        if (
            destWidth > srcWidth || destHeight > srcHeight ||
            destWidth < MIN_SIZE || destHeight < MIN_SIZE
        ) {
            destWidth = srcWidth;
            destHeight = srcHeight;
        }

        return {
            srcLeft,
            srcTop,
            srcWidth,
            srcHeight,
            destWidth,
            destHeight
        };
    }

    function makeCanvas() {
        return typeof window === 'undefined' ?
            new OffscreenCanvas(1, 1) :
            document.createElement('canvas');
    }

    const ERROR_PREFIX = 'FastAverageColor: ';

    function outputError(options, text, details) {
        if (!options.silent) {
            console.error(ERROR_PREFIX + text);

            if (details) {
                console.error(details);
            }
        }
    }

    function getError(text) {
        return Error(ERROR_PREFIX + text);
    }

    class FastAverageColor {
        /**
         * Get asynchronously the average color from not loaded image.
         *
         * @param {string | HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | null} resource
         * @param {FastAverageColorOptions} [options]
         *
         * @returns {Promise<FastAverageColorOptions>}
         */
        getColorAsync(resource, options) {
            if (!resource) {
                return Promise.reject(getError('call .getColorAsync() without resource.'));
            }

            if (typeof resource === 'string') {
                const img = new Image();
                img.crossOrigin = '';
                img.src = resource;

                return this._bindImageEvents(img, options);
            } else if (resource instanceof Image && !resource.complete) {
                return this._bindImageEvents(resource, options);
            } else {
                const result = this.getColor(resource, options);

                return result.error ? Promise.reject(result.error) : Promise.resolve(result);
            }
        }

        /**
         * Get the average color from images, videos and canvas.
         *
         * @param {HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | null} resource
         * @param {FastAverageColorOptions} [options]
         *
         * @returns {FastAverageColorResult}
         */
        getColor(resource, options) {
            options = options || {};

            const defaultColor = getDefaultColor(options);

            if (!resource) {
                outputError(options, 'call .getColor(null) without resource.');

                return this.prepareResult(defaultColor);
            }

            const originalSize = getOriginalSize(resource);
            const size = prepareSizeAndPosition(originalSize, options);

            if (!size.srcWidth || !size.srcHeight || !size.destWidth || !size.destHeight) {
                outputError(options, `incorrect sizes for resource "${resource.src}".`);

                return this.prepareResult(defaultColor);
            }

            if (!this._ctx) {
                this._canvas = makeCanvas();
                this._ctx = this._canvas.getContext && this._canvas.getContext('2d');

                if (!this._ctx) {
                    outputError(options, 'Canvas Context 2D is not supported in this browser.');

                    return this.prepareResult(defaultColor);
                }
            }

            this._canvas.width = size.destWidth;
            this._canvas.height = size.destHeight;

            let value = defaultColor;

            try {
                this._ctx.clearRect(0, 0, size.destWidth, size.destHeight);
                this._ctx.drawImage(
                    resource,
                    size.srcLeft, size.srcTop,
                    size.srcWidth, size.srcHeight,
                    0, 0,
                    size.destWidth, size.destHeight
                );

                const bitmapData = this._ctx.getImageData(0, 0, size.destWidth, size.destHeight).data;
                value = this.getColorFromArray4(bitmapData, options);
            } catch (e) {
                outputError(options, `security error (CORS) for resource ${resource.src}.\nDetails: https://developer.mozilla.org/en/docs/Web/HTML/CORS_enabled_image`, e);
            }

            return this.prepareResult(value);
        }

        /**
         * Get the average color from a array when 1 pixel is 4 bytes.
         *
         * @param {number[]|Uint8Array|Uint8ClampedArray} arr
         * @param {Object} [options]
         * @param {string} [options.algorithm="sqrt"] "simple", "sqrt" or "dominant"
         * @param {number[]}  [options.defaultColor=[0, 0, 0, 0]] [red, green, blue, alpha]
         * @param {number[]}  [options.ignoredColor] [red, green, blue, alpha]
         * @param {number} [options.step=1]
         *
         * @returns {number[]} [red (0-255), green (0-255), blue (0-255), alpha (0-255)]
         */
        getColorFromArray4(arr, options) {
            options = options || {};

            const bytesPerPixel = 4;
            const arrLength = arr.length;
            const defaultColor = getDefaultColor(options);

            if (arrLength < bytesPerPixel) {
                return defaultColor;
            }

            const len = arrLength - arrLength % bytesPerPixel;
            const step = (options.step || 1) * bytesPerPixel;

            let algorithm;

            switch (options.algorithm || 'sqrt') {
                case 'simple':
                    algorithm = simpleAlgorithm;
                    break;
                case 'sqrt':
                    algorithm = sqrtAlgorithm;
                    break;
                case 'dominant':
                    algorithm = dominantAlgorithm;
                    break;
                default:
                    throw getError(`${options.algorithm} is unknown algorithm.`);
            }

            return algorithm(arr, len, {
                defaultColor,
                ignoredColor: prepareIgnoredColor(options.ignoredColor),
                step
            });
        }

        /**
         * Get color data from value ([r, g, b, a]).
         *
         * @param {number[]} value
         *
         * @returns {FastAverageColorResult}
         */
        prepareResult(value) {
            const rgb = value.slice(0, 3);
            const rgba = [].concat(rgb, value[3] / 255);
            const isDarkColor = isDark(value);

            return {
                value,
                rgb: 'rgb(' + rgb.join(',') + ')',
                rgba: 'rgba(' + rgba.join(',') + ')',
                hex: arrayToHex(rgb),
                hexa: arrayToHex(value),
                isDark: isDarkColor,
                isLight: !isDarkColor
            };
        }

        /**
         * Destroy the instance.
         */
        destroy() {
            delete this._canvas;
            delete this._ctx;
        }

        _bindImageEvents(resource, options) {
            return new Promise((resolve, reject) => {
                const onload = () => {
                    unbindEvents();

                    const result = this.getColor(resource, options);

                    if (result.error) {
                        reject(result.error);
                    } else {
                        resolve(result);
                    }
                };

                const onerror = () => {
                    unbindEvents();

                    reject(getError(`Error loading image "${resource.src}".`));
                };

                const onabort = () => {
                    unbindEvents();

                    reject(getError(`Image "${resource.src}" loading aborted.`));
                };

                const unbindEvents = () => {
                    resource.removeEventListener('load', onload);
                    resource.removeEventListener('error', onerror);
                    resource.removeEventListener('abort', onabort);
                };

                resource.addEventListener('load', onload);
                resource.addEventListener('error', onerror);
                resource.addEventListener('abort', onabort);
            });
        }
    }

    var AmbilightBase = /** @class */ (function () {
        function AmbilightBase(_video, _container, _options) {
        }
        return AmbilightBase;
    }());

    var fac$1 = new FastAverageColor();
    var Ambilight4Sides = /** @class */ (function (_super) {
        __extends(Ambilight4Sides, _super);
        function Ambilight4Sides(video, container, options) {
            var _this = _super.call(this, video, container, options) || this;
            _this.video = video;
            _this.container = container;
            _this.options = options;
            return _this;
        }
        Ambilight4Sides.prototype.destroy = function () {
            if (this.container) {
                this.container.style.boxShadow = 'none';
            }
            this.video = null;
            this.container = null;
        };
        Ambilight4Sides.prototype.onUpdate = function () {
            if (!this.video || !this.container) {
                return;
            }
            var width = this.video.videoWidth;
            var height = this.video.videoHeight;
            var size = this.options.size;
            var video = this.video;
            var colorTop = fac$1.getColor(video, {
                left: 0,
                top: 0,
                height: size,
                width: width
            });
            var colorRight = fac$1.getColor(video, {
                left: width - size,
                top: 0,
                width: size,
                height: height
            });
            var colorLeft = fac$1.getColor(video, {
                left: 0,
                top: 0,
                width: size,
                height: height
            });
            var colorBottom = fac$1.getColor(video, {
                left: 0,
                top: height - size,
                width: width,
                height: size
            });
            var radius = this.options.radius + 'px';
            var delta = this.options.delta + 'px';
            this.container.style.boxShadow = [
                "0 -" + delta + " " + radius + " " + colorTop.rgb,
                delta + " 0 " + radius + " " + colorRight.rgb,
                "0 " + delta + " " + radius + " " + colorBottom.rgb,
                "-" + delta + " 0 " + radius + " " + colorLeft.rgb
            ].join(', ');
        };
        return Ambilight4Sides;
    }(AmbilightBase));

    var ua = navigator.userAgent.toLowerCase();
    var isFirefox = ua.indexOf('firefox') > -1;
    var isSafari = (ua.search('safari') > -1 && ua.search('chrome') === -1);

    var fac = new FastAverageColor();
    var AmbilightManyPoints = /** @class */ (function (_super) {
        __extends(AmbilightManyPoints, _super);
        function AmbilightManyPoints(video, container, options) {
            var _this = _super.call(this, video, container, options) || this;
            _this.hasDoubleBlur = false;
            _this.topElems = [];
            _this.bottomElems = [];
            _this.leftElems = [];
            _this.rightElems = [];
            _this.video = video;
            _this.container = container;
            _this.options = options;
            _this.hasDoubleBlur = isFirefox || isSafari ? false : true;
            _this.createShadows();
            _this.updateShadows = _this.updateShadows.bind(_this);
            console.log('init plugin');
            return _this;
        }
        AmbilightManyPoints.prototype.destroy = function () {
            if (this.container) {
                for (var i = 0; i < this.topElems.length; i++) {
                    this.container.removeChild(this.topElems[i]);
                    this.container.removeChild(this.bottomElems[i]);
                }
                for (var i = 0; i < this.leftElems.length; i++) {
                    this.container.removeChild(this.leftElems[i]);
                    this.container.removeChild(this.rightElems[i]);
                }
            }
            this.video = null;
            this.container = null;
        };
        AmbilightManyPoints.prototype.createShadows = function () {
            var _a, _b, _c, _d, _e, _f;
            var _g = this.options, countByWidth = _g.countByWidth, countByHeight = _g.countByHeight;
            var width = ((_a = this.video) === null || _a === void 0 ? void 0 : _a.videoWidth) || 0;
            var height = ((_b = this.video) === null || _b === void 0 ? void 0 : _b.videoHeight) || 0;
            this.topElems = [];
            this.bottomElems = [];
            this.leftElems = [];
            this.rightElems = [];
            for (var i = 0; i < countByWidth; i++) {
                var size = width / countByWidth;
                var topElem = this.createShadow('top');
                var left = (i * size) + 'px';
                topElem.style.left = left;
                this.topElems.push(topElem);
                (_c = this.container) === null || _c === void 0 ? void 0 : _c.appendChild(topElem);
                var bottomElem = this.createShadow('bottom');
                bottomElem.style.left = left;
                this.bottomElems.push(bottomElem);
                (_d = this.container) === null || _d === void 0 ? void 0 : _d.appendChild(bottomElem);
            }
            for (var i = 0; i < countByHeight; i++) {
                var leftElem = this.createShadow('left');
                var size = height / countByHeight;
                var top_1 = (i * size) + 'px';
                leftElem.style.top = top_1;
                this.leftElems.push(leftElem);
                (_e = this.container) === null || _e === void 0 ? void 0 : _e.appendChild(leftElem);
                var rightElem = this.createShadow('right');
                rightElem.style.top = top_1;
                this.rightElems.push(rightElem);
                (_f = this.container) === null || _f === void 0 ? void 0 : _f.appendChild(rightElem);
            }
        };
        AmbilightManyPoints.prototype.createShadow = function (position) {
            var size = this.options.size;
            var elem = document.createElement('div');
            elem.className = 'video-shadow video-shadow_' + position;
            elem.style.width = size + "px";
            elem.style.height = size + "px";
            return elem;
        };
        AmbilightManyPoints.prototype.updateShadows = function () {
            var _a, _b;
            console.log('updateShadows plugin');
            var width = ((_a = this.video) === null || _a === void 0 ? void 0 : _a.videoWidth) || 0;
            var height = ((_b = this.video) === null || _b === void 0 ? void 0 : _b.videoHeight) || 0;
            var video = this.video;
            var _c = this.options, countByHeight = _c.countByHeight, countByWidth = _c.countByWidth;
            for (var i = 0; i < this.leftElems.length; i++) {
                var size = Math.floor(height / countByHeight);
                var leftColor = fac.getColor(video, {
                    left: 0,
                    top: size * i,
                    width: size,
                    height: size
                });
                var rightColor = fac.getColor(video, {
                    left: width - size,
                    top: size * i,
                    width: size,
                    height: size
                });
                var offset = size;
                var blur_1 = this.hasDoubleBlur ? size * 2 : size;
                this.leftElems[i].style.boxShadow = '-' + offset + 'px 0 ' + blur_1 + 'px ' + leftColor.rgb;
                this.rightElems[i].style.boxShadow = offset + 'px 0 ' + blur_1 + 'px ' + rightColor.rgb;
            }
            for (var i = 0; i < this.topElems.length; i++) {
                var size = Math.floor(width / countByWidth);
                var topColor = fac.getColor(video, {
                    left: size * i,
                    top: 0,
                    width: size,
                    height: size
                });
                var bottomColor = fac.getColor(video, {
                    left: size * i,
                    top: height - size,
                    width: size,
                    height: size
                });
                var offset = size;
                var blur_2 = this.hasDoubleBlur ? size * 2 : size;
                this.topElems[i].style.boxShadow = '0 -' + offset + 'px ' + blur_2 + 'px ' + topColor.rgb;
                this.bottomElems[i].style.boxShadow = '0 ' + offset + 'px ' + blur_2 + 'px ' + bottomColor.rgb;
            }
        };
        AmbilightManyPoints.prototype.onUpdate = function () {
            this.updateShadows();
        };
        return AmbilightManyPoints;
    }(AmbilightBase));

    var Ambilight = /** @class */ (function () {
        function Ambilight(video, container, options) {
            this.requestId = 0;
            this.types = [
                { name: 'ManyPoints', klass: AmbilightManyPoints, options: { countByWidth: 10, countByHeight: 5, size: 70 } },
                { name: '4Sides', klass: Ambilight4Sides, options: { radius: 200, delta: 200, size: 70 } },
            ];
            this.onPlay = this.onPlay.bind(this);
            this.onPause = this.onPause.bind(this);
            this.onUpdate = this.onUpdate.bind(this);
            this.video = video;
            this.video.addEventListener('play', this.onPlay.bind(this), false);
            this.video.addEventListener('pause', this.onPause, false);
            this.container = container;
            this.options = options || {};
            this.plugin = new this.types[0].klass(video, container, this.types[0].options);
            !video.paused && this.onPlay();
        }
        Ambilight.prototype.setType = function (name) {
            var _a;
            var plugin = this.types.find(function (item) { return item.name === name; });
            if (plugin && this.video && this.container) {
                (_a = this.plugin) === null || _a === void 0 ? void 0 : _a.destroy();
                this.plugin = new plugin.klass(this.video, this.container, plugin.options);
            }
        };
        Ambilight.prototype.onPlay = function () {
            var _a, _b;
            (_b = (_a = this.options).onPlay) === null || _b === void 0 ? void 0 : _b.call(_a);
            this.requestId = window.requestAnimationFrame(this.onUpdate);
        };
        Ambilight.prototype.onPause = function () {
            window.cancelAnimationFrame(this.requestId);
        };
        Ambilight.prototype.onUpdate = function () {
            var _a;
            (_a = this.plugin) === null || _a === void 0 ? void 0 : _a.onUpdate();
            this.requestId = window.requestAnimationFrame(this.onUpdate);
        };
        Ambilight.prototype.destroy = function () {
            if (this.plugin) {
                this.plugin.destroy();
                this.plugin = null;
            }
            if (this.video) {
                this.video.removeEventListener('play', this.onPlay, false);
                this.video.removeEventListener('pause', this.onPause, false);
            }
            window.cancelAnimationFrame(this.requestId);
        };
        return Ambilight;
    }());

    window.addEventListener('load', function () {
        var video = document.querySelector('video');
        var container = document.querySelector('.video-container');
        var ambi = new Ambilight(video, container, {
            onPlay: function () {
                var hint = document.querySelector('.hint');
                hint.style.display = 'none';
            },
        });
        var inputs = document.querySelectorAll('input[type="radio"]');
        inputs[location.hash === '#4Sides' ? 1 : 0].checked = true;
        inputs[0].onchange = inputs[1].onchange = function (event) {
            var target = event.target;
            ambi.setType(target.value);
            location.hash = target.value;
        };
    }, false);

})));
