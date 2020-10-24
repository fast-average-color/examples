import FastAverageColor from 'fast-average-color';

import '../common.js';
import '../common.css';
import './index.css';

const fac = new FastAverageColor();

window.addEventListener('load', function() {
    Array.from(document.querySelectorAll<HTMLDivElement>('.item')).forEach(item => {
        const imageContainer = item.querySelector('.item__image-container') as HTMLDivElement;
        const image = item.querySelector('.item__image') as HTMLImageElement;

        const size = 20;

        const width = image.naturalWidth;
        const height = image.naturalHeight;

        const colorTop = fac.getColor(image, {height: size});
        const colorRight = fac.getColor(image, {left: width - size, width: size});
        const colorLeft = fac.getColor(image, {width: size});
        const colorBottom = fac.getColor(image, {top: height - size, height: size});

        imageContainer.style.borderColor = [
            colorTop.rgb,
            colorRight.rgb,
            colorBottom.rgb,
            colorLeft.rgb
        ].join(' ');
    });
}, false);
