import FastAverageColor from 'fast-average-color';

import '../common.js';
import '../common.css';
import './index.css';

const fac = new FastAverageColor();

Array.from(document.querySelectorAll<HTMLImageElement>('.item')).forEach(item => {
    fac.getColorAsync(item.querySelector<HTMLImageElement>('img'))
        .then(color => {
            item.style.backgroundColor = color.rgb;
            item.style.color = color.isDark ? 'white' : 'black';
        })
        .catch(e => {
            console.log(e);
        });
});
