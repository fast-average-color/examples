import FastAverageColor from 'fast-average-color';

import '../common';
import './index.css';

type Browser = 'firefox' | 'ie' | 'chrome' | 'opera';

const fac = new FastAverageColor();

class App {
    image = document.querySelector('.big-photo') as HTMLImageElement;
    canvas = document.querySelector('.text-photo') as HTMLCanvasElement;
    ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    browser?: Browser;

    constructor() {
        Array.from(document.querySelectorAll('input')).forEach(input => {
            const that = this;
            input.onclick = () => {
                that.setImage(input.value as Browser);
            };
        });

        this.setImage('firefox');
    }

    setImage(browser: Browser) {
        if (this.browser === browser) { return; }

        this.browser = browser;
        this.image.classList.remove('big-photo_fade');
        this.image.classList.add('big-photo_load');
        this.canvas.classList.remove('text-photo_fade');

        this.image.onload = () => {
            const { width, height } = this.image;

            this.canvas.width = width;
            this.canvas.height = height;
            this.ctx.clearRect(0, 0, width, height);

            setTimeout(() => {
                this.generate(this.getBrowserTitle(browser));

                this.image.classList.add('big-photo_fade');
                this.image.classList.remove('big-photo_load');
                this.canvas.classList.add('text-photo_fade');
            }, 50);
        };

        this.image.src = `./images/${browser}.jpg`;
    }

    getBrowserTitle(browser: Browser) {
        return {
            firefox: 'Mozilla Firefox',
            chrome: 'Google Chrome',
            ie: 'Internet Explorer',
            opera: 'Opera',
        }[browser];
    }

    generate(browserTitle: string) {
        const { width, height } = this.image;
        const x0 = width / 2;
        const y0 = height / 2;

        const n = 40;
        const a = 12;
        const pi = Math.PI;

        let step;
        let fs = 6;
        let pos = 0;

        for (let angle = pi; angle < 2 * pi * n; angle += step) {
            const r = a * angle / 2 / pi;
            step = Math.asin((fs - 2) / r) * 2;
            const x = x0 + r * Math.cos(angle);
            const y = y0 + r * Math.sin(angle);

            if (x < 0 || y < 0 || x > width || y > height) {
                continue;
            }

            const color = fac.getColor(this.image, {
                left: x,
                top: y,
                width: Math.floor(fs),
                height: Math.floor(fs) * 0.6
            });

            this.ctx.save();

            this.ctx.font = Math.floor(fs) + 'px Arial';
            this.ctx.fillStyle = color.rgb;
            if (!browserTitle[pos]) {
                pos = 0;
            }

            this.ctx.translate(x, y);
            this.ctx.rotate(angle);
            this.ctx.fillText(browserTitle[pos], 0, 0);
            pos++;

            this.ctx.restore();

            fs += 0.005;
        }
    }
};

window.addEventListener('load', () => {
    new App();
}, false);

