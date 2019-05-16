import { Point3D } from '../position/point';

export abstract class GameObject {
    public id: string;
    public position: Point3D = null;

    public constructor(id: string, position: Point3D) {
        this.id = id;
        this.position = position;
    }

    abstract update(delta): void;
}
