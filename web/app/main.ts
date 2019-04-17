import * as PIXI from 'pixi.js';
import { Game } from './game/game';
import { Ticker } from 'pixi.js';
import { version } from './version';

// import "./wasm";

const viewPort = { width: 750, height: 500 };

let app = new PIXI.Application(viewPort);
document.body.appendChild(app.view);

app.renderer.backgroundColor = 0xf5f5f5;
app.loader.load(setup);

let game: Game = new Game(app);

// setup ticker
const ticker = new Ticker();
ticker.add((delta: number) => {
	game.update(delta);
	document.title = `SODA ${version} FPS:${Math.floor(app.ticker.FPS)}`;
});
ticker.start();

function setup() {
	console.log('Setup');
}
