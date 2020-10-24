import FastAverageColor from 'fast-average-color';

import '../common.js';
import '../common.css';
import './index.css';

const fac = new FastAverageColor();

Array.from(document.querySelectorAll('.row')).forEach(row => {
    (['simple', 'sqrt', 'dominant'] as const).forEach(algorithm => {
        fac.getColorAsync(row.querySelector<HTMLImageElement>('.item_image'), { algorithm })
            .then(color => {
                const item = row.querySelector('.item_' + algorithm) as HTMLDivElement;

                item.style.backgroundColor = color.rgb;
                item.style.color = color.isDark ? '#fff' : '#000';
                item.innerText = color.hex;
            })
            .catch(e => console.log(e));
    });
});
