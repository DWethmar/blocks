import { Point3D, positionId } from '@blocks/core';

export function getBlockId(position: Point3D): string {
    return `block-${positionId(position)}`;
}
