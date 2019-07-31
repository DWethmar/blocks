import * as PIXI from 'pixi.js';
import { Ticker } from 'pixi.js';
import { GameScene } from './scene/game-scene';
import { Game } from './game/game';

// import "./wasm";

const viewPort = { width: 750, height: 500 };

let app = new PIXI.Application(viewPort);

// if (process.env.NODE_ENV === 'development') {
//     // Only runs in development and will be stripped from production build.
//     document.body.appendChild(app.view);
// }

document.body.appendChild(app.view);

function setup(): void {
    console.log('Setup');
}

app.renderer.backgroundColor = 0xf5f5f5;
app.loader.load(setup);

const game: Game = new Game();
game.scene = new GameScene(app);

const ball = game.scene.gameObjects.getById('ball');

// setup ticker
const ticker = new Ticker();
ticker.add(
    (delta: number): void => {
        game.update(delta);
        document.title = `${process.env.TITLE} FPS:${Math.floor(
            app.ticker.FPS,
        )}`;
    },
);
ticker.start();
