import { BLOCK_SIZE } from '../config';
import { Point3D, createPoint } from './point';

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

	get point() {
		return createPoint(this.x, this.y, this.z);
	}

	constructor(private position: Point3D) {}
}
