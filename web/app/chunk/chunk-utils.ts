import {Chunk} from "./chunk";
import {Block} from "../block/block";
import {addPos, isWithin, minusPos, positionId} from "../position/point-utils";
import {Point3D} from "../position/point";
import {CHUNK_SIZE} from "../config";

export const getVisibleBlocks = (chunk: Chunk): string[] => {
    return Array.from(chunk.blocks)
        .filter(([id, block]: [string, Block]) =>
            isPosVisibleWithinChunk(addPos(block.blockIndex.point, [0, 1, 1]), chunk)
        )
        .map(([id, block]) => id);
};

export const isPosVisibleWithinChunk = (pos: Point3D, chunk: Chunk) => {
    if (isPositionWithinChunk(pos, chunk)) {
        if (chunk.isEmpty(pos)) {
            return isPosVisibleWithinChunk(addPos(pos, [0, 1, 1]), chunk);
        } else {
            return false;
        }
    }
    return true;
};

export const isPositionWithinChunk = (pos: Point3D, chunk: Chunk) => {
    return isWithin(
        pos,
        minusPos(chunk.blockIndex.point, [1, 1, 1]),
        addPos(chunk.blockIndex.point, [CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE])
    );
};

export const getChunkId = (position: Point3D) =>
    `chunk-${positionId(position)}`;
