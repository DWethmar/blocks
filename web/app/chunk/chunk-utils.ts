import { Chunk } from './chunk';
import { Block } from '../block/block';
import {
    addPos,
    isWithin,
    minusPos,
    positionId,
    convertPositionToBlockIndex,
    convertPositionToChunkIndex,
} from '../position/point-utils';
import { Point3D, createPoint } from '../position/point';
import { CHUNK_SIZE } from '../config';
import { createCollection3DIterator } from '../collection/collection';

export function isPositionWithinChunk(blockIndex: Point3D, chunk: Chunk): boolean {
    return isWithin(
        blockIndex,
        minusPos(convertPositionToChunkIndex(chunk.position), createPoint(1, 1, 1)),
        addPos(convertPositionToChunkIndex(chunk.position), createPoint(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE)),
    );
}

export function isPosVisibleWithinChunk(blockIndex: Point3D, chunk: Chunk): boolean {
    if (isPositionWithinChunk(blockIndex, chunk)) {
        if (!!chunk.getBlock(blockIndex)) {
            return isPosVisibleWithinChunk(addPos(blockIndex, createPoint(0, 1, 1)), chunk);
        } else {
            return false;
        }
    }
    return true;
}

export function getVisibleBlockIndexes(chunk: Chunk): Point3D[] {
    return Array.from(createCollection3DIterator(chunk.blocks))
        .filter(
            (block: Block): boolean =>
                isPosVisibleWithinChunk(addPos(convertPositionToBlockIndex(block.position), createPoint(0, 1, 1)), chunk),
        )
        .map((block: Block): Point3D => convertPositionToBlockIndex(block.position));
}

export function getChunkId(position: Point3D): string {
    return `chunk-${positionId(convertPositionToChunkIndex(position))}`;
}
