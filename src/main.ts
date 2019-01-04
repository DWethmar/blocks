import * as PIXI from 'pixi.js';

import {Scene} from './scene';
import {BlockType} from './block';
import {BLOCK_SIZE, CHUNK_SIZE} from './config';
import {Vector3D} from './types';
import {addPos} from './utils/position';
import {divideBy} from "./utils/calc";
import Ticker = PIXI.ticker.Ticker;

const viewPort = {width: 400, height: 400};

let app = new PIXI.Application(viewPort);
document.body.appendChild(app.view);

app.view.style.margin = "0 auto";
app.view.style.display = "inherit";

app.renderer.backgroundColor = 0xf00000;

app.loader.load(setup);

let scene: Scene = new Scene(app.stage, app.renderer, viewPort);

// setup ticker
var ticker = new Ticker();
ticker.add((delta: number) => {

    document.title = `SODA - ${ scene.camera.xView } ${ scene.camera.yView  }`;


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

// Dragging
var dragging = false;
let mousedown = null;

scene.stage.interactive = true;
scene.stage.on("mousedown", function(event: any) {
    mousedown = {x: event.data.originalEvent.screenX, y: event.data.originalEvent.screenY};
});

scene.stage.on("mouseup", function(event: any){
    dragging = false;
    mousedown = null;
});

scene.stage.on("mousemove", function(event: any){
    const ev_data = event.data.originalEvent;
    if (!dragging && mousedown) {
        if (Math.abs(mousedown.x - ev_data.screenX) > 2 || Math.abs(mousedown.y - ev_data.screenY) > 2) {
            dragging = true;
        }
    }

    if (dragging){
        scene.camera.xView += event.data.originalEvent.movementX;
        scene.camera.yView += event.data.originalEvent.movementY;
    }
});


// Clicking
scene.stage.interactive = true;
scene.stage.on("click", function(event: any){

    const click = {x: event.data.global.x, y: event.data.global.y};

    if (!dragging) {
        console.log(':D', click);



        const blockX = click.x - scene.camera.xView;
        const blockY = scene.camera.yView;
        const blockZ = 0;

        const position = <Vector3D>divideBy(BLOCK_SIZE, [
            blockX,
            blockY,
            blockZ,
        ]).map(i => Math.floor(i));

        scene.addBlock(position, BlockType.VOID);

    }
});



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

        scene.camera.xView += x;
        scene.camera.yView += y;

    }, false);

}