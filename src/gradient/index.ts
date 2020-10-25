import FastAverageColor from 'fast-average-color';

import '../common';
import './index.css';

const fac = new FastAverageColor();

window.addEventListener('load', () => {
    Array.from(document.querySelectorAll<HTMLDivElement>('.item')).forEach(item => {
        const image = item.querySelector('img') as HTMLImageElement;
        const isBottom = item.classList.contains('item_bottom');
        const gradient = item.querySelector('.item__gradient') as HTMLDivElement;

        const height = image.naturalHeight;
        const size = 50;

        const color = fac.getColor(
            image,
            isBottom ?
                { top: height - size, height: size } :
                { height: size }
        );
        const colorEnd = [...color.value.slice(0, 3), 0].join(',');

        item.style.background =  color.rgb;
        item.style.color = color.isDark ? 'white' : 'black';

        if (isBottom) {
            gradient.style.background = `linear-gradient(to bottom, rgba(${colorEnd}) 0%, ${color.rgba} 100%)`;
        } else {
            gradient.style.background = `linear-gradient(to top, rgba(${colorEnd}) 0%, ${color.rgba} 100%)`;
        }
    });
}, false);
