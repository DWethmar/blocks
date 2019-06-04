import { Point3D } from '@blocks/core';
import { BLOCK_SIZE, CHUNK_SIZE } from '../config';

/**
 *
 * @param position
 */
export function getDrawPosition(position: Point3D): [number, number, number] {
    const drawX = position.x;
    const drawY = position.y - position.z + BLOCK_SIZE * CHUNK_SIZE;
    return [drawX, drawY, Math.ceil(position.y)];
}
