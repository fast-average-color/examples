import { FastAverageColor } from 'fast-average-color';

import '../common';
import './index.css';

const fac = new FastAverageColor();

window.addEventListener('load', function() {
    Array.from(document.querySelectorAll<HTMLDivElement>('.item')).forEach(item => {
        const image = item.querySelector<HTMLImageElement>('img');
        const color = fac.getColor(image);

        if (image) {
            image.style.boxShadow = '0 70px 90px ' + color.rgb;
            item.style.color = color.isDark ? 'white' : 'black';
        }
    });
}, false);
