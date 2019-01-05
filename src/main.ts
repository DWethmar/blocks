import * as PIXI from 'pixi.js';

import {Scene} from './scene';
import {BlockType} from './block';
import {BLOCK_SIZE, CHUNK_SIZE} from './config';
import {Vector3D} from './types';
import {addPos} from './utils/position';
import {divideBy} from "./utils/calc";
import * as Viewport from "pixi-viewport";
import Ticker = PIXI.ticker.Ticker;

const viewPort = {width: 400, height: 400};

let app = new PIXI.Application(viewPort);
document.body.appendChild(app.view);

app.view.style.margin = "0 auto";
app.view.style.display = "inherit";

app.renderer.backgroundColor = 0xf00000;

app.loader.load(setup);

// create viewport
var viewport = new Viewport({
    screenWidth:    viewPort.width,
    screenHeight:   viewPort.height,
    worldWidth:     1000,
    worldHeight:    1000,

    interaction: (<any>app).renderer.interaction // the interaction module is important for wheel() to work properly when renderer.view is placed or scaled
});

// add the viewport to the stage
app.stage.addChild(viewport);

// activate plugins
viewport
    .drag()
    .pinch()
    .wheel()
    .decelerate();

let scene: Scene = new Scene(viewport, app.renderer);

// setup ticker
var ticker = new Ticker();
ticker.add((delta: number) => {
    scene.update(0);
    scene.render(0);
});

ticker.speed = .5;
ticker.start();

createArch(scene,  BlockType.ROCK, [6, 1,1]);

createCheckers(scene,  BlockType.GRASS,  BlockType.VOID, [0, 0, 0]);

scene.addBlock([0, 0, 1], BlockType.ROCK);
scene.addBlock([1, 0, 1], BlockType.ROCK);
scene.addBlock([2, 0, 1], BlockType.ROCK);
scene.addBlock([3, 0, 1], BlockType.ROCK);
scene.addBlock([2, 0, 1], BlockType.ROCK);


scene.addBlock([8, 0, 1], BlockType.GRASS);
scene.addBlock([11, 0, 1], BlockType.GRASS);

scene.addBlock([CHUNK_SIZE, 0, 9], BlockType.ROCK);

const block = scene.addBlock([5, 5, 0], BlockType.ROCK);

// block.x = 100;

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

function createCheckers(scene: Scene, type: BlockType, type2: BlockType, start: Vector3D) {
    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let y = 0; y < CHUNK_SIZE; y++) {
            scene.addBlock(addPos(start, [x, y, 0]), (x+y) % 2 == 0 ? type : type2);
        }
    }
}

function setup() {
    console.log('Setup');
}
//
// function click(e) {
//
//
//     const global = e.data.global;
//
//
//     const position = <Vector3D>divideBy(BLOCK_SIZE, [
//         global.x,
//         0,
//         global.y
//     ]).map(i => Math.floor(i));
//
//     scene.addBlock(position, BlockType.ROCK);
// }
