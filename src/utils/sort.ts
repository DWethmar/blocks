import {Vector3D} from 'types';
import {getX, getY, getZ} from './position';

export function sortZYX(a: Vector3D, b: Vector3D): number {
    if (getZ(a) < getZ(b)) return -1;
    if (getZ(a) > getZ(b)) return 1;

    if (getY(a) < getY(b)) return -1;
    if (getY(a) > getY(b)) return 1;


    if (getX(a) < getX(b)) return -1;
    if (getX(a) > getX(b)) return 1;

    return 0;
}

