import FastAverageColor from 'fast-average-color';

import '../common';
import './index.css';

const fac = new FastAverageColor();

function getGradient(image: HTMLImageElement, padding = 30, count = 10) {
    const naturalHeight = image.naturalHeight;
    const height = image.height;

    const naturalHeightPart = Math.floor(naturalHeight / count);
    const heightPart = Math.floor(height / count);

    const parts: string[] = [];

    const colors: IFastAverageColorResult[] = [];
    let value = 'linear-gradient(to bottom, ';

    for (let i = 0; i < count; i++) {
        const color = fac.getColor(image, {
            left: 0,
            top: i * naturalHeightPart,
            height: naturalHeightPart
        });

        const top = i ? (i * heightPart) + padding : 0;
        const bottom = ((i + 1) * heightPart - 1) + padding;

        parts.push(`${color.rgb} ${top}px, ${color.rgb} ${bottom}px`);
        colors.push(color);
    }

    value += parts.join(', ');
    value += ')';

    return {
        value,
        lastColor: colors[colors.length - 1],
    };
}

function updateStripes(items: HTMLElement[]) {
    items.forEach(item => {
        const image = item.querySelector('img') as HTMLImageElement;
        const { value, lastColor } = getGradient(image);

        item.style.background = value;
        item.style.color = lastColor.isDark ? 'white' : 'black';
    });
}

window.addEventListener('load', () => {
    const items = Array.from(document.querySelectorAll<HTMLDivElement>('.item'));

    window.addEventListener('resize', () => updateStripes(items), false);
    updateStripes(items);
}, false);
