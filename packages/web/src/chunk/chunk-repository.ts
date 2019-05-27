import { Chunk } from './chunk';
import { getChunkId } from './chunk-utils';
import { Point3D } from '@blocks/core';
import { convertPositionToChunkIndex } from '../terrain/index-utils';

export type chunkRepository = Map<string, Chunk>;

export function createChunkRepository(): chunkRepository {
    return new Map<string, Chunk>();
}

export function getChunk(
    chunkIndex: Point3D,
    collection: chunkRepository,
): Chunk {
    return collection.get(getChunkId(chunkIndex)) || null;
}

export function setChunk(chunk: Chunk, collection: chunkRepository): void {
    collection.set(
        getChunkId(convertPositionToChunkIndex(chunk.position)),
        chunk,
    );
}
