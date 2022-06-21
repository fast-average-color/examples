import { FastAverageColor } from 'fast-average-color';

import '../common';
import './index.css';

const fac = new FastAverageColor();

window.addEventListener('load', () => {
    Array.from(document.querySelectorAll<HTMLDivElement>('.item')).forEach(item => {
        const image = item.querySelector('img') as HTMLImageElement;
        const size = 50;

        const width = image.naturalWidth;
        const height = image.naturalHeight;

        const colorTop = fac.getColor(image, {height: size});
        const colorRight = fac.getColor(image, {left: width - size, width: size});
        const colorLeft = fac.getColor(image, {width: size});
        const colorBottom = fac.getColor(image, {top: height - size, height: size});
        const radius = ' 90px ';
        const delta = '70px';

        image.style.boxShadow = [
            `0 -${delta} ${radius} ${colorTop.rgb}`,
            `${delta} 0 ${radius} ${colorRight.rgb}`,
            `0 ${delta} ${radius} ${colorBottom.rgb}`,
            `-${delta} 0 ${radius} ${colorLeft.rgb}`,
        ].join(', ');

        item.style.color = colorBottom.isDark ? 'white' : 'black';
    });
}, false);
