import { Point3D, createPoint } from '../position/point';

export function divideBy(divisor: number, point: Point3D): Point3D {
    return createPoint(point.x / divisor, point.y / divisor, point.z / divisor);
}

export function add(addition: number, point: Point3D): Point3D {
    return createPoint(point.x + addition, point.y + addition, point.z + addition);
}

export function multiply(multiplication: number, point: Point3D): Point3D {
    return createPoint(point.x * multiplication, point.y * multiplication, point.z * multiplication);
}
