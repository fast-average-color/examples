(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

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
    function isInstanceOfOffscreenCanvas(resource) {
        return typeof OffscreenCanvas !== 'undefined' && resource instanceof OffscreenCanvas;
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
        return isWebWorkers ?
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
            if (!resource) {
                return Promise.reject(getError('call .getColorAsync() without resource.'));
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
                outputError('call .getColor(null) without resource', options.silent);
                return this.prepareResult(defaultColor);
            }
            var originalSize = getOriginalSize(resource);
            var size = prepareSizeAndPosition(originalSize, options);
            if (!size.srcWidth || !size.srcHeight || !size.destWidth || !size.destHeight) {
                outputError("incorrect sizes for resource \"".concat(getSrc(resource), "\""), options.silent);
                return this.prepareResult(defaultColor);
            }
            if (!this.canvas) {
                this.canvas = makeCanvas();
            }
            if (!this.ctx) {
                this.ctx = this.canvas.getContext && this.canvas.getContext('2d');
                if (!this.ctx) {
                    outputError('Canvas Context 2D is not supported in this browser', options.silent);
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
                    throw getError("".concat(options.algorithm, " is unknown algorithm"));
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
                    reject(getError("Error loading image \"".concat(resource.src, "\".")));
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
    var App = /** @class */ (function () {
        function App() {
            var _this = this;
            this.imageCounter = 0;
            var input = document.querySelector('.select-file');
            var captureButton = document.querySelector('.capture-photo');
            input.onchange = function (e) {
                var _a;
                var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
                var reader = new FileReader();
                reader.onloadend = function () {
                    var image = new Image();
                    image.src = reader.result;
                    _this.getColors(image).then(function (colors) {
                        _this.addImage(image, (file === null || file === void 0 ? void 0 : file.name) || '...', colors);
                    });
                };
                if (file) {
                    reader.readAsDataURL(file);
                }
            };
            captureButton.onclick = function () {
                _this.capture();
            };
        }
        App.prototype.setImageColor = function (elem, backgroundColor, isDark) {
            var container = elem.parentNode.parentNode;
            container.style.backgroundColor = backgroundColor;
            container.style.color = this.getTextColor(isDark);
        };
        App.prototype.getColors = function (image) {
            return Promise.all([
                fac.getColorAsync(image, { algorithm: 'simple', mode: 'precision' }),
                fac.getColorAsync(image, { algorithm: 'sqrt', mode: 'precision' }),
                fac.getColorAsync(image, { algorithm: 'dominant', mode: 'precision' })
            ]);
        };
        App.prototype.addImage = function (resource, name, colors) {
            var images = document.querySelector('.images');
            var item = document.createElement('div');
            item.className = 'images__item';
            var firstColor = colors[0];
            item.style.background = firstColor.rgb;
            item.style.color = this.getTextColor(firstColor.isDark);
            images.insertBefore(item, images.firstChild);
            var title = document.createElement('div');
            title.className = 'images__title';
            title.innerText = name;
            item.appendChild(title);
            var body = document.createElement('div');
            body.className = 'images__body';
            body.innerHTML = 'Algorithms:<br/>';
            body.appendChild(this.getColorInfo(colors[0], 'simple', true));
            body.appendChild(this.getColorInfo(colors[1], 'sqrt', false));
            body.appendChild(this.getColorInfo(colors[2], 'dominant', false));
            item.appendChild(body);
            resource.className = 'images__img';
            var container = document.createElement('div');
            container.className = 'images__img-container';
            container.appendChild(resource);
            item.appendChild(container);
            this.imageCounter++;
        };
        App.prototype.getTextColor = function (isDark) {
            return isDark ? 'white' : 'black';
        };
        App.prototype.getColorInfo = function (color, algorithm, checked) {
            var _this = this;
            var text = [
                color.rgb,
                color.rgba,
                color.hex,
                color.hexa
            ].join(', ');
            var label = document.createElement('label');
            label.className = 'images__algorithm';
            label.style.background = color.rgb;
            label.style.color = this.getTextColor(color.isDark);
            var input = document.createElement('input');
            input.name = 'radio' + this.imageCounter;
            input.type = 'radio';
            input.checked = checked;
            input.onclick = function () {
                _this.setImageColor(label, color.rgb, color.isDark);
            };
            label.appendChild(input);
            label.appendChild(document.createTextNode(algorithm + ': ' + text));
            return label;
        };
        App.prototype.capture = function () {
            var _this = this;
            // @ts-ignore
            navigator.getUserMedia({ video: true, audio: false }, function (mediaStream) {
                // Firefox
                if (!('readyState' in mediaStream)) {
                    // @ts-ignore
                    mediaStream.readyState = 'live';
                }
                var video = document.createElement('video');
                var previewStream = new MediaStream(mediaStream);
                if (window.HTMLMediaElement) {
                    video.srcObject = previewStream; // Safari 11 doesn't allow use of createObjectURL for MediaStream
                }
                else {
                    // @ts-ignore
                    video.src = URL.createObjectURL(previewStream);
                }
                video.muted = true;
                // Required by Safari on iOS 11. See https://webkit.org/blog/6784
                video.setAttribute('playsinline', '');
                video.play();
                video.addEventListener('playing', function () {
                    setTimeout(function () {
                        var canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        var ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(video, 0, 0);
                        }
                        var image = new Image();
                        image.src = canvas.toDataURL('image/png');
                        _this.getColors(image).then(function (colors) {
                            _this.addImage(image, 'Camera', colors);
                            // @ts-ignore
                            mediaStream.stop();
                        });
                    }, 500);
                });
            }, function () {
                // console.log('failure to get media');
            });
        };
        return App;
    }());
    // @ts-ignore
    navigator.getUserMedia = navigator.getUserMedia ||
        // @ts-ignore
        navigator.webkitGetUserMedia ||
        // @ts-ignore
        navigator.mozGetUserMedia;
    window.addEventListener('load', function () {
        new App();
    }, false);

}));
