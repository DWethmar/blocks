import {Vector3D} from "./types";
import {BlockIndex, ChunkIndex, Position} from "./position";

export abstract class GameObject {

    position: Position = null;
    blockIndex: BlockIndex = null;
    chunkIndex: ChunkIndex = null;

    get x() {
        return this.position.x;
    }

    get y() {
        return this.position.y;
    }

    get z() {
        return this.position.z;
    }

    constructor(
        public vector3d: Vector3D,
    ) {
        this.position   = new Position(vector3d);
        this.blockIndex = new BlockIndex(this.position);
        this.chunkIndex = new ChunkIndex(this.position);
    }

    abstract update(delta): void;
}
