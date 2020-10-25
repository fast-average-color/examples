import FastAverageColor from 'fast-average-color';

import '../common';
import './index.css';

const fac = new FastAverageColor();

class App {
    imageCounter = 0;

    constructor() {
        const input = document.querySelector('.select-file') as HTMLInputElement;
        const captureButton = document.querySelector('.capture-photo') as HTMLButtonElement;

        input.onchange = e => {
            const file = (e.target as HTMLInputElement).files?.[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                const image = new Image();
                image.src = reader.result as string;

                this.getColors(image).then(colors => {
                    this.addImage(image, file?.name || '...', colors);
                });
            };

            if (file) {
                reader.readAsDataURL(file);
            }
        };

        captureButton.onclick = () => {
            this.capture();
        };
    }

    setImageColor(elem: HTMLLabelElement, backgroundColor: string, isDark: boolean) {
        const container = elem.parentNode!.parentNode as HTMLDivElement;
        container.style.backgroundColor = backgroundColor;
        container.style.color = this.getTextColor(isDark);
    }

    getColors(image: HTMLImageElement) {
        return Promise.all([
            fac.getColorAsync(image, { algorithm: 'simple', mode: 'precision' }),
            fac.getColorAsync(image, { algorithm: 'sqrt', mode: 'precision' }),
            fac.getColorAsync(image, { algorithm: 'dominant', mode: 'precision' })
        ]);
    }

    addImage(resource: HTMLImageElement, name: string, colors: IFastAverageColorResult[]) {
        const images = document.querySelector('.images') as HTMLDivElement;
        const item = document.createElement('div');
        item.className = 'images__item';
        const firstColor = colors[0];
        item.style.background = firstColor.rgb;
        item.style.color = this.getTextColor(firstColor.isDark);
        images.insertBefore(item, images.firstChild);

        const title = document.createElement('div');
        title.className = 'images__title';
        title.innerText = name;
        item.appendChild(title);

        const body = document.createElement('div');
        body.className = 'images__body';
        body.innerHTML = 'Algorithms:<br/>';
        body.appendChild(this.getColorInfo(colors[0], 'simple', true));
        body.appendChild(this.getColorInfo(colors[1], 'sqrt', false));
        body.appendChild(this.getColorInfo(colors[2], 'dominant', false));

        item.appendChild(body);

        resource.className = 'images__img';

        const container = document.createElement('div');
        container.className = 'images__img-container';
        container.appendChild(resource);
        item.appendChild(container);

        this.imageCounter++;
    }

    getTextColor(isDark: boolean) {
        return isDark ? 'white' : 'black';
    }

    getColorInfo(color: IFastAverageColorResult, algorithm: string, checked: boolean) {
        const text = [
            color.rgb,
            color.rgba,
            color.hex,
            color.hexa
        ].join(', ');

        const label = document.createElement('label')
        label.className = 'images__algorithm';
        label.style.background = color.rgb;
        label.style.color = this.getTextColor(color.isDark);

        const input = document.createElement('input');
        input.name = 'radio' + this.imageCounter;
        input.type = 'radio';
        input.checked = checked;
        input.onclick = () => {
            this.setImageColor(label, color.rgb, color.isDark);
        };
        label.appendChild(input);
        label.appendChild(document.createTextNode(algorithm + ': ' + text))

        return label;
    }

    capture() {
        navigator.getUserMedia({ video: true, audio: false }, mediaStream => {
            // Firefox
            if (!('readyState' in mediaStream)) {
                // @ts-ignore
                mediaStream.readyState = 'live';
            }

            const video = document.createElement('video');
            const previewStream = new MediaStream(mediaStream);

            if (window.HTMLMediaElement) {
                video.srcObject = previewStream; // Safari 11 doesn't allow use of createObjectURL for MediaStream
            } else {
                video.src = URL.createObjectURL(previewStream);
            }

            video.muted = true;
            // Required by Safari on iOS 11. See https://webkit.org/blog/6784
            video.setAttribute('playsinline', '');
            video.play();
            video.addEventListener('playing', () => {
                setTimeout(() => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(video, 0, 0);
                    }

                    const image = new Image();
                    image.src = canvas.toDataURL('image/png');

                    this.getColors(image).then(colors => {
                        this.addImage(image, 'Camera', colors);
                        // @ts-ignore
                        mediaStream.stop();
                    });
                }, 500);
            });
        }, () => {
            // console.log('failure to get media');
        });
    }
};

navigator.getUserMedia = navigator.getUserMedia ||
    // @ts-ignore
    navigator.webkitGetUserMedia ||
    // @ts-ignore
    navigator.mozGetUserMedia;

window.addEventListener('load', () => {
    new App();
}, false);
