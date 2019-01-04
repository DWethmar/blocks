import {Vector3D} from './types';
import {getX, getY, getZ} from './utils/position';

export class GameObject {

    get x() { return getX(this.position); }
    set x(value: number) { this.position[0] = value }

    get y() { return getY(this.position); }
    set y(value: number) { this.position[1] = value }

    get z() { return getZ(this.position); }
    set z(value: number) { this.position[2] = value }

    constructor(
        public position: Vector3D
    ) { }
}