import {Vector3D} from './types';
import {getX, getY, getZ} from './utils/position';

export class GameObject {

    get x() { return getX(this.position); }

    get y() { return getY(this.position); }

    get z() { return getZ(this.position); }

    constructor(
        public position: Vector3D
    ) { }
}