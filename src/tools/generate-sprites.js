/* eslint-disable @typescript-eslint/no-var-requires */
const spritesheet = require('spritesheet-js');

// https://github.com/krzysztof-o/spritesheet.js
spritesheet(
    'assets/images/*.png',
    {
        format: 'json',
        path: __dirname + '/assets/spritesheets',
        name: 'tiles-spritesheet',
    },
    function(err) {
        if (err) {
            throw err;
        }

        console.log('spritesheet successfully generated');
    },
);
