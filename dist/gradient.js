(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

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

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    /*! Fast Average Color | © 2020 Denis Seleznev | MIT License | https://github.com/fast-average-color/fast-average-color */
    function isIgnoredColor(arr, num, ignoredColor) {
        for (let i = 0; i < ignoredColor.length; i++) {
            const item = ignoredColor[i];
            if (arr[num] === item[0] && // red
                arr[num + 1] === item[1] && // green
                arr[num + 2] === item[2] && // blue
                arr[num + 3] === item[3] // alpha
            ) {
                return true;
            }
        }

        return false;
    }

    function dominantAlgorithm(arr, len, options) {
        const colorHash = {};
        const divider = 24;
        const ignoredColor = options.ignoredColor;

        for (let i = 0; i < len; i += options.step) {
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
        }

        const buffer = Object.keys(colorHash)
            .map(key => colorHash[key])
            .sort((a, b) => {
                const countA = a[4];
                const countB = b[4];

                return countA > countB ?  -1 : countA === countB ? 0 : 1;
            });

        const max = buffer[0];

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

        for (let i = 0; i < len; i += options.step) {
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

        for (let i = 0; i < len; i += options.step) {
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

    const ERROR_PREFIX = 'FastAverageColor: ';

    class FastAverageColor {
        /**
         * Get asynchronously the average color from not loaded image.
         *
         * @param {HTMLImageElement | string | null} resource
         * @param {FastAverageColorOptions} [options]
         *
         * @returns {Promise<FastAverageColorOptions>}
         */
        getColorAsync(resource, options) {
            if (!resource) {
                return Promise.reject(Error(`${ERROR_PREFIX}call .getColorAsync() without resource.`));
            }

            if (typeof resource === 'string') {
                const img = new Image();
                img.crossOrigin = '';
                img.src = resource;
                return this._bindImageEvents(img, options);
            } else if (resource.complete) {
                const result = this.getColor(resource, options);
                return result.error ? Promise.reject(result.error) : Promise.resolve(result);
            } else {
                return this._bindImageEvents(resource, options);
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

            const defaultColor = this._getDefaultColor(options);

            if (!resource) {
                this._outputError(options, 'call .getColor(null) without resource.');

                return this.prepareResult(defaultColor);
            }

            const originalSize = this._getOriginalSize(resource);
            const size = this._prepareSizeAndPosition(originalSize, options);

            if (!size.srcWidth || !size.srcHeight || !size.destWidth || !size.destHeight) {
                this._outputError(options, `incorrect sizes for resource "${resource.src}".`);

                return this.prepareResult(defaultColor);
            }

            if (!this._ctx) {
                this._canvas = this._makeCanvas();
                this._ctx = this._canvas.getContext && this._canvas.getContext('2d');

                if (!this._ctx) {
                    this._outputError(options, 'Canvas Context 2D is not supported in this browser.');

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
                this._outputError(options, `security error (CORS) for resource ${resource.src}.\nDetails: https://developer.mozilla.org/en/docs/Web/HTML/CORS_enabled_image`, e);
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
            const defaultColor = this._getDefaultColor(options);

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
                    throw Error(`${ERROR_PREFIX}${options.algorithm} is unknown algorithm.`);
            }

            return algorithm(arr, len, {
                defaultColor,
                ignoredColor: this._prepareIgnoredColor(options.ignoredColor),
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
            const isDark = this._isDark(value);

            return {
                value,
                rgb: 'rgb(' + rgb.join(',') + ')',
                rgba: 'rgba(' + rgba.join(',') + ')',
                hex: this._arrayToHex(rgb),
                hexa: this._arrayToHex(value),
                isDark,
                isLight: !isDark
            };
        }

        _prepareIgnoredColor(color) {
            return Array.isArray(color) && !Array.isArray(color[0]) ?
                [[].concat(color)] :
                color;
        }

        /**
         * Destroy the instance.
         */
        destroy() {
            delete this._canvas;
            delete this._ctx;
        }

        _getDefaultColor(options) {
            return this._getOption(options, 'defaultColor', [0, 0, 0, 0]);
        }

        _getOption(options, name, defaultValue) {
            return typeof options[name] === 'undefined' ? defaultValue : options[name];
        }

        _prepareSizeAndPosition(originalSize, options) {
            const srcLeft = this._getOption(options, 'left', 0);
            const srcTop = this._getOption(options, 'top', 0);
            const srcWidth = this._getOption(options, 'width', originalSize.width);
            const srcHeight = this._getOption(options, 'height', originalSize.height);

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

            const maxSize = 100;
            const minSize = 10;

            let factor;

            if (srcWidth > srcHeight) {
                factor = srcWidth / srcHeight;
                destWidth = maxSize;
                destHeight = Math.round(destWidth / factor);
            } else {
                factor = srcHeight / srcWidth;
                destHeight = maxSize;
                destWidth = Math.round(destHeight / factor);
            }

            if (
                destWidth > srcWidth || destHeight > srcHeight ||
                destWidth < minSize || destHeight < minSize
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

                    reject(Error(`${ERROR_PREFIX}Error loading image ${resource.src}.`));
                };

                const onabort = () => {
                    unbindEvents();

                    reject(Error(`${ERROR_PREFIX}Image "${resource.src}" loading aborted.`));
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

        _getOriginalSize(resource) {
            if (resource instanceof HTMLImageElement) {
                return {
                    width: resource.naturalWidth,
                    height: resource.naturalHeight
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

        _toHex(num) {
            const str = num.toString(16);

            return str.length === 1 ? '0' + str : str;
        }

        _arrayToHex(arr) {
            return '#' + arr.map(this._toHex).join('');
        }

        _isDark(color) {
            // http://www.w3.org/TR/AERT#color-contrast
            const result = (color[0] * 299 + color[1] * 587 + color[2] * 114) / 1000;

            return result < 128;
        }

        _makeCanvas() {
            return typeof window === 'undefined' ?
                new OffscreenCanvas(1, 1) :
                document.createElement('canvas');
        }

        _outputError(options, error, details) {
            if (!options.silent) {
                console.error(`${ERROR_PREFIX}${error}`);

                if (details) {
                    console.error(details);
                }
            }
        }
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

    var fac = new FastAverageColor();
    window.addEventListener('load', function () {
        Array.from(document.querySelectorAll('.item')).forEach(function (item) {
            var image = item.querySelector('img');
            var isBottom = item.classList.contains('item_bottom');
            var gradient = item.querySelector('.item__gradient');
            var height = image.naturalHeight;
            var size = 50;
            var color = fac.getColor(image, isBottom ?
                { top: height - size, height: size } :
                { height: size });
            var colorEnd = __spreadArrays(color.value.slice(0, 3), [0]).join(',');
            item.style.background = color.rgb;
            item.style.color = color.isDark ? 'white' : 'black';
            if (isBottom) {
                gradient.style.background = "linear-gradient(to bottom, rgba(" + colorEnd + ") 0%, " + color.rgba + " 100%)";
            }
            else {
                gradient.style.background = "linear-gradient(to top, rgba(" + colorEnd + ") 0%, " + color.rgba + " 100%)";
            }
        });
    }, false);

})));
