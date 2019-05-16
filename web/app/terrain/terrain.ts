import * as PIXI from 'pixi.js';

import { Scene } from '../scene/scene';
import { Point3D } from '../position/point';
import { Block, createBlock } from '../block/block';
import { BLOCK_SIZE, CHUNK_SIZE } from '../config';
import { multiply } from '../calc/calc';
import { Chunk, chunkDivider, createChunk, setBlock, getBlock } from '../chunk/chunk';
import { BlockType } from '../block/block-type';
import { getChunkId } from '../chunk/chunk-utils';
import { addPos, positionToChunkIndex } from '../position/point-utils';

export class Terrain {
    private readonly stage: PIXI.Container;
    private readonly scene: Scene;

    public constructor(stage: PIXI.Container, scene: Scene) {
        this.stage = stage;
        this.scene = scene;
    }

    /**
     * @param blockIndex The world position of the block.
     * @param type
     */
    public addBlock(blockIndex: Point3D, type: BlockType): void {
        const blockPosition = multiply(BLOCK_SIZE, blockIndex);
        const block = createBlock('', blockPosition, type);

        const p = positionToChunkIndex(blockPosition);
        let chunk = this.getChunk(positionToChunkIndex(p));
        if (!chunk) {
            chunk = this.createChunk(p);
        }
        chunk.blocks = setBlock(block, chunk.blocks);
    }

    public getBlock(worldPosition: Point3D): Block {
        const blockPosition = multiply(BLOCK_SIZE, worldPosition);
        const chunkIndex = chunkDivider(CHUNK_SIZE * BLOCK_SIZE)(blockPosition);
        const chunk = this.getChunk(chunkIndex);
        if (chunk) {
            return chunk.isEmpty(worldPosition)
                ? chunk.getBlock(worldPosition)
                : new Block({ id: '', type: BlockType.AIR, position: worldPosition });
        }
        return null;
    }

    public hasBlock(blockIndex: Point3D): boolean {
        const chunkIndex = multiply(CHUNK_SIZE * BLOCK_SIZE, blockIndex);
        const chunk = this.getChunk(chunkIndex);
        if (chunk) {
            return !!getBlock(blockIndex, chunk.blocks);
        }
        return null;
    }

    public hasChunk(chunkIndex: Point3D): boolean {
        return this.scene.gameObjects.hasGameObject(getChunkId(chunkIndex));
    }

    public removeBlock(blockIndex: Point3D): void {
        let chunk = this.getChunk(blockIndex);
        if (chunk) {
            // chunk.removeBlock(blockIndex);
        }
    }

    public getChunk(chunkPosition: Point3D): Chunk | null {
        const chunkId = getChunkId(chunkPosition);
        if (this.scene.gameObjects.hasGameObject(chunkId)) {
            return this.scene.gameObjects.getGameObject(chunkId) as Chunk;
        }
        return null;
    }

    public createChunk(index: Point3D): Chunk {
        const chunkPosition = multiply(CHUNK_SIZE * BLOCK_SIZE, index);

        const chunk = createChunk(getChunkId(index), chunkPosition);

        this.scene.gameObjects.setGameObject(chunk);
        this.scene.gameObjects.activateGameObject(chunk.id);

        console.log(
            `Created Chunk with id: ${getChunkId(chunk.chunkIndex.point)} for position: ${chunk.chunkIndex.point}`,
        );

        return chunk;
    }

    public raycast(start: Point3D, direction: Point3D): Block | null {
        const block = this.getBlock(start);

        if (block) {
            if (block.type !== BlockType.AIR) {
                return block;
            }
        } else {
            return null;
        }

        return this.raycast(addPos(start, direction), direction);
    }

    public update(delta: number): void {
        // @TODO
    }
}
