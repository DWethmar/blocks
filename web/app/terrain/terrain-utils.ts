import { CHUNK_SIZE } from '../config';
import '../../vendor/noisejs/perlin.js';
import { BlockType } from '../block/block-type';
import { addPos } from '../position/point-utils';
import { Terrain } from './terrain';
import { Point3D, createPoint } from '../position/point';

declare var noise;

export function createTerrainNoise(terrain: Terrain, type1: BlockType, type2: BlockType, start: Point3D): void {
    // NOISE
    noise.seed(Math.random());
    for (var x = 0; x < CHUNK_SIZE; x++) {
        for (var y = 0; y < CHUNK_SIZE; y++) {
            let value = Math.abs(noise.perlin2(x / 10, y / 10));
            value *= 256 / 28;
            const z = Math.ceil(value);

            terrain.setBlock(addPos(start, createPoint(x, y, z)), type1);
            for (let zz = z - 1; zz > 0; zz--) {
                terrain.setBlock(addPos(start, createPoint(x, y, zz)), type2);
            }
        }
    }
}

export function createArch(terrain: Terrain, type: BlockType, start: Point3D): void {
    terrain.setBlock(addPos(start, createPoint(0, 0, 0)), type);
    terrain.setBlock(addPos(start, createPoint(0, 0, 1)), type);
    terrain.setBlock(addPos(start, createPoint(0, 0, 2)), type);
    terrain.setBlock(addPos(start, createPoint(0, 0, 3)), type);

    terrain.setBlock(addPos(start, createPoint(0, 0, 4)), type);
    terrain.setBlock(addPos(start, createPoint(1, 0, 5)), type);
    terrain.setBlock(addPos(start, createPoint(2, 0, 6)), type);
    terrain.setBlock(addPos(start, createPoint(3, 0, 6)), type);
    terrain.setBlock(addPos(start, createPoint(4, 0, 6)), type);
    terrain.setBlock(addPos(start, createPoint(5, 0, 5)), type);
    terrain.setBlock(addPos(start, createPoint(6, 0, 4)), type);

    terrain.setBlock(addPos(start, createPoint(6, 0, 0)), type);
    terrain.setBlock(addPos(start, createPoint(6, 0, 1)), type);
    terrain.setBlock(addPos(start, createPoint(6, 0, 2)), type);
    terrain.setBlock(addPos(start, createPoint(6, 0, 3)), type);
}

export function createTower(terrain: Terrain, type: BlockType, start: Point3D): void {
    for (let z = 0; z < 20; z++) {
        terrain.setBlock(addPos(start, createPoint(0, 0, z)), type);
    }
}

export function createBar(terrain: Terrain, type: BlockType, start: Point3D): void {
    for (let x = 0; x < 20; x++) {
        terrain.setBlock(addPos(start, createPoint(x, 0, 0)), type);
    }
}

export function createGround(terrain: Terrain, type: BlockType, start: Point3D): void {
    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let y = 0; y < CHUNK_SIZE; y++) {
            terrain.setBlock(addPos(start, createPoint(x, y, 0)), type);
        }
    }
}

export function createCheckers(terrain: Terrain, type: BlockType, type2: BlockType, start: Point3D): void {
    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let y = 0; y < CHUNK_SIZE; y++) {
            terrain.setBlock(addPos(start, createPoint(x, y, 0)), (x + y) % 2 == 0 ? type : type2);
        }
    }
}
