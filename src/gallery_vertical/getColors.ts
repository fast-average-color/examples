import { FastAverageColor } from 'fast-average-color';

const fac = new FastAverageColor();

export function getVerticalColors(img: HTMLImageElement) {
    const result: Array<string> = [];
    
    for (let i = 0; i < img.height; i++) {
        const color = fac.getColor(img, {            
            left: 0,
            width: img.width,
            top: i,
            height: 1,
            mode: 'precision',        
        });

        result.push(color.rgba);
    }

    return result;
}

export function getHorizontalColors(img: HTMLImageElement) {
    const result: Array<string> = [];
    
    for (let i = 0; i < img.width; i++) {
        const color = fac.getColor(img, {            
            left: i,
            top: 0,
            width: 1,
            height: img.height,
            mode: 'precision',        
        });

        result.push(color.rgba);
    }

    return result;
}

export function getVerticalGradient(data: Array<string>) {
    return `linear-gradient(180deg, ${data.join(', ')})`;
}

export function getHorizontalGradient(data: Array<string>) {
    return `linear-gradient(90deg, ${data.join(', ')})`;
}
