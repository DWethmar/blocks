import { CHUNK_SIZE } from '../config';
import '../../vendor/noisejs/perlin.js';
import { BlockType } from '../block/block-type';
import { addPos } from '../position/point-utils';
import { Terrain } from './terrain';
import { Point3D, createPoint } from '../position/point';

declare var noise;

export function* createTerrainNoise(
    type1: BlockType,
    type2: BlockType,
    width: number,
    length: number,
): Iterable<[Point3D, BlockType]> {
    // NOISE
    noise.seed(Math.random());
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < length; y++) {
            let value = Math.abs(noise.perlin2(x / 10, y / 10));
            const z = Math.ceil(value * 6);

            yield [createPoint(x, y, z), type1];

            for (let zz = z - 1; zz >= 0; zz--) {
                yield [createPoint(x, y, zz), type2];
            }
        }
    }
}

export function createArch(
    terrain: Terrain,
    type: BlockType,
    start: Point3D,
): void {
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

export function* createTower(
    type: BlockType,
    height: number,
): Iterable<[Point3D, BlockType]> {
    for (let z = 0; z < height; z++) {
        yield [createPoint(0, 0, z), type];
    }
}

export function createBar(
    terrain: Terrain,
    type: BlockType,
    start: Point3D,
): void {
    for (let x = 0; x < 20; x++) {
        terrain.setBlock(addPos(start, createPoint(x, 0, 0)), type);
    }
}

export function createGround(
    terrain: Terrain,
    type: BlockType,
    start: Point3D,
): void {
    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let y = 0; y < CHUNK_SIZE; y++) {
            terrain.setBlock(addPos(start, createPoint(x, y, 0)), type);
        }
    }
}

export function* createCheckers(
    type: BlockType,
    type2: BlockType,
    width: number,
    length: number,
): Iterable<[Point3D, BlockType]> {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < length; y++) {
            yield [createPoint(x, y, 0), (x + y) % 2 == 0 ? type : type2];
        }
    }
}
