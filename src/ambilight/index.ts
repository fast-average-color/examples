import { Ambilight } from './ambilight';
import '../common';
import './index.css';

window.addEventListener('load', function() {
    const video = document.querySelector('video') as HTMLVideoElement;
    video.muted = false;
    const container = document.querySelector('.video-container') as HTMLElement;
    const ambi = new Ambilight(video, container, {
        onPlay() {
            const hint = document.querySelector('.hint') as HTMLElement;
            hint.style.display = 'none';
        },
    });

    const inputs = document.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    inputs[location.hash === '#4Sides' ? 1 : 0].checked = true;

    inputs[0].onchange = inputs[1].onchange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        ambi.setType(target.value);
        location.hash = target.value;
    };
}, false);
