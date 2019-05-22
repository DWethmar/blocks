import { Point3D } from '../position/point';
import { BLOCK_SIZE, CHUNK_SIZE } from '../config';

export function getDrawPosition(position: Point3D): [number, number] {
    const drawX = position.x;
    const drawY = position.y - position.z + BLOCK_SIZE * CHUNK_SIZE;
    return [drawX, drawY];
}
