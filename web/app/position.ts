import {Point3D} from "./types";
import {getX, getY, getZ} from "./utils/position";
import {BLOCK_SIZE, CHUNK_SIZE} from "./config";
import {getChunkId} from "./utils/id";

export class Position {

    get x() {
        return getX(this.vector3D);
    }

    set x(value: number) {
        this.vector3D[0] = value;
    }

    get y() {
        return getY(this.vector3D);
    }

    set y(value: number) {
        this.vector3D[1] = value;
    }

    get z() {
        return getZ(this.vector3D);
    }

    set z(value: number) {
        this.vector3D[2] = value;
    }

    constructor(public vector3D: Point3D) { }
}

export class BlockIndex {

    get x() {
        return Math.floor(getX(this.position.vector3D) / BLOCK_SIZE);
    }

    get y() {
        return Math.floor(getY(this.position.vector3D) / BLOCK_SIZE);
    }

    get z() {
        return Math.floor(getZ(this.position.vector3D) / BLOCK_SIZE);
    }

    get point(): Point3D {
        return [this.x, this.y, this.z];
    }

    constructor(private position: Position) { }
}

export class ChunkIndex {

    get x() {
        return Math.floor(getX(this.position.vector3D) / (BLOCK_SIZE * CHUNK_SIZE));
    }

    get y() {
        return Math.floor(getY(this.position.vector3D) / (BLOCK_SIZE * CHUNK_SIZE));
    }

    get z() {
        return Math.floor(getZ(this.position.vector3D) / (BLOCK_SIZE * CHUNK_SIZE));
    }

    get point(): Point3D {
        return [this.x, this.y, this.z];
    }

    get chunkId() {
        return getChunkId(this.point)
    }

    constructor(private position: Position) { }

}
