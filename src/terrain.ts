import * as PIXI from "pixi.js";
import {Chunk, chunkDivider} from "./chunk";
import {Vector3D} from "./types";
import {Block, BlockType} from "./block";
import {multiply} from "./utils/calc";
import {BLOCK_SIZE, CHUNK_SIZE} from "./config";
import {addPos, getX, getY, getZ, isEqual} from "./utils/position";
import {getBlockId, getChunkId} from "./utils/id";

export class Terrain {

    /**
     * Collection of chunkId -> chunk
     */
    public readonly chunks: Map<string, Chunk> = new Map<string, Chunk>();

    /**
     * Active chunks
     */
    public activeChunkIds: string[] = [];

    constructor(
        readonly stage: PIXI.Container,
    ) {
    }

    /**
     * @param blockIndex The world position of the block.
     * @param type
     */
    addBlock(blockIndex: Vector3D, type: BlockType) {
        const blockPosition = <Vector3D>multiply(BLOCK_SIZE, blockIndex);
        const chunkIndex = <Vector3D>(
            chunkDivider(CHUNK_SIZE * BLOCK_SIZE)(blockPosition)
        );

        const chunk = this.hasChunk(chunkIndex)
            ? this.getChunk(chunkIndex)
            : this.createChunk(chunkIndex);

        chunk.createBlock(blockPosition, type);

        // Check if block is on a edge of the chunk.
        if ([
            getX(blockIndex) % (CHUNK_SIZE * BLOCK_SIZE) === 0
            || getY(blockIndex) % (CHUNK_SIZE * BLOCK_SIZE) === 0
            || getZ(blockIndex) % (CHUNK_SIZE * BLOCK_SIZE) === 0
        ]) {
            // console.log('Update surrounding chunks', blockPosition);
            this.triggerSurroundingChunk(chunkIndex, blockIndex);
        }

        return null;
    }

    getBlock(worldPosition: Vector3D): Block | null {
        const blockPosition = <Vector3D>multiply(BLOCK_SIZE, worldPosition);
        const chunkIndex = <Vector3D>(
            chunkDivider(CHUNK_SIZE * BLOCK_SIZE)(blockPosition)
        );
        const chunk = this.getChunk(chunkIndex);
        if (chunk) {
            return chunk.blocks.has(getBlockId(worldPosition))
                ? chunk.blocks.get(getBlockId(worldPosition))
                : new Block(BlockType.AIR, worldPosition);
        }
        return null;
    }

    deleteBlocks(startIndex: Vector3D, endIndex: Vector3D) {
        let startX = getX(startIndex);
        let startY = getY(startIndex);
        let startZ = getZ(startIndex);

        const endX = getX(endIndex);
        const endY = getY(endIndex);
        const endZ = getZ(endIndex);

        while (!isEqual([startX, startY, startZ], [endX, endY, endZ])) {
            if (startX != endX) {
                startX > endX ? startX-- : startX++;
            } else {
                if (startY != endY) {
                    startY > endY ? startY-- : startY++;
                } else {
                    if (startZ != endZ) {
                        endZ ? startZ-- : startZ++;
                    }
                }
            }
            this.deleteBlock([startX, startY, startZ]);
        }
    }

    deleteBlock(index: Vector3D): Block {
        const blockPosition = <Vector3D>multiply(BLOCK_SIZE, index);
        const chunkIndex = <Vector3D>(
            chunkDivider(CHUNK_SIZE * BLOCK_SIZE)(blockPosition)
        );
        if (this.hasChunk(chunkIndex)) {
            return this.getChunk(chunkIndex).deleteBlock(index);
        }
        return null;
    }

    hasChunk(chunkIndex: Vector3D): boolean {
        return this.chunks.has(getChunkId(chunkIndex));
    }

    getChunk(chunkPosition: Vector3D): Chunk | null {
        return this.hasChunk(chunkPosition)
            ? <Chunk>this.chunks.get(getChunkId(chunkPosition))
            : null;
    }

    createChunk(index: Vector3D): Chunk {
        const chunkPosition = <Vector3D>multiply(CHUNK_SIZE * BLOCK_SIZE, index);

        const chunk = new Chunk(this.stage, this, chunkPosition);

        this.chunks.set(getChunkId(chunk.chunkIndex.point), chunk);
        this.activeChunkIds.push(getChunkId(chunk.chunkIndex.point));

        console.log(
            `Created Chunk with id: ${getChunkId(
                chunk.chunkIndex.point
            )} for position: ${chunk.chunkIndex.point}`
        );

        return chunk;
    }

    triggerSurroundingChunk(chunkIndex: Vector3D, blockIndex: Vector3D) {
        // update chunks around it
        [
            addPos(chunkIndex, [1, 0, 0]), // right
            addPos(chunkIndex, [-1, 0, 0]), // left
            addPos(chunkIndex, [0, -1, 0]), // back
            addPos(chunkIndex, [0, 1, 0]), // front
        ].forEach(index => {
            this.hasChunk(index) ? this.getChunk(index).hasChanged = true : null;
        });
    }
}

export const createChunkSelector = (terrain: Terrain) => (
    chunkPosition: Vector3D
) => (terrain.hasChunk(chunkPosition) ? terrain.getChunk(chunkPosition) : null);