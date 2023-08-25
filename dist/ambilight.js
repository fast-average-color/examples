(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

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
                fetch(url, { credentials: 'include' }).catch(function () { });
            }
            else if (typeof Image !== 'undefined') {
                new Image().src = url;
            }
        }
    }

    function hitExt(hitExtParams) {
        var browserInfo = hitExtParams.browserInfo, counterId = hitExtParams.counterId, pageParams = hitExtParams.pageParams, params = hitExtParams.params;
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
        if (params) {
            data['site-info'] = JSON.stringify(params);
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
    function hit(counterId, hitParams, params) {
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
            params: params
        });
    }

    window.addEventListener('load', function () {
        var pages = [
            'background',
            'timeline',
            'gradient',
            'gradient_stripes',
            'border',
            'gallery',
            'gallery_vertical',
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

    /******************************************************************************
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
    /* global Reflect, Promise, SuppressedError, Symbol */

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

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    /*! Fast Average Color | © 2023 Denis Seleznev | MIT License | https://github.com/fast-average-color/fast-average-color */
    function toHex(num) {
        var str = num.toString(16);
        return str.length === 1 ? '0' + str : str;
    }
    function arrayToHex(arr) {
        return '#' + arr.map(toHex).join('');
    }
    function isDark(color) {
        // http://www.w3.org/TR/AERT#color-contrast
        var result = (color[0] * 299 + color[1] * 587 + color[2] * 114) / 1000;
        return result < 128;
    }
    function prepareIgnoredColor(color) {
        if (!color) {
            return [];
        }
        return isRGBArray(color) ? color : [color];
    }
    function isRGBArray(value) {
        return Array.isArray(value[0]);
    }
    function isIgnoredColor(data, index, ignoredColor) {
        for (var i = 0; i < ignoredColor.length; i++) {
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
            data[index + 2] === ignoredColor[2]) {
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
        var redIgnored = ignoredColor[0];
        var greenIgnored = ignoredColor[1];
        var blueIgnored = ignoredColor[2];
        var alphaIgnored = ignoredColor[3];
        var threshold = ignoredColor[4];
        var alphaData = data[index + 3];
        var alphaInRange = inRange(alphaData, alphaIgnored, threshold);
        if (!alphaIgnored) {
            return alphaInRange;
        }
        if (!alphaData && alphaInRange) {
            return true;
        }
        if (inRange(data[index], redIgnored, threshold) &&
            inRange(data[index + 1], greenIgnored, threshold) &&
            inRange(data[index + 2], blueIgnored, threshold) &&
            alphaInRange) {
            return true;
        }
        return false;
    }

    var DEFAULT_DOMINANT_DIVIDER = 24;
    function dominantAlgorithm(arr, len, options) {
        var colorHash = {};
        var divider = options.dominantDivider || DEFAULT_DOMINANT_DIVIDER;
        var ignoredColor = options.ignoredColor;
        var step = options.step;
        var max = [0, 0, 0, 0, 0];
        for (var i = 0; i < len; i += step) {
            var red = arr[i];
            var green = arr[i + 1];
            var blue = arr[i + 2];
            var alpha = arr[i + 3];
            if (ignoredColor && isIgnoredColor(arr, i, ignoredColor)) {
                continue;
            }
            var key = Math.round(red / divider) + ',' +
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
            }
            else {
                colorHash[key] = [red * alpha, green * alpha, blue * alpha, alpha, 1];
            }
            if (max[4] < colorHash[key][4]) {
                max = colorHash[key];
            }
        }
        var redTotal = max[0];
        var greenTotal = max[1];
        var blueTotal = max[2];
        var alphaTotal = max[3];
        var count = max[4];
        return alphaTotal ? [
            Math.round(redTotal / alphaTotal),
            Math.round(greenTotal / alphaTotal),
            Math.round(blueTotal / alphaTotal),
            Math.round(alphaTotal / count)
        ] : options.defaultColor;
    }

    function simpleAlgorithm(arr, len, options) {
        var redTotal = 0;
        var greenTotal = 0;
        var blueTotal = 0;
        var alphaTotal = 0;
        var count = 0;
        var ignoredColor = options.ignoredColor;
        var step = options.step;
        for (var i = 0; i < len; i += step) {
            var alpha = arr[i + 3];
            var red = arr[i] * alpha;
            var green = arr[i + 1] * alpha;
            var blue = arr[i + 2] * alpha;
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
        var redTotal = 0;
        var greenTotal = 0;
        var blueTotal = 0;
        var alphaTotal = 0;
        var count = 0;
        var ignoredColor = options.ignoredColor;
        var step = options.step;
        for (var i = 0; i < len; i += step) {
            var red = arr[i];
            var green = arr[i + 1];
            var blue = arr[i + 2];
            var alpha = arr[i + 3];
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
        return (options[name] === undefined ? defaultValue : options[name]);
    }

    var MIN_SIZE = 10;
    var MAX_SIZE = 100;
    function isSvg(filename) {
        return filename.search(/\.svg(\?|$)/i) !== -1;
    }
    function getOriginalSize(resource) {
        if (isInstanceOfHTMLImageElement(resource)) {
            var width = resource.naturalWidth;
            var height = resource.naturalHeight;
            // For SVG images with only viewBox attribute
            if (!resource.naturalWidth && isSvg(resource.src)) {
                width = height = MAX_SIZE;
            }
            return {
                width: width,
                height: height,
            };
        }
        if (isInstanceOfHTMLVideoElement(resource)) {
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
    function getSrc(resource) {
        if (isInstanceOfHTMLCanvasElement(resource)) {
            return 'canvas';
        }
        if (isInstanceOfOffscreenCanvas(resource)) {
            return 'offscreencanvas';
        }
        if (isInstanceOfImageBitmap(resource)) {
            return 'imagebitmap';
        }
        return resource.src;
    }
    function isInstanceOfHTMLImageElement(resource) {
        return typeof HTMLImageElement !== 'undefined' && resource instanceof HTMLImageElement;
    }
    var hasOffscreenCanvas = typeof OffscreenCanvas !== 'undefined';
    function isInstanceOfOffscreenCanvas(resource) {
        return hasOffscreenCanvas && resource instanceof OffscreenCanvas;
    }
    function isInstanceOfHTMLVideoElement(resource) {
        return typeof HTMLVideoElement !== 'undefined' && resource instanceof HTMLVideoElement;
    }
    function isInstanceOfHTMLCanvasElement(resource) {
        return typeof HTMLCanvasElement !== 'undefined' && resource instanceof HTMLCanvasElement;
    }
    function isInstanceOfImageBitmap(resource) {
        return typeof ImageBitmap !== 'undefined' && resource instanceof ImageBitmap;
    }
    function prepareSizeAndPosition(originalSize, options) {
        var srcLeft = getOption(options, 'left', 0);
        var srcTop = getOption(options, 'top', 0);
        var srcWidth = getOption(options, 'width', originalSize.width);
        var srcHeight = getOption(options, 'height', originalSize.height);
        var destWidth = srcWidth;
        var destHeight = srcHeight;
        if (options.mode === 'precision') {
            return {
                srcLeft: srcLeft,
                srcTop: srcTop,
                srcWidth: srcWidth,
                srcHeight: srcHeight,
                destWidth: destWidth,
                destHeight: destHeight
            };
        }
        var factor;
        if (srcWidth > srcHeight) {
            factor = srcWidth / srcHeight;
            destWidth = MAX_SIZE;
            destHeight = Math.round(destWidth / factor);
        }
        else {
            factor = srcHeight / srcWidth;
            destHeight = MAX_SIZE;
            destWidth = Math.round(destHeight / factor);
        }
        if (destWidth > srcWidth || destHeight > srcHeight ||
            destWidth < MIN_SIZE || destHeight < MIN_SIZE) {
            destWidth = srcWidth;
            destHeight = srcHeight;
        }
        return {
            srcLeft: srcLeft,
            srcTop: srcTop,
            srcWidth: srcWidth,
            srcHeight: srcHeight,
            destWidth: destWidth,
            destHeight: destHeight
        };
    }
    var isWebWorkers = typeof window === 'undefined';
    function makeCanvas() {
        if (isWebWorkers) {
            return hasOffscreenCanvas ? new OffscreenCanvas(1, 1) : null;
        }
        return document.createElement('canvas');
    }

    var ERROR_PREFIX = 'FastAverageColor: ';
    function getError(message) {
        return Error(ERROR_PREFIX + message);
    }
    function outputError(error, silent) {
        if (!silent) {
            console.error(error);
        }
    }

    var FastAverageColor = /** @class */ (function () {
        function FastAverageColor() {
            this.canvas = null;
            this.ctx = null;
        }
        FastAverageColor.prototype.getColorAsync = function (resource, options) {
            if (!resource) {
                return Promise.reject(getError('call .getColorAsync() without resource'));
            }
            if (typeof resource === 'string') {
                // Web workers
                if (typeof Image === 'undefined') {
                    return Promise.reject(getError('resource as string is not supported in this environment'));
                }
                var img = new Image();
                img.crossOrigin = options && options.crossOrigin || '';
                img.src = resource;
                return this.bindImageEvents(img, options);
            }
            else if (isInstanceOfHTMLImageElement(resource) && !resource.complete) {
                return this.bindImageEvents(resource, options);
            }
            else {
                var result = this.getColor(resource, options);
                return result.error ? Promise.reject(result.error) : Promise.resolve(result);
            }
        };
        /**
         * Get the average color from images, videos and canvas.
         */
        FastAverageColor.prototype.getColor = function (resource, options) {
            options = options || {};
            var defaultColor = getDefaultColor(options);
            if (!resource) {
                var error = getError('call .getColor() without resource');
                outputError(error, options.silent);
                return this.prepareResult(defaultColor, error);
            }
            var originalSize = getOriginalSize(resource);
            var size = prepareSizeAndPosition(originalSize, options);
            if (!size.srcWidth || !size.srcHeight || !size.destWidth || !size.destHeight) {
                var error = getError("incorrect sizes for resource \"".concat(getSrc(resource), "\""));
                outputError(error, options.silent);
                return this.prepareResult(defaultColor, error);
            }
            if (!this.canvas) {
                this.canvas = makeCanvas();
                if (!this.canvas) {
                    var error = getError('OffscreenCanvas is not supported in this browser');
                    outputError(error, options.silent);
                    return this.prepareResult(defaultColor, error);
                }
            }
            if (!this.ctx) {
                this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
                if (!this.ctx) {
                    var error = getError('Canvas Context 2D is not supported in this browser');
                    outputError(error, options.silent);
                    return this.prepareResult(defaultColor);
                }
                this.ctx.imageSmoothingEnabled = false;
            }
            this.canvas.width = size.destWidth;
            this.canvas.height = size.destHeight;
            try {
                this.ctx.clearRect(0, 0, size.destWidth, size.destHeight);
                this.ctx.drawImage(resource, size.srcLeft, size.srcTop, size.srcWidth, size.srcHeight, 0, 0, size.destWidth, size.destHeight);
                var bitmapData = this.ctx.getImageData(0, 0, size.destWidth, size.destHeight).data;
                return this.prepareResult(this.getColorFromArray4(bitmapData, options));
            }
            catch (originalError) {
                var error = getError("security error (CORS) for resource ".concat(getSrc(resource), ".\nDetails: https://developer.mozilla.org/en/docs/Web/HTML/CORS_enabled_image"));
                outputError(error, options.silent);
                !options.silent && console.error(originalError);
                return this.prepareResult(defaultColor, error);
            }
        };
        /**
         * Get the average color from a array when 1 pixel is 4 bytes.
         */
        FastAverageColor.prototype.getColorFromArray4 = function (arr, options) {
            options = options || {};
            var bytesPerPixel = 4;
            var arrLength = arr.length;
            var defaultColor = getDefaultColor(options);
            if (arrLength < bytesPerPixel) {
                return defaultColor;
            }
            var len = arrLength - arrLength % bytesPerPixel;
            var step = (options.step || 1) * bytesPerPixel;
            var algorithm;
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
                    throw getError("".concat(options.algorithm, " is unknown algorithm"));
            }
            return algorithm(arr, len, {
                defaultColor: defaultColor,
                ignoredColor: prepareIgnoredColor(options.ignoredColor),
                step: step,
                dominantDivider: options.dominantDivider,
            });
        };
        /**
         * Get color data from value ([r, g, b, a]).
         */
        FastAverageColor.prototype.prepareResult = function (value, error) {
            var rgb = value.slice(0, 3);
            var rgba = [value[0], value[1], value[2], value[3] / 255];
            var isDarkColor = isDark(value);
            return {
                value: [value[0], value[1], value[2], value[3]],
                rgb: 'rgb(' + rgb.join(',') + ')',
                rgba: 'rgba(' + rgba.join(',') + ')',
                hex: arrayToHex(rgb),
                hexa: arrayToHex(value),
                isDark: isDarkColor,
                isLight: !isDarkColor,
                error: error,
            };
        };
        /**
         * Destroy the instance.
         */
        FastAverageColor.prototype.destroy = function () {
            if (this.canvas) {
                this.canvas.width = 1;
                this.canvas.height = 1;
                this.canvas = null;
            }
            this.ctx = null;
        };
        FastAverageColor.prototype.bindImageEvents = function (resource, options) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var onload = function () {
                    unbindEvents();
                    var result = _this.getColor(resource, options);
                    if (result.error) {
                        reject(result.error);
                    }
                    else {
                        resolve(result);
                    }
                };
                var onerror = function () {
                    unbindEvents();
                    reject(getError("Error loading image \"".concat(resource.src, "\"")));
                };
                var onabort = function () {
                    unbindEvents();
                    reject(getError("Image \"".concat(resource.src, "\" loading aborted")));
                };
                var unbindEvents = function () {
                    resource.removeEventListener('load', onload);
                    resource.removeEventListener('error', onerror);
                    resource.removeEventListener('abort', onabort);
                };
                resource.addEventListener('load', onload);
                resource.addEventListener('error', onerror);
                resource.addEventListener('abort', onabort);
            });
        };
        return FastAverageColor;
    }());

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
                "0 -".concat(delta, " ").concat(radius, " ").concat(colorTop.rgb),
                "".concat(delta, " 0 ").concat(radius, " ").concat(colorRight.rgb),
                "0 ".concat(delta, " ").concat(radius, " ").concat(colorBottom.rgb),
                "-".concat(delta, " 0 ").concat(radius, " ").concat(colorLeft.rgb)
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
            elem.style.width = "".concat(size, "px");
            elem.style.height = "".concat(size, "px");
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
        video.muted = true;
        video.play();
        var inputs = document.querySelectorAll('input[type="radio"]');
        inputs[location.hash === '#4Sides' ? 1 : 0].checked = true;
        inputs[0].onchange = inputs[1].onchange = function (event) {
            var target = event.target;
            ambi.setType(target.value);
            location.hash = target.value;
        };
    }, false);

}));
