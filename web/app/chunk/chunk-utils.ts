import { Chunk } from './chunk';
import {
    addPos,
    isWithin,
    minusPos,
    positionId,
    convertPositionToChunkIndex,
    convertBlockIndexToLocalChunkIndex,
    floorPos,
} from '../position/point-utils';
import { Point3D, createPoint } from '../position/point';
import { CHUNK_SIZE } from '../config';
import { iterateBlocks, getBlock } from '../block/block-repository';
import { isBlockTransparent } from '../block/block';
import { BlockType } from '../block/block-type';

export function isPositionWithinChunk(
    blockIndex: Point3D,
    chunkIndex: Point3D,
): boolean {
    return isWithin(
        blockIndex,
        minusPos(convertPositionToChunkIndex(chunkIndex), createPoint(1, 1, 1)),
        addPos(
            convertPositionToChunkIndex(chunkIndex),
            createPoint(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE),
        ),
    );
}

export function isPosVisibleWithinChunk(
    blockIndex: Point3D,
    chunk: Chunk,
): boolean {
    if (
        isPositionWithinChunk(
            blockIndex,
            convertPositionToChunkIndex(chunk.position),
        )
    ) {
        const blockType = getBlock(blockIndex, chunk.blocks);
        if (!blockType || isBlockTransparent(blockType)) {
            return isPosVisibleWithinChunk(
                addPos(blockIndex, createPoint(0, 1, 1)),
                chunk,
            );
        } else {
            return false;
        }
    }
    return true;
}

export function getVisibleBlocksIndexes(chunk: Chunk): Point3D[] {
    return Array.from(iterateBlocks(chunk.blocks))
        .filter(
            ([, blockType]: [Point3D, BlockType]) =>
                blockType !== BlockType.AIR,
        )
        .reduce<Point3D[]>(
            (blockIndexes, [blockIndex, blockType]: [Point3D, BlockType]) => {
                const nextBlockIndex = addPos(blockIndex, createPoint(0, 1, 1));
                if (isPosVisibleWithinChunk(nextBlockIndex, chunk)) {
                    blockIndexes.push(blockIndex);
                }
                return blockIndexes;
            },
            [],
        );
}

export function getChunkId(chunkIndex: Point3D): string {
    return `chunk-${positionId(chunkIndex)}`;
}
