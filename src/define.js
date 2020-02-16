var App = {
    imageCounter: 0,
    init: function() {
        var
            that = this,
            input = document.querySelector('.select-file'),
            captureButton = document.querySelector('.capture-photo');

        this._fac = new FastAverageColor({mode: 'precision'});

        input.onchange = function() {
            var
                file = this.files[0],
                reader  = new FileReader();

            reader.onloadend = function() {
                var img = new Image();
                img.src = reader.result;

                that.getColors(img).then(function(colors) {
                    that.addImage(img, file.name, colors);
                });
            };

            if (file) {
                reader.readAsDataURL(file);
            }
        };

        captureButton.onclick = function() {
            that.capture();
        };
    },
    setImageColor: function(nodeCheckbox, backgroundColor, isDark) {
        console.log(arguments);
        var container = nodeCheckbox.parentNode.parentNode.parentNode;
        container.style.backgroundColor = backgroundColor;
        container.style.color = isDark ? 'white' : 'black';
    },
    getColors: function(image) {
        return Promise.all([
            this._fac.getColorAsync(image, { algorithm: 'simple' }),
            this._fac.getColorAsync(image, { algorithm: 'sqrt' }),
            this._fac.getColorAsync(image, { algorithm: 'dominant' })
        ]);
    },
    addImage: function(resource, name, colors) {
        var images = document.querySelector('.images');
        var item = document.createElement('div');
        item.className = 'images__item';
        item.style.background = colors[0].rgb;
        item.style.color = this.getTextColor(colors[0]);
        images.insertBefore(item, images.firstChild);

        var title = document.createElement('div');
        title.className = 'images__title';
        title.innerHTML = [
            'Filename: ' + name,
            '<br /><br/>Algorithms:<br/>',
            this.getColorInfo(colors[0], 'Simple', true),
            this.getColorInfo(colors[1], 'Sqrt'),
            this.getColorInfo(colors[2], 'Dominant'),
        ].join('');
        item.appendChild(title);

        resource.className = 'images__img';
        item.appendChild(resource);
        this.imageCounter++;
    },
    getTextColor: function(color) {
        return color.isDark ? 'white' : 'black';
    },
    getColorInfo: function(color, algorithm, checked) {
        var text = [
                color.rgb,
                color.rgba,
                color.hex,
                color.hexa
            ].join(', ');
        
        return '<label style="padding:5px; display:block; background:' + color.rgb + '; color:' + this.getTextColor(color) + '"><input type="radio" ' + (checked ? 'checked' : '' ) + ' name="radio' + this.imageCounter + '" onclick="App.setImageColor(this, \'' + color.rgb + '\', ' + color.isDark + ')" /> ' +
                algorithm + ': ' +
                text +
            '</label>';
    },
    capture: function() {
        var that = this;

        navigator.getUserMedia = navigator.getUserMedia ||
                                 navigator.webkitGetUserMedia ||
                                 navigator.mozGetUserMedia;

        navigator.getUserMedia({ video: true }, function(mediaStream) {
            // Firefox
            if (!('readyState' in mediaStream)) {
                mediaStream.readyState = 'live';
            }

            var
                video = document.createElement('video'),
                previewStream = new MediaStream(mediaStream);

            if (HTMLMediaElement) {
                video.srcObject = previewStream;  // Safari 11 doesn't allow use of createObjectURL for MediaStream
            } else {
                video.src = URL.createObjectURL(previewStream);
            }

            video.muted = true;
            // Required by Safari on iOS 11. See https://webkit.org/blog/6784
            video.setAttribute('playsinline', '');
            video.play();
            video.addEventListener('playing', function() {
                setTimeout(function() {
                    var canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0);

                    var image = new Image();
                    image.src = canvas.toDataURL('image/png');


                    that.getColors(image).then(function(colors) {
                        that.addImage(image, 'photo', colors);
                        mediaStream.stop();
                    });
                }, 500);
            });
        }, function() {
            // console.log('failure to get media');
        });
    }
};

App.init();
