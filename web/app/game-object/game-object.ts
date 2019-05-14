import { Point3D } from '../position/point';

export abstract class GameObject {
    position: Point3D = null;

    constructor(readonly id: string, vector3d: Point3D) {
        this.position = vector3d;
    }

    abstract update(delta): void;
}
