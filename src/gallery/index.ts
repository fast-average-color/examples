import FastAverageColor from 'fast-average-color';

import '../common';
import './index.css';

const fac = new FastAverageColor();

window.addEventListener('load', () => {
    const items = Array.from(document.querySelectorAll<HTMLImageElement>('.slider__item'));
    const border = document.querySelector('.big-image-border') as HTMLDivElement;
    const bigImage = document.querySelector('.big-image') as HTMLImageElement;

    bigImage.classList.remove('big-image_hidden');

    function onClick(elem: HTMLImageElement) {
        for (let item of items) {
            item.classList.remove('slider__item_active');
        }

        elem.classList.add('slider__item_active');

        bigImage.src = elem.src;

        const width = bigImage.naturalWidth;
        const height = bigImage.naturalHeight;
        const size = 30;

        const top = fac.getColor(elem, {left: 0, top: 0, width: width, height: size});
        const bottom = fac.getColor(elem, {left: 0, top: height - size, width: width, height: size});
        const left = fac.getColor(elem, {left: 0, top: 0, width: size, height: height});
        const right = fac.getColor(elem, {left: width - size, top: 0, width: size, height: height});

        border.style.borderTopColor = top.rgb;
        border.style.borderRightColor = right.rgb;
        border.style.borderBottomColor = bottom.rgb;
        border.style.borderLeftColor = left.rgb;
    }

    onClick(items[0]);

    for (let item of items) {
        item.onclick = function() {
            onClick(this as HTMLImageElement);
        };
    }
});
