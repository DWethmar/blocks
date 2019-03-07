import * as PIXI from "pixi.js";

import {Game} from "./game";
import {BlockType} from "./block";
import {CHUNK_SIZE} from "./config";
import {addPos} from "./utils/position";

import Ticker = PIXI.Ticker;
import {createArch, createCheckers, createTerrainNoise, createTower} from "./utils/terrain";

// import "./wasm";

const viewPort = {width: 1400, height: 750};

let app = new PIXI.Application(viewPort);
document.body.appendChild(app.view);

app.renderer.backgroundColor = 0xF5F5F5;
app.loader.load(setup);

let scene: Game = new Game(app);

createCheckers(scene, BlockType.GRASS, BlockType.VOID, [0, 0, 0]);
createTower(scene, BlockType.ROCK, [17, 15, 1]);
createTower(scene, BlockType.ROCK, [20, 18, 1]);
createArch(scene, BlockType.ROCK, [6, 1, 1]);

// for (let x = 0; x < 2; x++) {
//     for (let y = 0; y < 2; y++) {
//         createCheckers(scene, BlockType.GRASS, BlockType.VOID, addPos([CHUNK_SIZE, -1, 0], [CHUNK_SIZE * x, CHUNK_SIZE * y, 0]));
//         createTerrainNoise(scene, BlockType.GRASS, BlockType.ROCK, addPos([CHUNK_SIZE, -1, 0], [CHUNK_SIZE * x, CHUNK_SIZE * y, 0]));
//     }
// }

scene.addBlock([0, 0, 1], BlockType.ROCK);
scene.addBlock([1, 0, 1], BlockType.ROCK);
scene.addBlock([2, 0, 1], BlockType.ROCK);
scene.addBlock([3, 0, 1], BlockType.ROCK);
scene.addBlock([2, 0, 1], BlockType.ROCK);

scene.addBlock([8, 0, 1], BlockType.GRASS);
scene.addBlock([11, 0, 1], BlockType.GRASS);
scene.addBlock([CHUNK_SIZE, 0, 1], BlockType.VOID);

// setup ticker
const ticker = new Ticker();
ticker.add((delta: number) => {
    scene.update(delta);
    document.title = `SODA FPS:${Math.floor(app.ticker.FPS)}`;
});
ticker.speed = 0.5;
ticker.start();

function setup() {
    console.log("Setup");
}
