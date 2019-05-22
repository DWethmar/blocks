import { Chunk } from './chunk';
import {
    addPos,
    isWithin,
    minusPos,
    positionId,
    convertPositionToChunkIndex,
} from '../position/point-utils';
import { Point3D, createPoint } from '../position/point';
import { CHUNK_SIZE } from '../config';
import { iterateBlocks, getBlock } from '../block/block-repository';
import { isBlockTransparent } from '../block/block';
import { BlockType } from '../block/block-type';

export function isPositionWithinChunk(
    localIndex: Point3D,
    chunkIndex: Point3D,
): boolean {
    return isWithin(
        localIndex,
        minusPos(convertPositionToChunkIndex(chunkIndex), createPoint(1, 1, 1)),
        addPos(
            convertPositionToChunkIndex(chunkIndex),
            createPoint(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE),
        ),
    );
}

export function isPosVisibleWithinChunk(
    localIndex: Point3D,
    chunk: Chunk,
): boolean {
    if (
        isPositionWithinChunk(
            localIndex,
            convertPositionToChunkIndex(chunk.position),
        )
    ) {
        const blockType = getBlock(localIndex, chunk.blocks);
        if (!blockType || isBlockTransparent(blockType)) {
            return isPosVisibleWithinChunk(
                addPos(localIndex, createPoint(0, 1, 1)),
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
            (localIndexes, [localIndex, blockType]: [Point3D, BlockType]) => {
                const nextIndexInChunk = addPos(
                    localIndex,
                    createPoint(0, 1, 1),
                );
                if (isPosVisibleWithinChunk(nextIndexInChunk, chunk)) {
                    localIndexes.push(localIndex);
                }
                return localIndexes;
            },
            [],
        );
}

export function getChunkId(chunkIndex: Point3D): string {
    return `chunk-${positionId(chunkIndex)}`;
}
