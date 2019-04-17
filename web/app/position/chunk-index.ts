import { BLOCK_SIZE, CHUNK_SIZE } from '../config';
import { getChunkId } from '../chunk/chunk-utils';
import { Point3D, createPoint } from './point';

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

	get point() {
		return createPoint(this.x, this.y, this.z);
	}

	get chunkId() {
		return getChunkId({ x: this.x, y: this.y, z: this.z });
	}

	constructor(private position: Point3D) {}
}
