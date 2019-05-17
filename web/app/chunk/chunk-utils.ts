import { Chunk, getBlock } from './chunk';
import { Block } from '../block/block';
import {
    addPos,
    isWithin,
    minusPos,
    positionId,
    positionToBlockIndex,
    positionToChunkIndex,
} from '../position/point-utils';
import { Point3D, createPoint } from '../position/point';
import { CHUNK_SIZE } from '../config';

export function isPositionWithinChunk(pos: Point3D, chunk: Chunk): boolean {
    return isWithin(
        pos,
        minusPos(positionToChunkIndex(chunk.position), createPoint(1, 1, 1)),
        addPos(positionToChunkIndex(chunk.position), createPoint(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE)),
    );
}

export function isPosVisibleWithinChunk(pos: Point3D, chunk: Chunk): boolean {
    if (isPositionWithinChunk(pos, chunk)) {
        if (!!getBlock(pos, chunk.blocks, CHUNK_SIZE)) {
            return isPosVisibleWithinChunk(addPos(pos, createPoint(0, 1, 1)), chunk);
        } else {
            return false;
        }
    }
    return true;
}

export function getVisibleBlockIndexes(chunk: Chunk): Point3D[] {
    return chunk.blocks
        .filter(
            (block: Block): boolean =>
                isPosVisibleWithinChunk(addPos(positionToBlockIndex(block.position), createPoint(0, 1, 1)), chunk),
        )
        .map((block: Block): Point3D => positionToBlockIndex(block.position));
}

export function getChunkId(position: Point3D): string {
    return `chunk-${positionId(positionToChunkIndex(position))}`;
}
