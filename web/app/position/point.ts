export interface Point3D {
    x: number;
    y: number;
    z: number;
}

export function createPoint(x?: number, y?: number, z?: number): Point3D {
    return { x: x || 0, y: y || 0, z: z || 0 };
}
