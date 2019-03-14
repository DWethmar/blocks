import * as PIXI from "pixi.js";
import {Game} from "./game/game";
import {BlockType} from "./block/block-type";
import {createArch, createCheckers, createTower} from "./terrain/terrain-utils";
import {Chunk} from "./chunk/chunk";
import {Ticker} from "pixi.js";


// import "./wasm";

const viewPort = {width: 750, height: 500};

let app = new PIXI.Application(viewPort);
document.body.appendChild(app.view);

app.renderer.backgroundColor = 0xF5F5F5;
app.loader.load(setup);

let game: Game = new Game(app);

// setup ticker
const ticker = new Ticker();
ticker.add((delta: number) => {
    game.update(delta);
    document.title = `SODA FPS:${Math.floor(app.ticker.FPS)}`;
});
ticker.start();

function setup() {
    console.log("Setup");
}
