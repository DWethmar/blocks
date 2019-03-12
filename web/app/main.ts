import * as PIXI from "pixi.js";

import {Game} from "./game";
import {BlockType} from "./block";
import {CHUNK_SIZE} from "./config";
import {createArch, createCheckers, createTerrainNoise, createTower} from "./utils/terrain";
import Ticker = PIXI.Ticker;
import {addPos} from "./utils/position";
import {Chunk} from "./chunk";
import {distinctUntilChanged} from "rxjs/operators";

// import "./wasm";

const viewPort = {width: 750, height: 500};

let app = new PIXI.Application(viewPort);
document.body.appendChild(app.view);

app.renderer.backgroundColor = 0xF5F5F5;
app.loader.load(setup);

let game: Game = new Game(app);

createCheckers(game, BlockType.GRASS, BlockType.VOID, [0, 0, 0]);
createTower(game, BlockType.ROCK, [17, 15, 1]);
createTower(game, BlockType.ROCK, [20, 18, 1]);
createArch(game, BlockType.ROCK, [6, 1, 1]);

for (let x = 0; x < 2; x++) {
    for (let y = 0; y < 2; y++) {
        createCheckers(game, BlockType.GRASS, BlockType.VOID, addPos([CHUNK_SIZE, -1, 0], [CHUNK_SIZE * x, CHUNK_SIZE * y, 0]));
        createTerrainNoise(game, BlockType.GRASS, BlockType.ROCK, addPos([CHUNK_SIZE, -1, 0], [CHUNK_SIZE * x, CHUNK_SIZE * y, 0]));
    }
}

game.addBlock([0, 0, 1], BlockType.ROCK);
game.addBlock([1, 0, 1], BlockType.ROCK);
game.addBlock([2, 0, 1], BlockType.ROCK);
game.addBlock([3, 0, 1], BlockType.ROCK);
game.addBlock([2, 0, 1], BlockType.ROCK);

game.addBlock([8, 0, 1], BlockType.GRASS);
game.addBlock([11, 0, 1], BlockType.GRASS);
game.addBlock([CHUNK_SIZE, 0, 1], BlockType.VOID);

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

/// DEBUG
const container = document.createElement('div');
let ul = document.createElement('ul');
container.append(ul);

game.scene.getState().pipe().subscribe(state => {
    container.removeChild(ul);
    ul = document.createElement('ul');
    for (let g of Object.values(state.gameObjects)) {
        let li = document.createElement('li');
        li.innerText = `GameObject: ${ g.id } - x:${ g.position.x } y:${ g.position.y } z:${ g.position.z }`;
        ul.appendChild(li);
    }

    const chunks = Object.values(state.gameObjects).filter(g => g instanceof Chunk);
    const numberOfBlocks = chunks.reduce((som, chunk: Chunk) => {
        return som + chunk.blocks.size;
    }, 0);
    const numberOfVisibleBlocks = chunks.reduce((som, chunk: Chunk) => {
        return som + chunk.blocksToRender.length;
    }, 0);

    let li = document.createElement('li');
    li.innerText = `Visible blocks: ${ numberOfVisibleBlocks }/${ numberOfBlocks }`;
    ul.appendChild(li);

    container.append(ul);
});

document.body.appendChild(container);
