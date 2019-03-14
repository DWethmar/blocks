import {Game} from "../game";
import {BlockType} from "../block";
import {Point3D} from "../types";
import {CHUNK_SIZE} from "../config";
import {addPos} from "./position";

import "../../vendor/noisejs/perlin.js";

declare var noise;

export function createTerrainNoise(
    scene: Game,
    type1: BlockType,
    type2: BlockType,
    start: Point3D
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

export function createArch(scene: Game, type: BlockType, start: Point3D) {
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

export function createTower(scene: Game, type: BlockType, start: Point3D) {
    for (let z = 0; z < 20; z++) {
        scene.addBlock(addPos(start, [0, 0, z]), type);
    }
}

export function createBar(scene: Game, type: BlockType, start: Point3D) {
    for (let x = 0; x < 20; x++) {
        scene.addBlock(addPos(start, [x, 0, 0]), type);
    }
}

export function createGround(scene: Game, type: BlockType, start: Point3D) {
    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let y = 0; y < CHUNK_SIZE; y++) {
            scene.addBlock(addPos(start, [x, y, 0]), type);
        }
    }
}

export function createCheckers(
    scene: Game,
    type: BlockType,
    type2: BlockType,
    start: Point3D
) {
    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let y = 0; y < CHUNK_SIZE; y++) {
            scene.addBlock(addPos(start, [x, y, 0]), (x + y) % 2 == 0 ? type : type2);
        }
    }
}
