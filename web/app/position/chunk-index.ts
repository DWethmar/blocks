import { BLOCK_SIZE, CHUNK_SIZE } from '../config';
import { getChunkId } from '../chunk/chunk-utils';
import { Point3D, createPoint } from './point';

export class ChunkIndex {
    public get x(): number {
        return Math.floor(this.position.x / (BLOCK_SIZE * CHUNK_SIZE));
    }

    public get y(): number {
        return Math.floor(this.position.y / (BLOCK_SIZE * CHUNK_SIZE));
    }

    public get z(): number {
        return Math.floor(this.position.z / (BLOCK_SIZE * CHUNK_SIZE));
    }

    public get point(): Point3D {
        return createPoint(this.x, this.y, this.z);
    }

    public get chunkId(): string {
        return getChunkId({ x: this.x, y: this.y, z: this.z });
    }

    private position: Point3D;

    public constructor(position: Point3D) {
        this.position = position;
    }
}
