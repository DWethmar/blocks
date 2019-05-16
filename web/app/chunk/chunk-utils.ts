import { Chunk } from './chunk';
import { Block } from '../block/block';
import { addPos, isWithin, minusPos, positionId } from '../position/point-utils';
import { Point3D, createPoint } from '../position/point';
import { CHUNK_SIZE } from '../config';

export function isPositionWithinChunk(pos: Point3D, chunk: Chunk): boolean {
    return isWithin(
        pos,
        minusPos(chunk.blockIndex.point, createPoint(1, 1, 1)),
        addPos(chunk.blockIndex.point, createPoint(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE)),
    );
}

export function isPosVisibleWithinChunk(pos: Point3D, chunk: Chunk): boolean {
    if (isPositionWithinChunk(pos, chunk)) {
        if (chunk.isEmpty(pos)) {
            return isPosVisibleWithinChunk(addPos(pos, createPoint(0, 1, 1)), chunk);
        } else {
            return false;
        }
    }
    return true;
}

export function getVisibleBlocks(chunk: Chunk): string[] {
    return Array.from(chunk.blocks)
        .filter(
            ([id, block]: [string, Block]): boolean =>
                isPosVisibleWithinChunk(addPos(block.blockIndex.point, createPoint(0, 1, 1)), chunk),
        )
        .map(([id, block]) => id);
}

export function getChunkId(position: Point3D): string {
    return `chunk-${positionId(position)}`;
}
