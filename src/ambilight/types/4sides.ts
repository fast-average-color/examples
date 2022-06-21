import { FastAverageColor } from 'fast-average-color';
import { AmbilightBase } from './base';

const fac = new FastAverageColor();

interface Ambilight4SideOptions {
    radius: number;
    delta: number;
    size: number;
}

export class Ambilight4Sides extends AmbilightBase {
    video: HTMLVideoElement | null;
    container: HTMLElement | null;

    options: Ambilight4SideOptions;

    constructor(video: HTMLVideoElement, container: HTMLElement, options: Ambilight4SideOptions) {
        super(video, container, options);

        this.video = video;
        this.container = container;
        this.options = options;
    }

    destroy() {
        if (this.container) {
            this.container.style.boxShadow = 'none';
        }

        this.video = null;
        this.container = null;
    }

    onUpdate() {
        if (!this.video || !this.container) {
            return;
        }

        const width = this.video.videoWidth;
        const height = this.video.videoHeight;
        const { size } = this.options;
        const video = this.video;


        const colorTop = fac.getColor(video, {
            left: 0,
            top: 0,
            height: size,
            width: width
        });

        const colorRight = fac.getColor(video, {
            left: width - size,
            top: 0,
            width: size,
            height: height
        });
        const colorLeft = fac.getColor(video, {
            left: 0,
            top: 0,
            width: size,
            height: height
        });
        const colorBottom = fac.getColor(video, {
            left: 0,
            top: height - size,
            width: width,
            height: size
        });

        const radius = this.options.radius + 'px';
        const delta = this.options.delta + 'px';

        this.container.style.boxShadow = [
            `0 -${delta} ${radius} ${colorTop.rgb}`,
            `${delta} 0 ${radius} ${colorRight.rgb}`,
            `0 ${delta} ${radius} ${colorBottom.rgb}`,
            `-${delta} 0 ${radius} ${colorLeft.rgb}`
        ].join(', ');
    }
};
