import { Point3D, createPoint } from '../position/point';

export type collection3d<T> = T[][][];

export function createCollection3D<T>(size: number): collection3d<T> {
    return Array(size)
        .fill(null)
        .map(
            (): T[][] =>
                Array(size)
                    .fill(null)
                    .map((): T[] => Array(size).fill(null)),
        );
}

export function getPointInCollection3D<T>(
    point: Point3D,
    collection: collection3d<T>,
): T {
    if (
        collection[point.x] &&
        collection[point.x][point.y] &&
        collection[point.x][point.y][point.z]
    ) {
        return collection[point.x][point.y][point.z];
    }
    return null;
}

export function setPointInCollection3D<T>(
    point: Point3D,
    collection: collection3d<T>,
    value: T,
): boolean {
    collection[point.x][point.y][point.z] = value;
    return true;
}

export function* createCollection3DIterator<T>(collection: collection3d<T>) {
    for (let x = 0; x < collection.length; x++) {
        for (let y = 0; y < collection[0].length; y++) {
            for (let z = 0; z < collection[0][0].length; z++) {
                const block = getPointInCollection3D(
                    createPoint(x, y, z),
                    collection,
                );
                if (block) {
                    yield block;
                }
            }
        }
    }
}
