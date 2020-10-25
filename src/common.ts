import { hit } from 'lyam';

import './common.css';

window.addEventListener('load', () => {
    const pages = [
        'background',
        'gradient',
        'gradient_stripes',
        'border',
        'gallery',
        'box-shadow',
        'box-shadow-4-sides',
        'ambilight',
        'text-photo',
        'canvas',
        'define'
    ];

    let prev = pages[pages.length - 1];
    let next = pages[1];

    pages.some((item, i) => {
        prev = pages[i - 1] || pages[pages.length - 1];
        next = pages[i + 1] || pages[0];

        return location.pathname.search('/' + item + '\\.') > -1;
    });

    const nav = document.createElement('div');
    nav.innerHTML = '<div class="nav">\
        <a href="https://github.com/hcodes/fast-average-color" class="button back">🏠</a>\
        <a href="./' + prev + '.html" class="button prev">◀</a>\
        <a href="./' + next + '.html" class="button next">▶</a>\
        </div>';

    document.body.appendChild(nav);

    hit('49603183');
}, false);
