import FastAverageColor, { FastAverageColorResult } from 'fast-average-color';
import { secsToHMS } from './utils';

import '../common';
import './index.css';

const fac = new FastAverageColor();

const TIMELINE_HEIGHT = 50;

interface ColorsOfMoviesData {
    step: number;
    count: number;
    duration: number,
    averageColors: string[],
    averageSqrtColors: string[],
    dominantColors: string[],
    palette: number[][];
}

class ColorsOfMovies {
    private video: HTMLVideoElement;
    private currentSrc: string = '';
    private averageTimeline: HTMLCanvasElement;
    private dominantTimeline: HTMLCanvasElement;
    private radialDemo: HTMLDivElement;
    private conicDemo: HTMLDivElement;
    private spinner: HTMLDivElement;
    private title: HTMLDivElement;
    private progress: HTMLDivElement;
    private selectMovie: HTMLSelectElement;
    private uploadFile: HTMLInputElement;
    private originalDocumentTitle = document.title;

    constructor() {
        this.video = document.querySelector('video')!;
        this.averageTimeline = document.querySelector('.timeline_type_average .timeline__colors')!;
        this.dominantTimeline = document.querySelector('.timeline_type_dominant .timeline__colors')!;
        this.spinner = document.querySelector('.spinner')!;
        
        this.radialDemo = document.querySelector('.radial-demo')!;
        this.conicDemo = document.querySelector('.conic-demo')!;
        this.title = document.querySelector('.title')!;
        
        this.progress = document.querySelector('.progress')!;

        this.selectMovie = document.querySelector('.movies')!;
        this.selectMovie.addEventListener('change', () => {
            this.currentSrc = this.selectMovie.selectedOptions[0].value;        
            this.start(this.currentSrc);
        });

        this.uploadFile = document.querySelector('.upload-file')!;

        const that = this;
        this.uploadFile.addEventListener('change', function() {
            const files = this.files;

            if (files) {
                const file = files.item(0);
                if (file) {
                    const src = URL.createObjectURL(file);
                    that.currentSrc = src;

                    that.start(src);
                }
            }            
        });        

        this.start(this.selectMovie.selectedOptions[0].value);
    }

    public start(src: string) {
        this.reset();
        this.showSpinner();

        if (src) {
            this.video.src = src;
            this.video.addEventListener('canplay', this.handleCanPlay);    
        }
    }

    private getStep(duration: number) {
        let step = Math.ceil(duration / document.documentElement.clientWidth);

        if (step < 1) {
            step = 1;
        }

        if (step > 10) {
            step = 10;
        }

        return step;
    }

    private handleCanPlay = () => {
        this.getColorsFromMovie(this.currentSrc);
        this.hideSpinner();
        this.video.removeEventListener('canplay', this.handleCanPlay);
    }

    private hideSpinner() {
        this.spinner.style.display = 'none';
    }

    private showSpinner() {
        this.spinner.style.display = 'block';
    }

    async getColorsFromMovie(src: string)  {
        const duration = this.video.duration;
        const startTime = Date.now();
        const step = this.getStep(duration);
        console.log('step', step, duration, screen.availWidth);
    
        const data: ColorsOfMoviesData = {
            step,
            duration: duration,
            count: 0,
            averageColors: [],
            averageSqrtColors: [],
            dominantColors: [],
            palette: [],
        };
    
        const width = Math.ceil(duration / step);
        this.averageTimeline.width = width;
        this.averageTimeline.height = TIMELINE_HEIGHT;
        this.dominantTimeline.width = width;
        this.dominantTimeline.height = TIMELINE_HEIGHT;
    
        let x = 0;
        for (let i = 0; i < duration; i += step) {
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
    
            this.addColor(this.averageTimeline, averageColor, x);
            this.addColor(this.dominantTimeline, dominantColor, x);
    
            const percents = Math.floor(i / duration * 100) + '%';
            this.progress.innerHTML = [
                percents + ', step: ' + step + ' s',
                secsToHMS(i) + '&thinsp;/&thinsp;' + secsToHMS(duration),
                Math.floor((Date.now() - startTime) / 1000) + ' s'
            ].join('<br/>');

            document.title = percents + ' — ' + this.originalDocumentTitle;
    
            this.radialDemo.style.background = 'radial-gradient(' + data.dominantColors.join(',') + ')';
            this.conicDemo.style.background = 'conic-gradient(' + data.dominantColors.join(',') + ')';

            x++;
        }
    
        this.title.style.background = 'linear-gradient(90deg,' + data.dominantColors.join(',') + ')';
        this.title.style.backgroundClip = 'text';
        this.progress.innerHTML = '';
        document.title = this.originalDocumentTitle;
    
        this.hideVideo();
    }

    private reset() {
        this.title.style.background = '';
        document.title = this.originalDocumentTitle;

        this.radialDemo.style.background = ''; 
        this.conicDemo.style.background = '';         

        this.resetCanvas(this.averageTimeline);
        this.resetCanvas(this.dominantTimeline);

        this.progress.innerHTML = '';
    
        this.video.removeEventListener('canplay', this.handleCanPlay);
    
        this.showVideo();
    }  
    
    private resetCanvas(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    private showVideo() {
        this.video.style.display = 'block';
    }
    
    private hideVideo() {
        this.video.style.display = 'none';
    }
    
    private addColor(
        canvas: HTMLCanvasElement,
        color: FastAverageColorResult,
        x: number,
    ) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = color.rgba;
        ctx.fillRect(x, 0, 1, TIMELINE_HEIGHT);
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
