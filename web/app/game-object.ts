import {Vector3D} from "./types";
import {BlockIndex, ChunkIndex, Position} from "./position";

export abstract class GameObject extends Position {

    blockIndex: BlockIndex = null;
    chunkIndex: ChunkIndex = null;

    constructor(
        readonly id: string,
        public vector3d: Vector3D
    ) {
        super(vector3d);
        this.blockIndex = new BlockIndex(this);
        this.chunkIndex = new ChunkIndex(this);
    }

    abstract update(delta): void;
}
