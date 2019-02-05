import {addPos, isWithin, minusPos} from "./position";
import {Chunk} from "../chunk";
import {Vector3D} from "../types";
import {CHUNK_SIZE} from "../config";

export const getVisibleBlocks = (chunk: Chunk): string[] => {
    return Array.from(chunk.blocks)
        .filter(([id, block]) =>
            isPosVisibleWithinChunk(addPos(block.blockIndex.point, [0, 1, 1]), chunk)
        )
        .map(([id, block]) => id);
};

export const isPosVisibleWithinChunk = (pos: Vector3D, chunk: Chunk) => {
    if (isPositionWithinChunk(pos, chunk)) {
        const block = chunk.getBlock(pos);
        if (block && !block.transparent) {
            return false;
        }
        return isPosVisibleWithinChunk(addPos(pos, [0, 1, 1]), chunk);
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
