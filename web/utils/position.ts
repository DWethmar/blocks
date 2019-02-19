import {Vector3D} from "../types";

export const isWithin = (target: Vector3D, start: Vector3D, end: Vector3D) =>
    target.every(
        (axis: number, index: number) => axis > start[index] && axis < end[index]
    );

export const addPos = (a: Vector3D, b: Vector3D): Vector3D => [
    getX(a) + getX(b),
    getY(a) + getY(b),
    getZ(a) + getZ(b)
];

export const minusPos = (a: Vector3D, b: Vector3D): Vector3D => [
    getX(a) - getX(b),
    getY(a) - getY(b),
    getZ(a) - getZ(b)
];

export const isEqual = (a: Vector3D, b: Vector3D) =>
    getX(a) === getX(b) && getY(a) === getY(b) && getZ(a) === getZ(b);

export const getX = (a: Vector3D): number => a[0];
export const getY = (a: Vector3D): number => a[1];
export const getZ = (a: Vector3D): number => a[2];

// export const addX = (add, t: Vector3D) => [ t[0] + add, t[1], t[2] ];
// export const addY = (add, t: Vector3D) => [ t[0], t[1] + add, t[2] ];
// export const addZ = (add, t: Vector3D) => [ t[0], t[1], t[2] + add ];
