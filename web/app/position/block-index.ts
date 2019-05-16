import { BLOCK_SIZE } from '../config';
import { Point3D, createPoint } from './point';

export class BlockIndex {
    public get x(): number {
        return Math.floor(this.position.x / BLOCK_SIZE);
    }

    public get y(): number {
        return Math.floor(this.position.y / BLOCK_SIZE);
    }

    public get z(): number {
        return Math.floor(this.position.z / BLOCK_SIZE);
    }

    public get point(): Point3D {
        return createPoint(this.x, this.y, this.z);
    }

    private position: Point3D;

    public constructor(position: Point3D) {
        this.position = position;
    }
}
