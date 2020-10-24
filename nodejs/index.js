const { createCanvas, loadImage } = require('canvas');
const FastAverageColor = require('fast-average-color');

const fac = new FastAverageColor();

async function printAverageColor(filename) {
    const img = await loadImage(filename);
    const { width, height } = img;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, width, height);

    console.log(`Filename: ${filename}, size: ${width}×${height}`);
    console.log('// [red, green, blue, opacity]');
    console.log('Simple average color: ', fac.getColorFromArray4(imageData.data,  { algorithm: 'simple'}));
    console.log('Sqrt average color: ', fac.getColorFromArray4(imageData.data));
    console.log('Dominant average color: ', fac.getColorFromArray4(imageData.data, { algorithm: 'dominant'}));
}

printAverageColor('../images/1.jpg');
