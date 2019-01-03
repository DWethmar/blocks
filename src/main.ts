import * as PIXI from 'pixi.js';

import {Scene} from './scene';
import {BlockType} from './block';
import {CHUNK_SIZE} from './config';
import {Vector3D} from './types';
import {addPos} from './utils/position';

let app = new PIXI.Application({width: 256, height: 256});
document.body.appendChild(app.view);

app.view.style.margin = "0 auto";
app.view.style.display = "inherit";

app.renderer.backgroundColor = 0xf00000;

const stage = new PIXI.Container();
app.loader.load(setup);

// setup ticker
var ticker = new PIXI.Ticker();
ticker.add((delta: number) => {
    scene.update(delta);
    app.renderer.render(stage);
}, PIXI.UPDATE_PRIORITY.LOW);

ticker.start();


let scene: Scene = new Scene(stage);

//
// createTower(scene, BlockType.ROCK, [4, 8, 1]);
// createTower(scene, BlockType.ROCK, [6, 0, 0]);
// // createTower(scene, BlockType.ROCK, [4, 7, 1]);
// // createTower(scene, BlockType.ROCK, [2, 0, 0]);
// //
createArch(scene,  BlockType.ROCK, [6, 1, 0]);
createArch(scene,  BlockType.ROCK, [6, 2, 0]);
createArch(scene,  BlockType.ROCK, [6, 3, 0]);
// //
// // scene.addBlock([CHUNK_SIZE - 1, 0, 0], BlockType.ROCK);
// // scene.addBlock([CHUNK_SIZE, 0, 0], BlockType.ROCK);
//
createGround(scene,  BlockType.GRASS, [0, 0, -1]);
createGround(scene,  BlockType.GRASS, [CHUNK_SIZE, 0, -1]);
// createGround(scene,  BlockType.GRASS, [CHUNK_SIZE, 0, -1]);
//
scene.addBlock([0, 0, 0], BlockType.ROCK);
scene.addBlock([1, 0, 0], BlockType.ROCK);
scene.addBlock([2, 0, 0], BlockType.ROCK);
scene.addBlock([3, 0, 0], BlockType.ROCK);
scene.addBlock([2, 0, 1], BlockType.ROCK);

scene.addBlock([5, 5, 0], BlockType.ROCK);


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

function setup() {
    console.log('Setup');
}



// Debug
addCameraBtn('<', -10, 0);
addCameraBtn('>', 10, 0);
addCameraBtn('^', 0, -10);
addCameraBtn('V', 0, 10);


function addCameraBtn(text: string, x, y) {
    // create a new div element
    var btn = document.createElement('BUTTON');  // Create a <button> element
    var t = document.createTextNode(text);        // Create a text node
    btn.appendChild(t);                                  // Append the text to <button>
    document.body.appendChild(btn);                      // Append <button> to <body>

    btn.style.margin = "0 auto";
    btn.style.display = "inherit";

    btn.addEventListener("click", () => {

        scene.stage.position.x += x;
        scene.stage.position.y += y;

    }, false);

}