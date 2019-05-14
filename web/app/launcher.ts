import * as PIXI from 'pixi.js';
import { Game } from './game/game';
import { Ticker } from 'pixi.js';
import { version } from './version';

// import "./wasm";

const viewPort = { width: 750, height: 500 };

let app = new PIXI.Application(viewPort);

if (process.env.NODE_ENV === 'development') {
    // Only runs in development and will be stripped from production build.
    document.body.appendChild(app.view);
}

app.renderer.backgroundColor = 0xf5f5f5;
app.loader.load(setup);

let game: Game = new Game(app);

// setup ticker
const ticker = new Ticker();
ticker.add((delta: number) => {
    game.update(delta);
    document.title = `${process.env.TITLE} ${version} FPS:${Math.floor(app.ticker.FPS)}`;
});
ticker.start();

function setup() {
    console.log('Setup');
}
