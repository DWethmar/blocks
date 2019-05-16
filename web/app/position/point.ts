export interface Point3D {
    x: number;
    y: number;
    z: number;
}

export function getStartPoint(): Point3D {
    return { x: 0, y: 0, z: 0 };
}

export function createPoint(x?: number, y?: number, z?: number): Point3D {
    return { x: x || 0, y: y || 0, z: z || 0 };
}
