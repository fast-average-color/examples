import '../common';
import './index.css';

import { Ambilight4Sides } from './types/4sides';
import { AmbilightManyPoints } from './types/many-points';
import { AmbilightBase } from './types/base';

interface AmbilightOptions {
    onPlay?: () => void;
}

interface AmbilightTypeItem {
    name: string;
    klass: typeof AmbilightManyPoints | typeof Ambilight4Sides,
    options: any;
}

export class Ambilight {
    requestId = 0;

    plugin: AmbilightBase | null;

    video: HTMLVideoElement | null;
    container: HTMLElement | null;
    options: AmbilightOptions;

    types: AmbilightTypeItem[] = [
        { name: 'ManyPoints', klass: AmbilightManyPoints, options: { countByWidth: 10, countByHeight: 5, size: 70 }},
        { name: '4Sides', klass: Ambilight4Sides, options: { radius: 200, delta: 200, size: 70 }},
    ];

    constructor(video: HTMLVideoElement, container: HTMLElement, options?: AmbilightOptions) {
        this.onPlay = this.onPlay.bind(this);
        this.onPause = this.onPause.bind(this);
        this.onUpdate = this.onUpdate.bind(this)

        this.video = video;
        this.video.addEventListener('play', this.onPlay.bind(this), false);
        this.video.addEventListener('pause', this.onPause, false);

        this.container = container;
        this.options = options || {};

        this.plugin = new this.types[0].klass(video, container, this.types[0].options);
        !video.paused && this.onPlay();
    }

    setType(name: string) {
        const plugin = this.types.find(item => item.name === name);
        if (plugin && this.video && this.container) {
            this.plugin?.destroy();
            this.plugin = new plugin.klass(this.video, this.container, plugin.options);
        }
    }

    private onPlay() {
        this.options.onPlay?.();

        this.requestId = window.requestAnimationFrame(this.onUpdate);
    }

    private onPause() {
        window.cancelAnimationFrame(this.requestId);
    }

    private onUpdate() {
        this.plugin?.onUpdate();
        this.requestId = window.requestAnimationFrame(this.onUpdate);
    }

    destroy() {
        if (this.plugin) {
            this.plugin.destroy();
            this.plugin = null;
        }

        if (this.video) {
            this.video.removeEventListener('play', this.onPlay, false);
            this.video.removeEventListener('pause', this.onPause, false);
        }

        window.cancelAnimationFrame(this.requestId);
    }
};
