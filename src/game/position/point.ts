export interface Point3D {
    x: number; // Left right
    y: number; // backwards forwards
    z: number; // up
}

export function createPoint(x?: number, y?: number, z?: number): Point3D {
    return { x: !!x ? x : 0, y: !!y ? y : 0, z: !!z ? z : 0 };
}
