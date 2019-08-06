import { Point3D } from '../position/point';
import { positionId } from '../position/point-utils';

export function getChunkId(chunkIndex: Point3D): string {
    return `chunk-${positionId(chunkIndex)}`;
}
