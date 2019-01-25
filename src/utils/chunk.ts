import {addPos, isWithin, minusPos} from "./position";
import {Chunk} from "../chunk";
import {Vector3D} from "../types";
import {CHUNK_SIZE} from "../config";

export const getVisibleBlocks = (chunk: Chunk): string[] => {
  return Array.from(chunk.blocks)
    .filter(([id, block]) =>
      isPosVisible(addPos(block.worldPosition, [0, 1, 1]), chunk)
    )
    .map(([id, block]) => id);
};

export const isPosVisible = (pos: Vector3D, chunk: Chunk) => {
  if (isPositionWithinChunk(pos, this)) {
    const block = chunk.getBlock(pos);
    if (block && !block.transparent) {
      return false;
    }
    return this.isPosVisible(addPos(pos, [0, 1, 1]));
  }
  return true;
};

export const isPositionWithinChunk = (pos: Vector3D, chunk: Chunk) => {
  return isWithin(
    pos,
    minusPos(chunk.worldPosition, [1, 1, 1]),
    addPos(chunk.worldPosition, [CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE])
  );
};
