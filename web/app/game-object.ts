import {Point3D} from "./types";
import {BlockIndex, ChunkIndex, Position} from "./position";

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
