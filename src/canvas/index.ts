import FastAverageColor from 'fast-average-color';
import { rnd, rndFloor } from './helpers';

import '../common.js';
import '../common.css';
import './index.css';

const fac = new FastAverageColor();

class App {
    canvas = document.querySelector('canvas') as HTMLCanvasElement;
    ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    info = document.querySelector('.info') as HTMLElement;
    infoColor = document.querySelector('.info__color') as HTMLElement;
    stoped = false;
    isPrecision = true;
    timer?: number;

    constructor() {
        this.bindEvents();
        this.start();
    }

    bindEvents() {
        const startElement = document.querySelector('#start') as HTMLButtonElement;
        startElement.onclick = () => {
            this.stoped = !this.stoped;
            if (this.stoped) {
                startElement.innerText = 'Start';
                this.stop();
            } else {
                startElement.innerText = 'Stop';
                this.start();
            }
        };

        const precisionElement = document.querySelector('#precision') as HTMLButtonElement;
        precisionElement.onclick = () => {
            this.isPrecision = true;
            this.getColor();
        };

        const speedElement = document.querySelector('#speed') as HTMLInputElement;
        speedElement.onclick = () => {
            this.isPrecision = false;
            this.getColor();
        };
    }

    start() {
        this.timer = window.setInterval(this.nextStep.bind(this), 50);
    }

    stop() {
        clearInterval(this.timer);
    }

    nextStep() {
        const { width, height } = this.canvas;

        this.ctx.fillStyle = 'rgba(' + [
            rndFloor(255),
            rndFloor(255),
            rndFloor(255),
            rnd(1)
        ].join(',') + ')';

        this.ctx.fillRect(
            rnd(width),
            rnd(height),
            rnd(width),
            rnd(height)
        );

        this.getColor();
    }

    getColor() {
        const timeA = Date.now();
        const color = fac.getColor(this.canvas, {
            mode: this.isPrecision ? 'precision' : 'speed'
        });

        this.info.style.backgroundColor = color.rgba;
        this.infoColor.innerHTML = [
            'rgb: ' + color.rgb,
            'rgba: ' + color.rgba,
            'hex: ' + color.hex,
            'hexa: ' + color.hexa,
            'time: ' + (Date.now() - timeA) + ' ms'
        ].map(item => `<div class="info__item">${item}</div>`).join('');
    }
};

window.onload = () => {
    new App();
};
