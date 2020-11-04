import FastAverageColor from 'fast-average-color';
import { AmbilightBase } from './base';

import { isSafari, isFirefox } from './helpers/ua';

const fac = new FastAverageColor();

interface AmbilightManyPointsOptions {
    countByWidth: number;
    countByHeight: number;
    size: number;
}

export class AmbilightManyPoints extends AmbilightBase {
    hasDoubleBlur = false;

    topElems: HTMLDivElement[] = [];
    bottomElems: HTMLDivElement[] = [];
    leftElems: HTMLDivElement[] = [];
    rightElems: HTMLDivElement[] = [];

    video: HTMLVideoElement | null;
    container: HTMLElement | null;

    options: AmbilightManyPointsOptions;

    constructor(video: HTMLVideoElement, container: HTMLElement, options: AmbilightManyPointsOptions) {
        super(video, container, options);

        this.video = video;
        this.container = container;
        this.options = options;

        this.hasDoubleBlur = isFirefox || isSafari ? false : true;

        this.createShadows();

        this.updateShadows = this.updateShadows.bind(this);

        console.log('init plugin');
    }

    destroy() {
        if (this.container) {
            for (let i = 0; i < this.topElems.length; i++) {
                this.container.removeChild(this.topElems[i]);
                this.container.removeChild(this.bottomElems[i]);
            }

            for (let i = 0; i < this.leftElems.length; i++) {
                this.container.removeChild(this.leftElems[i]);
                this.container.removeChild(this.rightElems[i]);
            }
        }

        this.video = null;
        this.container = null;
    }

    createShadows() {
        const { countByWidth, countByHeight } = this.options;

        const width = this.video?.videoWidth || 0;
        const height = this.video?.videoHeight || 0;

        this.topElems = [];
        this.bottomElems = [];
        this.leftElems = [];
        this.rightElems = [];

        for (let i = 0; i < countByWidth; i++) {
            const size = width / countByWidth;
            const topElem = this.createShadow('top');
            const left = (i * size) + 'px';
            topElem.style.left = left;
            this.topElems.push(topElem);
            this.container?.appendChild(topElem);

            const bottomElem = this.createShadow('bottom');
            bottomElem.style.left = left;
            this.bottomElems.push(bottomElem);
            this.container?.appendChild(bottomElem);
        }

        for (let i = 0; i < countByHeight; i++) {
            const leftElem = this.createShadow('left');
            const size = height / countByHeight;

            const top = (i * size) + 'px';
            leftElem.style.top = top;
            this.leftElems.push(leftElem);
            this.container?.appendChild(leftElem);

            const rightElem = this.createShadow('right');
            rightElem.style.top = top;
            this.rightElems.push(rightElem);
            this.container?.appendChild(rightElem);
        }
    }

    createShadow(position: string) {
        const { size } = this.options;
        const elem = document.createElement('div');

        elem.className = 'video-shadow video-shadow_' + position;
        elem.style.width = `${size}px`;
        elem.style.height = `${size}px`;

        return elem;
    }

    updateShadows() {
        console.log('updateShadows plugin');

        const width = this.video?.videoWidth || 0;
        const height = this.video?.videoHeight || 0;

        const { video } = this;
        const { countByHeight, countByWidth } = this.options;

        for (let i = 0; i < this.leftElems.length; i++) {
            const size = Math.floor(height / countByHeight);

            const leftColor = fac.getColor(video, {
                left: 0,
                top: size * i,
                width: size,
                height: size
            });

            const rightColor = fac.getColor(video, {
                left: width - size,
                top: size * i,
                width: size,
                height: size
            });

            const offset = size;
            const blur = this.hasDoubleBlur ? size * 2 : size;

            this.leftElems[i].style.boxShadow = '-' + offset + 'px 0 ' + blur + 'px ' + leftColor.rgb;
            this.rightElems[i].style.boxShadow = offset + 'px 0 ' + blur + 'px ' + rightColor.rgb;
        }

        for (let i = 0; i < this.topElems.length; i++) {
            const size = Math.floor(width / countByWidth);

            const topColor = fac.getColor(video, {
                left: size * i,
                top: 0,
                width: size,
                height: size
            });

            const bottomColor = fac.getColor(video, {
                left: size * i,
                top: height - size,
                width: size,
                height: size
            });

            const offset = size;
            const blur = this.hasDoubleBlur ? size * 2 : size;

            this.topElems[i].style.boxShadow = '0 -' + offset + 'px ' + blur + 'px ' + topColor.rgb;
            this.bottomElems[i].style.boxShadow = '0 ' + offset + 'px ' + blur + 'px ' + bottomColor.rgb;
        }
    }

    onUpdate() {
        this.updateShadows();
    }
}
