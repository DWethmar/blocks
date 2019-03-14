import {Position} from "./position";
import {BLOCK_SIZE} from "../config";
import {Point3D} from "./point";


export class BlockIndex {

    get x() {
        return Math.floor(this.position.x / BLOCK_SIZE);
    }

    get y() {
        return Math.floor(this.position.y / BLOCK_SIZE);
    }

    get z() {
        return Math.floor(this.position.z / BLOCK_SIZE);
    }

    get point(): Point3D {
        return [this.x, this.y, this.z];
    }

    constructor(private position: Position) { }
}
