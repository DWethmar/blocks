import {Point3D} from "../types";

export const isWithin = (target: Point3D, start: Point3D, end: Point3D) =>
    target.every(
        (axis: number, index: number) => axis > start[index] && axis < end[index]
    );

export const addPos = (a: Point3D, b: Point3D): Point3D => [
    getX(a) + getX(b),
    getY(a) + getY(b),
    getZ(a) + getZ(b)
];

export const minusPos = (a: Point3D, b: Point3D): Point3D => [
    getX(a) - getX(b),
    getY(a) - getY(b),
    getZ(a) - getZ(b)
];

export const isEqual = (a: Point3D, b: Point3D) =>
    getX(a) === getX(b) && getY(a) === getY(b) && getZ(a) === getZ(b);

export const getX = (a: Point3D): number => a[0];
export const getY = (a: Point3D): number => a[1];
export const getZ = (a: Point3D): number => a[2];

// export const addX = (add, t: Point3D) => [ t[0] + add, t[1], t[2] ];
// export const addY = (add, t: Point3D) => [ t[0], t[1] + add, t[2] ];
// export const addZ = (add, t: Point3D) => [ t[0], t[1], t[2] + add ];
