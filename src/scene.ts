import * as PIXI from 'pixi.js';

import {Chunk, chunkDivider} from './chunk';
import {BLOCK_SIZE, CHUNK_SIZE} from './config';
import {Vector3D} from './types';
import {BlockType} from "./block";
import {positionId} from './utils/position';
import {attachContainer, createContainer} from './utils/container';
import {sortZYX} from './utils/sort';
import {multiply} from "./utils/calc";

export class Scene {

    public readonly chunks: Map<string, Chunk> = new Map<string, Chunk>();
    public activeChunks: string[] = [];
    public updated = false;

    constructor(
        readonly stage: PIXI.Container
    ) { }

    addBlock(index: Vector3D, type: BlockType) {
        const blockPosition = <Vector3D>multiply(BLOCK_SIZE, index);

        const chunkIndex = <Vector3D>chunkDivider(CHUNK_SIZE * BLOCK_SIZE)(blockPosition);

        const chunk = (
            this.hasChunk(chunkIndex) ?
                this.getChunk(chunkIndex) :
                this.createChunk(chunkIndex)
        );

        console.log('Adding block to chunk', chunk.chunkPosition, chunkIndex);

        return chunk.createBlock(blockPosition, type);
    }

    hasChunk(chunkPosition: Vector3D): boolean {
        return this.chunks.has(positionId(chunkPosition));
    }

    getChunk(index: Vector3D): Chunk | null {
        return this.hasChunk(index) ? this.chunks.get(positionId(index)) : null;
    }

    createChunk(index: Vector3D): Chunk {
        this.updated = true;
        const position = <Vector3D>multiply(CHUNK_SIZE * BLOCK_SIZE, index);

        const container = createContainer(position);
        container.name = positionId(index);

        const chunk = new Chunk(
            container,
            createChunkSelector(this),
            position
        );

        attachContainer(this.stage)(container);

        this.chunks.set(positionId(chunk.chunkPosition), chunk);
        this.activeChunks.push(positionId(chunk.chunkPosition));

        console.log(`Created Chunk: ${ positionId(chunk.chunkPosition) } `, chunk.chunkPosition);

        return chunk;
    }

    update() {
        if (this.updated) {
            this.activeChunks.sort(((idA, idB) => {
                return sortZYX(this.chunks.get(idA).position, this.chunks.get(idB).position);
            }));

            this.stage.children.sort((a, b) => this.activeChunks.indexOf(a.name) - this.activeChunks.indexOf(b.name));
            this.updated = false;
        }

        this.activeChunks
            .map(id => this.chunks.get(id))
            .forEach((chunk: Chunk) => void chunk.update());
    }
}

export const createChunkSelector = (scene: Scene) => (chunkPosition: Vector3D) => scene.hasChunk(chunkPosition) ? scene.getChunk(chunkPosition) : null;
