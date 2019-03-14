import {Point3D} from "../types";
import {getX, getY, getZ} from "./position";

export function sortZYXAsc(a: Point3D, b: Point3D): number {
    if (getZ(a) < getZ(b)) return -1;
    if (getZ(a) > getZ(b)) return 1;

    if (getY(a) < getY(b)) return -1;
    if (getY(a) > getY(b)) return 1;

    if (getX(a) < getX(b)) return -1;
    if (getX(a) > getX(b)) return 1;

    return 0;
}

export function sortYZXAsc(a: Point3D, b: Point3D): number {
    if (getY(a) < getY(b)) return -1;
    if (getY(a) > getY(b)) return 1;

    if (getZ(a) < getZ(b)) return -1;
    if (getZ(a) > getZ(b)) return 1;

    if (getX(a) < getX(b)) return -1;
    if (getX(a) > getX(b)) return 1;

    return 0;
}
