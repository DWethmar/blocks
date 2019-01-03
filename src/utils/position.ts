import {Vector3D} from "../types";


export const positionId = (c: Vector3D) => c.join('.');

export const isWithin = (target: Vector3D, start: Vector3D, end: Vector3D) =>
    target.every((axis: number, index: number) => (axis > start[index]) && (axis < end[index]));

export const addPos = (a: Vector3D, b: Vector3D): Vector3D  => [
    getX(a) + getX(b),
    getY(a) + getY(b),
    getZ(a) + getZ(b)
];

export const minusPos = (a: Vector3D, b: Vector3D): Vector3D  => [
    getX(a) - getX(b),
    getY(a) - getY(b),
    getZ(a) - getZ(b)
];

export const isEqual = (a: Vector3D, b: Vector3D) => getX(a) === getX(b) && getY(a) === getY(b) && getZ(a) === getZ(b);

export function *getPointsBetween(a: Vector3D, b: Vector3D): Iterator<Vector3D> {

    let c: Vector3D = <Vector3D>[ ...a ];

    while (!isEqual(c, b)) {

        const x = getX(c) === getX(b) ? getX(c) : (getX(c) > getX(b) ? getX(c) - 1 : getX(b) + 1);
        const y = getY(c) === getY(b) ? getY(c) : (getY(c) > getY(b) ? getY(c) - 1 : getY(b) + 1);
        const z = getZ(c) === getZ(b) ? getZ(c) : (getZ(c) > getZ(b) ? getZ(c) - 1 : getZ(b) + 1);

        c = [ x, y, z];

        yield c;
    }

    console.log('points', a, b, c);
}

export const getX = (a: Vector3D): number => a[0];
export const getY = (a: Vector3D): number => a[1];
export const getZ = (a: Vector3D): number => a[2];

// export const addX = (add, t: Vector3D) => [ t[0] + add, t[1], t[2] ];
// export const addY = (add, t: Vector3D) => [ t[0], t[1] + add, t[2] ];
// export const addZ = (add, t: Vector3D) => [ t[0], t[1], t[2] + add ];