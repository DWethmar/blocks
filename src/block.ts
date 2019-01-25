import {BLOCK_SIZE, CHUNK_SIZE} from "./config";
import {Vector3D} from "./types";
import {chunkDivider} from "./chunk";
import {GameObject} from "./game-object";

export enum BlockType {
  AIR = "air",
  ROCK = "rock",
  GRASS = "grass",
  VOID = "void"
}

export class Block extends GameObject {
  get worldPosition(): Vector3D {
    return <Vector3D>(
      chunkDivider(BLOCK_SIZE)(this.position).map(a => Math.floor(a))
    );
  }

  get drawX(): number {
    return this.x;
  }
  get drawY(): number {
    return this.y - this.z + BLOCK_SIZE * CHUNK_SIZE;
  }

  transparent = false;

  constructor(readonly type: BlockType, public position: Vector3D) {
    super(position);
    this.transparent = this.type === BlockType.AIR;
  }

  update(delta: number) {}
}
