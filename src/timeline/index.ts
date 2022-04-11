import FastAverageColor, { FastAverageColorResult } from 'fast-average-color';
import { secsToHMS } from './utils';

import '../common';
import './index.css';

const fac = new FastAverageColor();

const STEP = 1; // sec.

interface ColorsOfMoviesData {
    count: number;
    duration: number,
    averageColors: string[],
    averageSqrtColors: string[],
    dominantColors: string[],
}

class ColorsOfMovies {
    private video: HTMLVideoElement;
    private currentSrc: string = '';
    private dominantTimeline: HTMLDivElement;
    private averageTimeline: HTMLDivElement;
    private radialDemo: HTMLDivElement;
    private conicDemo: HTMLDivElement;
    private progress: HTMLDivElement;
    private selectMovie: HTMLSelectElement;

    constructor() {
        this.video = document.querySelector('video')!;
        this.averageTimeline = document.querySelector('.timeline_type_average .timeline__colors')!;
        // this.averageSqrtTimeline = document.querySelector('.timeline_type_average-sqrt .timeline__colors')!;
        this.dominantTimeline = document.querySelector('.timeline_type_dominant .timeline__colors')!;
        
        this.radialDemo = document.querySelector('.radial-demo')!;
        this.conicDemo = document.querySelector('.conic-demo')!;
        
        this.progress = document.querySelector('.progress')!;

        this.selectMovie = document.querySelector('select')!;
        this.selectMovie.addEventListener('change', () => {
            this.currentSrc = this.selectMovie.selectedOptions[0].value;        
            this.start(this.currentSrc);
        });

        this.start(this.selectMovie.selectedOptions[0].value);
    }

    public start(src: string) {
        this.reset();

        if (src) {
            this.video.src = src;
            this.video.addEventListener('canplay', this.handleCanPlay);    
        }
    }

    private handleCanPlay = () => {
        this.getColorsFromMovie(this.currentSrc);
        this.video.removeEventListener('canplay', this.handleCanPlay);
    }

    async getColorsFromMovie(src: string)  {
        const duration = this.video.duration;
        const startTime = Date.now();
    
        const data: ColorsOfMoviesData = {
            duration: duration,
            count: 0,
            averageColors: [],
            averageSqrtColors: [],
            dominantColors: [],
        };
    
        const width = Math.ceil(duration / STEP);
        this.averageTimeline.style.width = width + 'px';
        this.dominantTimeline.style.width = width + 'px';
    
        for (let i = 0; i < duration; i += STEP) {
            this.video.currentTime = i;
            await this.waitForSeek();
    
            if (src !== this.currentSrc) {
                return;
            }
    
            const averageColor = fac.getColor(this.video, { algorithm: 'simple'});
            const averageSqrtColor = fac.getColor(this.video, { algorithm: 'sqrt'});
            const dominantColor = fac.getColor(this.video, { algorithm: 'dominant' });
    
            data.averageColors.push(averageColor.rgb);
            data.averageSqrtColors.push(averageSqrtColor.rgb);
            data.dominantColors.push(dominantColor.rgb);
    
            this.addColor(this.averageTimeline, averageColor);
            //this.addColor(averageSqrtTimeline, averageSqrtColor);
            this.addColor(this.dominantTimeline, dominantColor);
    
            this.progress.innerHTML = [
                Math.floor(i / duration * 100) + '%, step: ' + STEP + ' s',
                secsToHMS(i) + '&thinsp;/&thinsp;' + secsToHMS(duration),
                Math.floor((Date.now() - startTime) / 1000) + ' s'
            ].join('<br/>');
    
            this.radialDemo.style.background = 'radial-gradient(' + data.dominantColors.join(',') + ')';
            this.conicDemo.style.background = 'conic-gradient(' + data.dominantColors.join(',') + ')';
        }
    
        this.progress.innerHTML = '';
    
        this.hideVideo();
    }

    private reset() {
        this.radialDemo.style.background = ''; 
        this.conicDemo.style.background = ''; 
        this.averageTimeline.innerHTML = '';
        this.dominantTimeline.innerHTML = '';
        this.progress.innerHTML = '';
    
        this.video.removeEventListener('canplay', this.handleCanPlay);
    
        this.showVideo();
    }    

    private showVideo() {
        this.video.style.display = 'block';
    }
    
    private hideVideo() {
        this.video.style.display = 'none';
    }
    
    private addColor(container: HTMLDivElement, value: FastAverageColorResult) {
        const div = document.createElement('div');
        div.className = 'timeline__color';
        div.style.backgroundColor = value.rgb;
        container.appendChild(div);
    }
    
    private waitForSeek() {
        return new Promise<void>(resolve => {
            this.video.onseeked = () => {
                this.video.onseeked = null;
                resolve();
            }
        });
    }    
}

new ColorsOfMovies();
