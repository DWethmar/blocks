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
import { createPointFromIndex, getBlock } from '../block/block-repository';
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
        const blockType = getBlock(
            convertBlockIndexToLocalChunkIndex(blockIndex),
            chunk.blocks,
        );
        if (isBlockTransparent(blockType)) {
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
    return chunk.blocks.reduce<Point3D[]>((s, c, i) => {
        if (c === BlockType.AIR) {
            return s;
        }
        const blockIndex = createPointFromIndex(i);
        const pos = addPos(blockIndex, createPoint(0, 1, 1));
        if (isPosVisibleWithinChunk(pos, chunk)) {
            s.push(floorPos(createPointFromIndex(i)));
        }
        return s;
    }, []);
}

export function getChunkId(chunkIndex: Point3D): string {
    return `chunk-${positionId(chunkIndex)}`;
}
