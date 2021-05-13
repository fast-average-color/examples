import FastAverageColor from 'fast-average-color';
import { rnd, rndFloor } from './helpers';

import '../common';
import './index.css';

const fac = new FastAverageColor();

class App {
    canvas = document.querySelector('canvas') as HTMLCanvasElement;
    ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    infoElement = document.querySelector('.info') as HTMLElement;
    startElement = document.querySelector('#start') as HTMLButtonElement;
    infoColorElement = document.querySelector('.info__color') as HTMLElement;
    precisionElement = document.querySelector('#mode-precision') as HTMLButtonElement;
    speedElement = document.querySelector('#mode-speed') as HTMLInputElement;
    stepElement = document.querySelector('#step') as HTMLInputElement;
    algorithmSimpleElement = document.querySelector('#algorithm-simple') as HTMLInputElement;
    algorithmSqrtElement = document.querySelector('#algorithm-sqrt') as HTMLInputElement;
    algorithmDominantElement = document.querySelector('#algorithm-dominant') as HTMLInputElement;
    width640Element = document.querySelector('#width-640') as HTMLInputElement;
    width1280Element = document.querySelector('#width-1280') as HTMLInputElement;
    width2560Element = document.querySelector('#width-2560') as HTMLInputElement;

    stoped = false;
    isPrecision = true;
    timer?: number;
    step = 1;
    algorithm: 'simple' | 'sqrt' | 'dominant' = 'simple';

    constructor() {
        this.bindEvents();
        this.start();
    }

    bindEvents() {
        this.startElement.onclick = () => {
            this.stoped = !this.stoped;
            if (this.stoped) {
                this.startElement.innerText = 'Start';
                this.stop();
            } else {
                this.startElement.innerText = 'Stop';
                this.start();
            }
        };

        this.precisionElement.onclick = () => {
            this.isPrecision = true;
            this.getColor();
        };

        this.speedElement.onclick = () => {
            this.isPrecision = false;
            this.getColor();
        };

        this.stepElement.oninput = () => {
            this.step = Number(this.stepElement.value);
            this.getColor();
        };

        this.algorithmSimpleElement.onclick = () => {
            this.algorithm = 'simple';
        };

        this.algorithmSqrtElement.onclick = () => {
            this.algorithm = 'sqrt';
        };

        this.algorithmDominantElement.onclick = () => {
            this.algorithm = 'dominant';
        };

        this.width640Element.onclick = () => {
            this.canvas.width = 640;
            this.canvas.height = 480;
        };

        this.width1280Element.onclick = () => {
            this.canvas.width = 1280;
            this.canvas.height = 1024;
        };

        this.width2560Element.onclick = () => {
            this.canvas.width = 2560;
            this.canvas.height = 2048;
        };
    }

    start() {
        this.timer = window.setInterval(this.nextStep.bind(this), 100);
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
        const timeBefore = Date.now();
        const color = fac.getColor(this.canvas, {
            algorithm: this.algorithm,
            mode: this.isPrecision ? 'precision' : 'speed',
            step: this.step,
        });

        const time = Date.now() - timeBefore;

        this.infoElement.style.backgroundColor = color.rgba;
        this.infoColorElement.innerHTML = [
            'rgb: ' + color.rgb,
            'rgba: ' + color.rgba,
            'hex: ' + color.hex,
            'hexa: ' + color.hexa,
            `time: ${time} ms`,
        ].map(item => `<div class="info__item">${item}</div>`).join('');
    }
};

window.addEventListener('load', () => {
    new App();
}, false);
