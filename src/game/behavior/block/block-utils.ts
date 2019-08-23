import { Point3D } from '../../position/point';
import { positionId } from '../../position/point-utils';
import { BlockType } from './block-type';

export function getBlockId(position: Point3D): string {
    return `block-${positionId(position)}`;
}

export function isBlockTransparent(type: BlockType): boolean {
    return type === BlockType.AIR;
}
