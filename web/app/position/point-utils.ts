import {Point3D} from "./point";

export const getX = (a: Point3D): number => a[0];
export const getY = (a: Point3D): number => a[1];
export const getZ = (a: Point3D): number => a[2];

export function isWithin(target: Point3D, start: Point3D, end: Point3D) {
    return target.every(
        (axis: number, index: number) => axis > start[index] && axis < end[index]
    );
}

export function addPos(a: Point3D, b: Point3D): Point3D {
    return [
        getX(a) + getX(b),
        getY(a) + getY(b),
        getZ(a) + getZ(b)
    ]
}

export function minusPos(a: Point3D, b: Point3D): Point3D {
    return [
        getX(a) - getX(b),
        getY(a) - getY(b),
        getZ(a) - getZ(b)
    ]
}

export function isEqual(a: Point3D, b: Point3D) {
    return getX(a) === getX(b) && getY(a) === getY(b) && getZ(a) === getZ(b);
}

export function positionId (c: Point3D) {
    return c.join(".");
}
