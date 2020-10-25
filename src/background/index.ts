import FastAverageColor from 'fast-average-color';

import '../common';
import './index.css';

const fac = new FastAverageColor();

window.addEventListener('load', function() {
    Array.from(document.querySelectorAll<HTMLDivElement>('.item')).forEach(item => {
        const color = fac.getColor(item.querySelector('img'));

        item.style.backgroundColor = color.rgb;
        item.style.color = color.isDark ? 'white' : 'black';
    });
}, false);
