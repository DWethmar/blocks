import * as PIXI from 'pixi.js';
import { Ticker } from 'pixi.js';

import { GameScene } from './game-scene';
import { Game } from './game/game/game';

const viewPort = { width: 500, height: 500 };

let app = new PIXI.Application(viewPort);

document.body.appendChild(app.view);

function setup(): void {
    console.log('Setup');
}

app.renderer.backgroundColor = 0xf5f5f5;
app.loader.load(setup);

const game: Game = new Game();
game.scene = new GameScene(app);

// setup ticker
const ticker = new Ticker();
ticker.add((delta: number): void => {
    game.update(delta);
    document.title = `${process.env.TITLE} FPS:${Math.floor(app.ticker.FPS)}`;
});
ticker.start();
