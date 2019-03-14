import {Point3D} from "./point";
import {getX, getY, getZ} from "./point-utils";

export class Position {

    get x() { return getX(this.point); }
    set x(value: number) { this.point[0] = value; }

    get y() { return getY(this.point); }
    set y(value: number) { this.point[1] = value; }

    get z() { return getZ(this.point); }
    set z(value: number) { this.point[2] = value; }

    constructor(public point: Point3D) { }

}
