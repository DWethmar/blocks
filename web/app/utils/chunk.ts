import {addPos, isWithin, minusPos} from "./position";
import {Chunk} from "../chunk";
import {Vector3D} from "../types";
import {CHUNK_SIZE} from "../config";
import {Block} from "../block";

export const getVisibleBlocks = (chunk: Chunk): string[] => {
    return Array.from(chunk.blocks)
        .filter(([id, block]: [string, Block]) =>
            isPosVisibleWithinChunk(addPos(block.blockIndex.point, [0, 1, 1]), chunk)
        )
        .map(([id, block]) => id);
};

export const isPosVisibleWithinChunk = (pos: Vector3D, chunk: Chunk) => {
    if (isPositionWithinChunk(pos, chunk)) {
        if (chunk.isEmpty(pos)) {
            return isPosVisibleWithinChunk(addPos(pos, [0, 1, 1]), chunk);
        } else {
            return false;
        }
    }
    return true;
};

export const isPositionWithinChunk = (pos: Vector3D, chunk: Chunk) => {
    return isWithin(
        pos,
        minusPos(chunk.blockIndex.point, [1, 1, 1]),
        addPos(chunk.blockIndex.point, [CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE])
    );
};
