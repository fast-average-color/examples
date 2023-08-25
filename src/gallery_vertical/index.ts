import '../common';
import { getVerticalColors, getVerticalGradient, getHorizontalGradient, getHorizontalColors } from './getColors';
import './index.css';

window.addEventListener('load', () => {
    const items = Array.from(document.querySelectorAll<HTMLImageElement>('.slider__item'));
    const bigImage = document.querySelector('.big-image') as HTMLImageElement;
    const verticalGradient = document.querySelector('.vertical-gradient') as HTMLDivElement;
    const horizontalGradient = document.querySelector('.horizontal-gradient') as HTMLDivElement;

    bigImage.classList.remove('big-image_hidden');

    function onClick(elem: HTMLImageElement) {
        for (let item of items) {
            item.classList.remove('slider__item_active');
        }

        elem.classList.add('slider__item_active');

        bigImage.onload = function() {
            const verticalColors = getVerticalColors(bigImage);
            const horizontalColors = getHorizontalColors(bigImage);
            verticalGradient.style.background = getVerticalGradient(verticalColors);
            horizontalGradient.style.background = getHorizontalGradient(horizontalColors);
        };

        bigImage.src = elem.src;

    }

    onClick(items[0]);

    for (let item of items) {
        item.onclick = function() {
            onClick(this as HTMLImageElement);
        };
    }
});
