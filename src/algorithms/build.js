'use strict';

const fs = require('fs');
const template = fs.readFileSync('./template.html', 'utf8');
const MAX_PHOTO = 27;

let rows = '';
for (let i = 1; i <= MAX_PHOTO; i++) {
  rows += `<div class="row">
    <img class="item item_image" src="images/${i}.jpg" />
    <div class="item item_simple"></div>
    <div class="item item_sqrt"></div>
    <div class="item item_dominant"></div>
  </div>`
}

fs.writeFileSync('../../algorithms.html', template.replace(/\{ROWS\}/, rows));
