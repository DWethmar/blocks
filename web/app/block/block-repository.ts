import { Point3D, createPoint } from '../position/point';
import { BlockType } from './block-type';

export type blockRepository = BlockType[][][];

export function createBlockRepository(
    maxX: number,
    maxY: number,
    maxZ: number,
): blockRepository {
    return Array(maxX)
        .fill(null)
        .map(
            (): BlockType[][] =>
                Array(maxY)
                    .fill(null)
                    .map((): BlockType[] => Array(maxZ).fill(BlockType.AIR)),
        );
}

export function getBlock(
    blockIndex: Point3D,
    collection: blockRepository,
): BlockType {
    return collection[blockIndex.x][blockIndex.y][blockIndex.z];
}

export function setBlock(
    blockIndex: Point3D,
    collection: blockRepository,
    type: BlockType,
): boolean {
    if (true) {
        // TODO Check if in chunk.
        collection[blockIndex.x][blockIndex.y][blockIndex.z] = type;
        return true;
    }
    return false;
}

export function* iterateBlocks(
    collection: blockRepository,
): Iterable<[Point3D, BlockType]> {
    yield [createPoint(), BlockType.VOID];
    yield [createPoint(), BlockType.VOID];

    for (let x = 0; x < collection.length; x++) {
        for (let y = 0; y < collection[x].length; y++) {
            for (let z = 0; z < collection[x][y].length; z++) {
                const p = createPoint(x, y, z);
                yield [p, getBlock(p, collection)];
            }
        }
    }
}
