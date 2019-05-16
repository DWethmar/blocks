import { Point3D } from '../position/point';
import { positionId } from '../position/point-utils';

export function getBlockId(position: Point3D): string {
    return `block-${positionId(position)}`;
}
