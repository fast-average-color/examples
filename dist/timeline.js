(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

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

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    /*! Fast Average Color | © 2022 Denis Seleznev | MIT License | https://github.com/fast-average-color/fast-average-color */
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

    function dominantAlgorithm(arr, len, options) {
        var colorHash = {};
        var divider = 24;
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
        if (resource instanceof HTMLImageElement) {
            var width = resource.naturalWidth;
            var height = resource.naturalHeight;
            // For SVG images with only viewBox attr.
            if (!resource.naturalWidth && isSvg(resource.src)) {
                width = height = MAX_SIZE;
            }
            return {
                width: width,
                height: height,
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
    function getSrc(resource) {
        return resource instanceof HTMLCanvasElement ? 'canvas' : resource.src;
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
    function makeCanvas() {
        return typeof window === 'undefined' ?
            new OffscreenCanvas(1, 1) :
            document.createElement('canvas');
    }

    var ERROR_PREFIX = 'FastAverageColor: ';
    function outputError(message, silent, error) {
        if (!silent) {
            console.error(ERROR_PREFIX + message);
            if (error) {
                console.error(error);
            }
        }
    }
    function getError(text) {
        return Error(ERROR_PREFIX + text);
    }

    var FastAverageColor = /** @class */ (function () {
        function FastAverageColor() {
            this.canvas = null;
            this.ctx = null;
        }
        /**
         * Get asynchronously the average color from not loaded image.
         */
        FastAverageColor.prototype.getColorAsync = function (resource, options) {
            var _a;
            if (!resource) {
                return Promise.reject(getError('call .getColorAsync() without resource.'));
            }
            if (typeof resource === 'string') {
                var img = new Image();
                img.crossOrigin = (_a = options === null || options === void 0 ? void 0 : options.crossOrigin) !== null && _a !== void 0 ? _a : '';
                img.src = resource;
                return this.bindImageEvents(img, options);
            }
            else if (resource instanceof Image && !resource.complete) {
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
                outputError('call .getColor(null) without resource.', options.silent);
                return this.prepareResult(defaultColor);
            }
            var originalSize = getOriginalSize(resource);
            var size = prepareSizeAndPosition(originalSize, options);
            if (!size.srcWidth || !size.srcHeight || !size.destWidth || !size.destHeight) {
                outputError("incorrect sizes for resource \"".concat(getSrc(resource), "\"."), options.silent);
                return this.prepareResult(defaultColor);
            }
            if (!this.canvas) {
                this.canvas = makeCanvas();
            }
            if (!this.ctx) {
                this.ctx = this.canvas.getContext && this.canvas.getContext('2d');
                if (!this.ctx) {
                    outputError('Canvas Context 2D is not supported in this browser.', options.silent);
                    return this.prepareResult(defaultColor);
                }
            }
            this.canvas.width = size.destWidth;
            this.canvas.height = size.destHeight;
            var value = defaultColor;
            try {
                this.ctx.clearRect(0, 0, size.destWidth, size.destHeight);
                this.ctx.drawImage(resource, size.srcLeft, size.srcTop, size.srcWidth, size.srcHeight, 0, 0, size.destWidth, size.destHeight);
                var bitmapData = this.ctx.getImageData(0, 0, size.destWidth, size.destHeight).data;
                value = this.getColorFromArray4(bitmapData, options);
            }
            catch (e) {
                outputError("security error (CORS) for resource ".concat(getSrc(resource), ".\nDetails: https://developer.mozilla.org/en/docs/Web/HTML/CORS_enabled_image"), options.silent, e);
            }
            return this.prepareResult(value);
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
                    throw getError("".concat(options.algorithm, " is unknown algorithm."));
            }
            return algorithm(arr, len, {
                defaultColor: defaultColor,
                ignoredColor: prepareIgnoredColor(options.ignoredColor),
                step: step
            });
        };
        /**
         * Get color data from value ([r, g, b, a]).
         */
        FastAverageColor.prototype.prepareResult = function (value) {
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
                isLight: !isDarkColor
            };
        };
        /**
         * Destroy the instance.
         */
        FastAverageColor.prototype.destroy = function () {
            this.canvas = null;
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
                    reject(getError("Error loading image \"".concat(resource.src, "\".")));
                };
                var onabort = function () {
                    unbindEvents();
                    reject(getError("Image \"".concat(resource.src, "\" loading aborted.")));
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

    function leadZero(num) {
        return num > 9 ? num : '0' + num;
    }
    function secsToHMS(value) {
        var hours = Math.floor(value / 3600);
        var mins = Math.floor((value - hours * 3600) / 60);
        var secs = Math.floor(value - hours * 3600 - mins * 60);
        return [hours, leadZero(mins), leadZero(secs)].join(':');
    }

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

    var fac = new FastAverageColor();
    var STEP = 1; // sec.
    var TIMELINE_HEIGHT = 50;
    var ColorsOfMovies = /** @class */ (function () {
        function ColorsOfMovies() {
            var _this = this;
            this.currentSrc = '';
            this.originalDocumentTitle = document.title;
            this.handleCanPlay = function () {
                _this.getColorsFromMovie(_this.currentSrc);
                _this.video.removeEventListener('canplay', _this.handleCanPlay);
            };
            this.video = document.querySelector('video');
            this.averageTimeline = document.querySelector('.timeline_type_average .timeline__colors');
            // this.averageSqrtTimeline = document.querySelector('.timeline_type_average-sqrt .timeline__colors')!;
            this.dominantTimeline = document.querySelector('.timeline_type_dominant .timeline__colors');
            this.radialDemo = document.querySelector('.radial-demo');
            this.conicDemo = document.querySelector('.conic-demo');
            this.title = document.querySelector('.title');
            this.progress = document.querySelector('.progress');
            this.selectMovie = document.querySelector('.movies');
            this.selectMovie.addEventListener('change', function () {
                _this.currentSrc = _this.selectMovie.selectedOptions[0].value;
                _this.start(_this.currentSrc);
            });
            this.uploadFile = document.querySelector('.upload-file');
            var that = this;
            this.uploadFile.addEventListener('change', function () {
                var files = this.files;
                if (files) {
                    var file = files.item(0);
                    if (file) {
                        var src = URL.createObjectURL(file);
                        that.currentSrc = src;
                        that.start(src);
                    }
                }
            });
            this.start(this.selectMovie.selectedOptions[0].value);
        }
        ColorsOfMovies.prototype.start = function (src) {
            this.reset();
            if (src) {
                this.video.src = src;
                this.video.addEventListener('canplay', this.handleCanPlay);
            }
        };
        ColorsOfMovies.prototype.getColorsFromMovie = function (src) {
            return __awaiter(this, void 0, void 0, function () {
                var duration, startTime, data, width, i, averageColor, averageSqrtColor, dominantColor, percents;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            duration = this.video.duration;
                            startTime = Date.now();
                            data = {
                                step: STEP,
                                duration: duration,
                                count: 0,
                                averageColors: [],
                                averageSqrtColors: [],
                                dominantColors: [],
                                palette: [],
                            };
                            width = Math.ceil(duration / STEP);
                            this.averageTimeline.width = width;
                            this.averageTimeline.height = TIMELINE_HEIGHT;
                            this.dominantTimeline.width = width;
                            this.dominantTimeline.height = TIMELINE_HEIGHT;
                            i = 0;
                            _a.label = 1;
                        case 1:
                            if (!(i < duration)) return [3 /*break*/, 4];
                            this.video.currentTime = i;
                            return [4 /*yield*/, this.waitForSeek()];
                        case 2:
                            _a.sent();
                            if (src !== this.currentSrc) {
                                return [2 /*return*/];
                            }
                            averageColor = fac.getColor(this.video, { algorithm: 'simple' });
                            averageSqrtColor = fac.getColor(this.video, { algorithm: 'sqrt' });
                            dominantColor = fac.getColor(this.video, { algorithm: 'dominant' });
                            data.averageColors.push(averageColor.rgb);
                            data.averageSqrtColors.push(averageSqrtColor.rgb);
                            data.dominantColors.push(dominantColor.rgb);
                            this.addColor(this.averageTimeline, averageColor, i);
                            //this.addColor(averageSqrtTimeline, averageSqrtColor, i);
                            this.addColor(this.dominantTimeline, dominantColor, i);
                            percents = Math.floor(i / duration * 100) + '%';
                            this.progress.innerHTML = [
                                percents + ', step: ' + STEP + ' s',
                                secsToHMS(i) + '&thinsp;/&thinsp;' + secsToHMS(duration),
                                Math.floor((Date.now() - startTime) / 1000) + ' s'
                            ].join('<br/>');
                            document.title = this.originalDocumentTitle + ' — ' + percents;
                            this.radialDemo.style.background = 'radial-gradient(' + data.dominantColors.join(',') + ')';
                            this.conicDemo.style.background = 'conic-gradient(' + data.dominantColors.join(',') + ')';
                            _a.label = 3;
                        case 3:
                            i += STEP;
                            return [3 /*break*/, 1];
                        case 4:
                            this.title.style.background = 'linear-gradient(90deg,' + data.dominantColors.join(',') + ')';
                            this.title.style.backgroundClip = 'text';
                            this.progress.innerHTML = '';
                            document.title = this.originalDocumentTitle;
                            this.hideVideo();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ColorsOfMovies.prototype.reset = function () {
            document.title = this.originalDocumentTitle;
            this.radialDemo.style.background = '';
            this.conicDemo.style.background = '';
            this.title.style.background = '';
            this.resetCanvas(this.averageTimeline);
            this.resetCanvas(this.dominantTimeline);
            this.progress.innerHTML = '';
            this.video.removeEventListener('canplay', this.handleCanPlay);
            this.showVideo();
        };
        ColorsOfMovies.prototype.resetCanvas = function (canvas) {
            var ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };
        ColorsOfMovies.prototype.showVideo = function () {
            this.video.style.display = 'block';
        };
        ColorsOfMovies.prototype.hideVideo = function () {
            this.video.style.display = 'none';
        };
        ColorsOfMovies.prototype.addColor = function (canvas, color, x) {
            var ctx = canvas.getContext('2d');
            if (!ctx)
                return;
            ctx.moveTo(x, 0);
            ctx.fillStyle = color.rgba;
            ctx.lineWidth = 1;
            ctx.fillRect(x, 0, 1, TIMELINE_HEIGHT);
        };
        ColorsOfMovies.prototype.waitForSeek = function () {
            var _this = this;
            return new Promise(function (resolve) {
                _this.video.onseeked = function () {
                    _this.video.onseeked = null;
                    resolve();
                };
            });
        };
        return ColorsOfMovies;
    }());
    new ColorsOfMovies();

}));
