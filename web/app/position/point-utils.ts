import { Point3D, createPoint } from './point';
import { Point } from 'pixi.js';

export const getX = (a: Point3D): number => a.x;
export const getY = (a: Point3D): number => a.y;
export const getZ = (a: Point3D): number => a.z;

export function isWithin(target: Point3D, start: Point3D, end: Point3D): boolean {
    return [
        target.x > start.x && target.x < end.x,
        target.y > start.y && target.y < end.y,
        target.z > start.z && target.z < end.z,
    ].every((x): boolean => !!x);
}

export function addPos(a: Point3D, b: Point3D): Point3D {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z,
    };
}

export function minusPos(a: Point3D, b: Point3D): Point3D {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z,
    };
}

export function floorPos(point: Point3D): Point3D {
    return createPoint(Math.floor(point.x), Math.floor(point.y), Math.floor(point.z));
}

export function isEqual(a: Point3D, b: Point3D): boolean {
    return getX(a) === getX(b) && getY(a) === getY(b) && getZ(a) === getZ(b);
}

export function positionId(c: Point3D): string {
    return `${c.x}.${c.y}.${c.z}`;
}

// https://www.geeksforgeeks.org/bresenhams-algorithm-for-3-d-line-drawing/
export function bresenham3D(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): Point3D[] {
    const listOfPoints: Point3D[] = [];
    listOfPoints.push({ x: x1, y: y1, z: z1 });
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    let dz = Math.abs(z2 - z1);

    let xs = 0; // init
    let ys = 0; // init
    let zs = 0; // init

    if (x2 > x1) {
        xs = 1;
    } else {
        xs = -1;
    }

    if (y2 > y1) {
        ys = 1;
    } else {
        ys = -1;
    }

    if (z2 > z1) {
        zs = 1;
    } else {
        zs = -1;
    }

    let p1 = 0;
    let p2 = 0;

    // Driving axis is X - axis
    if (dx >= dy && dx >= dz) {
        p1 = 2 * dy - dx;
        p2 = 2 * dz - dx;
        while (x1 != x2) {
            x1 += xs;
            if (p1 >= 0) {
                y1 += ys;
                p1 -= 2 * dx;
            }
            if (p2 >= 0) {
                z1 += zs;
                p2 -= 2 * dx;
            }
            p1 += 2 * dy;
            p2 += 2 * dz;
            listOfPoints.push({ x: x1, y: y1, z: z1 });
        }
    } else {
        // Driving axis is Y-axis
        if (dy >= dx && dy >= dz) {
            p1 = 2 * dx - dy;
            p2 = 2 * dz - dy;
            while (y1 != y2) {
                y1 += ys;
                if (p1 >= 0) {
                    x1 += xs;
                    p1 -= 2 * dy;
                }
                if (p2 >= 0) {
                    z1 += zs;
                    p2 -= 2 * dy;
                }
                p1 += 2 * dx;
                p2 += 2 * dz;
                listOfPoints.push({ x: x1, y: y1, z: z1 });
            }
        } else {
            // # Driving axis is Z-axis
            p1 = 2 * dy - dz;
            p2 = 2 * dx - dz;
            while (z1 != z2) {
                z1 += zs;
                if (p1 >= 0) {
                    y1 += ys;
                    p1 -= 2 * dz;
                }
                if (p2 >= 0) {
                    x1 += xs;
                    p2 -= 2 * dz;
                }
                p1 += 2 * dy;
                p2 += 2 * dx;
                listOfPoints.push({ x: x1, y: y1, z: z1 });
            }
        }
    }
    return listOfPoints;
}
