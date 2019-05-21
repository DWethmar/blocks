import { Point3D, createPoint } from '../position/point';
import { CHUNK_SIZE } from '../config';
import { BlockType } from './block-type';

export type blockRepository = Uint16Array;

export function createBlockRepository(size = CHUNK_SIZE): blockRepository {
    return new Uint16Array(size * size * size);
}

// https://coderwall.com/p/fzni3g/bidirectional-translation-between-1d-and-3d-arrays
export function flattenPointToIndex(
    point: Point3D,
    size = CHUNK_SIZE - 1,
): number {
    return point.x + point.y * size + point.z * size * size;
}

export function createPointFromIndex(
    index: number,
    size = CHUNK_SIZE,
): Point3D {
    return createPoint(
        /** X */ index % size,
        /** Y */ (index / size) % size,
        /** Z */ index / (size * size),
    );
}

export function getPointInBlockRepository(
    point: Point3D,
    collection: blockRepository,
    size = CHUNK_SIZE,
): BlockType {
    return Object.values(BlockType).find(
        k => k === collection[flattenPointToIndex(point, size)],
    );
}

export function setPointInBlockRepository(
    point: Point3D,
    collection: blockRepository,
    type: BlockType,
    size = CHUNK_SIZE,
): boolean {
    const p = flattenPointToIndex(point, size);
    collection[p] = type;
    return true;
}
