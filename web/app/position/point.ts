export interface Point3D {
    x: number;
    y: number;
    z: number;
}

export function createPoint(x?: number, y?: number, z?: number): Point3D {
    return { x: !!x ? x : 0, y: !!y ? y : 0, z: !!z ? z : 0 };
}
