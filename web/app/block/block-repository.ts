import { Point3D, createPoint } from '../position/point';
import { CHUNK_SIZE } from '../config';
import { BlockType } from './block-type';
import { isPositionWithinChunk } from '../chunk/chunk-utils';

export type blockRepository = BlockType[][][];

export function createBlockRepository(size = CHUNK_SIZE): blockRepository {
    return Array(size + 1)
        .fill(null)
        .map(
            (): BlockType[][] =>
                Array(size + 1)
                    .fill(null)
                    .map(
                        (): BlockType[] => Array(size + 1).fill(BlockType.AIR),
                    ),
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
    for (let x = 0; x < collection.length; x++) {
        for (let y = 0; y < collection[x].length; y++) {
            for (let z = 0; z < collection[x][y].length; z++) {
                const p = createPoint(x, y, z);
                const blockType = getBlock(p, collection);
                if (blockType) {
                    yield [p, blockType];
                }
            }
        }
    }
}
