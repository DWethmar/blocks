import {Point3D} from "../position/point";
import {Position} from "../position/position";

export abstract class GameObject {

    position: Position = null;

    constructor(
        readonly id: string,
        vector3d: Point3D
    ) {
        this.position   = new Position(vector3d);
    }

    abstract update(delta): void;
}
