import * as PIXI from "pixi.js";

import {Scene} from "./scene";
import {BlockType} from "./block";
import {CHUNK_SIZE} from "./config";
import {Vector3D} from "./types";
import {addPos} from "./utils/position";
import * as Viewport from "pixi-viewport";

import "./vendor/noisejs/perlin.js";
import Ticker = PIXI.Ticker;
import {GameOfLife} from "./game-of-life/game-of-life";

// src/vendor/noisejs/perlin.js
declare var noise;

const viewPort = {width: 1400, height: 750};

let app = new PIXI.Application(viewPort);
document.body.appendChild(app.view);

app.view.style.margin = "0 auto";
app.view.style.display = "inherit";

app.renderer.backgroundColor = 0xF5F5F5;
app.loader.load(setup);

let scene: Scene = new Scene(app);

// window.addEventListener("resize", () => {
//   app.renderer.resize(window.innerWidth, window.innerHeight)
// });

// const gol = new GameOfLife(CHUNK_SIZE, CHUNK_SIZE);
// gol.addRandomCells(50);

// setup ticker
var ticker = new Ticker();

let golTicks = 0;

ticker.add((delta: number) => {
    scene.update(delta);

    // // Game of life shizzle
    // if (golTicks === 100) {
    //   scene.deleteBlocks([0, CHUNK_SIZE, 1], [CHUNK_SIZE, CHUNK_SIZE * 2, 1]);
    //   gol.tick();
    //   gol.getCells()
    //       .forEach(c => scene.addBlock(addPos([c.x, c.y, 1], [0, CHUNK_SIZE, 0]), BlockType.ROCK));
    //   golTicks = 0;
    // } else {
    //   golTicks++;
    // }

    document.title = `SODA FPS:${Math.floor(app.ticker.FPS)}`;
});
ticker.speed = 0.5;
ticker.start();

createCheckers(scene, BlockType.GRASS, BlockType.VOID, [0, 0, 0]);
createTower(scene, BlockType.ROCK, [17, 15, 1]);
createTower(scene, BlockType.ROCK, [20, 18, 1]);
createArch(scene, BlockType.ROCK, [6, 1, 1]);

for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 5; y++) {
        createCheckers(scene, BlockType.GRASS, BlockType.VOID, addPos([CHUNK_SIZE, -1, 0], [CHUNK_SIZE * x, CHUNK_SIZE * y, 0]));
        createTerrainNoise(scene, BlockType.GRASS, BlockType.ROCK, addPos([CHUNK_SIZE, -1, 0], [CHUNK_SIZE * x, CHUNK_SIZE * y, 0]));
    }
}

scene.addBlock([0, 0, 1], BlockType.ROCK);
scene.addBlock([1, 0, 1], BlockType.ROCK);
scene.addBlock([2, 0, 1], BlockType.ROCK);
scene.addBlock([3, 0, 1], BlockType.ROCK);
scene.addBlock([2, 0, 1], BlockType.ROCK);

scene.addBlock([8, 0, 1], BlockType.GRASS);
scene.addBlock([11, 0, 1], BlockType.GRASS);
scene.addBlock([CHUNK_SIZE, 0, 1], BlockType.VOID);

function createTerrainNoise(
    scene: Scene,
    type1: BlockType,
    type2: BlockType,
    start: Vector3D
) {
    // NOISE
    noise.seed(Math.random());
    for (var x = 0; x < CHUNK_SIZE; x++) {
        for (var y = 0; y < CHUNK_SIZE; y++) {
            let value = Math.abs(noise.perlin2(x / 10, y / 10));
            value *= 256 / 28;
            const z = Math.ceil(value);

            scene.addBlock(addPos(start, [x, y, z]), type1);
            for (let zz = z - 1; zz > 0; zz--) {
                scene.addBlock(addPos(start, [x, y, zz]), type2);
            }
        }
    }
}

function createArch(scene: Scene, type: BlockType, start: Vector3D) {
    scene.addBlock(addPos(start, [0, 0, 0]), type);
    scene.addBlock(addPos(start, [0, 0, 1]), type);
    scene.addBlock(addPos(start, [0, 0, 2]), type);
    scene.addBlock(addPos(start, [0, 0, 3]), type);

    scene.addBlock(addPos(start, [0, 0, 4]), type);
    scene.addBlock(addPos(start, [1, 0, 5]), type);
    scene.addBlock(addPos(start, [2, 0, 6]), type);
    scene.addBlock(addPos(start, [3, 0, 6]), type);
    scene.addBlock(addPos(start, [4, 0, 6]), type);
    scene.addBlock(addPos(start, [5, 0, 5]), type);
    scene.addBlock(addPos(start, [6, 0, 4]), type);

    scene.addBlock(addPos(start, [6, 0, 0]), type);
    scene.addBlock(addPos(start, [6, 0, 1]), type);
    scene.addBlock(addPos(start, [6, 0, 2]), type);
    scene.addBlock(addPos(start, [6, 0, 3]), type);
}

function createTower(scene: Scene, type: BlockType, start: Vector3D) {
    for (let z = 0; z < 20; z++) {
        scene.addBlock(addPos(start, [0, 0, z]), type);
    }
}

function createBar(scene: Scene, type: BlockType, start: Vector3D) {
    for (let x = 0; x < 20; x++) {
        scene.addBlock(addPos(start, [x, 0, 0]), type);
    }
}

function createGround(scene: Scene, type: BlockType, start: Vector3D) {
    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let y = 0; y < CHUNK_SIZE; y++) {
            scene.addBlock(addPos(start, [x, y, 0]), type);
        }
    }
}

function createCheckers(
    scene: Scene,
    type: BlockType,
    type2: BlockType,
    start: Vector3D
) {
    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let y = 0; y < CHUNK_SIZE; y++) {
            scene.addBlock(addPos(start, [x, y, 0]), (x + y) % 2 == 0 ? type : type2);
        }
    }
}

function setup() {
    console.log("Setup");
}
