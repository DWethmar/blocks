import {Position} from "./position";
import {BLOCK_SIZE, CHUNK_SIZE} from "../config";
import {Point3D} from "./point";
import {getChunkId} from "../chunk/chunk-utils";

export class ChunkIndex {

    get x() {
        return Math.floor(this.position.x / (BLOCK_SIZE * CHUNK_SIZE));
    }

    get y() {
        return Math.floor(this.position.y / (BLOCK_SIZE * CHUNK_SIZE));
    }

    get z() {
        return Math.floor(this.position.z / (BLOCK_SIZE * CHUNK_SIZE));
    }

    get point(): Point3D {
        return [this.x, this.y, this.z];
    }

    get chunkId() {
        return getChunkId(this.point)
    }

    constructor(private position: Position) { }

}
