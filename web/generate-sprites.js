const spritesheet = require('spritesheet-js');

// https://github.com/krzysztof-o/spritesheet.js
spritesheet('assets/*.png', {
    format: 'json',
    path: __dirname + '/assets'
}, function (err) {
    if (err) throw err;

    console.log('spritesheet successfully generated');
});