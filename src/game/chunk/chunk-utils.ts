import { Point3D } from '../../game/position/point';
import { positionId } from '../../game/position/point-utils';

export function getChunkId(chunkIndex: Point3D): string {
    return `chunk-${positionId(chunkIndex)}`;
}
